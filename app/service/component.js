const co = require('co')
const OSS = require('ali-oss')
const request = require('request')
var JSZip = require("jszip")

function setConstVar (str, {
  publicpath, namespace, name, version
}) {
  str = str.replace(/__OSS_BUCKET__/g, publicpath)
  str = str.replace(/__NAMESPACE__/g, namespace)
  str = str.replace(/__NAME__/g, name)
  str = str.replace(/__VERSION__/g, version)
  return str
}

function normalizeName (name = '') {
  return String(name).replace(/[-_\s]+(\w)/g, (m, p) => p.toUpperCase())
}

async function genManifest (pkgfile, uid) {
  const pkg = JSON.parse(await pkgfile.async('text'))
  const ns = normalizeName(pkg.author || (uid + 10000).toString(16))
  return {
    namespace: ns,
    name: normalizeName(pkg.name),
    type: +pkg.type || 0,
    description: pkg.description,
    version: pkg.version,
    visibilitylevel: Number(!pkg.private),
    tags: (pkg.tags || []).filter(t => !isNaN(t)).map(t => ({id: t}))
  }
}

module.exports = app => {
  const ossClient = new OSS({
    region: app.config.oss.region,
    accessKeyId: app.config.oss.accessKeyId,
    accessKeySecret: app.config.oss.accessKeySecret,
    bucket: app.config.oss.bucket,
  })
  const OSS_HOST = app.config.oss.host

  async function downloadZip (id, token) {
    const downloadApi = app.config.zipDownloadApi
    const options = {
      'method': 'POST',
      'url': downloadApi,
      'headers': {
        'clikey': token,
        'Content-Type': 'application/json'
      },
      encoding: null,
      body: JSON.stringify({id: String(id)})
    }
    return await new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if(error ||  response.statusCode !== 200) reject(error || new Error('资源下载错误'))
        resolve(body)
      })
    })
  }

  async function ossUpload (files = [], manifest) {
    const DIR = process.env.EGG_SERVER_ENV !== 'production' ? 'components-test' : 'components'
    let mainFile
    for (let file of files) {
      const name = file.name
      const filepath = `${manifest.namespace}/${manifest.name}/${manifest.version}/${name.replace(/^dist[\/]/, '')}`
      let data
      if (/(index|editor)\.js$/.test(name)) {
        data = await file.async('text')
        data = setConstVar(data, { namespace: manifest.namespace, publicpath: `${OSS_HOST}/${DIR}/`, name: manifest.name, version: manifest.version })
      } else {
        data = await file.async('nodebuffer')
      }
      const res = await upload(filepath, data)
      console.log(`${res.name} 上传成功: ${res.path}`)
      if (/index\.js$/.test(name)) mainFile = res.path
    }
    return mainFile
  
    async function upload (filepath, data) {
      if (typeof data === 'string') data = Buffer.from(data)
      let result = await co(function * () {
        return yield ossClient.put(`${DIR}/${filepath}`, data)
      })
      return {
        name: result && result.name,
        path: result && result.url.replace(/^http(?!s)/, 'https')
      }
    }
  }

  class Component extends app.Service {
    * info (obj) {
      var item = yield this.ctx.model.Component.findOne({
        where: {
          id: obj.id,
          userId: obj.uid,
          isnew: 1
        }
      })
      if (!item || !item.dataValues) return item
      console.log(item)
      let tags = yield this.ctx.model.query(`select 
        t.id,
        t.name 
        from tb_res_tags_rel rel
        left join tb_tags t on t.id=rel.tid 
        where rel.rid =:id and cid=3
        `, {
        type: 'SELECT', replacements: obj
      })
      item.dataValues.tags = tags
      return item
    }

    * list (query) {
      var where = {}
      if (query.like) {
        if (query.name) {
          where[ '$and' ] = {
            '$or': [ {
              name: {
                $like: `%${query.name}%`
              }
            }, {
              desc: {
                $like: `%${query.name}%`
              }
            } ]
          }
        }
        where.isnew = 1
        if (query.type !== undefined && query.type !== null) where.type = query.type
        if (query.onlyMine) {
          where.userId = +query.uid
        } else {
          where[ '$or' ] = [ {
            userId: query.uid
          }, {
            visibilitylevel: 1
          } ]
        }
      } else {
        query.name && (where.name = query.name)
        query.version && (where.version = query.version)
      }
      if (query.status != 'all') {
        where.status = 1
      }
      this.ctx.model.Component.hasOne(this.ctx.model.ComponentUse, {
        foreignKey: 'cid'
      })
      
      if (query.tags && query.tags.length) {
        let tagrefs = yield this.ctx.model.ResTagsRel.findAll({
          where: {
            tid: {'$or': query.tags.map(t => t.id || t)}
          }
        })
        let cid = Array.from(new Set((tagrefs || []).map(t => t.rid)))
        if (!cid || !cid.length) return {list: []}
        where.id = {'$or': cid}
      }
      
      var list = yield this.ctx.model.Component.findAll({
        where: where,
        include: [ {
            required: false,
            model: this.ctx.model.ComponentUse
        } ],
        order: [
          [ this.ctx.model.ComponentUse, 'usenumber', 'DESC' ]
        ],
        limit: query.limit || 100
      })
      return {
        list
      }
    }

    * updata (query) {
      console.log(query)
      let t = yield app.model.transaction();
      try {
        var _item = query

        yield this.ctx.model.Component.update({
          desc: query.desc,
          visibilitylevel: query.visibilitylevel,
        }, {
          where: {
            name: query.name,
            userId: query.userId
          }
        }, {
          transaction: t
        })
        // 移除标签和资源的关系
        yield this.ctx.model.query(` DELETE FROM tb_res_tags_rel WHERE rid=:id and cid=3; `, {
          type: 'BULKDELETE',
          transaction: t,
          replacements: query
        });
        query.tags = query.tags || []
        for (let tag of query.tags) {
          yield this.ctx.service.tags.useone({
            id: tag.id
          })
          // 绑定标签和资源的关系
          yield this.ctx.model.ResTagsRel.create({
            rid: query.id,
            tid: tag.id,
            cid: 3
          }, {
            transaction: t
          })
        }
        yield t.commit();
        return {
          id: query.id
        }
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({
          msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`,
          error: e
        });
      }
    }

    * save (query) {
      let t = yield app.model.transaction();
      try {
        var _item = query
        // 如果没有用户信息，资源设为公共资源
        if (!query.userId) {
          _item.visibilitylevel = 1
        }
        _item.status = 1
        _item.isnew = 1

        // 查找最新的元素
        var currComponent = yield this.ctx.model.Component.findOne({
          where: {
            isnew: 1,
            name: query.name
          }
        })

        yield this.ctx.model.Component.update({
          isnew: 0
        }, {
          where: {
            isnew: 1,
            name: query.name
          }
        }, {
          transaction: t
        })
        var newItem = yield this.ctx.model.Component.create(_item, {
          transaction: t
        })
        query.id = newItem.id
        if (currComponent) {
          var componentUse = yield this.ctx.model.ComponentUse.findOne({
            where: {
              cid: currComponent.id
            }
          }, {
            transaction: t
          })
          // 使用量记录，如果有记录则加一，没有的话。初始化创建一个
          if (componentUse) {
            yield this.ctx.model.ComponentUse.update({
              cid: newItem.id
            }, {
              where: {
                cid: currComponent.id
              }
            }, {
              transaction: t
            })
          } else {
            yield this.ctx.model.ComponentUse.create({
              cid: newItem.id,
              useNumber: currComponent.useNumber
            }, {
              transaction: t
            })
          }
          // 更新tag标签
          // 移除标签和资源的关系
          var _query = {
            id: newItem.id,
            rid: currComponent.id
          }
          yield this.ctx.model.query(`update tb_res_tags_rel set rid=:id WHERE rid=:rid and cid=3; `, {
            transaction: t, replacements: _query
          });
        } else {
          // 首次添加时，生成标签
          query.tags = query.tags || []
          for (let tag of query.tags) {
            yield this.ctx.service.tags.useone({
              id: tag.id
            })
            // 绑定标签和资源的关系
            yield this.ctx.model.ResTagsRel.create({
              rid: query.id,
              tid: tag.id,
              cid: 3
            }, {
              transaction: t
            })
          }
        }

        yield t.commit();
        return {
          id: query.id
        }
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({
          msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`,
          error: e
        });
      }
    }

    * useone (query) {
      let t = yield app.model.transaction();
      try {
        var component = yield this.ctx.model.Component.findOne({
          where: {
            id: query.id,
            status: 1
          }
        }, {
          transaction: t
        })
        if (component) {
          var useNum = component.useNumber + 1
          yield this.ctx.model.Component.update({
            useNumber: useNum
          }, {
            where: {
              id: query.id
            }
          }, {
            transaction: t
          })
          var componentUse = yield this.ctx.model.ComponentUse.findOne({
            where: {
              cid: component.id
            }
          }, {
            transaction: t
          })
          // 使用量记录，如果有记录则加一，没有的话。初始化创建一个
          if (componentUse) {
            yield this.ctx.model.ComponentUse.update({
              useNumber: componentUse.useNumber + 1
            }, {
              where: {
                cid: componentUse.cid
              }
            }, {
              transaction: t
            })
          } else {
            yield this.ctx.model.ComponentUse.create({
              cid: component.id,
              useNumber: 1
            }, {
              transaction: t
            })
          }
        } else {
          throw this.ctx.getError({
            msg: '不纯在该组件'
          });
        }
        yield t.commit();
        return {
          id: query.id
        }
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({
          msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`,
          error: e
        });
      }
    }

    * delete (obj) {
      var item = yield this.ctx.model.Component.findOne({
        where: {
          id: obj.id,
          userId: obj.uid
        }
      })
      if (item) {
        yield this.ctx.model.Component.update({
          status: obj.status || 0
        }, {
          where: {
            id: obj.id,
            userId: obj.uid
          }
        });
        return true
      } else {
        throw this.ctx.getError({
          msg: `该资源不可删除或者不是你上传的资源`
        });
      }
    }

    async import ({id, token}, userId) {
      const valid = this.ctx.helper.tools.ossConfigValid(app.config.oss)
      if (!valid) throw this.ctx.getError({ msg: '您未正确配置 oss 服务的相关字段，无法使用对象存储服务' })
      const that = this
      const zipBuffer = await downloadZip(id, token).catch(e => (console.error(e), null))
      if (!zipBuffer) return
      const zip = await JSZip.loadAsync(zipBuffer)
      const manifest = await genManifest(zip.files['package.json'], userId)
      const exists = await co(function * () {
        return yield that.list({
          name: `${manifest.namespace}/${manifest.name}`,
          version: manifest.version,
          uid: userId,
          like: false
        })
      })
      if (exists && exists.list && exists.list.length > 0) {
        throw this.ctx.getError({
          msg: '组件库已存在相同名称和版本的组件，终止导入',
        })
      }
      const files = Object.keys(zip.files).filter(k => k !== 'package.json' && k !== 'install.js').map(k => zip.files[k])
      const mainFile = await ossUpload(files, manifest)
      const res = await co(function * () {
        return yield that.save({
          userId: userId,
          name: `${manifest.namespace}/${manifest.name}`,
          version: manifest.version,
          desc: manifest.description,
          type: manifest.type,
          tags: manifest.tags,
          path: mainFile.replace(/^http:/, 'https:'),
          visibilitylevel: manifest.visibilitylevel
        })
      })
      return res
    }

  }

  return Component
}
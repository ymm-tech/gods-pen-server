/**
 * Created with WebStorm.
 * User: kevan
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 上午9:30
 * To change this template use File | Settings | File Templates.
 */
var md5 = require('md5')
'use strict'
module.exports = app => {
  class Pages extends app.Service {

    * save (query) {
      try {
        var _item = {
          name: query.name,
          projectId: query.projectId,
          draft: query.content || '',
          desc: query.desc,
          image: query.image,
          key: query.key,
          type: query.type || 0,
          fork: query.fork,
          visibilitylevel: query.visibilitylevel || 0  // 默认公共页面
        }
        if (query.id) {
          // 编辑
          // 参数验证，1判断是否存在该id，2是否重名
          var pageInfo = yield this.ctx.model.Pages.findOne({
            where: {
              status: 1,
              id: query.id
            }
          })
          var keyPage = yield this.ctx.model.Pages.findOne({
            where: {
              key: _item.key,
              status: { $ne: 0 }
            }
          })
          if (keyPage && keyPage.id != query.id) {
            throw this.ctx.getError({ msg: `新输入的页面的key：${query.key}已经存在，重新输入` })
          }
          if (pageInfo) {
            yield this.ctx.model.Pages.update(_item, { where: { id: query.id } })
          } else {
            throw this.ctx.getError({ msg: `不存在id为${query.id}的页面信息` })
          }
        } else {
          // 新建页面 fork使用数为0
          _item.fork = 0
          // 页面不存在。生成页面信息
          _item.status = 1
          // 生成唯一的页面 key
          _item.key = this.ctx.helper.tools.md5(_item.projectId + '_' + _item.name + (new Date().getTime()))
          // 截取10位，然后随机做大小写切换
          _item.key = _item.key.substring(0, 10).replace(/./gi, function (a) {
            if (parseInt(Math.random() * 10) % 3 == 0) {
              return a.toUpperCase()
            } else {
              return a.toLowerCase()
            }
          })
          // 参数验证 是否重名
          let oldPage = yield this.ctx.model.Pages.findOne({
            where: {
              projectId: query.projectId,
              key: _item.key,
              status: { $ne: 0 }
            }
          })
          if (oldPage) throw this.ctx.getError({ msg: `已经存在key为:${_item.key}的页面信息，重新提交` })
          if (query.publishNow) {
            _item.content = _item.draft
            _item.draft = ''
          }
          var newItem = yield this.ctx.model.Pages.create(_item)
          query.id = newItem.id
        }
        // 移除标签和资源的关系
        yield this.ctx.model.query(` DELETE FROM tb_res_tags_rel WHERE rid=:id and cid=1; `, {
          type: 'BULKDELETE', replacements: query
        });
        // 对标签关系进行添加
        query.tags = query.tags || []
        for (let tag of query.tags) {
          yield this.ctx.service.tags.useone({
            id: tag.id
          })
          // 绑定标签和资源的关系
          yield this.ctx.model.ResTagsRel.create({
            rid: query.id,
            tid: tag.id,
            cid: 1
          })
        }
        return { id: query.id }
      } catch (e) {
        console.log(e)
        throw this.ctx.getError({ msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`, error: e })
      }
    }

    * list (query) {
      console.log('service start --list', query, query.status == undefined)
      if (!query.projectId) return []
      // 检查用户与项目的权限
      const role = yield this.ctx.service.base.getUserRole(query.uid, query.projectId);
      if (role == 100) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      let projectIds = (query.projectId instanceof Array ? query.projectId : [query.projectId]).filter(id => id && id > 0)
      if (!projectIds.length) return []
      let _where = {
        projectId: {
          '$or': projectIds
        },
        status: (query.status == undefined) ? { $ne: 0 } : query.status
      }
      let list = yield this.ctx.model.Pages.findAll({
        where: _where,
        order: 'create_time DESC'
      })
      if (list && list.length) {
        list = list.map(item => {
          var it = item.dataValues || {}
          if (it.id) {
            try {
              let content = it.draft || it.content
              it.psdList = JSON.parse(content).psdList || []
            } catch (error) {
              it.psdList = []
            }
            it.isPublish = !it.draft
            delete it.content
            delete it.draft
          }
          return it
        })
      }
      return list
    }

    * publiclist (query) {
      console.log('service start --list', query, query.status == undefined)
      var sqlQuery = ''
      if (query.name) {
        query.name = `%${query.name}%`
        sqlQuery += ` and pages.name like :name`;
      }
      if (query.tags && query.tags.length != 0) {
        sqlQuery += ` and t.id in (${query.tags.map(val => val.id).join(',')})`
        // query.tagsStr = query.tags.map(val => val.id).join(',')
        // sqlQuery += ` and t.id in (:tagsStr)`
      }
     
      let list = yield this.ctx.model.query(`SELECT 
        distinct pages.id, 
        pages.key,
        pages.name, 
        pages.fork, 
        pages.image, 
        pages.desc, 
        pages.draft,
        pages.type, 
        pages.project_id AS projectId, 
        pages.status, 
        pages.visibilitylevel, 
        pages.update_time AS updateTime, 
        pages.create_time AS createTime
        FROM tb_pages AS pages 
        left join tb_res_tags_rel rel on pages.id=rel.rid 
        left join tb_tags t on rel.tid=t.id 
        WHERE ${!query.featured ? '' : 'pages.featured = 1 AND'} pages.visibilitylevel = 1 AND pages.status = 1 ${sqlQuery}
        `,{type:'SELECT', replacements: query})
      // if (list && list.length) {
      //   list = list.map(item => {
      //     var it = item.dataValues || {}
      //     if (it.id) {
      //       it.isPublish = !it.draft
      //       delete it.draft
      //     }
      //     return it
      //   })
      // }
      // console.log(list)
      return list || []
    }

    /**
     * 查询页面内容
     * 1:公共页面直接提供查询
     * 2：非公共页面只有当改页面所在的项目属于该用户才可见，否则提示权限不够
     * @param query
     * @return {*}
     */
    * info (query) {
      let page = yield this.ctx.model.Pages.findOne({
        where: {
          id: query.id
        }
      })
      // 查询当前用户的角色
      if (page) {
        const role = yield this.ctx.service.base.getUserRole(query.uid, page.projectId)
        page.dataValues.role = role
        // 查询标签
        let tags = yield this.ctx.model.query(`select 
          t.id,
          t.name 
          from tb_res_tags_rel rel
          left join tb_tags t on t.id=rel.tid 
          where rel.rid =:id and cid=1
      `, {
          type: 'SELECT', replacements: query
        })
        page.dataValues.tags = tags
      }

      return page
    }

    * detail (query) {
      let info = (yield this.ctx.model.Pages.findOne({
        where: {
          key: query.pageKey,
          status: { $ne: 0 }
        }
      })) || {}
      info = info.dataValues || {}
      if (info.id) {
        if (['edit', 'preview', 'copy'].includes(query.scene)) {
          info.content = info.draft || info.content
        }
        info.isPublish = !info.draft
        delete info.draft
      }
      // 如果有历史记录id 则查询历史记录并设置到content里面
      if (query.historyid) {
        let history = yield this.ctx.model.PagesHistory.findOne({
          where: {
            id: query.historyid
          }
        })
        if (history) {
          info.content = history.content
          info.historyId = query.historyid
        }
      }
      return info
    }

    * setHomePage (query) {
      try {
        // 设置当前项为"首页"
        yield this.ctx.model.Pages.update({ isHomePage: 1 }, { where: { id: query.id } })

        var pageInfo = yield this.ctx.model.Pages.findOne({
          where: {
            id: query.id
          }
        })
        // 将其他页面的isHomePage 设置为0
        yield this.ctx.model.Pages.update({ isHomePage: 0 }, {
          where: {
            projectId: pageInfo.projectId,
            id: { $ne: query.id }
          }
        })
        return null
      } catch (e) {
        throw this.ctx.getError({ msg: e.msg || `操作失败`, error: e })
      }
    }

    * changeStatus (query) {
      try {
        // 参数验证，1判断是否存在该id，2是否重名
        if (!(yield this.ctx.model.Pages.findOne({
            where: {
              id: query.id
            }
          }))) throw this.ctx.getError({ msg: `不存在id为${query.id}的页面` })
        yield this.ctx.model.Pages.update({ status: query.status }, { where: { id: query.id } })
        return null
      } catch (e) {
        throw this.ctx.getError({ msg: e.msg || `操作失败`, error: e })
      }
    }

    * delete (query) {
      var item = yield this.ctx.model.Pages.findOne({ where: { id: query.id } })
      if (item) {
        // 检查用户与项目的权限
        const role = yield this.ctx.service.base.getUserRole(query.uid, item.projectId);
        if (role > 2) {
          throw this.ctx.getError({ msg: '您缺少“管理员”或更高权限，无法删除，请联系该页面管理人员' });
        }
        yield this.ctx.model.Pages.update({ status: 0 }, { where: { id: query.id } })
        return true
      }
    }

    * publish (query) {
      // 插入发布
      yield this.ctx.model.Pages.update({ content: query.content, draft: '' }, { where: { id: query.id } })
      // 插入历史记录
      yield this.ctx.model.PagesHistory.create({
        content: query.content,
        userId: query.uid,
        pageId: query.id
      })
      return true
    }

    * count () {
      return yield this.ctx.model.Pages.count({ where: { key: { $ne: null } } })
    }

    * history (query) {
      let _where = {
        pageId: query.pageId,
        status: (query.status == undefined) ? 1 : query.status
      }
      let list = yield this.ctx.model.query(`select 
      ph.id,
      ph.content,
      ph.page_id as pageId,
      ph.create_time as createTime,
      u.id as userId,
      u.name as userName,
      u.photo as userPhoto 
      from tb_pages_history ph 
      left join tb_user u on u.id=ph.user_id
      where page_id=:pageId and status=:status order by createTime desc `, { type: 'SELECT', replacements: _where });
      return list
    }

    * getNameBykeys ({ ids }) {
      if (!ids || !ids.length) return []
      let ctx = this.ctx
      let where = {
        $or: ids.map(id => ({ key: id }))
      }
      let names = yield ctx.model.Pages.findAll({ where, attributes: [ 'name', 'key', 'id', 'desc' ] })
      return names
    }

    * deleteHistory (query) {
      var item = yield this.ctx.model.PagesHistory.findOne({ where: { id: query.id } })
      console.log(item)
      if (item) {
        yield item.destroy();
        return true
      }
    }

    * historyPublish (query) {
      // 插入发布
      yield this.ctx.model.Pages.update({ content: query.content, draft: query.content }, { where: { id: query.id } })
      // 插入历史记录
      // yield this.ctx.model.PagesHistory.create({
      //   content: query.content,
      //   userId: query.uid,
      //   pageId: query.id
      // })
      return true
    }

    * historyToDraft (query) {
      yield this.ctx.model.Pages.update({ draft: query.content }, { where: { id: query.id } })
      return true
    }

    * updateFork (query) {
      yield this.ctx.model.Pages.findOne({where: {
        id: query.id
      }}).then(function(page) {
        return page.increment([ 'fork' ], {by: 1, silent: true})
      })
      return true
    }

    async featuringPages ({ monthBefore = 3}) {
      const date = (() => {
        const ts = new Date(Date.now() - monthBefore * 86400000 * 30)
        return `${ts.getFullYear()}-${ts.getMonth() + 1}-${ts.getDate()}`
      })()
      const list = await this.ctx.model.Pages.findAll({ 
        attributes: ['id', 'key', 'name', 'image', 'desc', 'fork', 'featured'],
        limit: 50,
        // order: ['updateTime', 'DESC'],
        where: {
          updateTime: {
            '$gte': date
          },
          visibilitylevel: 1,
          featured: 0,
          status: 1,
        }
      })
      .then((pages = []) => pages.map(v => v.dataValues))
      return list
    }

    async updateFeatured ({ value = 2, id, uid, key = '' }) {
      const role = await this.ctx.service.user.getUserRole({ uid })
      if (role !== 1) throw this.ctx.getError({msg: '用户无权限'})
      if (!/^\w{3,}$/.test(key) && !/^\d+$/.test(id)) throw this.ctx.getError({msg: '未提供参数 id 或者 key'})
      await this.ctx.model.Pages.update({ featured: value }, {
        where: /^\w{3,}$/.test(key) ? { key } : { id }
      })
      return true
    }
    
  }
  return Pages
}

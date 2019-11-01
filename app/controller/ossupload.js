const OSS = require('ali-oss')
const co = require('co')
const sendToWormhole = require('stream-wormhole');
const mime = require('mime');

module.exports = app => {
  let ossClient = new OSS({
    region: app.config.oss.region,
    accessKeyId: app.config.oss.accessKeyId,
    accessKeySecret: app.config.oss.accessKeySecret,
    bucket: app.config.oss.bucket,
  })

  class OssUploadController extends app.Controller {
    async uploadByUrls () {
      const { ctx } = this
      const rule = {
        urls: {
          type: 'array',
          itemType: 'string',
          rule: {
            format: /^https?:\/\/.+$/
          },
          required: true
        }
      }
      ctx.validate(rule)
      let {urls} = ctx.request.body
      let transHeaders = ctx.request.headers
      let status = {}
      await Promise.all(
        urls.map(url => {
          return co(function * () {
            let assetStream
            try {
              assetStream = yield ctx.curl(url, {
                method: 'get',
                headers: Object.assign({
                  'user-agent': transHeaders['user-agent'],
                  'accept-encoding': transHeaders['accept-encoding'],
                  'accept': transHeaders['accept'],
                }),
                timeout: 50000,
                streaming: true
              })
            } catch (e) {
              console.log(e)
            }
            let fileName = url.replace(/\?.+$/, '').split('/').slice(-1)[0]
            if (!assetStream) {
              status[fileName] = 0
              return
            }
            try {
              let result = yield ossClient.putStream(fileName, assetStream.res)
              console.log(result)
              status[fileName] = 1
            } catch (e) {
              console.log(e)
              status[fileName] = 0
            }
          })
        })
      ).catch(e => {
        console.log(e)
      })
      ctx.body = status
    }
    /**
     * f = new FormData()
     * f.append('files', File)
     * f.append('files', File) // 支持多个文件
     * f.append('base64', 'data:image/png;base64,xxxxxx')
     * f.append('base64', 'data:image/png;base64,xxxxxx') // 支持多个base64
     * 
     */
    async uploadFile () {
      const { ctx } = this
      const parts  = await ctx.multipart()
      let part
      let files = []
      while ((part = await parts()) != null) {
        let valid, ext, filedata, result = {}
        switch (part.length && part.length > 0 ? part[0] : part.fieldname) {
          case 'files':
            if (valid = part.filename) {
              filedata = part
              ext = mime.getExtension(part.mime)
            }
            break
          case 'base64':
            if (valid = part[1].match(/^data:(.+);base64,(.+)$/)) {
              ext = mime.getExtension(valid[1])
              filedata = Buffer.from(valid[2], 'base64')
            }
            break
        }
        if (valid) {
          try {
            result = await upload(filedata,
              [Date.now(), (Math.random() + 1) * 1000000000 | 0].map(v => v.toString(16)).join('') + (ext ? `.${ext}` : ''))
          } catch (e) {
            console.log(e)
            await sendToWormhole(part)
          }
          files.push({
            originName: part.filename || '',
            mime: part.mime || '',
            name: result.name,
            path: result.path,
          })
        }
      }
      ctx.body = files
      async function upload (filedata, fileName) {
        let result
        await co(function * () {
          result = yield ossClient.put(fileName, filedata)
        })
        return {
          name: result && result.name,
          path: result && result.url.replace(/^http(?!s)/, 'https')
        }
      }
    }
  }
  
  return OssUploadController
}

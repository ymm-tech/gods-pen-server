const fs = require('fs')
const Controller = require('egg').Controller
const ua = require('random-ua')
const mime = require('mime')
const sendToWormhole = require('stream-wormhole')
const util = require('util')
const request = util.promisify(require('request'))

class ProxyController extends Controller {
  async imgCorsProxy () {
    const { ctx } = this
    const url = ctx.query['url']
    const responseType = ctx.query['responseType']
    if (!ctx.helper.tools.isSafeUrl(url)) {
      ctx.body = 'hello world'
      return
    }
    let useStream = responseType == 'blob'
    const result = await ctx.curl(url, {
      method: 'GET',
      streaming: useStream
    })
    const contentType = result.res.headers['content-type']
    const isImage = /^image\//.test(contentType)
    if (!isImage) {
      if (useStream) sendToWormhole(result.res)
      ctx.body = `"${url}" is not a image resource`
      return
    }
    if (useStream) {
      ctx.type = contentType
      ctx.body = result.res
    } else {
      ctx.body = `data:${contentType};base64,${Buffer.from(
        result.res.data,
        'binary'
      ).toString('base64')}`
    }
    ctx.set('cache-control', 'max-age=31536000')
  }

  async transparentProxy () {
    const { ctx } = this
    const rule = {
      url: {
        type: 'string',
        required: true
      },
      headers: {
        type: 'object',
      },
      method: {
        type: 'string'
      },
      body: {
        type: 'object',
      }
    }
    ctx.validate(rule)
    let {url, headers, method, body} = ctx.request.body
    let transHeaders = ctx.request.headers
    const result = await ctx.curl(url, {
      method: (method || 'get').toUpperCase(),
      data: body,
      headers: Object.assign({
        'user-agent': transHeaders['user-agent'],
        'accept-encoding': transHeaders['accept-encoding'],
        'accept': transHeaders['accept'],
        'referer': transHeaders['referer'],
      }, headers),
      timeout: 5000,
      streaming: true
    })
    Object.entries(result.res.headers).map(([key, val]) => {
      if (key == 'access-control-allow-origin' || key == 'content-security-policy') return
      ctx.set(key, val)
    })
    ctx.body = result.res
  }

  async word2html () {
    const { ctx } = this
    const part = ctx.request.files && ctx.request.files[0] || {}
    if (part.fieldname !== 'file' || !['docx', 'doc'].includes(mime.getExtension(part.mime))) {
      ctx.cleanupRequestFiles()
      throw this.ctx.getError({
        msg: '仅支持docx或者doc类型文件'
      })
    }

    const options = {
      'method': 'POST',
      'url': 'https://s6.aconvert.com/convert/convert-batch-win.php',
      'headers': {
        'Origin': 'https://www.aconvert.com',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': ua.generate(),
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*',
        'Referer': 'https://www.aconvert.com/cn/document/doc-to-html/',
        'Connection': 'keep-alive',
        'DNT': '1'
      },
      formData: {
        'file': fs.createReadStream(part.filepath),
        'targetformat': 'html',
        'code': '86000',
        'filelocation': 'local'
      }
    }
    const result = await request(options)
      .then(({body}) => JSON.parse(body))
      .catch(e => console.error(e))
    
    if (!result || !result.filename) {
      ctx.cleanupRequestFiles()
      throw this.ctx.getError({
        msg: '文档解析失败'
      })
    }
    ctx.cleanupRequestFiles()
    
    const html = await ctx.curl(`https://s6.aconvert.com/convert/p3r68-cdx67/${result.filename}`, {dataType: 'text'})
      .then(v => v.data)
      .catch(e => {
        console.error(e)
        return ''
      })

    ctx.body = {
      html
    }
  }
}

module.exports = ProxyController
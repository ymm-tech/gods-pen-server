const Controller = require('egg').Controller
const urlParser = require('url')

class ProxyController extends Controller {
  async imgCorsProxy () {
    const { ctx } = this
    const url = ctx.query['url']
    const responseType = ctx.query['responseType']
    if (!url || typeof url !== 'string') {
      ctx.body = 'No url specified'
      return
    }
    if (!urlParser.parse(url).host) {
      ctx.body = `Invalid url specified: ${url}`
      return
    }
    let useStream = responseType == 'blob'
    const result = await ctx.curl(url, {
      method: 'GET',
      streaming: useStream
    })
    if (useStream) {
      ctx.type = result.res.headers['content-type']
      ctx.body = result.res
    } else {
      ctx.body = `data:${result.res.headers['content-type']};base64,${Buffer.from(
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
}

module.exports = ProxyController
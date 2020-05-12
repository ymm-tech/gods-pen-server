const appConfig = require('./config.app')

module.exports = appInfo => {
  let config = {}
  config.appConfig = appConfig
  config.proxy = true
  config.keys = appInfo.name + '_1493285411479_6518' // Cookie 秘钥
  config.bodyParser = {
    jsonLimit: '100mb',
    formLimit: '100mb',
  }
  // mutipart formdata
  config.multipart = {
    fileModeMatch: /transform\/word2html$/,
    fieldSize: '10mb',
    fields: 20,
    fileSize: '10mb',
    files: 20,
    fileExtensions: [
      '.csv',
      '.txt',
      '.psd',
      '.doc',
      '.docx'
    ]
  }
  // 自定义 middleware
  config.middleware = ['responseHandler', 'loginHandler']
  config.responseHandler = {
    ignore(ctx) {
      const arr = [
        '/cors-proxy',
        '/proxy/*',
        '/statistics/report'
      ]
      return arr.some(v => {
        const reg = new RegExp(ctx.router.opts.prefix + v, 'i')
        return reg.test(ctx.path)
      })
    }
  }
  config.loginHandler = {
    ignore(ctx) {
      const arr = [
        '/editor/pages/pv',
        '/editor/pages/detail',
        '/editor/tags/list',
        '/kaptcha/init',
        '/users/login',
        '/users/register',
        '/users/sendEmail',
        '/users/newUpdatePassword',
        '/users/oauthCode',
        '/users/oauthLogin',
        '/proxy/*',
        '/cors-proxy',
        '/users/activeEmail',
        '/statistics/report',
        '/ossupload/uploadFile'
      ]
      return arr.some(v => {
        const reg = new RegExp(ctx.router.opts.prefix + v, 'i')
        return reg.test(ctx.path)
      })
    }
  }
  config.static = {
    prefix: '/public/'
  }
  config.security = {
    csrf: {
      enable: false
    },
    domainWhiteList: []
  }
  config.cors = {
    origin: (ctx) => {
      console.log(ctx)
      let transHeaders = ctx.request.headers
      return transHeaders['origin'] || '*'
    },
    credentials: true,
    allowHeaders: 'Range, authorization,Authorization, Content-Disposition, Content-Length, Content-MD5, Content-Type, X-Requested-With, X-File-Name,ysession,clikey',
    maxAge: 7200000
  }

  config.permissionLimit = {
    0: { // 普通页面
      save: 3,
      publish: 2
    },
    1: { // flutter
      save: 3,
      publish: 2
    }
  }

  config.zipDownloadApi = 'https://godspen.ymm56.com/shop/api/resources/down'

  config.VIEW_PATH = 'view'
  config.ADMIN_PATH = 'admin'
  config.EDITOR_PATH = 'editor'
  config.API_PATH = 'api'
  return config
}
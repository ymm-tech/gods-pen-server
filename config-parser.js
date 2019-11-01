const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const CLIENT_KEYS = ['VIEW_PATH','ADMIN_PATH','EDITOR_PATH','API_PATH','EDITOR_TITLE','ADMIN_TITLE', 'BAIDU_TONGJI', 'github']
const REQUIRED_KEYS = ['sequelize', 'oss', 'es', 'redis', 'mail']
const SEQUELIZE_REQUIRED = ['database', 'host', 'username', 'password']
const OSS_REQUIRED = ['accessKeyId', 'accessKeySecret', 'host', 'bucket']
const ES_REQUIRED = ['host']
const REDIS_REQUIRED = ['host', 'port']
const MAIL_REQUIRED = ['host', 'port', 'user', 'pass']
const CLIENT_CONFIG_DIR = process.env.CLIENT_CONFIG_DIR || './sub/gods-pen-admin/src/config,./sub/gods-pen/src/config'
const SERVER_CONFIG_DIR = process.env.SERVER_CONFIG_DIR || './config'

function parseConfig () {
  let config
  try {
    config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, './config.yaml'), 'utf8'))
  } catch (e) {
    console.error(e)
    process.exit()
  }
  return config
}

function validConfig (config) {
  if (!REQUIRED_KEYS.every(k => !!config[k])) {
    console.error('配置不全，请确保配置了所有必须字段:', REQUIRED_KEYS)
    process.exit()
  }
  for (let key of REQUIRED_KEYS) {
    let val = config[key]
    switch (key) {
      case 'sequelize':
        if (!SEQUELIZE_REQUIRED.every(k => !!val[k])) {
          console.error('sequelize 配置字段不全', SEQUELIZE_REQUIRED)
          process.exit()
        }
        val['port'] = val['port'] || '3306'
        val['dialect'] = val['dialect'] || 'mysql'
        break
      case 'oss':
        if (!OSS_REQUIRED.every(k => !!val[k])) {
          console.error('oss 配置字段不全', OSS_REQUIRED)
          process.exit()
        }
        val['region'] = val['region'] || val['host'].replace(/^(https?:)?\/\//, '').split('.').filter(v => v.indexOf('oss-') == 0)[0]
        if (!val['region']) {
          console.error('oss.region 解析失败')
          process.exit()
        }
        break
      case 'es':
        if (!ES_REQUIRED.every(k => !!val[k])) {
          console.error('es 配置字段不全', ES_REQUIRED)
          process.exit()
        }
        val['type'] = val['type'] || 'doc'
        val['index'] = val['index'] || 'godspen'
        break
      case 'redis':
        if (!REDIS_REQUIRED.every(k => !!(val[0] || val || {})[k])) {
          console.error('redis 配置字段不全', REDIS_REQUIRED)
          process.exit()
        }
        break
      case 'mail':
        if (!MAIL_REQUIRED.every(k => !!val[k])) {
          console.error('mail 配置字段不全', MAIL_REQUIRED)
          process.exit()
        }
        break
    }
  }
}

function rewriteConfig (config) {
  let clientConfig = CLIENT_KEYS.reduce((o, k) => {
    o[k] = config[k]
    return o
  }, {})
  let serverConfig = REQUIRED_KEYS.reduce((o, k) => {
    o[k] = config[k]
    return o
  }, Object.assign({}, clientConfig))
  ;CLIENT_CONFIG_DIR.split(',')
    .map(p => path.resolve(__dirname, p, 'docker.js'))
    .map(p => fs.writeFileSync(p, `module.exports = ${JSON.stringify(clientConfig, null, 2)}`, 'utf-8'))
  ;[SERVER_CONFIG_DIR].map(p => path.resolve(__dirname, p, 'config.docker.js'))
    .map(p => fs.writeFileSync(p, `module.exports = ${JSON.stringify(serverConfig, null, 2)}`, 'utf-8'))
}

;(function () {
  console.log('开始解析配置文件')
  let config = parseConfig()
  validConfig(config)
  rewriteConfig(config)
  console.log('配置文件解析分发完成')
})()

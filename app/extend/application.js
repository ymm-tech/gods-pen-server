const zlib = require('zlib')
const Redis = require('ioredis')
const REDIS = Symbol('REDIS#INSTANCE')
const request = require("request")
const throttle = require("lodash/throttle")
const nodemailer = require('nodemailer')
const nunjucks = require('nunjucks')

nunjucks.configure(__dirname + '/email/tpl', { autoescape: true })

function initMailSender (config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  })
}

function strZip (str) {
  str = typeof str === 'string' ? str : JSON.stringify(str)
  return new Promise((resolve, reject) => {
    zlib.gzip(str, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

function strUnzip (buf) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buf, (err, result) => {
      if (err) reject(err)
      else resolve(result.toString())
    })
  })
}

function initRedis (config, errorCallback) {
  var mode = config instanceof Array ? 'cluster' : 'single'
  var redis
  if (mode == 'cluster') {
    redis = new Redis.Cluster(config, {
      keyPrefix: 'godspen:',
    })
  } else {
    redis = new Redis(Object.assign({
      keyPrefix: 'godspen:',
    }, config))
  }
  redis.on('error', (err) => {
    console.error(err)
    typeof errorCallback === 'function' && errorCallback(err)
  })
  return redis
}

module.exports = {
  get redis () {
    if (!this[REDIS]) {
      this[REDIS] = initRedis(this.config.redis, throttle((err) => {
        this.DDNotify(`${err.name} \n\n ${err.message} \n\n ${err.stack} \n\n ${err.lastNodeError}`, 'redis 异常')
      }, 60000))
    }
    return this[REDIS]
  },
  async getCache (key) {
    if (!key) return
    let cache
    try {
      cache = await this.redis.getBuffer(key)
      if (!cache) return null
      cache = await strUnzip(cache)
    } catch (e) {
      console.error(e)
    }
    return cache
  },
  async setCache (key, val) {
    if (!key) return
    let flag
    try {
      val = await strZip(val)
      flag = await this.redis.set(key, val, 'EX', 86400)
    } catch (e) {
      console.error(e)
    }
    return flag === 'OK'
  },
  async delCache (key) {
    if (!key) return
    let flag
    try {
      flag = await this.redis.del(key)
    } catch (e) {
      console.error(e)
    }
    return Boolean(flag)
  },
  addPV (from) {
    let pvkey = `pv_from_${from}` // report or detail
    if (!this[pvkey] || typeof this[pvkey] !== 'number') this[pvkey] = 1
    else this[pvkey] += 1
  },
  getPV () {
    return {
      pv_from_report: this.pv_from_report,
      pv_from_detail: this.pv_from_detail,
    }
  },
  DDNotify (msg, title, at) {
    if (!this.config.dingding) return
    var options = {
      method: 'POST',
      url: 'https://oapi.dingtalk.com/robot/send',
      qs: { access_token: this.config.dingding},
      headers: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'msgtype': 'markdown',
        'markdown': {
          'title': title,
          'text': `${title} @${at || 'all'} \n${msg}`
        },
        'at': {
          'atMobiles': at ? [at] : [],
          'isAtAll': false
        }
      })
    }

    request(options, function (error, response, body) {
      if (error) console.error(error)
      console.log(body)
    })
  },
  /**
   * 发送邮件给指定用户
   * send({
   *  receivers: [ '258137678@qq.com' ],
   *  tplName: 'password',
   *  data: {
   *    name:'xingm',
   *    password:'密码',
   *  }
   *})
  * @param {array} receivers 接受邮件的邮箱地址，一个数组
  * @param {string} tplName 模板名称。见tpl文件夹下面的模板名称。不用写后缀.html
  * @param {object} data 模板数据
  * @param {string} subject 邮件主题，可不填写
  * @return {Promise} 返回一个promise
  */
  sendMail: function mailSend ({ receivers, tplName, data, subject }) {
    if (!mailSend.transporter) mailSend.transporter = initMailSender(this.config.mail || {})
    let mailOptions = {
      from: this.config.mail.user.indexOf('<') > -1 ? this.config.mail.user : `码良noreply <${this.config.mail.user}>`, // sender address
      to: receivers.join(','), // list of receivers
      subject: subject || '通知', // Subject line
      text: '',
      html: '' // html body
    }
    mailOptions.html = nunjucks.render(`${tplName}.html`, data)
    let promise = new Promise(function (resolve, reject) {
      mailSend.transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          reject(error)
        } else {
          resolve(info)
        }
      })
    })
    return promise
  }
}

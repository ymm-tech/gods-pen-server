/**
 *
 */
'use strict'
const crypto = require('crypto')
const CryptoJs = require('crypto-js')
const Mock = require('mockjs')
var TsdbClient = require('opentsdb-node-client')
const babel = require("babel-core")
const urlParser = require('url')

module.exports = {
  TSDB:(function(){
    return new TsdbClient({
      host: 'http://10.111.12.101',
      port: '30583'
    })
  })(),
  /**
   * 加密
   * @param {string} str 加密字符串
   * @param {string} key 加密秘钥
   * @return {*} 加密后的字符串
   */
  encrypt (str, key) {
    const cipher = crypto.createCipheriv('des-ecb', key, '')
    cipher.setAutoPadding(true)
    let ciph = cipher.update(str, 'utf8', 'base64')
    ciph += cipher.final('base64')
    return ciph
  },
  /**
   * dec解密
   * @param {string} str 加密字符串
   * @param {string} key 加密秘钥
   * @return {*} 解密后的字符串
   */
  decrypt (str, key) {
    str = decodeURIComponent(str)
    const decipher = crypto.createDecipheriv('des-ecb', key, '')
    decipher.setAutoPadding(true)
    let txt = decipher.update(str, 'base64', 'utf8')
    txt += decipher.final('utf8')
    return txt
  },
  /**
   * md5 加密
   * @param {string} str 加密字符串
   * @return {*} 加密后的字符串
   */
  md5 (str) {
    const hash = crypto.createHash('sha256')
    hash.update(str)
    return hash.digest('hex')
  },
  /**
   * 校验字符串货对象为空
   * @param {string} str 加密字符串
   * @return {boolean} 校验结果
   */
  isEmpty (str) {
    if (str === '' || str === null || str === undefined) {
      return true
    }
    return false
  },
  isEmptyObject (obj) {
    return typeof obj == 'object' && JSON.stringify(obj) === '{}'
  },
  /**
   * 修改版本号
   * @param {string} str 原版本号
   * @return {string} 新的版本号
   */
  getNewVersion (str) {
    if (str === '' || str === null || str === undefined) {
      return str
    }
    let version = str.replace(/\./g, '') - 0
    version = version + 1 + ''
    version = version.split('').join('.')
    return version
  },
  /**
   * 对给定的json数据拆解成为可以
   * @param {object} data 数据
   * @return {*} 返回mock数据
   */
  jsonToMock (data) {
    let info = {}
    let work = function (data, info) {
      for (let key in data) {
        let value = data[ key ]
        info[ value.name ] = value.mock
        // 数组处理
        if (value.type == 'object') {
          info[ value.name + value.mock ] = {}
          work(value.child, info[ value.name + value.mock ])
        } else if (value.type.indexOf('array') != -1) {
          info[ value.name ] = []
          let type = value.type.replace('array(', '').replace(')', '')
          let arrayLength = value.mock - 0
          for (let i = 0; i < arrayLength; i++) {
            if (type == 'object') {
              let data1 = {}
              info[ value.name ].push(data1)
              work(value.child, data1)
            } else if (type == 'array') {
              console.log('array no deal')
            } else if (type == 'number') {
              info[ value.name ].push(Mock.mock('@integer'))
            } else if (type == 'string') {
              info[ value.name ].push(Mock.mock('@string'))
            } else if (type == 'boolean') {
              info[ value.name ].push(Mock.mock('@boolean'))
            }
          }
        }
      }
    }
    work(data, info)
    return Mock.mock(info)
  },

  /**
   * 获取项目组权限
   * @param {number} role 权限key
   * @return {string} 权限值
   */
  getGroupRole (role) {
    let result = ''
    switch (role) {
      case 1:
        result = '创建者'
        break
      case 2:
        result = '管理者'
        break
      case 3:
        result = '组成员'
        break
      default:
        break
    }
    return result
  },
  getSSOInfo (session) {

    /**
     * RSA最大解密密文大小
     */
    let MAX_DECRYPT_BLOCK = 128

    /**
     * 公钥解密
     * @param date
     * @returns {string}
     */
    function publicDecrypt (date) {

      // 得到私钥
      let publicPem = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCClI7NJ+4YeSiVjp6cy5R6x9zGRSdrX06ZrEXy
kDvqBAus+luQvkfcpfU5mLgMeNEjyvTK5Om74fm0NDsoLZ6Y7xeDARgEFMoQ4h1M8cReDszFUUPV
uBAU3akQpGYd7wLMMY+ND7/Hn8GjDk5qyjwlBKUsG6/bJ4hlzej9xORE5wIDAQAB
-----END PUBLIC KEY-----`; // 替换你自己的路径

      let publicKey = publicPem.toString()
      // 经过base64编码的密文转成buf
      let buf = new Buffer(date, 'base64')

      // buf转byte数组
      // let inputLen = bytes(buf, "base64");
      let inputLen = buf.byteLength
      // 密文
      let bufs = []
      // 开始长度
      let offSet = 0
      // 结束长度
      let endOffSet = MAX_DECRYPT_BLOCK
      // 分段加密
      while (inputLen - offSet > 0) {
        if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
          let bufTmp = buf.slice(offSet, endOffSet)
          bufs.push(crypto.publicDecrypt({ key: publicKey, padding: crypto.RSA_PKCS1_PADDING }, bufTmp))
        } else {
          let bufTmp = buf.slice(offSet, inputLen)
          bufs.push(crypto.publicDecrypt({ key: publicKey, padding: crypto.RSA_PKCS1_PADDING }, bufTmp))
        }
        offSet += MAX_DECRYPT_BLOCK
        endOffSet += MAX_DECRYPT_BLOCK
      }
      let result = Buffer.concat(bufs).toString()
      console.log(result)
      return result
    }

    let tinfo = publicDecrypt(session) || ''
    tinfo = tinfo.split(',')
    if (tinfo.length == 3) {
      return {
        id: tinfo[ 0 ],
        session: tinfo[ 1 ],
        createTime: tinfo[ 2 ]
      }
    }
    return {}
  },
  getSSOHeader (appid, sec) {

    // 定义加/解密的 key(key都放这里了, 加密还有啥意义!^_^)
    const initKey = sec
    /**
     * 定义加密函数
     * @param {string} data - 需要加密的数据, 传过来前先进行 JSON.stringify(data)
     * @param {string} key - 加密使用的 key
     */
    const aesEncrypt = (data, key) => {
      /**
       * CipherOption, 加密的一些选项:
       *   mode: 加密模式, 可取值(CBC, CFB, CTR, CTRGladman, OFB, ECB), 都在 CryptoJS.mode 对象下
       *   padding: 填充方式, 可取值(Pkcs7, AnsiX923, Iso10126, Iso97971, ZeroPadding, NoPadding), 都在 CryptoJS.pad 对象下
       *   iv: 偏移量, mode === ECB 时, 不需要 iv
       * 返回的是一个加密对象
       */
      const cipher = CryptoJs.AES.encrypt(data, key, {
        mode: CryptoJs.mode.ECB,
        padding: CryptoJs.pad.Pkcs7,
        iv: ''
      })
      // 将加密后的数据转换成 Base64
      const base64Cipher = cipher.ciphertext.toString(CryptoJs.enc.Base64)
      // 处理 Android 某些低版的BUG
      return base64Cipher
    }
    // 获取填充后的key
    const key = CryptoJs.enc.Utf8.parse(initKey)
    // 定义需要加密的数据

    const data = `${new Date() - 0}#${ parseInt(Math.random() * 100000)}`
    console.log(data)
    // 调用加密函数
    const encrypted = aesEncrypt(data, key)
    return `${appid}@${encrypted}`
  },
  /**
   * 获取项目权限
   * @param {number} role 权限key
   * @return {string} 权限值
   */
  getProjectRole (role) {
    let result = ''
    switch (role) {
      case 1:
        result = '创建者'
        break
      case 2:
        result = '管理者'
        break
      case 3:
        result = '开发者'
        break
      case 4:
        result = '项目成员'
        break
      default:
        break
    }
    return result
  },
  /**
   * 获取项目权限
   * @param {String} tree 节点树 json
   * @return {string} child 子节点数组的key
   */
  nodeTreeScriptTransform (tree, child = 'child') {
    if (!tree) return ''
    let parsingtree
    try {
      parsingtree = JSON.parse(tree)
      parsingtree = scriptTransform(parsingtree)
      parsingtree = JSON.stringify(parsingtree)
    } catch (e) {
      parsingtree = tree
      console.error('节点树es6语法转换出错了', e)
    }
    return parsingtree
    
    function scriptTransform (node) {
      if (node.script) {
        var script = toString.call(node.script) == toString.call([]) ? node.script : [{content: node.script, name: '脚本'}]
        node.script = script.filter(s => s && s.content).map(s => {
          s.content = wrapper(s.content)
          return s
        }).map(s => {
          s.content = transform(s.content)
          return s
        }).map(s => {
          s.content = deWrapper(s.content)
          return s
        })
      }
      if (node[child] && node[child].length) {
        node[child] = node[child].map(scriptTransform)
      }
      return node
    }
    function transform (script) {
      return babel.transform(script, {
        minified: false,
        babelrc: false,
        presets: ['es2015', 'es2017', 'stage-0'],
      }).code
    }
    function wrapper (script) {
      return `function tmmmmmmmmmmmmmmmmp (vm){
        ${script}
      }`
    }
    function deWrapper (script) {
      script = script.replace(/^['"]use strict['"];((?:.|[\n\r])*)function\s*tmmmmmmmmmmmmmmmmp\s*\(vm\)\s*\{((?:.|[\n\r])*)\}$/m, '$1\n$2').replace(/[\r\n]+/g, '\n')
      return script
    }
  },
  /**
  **
  ** 时间格式化
  **/
  timeFormat (time, format = 'yyyy/mm/dd') {
    if (!time instanceof Date) return ''
    let o = {
      'y+': time.getFullYear(),                 // 年份
      'M+': time.getMonth() + 1,                 // 月份
      'd+': time.getDate(),                    // 日
      'h+': time.getHours(),                   // 小时
      'm+': time.getMinutes(),                 // 分
      's+': time.getSeconds(),                 // 秒
      'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
      'S': time.getMilliseconds()             // 毫秒
    }
    for (let key of Object.keys(o)) {
      format = format.replace(new RegExp(`(${key})`), (m, p) => {
        let val = `00${o[key]}`
        return val.slice(val.length - p.length)
      })
    }
    return format
  },
  ossConfigValid (config = {}) {
    const isInvalid = op => typeof op !== 'string' || op.trim() === '' || /<[^<>]+>/.test(op)
    return !(isInvalid(config.accessKeyId) || isInvalid(config.accessKeySecret) || isInvalid(config.host) || isInvalid(config.bucket) || isInvalid(config.region))
  },
  isSafeUrl (url) {
    if (!url || typeof url !== 'string') return false
    const urlInfo = urlParser.parse(url)
    const isSafeUrl = urlInfo && /^https?:$/.test(urlInfo.protocol) && !/^[\d.:]+$/.test(urlInfo.host) && urlInfo.hostname != 'localhost'
    return isSafeUrl
  },
}
class ERROR extends Error {
  constructor ({ code, status, msg, error }) {
    super(msg)
    this.code = code || 500
    this.status = status || 200
    this.msg = msg || '服务器异常,请稍后重试'
    this.error = error
  }

}
module.exports = {
  /**
   * 获取一个错误对象
   * @param {string} code code码
   * @param {string} status 状态值
   * @param {string} msg 错误消息
   * @return {ERROR} 错误对象
   */
  getError ({ code, status, msg, e }) {
    // this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
    console.log(e)
    return new ERROR({ code, status, msg, e })
  }
}

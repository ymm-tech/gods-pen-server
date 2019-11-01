const throttle = require("lodash/throttle")

module.exports = (options, app) => {
  var notify = throttle((err, {url, req}) => {
    try {
      req = JSON.stringify(req)
    } catch (e) {
      console.log(`try JSON.stringify ${req} error`, e)
    }
    app.DDNotify(`url: ${url} \n\n request: ${req} \n\n ${err.name} \n\n ${err.message} \n\n ${err.stack}`, '接口请求异常')
  }, 30000)
  
  return function* (next) {
    try {
      console.log('params:', this.href, this.request.body, this.query);
      yield next;
      const result = this.body;
      // 包装返回参数
      this.body = this.noWarp ? result : {
        code: 1,
        msg: 'success',
        data: result,
      }
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      console.error('RESPONSE:ERROR', err);
      this.status = err.status;
      this.body = {
        code: err.code || 500,
        msg: this.helper.tools.isEmpty(err.msg) ? err.message : err.msg,
      };
      // notify(err, {url: this.href, req: this.request && this.request.body})
    }
  };
};

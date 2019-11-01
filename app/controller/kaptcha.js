
module.exports = app => {
  class HomeController extends app.Controller {
    * init (ctx) {
      const info = {
        img: '',
      }
      info.key = (parseInt((Math.random() * 9000)) + 1000) + '';
      info.img = yield ctx.service.kaptcha.getCaptcha(info.key)
      ctx.session.kaptcha = info.key;
      this.ctx.body = {
        img: info.img
      };
    }
  }
  return HomeController;
};

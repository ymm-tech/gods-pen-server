'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    * index() {
      this.ctx.body = 'hi, egg';
      this.redirect(`http://cn.bing.com/search?q=1`);
    }
  }
  return HomeController;
};

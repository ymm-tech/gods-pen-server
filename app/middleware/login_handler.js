module.exports = () => {
  return function* (next) {
    // 校验登录信息
    const accessToken = this.helper.token.getToken.call(this);
    var clikey = this.headers['clikey']
    if(clikey){
      // 请求数据库校验用户uid
      const user = yield this.model.UserLogin.findOne({
        where: { security: clikey },
      });
      if (this.helper.tools.isEmpty(user)) throw this.getError({ status: 403, msg: '请求不合法' });
      this.request.uid = user.userId;
    } else {
      if (this.helper.tools.isEmpty(accessToken)) throw this.getError({ status: 401, msg: '您的登录已失效，请重新登录' })
      const tokenConfig = this.helper.token.decryptToken.call(this, accessToken);
      if (this.helper.tools.isEmpty(tokenConfig.token)
        || this.helper.tools.isEmpty(tokenConfig.date)
        || this.helper.tools.isEmpty(tokenConfig.uid)
        || this.helper.tools.isEmpty(tokenConfig.password)) throw this.getError({ status: 403, msg: '请求不合法' });
      // 校验过期时间
      if (new Date().getTime() - tokenConfig.date > this.app.config.appConfig.accessTokenKeyTime) {
        throw this.getError({ status: 401, msg: '您的登录已失效，请重新登录' });
      }
      // 请求数据库校验用户uid
      const user = yield this.model.UserLogin.findOne({
        where: { userId: tokenConfig.uid },
      });
      if (this.helper.tools.isEmpty(user) || user.password !== tokenConfig.password) throw this.getError({ status: 403, msg: '请求不合法' });
      this.request.uid = tokenConfig.uid;
    }
    yield next;
  };
};

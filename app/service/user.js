
module.exports = app => {

  function getAdminUrl (ctx, path) {
    if (/https?:\/\//.test(app.config.ADMIN_PATH)) return `${app.config.ADMIN_PATH.replace(/\/$/g, '')}/${path}`
    let protocol = 'http://'
    const domain = (({header, host}) => {
      let referer = header.referer
      if (/^https/.test(referer)) protocol = 'https://'
      let d = host
      try {
        d = referer.replace(/^(https?:)?\/\//, '').split('/')[0]
      } catch (e) {
        console.log(e)
      }
      return d
    })(ctx)
    return `${protocol}${domain}/${app.config.ADMIN_PATH.replace(/^\/|\/$/g, '')}/${path}`;
  }

  class User extends app.Service {
    * login (obj) {
      // 获取验证码比对
      if (this.ctx.session.kaptcha != obj.kaptcha) {
        throw this.ctx.getError({ msg: '验证码错误' })
      }
      const user = yield this.ctx.model.UserLogin.findOne({
        where: { email: obj.account },
      });
      if (user) {
        if (user.password === this.ctx.helper.tools.md5(obj.password)) {
          // 插入登录日志
          let userLoginLog = {};
          userLoginLog.userId = user.id;
          userLoginLog.ip = this.ctx.ip;
          userLoginLog = yield this.ctx.model.UserLoginLog.create(userLoginLog);
          // 修改登录时间及IP
          const userLogin = {};
          userLogin.lastIp = this.ctx.ip;
          userLogin.lastLogin = new Date();
          yield this.ctx.model.UserLogin.update(userLogin, { where: { userId: user.id } });
          this.ctx.helper.token.setToken.call(this, user.userId, user.password);
        } else {
          throw this.ctx.getError({ msg: '密码不正确' });
        }
      } else {
        throw this.ctx.getError({ msg: '不存在该用户' });
      }
    }

    * oauthLogin (obj) {
      const user = yield this.ctx.model.User.findOne({
        where: { oauth: obj.oauth }
      });
      if (user) {
        const loginInfo = yield this.ctx.model.UserLogin.findOne({
          where: { userId: user.id }
        })
        // 插入登录日志
        let userLoginLog = {};
        userLoginLog.userId = user.id;
        userLoginLog.ip = this.ctx.ip;
        userLoginLog = yield this.ctx.model.UserLoginLog.create(userLoginLog);
        // 修改登录时间及IP
        const userLogin = {};
        userLogin.lastIp = this.ctx.ip;
        userLogin.lastLogin = new Date();
        yield this.ctx.model.UserLogin.update(userLogin, { where: { userId: user.id } });
        this.ctx.helper.token.setToken.call(this, user.id, loginInfo.password || this.ctx.helper.tools.md5(user.oauth));
      } else {
        let t = yield app.model.transaction();
        let userInfo = {}
        try {
          // 插入用户表
          userInfo.oauth = obj.oauth
          userInfo.name = obj.name
          userInfo.email = obj.email
          userInfo.emailStatus = 2
          userInfo.projectCount = 0
          userInfo.telephone = obj.telephone || ''
          userInfo = yield this.ctx.model.User.create(userInfo, { transaction: t });
          if (userInfo.id > 0) {
            // UserLogin
            const userLogin = {};
            userLogin.userId = userInfo.id;
            userLogin.password = this.ctx.helper.tools.md5(userInfo.oauth);
            userLogin.status = 1;
            userLogin.lastIp = this.ctx.ip;
            userLogin.lastLogin = new Date();
            yield this.ctx.model.UserLogin.create(userLogin, { transaction: t });
            // UserGrade
            const userGrade = {};
            userGrade.userId = userInfo.id;
            userGrade.projectNum = app.config.appConfig.projectNumber;
            userGrade.groupNum = app.config.appConfig.groupNumber;
            userGrade.interfaceNum = app.config.appConfig.interfaceNumber;
            userGrade.favorateProjectNum = app.config.appConfig.favorateProjectNumber;
            yield this.ctx.model.UserGrade.create(userGrade, { transaction: t });
            // UserNoticeType
            const userNotcieType = {};
            userNotcieType.userId = userInfo.id;
            userNotcieType.type = 1;
            userNotcieType.messageNotice = 1;
            userNotcieType.emailNotice = 2;
            yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
            userNotcieType.type = 2;
            yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
            userNotcieType.type = 3;
            yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
            this.ctx.helper.token.setToken.call(this, userInfo.id, userLogin.password);
          }
          yield t.commit();
        } catch (e) {
          yield t.rollback();
          throw this.ctx.getError({ msg: '服务器异常,请稍后重试', e });
        }
      }
    }

    * register (obj) {
      const user = yield this.ctx.model.UserLogin.findOne({
        where: { email: obj.email },
      });
      if (user) {
        throw this.ctx.getError({ msg: '用户名已存在' });
      }
      // 保存用户账户
      let userInfo = {};
      // 事务中处理
      let t = yield app.model.transaction();
      try {
        userInfo.email = obj.email;
        userInfo.name = obj.name;
        userInfo.emailStatus = obj.emailStatus;
        userInfo.projectCount = 0;
        userInfo.telephone = obj.telephone || '';
        userInfo = yield this.ctx.model.User.create(userInfo, { transaction: t });
        if (userInfo.id > 0) {
          const userLogin = {};
          userLogin.userId = userInfo.id;
          userLogin.password = this.ctx.helper.tools.md5(obj.password);
          userLogin.email = obj.email;
          userLogin.status = 1;
          userLogin.lastIp = this.ctx.ip;
          userLogin.ssoUid = obj.ssoUid || 0;//映射SSO_UID
          userLogin.lastLogin = new Date();
          yield this.ctx.model.UserLogin.create(userLogin, { transaction: t });
          const userGrade = {};
          userGrade.userId = userInfo.id;
          userGrade.projectNum = app.config.appConfig.projectNumber;
          userGrade.groupNum = app.config.appConfig.groupNumber;
          userGrade.interfaceNum = app.config.appConfig.interfaceNumber;
          userGrade.favorateProjectNum = app.config.appConfig.favorateProjectNumber;
          yield this.ctx.model.UserGrade.create(userGrade, { transaction: t });
          const userNotcieType = {};
          userNotcieType.userId = userInfo.id;
          userNotcieType.type = 1;
          userNotcieType.messageNotice = 1;
          userNotcieType.emailNotice = 2;
          yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
          userNotcieType.type = 2;
          yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
          userNotcieType.type = 3;
          yield this.ctx.model.UserNoticeType.create(userNotcieType, { transaction: t });
          this.ctx.helper.token.setToken.call(this, userInfo.id, userLogin.password);
        }
        yield t.commit();
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({ msg: '服务器异常,请稍后重试', e });
      }

      if (obj.emailStatus == 1) {
        let code = this.ctx.helper.tools.md5(obj.email + new Date().getTime());
        code = code.substring(code.length - 10);
        const showCode = this.ctx.helper.tools.encrypt(obj.email + '||' + code, app.config.appConfig.desKey);
        const url = getAdminUrl(this.ctx, `emailActive.html?code=${encodeURIComponent(showCode)}`)
        this.app.sendMail({
          receivers: [ obj.email ],
          tplName: 'active',
          data: {
            name: obj.email,
            urlcontent: url,
            url
          },
          subject: '【码良】邮箱激活'
        }).then(() => {
          const validCode = {};
          validCode.userId = userInfo.id;
          validCode.code = code;
          validCode.email = obj.email;
          validCode.expireTime = new Date(new Date().getTime() + app.config.appConfig.emailActiveTime);
          this.ctx.model.ValidCode.create(validCode).then()
        });
      }
      return userInfo.id;
    }

    * activeEmail (obj) {
      const user = yield this.ctx.model.User.findOne({
        where: { email: obj.email },
      });
      if (user && user.emailStatus === 2) {
        return '您的账户已经成功激活，请勿重复激活';
      }
      const validCode = yield this.ctx.model.ValidCode.findOne({
        where: { code: obj.code },
      });
      if (!validCode) {
        return '激活码不合法';
      }
      if (validCode.expireTime.getTime() < new Date().getTime()) {
        return '激活码已过期，请登入账户重新激活';
      }
      // 修改邮箱激活状态
      const userUpadte = {};
      userUpadte.emailStatus = 2;
      yield this.ctx.model.User.update(userUpadte, { where: { id: validCode.userId } });
      return userUpadte.emailStatus
    }

    * sendActiveEmail (uid) {
      const user = yield this.ctx.model.User.findById(uid);
      if (!user) {
        throw this.ctx.getError({ msg: '账户不存在' });
      }
      if (user.emailStatus === 2) {
        throw this.ctx.getError({ msg: '邮箱已激活' });
      }
      // 发送激活邮件
      let code = this.ctx.helper.tools.md5(user.email + new Date().getTime());
      code = code.substring(code.length - 10);
      const showCode = this.ctx.helper.tools.encrypt(user.email + '||' + code, app.config.appConfig.desKey);
      const url = getAdminUrl(this.ctx, `emailActive.html?code=${encodeURIComponent(showCode)}`)
      this.app.sendMail({
        receivers: [ user.email ],
        tplName: 'active',
        data: {
          name: user.email,
          urlcontent: url,
          url
        },
        subject: '【码良】邮箱激活'
      }).then(() => {
        const validCode = {};
        validCode.userId = user.id;
        validCode.code = code;
        validCode.email = user.email;
        validCode.expireTime = new Date(new Date().getTime() + app.config.appConfig.emailActiveTime);
        this.ctx.model.ValidCode.create(validCode);
      });
    }

    // 忘记密码，发送邮件
    * sendEmail (email) {
      const user = yield this.ctx.model.User.findOne({
        where: {
          email: email
        }
      });
      if (!user) {
        throw this.ctx.getError({ msg: '账户不存在' });
      }
      // 发送激活邮件
      let code = this.ctx.helper.tools.md5(user.email + new Date().getTime());
      code = code.substring(code.length - 10);
      const showCode = this.ctx.helper.tools.encrypt(user.email + '||' + code, app.config.appConfig.desKey);
      const url = getAdminUrl(this.ctx, `updatePassword.html?code=${encodeURIComponent(showCode)}`)
      this.app.sendMail({
        receivers: [ user.email ],
        tplName: 'password',
        data: {
          name: user.email,
          urlcontent: url,
          url
        },
        subject: '【码良】密码重置'
      }).then(() => {
        const validCode = {};
        validCode.userId = user.id;
        validCode.code = code;
        validCode.email = user.email;
        validCode.expireTime = new Date(new Date().getTime() + app.config.appConfig.emailActiveTime);
        this.ctx.model.ValidCode.create(validCode).then()
      });
    }

    * info (uid) {
      const user = yield this.ctx.model.User.findById(uid);
      const userLogin = yield this.ctx.model.UserLogin.findOne({
        where: {
          userId: uid
        }
      });
      user.security = userLogin.security
      if (!user) {
        throw this.ctx.getError({ status: 401, msg: '账户不存在' });
      }
      return user;
    }

    * edit (obj) {
      yield this.ctx.model.User.update(obj, { where: { id: this.ctx.request.uid } });
      if (obj.security) {
        yield this.ctx.model.UserLogin.update({ security: obj.security }, { where: { userId: this.ctx.request.uid } });
      }
    }

    * updatePassword (obj) {
      const userLogin = yield this.ctx.model.UserLogin.findOne({
        where: { userId: obj.uid },
      });
      if (!userLogin) {
        throw this.ctx.getError({ status: 401, msg: '账户不存在' });
      }
      if (userLogin.password !== this.ctx.helper.tools.md5(obj.password)) {
        throw this.ctx.getError({ msg: '原密码不正确' });
      }
      const updateUserLogin = {};
      updateUserLogin.password = this.ctx.helper.tools.md5(obj.targetPassword);
      yield this.ctx.model.UserLogin.update(updateUserLogin, { where: { userId: obj.uid } });
    }

    // 重置密码接口
    * newUpdatePassword (obj) {
      const userLogin = yield this.ctx.model.UserLogin.findOne({
        where: { email: obj.email },
      });
      if (!userLogin) {
        throw this.ctx.getError({ status: 401, msg: '账户不存在' });
      }
      const validCode = yield this.ctx.model.ValidCode.findOne({
        where: { code: obj.code },
      });
      if (!validCode) {
        return '激活码不合法';
      }
      if (validCode.expireTime.getTime() < new Date().getTime()) {
        return '激活码已过期，请登入账户重新激活';
      }
      // 修改邮箱激活状态
      const userUpadte = {};
      userUpadte.password = this.ctx.helper.tools.md5(obj.password);
      yield this.ctx.model.UserLogin.update(userUpadte, { where: { email: userLogin.email } });
      this.ctx.helper.token.setToken.call(this, userLogin.userId, userUpadte.password);
      // return '';
    }

    * forgetPassword (obj) {
      const userLogin = yield this.ctx.model.UserLogin.findOne({
        where: { email: obj.email },
      });
      if (!userLogin) {
        throw this.ctx.getError({ status: 401, msg: '账户不存在' });
      }
      // 生成新密码
      let password = this.ctx.helper.tools.md5(obj.email + '_' + new Date().getTime());
      password = password.substring(password.length - 8);
      this.app.sendMail({
        receivers: [ obj.email ],
        tplName: 'password',
        data: {
          name: obj.email,
          password,
        },
        callback () {
          const updateUserLogin = {};
          updateUserLogin.password = this.ctx.helper.tools.md5(this.ctx.helper.tools.md5(password));
          this.ctx.model.UserLogin.update(updateUserLogin, { where: { userId: obj.uid } });
        },
        subject: '【码良】密码重置'
      });
    }

    * search (obj) {
      let queryData = {
        attributes: [ 'id', 'name', 'photo', 'email' ],
        where: {
          $or: [ { name: { $like: '%' + obj.key + '%' } },
            { email: { $like: '%' + obj.key + '%' } } ]
        },
        limit: 10
      }
      if (this.ctx.helper.tools.isEmpty(obj.key)) {
        delete queryData.where;
      }
      const data = yield this.ctx.model.User.findAll(queryData);
      return data;
    }
  }

  return User;
};

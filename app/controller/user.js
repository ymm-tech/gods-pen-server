'use strict';
var OSS = require('ali-oss');
var moment = require('moment')
var crypto = require('crypto')
const co = require('co')

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

  class HomeController extends app.Controller {
    * login () {
      const { ctx } = this;
      const createRule = {
        account: { type: 'string' },
        kaptcha: { type: 'string' },
        password: { type: 'string' },
      };

      // 1.校验参数
      ctx.validate(createRule);

      // 2:校验验证码
      if (ctx.session.kaptcha != ctx.request.body.kaptcha) {
        throw ctx.getError({ msg: '验证码不正确' });
      }
      // 3:校验用户名及密码
      yield ctx.service.user.login(ctx.request.body);
    }

    * oauthCode () {
      const { ctx } = this;
      const createRule = {
        channel: { type: 'string', required: true, allowEmpty: false },
      };

      // 1.校验参数
      ctx.validate(createRule);

      let url = ''
      if (ctx.request.body.channel === 'github') {
        url = `https://github.com/login/oauth/authorize?client_id=${app.config.github.clientId}&redirect_uri=${getAdminUrl(ctx, 'login.html?from=github')}`
      }

      if (!url) {
        throw ctx.getError({ msg: '暂不支持该第三方登录' });
        return
      }
      console.log(url)
      // 2.跳转第三方登录页面
      this.ctx.body = {
        redirect: url
      }
    }

    async oauthLogin () {
      const { ctx } = this;
      const createRule = {
        channel: { type: 'string', required: true, allowEmpty: false },
        code: { type: 'string', required: true, allowEmpty: false }
      };
      let params = ctx.request.body
      // 1.校验参数
      ctx.validate(createRule);
      let user = {}
      if (params.channel == 'github') {
        console.log('a')
        // 获取token
        let accessToken = await app.curl('https://github.com/login/oauth/access_token', {
          method: 'POST',
          data: {
            client_id: app.config.github.clientId,
            client_secret:app.config.github.clientSecret,
            code: params.code,
            redirect_uri: '',
            state: ''
          }
        });
        let token = ''
        try {
          token = accessToken.data.toString().match(/access_token=([^&]+)/)[1]
        } catch (e) {
          throw ctx.getError({ msg: '第三方账号授权失败' });
        }
        if (!token) {
          throw ctx.getError({ msg: '第三方账号授权失败' });
        }
        let info = (await app.curl(`https://api.github.com/user?access_token=${token}`, {
          method: 'GET',
          dataType: 'json',
          headers: {
            Authorization: token
          },
        }) || {}).data
        user = {
          oauth: `github_${info.id}`,
          name: info.name,
          email: info.email
        }
      }

      // 3:登录
      await co(function * () {
        yield ctx.service.user.oauthLogin(user);
      }) 
    }

    * register () {
      const { ctx } = this;
      const registerRule = {
        email: 'email',
        password: { type: 'string', required: true, allowEmpty: false },
        kaptcha: { type: 'string', min: 4, max: 4 },
        name: { type: 'string', min: 2, max: 32 },
      };
      ctx.validate(registerRule);
      // 2:校验验证码
      if (ctx.session.kaptcha != ctx.request.body.kaptcha) {
        throw ctx.getError({ msg: '验证码不正确' });
      }
      let obj = ctx.request.body;
      obj.emailStatus = 1;
      yield ctx.service.user.register(obj);
    }

    * activeEmail () {
      const { ctx } = this;
      const activeEmailRule = {
        code: { type: 'string', required: true, allowEmpty: false }
      };
      ctx.validate(activeEmailRule, ctx.request.body);
      // 解析code码
      const showCode = ctx.helper.tools.decrypt(ctx.request.body.code, app.config.appConfig.desKey);
      if (!ctx.helper.tools.isEmpty(showCode)) {
        const params = {};
        const index = showCode.indexOf('||');
        params.email = showCode.substr(0, index);
        params.code = showCode.substr(index + 2);
        const message = yield ctx.service.user.activeEmail(params);
        if (ctx.helper.tools.isEmpty(message)) {
          // 激活成功，跳转制定页面
          this.ctx.redirect(getAdminUrl(this.ctx, 'index.html'));
        } else {
          ctx.body = message;
        }
      } else {
        throw ctx.getError({ msg: '参数不合法' });
      }
    }

    * sendActiveEmail () {
      const { ctx } = this;
      if (ctx.request.uid > 0) {
        yield ctx.service.user.sendActiveEmail(ctx.request.uid);
      } else {
        throw ctx.getError({ msg: '您的登录已失效' });
      }
    }

    // 忘记密码，发送邮件
    * sendEmail () {
      const { ctx } = this;
      const sendEmailRule = {
        email: 'email'
      };
      // 1.校验参数
      ctx.validate(sendEmailRule);
      yield ctx.service.user.sendEmail(ctx.request.body.email);
    }

    * info () {
      const { ctx } = this;
      if (ctx.request.uid > 0) {
        let info =  yield ctx.service.user.info(ctx.request.uid);
        if (ctx.query.uid > 0 && info.emailStatus !== 2) throw ctx.getError({ msg: '您的账户未激活，暂不能查看其他项目成员的信息' });
        if (ctx.query.uid > 0) info = yield ctx.service.user.info(ctx.query.uid);
        const user = {};
        user.name = info.name;
        user.userId = info.id;
        user.photo = info.photo;
        user.telephone = info.telephone;
        user.email = info.email;
        user.role = info.role;
        user.security = ctx.query.uid > 0 ? '' : info.security;
        user.emailStatus = info.emailStatus;
        user.projectNums = info.projectCount;
        ctx.body = user;
      } else {
        throw ctx.getError({ msg: '您的登录已失效' });
      }
    }

    * logout () {
      this.ctx.cookies.set(this.app.config.appConfig.accessTokenKey, '', {
        maxAge: 0
      });
    }

    * edit () {
      const { ctx } = this;
      const editRule = {
        name: { type: 'string', required: true, allowEmpty: false, min: 2, max: 32 },
        telephone: { type: 'string', allowEmpty: true, min: 0, max: 11 },
        email: { type: 'string', allowEmpty: true },
      };

      // 1.校验参数
      ctx.validate(editRule);

      yield ctx.service.user.edit(ctx.request.body);
    }

    * updatePassword () {
      const { ctx } = this;
      const passwordRule = {
        targetPassword: { type: 'string', required: true, allowEmpty: false },
        password: { type: 'string', required: true, allowEmpty: false },
      };

      // 1.校验参数
      ctx.validate(passwordRule);
      ctx.request.body.uid = ctx.request.uid
      yield ctx.service.user.updatePassword(ctx.request.body);
    }

    // 忘记密码，重置接口
    * newUpdatePassword () {
      const { ctx } = this;
      const passwordRule = {
        code: { type: 'string', required: true, allowEmpty: false },
      };
      ctx.validate(passwordRule, ctx.request.body);
      // 解析code码
      const showCode = ctx.helper.tools.decrypt(ctx.request.body.code, app.config.appConfig.desKey);
      if (!ctx.helper.tools.isEmpty(showCode)) {
        const params = {};
        const index = showCode.indexOf('||');
        params.email = showCode.substr(0, index);
        params.code = showCode.substr(index + 2);
        params.password = ctx.request.body.password
        yield ctx.service.user.newUpdatePassword(params);
      } else {
        throw ctx.getError({ msg: '参数不合法' });
      }
    }

    * forgetPassword () {
      const { ctx } = this;
      const forgetPasswordRule = {
        email: 'email'
      };

      // 1.校验参数
      ctx.validate(forgetPasswordRule);
      yield ctx.service.user.forgetPassword(ctx.request.body);
    }

    * search () {
      const { ctx } = this;
      const searchRule = {
        key: { type: 'string', required: true, max: 50 }
      };

      // 1.校验参数
      ctx.validate(searchRule, ctx.query);
      const data = yield ctx.service.user.search(ctx.query);
      ctx.body = data;
    }

    * getTocken () {
      console.log('访问ip:', this.ctx.ip)
      const valid = this.ctx.helper.tools.ossConfigValid(app.config.oss)
      if (!valid) throw this.ctx.getError({ msg: '您未正确配置 oss 服务的相关字段，无法使用对象存储服务' })
      var expire_syncpoint = new Date().getTime() + 60 * 1000
      var policyToken = {
        accessKeyId: app.config.oss.accessKeyId,
        accessKeySecret: app.config.oss.accessKeySecret,
        host: app.config.oss.host,
        expire_time: moment(expire_syncpoint).toISOString(),
        upload_dir: `${app.config.oss.bucket}/`
      }
      console.log(policyToken)
      var policy_dict = {}
      policy_dict[ 'expiration' ] = policyToken.expire_time
      var condition_array = []
      var array_item = []
      array_item.push('starts-with');
      array_item.push('$key');
      array_item.push(policyToken.upload_dir);
      condition_array.push(array_item)
      policy_dict[ 'conditions' ] = condition_array
      var policy = JSON.stringify(policy_dict)
      var policy_encode = new Buffer(policy).toString('base64')
      console.log(policy_encode)
      var sign_result = crypto.createHmac('sha1', policyToken.accessKeySecret).update(policy_encode).digest().toString('base64');
      console.log(sign_result)

      var token_dict = {}
      token_dict[ 'accessid' ] = policyToken.accessKeyId
      token_dict[ 'host' ] = policyToken.host
      token_dict[ 'policy' ] = policy_encode
      token_dict[ 'signature' ] = sign_result
      token_dict[ 'expire' ] = expire_syncpoint
      token_dict[ 'dir' ] = policyToken.upload_dir
      token_dict[ 'ns' ] = (this.ctx.request.uid + 10000).toString(16) // namespace
      const { ctx } = this;
      ctx.body = token_dict;
    }
  }

  return HomeController;
};

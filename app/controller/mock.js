'use strict';

module.exports = app => {
  class controller extends app.Controller {
    * infoOption () {
      const { ctx } = this;
      ctx.noWarp = true
      ctx.body = ''
      ctx.status = 200
    }

    * info () {
      const { ctx } = this;
      let info = {};
      if (ctx.params[ 0 ] && ctx.params[ 1 ]) {
        if (/^\d*$/.test(ctx.params[ 0 ])) {
          info.id = ctx.params[ 0 ];
          info.path = ctx.params[ 1 ];
        }
      }
      info.type = ctx.request.method.toLowerCase();
      // 获取请求类型
      ctx.noWarp = true;
      ctx.body = yield ctx.service.mock.info(info);
    }

    * insertOrUpdate () {
      const { ctx } = this;
      const createRule = {
        mockRequest: { type: 'string' },
        type: { type: 'number', required: true },
        apiId: { type: 'number' },
      };

      // 1.校验参数
      ctx.validate(createRule);
      const mockInfo = ctx.request.body;
      mockInfo.uid = ctx.request.uid;
      ctx.body = yield ctx.service.mock.add(mockInfo);
    }
  }
  return controller;
};

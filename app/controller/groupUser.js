'use strict';

module.exports = app => {
  class controller extends app.Controller {

    * add () {
      const { ctx } = this;
      const createRule = {
        groupId: { type: 'string', required: true },
        userId: { type: 'array', required: true },
        role: { type: 'string', required: true },
      };

      // 1.校验参数
      ctx.validate(createRule);

      const obj = ctx.request.body;
      obj.uid = ctx.request.uid;
      yield ctx.service.groupUser.add(obj);

    }

    * delete () {
      const { ctx } = this;
      const createRule = {
        groupId: { type: 'string', required: true },
        userId: { type: 'number', required: true },
      };

      // 1.校验参数
      ctx.validate(createRule);

      // 2:验证参数
      const obj = ctx.request.body;
      obj.uid = ctx.request.uid;
      yield ctx.service.groupUser.delete(obj);
    }

    * list () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'string', required: true },
        count: { type: 'string' },
        start: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule,ctx.query);

      // 查询数据返回
      const obj = {};
      obj.groupId = ctx.query.id;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.groupUser.list(obj);
    }

    * update () {
      const { ctx } = this;
      const createRule = {
        // groupId: { type: 'string', required: true },
        userId: { type: 'string', required: true, min: 1 },
        role: { type: 'string', required: true },
      };

      // 1.校验参数
      ctx.validate(createRule);
      // 2:验证参数
      const obj = ctx.request.body;
      obj.uid = ctx.request.uid;
      yield ctx.service.groupUser.update(obj);
    }

  }
  return controller;
};

'use strict';

module.exports = app => {
  class controller extends app.Controller {

    * add () {
      const { ctx } = this;
      const createRule = {
        description: { type: 'string' },
        name: { type: 'string', required: true, allowEmpty: false },
      };

      // 1.校验参数
      ctx.validate(createRule);
      let groupInfo = {
        description: ctx.request.body.description,
        logo: ctx.request.body.logo,
        name: ctx.request.body.name,
        uid: ctx.request.uid,
      }
      ctx.body = yield ctx.service.group.add(groupInfo);
    }

    * delete () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'number', required: true }
      };
      // 1.校验参数
      ctx.validate(createRule);

      // 2:验证参数
      const obj = {};
      obj.groupId = ctx.request.body.id;
      obj.uid = ctx.request.uid;
      yield ctx.service.group.delete(obj);
    }

    * list () {
      const { ctx } = this;
      // type: 0 || 1 => 0表示所有 1表示我创建的
      const createRule = {
        type: { type: 'string', required: true },
        count: { type: 'string' },
        start: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);

      // 查询数据返回
      const obj = {};
      obj.type = ctx.query.type;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.group.list(obj);
    }

    * update () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'number', required: true, min: 1 }
      };
      // 1.校验参数
      ctx.validate(createRule);

      // 2:验证参数
      const obj = ctx.request.body;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.group.update(obj);
    }

    * info () {
      const { ctx } = this;
      // type: 0 || 1 => 0表示所有 1表示我创建的
      const createRule = {
        id: { type: 'string', required: true },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);
      const obj = {};
      obj.groupId = ctx.query.id;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.group.info(obj);
    }

  }
  return controller;
};

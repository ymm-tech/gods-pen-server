'use strict';

module.exports = app => {
  class controller extends app.Controller {

    * add () {
      const { ctx } = this;
      const createRule = {
        name: { type: 'string', required: true, allowEmpty: false },
        groupId: { type: 'number' },
      };

      // 1.校验参数
      ctx.validate(createRule);
      const projectInfo = ctx.request.body;
      projectInfo.uid = ctx.request.uid;
      ctx.body = yield ctx.service.project.add(projectInfo);
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
      obj.projectId = ctx.request.body.id;
      obj.uid = ctx.request.uid;
      yield ctx.service.project.delete(obj);
    }

    * list () {
      const { ctx } = this;
      const createRule = {
        count: { type: 'string' },
        start: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);

      // 查询数据返回
      const obj = {};
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.project.list(obj);
    }

    * update () {
      const { ctx } = this;
      const createRule = {
        name: { type: 'string', required: true, allowEmpty: false },
        groupId: { type: 'number' },
        id: { type: 'number' },
      };

      // 1.校验参数
      ctx.validate(createRule);
      const projectInfo = ctx.request.body;
      projectInfo.uid = ctx.request.uid;
      yield ctx.service.project.update(projectInfo);
    }

    * info () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'string', required: true },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);
      const obj = {};
      obj.projectId = ctx.query.id;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.project.info(obj);
    }

    * groupProject () {
      const { ctx } = this;
      const createRule = {
        count: { type: 'string' },
        start: { type: 'string' },
        groupId: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);

      // 查询数据返回
      const obj = ctx.query;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.project.groupProjects(obj);
    }

    * favorateProject () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'number', required: true, },
      };

      // 1.校验参数
      ctx.validate(createRule);
      const projectInfo = ctx.request.body;
      projectInfo.uid = ctx.request.uid;
      yield ctx.service.project.favorateProject(projectInfo);
    }

    * cancelFavorateProject () {
      const { ctx } = this;
      const createRule = {
        id: { type: 'number', required: true, },
      };

      // 1.校验参数
      ctx.validate(createRule);
      const projectInfo = ctx.request.body;
      projectInfo.uid = ctx.request.uid;
      yield ctx.service.project.cancelFavorateProject(projectInfo);
    }

    * getFavorateProject () {
      const { ctx } = this;
      const createRule = {
        count: { type: 'string' },
        start: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);

      // 查询数据返回
      const obj = {};
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.project.getFavorateProject(obj);
    }
  }
  return controller;
};

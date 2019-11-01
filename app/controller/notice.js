'use strict';

module.exports = app => {
  class controller extends app.Controller {

    // 拉取最新20条未读消息
    * pullMessage () {
      const { ctx } = this;
      const obj = {};
      obj.uid = ctx.request.uid;
      obj.readStatus = 1;
      ctx.body = yield ctx.service.notice.pullMessage(obj);

    }

    // 获取站内信消息列表
    * listMessage () {
      const { ctx } = this;
      const createRule = {
        type: { type: 'string' },
        status: { type: 'string' },
        count: { type: 'string' },
        start: { type: 'string' },
      };
      // 1.校验参数
      ctx.validate(createRule, ctx.query);

      // 查询数据返回
      const obj = ctx.query;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.notice.listMessage(obj);
    }

    // 修改站内信读取状态
    * changeReadStatus () {
      const { ctx } = this;
      const obj = ctx.request.body;
      yield ctx.service.notice.changeReadStatus(obj);
    }

    // 获取站内信详情
    * getMessageInfo () {
      const { ctx } = this;
      const obj = ctx.request.query;
      ctx.body = yield ctx.service.notice.getMessageInfo(obj);
    }

    // 获取站内信消息数
    * getMessageNums () {
      const { ctx } = this;
      const obj = {};
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.notice.getMessageNums(obj);
    }

    // 获取消息设置详情
    * getNoticeType () {
      const { ctx } = this;
      const obj = ctx.request.query;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.notice.getNoticeType(obj);
    }

    // 修改消息设置详情
    * updateNoticeType () {
      const { ctx } = this;
      const obj = ctx.request.body;
      obj.uid = ctx.request.uid;
      ctx.body = yield ctx.service.notice.updateNoticeType(obj);
    }
  }
  return controller;
};

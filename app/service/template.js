/**
 * Created with WebStorm.
 * User: kevan
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 上午9:30
 * To change this template use File | Settings | File Templates.
 */
var md5 = require('md5');
'use strict'
module.exports = app => {
  class Template extends app.Service {
    * list (query) {
      console.log('service start --list')
      let _where = {
        status: (query.status == undefined) ? 1 : query.status,
        name: { $like: `%${query.name || ''}%` },
      }
      if (query.id) _where.id = query.id
      if (query.categoryId) _where.categoryId = query.categoryId
      return yield this.ctx.model.Template.findAll({ where: _where});
    }
    * detail (query) {
      return yield this.ctx.model.Template.findOne({ where: { id: query.id } })
    }
    * save (query) {
      try {
        var _item = {
          name: query.name,
          categoryId: query.categoryId,
          content: query.content,
          desc: query.desc,
          status: (query.status == undefined) ? 1 : query.status,
          image: query.image
        }
        if (query.id) {
          // 编辑
          // 参数验证，1判断是否存在该id，2是否重名
          if (!(yield this.ctx.model.Template.findOne({where: { status: 1, id: query.id }}))) throw this.ctx.getError({ msg: `不存在id为${query.id}的模板` });
          if (yield this.ctx.model.Template.findOne({where: {name: query.name, status: 1, id: { $ne: query.id }}}))  throw this.ctx.getError({ msg: `已经存在名称为${query.name}的模板` });
          yield this.ctx.model.Template.update(_item, { where: { id: query.id } })
          return { id: query.id }
        } else {
          // 参数验证 是否重名
          if (yield this.ctx.model.Template.findOne({where: {name: query.name, status: 1}}))  throw this.ctx.getError({ msg: `已经存在名称为${query.name}的模板` });
          var newItem = yield this.ctx.model.Template.create(_item)
          return { id: newItem.id }
        }
      } catch (e) {
        throw this.ctx.getError({ msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`, error: e });
      }
    }
    * delete (id) {
      var item = yield this.ctx.model.Template.findOne({ where: { id: id } })
      if (item) {
        yield this.ctx.model.Template.update({ status: 0 }, { where: { id: id } });
        return true
      }
    }
  }
  return Template
}

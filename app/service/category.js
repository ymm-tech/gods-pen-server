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
  class Category extends app.Service {
    * list (query) {
      console.log('service start --list')
      let _where = {
        status: (query.status == undefined) ? 1 : query.status,
      }
      if (query.type) {
        _where.type = {
          $in: query.type
        }
      }
      return yield this.ctx.model.Category.findAll({ where: _where });
    }

    * save (query) {
      try {
        var _item = {
          name: query.name,
          type: query.type,
          desc: query.desc,
          status: (query.status == undefined) ? 1 : query.status,
        }
        if (query.id) {
          // 编辑
          // 参数验证，1判断是否存在该id，2是否重名
          if (!(yield this.ctx.model.Category.findOne({
              where: {
                status: 1,
                id: query.id
              }
            }))) throw this.ctx.getError({ msg: `不存在id为${query.id}的类型` });
          if (yield this.ctx.model.Category.findOne({
              where: {
                name: query.name,
                status: 1,
                type: query.type,
                id: { $ne: query.id }
              }
            })) throw this.ctx.getError({ msg: `已经存在名称为${query.name}的类型` });
          yield this.ctx.model.Category.update(_item, { where: { id: query.id } })
          return { id: query.id }
        } else {
          // 参数验证 是否重名
          if (yield this.ctx.model.Category.findOne({
              where: {
                type: query.type,
                name: query.name,
                status: 1
              }
            })) throw this.ctx.getError({ msg: `已经存在名称为${query.name}的类型` });
          var newItem = yield this.ctx.model.Category.create(_item)
          return { id: newItem.id }
        }
      } catch (e) {
        throw this.ctx.getError({ msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`, error: e });
      }
    }

    * delete (id) {
      var item = yield this.ctx.model.Category.findOne({ where: { id: id } })
      if (item) {
        yield this.ctx.model.Category.update({ status: 0 }, { where: { id: id } });
        return true
      }
    }
  }

  return Category
}

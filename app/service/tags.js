/**
 * Created with WebStorm.
 * User: kevan
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 上午9:30
 * To change this template use File | Settings | File Templates.
 */
var md5 = require('md5')
'use strict'
module.exports = app => {
  class Tags extends app.Service {

    * list (query) {
      let _where = {
        status: 1
      }
      if (query.categoryId) _where.categoryId = query.categoryId
      if (query.name) _where.name = {
        $like: `%${query.name || ''}%`
      }

      return yield this.ctx.model.Tags.findAll({
        where: _where,
        attributes: [ 'id', 'name' ],
        order: [ [ 'useNumber', 'DESC' ] ]
      });
    }

    * add (query) {
      var item = yield this.ctx.model.Tags.findOne({
        where: {
          name: query.name,
          categoryId: query.categoryId
        }
      })
      if (item) {
        return item
      } else {
        var newItem = yield this.ctx.model.Tags.create({
          name: query.name,
          categoryId: query.categoryId
        })
        return newItem
      }
    }

    * useone (query) {
      var component = yield this.ctx.model.Tags.findOne({
        where: {
          id: query.id,
          status: 1
        }
      })
      if (component) {
        var useNum = component.useNumber + 1
        yield this.ctx.model.Tags.update({
          useNumber: useNum
        }, {
          where: {
            id: query.id
          }
        })
      }
      return {
        id: query.id
      }
    }
  }

  return Tags
}
'use strict'
module.exports = app => {
  class TagsController extends app.Controller {
    * list () {
      const {
        ctx
      } = this
      const searchRule = {
        name: {
          type: 'string',
          max: 50,
          required: false,
          allowEmpty: true
        },
        categoryId: {
          type: 'int',
          required: false,
          allowEmpty: true
        }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      ctx.body = yield ctx.service.tags.list(ctx.request.body)
    }

    * add () {
      const {
        ctx
      } = this
      const searchRule = {
        name: {
          type: 'string',
          max: 50,
          required: false,
          allowEmpty: true
        },
        categoryId: {
          type: 'int',
          required: false,
          allowEmpty: true
        }
      }
      ctx.validate(searchRule)
      ctx.body = yield ctx.service.tags.add(ctx.request.body)
    }

    /**
     * 组件使用过一次
     */
    * useone () {
      const {
        ctx
      } = this
      const searchRule = {
        id: {
          type: 'number',
          required: true
        }
      }
      ctx.validate(searchRule)
      var obj = ctx.request.body
      obj.userId = ctx.request.uid
      ctx.body = yield ctx.service.tags.useone(obj)
    }
  }

  return TagsController
}
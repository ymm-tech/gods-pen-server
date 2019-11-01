'use strict'

module.exports = app => {
  class CategoryController extends app.Controller {
    * list () {
      const {
        ctx
      } = this
      const searchRule = {}
      ctx.validate(searchRule)
      console.log('validate success')
      ctx.body = yield ctx.service.category.list(ctx.request.body)
    }

    * save () {
      const {
        ctx
      } = this
      const searchRule = {
        id: {
          type: 'int',
          required: false,
          allowEmpty: true
        },
        name: {
          type: 'string',
          max: 20,
          required: true
        },
        type: {
          type: 'int',
          max: 5,
          required: true
        },
        // desc: {
        //   type: 'string',
        //   max: 64,
        //   allowEmpty: true
        // }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      ctx.body = yield ctx.service.category.save(ctx.request.body)
    }

    * delete () {
      const {
        ctx
      } = this
      const createRule = {
        id: {
          type: 'int',
          required: true
        }
      }
      ctx.validate(createRule)
      yield ctx.service.category.delete(ctx.request.body.id)
    }
  }

  return CategoryController
}

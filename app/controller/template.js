'use strict'

module.exports = app => {
  class TemplateController extends app.Controller {
    * list () {
      const {
          ctx
      } = this
      const  searchRule = {
        id: {
          type: 'int',
          max: 5,
          required: false,
          allowEmpty: true
        },
        name: {
          type: 'string',
          max: 20,
          allowEmpty: true,
          required: false
        },
        categoryId: {
          type: 'int',
          max: 5,
          required: false,
          allowEmpty: true
        }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      ctx.body = yield ctx.service.template.list(ctx.request.body)
    }

    * detail () {
      const {
        ctx
      } = this
      const searchRule = {
        id: {
          type: 'int',
          required: true
        }
      }
      ctx.validate(searchRule)
      ctx.body = yield ctx.service.template.detail(ctx.request.body)
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
        categoryId: {
          type: 'int',
          max: 5,
          allowEmpty: true,
          required: false
        },
        content: {
          type: 'string',
          allowEmpty: true
        },
        // image: {
        //   type: 'string',
        //   allowEmpty: true,
        //   required: false
        // },
        // desc: {
        //   type: 'string',
        //   max: 64,
        //   required: false,
        //   allowEmpty: true
        // }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      ctx.body = yield ctx.service.template.save(ctx.request.body)
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
      yield ctx.service.template.delete(ctx.request.body.id)
    }
  }
  return TemplateController
}

'use strict'

module.exports = app => {
  class ResourcesController extends app.Controller {
    * info () {
      const {
        ctx
      } = this
      const searchRule = {
        id: {
          type: 'string'
        }
      }
      ctx.validate(searchRule, ctx.query)
      var obj = ctx.query
      obj.uid = ctx.request.uid
      ctx.body = yield ctx.service.resources.info(obj)
    }

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
        },
        page: {
          type: 'int',
          required: false,
          allowEmpty: true
        },
        pageSize: {
          type: 'int',
          required: false,
          allowEmpty: true
        }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      var obj = ctx.request.body
      obj.uid = ctx.request.uid
      ctx.body = yield ctx.service.resources.list(obj)
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
          allowEmpty: true,
          required: false
        },
        icon: {
          type: 'string',
          allowEmpty: true,
          required: false
        },
        content: {
          type: 'string',
          allowEmpty: true,
          required: false
        },
        tags: {
          type: 'array',
          required: false
        }
      }
      ctx.validate(searchRule)
      var obj = ctx.request.body
      obj.uid = ctx.request.uid
      ctx.body = yield ctx.service.resources.save(obj)
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
      var obj = ctx.request.body
      obj.uid = ctx.request.uid
      yield ctx.service.resources.delete(obj)
    }

    * addUseCount () {
      const {
        ctx
      } = this
      const rule = {
        id: {
          type: 'int',
          required: true
        }
      }
      ctx.validate(rule)
      var obj = ctx.request.body
      ctx.body = yield ctx.service.resources.addUseCount(obj)
    }
  }

  return ResourcesController
}
'use strict'

module.exports = app => {
  class ComponentController extends app.Controller {
    * find () {
      const {
        ctx
      } = this
      const searchRule = {
        name: {
          type: 'string',
        }
      }
      ctx.validate(searchRule)
      console.log('validate success')
      var obj = ctx.request.body
      obj.name = obj.name.replace(/\%/gi, '')
      if (!obj.name) {
        throw this.ctx.getError({
          msg: '搜索条件为空'
        })
      }
      obj.uid = ctx.request.uid
      obj.like = false
      ctx.body = yield ctx.service.component.list(obj)
    }

    * searchByName () {
      const {
        ctx
      } = this
      const searchRule = {}
      ctx.validate(searchRule)
      console.log('validate success')
      var obj = ctx.request.body
      obj.name = obj.name.replace(/\%/gi, '')
      obj.uid = ctx.request.uid
      obj.like = true
      ctx.body = yield ctx.service.component.list(obj)
    }

    * searchAllStatusByName () {
      const {
        ctx
      } = this
      const searchRule = {}
      ctx.validate(searchRule)
      console.log('validate success')
      var obj = ctx.request.body
      obj.name = obj.name.replace(/\%/gi, '')
      obj.uid = ctx.request.uid
      obj.like = true
      obj.status = 'all'
      ctx.body = yield ctx.service.component.list(obj)
    }

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
      ctx.body = yield ctx.service.component.info(obj)
    }

    * updata () {
      const {
        ctx
      } = this
      const searchRule = {
        desc: {
          type: 'string',
          required: true
        },
        visibilitylevel: {
          type: 'int',
          required: true
        },
      }
      ctx.validate(searchRule)
      var obj = ctx.request.body
      obj.userId = ctx.request.uid
      ctx.body = yield ctx.service.component.updata(obj)
    }

    * save () {
      const {
        ctx
      } = this
      const searchRule = {
        version: {
          type: 'string',
          required: true
        },
        name: {
          type: 'string',
          required: true
        },
        desc: {
          type: 'string',
          required: true
        },
        path: {
          type: 'string',
          required: true
        },
        visibilitylevel: {
          type: 'int',
          required: true
        },
      }
      ctx.validate(searchRule)
      var obj = ctx.request.body
      obj.userId = ctx.request.uid
      ctx.body = yield ctx.service.component.save(obj)
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
      ctx.body = yield ctx.service.component.useone(obj)
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
      yield ctx.service.component.delete(obj)
    }

    async import () {
      const {
        ctx
      } = this
      const searchRule = {
        id: {
          type: 'int',
          required: true
        },
        token: {
          type: 'string',
          required: true
        },
      }
      ctx.validate(searchRule)
      const obj = ctx.request.body
      const userId = ctx.request.uid
      const result = await ctx.service.component.import(obj, userId)
      ctx.body = result
    }
  }

  return ComponentController
}
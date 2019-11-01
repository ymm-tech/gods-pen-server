'use strict'

module.exports = app => {
  class HomeController extends app.Controller {
    * add () {
      const { ctx } = this
      const createRule = {
        method: { type: 'string', required: true, allowEmpty: false },
        name: { type: 'string', required: true, allowEmpty: false, max: 50 },
        path: { type: 'string', required: true, allowEmpty: false },
        projectId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:插入接口数据
      const id = yield ctx.service.interface.add(params)
      ctx.body = { id }
    }
    * delete () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'number', required: true, min: 1 }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:删除接口数据
      yield ctx.service.interface.delete(params)
    }
    * update () {
      const { ctx } = this
      const createRule = {
        request: { type: 'string' },
        response: { type: 'string' },
        method: { type: 'string', required: true, allowEmpty: false },
        name: { type: 'string', required: true, allowEmpty: false, max: 50 },
        path: { type: 'string', required: true, allowEmpty: false },
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:修改接口数据
      yield ctx.service.interface.update(params)
    }
    * updataInterfaceMock () {
      const { ctx } = this
      const createRule = {
        content: { type: 'string' },
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:修改接口数据
      yield ctx.service.interface.updataInterfaceMock(params)
    }

    /**
     * 对外的草稿同步接口
     */
    * apiUpload () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'number' },
        token: { type: 'string' }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      console.log(params)
      // 2:修改接口数据
      yield ctx.service.interface.draf(params)
    }

    /**
     * 查询某项目ID同步的api列表
     */
    * getApiByProjectId () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'string' }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      console.log(params)
      // 2:修改接口数据
      const listApis = yield ctx.service.interface.searchApiByProjectId(params)
      ctx.body = listApis
    }

    * batchUpdate () {
      const { ctx } = this
      const createRule = {
        apis: { type: 'array' },
        projectId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:批量修改接口数据
      yield ctx.service.interface.batchUpdate(params)
    }
    * getDetailDrafById () {
      const { ctx } = this
      const createRule = {
        id: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.query)
      let params = ctx.query

      // 2:查询接口数据
      const api = yield ctx.service.interface.getDetailDrafById(params)
      ctx.body = api
    }
    * draftList () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.query)
      let params = ctx.query

      // 2:查询接口数据
      const listApis = yield ctx.service.interface.draftList(params)
      ctx.body = listApis
    }
    /**
     * 废弃接口文档
     * @param {*} obj
     */
    * deprecated (obj) {
      const { ctx } = this
      const createRule = {
        id: { type: 'number', required: true },
        deprecated: { type: 'number', required: true }
      }
      // 1.校验参数
      ctx.validate(createRule, ctx.request.body)
      let params = ctx.request.body
      const listApis = yield ctx.service.interface.deprecated(params)
      ctx.body = listApis
    }
    * list () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.query)
      let params = ctx.query

      // 2:查询接口数据
      const listApis = yield ctx.service.interface.list(params)
      ctx.body = listApis
    }
    * getInterfaceInfo () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'string', required: true },
        type: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.query)
      let params = ctx.query
      params.uid = ctx.request.uid

      // 2:查询接口数据
      const apiInfo = yield ctx.service.interface.getInterfaceInfo(params)
      ctx.body = apiInfo
    }
    * addApiTag () {
      const { ctx } = this
      const createRule = {
        tagName: { type: 'string', required: true, max: 50 },
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:插入接口数据
      const id = yield ctx.service.interface.addApiTag(params)
      ctx.body = { tagId: id }
    }
    * requestRelease () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:发布接口
      yield ctx.service.interface.requestRelease(params)
    }
    * getApproveList () {
      const { ctx } = this
      let params = {}
      params.uid = ctx.request.uid

      // 2:查询接口数据
      const listApis = yield ctx.service.interface.getApproveList(params)
      ctx.body = listApis
    }
    * deleteApiTag () {
      const { ctx } = this
      const createRule = {
        tagId: { type: 'number', required: true },
        apiId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:删除接口标签
      yield ctx.service.interface.deleteApiTag(params)
    }
    * auditApi () {
      const { ctx } = this
      const createRule = {
        status: { type: 'number', required: true },
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:审核接口标签
      yield ctx.service.interface.auditApi(params)
    }
    * addTag () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'number', required: true },
        name: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:审核接口标签
      const id = yield ctx.service.interface.addTag(params)
      ctx.body = { id }
    }
    * updateTag () {
      const { ctx } = this
      const createRule = {
        tagId: { type: 'number', required: true },
        name: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:审核接口标签
      yield ctx.service.interface.updateTag(params)
      ctx.body = { id: params.tagId, name: params.name }
    }
    * deleteTag () {
      const { ctx } = this
      const createRule = {
        tagId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:删除标签
      yield ctx.service.interface.deleteTag(params)
    }
    * getTags () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.request.query)
      let params = ctx.request.query
      params.uid = ctx.request.uid

      // 2:删除标签
      const tags = yield ctx.service.interface.getTags(params)
      ctx.body = { tags }
    }
    * getPersons () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.request.query)
      let params = ctx.request.query
      params.uid = ctx.request.uid

      // 2:接口关注人列表
      const persons = yield ctx.service.interface.getPersons(params)
      ctx.body = { persons }
    }
    * addPerson () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'number', required: true },
        userId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:关注接口
      yield ctx.service.interface.addPerson(params)
    }
    * deletePerson () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'number', required: true },
        userId: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:删除关注人
      yield ctx.service.interface.deletePerson(params)
    }
    * addData () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'number', required: true },
        name: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:审核接口标签
      const id = yield ctx.service.interface.addData(params)
      ctx.body = { id }
    }
    * updateData () {
      const { ctx } = this
      const createRule = {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        content: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:审核接口标签
      yield ctx.service.interface.updateData(params)
      ctx.body = { id: params.id, name: params.name, content: params.content }
    }
    * deleteData () {
      const { ctx } = this
      const createRule = {
        id: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:删除标签
      yield ctx.service.interface.deleteData(params)
    }
    * getDatas () {
      const { ctx } = this
      const createRule = {
        projectId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.request.query)
      let params = ctx.request.query
      params.uid = ctx.request.uid

      // 2:删除标签
      const datas = yield ctx.service.interface.getDatas(params)
      ctx.body = { datas }
    }
    * getHistoryList () {
      const { ctx } = this
      const createRule = {
        apiId: { type: 'string', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule, ctx.query)
      let params = ctx.query

      // 2:查询接口数据
      const listApis = yield ctx.service.interface.getHistoryList(params)
      ctx.body = listApis
    }
    * updateHistoryStatus () {
      const { ctx } = this
      const createRule = {
        id: { type: 'number', required: true },
        type: { type: 'number', required: true },
        status: { type: 'number', required: true }
      }

      // 1.校验参数
      ctx.validate(createRule)
      let params = ctx.request.body
      params.uid = ctx.request.uid

      // 2:修改文档状态
      yield ctx.service.interface.updateHistoryStatus(params)
    }
  }
  return HomeController
}

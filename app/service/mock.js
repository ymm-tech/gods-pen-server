module.exports = app => {
  class Mock extends app.Service {
    * info (obj) {
      // 查询项目
      // 查询项目对应接口信息
      // 生成mock数据
      console.log('---------')
      let shortPath = obj.path.replace(/^\//, '').replace(/\/$/, '')
      console.log(shortPath)
      const interfaceInfos = yield this.ctx.model.HistoryInterface.findAll({
        where: {
          projectId: obj.id,
          path: { $in: [ shortPath, '/' + shortPath, shortPath + '/', '/' + shortPath + '/' ] },
          status: 1
        }
      });
      let interfaceInfo = null
      interfaceInfos.forEach((value) => {
        if (value.type == obj.type) {
          interfaceInfo = value
        }
      })
      
      if (interfaceInfo) {
        if(interfaceInfo.mockResponse){
          return JSON.parse(interfaceInfo.mockResponse)
        }
        if (!interfaceInfo.response) throw this.ctx.getError({ msg: '无响应值' });
        return this.ctx.helper.tools.jsonToMock(JSON.parse(interfaceInfo.response));
      } else {
        if (interfaceInfos.length == 0) {
          throw this.ctx.getError({ msg: '接口不存在' });
        } else {
          throw this.ctx.getError({ msg: '接口访问类型不匹配,尝试用 ' + interfaceInfos[ 0 ].type  });
        }
      }

    }

    * add (obj) {
      const mockInfo = yield this.ctx.model.Mock.findOne({ where: { interfaceId: obj.apiId, type: obj.type } });
      if (mockInfo) {
        // 修改
        yield this.ctx.model.Mock.update({ mockRequest: obj.mockRequest }, {
          where: {
            interfaceId: obj.apiId,
            type: obj.type
          }
        });
      } else {
        // 添加
        yield this.ctx.model.Mock.create({ mockRequest: obj.mockRequest, interfaceId: obj.apiId, type: obj.type });
      }
    }
  }
  return Mock;
};

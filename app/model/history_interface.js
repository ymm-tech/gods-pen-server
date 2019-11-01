/**
 * Created with WebStorm.
 * User: kevan
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 下午3:47
 * To change this template use File | Settings | File Templates.
 */
'use strict'
module.exports = app => {
  return app.model.define('historyInterface', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    createUserId: { field: 'create_user_id', type: app.Sequelize.BIGINT },
    description: { field: 'description', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    path: { field: 'path', type: app.Sequelize.STRING },
    request: { field: 'request_content', type: app.Sequelize.STRING },
    response: { field: 'response_content', type: app.Sequelize.STRING },
    mockResponse: { field: 'mock_response', type: app.Sequelize.STRING },
    projectId: { field: 'project_id', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    version: { field: 'version', type: app.Sequelize.STRING },
    interfaceId: { field: 'interface_id', type: app.Sequelize.INTEGER },
    lastedVersion: { field: 'lasted_version', type: app.Sequelize.INTEGER },
    modifyUserId: { field: 'modify_user_id', type: app.Sequelize.INTEGER },
    aduitRemark: { field: 'aduit_remark', type: app.Sequelize.STRING },
    endStatus: { field: 'end_status', type: app.Sequelize.INTEGER },
    deprecated: { field: 'deprecated', type: app.Sequelize.INTEGER },
    frontStatus: { field: 'front_status', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_history_interface',
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  }, {
    classMethods: {}
  })
}

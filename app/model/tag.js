/**
 * Created with WebStorm.
 * User: star
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 下午3:47
 * To change this template use File | Settings | File Templates.
 */
'use strict'
module.exports = app => {
  return app.model.define('tag', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    projectId: { field: 'project_id', type: app.Sequelize.INTEGER },
    name: { field: 'name', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_tag',
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  }, {
    classMethods: {}
  })
}

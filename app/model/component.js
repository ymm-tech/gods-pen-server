'use strict';
module.exports = app => {
  var component = app.model.define('component', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    version: { field: 'version', type: app.Sequelize.STRING },
    path: { field: 'path', type: app.Sequelize.STRING },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    userId: { field: 'user_id', type: app.Sequelize.INTEGER },
    useNumber: { field: 'usenumber', type: app.Sequelize.INTEGER },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    isnew: { field: 'isnew', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER},
    visibilitylevel: { field: 'visibilitylevel', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_component',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
  return component
};

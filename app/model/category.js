'use strict';
module.exports = app => {
  return app.model.define('category', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_category',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

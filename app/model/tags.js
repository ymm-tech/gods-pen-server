'use strict';
module.exports = app => {
  return app.model.define('tags', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    categoryId: { field: 'category_id', type: app.Sequelize.INTEGER },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    useNumber: { field: 'usenumber', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_tags',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

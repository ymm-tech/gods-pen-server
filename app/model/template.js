'use strict';
module.exports = app => {
  return app.model.define('template', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    categoryId: { field: 'category_id', type: app.Sequelize.INTEGER },
    content: { field: 'content', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    image: { field: 'image', type: app.Sequelize.STRING },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_template',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

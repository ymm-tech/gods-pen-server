'use strict';
module.exports = app => {
  return app.model.define('resources', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    icon: { field: 'icon', type: app.Sequelize.STRING },
    content: { field: 'content', type: app.Sequelize.STRING },
    categoryId: { field: 'category_id', type: app.Sequelize.INTEGER },
    userId: { field: 'user_id', type: app.Sequelize.INTEGER },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    visibilitylevel: { field: 'visibilitylevel', type: app.Sequelize.INTEGER },
    useCount: { field: 'use_count', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_resources',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

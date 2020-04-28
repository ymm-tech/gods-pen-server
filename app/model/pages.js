'use strict';
module.exports = app => {
  return app.model.define('pages', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    key: { field: 'key', type: app.Sequelize.STRING },
    name: { field: 'name', type: app.Sequelize.STRING },
    image: { field: 'image', type: app.Sequelize.STRING },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    content: { field: 'content', type: app.Sequelize.STRING },
    draft: { field: 'draft', type: app.Sequelize.STRING },
    projectId: { field: 'project_id', type: app.Sequelize.INTEGER },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    featured: { field: 'featured', type: app.Sequelize.INTEGER },
    visibilitylevel: { field: 'visibilitylevel', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER }, // 页面类型，默认0，普通页面；1，flutter 页面；
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
    fork: { field: 'fork', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_pages',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

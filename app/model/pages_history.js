'use strict';
module.exports = app => {
  return app.model.define('pagesHistory', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true },
    content: { field: 'content', type: app.Sequelize.STRING },
    userId: { field: 'user_id', type: app.Sequelize.INTEGER },
    pageId: { field: 'page_id', type: app.Sequelize.INTEGER },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_pages_history',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

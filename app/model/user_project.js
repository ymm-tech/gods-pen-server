module.exports = app => {
  return app.model.define('userProject', {
    projectId: { field: 'project_id', type: app.Sequelize.BIGINT, primaryKey: true },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT, primaryKey: true, },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    role: { field: 'role', type: app.Sequelize.INTEGER },
    favor: { field: 'is_favor', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_user_and_project',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

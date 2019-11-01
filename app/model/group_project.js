module.exports = app => {
  return app.model.define('groupProject', {
    groupId: { field: 'group_id', type: app.Sequelize.BIGINT, primaryKey: true },
    projectId: { field: 'project_id', type: app.Sequelize.BIGINT, primaryKey: true, },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_group_and_project',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

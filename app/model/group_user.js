module.exports = app => {
  return app.model.define('groupUser', {
    groupId: { field: 'group_id', type: app.Sequelize.BIGINT, primaryKey: true },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT, primaryKey: true },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    role: { field: 'role', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_group_and_user',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

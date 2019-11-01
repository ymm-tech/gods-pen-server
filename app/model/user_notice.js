module.exports = app => {
  return app.model.define('userNotice', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    createUserId: { field: 'create_user_id', type: app.Sequelize.BIGINT },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT },
    content: { field: 'content', type: app.Sequelize.STRING },
    title: { field: 'title', type: app.Sequelize.STRING },
    readStatus: { field: 'read_status', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    joinId: { field: 'join_id', type: app.Sequelize.BIGINT },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_user_notice',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

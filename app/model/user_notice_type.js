module.exports = app => {
  return app.model.define('userNoticeType', {
    userId: { field: 'user_id', type: app.Sequelize.BIGINT, primaryKey: true },
    type: { field: 'type', type: app.Sequelize.INTEGER, primaryKey: true },
    messageNotice: { field: 'message_notice', type: app.Sequelize.INTEGER },
    emailNotice: { field: 'email_notice', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_user_notice_type',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

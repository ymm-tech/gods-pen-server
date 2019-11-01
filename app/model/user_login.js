module.exports = app => {
  return app.model.define('userLogin', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    password: { field: 'password', type: app.Sequelize.STRING },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT },
    email: { field: 'email', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    lastIp: { field: 'last_ip', type: app.Sequelize.STRING },
    lastLogin: { field: 'last_login', type: app.Sequelize.DATE },
    ssoUid: { field: 'sso_uid', type: app.Sequelize.BIGINT },
    security: { field: 'security', type: app.Sequelize.STRING },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_user_login',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

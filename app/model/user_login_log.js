module.exports = app => {
  return app.model.define('userLoginLog', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT },
    ip: { field: 'ip', type: app.Sequelize.STRING },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_login_log',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

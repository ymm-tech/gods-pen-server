module.exports = app => {
  return app.model.define('validCode', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    code: { field: 'code', type: app.Sequelize.STRING },
    userId: { field: 'user_id', type: app.Sequelize.BIGINT },
    email: { field: 'email', type: app.Sequelize.STRING },
    expireTime: { field: 'expire_time', type: app.Sequelize.DATE },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_valid_code',
    createdAt: 'createTime',
    updatedAt: false,
  }, {
    classMethods: {},
  });
};

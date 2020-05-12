module.exports = app => {
  return app.model.define('user', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    email: { field: 'email', type: app.Sequelize.STRING },
    emailStatus: { field: 'email_status', type: app.Sequelize.INTEGER },
    name: { field: 'name', type: app.Sequelize.STRING },
    telephone: { field: 'telephone', type: app.Sequelize.STRING },
    photo: { field: 'photo', type: app.Sequelize.STRING },
    projectCount: { field: 'project_count', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
    role: { field: 'role', type: app.Sequelize.INTEGER },
    oauth: { field: 'oauth', type: app.Sequelize.STRING }
  }, {
    timestamps: true,
    tableName: 'tb_user',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

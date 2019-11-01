module.exports = app => {
  return app.model.define('group', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    createUserId: { field: 'create_user_id', type: app.Sequelize.BIGINT },
    description: { field: 'description', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    logo: { field: 'logo', type: app.Sequelize.STRING },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    projectCount: { field: 'project_count', type: app.Sequelize.INTEGER },
    userCount: { field: 'user_count', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_group',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

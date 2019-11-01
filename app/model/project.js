module.exports = app => {
  return app.model.define('project', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    key: { field: 'key', type: app.Sequelize.STRING },
    createUserId: { field: 'create_user_id', type: app.Sequelize.BIGINT },
    image: { field: 'image', type: app.Sequelize.STRING },
    desc: { field: 'desc', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    visibilitylevel: { field: 'visibilitylevel', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_project',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

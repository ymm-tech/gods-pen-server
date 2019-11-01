module.exports = app => {
  return app.model.define('projectData', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    projectId: { field: 'project_id', type: app.Sequelize.BIGINT },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    name: { field: 'name', type: app.Sequelize.STRING },
    remark: { field: 'remark', type: app.Sequelize.STRING },
    content: { field: 'content', type: app.Sequelize.STRING },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_project_data',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

module.exports = app => {
  return app.model.define('interfaceDraf', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    projectId: { field: 'project_id', type: app.Sequelize.BIGINT },
    apis: { field: 'apis', type: app.Sequelize.STRING },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_interface_draf',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

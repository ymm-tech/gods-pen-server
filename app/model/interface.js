module.exports = app => {
  return app.model.define('interface', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    name: { field: 'name', type: app.Sequelize.STRING },
    createUserId: { field: 'create_user_id', type: app.Sequelize.BIGINT },
    description: { field: 'description', type: app.Sequelize.STRING },
    status: { field: 'status', type: app.Sequelize.INTEGER },
    path: { field: 'path', type: app.Sequelize.STRING },
    request: { field: 'request_content', type: app.Sequelize.STRING },
    response: { field: 'response_content', type: app.Sequelize.STRING },
    projectId: { field: 'project_id', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    versionInterfaceId: { field: 'version_interface_id', type: app.Sequelize.INTEGER },
    modifyUserId: { field: 'modify_user_id', type: app.Sequelize.INTEGER },
    publishStatus: { field: 'publish_status', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_interface',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

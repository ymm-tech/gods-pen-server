module.exports = app => {
  return app.model.define('interfaceLog', {
    id: { field: 'id', type: app.Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
    remark: { field: 'remark', type: app.Sequelize.STRING },
    uid: { field: 'uid', type: app.Sequelize.BIGINT },
    interfaceId: { field: 'interface_id', type: app.Sequelize.INTEGER },
    type: { field: 'type', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_interface_log',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

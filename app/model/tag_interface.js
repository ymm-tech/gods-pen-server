module.exports = app => {
  return app.model.define('tagInterface', {
    tagId: { field: 'tag_id', type: app.Sequelize.BIGINT, primaryKey: true },
    interfaceId: { field: 'interface_id', type: app.Sequelize.INTEGER, primaryKey: true },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_tag_interface',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

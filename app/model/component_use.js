'use strict';
module.exports = app => {
  return app.model.define('ComponentUse', {
    cid: { field: 'cid', type: app.Sequelize.INTEGER },
    useNumber: { field: 'usenumber', type: app.Sequelize.INTEGER },
    love: { field: 'love', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_component_use',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

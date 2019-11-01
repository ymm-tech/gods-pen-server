'use strict';
module.exports = app => {
  return app.model.define('resTagsRel', {
    id: { field: 'id', type: app.Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    rid: { field: 'rid', type: app.Sequelize.INTEGER },
    tid: { field: 'tid', type: app.Sequelize.INTEGER },
    cid: { field: 'cid', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT }
  }, {
    timestamps: true,
    tableName: 'tb_res_tags_rel',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

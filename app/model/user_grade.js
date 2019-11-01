module.exports = app => {
  return app.model.define('userGrade', {
    userId: { field: 'user_id', type: app.Sequelize.BIGINT, primaryKey: true },
    projectNum: { field: 'project_num', type: app.Sequelize.INTEGER },
    groupNum: { field: 'group_num', type: app.Sequelize.INTEGER },
    interfaceNum: { field: 'interface_num', type: app.Sequelize.INTEGER },
    favorateProjectNum: { field: 'favorate_project_num', type: app.Sequelize.INTEGER },
    updateTime: { field: 'update_time', type: app.Sequelize.BIGINT },
    createTime: { field: 'create_time', type: app.Sequelize.BIGINT },
  }, {
    timestamps: true,
    tableName: 'tb_user_grade',
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  }, {
    classMethods: {},
  });
};

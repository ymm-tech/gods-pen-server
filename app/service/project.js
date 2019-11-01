const nunjucks = require('nunjucks');
const noticeMessage = require('../extend/noticeMessage');
module.exports = app => {
  class Project extends app.Service {
    * delete (obj) {
      // 检查用户与项目的权限
      const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.projectId);
      if (role != app.config.appConfig.roleOwner) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 检查项目是否存在
      let projectTemp = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
      if (!projectTemp) throw this.ctx.getError({ msg: '项目不存在' });

      // 软删除分组信息
      let t = yield app.model.transaction();
      try {
        let project1 = {};
        project1.status = 0;
        yield this.ctx.model.Project.update(project1, { where: { id: obj.projectId }, transaction: t });
        // delete all group-project relation
        yield this.ctx.model.GroupProject.update({ status: 0 }, {
          where: { projectId: obj.projectId },
          transaction: t
        });
        yield this.ctx.model.UserProject.update({ status: 0 }, { where: { projectId: obj.projectId }, transaction: t });
        // delete all page
        const interfaces = yield this.ctx.model.Pages.findAll({ where: { status: 1, projectId: obj.projectId } });
        if (interfaces && interfaces.length > 0) {
          let interfaceIds = [];
          interfaces.forEach(function (e) {
            // 组合相应的项目信息
            interfaceIds.push(e.id);
          });
          yield this.ctx.model.Pages.update({ status: 0 }, { where: { id: { in: interfaceIds } } });
        }
        yield t.commit();
      } catch (e) {
        yield t.rollback();
        console.log(e)
        throw this.ctx.getError({ msg: '服务器异常', e });
      }
    }

    * add (obj) {
      // 校验分组的权限
      const groupUser = yield this.ctx.model.GroupUser.findOne({
        where: {
          userId: obj.uid,
          groupId: obj.groupId,
          status: 1
        }
      });
      if (!groupUser) throw this.ctx.getError({ msg: '无权限操作' });
      if (groupUser.role > app.config.appConfig.roleMaster) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 校验用户创建项目的最大数
      const projectNums = this.ctx.model.UserProject.count({ where: { userId: obj.uid, status: 1 } });
      const userGrade = this.ctx.model.UserGrade.findOne({ where: { userId: obj.uid } });
      if (userGrade && userGrade.groupNum <= projectNums) {
        throw this.ctx.getError({ msg: '项目数目超限' });
      }
      // 插入项目数据
      const project = obj;
      project.createUserId = obj.uid;
      project.status = 1;
      project.key = 'projectdefault'
      let t = yield app.model.transaction();
      try {
        // 创建项目
        let projectInfo = yield this.ctx.model.Project.create(project, { transaction: t });
        // 创建项目与用户的关系
        // yield this.ctx.model.UserProject.create({
        //   projectId: projectInfo.id,
        //   userId: project.uid,
        //   status: 1,
        //   role: app.config.appConfig.roleOwner,
        //   favor: 0
        // }, { transaction: t });
        // 创建项目与组关系
        yield this.ctx.model.GroupProject.create({
          projectId: projectInfo.id,
          groupId: project.groupId,
          status: 1,
        }, { transaction: t });
        yield t.commit();
        return projectInfo.id;
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({ msg: '服务器异常', error: e });
      }
    }

    * list (obj) {
      // 组合当前用户的信息
      let wheres = {};
      wheres.userId = obj.uid;
      wheres.status = 1;
      const userProjects = yield this.ctx.model.UserProject.findAll({ where: wheres });
      if (!userProjects) return null;
      let projectIds = [];
      let userIds = [];
      let projectMap = {};
      let groupMap = {};
      let userMap = {};
      let groupProjectMap = {};
      userProjects.forEach(function (e) {
        // 组合相应的分组信息
        projectIds.push(e.projectId);
      });
      // 查询本人创建的项目
      const ownerProjects = yield this.ctx.model.Project.findAll({ where: { status: 1, createUserId: obj.uid } });
      if (ownerProjects && ownerProjects.length > 0) {
        for (let i = 0; i < ownerProjects.length; i++) {
          let e = ownerProjects[ i ];
          // 组合相应的分组信息
          if (projectIds.indexOf(e.id) == -1) {
            projectIds.push(e.id);
            // userProjects也增加,查询用户在组里的权限
            const role = yield this.ctx.service.base.getUserRole(obj.uid, e.id);
            userProjects.push({ projectId: e.id, role });
          }
        }
      }
      // 查询用户参与的组
      const tempGroupIds = [];
      const groupUsers = yield this.ctx.model.GroupUser.findAll({ where: { status: 1, userId: obj.uid } });
      if (groupUsers && groupUsers.length > 0) {
        for (let i = 0; i < groupUsers.length; i++) {
          let el = groupUsers[ i ];
          tempGroupIds.push(el.groupId);
        }
      }
      if (tempGroupIds && tempGroupIds.length > 0) {
        const projectInfos = yield this.ctx.model.GroupProject.findAll({
          where: {
            status: 1,
            groupId: { in: tempGroupIds }
          }
        });
        if (projectInfos && projectInfos.length > 0) {
          for (let i = 0; i < projectInfos.length; i++) {
            let et = projectInfos[ i ];
            // 组合相应的分组信息
            if (projectIds.indexOf(et.projectId) == -1) {
              projectIds.push(et.projectId);
              // userProjects也增加,查询用户在组里的权限
              const role = yield this.ctx.service.base.getUserRole(obj.uid, et.projectId);
              userProjects.push({ projectId: et.projectId, role });
            }
          }
        }
      }
      const projects = yield this.ctx.model.Project.findAll({ where: { status: 1, id: { in: projectIds } } });
      if (!projects) return null;
      projects.forEach(function (e) {
        // 组合相应的信息
        projectMap[ e.id ] = e;
        userIds.push(e.createUserId);
      });
      // 查询分组信息
      const groupProjects = yield this.ctx.model.GroupProject.findAll({
        where: {
          status: 1,
          projectId: { in: projectIds }
        }
      });
      if (!groupProjects) return null;
      let groupIds = [];
      groupProjects.forEach(function (e) {
        // 组合相应的分组信息
        groupIds.push(e.groupId);
        groupProjectMap[ e.projectId ] = e;
      });
      const groups = yield this.ctx.model.Group.findAll({ where: { status: 1, id: { in: groupIds } } });
      if (!groups) return null;
      groups.forEach(function (e) {
        // 组合相应的信息
        groupMap[ e.id ] = e;
      });
      // 查询用户信息
      const users = yield this.ctx.model.User.findAll({ where: { id: { in: userIds } } });
      if (!users) return null;
      users.forEach(function (e) {
        // 组合相应的信息
        userMap[ e.id ] = e;
      });
      let result = [];
      userProjects.forEach(function (e) {
        // 组合相应的分组信息
        const temp = {};
        temp.id = e.projectId;
        if (projectMap[ e.projectId ]) {
          temp.projectName = projectMap[ e.projectId ].name;
          temp.image = projectMap[ e.projectId ].image;
          temp.role = e.role;
          temp.desc = projectMap[ e.projectId ].desc;
          temp.groupId = groupProjectMap[ e.projectId ].groupId;
          temp.groupName = groupMap[ temp.groupId ].name;
          temp.creatorId = projectMap[ e.projectId ].createUserId;
          temp.creatorName = userMap[ temp.creatorId ].name;
          temp.createTime = projectMap[ e.projectId ].createTime;
          result.push(temp);
        }
      });
      return result;
    }

    * update (obj) {
      // 检查用户与项目的权限
      const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.id);
      if (role != app.config.appConfig.roleOwner) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 查询项目与组关系
      const groupProject = yield this.ctx.model.GroupProject.findOne({ where: { projectId: obj.id } });
      if (!groupProject) throw this.ctx.getError({ msg: '项目对应分组不存在' });
      // 检查项目是否存在
      let oldProject = yield this.ctx.model.Project.findOne({ where: { id: obj.id } });
      if (!oldProject) throw this.ctx.getError({ msg: '项目不存在' });
      // 修改项目信息
      var project = {}
      project.desc = obj.desc;
      project.name = obj.name;
      project.image = obj.image;
      project.status = oldProject.status;
      project.visibilitylevel = obj.visibilitylevel;
      yield this.ctx.model.Project.update(project, { where: { id: obj.id } });
      yield this.ctx.model.GroupProject.update({ groupId: obj.groupId }, { where: { projectId: obj.id } });
    }

    * info (obj) {
      // 检查用户与项目的权限
      const groupProject = yield this.ctx.model.GroupProject.findOne({ where: { projectId: obj.projectId } });
      if (!groupProject) throw this.ctx.getError({ msg: '项目对应分组不存在' });
      const result = {};
      // 检查用户与项目的权限
      const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.projectId);
      if (role == 100) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 组合数据
      const project = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
      const group = yield this.ctx.model.Group.findOne({ where: { id: groupProject.groupId } });
      const user = yield this.ctx.model.User.findOne({ where: { id: project.createUserId } });
      result.id = obj.projectId;
      result.projectName = project.name;
      result.image = project.image;
      result.role = role;
      result.desc = project.desc;
      result.visibilitylevel = project.visibilitylevel;
      result.groupId = group.id;
      result.groupName = group.name;
      result.creatorId = project.createUserId;
      result.creatorName = user.name;
      result.createTime = project.createTime;
      result.security = project.security;
      result.ddwebhook = project.ddwebhook;
      return result;
    }

    * groupProjects (obj) {
      // 查询用户与组的信息
      const groupUser = yield this.ctx.model.GroupUser.findOne({
        where: {
          status: 1,
          groupId: obj.groupId,
          userId: obj.uid
        }
      });
      if (!groupUser) this.ctx.getError({ msg: '无权限操作' });
      const groupProjects = yield this.ctx.model.GroupProject.findAll({ where: { status: 1, groupId: obj.groupId } });
      if (!groupProjects) return null;
      let projectIds = [];
      let userIds = [];
      let userMap = {};
      let groupProjectMap = {};
      let userProjectMap = {};
      groupProjects.forEach(function (e) {
        // 组合相应的分组信息
        groupProjectMap[ e.projectId ] = e;
        projectIds.push(e.projectId);
      });
      const projects = yield this.ctx.model.Project.findAll({
        where: { status: 1, id: { in: projectIds } },
        order: 'update_time desc'
      });
      if (!projects) return null;
      projects.forEach(function (e) {
        userIds.push(e.createUserId);
      });
      // 查询用户信息
      const users = yield this.ctx.model.User.findAll({ where: { id: { in: userIds } } });
      if (!users) return null;
      users.forEach(function (e) {
        // 组合相应的信息
        userMap[ e.id ] = e;
      });
      const userProjects = yield this.ctx.model.UserProject.findAll({
        where: {
          status: 1,
          userId: obj.uid,
          projectId: { in: projectIds }
        }
      });
      userProjects.forEach(function (e) {
        // 组合相应的信息
        userProjectMap[ e.projectId ] = e;
      });
      let result = [];
      for (let i = 0; i < projects.length; i++) {
        let e = projects[ i ];
        // 组合相应的分组信息
        const temp = {};
        temp.id = e.id;
        temp.projectName = e.name;
        temp.image = e.image;
        // 检查用户与项目的权限
        const role = yield this.ctx.service.base.getUserRole(obj.uid, e.id);
        temp.role = role;
        temp.desc = e.desc;
        temp.creatorId = e.createUserId;
        temp.creatorName = userMap[ e.createUserId ].name;
        temp.createTime = e.createTime;
        result.push(temp);
      }
      return result;
    }

    * favorateProject (obj) {
      // 校验用户关注项目的最大数
      const favorProjectrojectNums = this.ctx.model.UserProject.count({
        where: {
          userId: obj.uid,
          status: 1,
          favor: 1
        }
      });
      const userGrade = this.ctx.model.UserGrade.findOne({ where: { userId: obj.uid } });
      if (!userGrade && userGrade.favorateProjectNum <= favorProjectrojectNums) {
        throw this.ctx.getError({ msg: '关注项目数目超限' });
      }
      // 判断用户是否已关注
      const userProject = this.ctx.model.UserProject.findOne({ where: { userId: obj.uid, projectId: obj.id } });
      if (!userProject || userProject.status != 1) {
        throw this.ctx.getError({ msg: '项目不存在' });
      }
      if (userProject && userProject.status == 1 && userProject.favor == 1) {
        return '';
      }
      this.ctx.model.UserProject.update({ status: 1, favor: 1 }, { where: { userId: obj.uid, projectId: obj.id } });
    }

    * cancelFavorateProject (obj) {
      // 判断用户是否已关注
      const userProject = this.ctx.model.UserProject.findOne({ where: { userId: obj.uid, projectId: obj.id } });
      if (!userProject || userProject.status == 0) {
        throw this.ctx.getError({ msg: '项目不存在' });
      }
      if (userProject && userProject.favor != 1) {
        return '';
      }
      this.ctx.model.UserProject.update({ favor: 0 }, { where: { userId: obj.uid, projectId: obj.id } });
    }

    * getFavorateProject (obj) {
      // 组合当前用户的信息
      let wheres = {};
      wheres.userId = obj.uid;
      wheres.status = 1;
      const userProjects = yield this.ctx.model.UserProject.findAll({ where: wheres });
      if (!userProjects) return null;
      let projectIds = [];
      let userIds = [];
      let projectMap = {};
      let userMap = {};
      userProjects.forEach(function (e) {
        // 组合相应的分组信息
        projectIds.push(e.projectId);
      });
      const projects = yield this.ctx.model.Project.findAll({ where: { status: 1, id: { in: projectIds } } });
      if (!projects) return null;
      projects.forEach(function (e) {
        // 组合相应的信息
        projectMap[ e.id ] = e;
        userIds.push(e.createUserId);
      });
      // 查询用户信息
      const users = yield this.ctx.model.User.findAll({ where: { id: { in: userIds } } });
      if (!users) return null;
      users.forEach(function (e) {
        // 组合相应的信息
        userMap[ e.id ] = e;
      });
      let result = [];
      userProjects.forEach(function (e) {
        // 组合相应的分组信息
        const temp = {};
        temp.id = e.projectId;
        temp.projectName = projectMap[ e.projectId ].name;
        temp.image = projectMap[ e.projectId ].image;
        temp.role = e.role;
        temp.desc = projectMap[ e.projectId ].desc;
        temp.creatorId = projectMap[ e.projectId ].createUserId;
        temp.creatorName = userMap[ temp.creatorId ].name;
        temp.createTime = projectMap[ e.projectId ].createTime;
        result.push(temp);
      });
      return result;
    }
  }

  return Project;
};

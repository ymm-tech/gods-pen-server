const nunjucks = require('nunjucks');
const noticeMessage = require('../extend/noticeMessage');
module.exports = app => {
  class ProjectUser extends app.Service {

    * add (obj) {
      // 校验用户权限
      if (obj.role != app.config.appConfig.roleDev && obj.role != app.config.appConfig.roleGest && obj.role != app.config.appConfig.roleMaster) {
        throw this.ctx.getError({ msg: '参数有误' });
      }
      const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.projectId);
      if (role > app.config.appConfig.roleDev) {
        throw this.ctx.getError({ msg: '无权限操作' });
      }
      const userIds = obj.userId;
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        // 查询是否已插入
        const userProject = yield this.ctx.model.UserProject.findOne({ where: { userId, projectId: obj.projectId } });
        if (!userProject) {
          // 插入
          yield this.ctx.model.UserProject.create({ userId, projectId: obj.projectId, role: obj.role, status: 1 });

          // 添加项目成员成功，发送消息通知
          let uids = yield this.ctx.model.query(`select DISTINCT user_id from tb_user_and_project where project_id=:projectId and user_id!=:uid and status =1 `, { type: 'SELECT', replacements: obj });
          uids = uids.map((value) => value.user_id);
          // 获取用户信息
          const user = yield this.ctx.model.User.findOne({ where: { id: userId } });
          // 获取项目信息
          const project = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
          const title = nunjucks.renderString(noticeMessage.PROJECT_ADD_USER.title, { userName: user.name, projectName: project.name });
          const content = nunjucks.renderString(noticeMessage.PROJECT_ADD_USER.content, { userName: user.name, projectName: project.name });
          const notice = {};
          notice.createUserId = obj.uid;
          notice.content = content;
          notice.title = title;
          notice.readStatus = 1;
          notice.type = noticeMessage.PROJECT_ADD_USER.code;
          notice.joinId = project.id;
          yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeProject);

        } else {
          // 修改信息
          yield this.ctx.model.UserProject.update({ role: obj.role, status: 1 }, { where: { userId, projectId: obj.projectId } });

          // 添加项目成员修改权限成功，发送消息通知
          let uids = yield this.ctx.model.query(`select DISTINCT user_id from tb_user_and_project where project_id=:projectId and user_id!=:uid and status =1 `, { type: 'SELECT', replacements: obj });
          uids = uids.map((value) => value.user_id);
          // 获取用户信息
          const user = yield this.ctx.model.User.findOne({ where: { id: userId } });
          // 获取项目信息
          const project = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
          const title = nunjucks.renderString(noticeMessage.PROJECT_ROLE_USER.title, { userName: user.name, projectName: project.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
          const content = nunjucks.renderString(noticeMessage.PROJECT_ROLE_USER.content, { userName: user.name, projectName: project.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
          const notice = {};
          notice.createUserId = obj.uid;
          notice.content = content;
          notice.title = title;
          notice.readStatus = 1;
          notice.type = noticeMessage.PROJECT_ROLE_USER.code;
          notice.joinId = project.id;
          yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeProject);

        }
      }
    }

    * delete (obj) {
      // 查询是否已插入
      let projectUser = yield this.ctx.model.UserProject.findOne({ where: { userId: obj.userId, projectId: obj.projectId } });
      if (!projectUser) {
        throw this.ctx.getError({ msg: '当前用户不存在' });
      } else {
        // 校验用户权限
        const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.projectId);
        if (role > app.config.appConfig.roleDev) {
          throw this.ctx.getError({ msg: '无权限操作' });
        }
        // 存在删除信息
        let t = yield app.model.transaction();
        try {
          yield this.ctx.model.UserProject.update({ status: 0 }, { where: { userId: obj.userId, projectId: obj.projectId } });

          // 删除项目成员成功，发送消息通知
          let uids = yield this.ctx.model.query(`select DISTINCT user_id from tb_user_and_project where project_id=:projectId and status =1 and user_id != :uid `, { type: 'SELECT', replacements: obj });
          uids = uids.map((value) => value.user_id);
          // 获取用户信息
          const user = yield this.ctx.model.User.findOne({ where: { id: obj.userId } });
          // 获取项目信息
          const project = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
          const title = nunjucks.renderString(noticeMessage.PROJECT_DELETE_USER.title, { userName: user.name, projectName: project.name });
          const content = nunjucks.renderString(noticeMessage.PROJECT_DELETE_USER.content, { userName: user.name, projectName: project.name });
          const notice = {};
          notice.createUserId = obj.uid;
          notice.content = content;
          notice.title = title;
          notice.readStatus = 1;
          notice.type = noticeMessage.PROJECT_DELETE_USER.code;
          notice.joinId = project.id;
          yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeProject);

          yield t.commit();
        } catch (e) {
          yield t.rollback();
          throw this.ctx.getError({ msg: '服务器异常', error: e });
        }
      }
    }

    * list (obj) {
      // 组合当前用户的信息
      let wheres = {};
      wheres.projectId = obj.projectId;
      wheres.status = 1;
      const projectUsers = yield this.ctx.model.UserProject.findAll({ where: wheres });
      if (!projectUsers) return null;
      let userIds = [];
      let tempGroupUser = {};
      projectUsers.forEach(function(e) {
        // 组合相应的分组信息
        userIds.push(e.userId);
        tempGroupUser[e.userId] = e;
      });
      const users = yield this.ctx.model.User.findAll({ attributes: [ 'id', 'name', 'photo' ], where: { id: { in: userIds } } });
      users.forEach(function(el) {
        el.dataValues.role = tempGroupUser[el.id].role;
        el.dataValues.userId = el.id;
        delete el.dataValues.id;
      });
      return users;
    }

    * update (obj) {
      // 校验用户权限
      if (obj.role != app.config.appConfig.roleMaster && obj.role != app.config.appConfig.roleGest && obj.role != app.config.appConfig.roleDev) {
        throw this.ctx.getError({ msg: '参数有误' });
      }
      // 查询是否已插入
      const projectUser = yield this.ctx.model.UserProject.findOne({ where: { userId: obj.userId, projectId: obj.projectId, status: 1 } });
      if (!projectUser) {
        // 不存在
        throw this.ctx.getError({ msg: '当前用户不存在' });
      } else {
        const role = yield this.ctx.service.base.getUserRole(obj.uid, obj.projectId);
        if (role > app.config.appConfig.roleDev) {
          throw this.ctx.getError({ msg: '无权限操作' });
        }
        // 存在则修改
        yield this.ctx.model.UserProject.update({ role: obj.role, status: 1 }, { where: { userId: obj.userId, projectId: obj.projectId } });
        // 项目成员修改权限成功，发送消息通知
        let uids = yield this.ctx.model.query(`select DISTINCT user_id from tb_user_and_project where project_id=:projectId and status =1 `, { type: 'SELECT', replacements: obj });
        uids = uids.map((value) => value.user_id);
        // 获取用户信息
        const user = yield this.ctx.model.User.findOne({ where: { id: obj.userId } });
        // 获取项目信息
        const project = yield this.ctx.model.Project.findOne({ where: { id: obj.projectId } });
        const title = nunjucks.renderString(noticeMessage.PROJECT_ROLE_USER.title, { userName: user.name, projectName: project.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
        const content = nunjucks.renderString(noticeMessage.PROJECT_ROLE_USER.content, { userName: user.name, projectName: project.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
        const notice = {};
        notice.createUserId = obj.uid;
        notice.content = content;
        notice.title = title;
        notice.readStatus = 1;
        notice.type = noticeMessage.PROJECT_ROLE_USER.code;
        notice.joinId = project.id;
        yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeProject);

      }
    }
  }
  return ProjectUser;
};

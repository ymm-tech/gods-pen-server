const nunjucks = require('nunjucks');
const noticeMessage = require('../extend/noticeMessage');
module.exports = app => {
  class Group extends app.Service {
    * delete (obj) {
      // 检查用户与组的权限
      let groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.groupId } });
      if (!groupUser) throw this.ctx.getError({ msg: '无权限操作' });
      if (groupUser.role !== app.config.appConfig.roleOwner || groupUser.status !== 1) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 检查分组是否存在
      let group = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
      if (!group) throw this.ctx.getError({ msg: '分组不存在' });
      // 软删除分组信息
      let t = yield app.model.transaction();
      try {
        group = {};
        group.status = 0;
        yield this.ctx.model.Group.update(group, { where: { id: obj.groupId }, transaction: t });
        // delete all group-user relation
        yield this.ctx.model.GroupUser.update({ status: 0 }, { where: { groupId: obj.groupId }, transaction: t });
        // delete all prioject relation
        const groupProjects = yield this.ctx.model.GroupProject.findAll({ where: { status: 1, groupId: obj.groupId } });
        if (groupProjects && groupProjects.length > 0) {
          // delete group all projects
          let projectIds = [];
          groupProjects.forEach(function(e) {
            // 组合相应的项目信息
            projectIds.push(e.projectId);
          });
          yield this.ctx.model.GroupProject.update({ status: 0 }, { where: { projectId: { in: projectIds } } });
          yield this.ctx.model.Project.update({ status: 0 }, { where: { id: { in: projectIds } } });
          // delete all project usre relation
          yield this.ctx.model.UserProject.update({ status: 0 }, { where: { projectId: { in: projectIds } } });
          // delete all interface
          const interfaces = yield this.ctx.model.Interface.findAll({ where: { status: 1, projectId: { in: projectIds } } });
          let interfaceIds = [];
          interfaces.forEach(function(e) {
            // 组合相应的项目信息
            interfaceIds.push(e.id);
          });
          yield this.ctx.model.Interface.update({ status: 2 }, { where: { id: { in: interfaceIds } } });
          // delete all interface usre relation
          yield this.ctx.model.InterfaceUser.update({ status: 2 }, { where: { interfaceId: { in: interfaceIds } } });
        }

        // 发送消息删除组
        let uids = yield this.ctx.model.query(`select user_id from tb_group_and_user where group_id=:groupId and status=1 and user_id !=:uid`, { type: 'SELECT', replacements: obj });
        uids = uids.map((value) => value.user_id);
        // 获取用户信息
        const user = yield this.ctx.model.User.findOne({ where: { id: obj.uid } });
        // 获取分组信息
        const groupInfo = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
        const title = nunjucks.renderString(noticeMessage.GROUP_DELETE.title, { userName: user.name, groupName: groupInfo.name });
        const content = nunjucks.renderString(noticeMessage.GROUP_DELETE.content, { userName: user.name, groupName: groupInfo.name });
        const notice = {};
        notice.createUserId = obj.uid;
        notice.content = content;
        notice.title = title;
        notice.readStatus = 1;
        notice.type = noticeMessage.GROUP_DELETE.code;
        notice.joinId = group.id;
        yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeGroup);

        yield t.commit();
      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({ msg: '服务器异常' });
      }
    }

    * add (group) {
      // 限制分组名不能重复
      const groupPro = yield this.ctx.model.Group.findAll({ where: { name: group.name, status: 1 } });
      if (groupPro && groupPro.length > 0) {
        throw this.ctx.getError({ msg: '该名称的分组已存在' });
      }
      // 校验用户创建组的最大数
      const groupNums = yield this.ctx.model.GroupUser.count({ where: { userId: group.uid, status: 1 } });
      const userGrade = yield this.ctx.model.UserGrade.findOne({ where: { userId: group.uid } });
      if (userGrade && userGrade.groupNum <= groupNums) {
        throw this.ctx.getError({ msg: '分组数目超限' });
      }
      // 插入分组数据
      group.createUserId = group.uid;
      group.status = 1;
      group.type = 1;
      group.projectCount = 0;
      group.userCount = 1;
      let t = yield app.model.transaction();
      try {
        // 创建组
        let groupInfo = yield this.ctx.model.Group.create(group, { transaction: t });
        // 创建组合用户的关系
        yield this.ctx.model.GroupUser.create({
          groupId: groupInfo.id,
          userId: group.uid,
          status: 1,
          role: app.config.appConfig.roleOwner,
        }, { transaction: t });
        yield t.commit();
        let groupPro = {};
        groupPro.description = group.description;
        groupPro.name = group.name;
        groupPro.logo = group.logo;
        groupPro.id = groupInfo.id;
        groupPro.role = app.config.appConfig.roleOwner;
        return groupPro;
      } catch (e) {
        yield t.rollback();
        console.log(e);
        throw this.ctx.getError({ msg: '服务器异常', error: e });
      }
    }

    * list (obj) {
      // 组合当前用户的信息
      let wheres = {};
      wheres.userId = obj.uid;
      wheres.status = 1;
      if (obj.type === 1) {
        wheres.role = app.config.appConfig.roleOwner;
      }
      const groupUsers = yield this.ctx.model.GroupUser.findAll({ where: wheres });
      if (!groupUsers) return null;
      let groupIds = [];
      let tempGroupUser = {};
      groupUsers.forEach(function(e) {
        // 组合相应的分组信息
        groupIds.push(e.groupId);
        tempGroupUser[e.groupId] = e;
      });
      const groups = yield this.ctx.model.Group.findAll({ attributes: [ 'id', 'name', 'description', 'logo', 'createTime' ], where: { status: 1, id: { in: groupIds } } });
      groups.forEach(function(el) {
        el.dataValues.role = tempGroupUser[el.id].role;
      });
      return groups;
    }

    * update (obj) {
      // 检查用户与组的权限
      let groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.id } });
      if (!groupUser) throw this.ctx.getError({ msg: '无权限操作' });
      if (groupUser.role !== app.config.appConfig.roleOwner || groupUser.status !== 1) {
        throw this.ctx.getError({ msg: '无操作权限' });
      }
      // 检查分组是否存在
      let group = yield this.ctx.model.Group.findOne({ where: { id: obj.id } });
      if (!group) throw this.ctx.getError({ msg: '分组不存在' });
      const groupPro = this.ctx.model.Group.findAll({ where: { name: obj.name, status: 1, id: { $ne: obj.id } } });
      if (groupPro && groupPro.length > 0) {
        throw this.ctx.getError({ msg: '该名称的分组已存在' });
      }
      // 修改分组信息
      group = {};
      group.description = obj.description;
      group.name = obj.name;
      group.logo = obj.logo;
      console.log(group);
      yield this.ctx.model.Group.update(group, { where: { id: obj.id } });
      let groupInfoPro = {};
      groupInfoPro.description = obj.description;
      groupInfoPro.name = obj.name;
      groupInfoPro.logo = obj.logo;
      groupInfoPro.id = obj.id;
      groupInfoPro.role = groupUser.role;
      return groupInfoPro;
    }

    * info (obj) {
      // 检查用户与组的权限
      let groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.groupId } });
      if (!groupUser) throw this.ctx.getError({ msg: '无权限查看' });

      if (groupUser.status !== 1) {
        throw this.ctx.getError({ msg: '无权限查看' });
      }
      const groupInfo = yield this.ctx.model.Group.findOne({ attributes: [ 'id', 'name', 'description', 'logo', 'createTime' ], where: { status: 1, id: obj.groupId } });
      groupInfo.dataValues.role = groupUser.role;
      return groupInfo;
    }
  }
  return Group;
};

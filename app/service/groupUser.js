const moment = require('moment');
const nunjucks = require('nunjucks');
const noticeMessage = require('../extend/noticeMessage');
module.exports = app => {
  class GroupUser extends app.Service {

    * add (obj) {
      // 校验用户权限
      if (obj.role != app.config.appConfig.roleOwner && obj.role != app.config.appConfig.roleMaster && obj.role != app.config.appConfig.roleDev) {
        throw this.ctx.getError({ msg: '参数有误' });
      }
      let groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.groupId, status: 1 } });
      if (!groupUser || (groupUser.role != app.config.appConfig.roleOwner)) {
        throw this.ctx.getError({ msg: '无权限操作' });
      }
      const userIds = obj.userId;
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        if (userId == obj.uid) continue;
        // 查询是否已插入
        groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId, groupId: obj.groupId } });
        if (!groupUser) {
          // 插入，数量加1
          let t = yield app.model.transaction();
          try {
            yield this.ctx.model.GroupUser.create({ userId, groupId: obj.groupId, role: obj.role, status: 1 }, { transaction: t });
            yield this.ctx.model.query(`update tb_group set  user_count=user_count+1,update_time='${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' where id=:groupId and user_count+1>0 `, { transaction: t, replacements: obj });

            // 用户加入成功，发送消息通知
            let uids = yield this.ctx.model.query(`select user_id from tb_group_and_user where group_id=:groupId and user_id!=:uid and status=1`, { type: 'SELECT', replacements: obj });
            uids = uids.map((value) => value.user_id);
            // 获取用户信息
            const user = yield this.ctx.model.User.findOne({ where: { id: userId } });
            // 获取分组信息
            const group = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
            const title = nunjucks.renderString(noticeMessage.GROUP_ADD_USER.title, { userName: user.name, groupName: group.name });
            const content = nunjucks.renderString(noticeMessage.GROUP_ADD_USER.content, { userName: user.name, groupName: group.name });
            const notice = {};
            notice.createUserId = obj.uid;
            notice.content = content;
            notice.title = title;
            notice.readStatus = 1;
            notice.type = noticeMessage.GROUP_ADD_USER.code;
            notice.joinId = group.id;
            yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeGroup);
            yield t.commit();
          } catch (e) {
            yield t.rollback();
            throw this.ctx.getError({ msg: '服务器异常', error: e });
          }
        } else {
          // 修改信息
          yield this.ctx.model.GroupUser.update({ role: obj.role, status: 1 }, { where: { userId, groupId: obj.groupId } });

          // 发送消息修改项目组内的权限
          let uids = yield this.ctx.model.query(`select user_id from tb_group_and_user where group_id=:groupId and user_id!=:uid and status=1`, { type: 'SELECT', replacements: obj });
          uids = uids.map((value) => value.user_id);
          // 获取用户信息
          const user = yield this.ctx.model.User.findOne({ where: { id: userId } });
          // 获取分组信息
          const group = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
          const title = nunjucks.renderString(noticeMessage.GROUP_ROLE_USER.title, { userName: user.name, groupName: group.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
          const content = nunjucks.renderString(noticeMessage.GROUP_ROLE_USER.content, { userName: user.name, groupName: group.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
          const notice = {};
          notice.createUserId = obj.uid;
          notice.content = content;
          notice.title = title;
          notice.readStatus = 1;
          notice.type = noticeMessage.GROUP_ROLE_USER.code;
          notice.joinId = group.id;
          yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeGroup);
        }
      }
    }

    * delete (obj) {
      // 查询是否已插入
      const groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.userId, groupId: obj.groupId } });
      if (!groupUser) {
        throw this.ctx.getError({ msg: '当前用户不存在' });
      } else {
        // 校验用户权限
        const opGroupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.groupId, status: 1 } });
        if ((!opGroupUser || (opGroupUser.role != app.config.appConfig.roleOwner)) && obj.uid != groupUser.userId) {
          throw this.ctx.getError({ msg: '无权限操作' });
        }
        if (groupUser.role == app.config.appConfig.roleOwner) {
          // 查询是否存在其他的owner
          const userOwners = yield this.ctx.model.GroupUser.count({ where: { groupId: obj.groupId, status: 1, role: app.config.appConfig.roleOwner } });
          if (userOwners < 2) throw this.ctx.getError({ msg: '当前只有一位owner用户无法删除' });
        }
        // 存在删除信息
        let t = yield app.model.transaction();
        try {
          yield this.ctx.model.GroupUser.update({ status: 0 }, { where: { userId: obj.userId, groupId: obj.groupId } });
          yield this.ctx.model.query(`update tb_group set  user_count=user_count-1,update_time='${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' where id=:groupId and user_count-1>0 `, { transaction: t, replacements: obj });
          // 发送消息删除项目组成员
          let uids = yield this.ctx.model.query(`select user_id from tb_group_and_user where group_id=:groupId and status=1 and user_id!=:uid `, { type: 'SELECT', replacements: obj });
          uids = uids.map((value) => value.user_id);
          // 获取用户信息
          const user = yield this.ctx.model.User.findOne({ where: { id: obj.userId } });
          // 获取分组信息
          const group = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
          const title = nunjucks.renderString(noticeMessage.GROUP_DELETE_USER.title, { userName: user.name, groupName: group.name });
          const content = nunjucks.renderString(noticeMessage.GROUP_DELETE_USER.content, { userName: user.name, groupName: group.name });
          const notice = {};
          notice.createUserId = obj.uid;
          notice.content = content;
          notice.title = title;
          notice.readStatus = 1;
          notice.type = noticeMessage.GROUP_DELETE_USER.code;
          notice.joinId = group.id;
          yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeGroup);
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
      wheres.groupId = obj.groupId;
      wheres.status = 1;
      const groupUsers = yield this.ctx.model.GroupUser.findAll({ where: wheres });
      if (!groupUsers) return null;
      let userIds = [];
      let tempGroupUser = {};
      groupUsers.forEach(function(e) {
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
      if (obj.role != app.config.appConfig.roleOwner && obj.role != app.config.appConfig.roleMaster && obj.role != app.config.appConfig.roleDev) {
        throw this.ctx.getError({ msg: '参数有误' });
      }
      // 查询是否已插入
      const groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.userId, groupId: obj.groupId, status: 1 } });
      if (!groupUser) {
        // 不存在
        throw this.ctx.getError({ msg: '当前用户不存在' });
      } else {
        // 存在则修改
        // 校验用户权限
        const opGroupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: obj.uid, groupId: obj.groupId, status: 1 } });
        if (!opGroupUser || (opGroupUser.role != app.config.appConfig.roleOwner)) {
          throw this.ctx.getError({ msg: '无权限操作' });
        }
        if (groupUser.role == app.config.appConfig.roleOwner) {
          if (obj.role != app.config.appConfig.roleOwner) {
            // 查询是否存在其他的owner
            const userOwners = yield this.ctx.model.GroupUser.count({ where: { groupId: obj.groupId, status: 1, role: app.config.appConfig.roleOwner } });
            if (userOwners < 2) throw this.ctx.getError({ msg: '当前只有一位owner用户无法修改为其他权限' });
          }
        }
        yield this.ctx.model.GroupUser.update({ role: obj.role, status: 1 }, { where: { userId: obj.userId, groupId: obj.groupId } });

        // 发送消息修改项目组内的权限
        let uids = yield this.ctx.model.query(`select user_id from tb_group_and_user where group_id=:groupId and status=1`, { type: 'SELECT', replacements: obj });
        uids = uids.map((value) => value.user_id);
        // 获取用户信息
        const user = yield this.ctx.model.User.findOne({ where: { id: obj.userId } });
        // 获取分组信息
        const group = yield this.ctx.model.Group.findOne({ where: { id: obj.groupId } });
        const title = nunjucks.renderString(noticeMessage.GROUP_ROLE_USER.title, { userName: user.name, groupName: group.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
        const content = nunjucks.renderString(noticeMessage.GROUP_ROLE_USER.content, { userName: user.name, groupName: group.name, role: this.ctx.helper.tools.getGroupRole(obj.role - 0) });
        const notice = {};
        notice.createUserId = obj.uid;
        notice.content = content;
        notice.title = title;
        notice.readStatus = 1;
        notice.type = noticeMessage.GROUP_ROLE_USER.code;
        notice.joinId = group.id;
        yield this.ctx.service.base.sendNotice(uids, notice, app.config.appConfig.noticeTypeGroup);

      }
    }
  }
  return GroupUser;
};

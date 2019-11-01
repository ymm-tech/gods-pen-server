module.exports = app => {
  class BaseService extends app.Service {
    * getUserRole (uid, projectId) {
      let role = 100;
      uid = uid || (this.ctx.request && this.ctx.request.uid);
      let userProject = yield this.ctx.model.UserProject.findOne({ where: { userId: uid, projectId, status: 1 } });
      if (userProject) role = userProject.role;
      // 查询是否有分组权限
      const group = yield this.ctx.model.GroupProject.findOne({ where: { projectId, status: 1 } });
      if (group) {
        // 查询分组权限
        const groupUser = yield this.ctx.model.GroupUser.findOne({ where: { userId: uid, groupId: group.groupId, status: 1 } });
        if (groupUser) role = role < groupUser.role ? role : groupUser.role;
      } else {
        role = 100;
      }
      return role;
    }
    * sendNotice (uids, notice, noticeType) {
      if (!uids || uids.length == 0 || noticeType < 0 || !notice) return;
      for (let i = 0; i < uids.length; i++) {
        let uid = uids[ i ];
        // 查询用户信息
        const user = yield this.ctx.model.User.findOne({ where: { id: uid } });
        if (!user) continue;
        // 查询用户的通知设置
        const userNotice = yield this.ctx.model.UserNoticeType.findOne({ where: { userId: uid, type: noticeType } });
        if (!userNotice) continue;
        if (userNotice.messageNotice == 1) {
          // 发送站内信
          notice.userId = uid;
          yield this.ctx.model.UserNotice.create(notice);
        }
        if (userNotice.emailNotice == 1) {
          // 发送邮件
          this.app.sendMail({
            receivers: [ user.email ],
            tplName: 'notice',
            data: {
              content: notice.content,
            },
            callback () {},
            subject: notice.title
          });
        }
      }
    }
  }
  return BaseService;
};

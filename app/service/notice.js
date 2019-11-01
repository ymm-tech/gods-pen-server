const moment = require('moment');
module.exports = app => {
  class ProjectUser extends app.Service {

    * pullMessage (obj) {
      const data = yield this.ctx.model.query(`select id,create_user_id as userId,title,content,type,join_id as joinId,read_status as readStatus,create_time as time from tb_user_notice where user_id=${obj.uid} and read_status=${obj.readStatus} order by id desc limit 20`, { type: 'SELECT' });
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const temp = data[ i ];
          const user = yield this.ctx.model.User.findOne({ where: { id: temp.userId } });
          temp.userName = user.name;
          temp.userPhoto = user.photo;
        }
      }
      return data;
    }

    * listMessage (obj) {
      let sql = 'select title,id,create_user_id as userId,content,read_status as readStatus,type,join_id as joinId,create_time as time from tb_user_notice where ';
      if (obj.status == 1) {
        sql = sql + ' read_status = 1 and ';
      }
      if (obj.status == 2) {
        sql = sql + ' read_status = 1 and ';
      }
      if (obj.startId > 0) {
        sql = sql + ' id < ' + obj.start + ' and ';
      }
      if (obj.type == 1) {
        sql = sql + ' type <= 200 and ';
      }
      if (obj.type == 2) {
        sql = sql + ' type > 200 and type <= 300 and ';
      }
      if (obj.type == 3) {
        sql = sql + ' type > 300 and type <= 400 and ';
      }
      sql = sql + ' user_id=' + obj.uid + ' order by id desc limit ' + obj.count;
      const data = yield this.ctx.model.query(sql, { type: 'SELECT' });
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const temp = data[ i ];
          const user = yield this.ctx.model.User.findOne({ where: { id: temp.userId } });
          temp.userName = user.name;
          temp.userPhoto = user.photo;
        }
      }
      return data;
    }

    * changeReadStatus (obj) {
      yield this.ctx.model.query(` update tb_user_notice set read_status=2,update_time='${moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}' where id=${obj.id} `);
    }

    * getMessageInfo (obj) {
      const data = yield this.ctx.model.query(`select id,create_user_id as userId,title,content,type,join_id as joinId,read_status as readStatus,create_time as time from tb_user_notice where id=${obj.id}`, { type: 'SELECT' })
      return data[0];
    }

    * getMessageNums (obj) {
      const data = yield this.ctx.model.query(`select count(id) as total,IFNULL(sum(case when type <= 200 then 1 else 0 end),0) as groups,IFNULL(sum(case when type > 200 and type <= 300 then 1 else 0 end),0) as project,IFNULL(sum(case when type > 300 and type <= 400 then 1 else 0 end),0) as api from tb_user_notice where user_id=${obj.uid} and read_status = 1 `, { type: 'SELECT' })
      return data[0];
    }

    * getNoticeType (obj) {
      const data = yield this.ctx.model.query(`select type,message_notice as messageNotice,email_notice as emailNotice from tb_user_notice_type where user_id=${obj.uid}`, { type: 'SELECT' })
      return data[0];
    }

    * updateNoticeType (obj) {
      let sql = ' update tb_user_notice_type set ';
      if (obj.noticeType == 'message') {
        sql = sql + 'message_notice = ' + obj.noticeType + ' , update_time=' + moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
      } else if (obj.noticeType == 'email') {
        sql = sql + 'email_notice = ' + obj.noticeType + ' , update_time=' + moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
      }
      sql = sql + 'where user_id=' + obj.uid + ' and type=' + obj.categoryType;
      yield this.ctx.model.query(sql);
    }
  }
  return ProjectUser;
};

/**
 * Created with WebStorm.
 * User: kevan
 * Email:258137678@qq.com
 * Date: 2017/5/3
 * Time: 上午9:30
 * To change this template use File | Settings | File Templates.
 */
var md5 = require('md5');
'use strict'
module.exports = app => {
  class Resources extends app.Service {
    * info (obj) {
      var item = yield this.ctx.model.Resources.findOne({ where: { id: obj.id, userId: obj.uid } })
      var query = {
        id: obj.id,
        categoryId: item.categoryId
      }
      let tags = yield this.ctx.model.query(`select 
      t.id,
      t.name 
      from tb_res_tags_rel rel
      left join tb_tags t on t.id=rel.tid 
      where rel.rid =:id and cid=:categoryId
      `, { type: 'SELECT', replacements: query })
      item.dataValues.tags = tags
      return item
    }

    * list (query) {
      // 查询条件
      var sqlQuery = `(r.visibilitylevel=1 or r.user_id=:uid ) and r.status=1`
      if (query.categoryId) {
        sqlQuery = sqlQuery + ` and r.category_id=:categoryId`;
      }
      if (query.name) {
        query.name = `%${query.name}%`
        sqlQuery = sqlQuery + ` and r.name like :name`;
      }
      if (query.tags && query.tags.length != 0) {
        sqlQuery += ` and t.id in (${query.tags.map(val => val.id).join(',')})`
        // query.tagsStr = `${query.tags.map(val => val.id).join(',')}`
        // sqlQuery += ` and t.id in (:tagsStr)`
      }
      // 分页计算
      let offset = 0, page = +query.page || 1, pageSize = +query.pageSize || 10
      if (query.page < 1) query.page = 1
      if (query.pageSize < 1) query.pageSize = 10
      offset = (page - 1) * pageSize || 0
      // 查询语句
      var sql = `SELECT 
                GROUP_CONCAT(t.name,',',t.id SEPARATOR ';') as tags, 
                r.user_id as userId,
                r.icon,
                r.desc,
                r.id,r.name,r.content,r.category_id as categoryId,r.create_time as createTime,r.update_time as updateTime   
                from tb_resources r 
                left join tb_res_tags_rel rel on r.id=rel.rid 
                left join tb_tags t on rel.tid=t.id 
                where ${sqlQuery}
                GROUP BY r.id ORDER BY r.create_time DESC LIMIT ${offset}, ${pageSize};`
      // 查询总条数
      var total = yield this.ctx.model.query(`SELECT count(r.id) as counts 
                from tb_resources r 
                left join tb_res_tags_rel rel on r.id=rel.rid 
                left join tb_tags t on rel.tid=t.id 
                where ${sqlQuery}
                GROUP BY r.id `, { type: 'SELECT', replacements: query });
      // 查询列表数据
      var list = yield this.ctx.model.query(sql, { type: 'SELECT', replacements: query }) || []
      list = list.map(it => {
        it.tags = it.tags ? ((it.tags.split(';') || []).map(t => {
          var ts = t.split(',') || []
          return { id: ts[ 1 ], name: ts[ 0 ] }
        })) : []
        return it
      })
      return { total: total.length, list };
    }

    * save (query) {
      let t = yield app.model.transaction();
      try {
        var _item = {
          name: query.name,
          categoryId: query.categoryId,
          content: query.content,
          userId: query.uid,
          desc: query.desc,
          icon: query.icon,
          visibilitylevel: query.visibilitylevel
        }
        // 如果没有用户信息，资源设为公共资源
        if (!query.uid) {
          _item.visibilitylevel = 1
        }

        // 资源信息保存或修改
        if (query.id) {
          // 编辑
          if (!(yield this.ctx.model.Resources.findOne({
              where: {
                status: 1,
                id: query.id
              }
            }))) throw this.ctx.getError({
            msg: `不存在id为${query.id}的资源`
          });
          yield this.ctx.model.Resources.update(_item, {
            where: {
              id: query.id
            }
          }, {
            transaction: t
          })
        } else {
          _item.status = 1
          var newItem = yield this.ctx.model.Resources.create(_item, {
            transaction: t
          })
          query.id = newItem.id
        }
        // 移除标签和资源的关系
        yield this.ctx.model.query(` DELETE FROM tb_res_tags_rel WHERE rid=:id and cid=:categoryId; `, {
          type: 'BULKDELETE',
          transaction: t,
          replacements: query
        });
        query.tags = query.tags || []
        console.info(query.tags)
        for (let tag of query.tags) {
          yield this.ctx.service.tags.useone({
            id: tag.id
          })
          // 绑定标签和资源的关系
          yield this.ctx.model.ResTagsRel.create({
            rid: query.id,
            tid: tag.id,
            cid: query.categoryId
          }, {
            transaction: t
          })
        }
        yield t.commit();
        return {
          id: query.id
        }

      } catch (e) {
        yield t.rollback();
        throw this.ctx.getError({
          msg: e.msg || `${query.id ? '更新失败' : '新增失败'}`,
          error: e
        });
      }
    }

    * delete (obj) {
      var item = yield this.ctx.model.Resources.findOne({ where: { id: obj.id, userId: obj.uid } })
      if (item) {
        yield this.ctx.model.Resources.update({ status: 0 }, { where: { id: obj.id, userId: obj.uid } });
        return true
      } else {
        throw this.ctx.getError({ msg: `该资源不可删除或者不是你上传的资源` });
      }
    }

    * addUseCount (obj) {
      var item = yield this.ctx.model.Resources.findOne({ where: { id: obj.id } })
      if (item) {
        var useCount = (item.useCount || 0) + 1
        yield this.ctx.model.Resources.update({ useCount }, { where: { id: obj.id } });
        return { useCount, id: item.id }
      } else {
        throw this.ctx.getError({ msg: '未查询到此资源' });
      }
    }
  }

  return Resources
}

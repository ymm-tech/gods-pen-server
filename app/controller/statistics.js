const Controller = require('egg').Controller
const co = require('co')
class StatisticsController extends Controller {

  async report () {
    const ctx = this.ctx
    const query = ctx.request.query
    /* 允许的 query构造,除此以外被放到 extras 字段上
    ** {
    **    finger_print: 'xxxxx',
          env:
          duration:
    **    app_id: 'tview',
    **    page_id: "page_7",
    **    action: "pageview",
          utm_campaign
    **    label: "red",
          html: '' // 代码片段
    ** }
    */
    let FIELDS = ['finger_print', 'env', 'app_id', 'page_id', 'action', 'utm_campaign', 'label', 'html', 'duration', '_t']
    let filteredQuery = Object.keys(query)
    .filter(k => FIELDS.indexOf(k) > -1)
    .reduce((o, k) => {
      if (k != '_t' && k != 'duration') o[k] = query[k]
      if (k == 'duration') o['durations'] = +query[k] || 0 // 类型冲突，重建索引太慢，只能换个字段名了
      delete query[k]
      return o
    }, {})
    let report = {
      referrer: ctx.get('referrer'),
      create_time: Date.now(),
      ip: ctx.ip || null,
      ua: ctx.get('User-Agent'),
      ...filteredQuery
    }
    if (Object.keys(query).length > 0) {
      report.extras = JSON.stringify(query)
    }
    if (report.action === 'pageview' && report.app_id === 'tview') {
      this.app.addPV('report')
    }
    ctx.service.statistics.report(report)
    ctx.status = 200
    ctx.body = JSON.stringify(report, null, 2)
  }

  async getPUV () {
    const ctx = this.ctx
    let rule = {
      pageId: {
        type: 'string',
        required: false
      },
      pageIds: {
        type: 'array',
        required: false
      },
      // default tview 
      appId: {
        type: 'string',
        required: false
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      interval: {
        type: 'string',
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getPUV(ctx.request.body)
    ctx.body = result 
  }

  async getPages () {
    const ctx = this.ctx
    let rule = {
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      // default tview 
      appId: {
        type: 'string',
        required: false
      },
      size: {
        type: 'int',
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getPages(ctx.request.body)
    ctx.body = result 
  }

  async getUtms () {
    const ctx = this.ctx
    let rule = {
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      pageId: {
        type: 'string',
        required: true
      },
      // default tview 
      appId: {
        type: 'string',
        required: false
      },
      size: {
        type: 'int',
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getUtms(ctx.request.body)
    ctx.body = result 
  }

  async getViewTime () {
    const ctx = this.ctx
    let rule = {
      appId: {
        type: 'string',
        required: true
      },
      pageId: {
        type: 'string',
        allowEmpty: true,
        required: false
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      utm: {
        type: 'string',
        allowEmpty: true,
        required: false
      },
      avgonly: {
        type: 'int',
        allowEmpty: true,
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getViewTime(ctx.request.body)
    ctx.body = result
  }
  
  async getActions () {
    const ctx = this.ctx
    let rule = {
      // default tview 
      appId: {
        type: 'string',
        required: false
      },
      pageId: {
        type: 'string',
        required: true
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      size: {
        type: 'int',
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getActions(ctx.request.body)
    ctx.body = result 
  }

  async actionTrack () {
    const ctx = this.ctx
    let rule = {
      // default tview 
      appId: {
        type: 'string',
        required: false
      },
      pageId: {
        type: 'string',
        required: true
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      size: {
        type: 'int',
        required: false
      },
      interval: {
        type: 'string',
        required: false
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.actionTrack(ctx.request.body)
    ctx.body = result 
  }

  async getTodayOutline () {
    const ctx = this.ctx
    let rule = {
      appId: {
        type: 'string',
        required: true
      }
    }
    ctx.validate(rule)
    let result = await ctx.service.statistics.getTodayOutline(ctx.request.body)
    ctx.body = result
  }

  async getProjectReport () {
    const ctx = this.ctx
    let rule = {
      projectId: {
        type: 'int',
        required: true
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      interval: {
        type: 'string',
        required: false
      }
    }
    ctx.validate(rule)
    let params = ctx.request.body
    let pages = await co(function * () {
      return yield ctx.service.pages.list(params)
    })
    let pageKeys = pages.map(p => p.key)
    let puv
    if (!pageKeys || !pageKeys.length) puv = {sum: {}, histogram: []}
    else puv = await ctx.service.statistics.getPUV({pageIds: pageKeys, timePeriod: params.timePeriod, interval: params.interval})
    ctx.body = Object.assign({count: pages.length}, puv)
  }
  async getGroupReport () {
    const ctx = this.ctx
    let rule = {
      groupId: {
        type: 'number',
        required: true
      },
      timePeriod: {
        type: 'array',
        itemType: 'int',
      },
      interval: {
        type: 'string',
        required: false
      }
    }
    ctx.validate(rule)
    let params = ctx.request.body
    let projects = await co(function * () {
      return yield ctx.service.project.groupProjects(params)
    })
    let projectIds = projects.map(p => p.id)
    params.projectId = projectIds
    let pages = await co(function * () {
      return yield ctx.service.pages.list(params)
    })
    let pageKeys = pages.map(p => p.key)
    let puv
    if (!pageKeys || !pageKeys.length) puv = {sum: {}, histogram: []}
    else puv = await ctx.service.statistics.getPUV({pageIds: pageKeys, timePeriod: params.timePeriod, interval: params.interval})
    ctx.body = Object.assign({pageCount: pages.length, projectCount: projects.length}, puv)
  }
}

module.exports = StatisticsController
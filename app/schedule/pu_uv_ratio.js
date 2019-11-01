const PUV_RATIO_THRESHOLD = 1.6 // 小时 pv/uv 平均1.34 最大值3.72 取1.6为告警阈值

module.exports = app => {
  return {
    schedule: {
      // interval: '1m',
      cron: '0 0 * * * *', // 每小时一次
      type: 'worker',
    },
    disable: 0,
    cronOptions: {
      tz: 'Asia/Shanghai'
    },
    async task(ctx) {
      let {sum: {pv, uv}} = await ctx.service.statistics.getPUV({pageId: '', timePeriod: [Date.now() - 3600000], utm: '', interval: 'hour', appId: 'tview'})
      let ratio = pv / uv
      if (ratio >= PUV_RATIO_THRESHOLD) {
        app.DDNotify(
          `最近一小时码良页面 \n\n 访问量 ${pv} \n\n 访问人数 ${uv} \n\n 比值 ${ratio.toFixed(2)} \n\n 注意排查是否流量异常`,
          '码良访问量/访问人数比超限告警')
      }
    }
  }
}




module.exports = {
  schedule: {
    cron: '0 0 1 * *', // 每月1号
    type: 'worker', // 随机一个 worker 执行
  },
  cronOptions: {
    tz: 'Asia/Shanghai'
  },
  disable: false,
  async task(ctx) {
    console.info('开始清理6个月前的日志')
    let status = await ctx.service.statistics.deleteIndices({monthBefore: 6})
    console.info('日志清理完成', status)
  }
}
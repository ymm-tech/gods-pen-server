module.exports = {
  schedule: {
    interval: '1m', // 1分钟间隔
    type: 'all',
  },
  async task(ctx) {
    console.info('开始执行上报打点日志定时任务')
    let status = await ctx.service.statistics.addDocs()
    console.info('结束执行上报打点日志定时任务，操作', status ? '成功' : '失败')
  }
}
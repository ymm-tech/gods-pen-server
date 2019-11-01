module.exports = app => {
  return {
    schedule: {
      // interval: '30s',
      cron: '0 0 */1 * *', // 每天零点
      type: 'all',
    },
    disable: true,
    cronOptions: {
      tz: 'Asia/Shanghai'
    },
    async task(ctx) {
      console.info('page_count_log', app.getPV())
    }
  }
}

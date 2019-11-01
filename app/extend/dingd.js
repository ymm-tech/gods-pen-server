/**
 *
 */
'use strict'
module.exports = {
  * sendNotice (data) {
    try {
      const projectInfo = yield this.ctx.model.Project.findOne({
        where: {
          id: data.projectId
        }
      })
      console.log('ddproject', projectInfo)
      let webhook = projectInfo.ddwebhook
      if (webhook) {
        let info = {
          msgtype: 'markdown',
          markdown: data.markdown,
          at: data.at
        }
        console.log(info)
        const result = yield this.ctx.curl(webhook, {
          // 必须指定 method
          method: 'POST',
          // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
          contentType: 'json',
          data: info,
          // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
          dataType: 'json'
        })
        console.log(result)
        return result
      }
    } catch (error) {
      console.log('钉钉发送消息失败', error)
    }
  }
}

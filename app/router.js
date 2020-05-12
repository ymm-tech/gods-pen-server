'use strict'
module.exports = app => {
  console.log(app.config)

  app.router.prefix('/' + app.config.API_PATH.replace(/^\/+|\/+$/g, ''))

  app.post(`/users/login`, 'user.login')
  app.post(`/users/register`, 'user.register')
  app.post(`/users/activeEmail`, 'user.activeEmail')
  app.get(`/users/sendActiveEmail`, 'user.sendActiveEmail')
  app.post(`/users/sendEmail`, 'user.sendEmail')
  app.get(`/users/info`, 'user.info')
  app.post(`/users/logout`, 'user.logout')
  app.put(`/users/edit`, 'user.edit')
  app.put(`/users/updatePassword`, 'user.updatePassword')
  app.post(`/users/newUpdatePassword`, 'user.newUpdatePassword')
  app.post(`/users/forgetPassword`, 'user.forgetPassword')
  app.get(`/users/search`, 'user.search')
  app.get(`/upload/getTocken`, 'user.getTocken')
  app.get(`/kaptcha/init`, 'kaptcha.init')

  // 第三方登录
  app.post(`/users/oauthCode`, 'user.oauthCode')
  app.post(`/users/oauthLogin`, 'user.oauthLogin')

  // 组件列表
  app.post(`/component/useone`, 'component.useone') // 组件使用次数增加
  app.post(`/component/searchByName`, 'component.searchByName') // 我的分组列表
  app.post(`/component/searchAllStatusByName`, 'component.searchAllStatusByName') // 我的分组列表
  app.post(`/component/find`, 'component.find') // 我的分组列表
  app.post(`/component/add`, 'component.save')
  app.get(`/component/info`, 'component.info') // 获取组件信息
  app.post(`/component/updata`, 'component.updata') // 更新组件信息
  app.post(`/component/delete`, 'component.delete') // 更新组件信息
  app.post(`/component/import`, 'component.import') // 组件导入

  // 分组管理
  app.delete(`/project/group`, 'group.delete')
  app.put(`/project/group`, 'group.update')
  app.get(`/project/group`, 'group.list') // 我的分组列表
  app.get(`/project/groupinfo`, 'group.info') // 特定分组详情
  app.post(`/project/group`, 'group.add')

  // 分组成员管理
  app.post(`/project/groupuser`, 'groupUser.add')
  app.delete(`/project/groupuser`, 'groupUser.delete')
  app.put(`/project/groupuser`, 'groupUser.update')
  app.get(`/project/groupuser`, 'groupUser.list')

  // 项目管理
  app.delete(`/project/project`, 'project.delete')
  app.put(`/project/project`, 'project.update')
  app.get(`/project/project`, 'project.list') // 我的项目列表
  app.get(`/project/projectinfo`, 'project.info') // 特定项目详情
  app.post(`/project/project`, 'project.add')
  app.get(`/project/groupproject`, 'project.groupProject') // 某分组项目列表
  app.post(`/project/favorateproject`, 'project.favorateProject')
  app.delete(`/project/favorateproject`, 'project.cancelFavorateProject')
  app.get(`/project/favorateproject`, 'project.getFavorateProject')

  // 项目成员管理
  app.post(`/project/projectuser`, 'projectUser.add')
  app.delete(`/project/projectuser`, 'projectUser.delete')
  app.put(`/project/projectuser`, 'projectUser.update')
  app.get(`/project/projectuser`, 'projectUser.list')

  // pages
  app.post(`/editor/pages/pvuv`, 'pages.pvuv')
  app.post(`/editor/pages/pv`, 'pages.pv')
  app.get(`/editor/pages/publiclist`, 'pages.publiclist')
  app.post(`/editor/pages/publiclist`, 'pages.publiclist')
  app.post(`/editor/pages/list`, 'pages.list')
  app.post(`/editor/pages/save`, 'pages.save')
  app.post(`/editor/pages/delete`, 'pages.delete')
  app.post(`/editor/pages/info`, 'pages.info')
  app.post(`/editor/pages/detail`, 'pages.detail')
  app.post(`/editor/pages/editor-detail`, 'pages.detail') // 编辑起调用这个，走登陆判断
  app.post(`/editor/pages/change-status`, 'pages.changeStatus')
  app.post(`/editor/pages/set-home-page`, 'pages.setHomePage')
  app.post(`/editor/pages/publish`, 'pages.publish')
  app.get(`/editor/pages/count`, 'pages.count')
  app.get(`/editor/pages/history`, 'pages.history')
  app.get(`/editor/pages/history-delete`, 'pages.historyDelete')
  app.post(`/editor/pages/history-publish`, 'pages.historyPublish')
  app.post(`/editor/pages/history-to-draft`, 'pages.historyToDraft')
  app.post(`/editor/pages/update-fork`, 'pages.updateFork')
  app.post(`/editor/pages/psd-to-page`, 'pages.psdToPage')
  app.post(`/editor/pages/featuring`, 'pages.featuringPages')
  app.post(`/editor/pages/update-featured`, 'pages.updateFeatured')

  // names
  app.post(`/editor/pages/getNameBykeys`, 'pages.getNameBykeys')
  // template
  app.post(`/editor/template/list`, 'template.list')
  app.post(`/editor/template/save`, 'template.save')
  app.post(`/editor/template/delete`, 'template.delete')
  app.post(`/editor/template/detail`, 'template.detail')
  // category
  app.post(`/editor/category/list`, 'category.list')
  app.post(`/editor/category/save`, 'category.save')
  app.post(`/editor/category/delete`, 'category.delete')
  // resources
  app.post(`/editor/resources/list`, 'resources.list')
  app.get(`/editor/resources/info`, 'resources.info')
  app.post(`/editor/resources/save`, 'resources.save')
  app.post(`/editor/resources/delete`, 'resources.delete')
  app.post(`/editor/resources/addUseCount`, 'resources.addUseCount')
  // tags
  app.post(`/editor/tags/list`, 'tags.list')
  app.post(`/editor/tags/add`, 'tags.add')
  app.post(`/editor/tags/useone`, 'tags.useone')

  app.get(`/test`, 'home.index')

  // proxy
  // img-proxy
  app.get(`/proxy/imgCors`, 'proxy.imgCorsProxy')
  // img-proxy alias
  app.get(`/cors-proxy`, 'proxy.imgCorsProxy')
  // transparent-proxy
  app.post(`/proxy/transparent`, 'proxy.transparentProxy')

  // 数据统计
  // es
  app.get(`/statistics/report`, 'statistics.report')
  app.post(`/statistics/getPUV`, 'statistics.getPUV')
  app.post(`/statistics/getPages`, 'statistics.getPages')
  app.post(`/statistics/getActions`, 'statistics.getActions')
  app.post(`/statistics/actionTrack`, 'statistics.actionTrack')
  app.post(`/statistics/getTodayOutline`, 'statistics.getTodayOutline')
  app.post(`/statistics/getUtms`, 'statistics.getUtms')
  app.post(`/statistics/getViewTime`, 'statistics.getViewTime')
  app.post(`/statistics/getProjectReport`, 'statistics.getProjectReport')
  app.post(`/statistics/getGroupReport`, 'statistics.getGroupReport')

  // ossupload
  app.post(`/ossupload/uploadByUrls`, 'ossupload.uploadByUrls')
  app.post(`/ossupload/uploadFile`, 'ossupload.uploadFile')
  
  // word to html
  app.post(`/transform/word2html`, 'proxy.word2html')
}

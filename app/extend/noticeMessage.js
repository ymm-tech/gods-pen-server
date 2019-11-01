module.exports = {
  GROUP_ADD_USER: {
    code: 101,
    title: '{{userName}}已加入项目组《{{groupName}}》',
    content: '{{userName}}已加入项目组《{{groupName}}》',
  },
  GROUP_DELETE_USER: {
    code: 102,
    title: '{{userName}}已被移除项目组《{{groupName}}》',
    content: '{{userName}}您已被移除项目组《{{groupName}}》',
  },
  GROUP_ROLE_USER: {
    code: 103,
    title: '{{userName}}对项目组《{{groupName}}》的权限变更为{{role}}',
    content: '{{userName}}对项目组《{{groupName}}》的权限变更为{{role}}',
  },
  GROUP_DELETE: {
    code: 104,
    title: '{{userName}}已删除项目组《{{groupName}}》',
    content: '{{userName}}已删除项目组《{{groupName}}》',
  },
  PROJECT_ADD_USER: {
    code: 201,
    title: '{{userName}}已加入项目《{{projectName}}》',
    content: '{{userName}}已加入项目《{{projectName}}》',
  },
  PROJECT_DELETE_USER: {
    code: 202,
    title: '{{userName}}已离开项目《{{projectName}}》',
    content: '{{userName}}已离开项目《{{projectName}}》',
  },
  PROJECT_ROLE_USER: {
    code: 203,
    title: '{{userName}}在项目《{{projectName}}》内的权限变更为{{role}}',
    content: '{{userName}}在项目《{{projectName}}》内的权限变更为{{role}}',
  },
  PROJECT_DELETE: {
    code: 204,
    title: '{{userName}}删除项目《{{projectName}}》',
    content: '{{userName}}删除项目《{{projectName}}》',
  },
  API_DELETE: {
    code: 301,
    title: '{{userName}}已删除接口【{{interfaceName}}】',
    content: '{{userName}}已删除接口【{{interfaceName}}】',
  },
  API_PUBLISH_RElEASE: {
    code: 302,
    title: '{{userName}}申请发布接口【{{interfaceName}}】',
    content: '{{userName}}申请发布接口【{{interfaceName}}】，申请备注：{{remark}}',
  },
  API_UPDATE: {
    code: 303,
    title: '{{userName}}已修改接口【{{interfaceName}}】',
    content: '{{userName}}已修改接口【{{interfaceName}}】',
  },
  API_AUDIT: {
    code: 304,
    title: '接口【{{interfaceName}}】申请发布审核{{version}}',
    content: '接口【{{interfaceName}}】申请发布审核{{version}}，审核备注：{{remark}}',
  },
  API_UPDATE_STATUS: {
    code: 305,
    title: '接口【{{interfaceName}}】被{{userName}} 修改 {{facet}} 调试结果为: {{result}}',
    content: '接口【{{interfaceName}}】被{{userName}} 修改 {{facet}} 调试结果为: {{result}}',
  },
  demo: {
    title: '申请发布接口',
    content: '## 申请人:{{userName}}\n' +
    '> 接口名称：{{interfaceName}}\n' +
    '> 接口路径：{{interfacePath}}\n' +
    '> ![screenshot](http://image.jpg)\n' +
    '> ## 10点20分发布 [天气](http://www.thinkpage.cn/) \n',
  },
  API_DING_PUBLISH_RElEASE: {
    title: '申请发布接口',
    content: '## 申请信息\n\n' +
    '> 申请人：{{userName}}\n\n' +
    '> 接口名称：{{interfaceName}}\n\n' +
    '> 接口路径：{{interfacePath}}\n\n' +
    '> ## [点击查看详情]({{url}}) \n\n' +
    '## 备注 \n\n' +
    '> {{remark}}\n\n'
  },
  API_DING_API_AUDIT: {
    title: '接口文档变动',
    content: '## 变动信息 {{status}}\n\n' +
    '> 接口名称：{{interfaceName}}\n\n' +
    '> 接口路径：{{interfacePath}}\n\n' +
    '> ## [点击查看详情]({{url}}) \n\n' +
    '## 备注 \n\n' +
    '> {{remark}}\n\n'
  },
};

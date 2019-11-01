module.exports = {
  accessTokenKey: 'maliangtoken', // cookies的key信息
  accessTokenKeyTime: 86400 * 1000, // cookies的key有效期，毫秒数
  desKey: '2871sjks', // des加密的key
  emailActiveTime: 86400 * 1000, // 邮件激活过期时间，单位毫秒
  projectNumber: 10, // 默认可创建项目数
  groupNumber: 5, // 默认可创建分组数
  interfaceNumber: 20, // 默认可创建接口数
  favorateProjectNumber: 5, // 默认可关注的项目数
  roleOwner: 1, // 角色所有者
  roleMaster: 2, // 角色管理者
  roleDev: 3, // 角色操作者
  roleGest: 4, // 游客
  noticeTypeGroup: 1, // 消息类型组域
  noticeTypeProject: 2, // 消息类型项目域
  noticeTypeApi: 3, // 消息类型接口域
}
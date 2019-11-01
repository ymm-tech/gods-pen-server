# 码良服务端

## 配置说明

码良依赖 es、redis、mysql、邮件、oss服务，因此需要配置这些服务的信息

config/ 文件夹下存放了开发配置和生产配置

### 前期准备

除过 mysql 以外，其他服务都开箱即可使用，无需进行初始化之类的操作

**mysql 需要使用 sql/init.sql 来初始化表结构和表数据**

### 开发配置

本地开发时，使用的是配置文件为 config/config.dev.js

### 生成配置

服务器部署时，使用的是配置文件为 config/config.production.js

## 开发

开发

```bash
npm run dev
```

debug(在vscode中端点调试)

```bash
npm run debug
```

## 部署

启动服务

```bash
npm run serve
```

终止服务

```bash
npm run stop
```

查看日志

```bash
tail $HOME/logs/master-stdout.log -n 500 -f # stdout
tail $HOME/logs/master-stderr.log -n 500 -f # stderr
```

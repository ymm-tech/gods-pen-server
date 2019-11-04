
# 码良服务端



 
<p align="center"><a href="https://godspen.ymm56.com/" target="_blank" rel="noopener noreferrer"><img width="200" src="https://godspen.ymm56.com/doc/logo.png"></a></p>

<p align="center">
  <a href="https://godspen.ymm56.com/"><img src="https://img.shields.io/github/license/ymm-tech/gods-pen" alt="License"></a>
  <a href="https://godspen.ymm56.com/"><img src="https://img.shields.io/github/package-json/v/ymm-tech/gods-pen"></a>

</p>


##  :house: 官网
  
  官网： https://godspen.ymm56.com/

  使用手册： https://godspen.ymm56.com/doc/cookbook/introduce.html

  在线体验： https://godspen.ymm56.com/admin/#/home
  
  私有部署： https://godspen.ymm56.com/doc/cookbook/install.html


![](https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/ymm-maliang/access/ymm_1539588655850.png)


 <p style="font-size:18px;" align="center">:point_right: `喜欢别忘了加star支持我们，你的支持是我们坚持的动力` :point_left:</p>

## 项目构成

码良系统由3个项目构成，分别是 [gods-pen-server](https://github.com/ymm-tech/gods-pen-server) 码良服务端、

[gods-pen-admin](https://github.com/ymm-tech/gods-pen-admin) 

码良管理后台以及于7月份就已经开源的 [gods-pen](https://github.com/ymm-tech/gods-pen) 码良编辑器。


## 详细部署文档

https://godspen.ymm56.com/doc/cookbook/source.html

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

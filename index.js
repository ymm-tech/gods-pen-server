'use strict'

require('egg').startCluster({
  baseDir: __dirname,
  port: process.env.PORT || 7051
})

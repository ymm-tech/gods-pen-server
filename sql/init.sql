-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: localhost    Database: godspen_db
-- ------------------------------------------------------
-- Server version	5.7.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `godspen_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `godspen_db` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `godspen_db`;

--
-- Table structure for table `tb_category`
--

DROP TABLE IF EXISTS `tb_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_category` (
  `id` int(10) NOT NULL COMMENT '类别id',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '类别名',
  `type` int(10) NOT NULL COMMENT '分类所属（1：项目   2：模板   3：资源）',
  `status` int(5) NOT NULL DEFAULT '1' COMMENT '项目状态（0删除，1正常，2禁用）',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '类别创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '类别更改时间',
  `desc` varchar(255) DEFAULT '' COMMENT '类别描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_category`
--

LOCK TABLES `tb_category` WRITE;
/*!40000 ALTER TABLE `tb_category` DISABLE KEYS */;
INSERT INTO `tb_category` VALUES (1,'page',1,0,'2017-12-18 17:46:00','2018-09-11 15:54:16','页面'),(2,'combinedcomponent',3,1,'2017-12-18 17:47:02','2018-09-11 15:54:21','组合组件'),(3,'component',2,1,'2017-12-19 10:17:02','2018-09-11 15:55:10','组件'),(4,'image',3,1,'2018-01-18 15:02:48','2018-09-11 15:54:29','图片'),(5,'audio',3,1,'2018-01-18 15:02:58','2018-09-11 15:54:33','音频'),(6,'script',3,1,'2018-02-08 17:43:14','2018-09-11 15:54:35','脚本'),(7,'video',3,1,'2018-03-02 16:56:04','2018-09-11 15:54:39','视频');
/*!40000 ALTER TABLE `tb_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_company`
--

DROP TABLE IF EXISTS `tb_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_company` (
  `id` bigint(11) NOT NULL,
  `name` varchar(32) DEFAULT '',
  `address` varchar(64) DEFAULT '',
  `status` tinyint(1) DEFAULT '1',
  `update_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  `create_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_company`
--

LOCK TABLES `tb_company` WRITE;
/*!40000 ALTER TABLE `tb_company` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_company_and_user`
--

DROP TABLE IF EXISTS `tb_company_and_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_company_and_user` (
  `user_id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `update_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  `create_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`company_id`),
  KEY `company_id` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_company_and_user`
--

LOCK TABLES `tb_company_and_user` WRITE;
/*!40000 ALTER TABLE `tb_company_and_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_company_and_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_component`
--

DROP TABLE IF EXISTS `tb_component`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_component` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) NOT NULL COMMENT '资源名称',
  `path` text NOT NULL COMMENT '资源内容（url、脚本）',
  `user_id` bigint(10) DEFAULT NULL COMMENT '用户id，外键',
  `version` varchar(15) NOT NULL COMMENT '版本号',
  `visibilitylevel` int(5) NOT NULL DEFAULT '1' COMMENT '显示状态（0私有，1公共开放）',
  `status` int(11) unsigned DEFAULT '1' COMMENT '删除状态',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `desc` varchar(200) DEFAULT NULL COMMENT '简单描述',
  `isnew` int(11) DEFAULT NULL COMMENT '是否是最新版本  1：是 0：否',
  `usenumber` bigint(20) unsigned DEFAULT '0' COMMENT '使用量',
  `type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '组件类型，默认0，普通组件；1，flutter 组件；',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='组件列表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_component`
--

LOCK TABLES `tb_component` WRITE;
/*!40000 ALTER TABLE `tb_component` DISABLE KEYS */;
INSERT INTO `tb_component` VALUES (1,'truck/image','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/ymm-maliang/truck/image/0.1.7/index.js',1,'0.1.7',1,1,'2019-01-03 10:40:07','2019-04-22 07:04:07','图片',1,0,0),(2,'truck/text','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/ymm-maliang/truck/text/0.1.7/index.js',1,'0.1.7',1,1,'2018-11-15 05:34:09','2019-04-22 07:04:07','文本',1,0,0),(3,'truck/button','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/ymm-maliang/truck/button/0.1.6/index.js',1,'0.1.6',1,1,'2018-11-15 05:23:00','2019-04-22 07:04:07','按钮',1,0,0),(4,'truck/emptyContainer','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/emptyContainer/1.0.2/index.js',1,'1.0.2',1,1,'2018-06-11 11:02:19','2019-04-22 07:04:07','空容器节点',1,0,0),(5,'truck/richtext','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/richtext/1.1.5/index.js',1,'1.1.5',1,1,'2018-06-29 03:38:42','2019-04-22 07:04:07','富文本',1,0,0),(6,'truck/PageContainer','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/PageContainer/1.0.2/index.js',1,'1.0.2',1,1,'2018-06-11 11:01:25','2019-04-22 07:04:07','页面容器组件',1,0,0),(7,'truck/ListContainer','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/ListContainer/0.1.5/index.js',1,'0.1.5',1,1,'2018-07-30 07:52:35','2019-04-22 07:05:04','列表容器',1,0,0),(8,'truck/video','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/video/0.1.7/index.js',1,'0.1.7',1,1,'2018-06-12 00:42:50','2019-04-22 07:05:04','视频组件，用于播放视频',1,0,0),(9,'truck/audio','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/truck/audio/0.1.3/index.js',1,'0.1.3',1,1,'2018-06-12 00:46:47','2019-04-22 07:05:04','音频组件',1,0,0),(10,'truck/drumPad','https://ymm-maliang.oss-cn-hangzhou.aliyuncs.com/ymm-maliang/truck/drumPad/1.0.1/index.js',1,'1.0.1',1,1,'2018-12-27 07:43:39','2019-04-22 07:05:04','格子块，n行n列的块状区域，每个块有两个状态',1,0,0);
/*!40000 ALTER TABLE `tb_component` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_component_use`
--

DROP TABLE IF EXISTS `tb_component_use`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_component_use` (
  `cid` bigint(10) NOT NULL COMMENT '用户id，外键',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `usenumber` bigint(20) unsigned DEFAULT '0' COMMENT '使用量',
  `love` bigint(20) unsigned DEFAULT '0' COMMENT '点赞数',
  `id` bigint(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='组件列表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_component_use`
--

LOCK TABLES `tb_component_use` WRITE;
/*!40000 ALTER TABLE `tb_component_use` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_component_use` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_favorate_project`
--

DROP TABLE IF EXISTS `tb_favorate_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_favorate_project` (
  `project_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `update_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  `create_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_favorate_project`
--

LOCK TABLES `tb_favorate_project` WRITE;
/*!40000 ALTER TABLE `tb_favorate_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_favorate_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_group`
--

DROP TABLE IF EXISTS `tb_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_group` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `create_user_id` bigint(20) DEFAULT '0',
  `name` varchar(32) DEFAULT '',
  `status` tinyint(1) DEFAULT '1',
  `type` tinyint(1) DEFAULT '1' COMMENT '项目组类型, 1默认, 2新建',
  `description` varchar(100) DEFAULT '',
  `logo` varchar(200) DEFAULT '',
  `project_count` int(5) NOT NULL DEFAULT '0',
  `user_count` int(5) NOT NULL DEFAULT '0',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_group`
--

LOCK TABLES `tb_group` WRITE;
/*!40000 ALTER TABLE `tb_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_group_and_project`
--

DROP TABLE IF EXISTS `tb_group_and_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_group_and_project` (
  `project_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`group_id`),
  KEY `group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_group_and_project`
--

LOCK TABLES `tb_group_and_project` WRITE;
/*!40000 ALTER TABLE `tb_group_and_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_group_and_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_group_and_user`
--

DROP TABLE IF EXISTS `tb_group_and_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_group_and_user` (
  `user_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `role` tinyint(1) DEFAULT '1' COMMENT '用户在项目组中的角色, 1创建者, 2管理员, 3组员',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_group_and_user`
--

LOCK TABLES `tb_group_and_user` WRITE;
/*!40000 ALTER TABLE `tb_group_and_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_group_and_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_kaptcha`
--

DROP TABLE IF EXISTS `tb_kaptcha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_kaptcha` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deskey` varchar(11) DEFAULT NULL COMMENT '验证key',
  `code` varchar(255) DEFAULT NULL COMMENT '验证码',
  `expire_time` bigint(20) DEFAULT NULL COMMENT '过期时间',
  `create_time` bigint(20) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `tk` (`create_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_kaptcha`
--

LOCK TABLES `tb_kaptcha` WRITE;
/*!40000 ALTER TABLE `tb_kaptcha` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_kaptcha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_login_log`
--

DROP TABLE IF EXISTS `tb_login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_login_log` (
  `id` int(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(11) NOT NULL,
  `ip` varchar(255) DEFAULT NULL COMMENT '登录IP地址',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `INDEX_UPDATE_TIME` (`update_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_login_log`
--

LOCK TABLES `tb_login_log` WRITE;
/*!40000 ALTER TABLE `tb_login_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_login_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_login_token`
--

DROP TABLE IF EXISTS `tb_login_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_login_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(11) DEFAULT NULL COMMENT '用户ID',
  `get_time` varchar(255) DEFAULT NULL COMMENT '获取时间',
  `expire_time` varchar(255) DEFAULT NULL COMMENT '过期时间',
  `token` varchar(1023) DEFAULT NULL,
  `expires_in` int(20) NOT NULL COMMENT '有效期，单位秒',
  PRIMARY KEY (`id`),
  KEY `tk` (`token`(255)) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_login_token`
--

LOCK TABLES `tb_login_token` WRITE;
/*!40000 ALTER TABLE `tb_login_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_login_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_mock`
--

DROP TABLE IF EXISTS `tb_mock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_mock` (
  `interface_id` bigint(11) NOT NULL COMMENT '接口Id(历史接口或草稿接口)',
  `type` tinyint(4) NOT NULL COMMENT '接口类型：1-历史接口 2-草稿接口',
  `mock_request` text COMMENT '请求的mock规则',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '修改时间',
  PRIMARY KEY (`interface_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_mock`
--

LOCK TABLES `tb_mock` WRITE;
/*!40000 ALTER TABLE `tb_mock` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_mock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_pages`
--

DROP TABLE IF EXISTS `tb_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_pages` (
  `id` bigint(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '页面id, hash值',
  `key` varchar(50) DEFAULT NULL COMMENT '页面key',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '页面名',
  `image` varchar(500) DEFAULT NULL COMMENT '页面logo图片地址',
  `desc` varchar(500) DEFAULT '' COMMENT '页面描述',
  `content` mediumtext COMMENT '页面json数据',
  `draft` mediumtext COMMENT '页面json数据-草稿',
  `project_id` bigint(10) DEFAULT NULL COMMENT '项目id，外键',
  `is_home_page` int(11) NOT NULL DEFAULT '0' COMMENT '是否为首页 （0否   1是）',
  `status` int(5) NOT NULL DEFAULT '1' COMMENT '页面状态（0删除，1正常，2禁用）',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '页面创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '页面更改时间',
  `visibilitylevel` int(5) NOT NULL DEFAULT '1' COMMENT '显示状态（0私有，1公共开放）',
  `type` tinyint(1) unsigned zerofill NOT NULL DEFAULT '0' COMMENT '页面类型，默认0，普通页面；1，flutter 页面；',
  `fork` int(1) unsigned zerofill NOT NULL DEFAULT '0' COMMENT '页面fork数量',
  `featured` int(1) DEFAULT '0' COMMENT '加精 0 未处理 1 精选 2 一般 ',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `Index` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='abc';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_pages`
--

LOCK TABLES `tb_pages` WRITE;
/*!40000 ALTER TABLE `tb_pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_pages_history`
--

DROP TABLE IF EXISTS `tb_pages_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_pages_history` (
  `id` bigint(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '页面id, hash值',
  `content` mediumtext COMMENT '页面json数据',
  `page_id` bigint(10) DEFAULT NULL COMMENT '页面id，外键',
  `status` int(5) NOT NULL DEFAULT '1' COMMENT '历史状态（0删除，1正常）',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '页面创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '页面更改时间',
  `user_id` bigint(10) DEFAULT NULL COMMENT '操作人id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面历史记录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_pages_history`
--

LOCK TABLES `tb_pages_history` WRITE;
/*!40000 ALTER TABLE `tb_pages_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_pages_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_project`
--

DROP TABLE IF EXISTS `tb_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_project` (
  `id` bigint(10) NOT NULL AUTO_INCREMENT COMMENT '项目id, hash值',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '项目名',
  `key` varchar(50) NOT NULL DEFAULT '' COMMENT ' ',
  `category_id` int(10) DEFAULT NULL COMMENT '项目的类别（外链，与tb_category相关联）',
  `desc` varchar(500) DEFAULT '' COMMENT '项目描述',
  `image` varchar(500) DEFAULT '' COMMENT '项目logo图片地址',
  `status` int(5) NOT NULL DEFAULT '1' COMMENT '项目状态（0删除，1正常，2禁用）',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '项目创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '项目更改时间',
  `visibilitylevel` int(5) NOT NULL DEFAULT '1' COMMENT '显示状态（0私有，1公共开放）',
  `create_user_id` bigint(20) DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_project`
--

LOCK TABLES `tb_project` WRITE;
/*!40000 ALTER TABLE `tb_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_res_tags_rel`
--

DROP TABLE IF EXISTS `tb_res_tags_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_res_tags_rel` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `rid` bigint(20) NOT NULL COMMENT '资源表外键',
  `tid` bigint(20) DEFAULT NULL COMMENT '标签表外键',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cid` bigint(20) DEFAULT NULL COMMENT '标签分类id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_res_tags_rel`
--

LOCK TABLES `tb_res_tags_rel` WRITE;
/*!40000 ALTER TABLE `tb_res_tags_rel` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_res_tags_rel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_resources`
--

DROP TABLE IF EXISTS `tb_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_resources` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `category_id` int(11) NOT NULL COMMENT '分类',
  `name` varchar(50) DEFAULT NULL COMMENT '资源名称',
  `content` text COMMENT '资源内容（url、脚本）',
  `status` int(11) DEFAULT NULL COMMENT '1正常   0删除',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `visibilitylevel` int(5) NOT NULL DEFAULT '1' COMMENT '显示状态（0私有，1公共开放）',
  `user_id` bigint(10) DEFAULT NULL COMMENT '用户id，外键',
  `icon` varchar(200) DEFAULT NULL COMMENT '对应icon图标',
  `use_count` bigint(10) DEFAULT '0' COMMENT '使用量',
  `desc` text COMMENT '资源内容（url、脚本）',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_resources`
--

LOCK TABLES `tb_resources` WRITE;
/*!40000 ALTER TABLE `tb_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_role`
--

DROP TABLE IF EXISTS `tb_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_role` (
  `id` int(4) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(32) NOT NULL COMMENT '角色名称',
  `alias_number` varchar(32) NOT NULL COMMENT '编号',
  `remark` varchar(100) DEFAULT NULL COMMENT '备注信息',
  `del_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '删除状态：1-未删除 2-已删除',
  `create_time` bigint(20) unsigned NOT NULL COMMENT '创建时间',
  `update_time` bigint(20) unsigned NOT NULL COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='角色信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_role`
--

LOCK TABLES `tb_role` WRITE;
/*!40000 ALTER TABLE `tb_role` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_tags`
--

DROP TABLE IF EXISTS `tb_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_tags` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) NOT NULL COMMENT '资源名称',
  `category_id` int(11) NOT NULL COMMENT '分类',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '1正常   0删除',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usenumber` int(11) NOT NULL DEFAULT '1' COMMENT '使用次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tb_template`
--

DROP TABLE IF EXISTS `tb_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_template` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '模板id',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '模板名',
  `category_id` int(10) NOT NULL COMMENT '模板的类别（外链，与tb_category相关联）',
  `content` text COMMENT '模板内容',
  `status` int(5) NOT NULL DEFAULT '1' COMMENT '模板状态（0删除，1正常，2禁用）',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '模板创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '模板更改时间',
  `desc` varchar(255) DEFAULT '' COMMENT '模板描述',
  `image` varchar(255) DEFAULT '' COMMENT '模板图片',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_template`
--

LOCK TABLES `tb_template` WRITE;
/*!40000 ALTER TABLE `tb_template` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user`
--

DROP TABLE IF EXISTS `tb_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(64) DEFAULT '',
  `email_status` tinyint(4) DEFAULT '1' COMMENT '邮箱激活状态 1-未激活 2-已激活',
  `name` varchar(255) DEFAULT NULL COMMENT '姓名',
  `telephone` varchar(16) DEFAULT '',
  `photo` varchar(100) DEFAULT NULL COMMENT '头像地址',
  `project_count` int(11) DEFAULT '0',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `oauth` varchar(64) DEFAULT NULL COMMENT '第三方登录鉴权id：渠道_id',
  `role` tinyint(1) DEFAULT '0' COMMENT '权限 0 普通用户 1 管理员 其他未定可扩展',
  PRIMARY KEY (`id`),
  KEY `searchEmail` (`email`) USING BTREE,
  KEY `searchName` (`name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user`
--

LOCK TABLES `tb_user` WRITE;
/*!40000 ALTER TABLE `tb_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user_and_project`
--

DROP TABLE IF EXISTS `tb_user_and_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user_and_project` (
  `project_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `role` tinyint(1) DEFAULT '1' COMMENT '用户在项目中的角色, 1Owner, 2Master, 3Dev, 4Guest',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_favor` tinyint(1) DEFAULT '0' COMMENT '是否关注，0未关注，1已关注',
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user_and_project`
--

LOCK TABLES `tb_user_and_project` WRITE;
/*!40000 ALTER TABLE `tb_user_and_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user_and_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user_grade`
--

DROP TABLE IF EXISTS `tb_user_grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user_grade` (
  `user_id` bigint(11) unsigned NOT NULL COMMENT '用户ID,为主键',
  `project_num` int(4) DEFAULT NULL COMMENT '剩余可创建的项目数',
  `group_num` int(4) DEFAULT NULL COMMENT '剩余可创建的组数目',
  `interface_num` int(4) DEFAULT NULL COMMENT '剩余可创建的接口数',
  `favorate_project_num` int(11) DEFAULT NULL COMMENT '关注项目数',
  `create_time` timestamp NULL DEFAULT NULL,
  `update_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user_grade`
--

LOCK TABLES `tb_user_grade` WRITE;
/*!40000 ALTER TABLE `tb_user_grade` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user_grade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user_login`
--

DROP TABLE IF EXISTS `tb_user_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user_login` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `password` varchar(64) DEFAULT '',
  `user_id` bigint(11) DEFAULT NULL COMMENT '用户信息表ID',
  `email` varchar(50) DEFAULT '',
  `status` tinyint(1) DEFAULT '1' COMMENT '是否可用状态：1-可用 2-不可用',
  `last_ip` varchar(20) DEFAULT NULL COMMENT '上次登录IP',
  `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上次登录时间',
  `sso_uid` bigint(20) DEFAULT '0' COMMENT 'SSO登录映射用户ID',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `security` varchar(64) DEFAULT '' COMMENT '秘钥信息',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user_login`
--

LOCK TABLES `tb_user_login` WRITE;
/*!40000 ALTER TABLE `tb_user_login` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user_notice`
--

DROP TABLE IF EXISTS `tb_user_notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user_notice` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_user_id` bigint(11) DEFAULT NULL COMMENT '通知创建者ID',
  `user_id` bigint(11) DEFAULT NULL COMMENT '用户ID',
  `content` varchar(255) DEFAULT NULL COMMENT '消息内容',
  `title` varchar(50) DEFAULT NULL COMMENT '消息标题',
  `read_status` tinyint(1) DEFAULT '1' COMMENT '读取状态：1-未读 2-已读取',
  `type` int(4) DEFAULT NULL COMMENT '消息类型 ：101-用户添加组 102-组移除用户 103-组内用户权限变动 201-用户添加项目 202-项目移除成员 203-项目内成员权限变动 301-删除接口 302-接口发布申请 303-接口修改 304-审核接口',
  `join_id` bigint(11) DEFAULT NULL COMMENT '关联ID(取值 项目ID、分组ID、接口ID、审核日志ID)',
  `create_time` timestamp NULL DEFAULT NULL,
  `update_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user_notice`
--

LOCK TABLES `tb_user_notice` WRITE;
/*!40000 ALTER TABLE `tb_user_notice` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user_notice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user_notice_type`
--

DROP TABLE IF EXISTS `tb_user_notice_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user_notice_type` (
  `user_id` bigint(11) NOT NULL COMMENT '用户ID',
  `type` tinyint(1) NOT NULL COMMENT '类别：1-项目域 2-接口域',
  `message_notice` tinyint(1) DEFAULT '1' COMMENT '站内信是否开启通知：1-开启 2-不开启',
  `email_notice` tinyint(1) DEFAULT '2' COMMENT '邮件通知：1-开启 2-不开启',
  `create_time` timestamp NULL DEFAULT NULL,
  `update_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user_notice_type`
--

LOCK TABLES `tb_user_notice_type` WRITE;
/*!40000 ALTER TABLE `tb_user_notice_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_user_notice_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_valid_code`
--

DROP TABLE IF EXISTS `tb_valid_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_valid_code` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `code` varchar(255) DEFAULT NULL COMMENT '验证码',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `expire_time` timestamp NULL DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_valid_code`
--

LOCK TABLES `tb_valid_code` WRITE;
/*!40000 ALTER TABLE `tb_valid_code` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_valid_code` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-01  8:29:43

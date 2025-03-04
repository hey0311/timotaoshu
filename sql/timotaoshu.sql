/*
Navicat MySQL Data Transfer

Source Server         : 本地连接
Source Server Version : 50727
Source Host           : localhost:3306
Source Database       : timotaoshu

Target Server Type    : MYSQL
Target Server Version : 50727
File Encoding         : 65001

Date: 2019-09-19 23:36:39
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '书名 - keywords',
  `author` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `description` mediumtext COLLATE utf8mb4_unicode_ci COMMENT '描述',
  `originUrl` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源网址',
  `imgUrl` mediumtext COLLATE utf8mb4_unicode_ci COMMENT '图片地址',
  `type` int(10) NOT NULL DEFAULT '1' COMMENT '类型\r\n1：爬了章节名，未爬内容 也未填充作者描述来源等  默认\r\n2：填充作者描述来源等。\r\n3：内容已经爬完\r\n\r\n\r\n\r\n4：来源本站',
  `updateTime` datetime DEFAULT NULL COMMENT '小说更新时间\r\n对应被爬取网站的更新时间\r\n',
  `bookStatus` int(10) NOT NULL DEFAULT '1' COMMENT '小说状态\r\n默认1\r\n1：连载\r\n2：完本\r\n\r\n3：本站连载\r\n4：本站完结',
  `bookType` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说类型\r\n直接爬\r\n都市言情\r\n玄幻小说\r\n…….\r\n',
  `reptileType` int(10) DEFAULT '1' COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool2表里的id\r\n\r\n\r\n\r\n0表示来源本站',
  `isJin` int(10) NOT NULL DEFAULT '1' COMMENT '1、启用\r\n2、禁用\r\n\r\n默认1\r\n',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of book
-- ----------------------------

INSERT INTO `book` VALUES ('1', 'fish food', '作者', '描述', 'https://www.ebay.co.uk/sch/i.html?_nkw=vintage+wooden+desk+tidy&_sop=12','','2','2022-06-15','1','1','2','1');
INSERT INTO `book` VALUES ('2', 'phone grass', '作者', '描述', 'https://www.ebay.co.uk/sch/i.html?_nkw=vintage+wooden+desk+tidy&_sop=12','','2','2022-06-15','1','1','2','1');

-- ----------------------------
-- Table structure for keyword
-- ----------------------------
DROP TABLE IF EXISTS `keywords`;
CREATE TABLE `keywords` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关键词',
  `active` int(10) NOT NULL DEFAULT '1' COMMENT '1、启用\r\n2、禁用\r\n\r\n默认1\r\n',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for progresserror
-- ----------------------------
DROP TABLE IF EXISTS `keywordsprogress`;
CREATE TABLE `keywordsprogress` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一 错误id',
  `keywordsId` int(40) NOT NULL COMMENT '关键词id',
  `ruleId` int(10) DEFAULT NULL COMMENT '规则id',
  `finishPage` int(10) DEFAULT NULL COMMENT '爬取完的页数',
  `finished` int(10) NOT NULL DEFAULT '0' COMMENT '是否完成',
  PRIMARY KEY (`id`),
  KEY `keywordsId` (`keywordsId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ----------------------------
-- Table structure for catalog
-- ----------------------------
DROP TABLE IF EXISTS `catalog`;
CREATE TABLE `catalog` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `bookId` int(10) NOT NULL COMMENT '外键跟book表的id绑定',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '章节名',
  `num` int(10) NOT NULL COMMENT '章节序号\r\n章节序号可以重复\r\n\r\n第一章 我的世界\r\n',
  `type` int(10) NOT NULL DEFAULT '1' COMMENT '类型\r\n1： 普通，章节名前有序号\r\n2： 特殊，章节名前没序号\r\n默认1\r\n',
  `createTime` datetime NOT NULL COMMENT '第一次时间',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  `isJin` int(10) NOT NULL DEFAULT '2' COMMENT '是否禁用\r\n1：禁用，页面上不显示该章节\r\n2：不禁用，页面上显示该章节\r\n默认2\r\n',
  `isReptileTool` int(10) NOT NULL DEFAULT '2' COMMENT '是否是爬取来的\r\n1：不是爬取的，后来新增的\r\n2：爬取的，就算后来改了这个章节，也没事。这里是做连载的标识\r\n\r\n默认2\r\n',
  `reptileAddress` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '爬取的地址\r\n为空则表示不是爬取来的\r\n不为空则是爬取的地址（地址里若没有http的话，那则是要跟book表的OriginUrl字段搭配）\r\n',
  PRIMARY KEY (`id`),
  KEY `bookId` (`bookId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of catalog
-- ----------------------------

-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `catalogcontent`;
CREATE TABLE `catalogcontent` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `content` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL COMMENT '小说id',
  `num` int(11) DEFAULT NULL COMMENT '序号',
  `shopUrl` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '爬取的地址\r\n为空则表示不是爬取来的\r\n不为空则是爬取的地址（地址里若没有http的话，那则是要跟book表的OriginUrl字段搭配）\r\n',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookId` (`bookId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `email`;
CREATE TABLE `email` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `keywordsId` int(11) DEFAULT NULL COMMENT '小说id',
  `ruleId` int(11) DEFAULT NULL COMMENT '小说id',
  `email` varchar(50) UNIQUE COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bizName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shopUrl` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sendStatus` int(11) DEFAULT '0' COMMENT '是否已发送',
  `reptileTime` datetime DEFAULT NULL COMMENT '小说更新时间\r\n对应被爬取网站的更新时间\r\n',
  `sendTime` datetime DEFAULT NULL COMMENT '小说更新时间\r\n对应被爬取网站的更新时间\r\n',
  PRIMARY KEY (`id`),
  KEY `keywordsId` (`keywordsId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `emailbox`;
CREATE TABLE `emailbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `email` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` int(11) DEFAULT '2' COMMENT '是否启用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `emailbox` VALUES ('1', 'info@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('2', 'sales02@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('3', 'sales03@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('4', 'sales04@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('5', 'sales05@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('6', 'sales06@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('7', 'sales07@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('8', 'sales08@buyshiphere.com', 1);
INSERT INTO `emailbox` VALUES ('9', 'sales09@buyshiphere.com', 1);
-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `emailblack`;
CREATE TABLE `emailblack` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `email` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` int(11) DEFAULT '0' COMMENT '是否启用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `emailwhite`;
CREATE TABLE `emailwhite` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `email` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` int(11) DEFAULT '0' COMMENT '是否启用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for catalogcontent
-- ----------------------------
DROP TABLE IF EXISTS `emailtemplate`;
CREATE TABLE `emailtemplate` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` varchar(9999) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` int(11) DEFAULT '1' COMMENT '是否启用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ----------------------------
-- Records of catalogcontent
-- ----------------------------

-- ----------------------------
-- Table structure for errortask
-- ----------------------------
DROP TABLE IF EXISTS `errortask`;
CREATE TABLE `errortask` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一 错误id',
  `keywordsId` int(40) NOT NULL COMMENT '小说id',
  `ruleId` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  `uri` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '爬取的地址\r\n为空则表示不是爬取来的\r\n不为空则是爬取的地址（地址里若没有http的话，那则是要跟book表的OriginUrl字段搭配）\r\n',
  `retryCount` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  `pageType` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  `page` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  `sequence` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  PRIMARY KEY (`id`),
  KEY `keywordsId` (`keywordsId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT INTO `errortask` VALUES ('1', '1', '1', 'https://www.ebay.de/sch/i.html?_from=R40&_nkw=phone&_sacat=0&_pgn=4', 0,1,2,3);
-- INSERT INTO `errortask` VALUES ('2', '2', '2', 'https://www.ebay.co.uk/itm/293003136667?hash=item4438590e9b:g:TQUAAOSwZbJe3SlN&amdata=enc%3AAQAHAAAA4KnDnOqS%2BbMQ%2Bq4LiYsIjD1F9HucD4gn7kgDKMqRFfF1IUU6jPbgkzrK%2BiDZsJDqUIXjP277tmbKEA9WCQzbtlcn21KBXuzBikPSdt6zQFFuFYzsTZMXdQaTCuOrVZLEH%2FtljPBn30GN00J9UiB97LyWhf3j1%2Bk4h0vKiDmYcN4F%2FsLaKkfxJcPK%2B2waeKiDrfLqo4IrpLE%2FKhmL9ZoMWHWBSJT9lRqdJvrWf46Akkm9tQLx4Yc%2FvkWZgA8E2c7QmqGbk0OMLdO%2BlWhFq9BzYNEujfJXEAiu603ufKHnJmmC%7Ctkp%3ABFBMyJCU9a5g', 0,2,4,5);
-- INSERT INTO `errortask` VALUES ('3', '1', '2', 'https://www.ebay.co.uk/usr/the-aqua-shack?_trksid=p2047675.m3561.l2559', 0,3,8,3);
-- ----------------------------
-- Table structure for progresserror
-- ----------------------------
DROP TABLE IF EXISTS `progresserror`;
CREATE TABLE `progresserror` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一 错误id',
  `reptileType` int(10) DEFAULT NULL COMMENT '来源名称/来源类型\r\n默认1\r\n\r\n对应reptileTool表里的id\r\n',
  `originUrl` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源网址',
  `bookId` int(40) NOT NULL COMMENT '小说id',
  `catalogId` int(40) NOT NULL COMMENT '章节id',
  `reptileAddress` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '爬取的地址\r\n为空则表示不是爬取来的\r\n不为空则是爬取的地址（地址里若没有http的话，那则是要跟book表的OriginUrl字段搭配）\r\n',
  `Isjin` int(10) NOT NULL DEFAULT '2' COMMENT '1、允许爬取\r\n2、禁止爬取（错误没解决之前都是禁止爬取.）\r\n默认2\r\n',
  `bookName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '书名',
  `catalogName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '章节名称',
  PRIMARY KEY (`id`),
  KEY `bookId` (`bookId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of progresserror
-- ----------------------------

-- ----------------------------
-- Table structure for reptiletool
-- ----------------------------
DROP TABLE IF EXISTS `reptiletool`;
CREATE TABLE `reptiletool` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `codeType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '编码格式，\r\nGbk，utf-8\r\n',
  `remark` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '笔趣阁，笔趣岛，起点',
  `originUrl` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '主站网址',
  `bookName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '书名爬虫标记',
  `author` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者名爬虫标记',
  `imgUrl` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图片地址爬虫',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of reptiletool
-- ----------------------------

-- ----------------------------
-- Table structure for reptiletool2
-- ----------------------------
DROP TABLE IF EXISTS `reptiletool2`;
CREATE TABLE `reptiletool2` (
  `reptileTypeId` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '爬取配置Id',
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '页面编码格式',
  `name` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注名称',
  `baseUrl` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源地址',
  `codeTransform` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '页面转码方式，用于搜索转码方式',
  `searchUrl` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '搜索地址',
  `searchList` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表',
  `searchListStart` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页   第一本小说从哪里开始      索引值从0开始',
  `searchListEnd` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页   最后几条不是小说',
  `searchListTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页  小说标题',
  `searchListUrl` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页  小说详情url地址',
  `searchListAuthor` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页  小说作者',
  `searchListStatus` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页   小说状态',
  `searchListLastTime` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搜索到的列表页   小说最后更新时间',
  `bookTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说名称',
  `bookAuthor` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说作者',
  `updateTime` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后更新时间',
  `bookType` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说分类',
  `isPage` varchar(60) CHARACTER SET utf8mb4 DEFAULT '' COMMENT '目录是否是分页标识',
  `nextPage` varchar(60) CHARACTER SET utf8mb4 DEFAULT '' COMMENT '目录下一页标识',
  `nowPage` varchar(60) CHARACTER SET utf8mb4 DEFAULT '' COMMENT '当前页数',
  `allPage` varchar(60) CHARACTER SET utf8mb4 DEFAULT '' COMMENT '总页数',
  `originUrlBefore` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '用小说目录的url地址做章节url前缀    默认 1\r\n用小说主站url地址做章节url前缀   2\r\n不使用前缀，3（一般默认1，老代码里会判断http，然后再判断是否url前缀。）',
  `userAgent` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT 'pc' COMMENT 'pc、mobile\r\n\r\n请求头用pc端的user-agent还是移动端的user-agent\r\n\r\n默认pc',
  `catalogList` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '目录列表',
  `firstCatalogList` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '第一个索引值',
  `endCatalogList` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后一个索引值',
  `bookImgUrl` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说封面地址',
  `bookDescription` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说目录页  小说详情',
  `catalogContent` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小说章节详情',
  `isSearch` int(10) DEFAULT '2' COMMENT '是否启用\r\n1、  启用\r\n2、  禁用',
  `catalogListUrl` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catalogTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catalogUrl` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '原因，多用于禁用原因',
  PRIMARY KEY (`reptileTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of reptiletool2
-- ----------------------------

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `roleName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `permission` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '权限\r\n\r\n1,2,3,4,5,6,7,8',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', '超级管理员', 'all');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一',
  `pwd` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `mobile` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号，唯一',
  `roleId` int(10) NOT NULL DEFAULT '1014' COMMENT '指向role里的id',
  PRIMARY KEY (`id`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `roleId` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'fangcuizhu', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'fangcuizhu123', '1');
INSERT INTO `users` VALUES ('2', 'heyong', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'heyong123', '1');

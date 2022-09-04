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
DROP TABLE IF EXISTS `shopurl`;
CREATE TABLE `shopurl` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键，自增长，唯一',
  `shopurl` varchar(200) UNIQUE COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'subject',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of book
-- ----------------------------

const schedule = require('node-schedule')
const { oauth, tool, log, wss } = require('../tool/require')
const { reptileService, ipReptileService, logService } = require('../service/')
const { redisData } = require('../../common/tool/tool')
const { REPTILE_STATUS } = require('../../common/tool/constant')
const reptileIp = require('../reptileTools/reptileIp')
const reptileAllKeywords = require('../reptileTools/reptileAllKeywords')
const batchSendEmail = require('../service/sendEmail/batchSendEmail')
const receiveEmailService = require('../service/receiveEmail/receiveEmailService')
const sendToRobot = require('../service/receiveEmail/sendToRobot')
const freeEmailBox = require('../service/receiveEmail/freeEmailBox')
const { startErrorTasks } = require('../service/reptile')
const { IS_LOCAL, ABLE_REPTILE } = require('../../config/config')

if (IS_LOCAL && ABLE_REPTILE) {
  reptileIpJob()
  reptileErrorTaskJob()
  reptileKeywordsJob()
} 
if(!IS_LOCAL){
  freeMailJob()
  sendRobotJob()
  sendMailJob()
logJob()
}
function reptileKeywordsJob2() {
  let rule7 = new schedule.RecurrenceRule()
  rule7.minute = []
  let i7 = 1,
    length7 = 30
  for (i3; i3 < length3; i3++) {
    rule3.minute.push(i3 * 2)
  }
  let j7 = schedule.scheduleJob(rule7, function () {
    log.debug('定时任务7：爬取搜索页.' + new Date().Format())
    // 取出所有ip,判断有效数量
    // reptileIp().then((res) => {
    //   log.debug(`定时任务3.5完成`)
    // })
    reptileAllKeywords().then((res) => {
      log.debug(`定时任务7完成`)
    })
  })
}
/**
 * 爬取ip
 */
function reptileIpJob() {
  let rule = new schedule.RecurrenceRule()
  rule.second = [0, 20, 40, 59]
  rule.minute = []
  for (let i = 0; i < 60; i++) {
    rule.minute.push(i)
  }
  let j = schedule.scheduleJob(rule, function () {
    log.debug('定时任务1：检查ip.' + new Date().Format())
    // 取出所有ip,判断有效数量
    reptileIp().then((res) => {
      log.debug(`定时任务1完成`)
    })
  })
}
/**爬取关键词
 *
 */
function reptileKeywordsJob() {
  let ruleKeywordsTask = new schedule.RecurrenceRule()
  ruleKeywordsTask.second = [1, 15, 30, 45]
  let jKeywordsTask = schedule.scheduleJob(ruleKeywordsTask, function () {
    log.debug('定时任务：添加关键词爬取.' + new Date().Format())
    reptileAllKeywords().then((res) => {
      log.debug(`定时任务完成,添加关键词爬取`)
    })
  })
}
/**
 * 爬取错误记录
 */
function reptileErrorTaskJob() {
  let ruleErrorTask = new schedule.RecurrenceRule()
  ruleErrorTask.second = [1, 30]
  let jErrorTask = schedule.scheduleJob(ruleErrorTask, function () {
    log.debug('定时任务：添加错误爬取.' + new Date().Format())
    startErrorTasks().then((res) => {
      log.debug(`定时任务完成,添加错误爬取`)
    })
  })
}
// 同步远程数据库
// let ruleSync= new schedule.RecurrenceRule()
//  ruleSync.minute = [58]
// ruleSync.hour = [14]
// let jSync= schedule.scheduleJob(ruleSync, function () {
//   log.debug('定时任务：同步远程数据库.' + new Date().Format())

//   freeEmailBox().then((res) => {
//     log.debug(`定时任务:同步远程数据库完成`)
//   })
// })
// // 发送微信消息
function freeMailJob() {
  let ruleFreeEmailBox = new schedule.RecurrenceRule()
  ruleFreeEmailBox.minute = [58]
  ruleFreeEmailBox.hour = [14]
  let jFreeEmailBox = schedule.scheduleJob(ruleFreeEmailBox, function () {
    log.debug('定时任务6：解封发件箱.' + new Date().Format())
    // sendToRobot().then((res) => {
    //   log.debug(`定时任务4完成`)
    // })
    freeEmailBox().then((res) => {
      log.debug(`定时任务6完成`)
    })
  })
}
// 发送邮件
function sendMailJob() {
  let rule9 = new schedule.RecurrenceRule()
  rule9.hour = [15, 16, 17, 18, 19, 20, 21, 22, 23]
  rule9.minute = []
  let i9 = 0,
    length9 = 60
  for (i9; i9 < length9; i9++) {
    rule9.minute.push(i9)
  }
  rule9.second = [0, 30]
  let j9 = schedule.scheduleJob(rule9, function () {
    log.debug('定时任务2：发送邮件.' + new Date().Format())
    batchSendEmail().then((res) => {
      log.debug(`定时任务2完成`)
    })
  })
  let ruleReceive = new schedule.RecurrenceRule()
  ruleReceive.hour = [
    0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ]
  ruleReceive.minute = [1, 11, 21, 31, 41, 51]
  let jReceive = schedule.scheduleJob(ruleReceive, function () {
    log.debug('定时任务3：收取邮件.' + new Date().Format())
    receiveEmailService().then((res) => {
      log.debug(`定时任务3完成`)
    })
  })
}
// 发送微信消息
function sendRobotJob() {
  let ruleMessage = new schedule.RecurrenceRule()
  ruleMessage.hour = [
    0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ]
  ruleMessage.minute = [3, 13, 23, 33, 43, 53]
  let jMessage = schedule.scheduleJob(ruleMessage, function () {
    log.debug('定时任务4：发送消息.' + new Date().Format())
    sendToRobot().then((res) => {
      log.debug(`定时任务4完成`)
    })
  })
}

/*
 * 规则4  每天凌晨3点
 * 截取所有的服务器日志
 * */
function logJob() {
  /*
   * 规则5 凌晨3点的定时任务
   * */
  let rule5 = new schedule.RecurrenceRule()
  rule5.hour = 3
  rule5.minute = 0 //必填
  let j5 = schedule.scheduleJob(rule5, async function () {
    await logService.splice(1)
    // await logService.splice(2);
    // await logService.splice(3);
    await logService.splice(4)
    // await logService.splice(5);
    // await logService.splice(6);
    // await logService.splice(7);
    // await logService.splice(8);
  })
}

module.exports = {
  // j,
  // j2
}

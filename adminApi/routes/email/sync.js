var express = require('express')
const { sleep } = require('../../../common/tool/tool')
const moment = require('moment')
var router = express.Router()
const {
  oauth,
  tool,
  db,
  log,
  reptileConfig,
  // dbRemote,
} = require('../../tool/require')

/*
 *   渠道列表
 *   page 页数
 *   limit 一页几条
 *
 * */
router.use('', oauth(4004), async function (req, res, next) {
  // try {
  //   // 取最后一条
  //   const lastEmail = await dbRemote.query(
  //     `select * from email order by reptileTime desc limit 0,1`
  //   )
  //   console.log('🚀 ~ file: sync.js ~ line 26 ~ lastEmail', lastEmail)
  //   const lastReptileTime = new Date(lastEmail[0].reptileTime)
  //   // const time = lastReptileTime.getTime()
  //   // 取本地数据库中时间更后的数据
  //   const newEmailList = await db.query(
  //     `select * from email where  UNIX_TIMESTAMP(reptileTime)>${
  //       lastReptileTime.getTime() / 1000
  //     }`
  //   )
  //   // 开始插入
  //   for (let i = 0; i < newEmailList.length; i++) {
  //     // await dbRemote.query(``)
  //     const email = newEmailList[i]
  //     try {
  //       // 先判断是否和表中的重复
  //       let sql = `select COUNT(*) from email where email="${email.email}"`
  //       let result = tool.getData(await dbRemote.query(sql))
  //       if (result) {
  //         continue
  //       }
  //       const date = moment(email.reptileTime).format('YYYY-MM-DD HH:mm:ss')
  //       let insertSql = `INSERT INTO email (email,keywordsId,ruleId,shopUrl,reptileTime,bizName,firstName,lastName,phone) VALUES `
  //       insertSql += `("${email.email}",${email.keywordsId},${email.ruleId},"${email.shopUrl}","${date}","${email.bizName}","${email.firstName}","${email.lastName}","${email.phone}")`
  //       const insertResult = await dbRemote.query(insertSql)
  //       console.log('🚀 ~ file: sync.js ~ line 51 ~ insertResult', insertResult)
  //     } catch (err) {
  //       log.error(err)
  //     }
  //   }
  //   // console.log('🚀 ~ file: sync.js ~ line 22 ~ lastEmail', lastEmail)
  //   // const countObj = await dbRemote.query(`select count(*) from email`)
  //   // const count = countObj[0]['count(*)']
  //   // console.log('🚀 ~ file: sync.js ~ line 22 ~ count', count)
  //   data = {
  //     msg: 'success',
  //   }
  //   res.send(tool.toJson(data, '', 1000))
  // } catch (err) {
  //   res.send(tool.toJson(null, err, 1002))
  // }
})

module.exports = router

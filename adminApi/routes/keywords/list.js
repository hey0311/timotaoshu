var express = require('express')
const { getRuleConfigMap } = require('../../reptileTools/ruleConfig')
var router = express.Router()
const { oauth, tool, db, log, reptileConfig } = require('../../tool/require')

/*
 *   渠道列表
 *   page 页数
 *   limit 一页几条
 *
 * */
router.use('', oauth(4004), async function (req, res, next) {
  let page = tool.getParams(req, 'page') || 1
  let keywordsParam = tool.getParams(req, 'keywords') || ''
  // let limit = tool.getParams(req, 'limit') || 10
  let limit = 10

  let data = null
  try {
    let whereArr = []
    let sql = `select * from keywords`
    if (keywordsParam) {
      // whereArr.push(`name like "%${keywordsParam}%"`)
      sql += ` where name like "%${keywordsParam}%"`
    }
    sql += ` limit ${(page - 1) * limit},${limit}`
    // let allData = await db.query(
    //   `select * from keywords limit ${(page - 1) * limit},${limit}`
    // )
    let allData = await db.query(sql)
    const ruleMap = getRuleConfigMap()
    for (let i = 0; i < allData.length; i++) {
      let keywords = allData[i]
      let progress = await db.query(
        `select * from keywordsprogress where keywordsId=${keywords.id}`
      )
      for (let j = 0; j < progress.length; j++) {
        progress[j].rule = ruleMap[progress[j].ruleId]
        // 查一下爬了几个邮箱
        const emailList = await db.query(
          `select * from email where keywordsId=${keywords.id} and ruleId=${progress[j].ruleId}`
        )
        progress[j].emailList = emailList
      }
      keywords.progress = progress
    }
    const countObj = await db.query(`select count(*) from keywords`)
    const count = countObj[0]['count(*)'],
      data = {
        list: allData,
        count,
      }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

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
  // let limit = tool.getParams(req, 'limit') || 10
  let limit = 10

  let data = null
  try {
    let allData = await db.query(
      `select * from keywords limit ${page - 1},${limit}`
    )
    const ruleMap = getRuleConfigMap()
    console.log('🚀 ~ file: list.js ~ line 20 ~ allData', allData)
    for (let i = 0; i < allData.length; i++) {
      let keywords = allData[i]
      let progress = await db.query(
        `select * from keywordsprogress where keywordsId=${keywords.id}`
      )
      for (let j = 0; j < progress.length; j++) {
        progress[j].rule = ruleMap[progress[j].ruleId]
      }
      keywords.progress = progress
    }
    data = {
      list: allData,
      count: allData.length,
    }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

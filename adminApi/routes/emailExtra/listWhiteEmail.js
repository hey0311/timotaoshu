var express = require('express')
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
  let limit = tool.getParams(req, 'limit') || 10

  let list = []
  try {
    list = await db.query(
      `select * from emailwhite limit ${(page - 1) * limit},${limit}`
    )

    const countObj = await db.query(`select count(*) from emailwhite`)
    const count = countObj[0]['count(*)']
    const data = {
      list,
      count,
    }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

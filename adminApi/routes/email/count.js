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
  // let page = tool.getParams(req, 'page') || 1
  // let limit = tool.getParams(req, 'limit') || 10

  // let data = null
  try {
    // const list = await db.query(
    //   `select * from email limit ${(page - 1) * limit},${limit}`
    // )
    const countObj = await db.query(`select count(*) from email`)
    const count = countObj[0]['count(*)'],
      data = {
        count,
      }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

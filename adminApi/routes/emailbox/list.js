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

  let data = null
  try {
    let list = await db.query(`select * from emailbox`)
    for (let i = 0; i < list.length; i++) {
      const box = list[i]
      const sendCountObj = await db.query(
        `select count(*) from email where sendbox_id=${box.id}`
      )
      const sendCount = sendCountObj[0]['count(*)']
      box.sendCount = sendCount
    }

    data = {
      list,
      count: list.length,
    }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

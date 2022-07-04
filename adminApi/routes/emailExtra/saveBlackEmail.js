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
  let email = tool.getParams(req, 'email')

  try {
    let allData = await db.query(
      `insert into emailblack (email,active) values ("${email}",1)`
    )

    data = {
      list: allData,
      count: allData.length,
      msg: '操作成功',
    }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

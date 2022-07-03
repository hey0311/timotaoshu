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
  let id = tool.getParams(req, 'id')
  let active = tool.getParams(req, 'active')
  try {
    let d = await db.query(
      `update emailtemplate set active ="${active}" where id=${id}`
    )
    const result = {
      data: d,
      msg: '操作成功',
    }

    res.send(tool.toJson(result, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

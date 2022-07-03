var express = require('express')
const batchSendEmail = require('../../service/sendEmail/batchSendEmail')
var router = express.Router()
const { oauth, tool, db, log, reptileConfig } = require('../../tool/require')

/*
 *   渠道列表
 *   page 页数
 *   limit 一页几条
 *
 * */
router.use('', oauth(4004), async function (req, res, next) {
  try {
    const result = await batchSendEmail()
    res.send(tool.toJson(result, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

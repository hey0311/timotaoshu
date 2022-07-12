var express = require('express')
const receiveEmailService = require('../../service/receiveEmail/receiveEmailService')
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
    const result = await receiveEmailService()
    res.send(tool.toJson(result, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

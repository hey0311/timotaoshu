var express = require('express')
var router = express.Router()
const { oauth, tool } = require('../../tool/require')
const { reptileService } = require('../../service/')
const { REPTILE_STATUS } = require('../../../common/tool/constant')

// let isReptile = false;   //是否正在爬取
// global.isReptile
router.use('', oauth(4003), async function (req, res, next) {
  global.reptileStatus = REPTILE_STATUS.STOP
  res.send(tool.toJson('success', '', 1000))
  // reptileService
  //   .stop()
  //   .then((msg) => {
  //     res.send(tool.toJson(null, msg, 1000))
  //   })
  //   .catch((err) => {
  //     res.send(tool.toJson(null, err, 1002))
  //   })
})

module.exports = router

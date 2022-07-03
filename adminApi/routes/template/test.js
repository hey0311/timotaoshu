var express = require('express')
const { sendEmail } = require('../../sendTools/sendEmail')
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
  console.log('🚀 ~ file: test.js ~ line 14 ~ id', id)
  let email = tool.getParams(req, 'email')
  console.log('🚀 ~ file: test.js ~ line 16 ~ email', email)

  let data = null
  try {
    let templateArray = await db.query(
      `select * from emailtemplate where id=${id}`
    )
    let template = templateArray[0]
    console.log('🚀 ~ file: testTemplate.js ~ line 22 ~ template', template)
    const sendbox = await db.query(
      `select * from emailbox where active=1 order  by rand() limit 1`
    )
    if (sendbox.length === 0) {
      return
    }
    const result = await sendEmail({
      from: sendbox[0].email,
      to: email,
      subject: template.subject,
      content: template.content,
    })

    data = result
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

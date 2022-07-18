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
  let email = tool.getParams(req, 'email') || ''
  let onlyShowSend = tool.getParams(req, 'onlyShowSend') || false

  let data = null
  try {
    let whereArr = []
    let sql = `select * from email`
    let countSql = `select count(*) from email`
    if (email) {
      whereArr.push(`email="${email}"`)
    }
    if (onlyShowSend === 'true') {
      whereArr.push(`sendStatus=1`)
    }
    let limitSql = ` limit ${(page - 1) * limit},${limit}`
    if (whereArr.length > 0) {
      sql = sql + ' where ' + whereArr.join(' and ')
      countSql = countSql + ' where ' + whereArr.join(' and ')
    }
    sql += limitSql
    countSql += limitSql
    let list = await db.query(sql)
    for (let i = 0; i < list.length; i++) {
      const email = list[i]
      const template = await db.query(
        `select * from emailtemplate where id=${email.template_id}`
      )
      email.template = template[0]
      const sendbox = await db.query(
        `select * from emailbox where id=${email.sendbox_id}`
      )
      email.sendbox = sendbox[0]
    }
    const countObj = await db.query(countSql)
    const count = countObj[0]['count(*)']
    data = {
      list,
      count,
    }
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

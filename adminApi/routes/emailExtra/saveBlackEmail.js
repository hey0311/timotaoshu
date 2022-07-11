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
  try{
  let email = tool.getParams(req, 'email')
  const emailList = email.split('\n')
  for (let i = 0; i < emailList.length; i++) {
    if (!emailList[i]) {
      continue
    }
    // 检测重复
    let sql = `select COUNT(*) from emailblack where email="${emailList[i]}"`
    let count = tool.getData(await db.query(sql))
    if (count) {
      console.log(`${emailList[i]}重复,跳过`)
      continue
    }
    await db.query(
      `insert into emailblack (email,active) values ("${emailList[i]}",1)`
    )
  }
    data = 'success'
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

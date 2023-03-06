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
  let name = tool.getParams(req, 'name')
  let data = null
  try {
    let skipNum = 0
      const nameList = name.split('\n')
      for (let i = 0; i < nameList.length; i++) {
        if (!nameList[i]) {
          continue
        }
        // 检测重复
        let sql = `select COUNT(*) from email where email="${nameList[i]}"`
        let count = tool.getData(await db.query(sql))
        if (count) {
          console.log(`${nameList[i]}重复,跳过`)
          skipNum++;
          continue
        }
        await db.query(
          `insert into email (email,sendStatus) values ("${nameList[i]}",0)`
        )
      }

    // data = {
    //   list: allData,
    //   count: allData.length,
    // }
    data = '成功插入'+(nameList.length - skipNum) + '条,重复' + skipNum + '条'
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

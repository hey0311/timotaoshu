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
    if (id) {
      await db.query(`update keywords set name="${name}" where id=${id}`)
    } else {
      const nameList = name.split('\n')
      for (let i = 0; i < nameList.length; i++) {
        if (!nameList[i]) {
          continue
        }
        await db.query(
          `insert into keywords (name,active) values ("${nameList[i]}",1)`
        )
      }
    }

    // data = {
    //   list: allData,
    //   count: allData.length,
    // }
    data = 'success'
    res.send(tool.toJson(data, '', 1000))
  } catch (err) {
    res.send(tool.toJson(null, err, 1002))
  }
})

module.exports = router

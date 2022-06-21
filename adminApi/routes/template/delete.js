var express = require("express");
var router = express.Router();
const { oauth, tool, db, log, reptileConfig } = require("../../tool/require");

/*
 *   渠道列表
 *   page 页数
 *   limit 一页几条
 *
 * */
router.use("", oauth(4004), async function (req, res, next) {
  let id = tool.getParams(req, "id");
  let data = null;
  try {
    let allData = await db.query(`delete from emailtemplate where id=${id}`);
    // let reptileList = await reptileConfig.getReptileList();
    // let count = reptileList.length;

    // reptileList.forEach((value, index) => {
    //     reptileList[index] = JSON.parse(value);
    // })

    data = {
      list: allData,
      count: allData.length,
    };
    res.send(tool.toJson(data, "", 1000));
  } catch (err) {
    res.send(tool.toJson(null, err, 1002));
  }
});

module.exports = router;

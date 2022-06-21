var express = require("express");
const { sendEmail } = require("../../reptileTool/emailTool");
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
  console.log("🚀 ~ file: saveTemplate.js ~ line 13 ~ id", id);

  let data = null;
  try {
    let templateArray = await db.query(
      `select * from emailtemplate where id=${id}`
    );
    let template = templateArray[0];
    console.log("🚀 ~ file: testTemplate.js ~ line 22 ~ template", template);
    // let reptileList = await reptileConfig.getReptileList();
    // let count = reptileList.length;

    // reptileList.forEach((value, index) => {
    //     reptileList[index] = JSON.parse(value);
    // })
    await sendEmail({
      subject: template.subject,
      content: template.content,
    });

    data = {
      success: true,
    };
    res.send(tool.toJson(data, "", 1000));
  } catch (err) {
    res.send(tool.toJson(null, err, 1002));
  }
});

module.exports = router;

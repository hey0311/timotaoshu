const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");
const {
  fs,
  rp,
  cheerio,
  iconv,
  path,
  tool,
  db,
  wss,
  log,
  timoRp,
} = require("../tool/require");
const { insertEmail, insertErrorTask } = require("./dbTool");
const reptileRequest = require("./reptileRequest");

module.exports = reptileShop;

async function reptileShop({ keywords, rule, uri, page, order }) {
  return new Promise(async (resolve, reject) => {
    let $ = null;
    try {
      $ = await reptileRequest({ uri });
    } catch (err) {
      await insertErrorTask({
        keywords,
        ruleConfig: rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.SHOP_PAGE,
        page,
        order,
      });
      resolve();
      return;
    }
    const email = rule.getEmail($);
    log.info(`第${page}页第${order}个email:${email ? email : "无"}`);
    if (email) {
      const insertResult = await insertEmail({
        keywords,
        rule,
        email,
      });
      if (insertResult) {
        resolve();
      } else {
        resolve("错误,存取失败");
      }
    }
    resolve();
  });
}

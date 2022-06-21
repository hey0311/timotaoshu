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
const { insertEmail } = require("./dbTool");
const reptileRequest = require("./reptileRequest");

module.exports = reptileShop;

async function reptileShop({ keywords, rule, uri, page, order }) {
  return new Promise(async (resolve, reject) => {
    try {
      const $ = await reptileRequest({ uri });
      const email = rule.getEmail($);
      console.log(
        "🚀 ~ file: reptileShop.js ~ line 25 ~ returnnewPromise ~ email",
        email
      );
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
    } catch (err) {
      console.log(
        "🚀 ~ file: reptileShop.js ~ line 41 ~ returnnewPromise ~ err",
        err
      );
    }
  });
}

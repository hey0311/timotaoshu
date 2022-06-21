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
const { addShopToQueue } = require("./queueTool");
const reptileRequest = require("./reptileRequest");
const reptileShop = require("./reptileShop");

module.exports = reptileSearchItem;

async function reptileSearchItem({ keywords, rule, uri, page, order }) {
  return new Promise(async (resolve, reject) => {
    try {
      const $ = await reptileRequest({ uri });
      const shopUrl = rule.getShopUrl($);
      console.log(
        "🚀 ~ file: reptileSearchItem.js ~ line 23 ~ returnnewPromise ~ shopUrl",
        shopUrl
      );
      if (shopUrl) {
        await addShopToQueue(
          {
            keywords,
            rule,
            uri: shopUrl,
            page,
            order,
            // bizName,
          },
          reptileShop
        );
      }
      resolve();
    } catch (err) {
      console.log(
        "🚀 ~ file: reptileSearchItem.js ~ line 43 ~ returnnewPromise ~ err",
        err
      );
    }
  });
}

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
const { addSearchItemToQueue } = require("./queueTool");
const reptileRequest = require("./reptileRequest");
const reptileSearchItem = require("./reptileSearchItem");

const getRule = require("./rule");

module.exports = reptileKeywordsByRule;

async function reptileKeywordsByRule(keywords, ruleConfig) {
  return new Promise(async (resolve, reject) => {
    // 先找到对应的rule
    let page = 1;
    try {
      const rule = getRule(ruleConfig, keywords);
      // 这个是当前的搜索页
      let $ = await reptileRequest({
        uri: rule.searchUrl,
      });
      while ($) {
        let searchItemList = rule.getSearchItemList($).toArray();
        for (let i = 0; i < searchItemList.length; i++) {
          console.log(`爬取第${page}页,第${i + 1}个`);
          const searchItem = searchItemList[i];
          const searchItemUrl = rule.getSearchItemUrl($, searchItem, i);
          console.log(
            "🚀 ~ file: reptileKeywordsByRule.js ~ line 43 ~ returnnewPromise ~ searchItemUrl",
            searchItemUrl
          );
          await addSearchItemToQueue(
            {
              keywords,
              rule,
              uri: searchItemUrl,
              page,
              order: i + 1,
            },
            reptileSearchItem
          );
        }
        $ = await reptileRequest({
          uri: rule.getNextPage($),
        });
        page++;
      }
      resolve();
    } catch (err) {
      console.log(
        "🚀 ~ file: reptileKeywordsByRule.js ~ line 57 ~ returnnewPromise ~ err",
        err
      );
    }
  });
}

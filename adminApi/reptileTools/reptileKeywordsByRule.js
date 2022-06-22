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
const { updateKeywordsProgress } = require("./dbTool");
const reptileRequest = require("./reptileRequest");
const reptileSearchItem = require("./reptileSearchItem");

const getRule = require("./rule");
const { addSearchItemToQueue } = require("./searchItemQueue");

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
        // for (let i = 0; i < searchItemList.length; i++) {
        for (let i = 0; i < 3; i++) {
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
        try {
          $ = await reptileRequest({
            uri: rule.getNextPage($),
          });
          // 第page页爬完
          await updateKeywordsProgress({
            keywords,
            ruleConfig,
            page,
            finished: !$,
          });
        } catch (err) {
          // 下一页出错,停止这个关键词
          $ = null;
          // 记录已爬完的页面
          await updateKeywordsProgress({
            keywords,
            ruleConfig,
            page,
            finished: false,
          });
        }
        page++;
      }
      resolve();
    } catch (err) {
      // 搜索页出错
      console.log(
        "🚀 ~ file: reptileKeywordsByRule.js ~ line 57 ~ returnnewPromise ~ err",
        err
      );
    }
  });
}

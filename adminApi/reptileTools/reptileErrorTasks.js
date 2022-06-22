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
} = require("../tool/require");

const { getRuleConfigList, getRuleConfigMap } = require("./ruleConfig");
const reptileKeywordsByRule = require("./reptileKeywordsByRule");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");
const reptileSearchItem = require("./reptileSearchItem");
const { addSearchItemToQueue } = require("./searchItemQueue");
const getRule = require("./rule");
const reptileShop = require("./reptileShop");
const { addShopToQueue } = require("./shopQueue");
const { deleteErrorTask } = require("./dbTool");

module.exports = reptileErrorTasks;

async function reptileErrorTasks() {
  try {
    // 取出错误记录
    const errorTaskRecords = await db.query(`select * from errortask`);
    const ruleMap = getRuleConfigMap();
    for (let i = 0; i < errorTaskRecords.length; i++) {
      const errorTask = errorTaskRecords[i];
      // 获取关键词
      let keywords = null;
      const keywordsRecords = await db.query(
        `select * from keywords where id=${errorTask.keywordsId}`
      );
      keywords = keywordsRecords && keywordsRecords[0];
      // 获取爬取规则
      const rule = getRule(ruleMap[errorTask.ruleId], keywords);
      switch (errorTask.pageType) {
        case ERROR_TASK_PAGE_TYPE.ITEM_PAGE: // 搜索项
          try {
            const result = await addSearchItemToQueue(
              {
                keywords,
                rule,
                uri: errorTask.uri,
                page: errorTask.page,
                order: errorTask.sequence,
              },
              reptileSearchItem
            );
            // 删除这条记录
            await deleteErrorTask(errorTask.id);
          } catch (err) {
            console.log(
              "🚀 ~ file: reptileErrorTasks.js ~ line 64 ~ reptileErrorTasks ~ err",
              err
            );
          }
          break;
        case ERROR_TASK_PAGE_TYPE.SHOP_PAGE:
          try {
            const result = await addShopToQueue(
              {
                keywords,
                rule,
                uri: errorTask.uri,
                page: errorTask.sequence,
                order: errorTask.order,
              },
              reptileShop
            );
            await deleteErrorTask(errorTask.id);
          } catch (err) {
            console.log(
              "🚀 ~ file: reptileErrorTasks.js ~ line 82 ~ reptileErrorTasks ~ err",
              err
            );
          }
          break;
      }
    }
    log.info(`错误记录爬取完成`);
  } catch (err) {
    console.log(
      "🚀 ~ file: reptileAllKeywords.js ~ line 24 ~ reptileAllKeywords ~ err",
      err
    );
  }
}

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
} = require('../tool/require')

const { getRuleConfigList, getRuleConfigMap } = require('./ruleConfig')
const reptileKeywordsByRule = require('./reptileKeywordsByRule')
const { ERROR_TASK_PAGE_TYPE } = require('../../common/tool/constant')
const reptileSearchItem = require('./reptileSearchItem')
const {
  addSearchItemToQueue,
  batchAddSearchItemToQueue,
} = require('./searchItemQueue')
const getRule = require('./rule')
const reptileShop = require('./reptileShop')
const { addShopToQueue, batchAddShopToQueue } = require('./shopQueue')
const { deleteErrorTask } = require('./dbTool')

module.exports = reptileErrorTasks

async function reptileErrorTasks() {
  try {
    // 取出错误记录
    const allErrorRecords = await db.query(`select count(*) from errortask`)
    const count = allErrorRecords[0]['count(*)']
    const errorTaskRecords = await db.query(
      `select * from errortask limit 0,100`
    )
    wss.broadcast(
      `开始爬取错误记录,共${count}条,现在取${errorTaskRecords.length}条爬取`
    )
    const ruleMap = getRuleConfigMap()
    let searchItemParamsList = []
    let shopParamsList = []
    for (let i = 0; i < errorTaskRecords.length; i++) {
      const errorTask = errorTaskRecords[i]
      // 获取关键词
      let keywords = null
      const keywordsRecords = await db.query(
        `select * from keywords where id=${errorTask.keywordsId}`
      )
      keywords = keywordsRecords && keywordsRecords[0]
      // 获取爬取规则
      const rule = getRule(ruleMap[errorTask.ruleId], keywords)
      switch (errorTask.pageType) {
        case ERROR_TASK_PAGE_TYPE.ITEM_PAGE: // 搜索项
          searchItemParamsList.push({
            keywords,
            rule,
            uri: errorTask.uri,
            page: 10000,
            order: i + 1,
            result: async () => {
              await deleteErrorTask(errorTask.id)
              wss.broadcast({
                type: 'table',
                page: 10000,
                keywordsName: keywords.name,
                ruleName: rule.name,
                index: i + 1,
                result: '已去除',
              })
            },
            error() {},
          })
          break
        case ERROR_TASK_PAGE_TYPE.SHOP_PAGE:
          shopParamsList.push({
            keywords,
            rule,
            uri: errorTask.uri,
            page: 10000,
            order: i + 1,
            result: async () => {
              await deleteErrorTask(errorTask.id)
              wss.broadcast({
                type: 'table',
                page: 10000,
                keywordsName: keywords.name,
                ruleName: rule.name,
                index: i + 1,
                result: '已去除',
              })
            },
            error() {},
          })
          break
      }
    }
    await batchAddSearchItemToQueue(searchItemParamsList, reptileSearchItem)
    await batchAddShopToQueue(shopParamsList, reptileShop)
    wss.broadcast(`错误记录爬取完成`)
  } catch (err) {
    console.log(
      '🚀 ~ file: reptileAllKeywords.js ~ line 24 ~ reptileAllKeywords ~ err',
      err
    )
  }
}

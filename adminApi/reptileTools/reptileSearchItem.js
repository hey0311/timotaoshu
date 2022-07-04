const { ERROR_TASK_PAGE_TYPE } = require('../../common/tool/constant')
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
} = require('../tool/require')
const { insertErrorTask } = require('./dbTool')
const reptileRequest = require('./reptileRequest')
const reptileShop = require('./reptileShop')
const { addShopToQueue } = require('./shopQueue')

module.exports = reptileSearchItem

async function reptileSearchItem({
  keywords,
  rule,
  uri,
  page,
  order,
  reptileStatus,
}) {
  return new Promise(async (resolve, reject) => {
    let $ = null
    try {
      $ = await reptileRequest({ uri })
    } catch (err) {
      // 插入错误记录
      await insertErrorTask({
        keywords,
        rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.ITEM_PAGE,
        page,
        order,
        reptileStatus,
      })
      resolve()
      return
    }
    const shopUrl = rule.getShopUrl($)
    wss.broadcast({
      type: reptileStatus,
      page,
      keywordsName: keywords.name,
      ruleName: rule.name,
      index: order,
      shopUrl,
    })
    if (shopUrl) {
      // emmm..这里不能用queue
      await reptileShop({
        keywords,
        rule,
        uri: shopUrl,
        page,
        order,
        reptileStatus,
      })
    } else {
      // 不可能没shopUrl的,先存入错误记录
      await insertErrorTask({
        keywords,
        rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.ITEM_PAGE,
        page,
        order,
        reptileStatus,
      })
    }
    resolve()
  })
}

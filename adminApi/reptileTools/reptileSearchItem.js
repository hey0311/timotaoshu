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

async function reptileSearchItem({ keywords, rule, uri, page, order }) {
  return new Promise(async (resolve, reject) => {
    let $ = null
    try {
      $ = await reptileRequest({ uri })
    } catch (err) {
      // 插入错误记录
      await insertErrorTask({
        keywords,
        ruleConfig: rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.ITEM_PAGE,
        page,
        order,
      })
      resolve()
      return
    }
    const shopUrl = rule.getShopUrl($)
    wss.broadcast(`第${page}页第${order}个shopUrl:${shopUrl}`)
    if (shopUrl) {
      // emmm..这里不能用queue
      await reptileShop({
        keywords,
        rule,
        uri: shopUrl,
        page,
        order,
      })
    } else {
      // 不可能没shopUrl的,先存入错误记录
      await insertErrorTask({
        keywords,
        ruleConfig: rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.ITEM_PAGE,
        page,
        order,
      })
    }
    resolve()
  })
}

const { ERROR_TASK_PAGE_TYPE } = require('../../common/tool/constant')
const userAgents = require('../../common/tool/user-agent')
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
  errorTaskId,
}) {
  return new Promise(async (resolve, reject) => {
    let $ = null
    // let agentIndex = Math.floor(Math.random() * userAgents.pc.length)
    // const agentIndex = 7
    // const agent = userAgents.pc[agentIndex]
    try {
      $ = await reptileRequest({
        uri,
        // agent,
      })
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
      resolve('商品网址请求失败')
      return
    }
    const shopUrl = rule.getShopUrl($)
    if (shopUrl) {
      // emmm..这里不能用queue
      const shopResult = await reptileShop({
        keywords,
        rule,
        uri: shopUrl,
        page,
        order,
        reptileStatus,
        errorTaskId,
      })
      // console.log(`有店铺网址,商品网址是:${uri}`)
      resolve(shopResult)
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
      console.log(`无店铺网址,商品地址是${rui}`)
      resolve('无店铺网址')
    }
  })
}

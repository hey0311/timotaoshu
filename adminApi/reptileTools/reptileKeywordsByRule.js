const reptileIp = require('./reptileIp')
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
const { updateKeywordsProgress } = require('./dbTool')
const reptileRequest = require('./reptileRequest')
const reptileSearchItem = require('./reptileSearchItem')

const getRule = require('./rule')
const { batchAddSearchItemToQueue } = require('./searchItemQueue')
const reptileErrorTasks = require('./reptileErrorTasks')

module.exports = reptileKeywordsByRule

async function reptileKeywordsByRule(keywords, rule, reptilePage) {
  return new Promise(async (resolve, reject) => {
    // 先找到对应的rule
    let page = reptilePage || 1
    wss.broadcast(`开始爬取第${page}页`)
    let $ = null
    // 这里更新一下ip
    await reptileIp()
    try {
      // 这个是当前的搜索页
      $ = await reptileRequest({
        uri: rule.getSearchUrl(page),
      })
    } catch (err) {
      // 爬第一页出错
      wss.broadcast(`爬取第1页出错,${err}`)
      resolve()
      return
    }
    while ($) {
      let searchItemList = rule.getSearchItemList($).toArray()
      let paramsList = []
      for (let i = 0; i < searchItemList.length; i++) {
        // for (let i = 0; i < 3; i++) {
        const searchItem = searchItemList[i]
        const searchItemUrl = rule.getSearchItemUrl($, searchItem, i)
        paramsList.push({
          keywords,
          rule,
          uri: searchItemUrl,
          page,
          order: i + 1,
        })
        wss.broadcast({
          type: 'table',
          page,
          keywordsName: keywords.name,
          ruleName: rule.name,
          index: i + 1,
          itemUrl: searchItemUrl,
        })
      }
      await batchAddSearchItemToQueue(paramsList, reptileSearchItem)
      // 爬完一页开始爬错误页面
      await reptileErrorTasks()
      if (rule.isLastPage($)) {
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: true,
        })
        break
      }
      await reptileIp()
      try {
        console.log(
          '🚀 ~ file: reptileKeywordsByRule.js ~ line 62 ~ returnnewPromise ~ rule.getNextPage($)',
          rule.getNextPage($)
        )
        $ = await reptileRequest({
          uri: rule.getNextPage($),
        })
        // 第page页爬完
        wss.broadcast(`第${page}页爬完,开始下一页`)
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: false,
        })
      } catch (err) {
        // 下一页出错,停止这个关键词
        wss.broadcast(`第${page}页爬取出错,${err}`)
        $ = null
        // 记录已爬完的页面
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: false,
        })
      }
      page++
    }
    resolve()
  })
}

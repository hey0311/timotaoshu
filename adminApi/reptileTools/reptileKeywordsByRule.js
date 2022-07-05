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
const { updateKeywordsProgress, batchInsertEmail } = require('./dbTool')
const reptileRequest = require('./reptileRequest')
const reptileSearchItem = require('./reptileSearchItem')

const getRule = require('./rule')
const { batchAddSearchItemToQueue } = require('./searchItemQueue')
const reptileErrorTasks = require('./reptileErrorTasks')
const checkstop = require('./tools')
const { REPTILE_STATUS } = require('../../common/tool/constant')

module.exports = reptileKeywordsByRule

async function reptileKeywordsByRule(keywords, rule, reptilePage) {
  return new Promise(async (resolve, reject) => {
    // 先找到对应的rule
    let page = reptilePage || 1
    // wss.broadcast(`开始爬取第${page}页`)
    let $ = null
    // 这里更新一下ip
    // await reptileIp()
    const uri = rule.getSearchUrl(page)
    console.log(
      `开始爬取关键词${keywords.name},网站${rule.name},第${page}页,地址:${uri}`
    )
    try {
      // 这个是当前的搜索页
      $ = await reptileRequest({ uri, noIp: true })
    } catch (err) {
      // 爬第一页出错
      console.log(`爬取搜索页出错,${err}`)
      resolve('爬取搜索页出错')
      return
    }
    while ($) {
      const startTime = Date.now()
      if (checkstop()) {
        resolve()
      }
      let searchItemList = rule.getSearchItemList($).toArray()
      let paramsList = []
      for (let i = 0; i < searchItemList.length; i++) {
        if (checkstop()) {
          resolve()
        }
        // for (let i = 0; i < 3; i++) {
        const searchItem = searchItemList[i]
        const searchItemUrl = rule.getSearchItemUrl($, searchItem, i)
        paramsList.push({
          keywords,
          rule,
          uri: searchItemUrl,
          page,
          order: i + 1,
          reptileStatus: REPTILE_STATUS.ALL_KEY_WORDS,
          result: (result) => {
            wss.broadcast({
              type: REPTILE_STATUS.ALL_KEY_WORDS,
              page,
              keywordsName: keywords.name,
              ruleName: rule.name,
              index: i + 1,
              itemUrl: searchItemUrl,
              result: typeof result === 'object' ? result.email : result,
            })
          },
        })
      }
      const emailList = await batchAddSearchItemToQueue(
        paramsList,
        reptileSearchItem
      )
      if (emailList.length !== 0) {
        await batchInsertEmail(emailList)
      }
      console.log(
        `第${page}页爬取完成,耗时${(Date.now() - startTime) / 1000}秒`
      )
      // await reptileIp()
      // 爬完一页开始爬错误页面
      await reptileErrorTasks()
      if (rule.isLastPage($)) {
        console.log(`最后一页,开始保存进度`)
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: true,
        })
        break
      }
      try {
        console.log(`获取下一页,地址:${rule.getNextPage($)}`)
        $ = await reptileRequest({
          uri: rule.getNextPage($),
          noIp: true,
        })
        // 第page页爬完
        // wss.broadcast(`第${page}页爬完,开始下一页`)
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: false,
        })
      } catch (err) {
        // 下一页出错,停止这个关键词
        console.log(`获取下一页出错,地址:${rule.getNextPage($)},${err}`)
        // wss.broadcast(`第${page}页爬取出错,${err}`)
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

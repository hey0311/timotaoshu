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
const {
  updateKeywordsProgress,
  batchInsertEmail,
  insertErrorTask,
} = require('./dbTool')
const reptileRequest = require('./reptileRequest')
const reptileSearchItem = require('./reptileSearchItem')

const getRule = require('./rule')
const { batchAddSearchItemToQueue } = require('./searchItemQueue')
const reptileErrorTasks = require('./reptileErrorTasks')
const checkstop = require('./tools')
const {
  REPTILE_STATUS,
  ERROR_TASK_PAGE_TYPE,
} = require('../../common/tool/constant')

module.exports = reptileSearchPage

async function reptileSearchPage(keywords, rule, reptilePage) {
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
      $ = await reptileRequest({ uri, timeout: 30000 })
    } catch (err) {
      // 爬第一页出错
      console.log(`爬取搜索页出错,${err}`)
      resolve('爬取搜索页出错')
      return
    }
    const startTime = Date.now()
    if (checkstop()) {
      resolve()
    }
    let searchItemList = rule.getSearchItemList($).toArray()
    // 这里存入数据库就行了,没必要等爬完

    // let paramsList = []
    for (let i = 0; i < searchItemList.length; i++) {
      const searchItem = searchItemList[i]
      const searchItemUrl = rule.getSearchItemUrl($, searchItem, i)
      await insertErrorTask({
        keywords,
        rule,
        uri: searchItemUrl,
        pageType: ERROR_TASK_PAGE_TYPE.ITEM_PAGE,
        page,
        order: i + 1,
        reptileStatus: REPTILE_STATUS.ERROR_TASKS,
      })
      // paramsList.push({
      //   keywords,
      //   rule,
      //   uri: searchItemUrl,
      //   page,
      //   order: i + 1,
      //   reptileStatus: REPTILE_STATUS.ALL_KEY_WORDS,
      //   result: (result) => {
      //     wss.broadcast({
      //       type: REPTILE_STATUS.ALL_KEY_WORDS,
      //       page,
      //       keywordsName: keywords.name,
      //       ruleName: rule.name,
      //       index: i + 1,
      //       itemUrl: searchItemUrl,
      //       result: typeof result === 'object' ? result.email : result,
      //     })
      //   },
      // })
    }
    // if (paramsList.length > 0) {
    //   const emailList = await batchAddSearchItemToQueue(
    //     paramsList,
    //     reptileSearchItem
    //   )
    //   if (emailList.length !== 0) {
    //     await batchInsertEmail(emailList)
    //   }
    // }
    // console.log(`第${page}页爬取完成,耗时${(Date.now() - startTime) / 1000}秒`)
    try {
      if (rule.isLastPage($)) {
        log.info(`最后一页,开始保存进度`)
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: true,
        })
      } else {
        log.info(`插入${searchItemList.length}条errortask成功,开始保存进度`)
        await updateKeywordsProgress({
          keywords,
          rule,
          page,
          finished: false,
        })
      }
    } catch (err) {
      console.log(`保存进度出错`)
    }
    resolve()
  })
}

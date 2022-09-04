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
const {
  ERROR_TASK_PAGE_TYPE,
  REPTILE_STATUS,
} = require('../../common/tool/constant')
const reptileSearchItem = require('./reptileSearchItem')
const {
  addSearchItemToQueue,
  batchAddSearchItemToQueue,
  searchItemQueue,
} = require('./searchItemQueue')
const getRule = require('./rule')
const reptileShop = require('./reptileShop')
const {
  addShopToQueue,
  batchAddShopToQueue,
  shopQueue,
} = require('./shopQueue')
const { deleteErrorTask, batchInsertEmail } = require('./dbTool')
const { sleep } = require('../../common/tool/tool')
const reptileIp = require('./reptileIp')

module.exports = reptileErrorTasks
const MAX_TASK_LEN = 1000
async function reptileErrorTasks() {
  // while (true) {
  await reptileIp()
  try {
    // 取出错误记录
    // const startTime = Date.now()
    // const allErrorRecords = await db.query(`select count(*) from errortask`)
    // const count = allErrorRecords[0]['count(*)']
    // 这里应该分两种类型取
    // const errorTaskRecords = await db.query(
    //   `select * from errortask limit 0,${MAX_TASK_LEN}`
    // )
    wss.broadcast({
      type: REPTILE_STATUS.CHECK_IP,
    })
    // 获取当前queue的taskId
    let searchItemTaskIdList = []
    let cursor = searchItemQueue._tasks.head
    while (cursor) {
      searchItemTaskIdList.push(cursor.data.params.errorTaskId)
      cursor = cursor.next
    }
    // 补充searchItemQueue
    const searchItemQueueLen = searchItemQueue.length()
    console.log(
      '🚀 ~ file: reptileErrorTasks.js ~ line 54 ~ reptileErrorTasks ~ searchItemQueueLen',
      searchItemQueueLen
    )
    const searchItemNeedCount = MAX_TASK_LEN - searchItemQueueLen
    let sql = `select * from errortask where pageType=${ERROR_TASK_PAGE_TYPE.ITEM_PAGE}`
    if (searchItemTaskIdList.length !== 0) {
      sql += ` and id not in (${searchItemTaskIdList.join(',')})`
    }
    sql += ` limit 0,${searchItemNeedCount}`
    const searchItemErrorTaskRecords = await db.query(sql)
    const ruleMap = getRuleConfigMap()
    for (let i = 0; i < searchItemErrorTaskRecords.length; i++) {
      const record = searchItemErrorTaskRecords[i]
      let keywords = null
      const keywordsRecords = await db.query(
        `select * from keywords where id=${record.keywordsId}`
      )
      keywords = keywordsRecords && keywordsRecords[0]
      const rule = getRule(ruleMap[record.ruleId], keywords)
      const page = record.page
      searchItemQueue.push({
        params: {
          keywords,
          rule,
          uri: record.uri,
          page,
          order: i + 1,
          reptileStatus: REPTILE_STATUS.ERROR_TASKS,
          errorTaskId: record.id,
        },
        pro: reptileSearchItem,
        result: async (data) => {
          // sucCount++;
          // end();
          // resolve();
        },
        error: async (data) => {
          // errCount++;
          // end();
          // reject();
        },
      })
    }
    console.log(`已添加${searchItemErrorTaskRecords.length}条搜索页爬取任务`)
    const shopQueueLen = shopQueue.length()
    const shopQueueNeedCount = MAX_TASK_LEN - shopQueueLen
    let shopQueueTaskIdList = []
    let cursor1 = shopQueue._tasks.head
    while (cursor1) {
      shopQueueTaskIdList.push(cursor1.data.params.errorTaskId)
      cursor1 = cursor1.next
    }
    let sql1 = `select * from errortask where pageType=${ERROR_TASK_PAGE_TYPE.SHOP_PAGE}`
    if (shopQueueTaskIdList.length !== 0) {
      sql1 += ` and id not in (${shopQueueTaskIdList.join(',')})`
    }
    sql1 += ` limit 0,${shopQueueNeedCount}`
    const shopQueueErrorTaskRecords = await db.query(sql1)
    for (let i = 0; i < shopQueueErrorTaskRecords.length; i++) {
      const record = shopQueueErrorTaskRecords[i]
      let keywords = null
      const keywordsRecords = await db.query(
        `select * from keywords where id=${record.keywordsId}`
      )
      keywords = keywordsRecords && keywordsRecords[0]
      const rule = getRule(ruleMap[record.ruleId], keywords)
      const page = record.page
      shopQueue.push({
        params: {
          keywords,
          rule,
          uri: record.uri,
          page,
          order: i + 1,
          reptileStatus: REPTILE_STATUS.ERROR_TASKS,
          errorTaskId: record.id,
        },
        pro: reptileShop,
        result: async (data) => {
          // sucCount++;
          // end();
          // resolve();
        },
        error: async (data) => {
          // errCount++;
          // end();
          // reject();
        },
      })
    }
    console.log(`已添加${shopQueueErrorTaskRecords.length}条商品页爬取任务`)
    // if (errorTaskRecords.length < MAX_TASK_LEN) {
    //   console.log(`错误记录小于${MAX_TASK_LEN}条,跳过`)
    //   await sleep(30000)
    //   continue
    //   // resolve()
    //   // return
    // }
    // console.log(
    //   `开始爬取错误记录,共${count}条,现在取${errorTaskRecords.length}条爬取`
    // )
    // const ruleMap = getRuleConfigMap()
    // let searchItemParamsList = []
    // let shopParamsList = []
    // for (let i = 0; i < errorTaskRecords.length; i++) {
    //   const errorTask = errorTaskRecords[i]
    //   // 获取关键词
    //   let keywords = null
    //   const keywordsRecords = await db.query(
    //     `select * from keywords where id=${errorTask.keywordsId}`
    //   )
    //   keywords = keywordsRecords && keywordsRecords[0]
    //   // 获取爬取规则
    //   const rule = getRule(ruleMap[errorTask.ruleId], keywords)
    //   const page = errorTask.page
    //   switch (errorTask.pageType) {
    //     case ERROR_TASK_PAGE_TYPE.SEARCH_PAGE:
    //     case ERROR_TASK_PAGE_TYPE.ITEM_PAGE: // 搜索项
    //       searchItemParamsList.push({
    //         keywords,
    //         rule,
    //         uri: errorTask.uri,
    //         page,
    //         order: i + 1,
    //         reptileStatus: REPTILE_STATUS.ERROR_TASKS,
    //         errorTaskId: errorTask.id,
    //         result: (result) => {
    //           const newResult =
    //             typeof result === 'object' ? result.email : result
    //           console.log(
    //             `爬取errorTask完成,地址:${errorTask.uri},结果:${newResult}`
    //           )
    //           wss.broadcast({
    //             type: REPTILE_STATUS.ERROR_TASKS,
    //             page,
    //             keywordsName: keywords.name,
    //             ruleName: rule.name,
    //             index: i + 1,
    //             result: newResult,
    //           })
    //         },
    //         error() {},
    //       })
    //       break
    //     case ERROR_TASK_PAGE_TYPE.SHOP_PAGE:
    //       shopParamsList.push({
    //         keywords,
    //         rule,
    //         uri: errorTask.uri,
    //         page,
    //         order: i + 1,
    //         reptileStatus: REPTILE_STATUS.ERROR_TASKS,
    //         errorTaskId: errorTask.id,
    //         result: (result) => {
    //           const newResult =
    //             typeof result === 'object' ? result.email : result
    //           console.log(
    //             `爬取errorTask完成,地址:${errorTask.uri},结果:${newResult}`
    //           )
    //           wss.broadcast({
    //             type: REPTILE_STATUS.ERROR_TASKS,
    //             page,
    //             keywordsName: keywords.name,
    //             ruleName: rule.name,
    //             index: i + 1,
    //             result: newResult,
    //           })
    //         },
    //         error() {},
    //       })
    //       break
    //   }
    // }
    // if (searchItemParamsList.length > 0) {
    //   const emailList1 = await batchAddSearchItemToQueue(
    //     searchItemParamsList,
    //     reptileSearchItem
    //   )
    //   // if (emailList1.length !== 0) {
    //   //   await batchInsertEmail(emailList1)
    //   // }
    // }
    // if (shopParamsList.length > 0) {
    //   const emailList2 = await batchAddShopToQueue(
    //     shopParamsList,
    //     reptileShop
    //   )
    //   // if (emailList2.length !== 0) {
    //   //   await batchInsertEmail(emailList2)
    //   // }
    // }
    // console.log(`错误记录爬取完成,用时${(Date.now() - startTime) / 1000}秒`)
    // resolve()
  } catch (err) {
    console.log(
      '🚀 ~ file: reptileAllKeywords.js ~ line 24 ~ reptileAllKeywords ~ err',
      err
    )
    // resolve()
  }
  // }
}

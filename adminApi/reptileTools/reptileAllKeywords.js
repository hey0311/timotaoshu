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
const reptileSearchPage = require('./reptileSearchPage')
const getRule = require('./rule')
const { REPTILE_STATUS } = require('../../common/tool/constant')
const checkstop = require('./tools')
const reptileErrorTasks = require('./reptileErrorTasks')
const reptileIp = require('./reptileIp')
const { sleep } = require('../../common/tool/tool')
const { keywordsQueue } = require('./keywordsQueue')
// const { fetchIpList } = require('./ipTool')

module.exports = reptileAllKeywords
function randomsort(a, b) {
  return Math.random() > 0.5 ? -1 : 1 //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}
function randomSelect(arr) {
  let random = Math.floor(Math.random() * arr.length)
  return arr[random]
}
const MAX_KEYWORDS_NUM = 20
async function reptileAllKeywords() {
  //TODO: 应该要一个全局状态,避免重复爬取
  // wss.broadcast(`开始爬取所有关键词`)
  global.reptileStatus = REPTILE_STATUS.ALL_KEY_WORDS
  console.log(`开始爬取所有关键词`)
  // await reptileIp()
  // await fetchIpList()
  // reptileErrorTasks()
  try {
    // let keywordsList = await db.query(`select * from keywords`)
    // keywordsList.sort(randomsort)
    // 随机选一个关键词
    const ruleConfigList = getRuleConfigList()
    const ruleMap = getRuleConfigMap()
    // while (true) {
    // 等等errorTask
    const allErrorRecords = await db.query(`select count(*) from errortask`)
    const count = allErrorRecords[0]['count(*)']
    if (count > 2000) {
      // await sleep(30000)
      return
    }
    let keywordsTaskIdList = []
    let cursor = keywordsQueue._tasks.head
    while (cursor) {
      keywordsTaskIdList.push(cursor.data.params.keywords.id)
      cursor = cursor.next
    }
    // 补充searchItemQueue
    const keywordsQueueLen = keywordsQueue.length()
    const keywordQueueNeedCount = MAX_KEYWORDS_NUM - keywordsQueueLen
    let sql = `select * from keywords`
    if (keywordsTaskIdList.length !== 0) {
      sql += ` where id not in (${keywordsTaskIdList.join(',')})`
    }
    sql += ` order by rand() limit 0,${keywordQueueNeedCount}`
    const keywordsRecords = await db.query(sql)
    for (let i = 0; i < keywordsRecords.length; i++) {
      const keywords = keywordsRecords[i] //randomSelect(keywordsList)
      // 随机选择网站
      // const ruleConfig = randomSelect(ruleConfigList)
      const ruleConfig = ruleMap[9]
      const keywordsProgressList = await db.query(
        `select * from keywordsprogress where keywordsId=${keywords.id} and ruleId=${ruleConfig.id}`
      )
      // if (keywordsProgressList.length !== 0) {
      //   continue
      // }
      // 从第几页的进度开始
      if (
        keywordsProgressList.length === 0 ||
        keywordsProgressList[0].finished === 0
      ) {
        let reptilePage = 1
        if (keywordsProgressList[0]) {
          reptilePage = keywordsProgressList[0].finishPage + 1
        }
        const rule = getRule(ruleConfig, keywords)
        // await reptileKeywordsByRule(keywords, rule, reptilePage)
        // await reptileSearchPage(keywords, rule, reptilePage)
        keywordsQueue.push({
          params: { keywords, rule, reptilePage },
          pro: reptileSearchPage,
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
        // await reptileErrorTasks()
      }
    }
    console.log(`已添加${keywordQueueNeedCount}条关键词爬取`)
    // 随机选择关键词
    // 优先选择没爬取过的关键词,没爬取过的网站
    // const progress = await db.query(
    //   `select * from keywordsprogress where keywordsId=${keywords.id} and ruleId=${ruleConfig.id}`
    // )
    // if (progress && progress.length > 0) {
    //   console.log(`网站${ruleConfig.name}的关键词${keywords.name}已爬取,跳过`)
    //   continue
    // }
    // if (checkstop()) {
    //   return
    // }
    // }
  } catch (err) {
    console.log(
      '🚀 ~ file: reptileAllKeywords.js ~ line 128 ~ reptileAllKeywords ~ err',
      err
    )
    wss.broadcast(`获取关键词异常,${err}`)
  }
}

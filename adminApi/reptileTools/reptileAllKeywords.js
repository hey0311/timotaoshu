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

const { getRuleConfigList } = require('./ruleConfig')
const reptileSearchPage = require('./reptileSearchPage')
const getRule = require('./rule')
const { REPTILE_STATUS } = require('../../common/tool/constant')
const checkstop = require('./tools')
const reptileErrorTasks = require('./reptileErrorTasks')

module.exports = reptileAllKeywords
function randomsort(a, b) {
  return Math.random() > 0.5 ? -1 : 1 //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}
function randomSelect(arr) {
  let random = Math.floor(Math.random() * arr.length)
  return arr[random]
}
async function reptileAllKeywords() {
  //TODO: 应该要一个全局状态,避免重复爬取
  // wss.broadcast(`开始爬取所有关键词`)
  global.reptileStatus = REPTILE_STATUS.ALL_KEY_WORDS
  console.log(`开始爬取所有关键词`)
  try {
    let keywordsList = await db.query(`select * from keywords`)
    // keywordsList.sort(randomsort)
    // 随机选一个关键词
    const ruleConfigList = getRuleConfigList()
    while (true) {
      const keywords = randomSelect(keywordsList)
      const ruleConfig = randomSelect(ruleConfigList)
      if (checkstop()) {
        return
      }
      const keywordsProgressList = await db.query(
        `select * from keywordsprogress where keywordsId=${keywords.id} and ruleId=${ruleConfig.id}`
      )
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
        await reptileSearchPage(keywords, rule, reptilePage)
        await reptileErrorTasks()
      }
    }
  } catch (err) {
    wss.broadcast(`获取关键词异常,${err}`)
  }
}

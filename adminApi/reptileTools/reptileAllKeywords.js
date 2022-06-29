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
const reptileKeywordsByRule = require('./reptileKeywordsByRule')

module.exports = reptileAllKeywords

async function reptileAllKeywords() {
  //TODO: 应该要一个全局状态,避免重复爬取
  try {
    let keywordsList = await db.query(`select * from keywords`)
    console.log(`共${keywordsList.length}个关键词需要爬取`)
    const ruleConfigList = getRuleConfigList()
    for (let i = 0; i < keywordsList.length; i++) {
      const keywords = keywordsList[i]
      // 从进度表里取一个还没有爬完的rule出来
      for (let j = 0; j < ruleConfigList.length; j++) {
        const ruleConfig = ruleConfigList[j]
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
          log.info(
            `开始爬取关键词${keywords.name},${ruleConfig.site},${ruleConfig.country}`
          )
          await reptileKeywordsByRule(keywords, ruleConfig, reptilePage)
        }
      }
    }
  } catch (err) {
    console.log(
      '🚀 ~ file: reptileAllKeywords.js ~ line 24 ~ reptileAllKeywords ~ err',
      err
    )
  }
}

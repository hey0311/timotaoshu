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
const { insertEmail, insertErrorTask, deleteErrorTask } = require('./dbTool')
const reptileRequest = require('./reptileRequest')

module.exports = reptileShop

async function reptileShop({ keywords, rule, uri, page, order }) {
  return new Promise(async (resolve, reject) => {
    let $ = null
    try {
      $ = await reptileRequest({ uri })
    } catch (err) {
      await insertErrorTask({
        keywords,
        rule,
        uri,
        pageType: ERROR_TASK_PAGE_TYPE.SHOP_PAGE,
        page,
        order,
      })
      resolve()
      return
    }
    const email = rule.getEmail($)
    const bizName = rule.getBizName($)
    const firstName = rule.getFirstName($)
    const lastName = rule.getLastName($)
    const phone = rule.getPhone($)
    wss.broadcast({
      type: 'table',
      page,
      keywordsName: keywords.name,
      ruleName: rule.name,
      index: order,
      email: email || '空',
      result: email ? undefined : '忽略',
    })
    if (email) {
      const insertResult = await insertEmail({
        keywords,
        rule,
        shopUrl: uri,
        email,
        bizName,
        firstName,
        lastName,
        phone,
        order,
        page,
      })
      if (insertResult) {
        resolve()
      } else {
        resolve('错误,存取失败')
      }
    }
    resolve()
  })
}

const {
  ERROR_TASK_PAGE_TYPE,
  REPTILE_STATUS,
} = require('../../common/tool/constant')
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

async function reptileShop({
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
        reptileStatus,
      })
      resolve('店铺网址请求失败')
      return
    }
    const email = rule.getEmail($)
    const bizName = rule.getBizName($)
    const firstName = rule.getFirstName($)
    const lastName = rule.getLastName($)
    const phone = rule.getPhone($)
    // 这里应该就可以删除错误记录了
    let deleteErrorTaskResult = ''
    if (reptileStatus === REPTILE_STATUS.ERROR_TASKS && errorTaskId) {
      deleteErrorTaskResult = await deleteErrorTask(errorTaskId)
      deleteErrorTaskResult = ',' + deleteErrorTaskResult
    }
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
        reptileStatus,
      })
      console.log(`店铺地址${uri},${insertResult}`)
      resolve(insertResult + deleteErrorTaskResult)
    } else {
      console.log(`店铺地址${uri},无邮箱`)
      resolve('无邮箱' + deleteErrorTaskResult)
    }
  })
}

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
    // 如果已经是爬取过的shopUrl,直接放弃
    try {
      // const currentPreShopUrl = uri.split('?')[0]
      // let sql = `select COUNT(*) from shopurl where shopurl="${currentPreShopUrl}"`
      // let result = tool.getData(await db.query(sql))
      // if (result) {
      //   wss.broadcast({
      //     type: REPTILE_STATUS.ERROR_TASKS,
      //     page,
      //     keywordsName: keywords.name,
      //     ruleName: rule.name,
      //     index: order,
      //     result: '网址重复',
      //   })
      //   // 删掉
      //   await deleteErrorTask(errorTaskId)
      //   resolve('网址重复')
      //   return
      // }
      let $ = null
      try {
        $ = await reptileRequest({ uri })
      } catch (err) {
        try {
          await insertErrorTask({
            keywords,
            rule,
            uri,
            pageType: ERROR_TASK_PAGE_TYPE.SHOP_PAGE,
            page,
            order,
            reptileStatus,
          })
        } catch (err) {
          console.log(
            '🚀 ~ file: reptileShop.js ~ line 47 ~ returnnewPromise ~ err',
            err
          )
        }
        console.log(`店铺网址请求失败,url:${uri}`)
        resolve(`店铺网址请求失败`)
        return
      }
      const email = rule.getEmail($, uri)
      const bizName = rule.getBizName($)
      const firstName = rule.getFirstName($)
      const lastName = rule.getLastName($)
      const phone = rule.getPhone($)
      // 这里应该就可以删除错误记录了
      let deleteErrorTaskResult = ''
      if (reptileStatus === REPTILE_STATUS.ERROR_TASKS && errorTaskId) {
        try {
          deleteErrorTaskResult = await deleteErrorTask(errorTaskId)
          deleteErrorTaskResult = ',' + deleteErrorTaskResult
        } catch (err) {
          console.log(
            '🚀 ~ file: reptileShop.js ~ line 65 ~ returnnewPromise ~ err',
            err
          )
        }
      }
      if (email) {
        // const insertResult = await insertEmail({
        //   keywords,
        //   rule,
        //   shopUrl: uri,
        //   email,
        //   bizName,
        //   firstName,
        //   lastName,
        //   phone,
        //   order,
        //   page,
        //   reptileStatus,
        // })
        // console.log(`店铺地址${uri},${insertResult}`)
        // resolve(insertResult + deleteErrorTaskResult)
        console.log(`店铺地址${uri},有邮箱:${email}`)
        // 直接插入数据库
        await insertEmail({
          type: 'email',
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
        wss.broadcast({
          type: REPTILE_STATUS.ERROR_TASKS,
          page,
          keywordsName: keywords.name,
          ruleName: rule.name,
          index: order,
          result: email,
        })
        resolve({
          type: 'email',
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
      } else {
        const aboutTitle = rule.getAboutTabText($)
        const isAccessDenied = rule.isAccessDenied($)
        const ifVerifyPage = rule.ifVerifyPage($)
        if (ifVerifyPage) {
          wss.broadcast({
            type: REPTILE_STATUS.ERROR_TASKS,
            page,
            keywordsName: keywords.name,
            ruleName: rule.name,
            index: order,
            result: '验证码',
          })
        } else {
          wss.broadcast({
            type: REPTILE_STATUS.ERROR_TASKS,
            page,
            keywordsName: keywords.name,
            ruleName: rule.name,
            index: order,
            result: '无邮箱',
          })
        }
        console.log(
          `无邮箱,店铺地址${uri} ,标签:${aboutTitle},权限:${isAccessDenied},验证:${ifVerifyPage}`
        )
        resolve('无邮箱' + deleteErrorTaskResult)
      }
      // 把shopUrl插入到shopurl表
      try {
        const preShopUrl = uri.split('?')[0]
        await db.query(`INSERT INTO shopurl (shopurl) VALUES ("${preShopUrl}")`)
      } catch (e) {}
    } catch (err) {
      console.log(
        '🚀 ~ file: reptileShop.js ~ line 112 ~ returnnewPromise ~ err',
        err
      )
      resolve('reptileShop err')
    }
  })
}

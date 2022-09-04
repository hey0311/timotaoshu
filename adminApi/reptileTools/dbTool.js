const { fs, rp, timoRp, path, tool, log, db, wss } = require('../tool/require')
const { ERROR_TASK_PAGE_TYPE } = require('../../common/tool/constant')

async function batchInsertEmail(emailList) {
  return new Promise(async (resolve, reject) => {
    console.log(
      '去重前邮箱:',
      emailList.map((item) => item.email)
    )
    // 去重
    const uniqueEmailList = emailList.filter((item, index) => {
      return emailList.findIndex((i) => i.email === item.email) === index
    })
    console.log(
      '去重后邮箱:',
      uniqueEmailList.map((item) => item.email)
    )
    for (let i = 0; i < uniqueEmailList.length; i++) {
      const result = await insertEmail(uniqueEmailList[i])
      console.log('邮箱保存结果:', result)
    }
    resolve(true)
  })
}
async function insertEmail({
  keywords,
  bizName,
  shopUrl,
  email,
  rule,
  firstName,
  lastName,
  phone,
  order,
  page,
  reptileStatus,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      // 先判断是否和表中的重复
      let sql = `select COUNT(*) from email where email="${email}"`
      let result = tool.getData(await db.query(sql))
      console.log(
        '🚀 ~ file: dbTool.js ~ line 43 ~ returnnewPromise ~ result',
        result,
        email
      )
      if (result) {
        resolve('重复')
        return
      }
      // mails[seqno].date = moment(headers.get('date')).format(
      //   'YYYY-MM-DD HH:mm:ss'
      // )
      let insertSql = `INSERT INTO email (email,keywordsId,ruleId,shopUrl,reptileTime,bizName,firstName,lastName,phone) VALUES `
      insertSql += `("${email}",${keywords.id},${rule.id},"${shopUrl}",now(),"${
        bizName || 'null'
      }","${firstName}","${lastName}","${phone}")`
      await db.query(insertSql)
      resolve(email)
    } catch (err) {
      log.error(err)
      resolve('保存异常')
    }
  })
}
/**
 * 更新关键词进度表
 * @param {*} param0
 * @returns
 */
async function updateKeywordsProgress({ keywords, rule, page, finished }) {
  return new Promise(async (resolve, reject) => {
    try {
      const records = await db.query(
        `select * from keywordsprogress where keywordsId=${keywords.id} and ruleId=${rule.id}`
      )
      if (records.length === 0) {
        await db.query(
          `insert into keywordsprogress (keywordsId,ruleId,finishPage,finished) values (${
            keywords.id
          },${rule.id},${page},${finished ? 1 : 0})`
        )
      } else {
        await db.query(
          `update keywordsprogress set finishPage=${page},finished=${
            finished ? 1 : 0
          } where keywordsId=${keywords.id} and ruleId=${rule.id}`
        )
      }
      // wss.broadcast(`更新进度成功`)
      log.info(
        `已更新进度,keywords:${keywords.name},rule:${rule.name},page:${page}`
      )
      resolve(true)
      return true
    } catch (err) {
      log.error(err)
      resolve(true)
      return false
    }
  })
}
/**
 * 插入错误记录
 * @param {*} keyword
 * @param {*} reptileType
 * @param {*} reptileAddress
 * @param {*} pageType
 * @returns
 */
async function insertErrorTask({
  keywords,
  rule,
  uri,
  pageType,
  page = 0,
  order = 0,
  reptileStatus,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      const records = await db.query(
        `select * from errortask where uri="${uri}"`
      )
      if (records.length !== 0) {
        // 如果重试次数超过5次,删掉
        if (records[0].retryCount >= 5) {
          await deleteErrorTask(records[0].id)
          resolve()
          return
        }
        //更新记录,retryCount
        await db.query(
          `update errortask set retryCount=${
            records[0].retryCount + 1
          } where keywordsId=${keywords.id} and ruleId=${
            rule.id
          } and pageType=${pageType}`
        )
      } else {
        // 新记录
        await db.query(
          `INSERT INTO errortask (keywordsId,ruleId,uri,retryCount,pageType,page,sequence) VALUES (${keywords.id}, ${rule.id}, "${uri}", 0, ${pageType},${page},${order})`
        )
      }
      // wss.broadcast({
      //   type: reptileStatus,
      //   keywordsName: keywords.name,
      //   ruleName: rule.name,
      //   page,
      //   index: order,
      //   result: '存入错误记录',
      // })
      resolve(true)
      return true
    } catch (err) {
      log.error(err)
      resolve(true)
      return false
    }
  })
}
async function deleteErrorTask(id) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.query(`delete from errortask where id=${id}`)
      resolve('删除成功')
    } catch (err) {
      log.error(err)
      resolve('删除失败')
    }
  })
}
module.exports = {
  insertEmail,
  insertErrorTask,
  deleteErrorTask,
  updateKeywordsProgress,
  batchInsertEmail,
}

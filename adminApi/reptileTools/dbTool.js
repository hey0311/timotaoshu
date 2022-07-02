const { fs, rp, timoRp, path, tool, log, db, wss } = require('../tool/require')
const { ERROR_TASK_PAGE_TYPE } = require('../../common/tool/constant')

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
}) {
  try {
    // 先判断是否和表中的重复
    let sql = `select COUNT(*) from email where email="${email}"`
    let result = tool.getData(await db.query(sql))
    if (result) {
      //如果数据库里有这本书
      wss.broadcast(`${email}在数据库已存在`)
      wss.broadcast({
        type: 'table',
        keywordsName: keywords.name,
        ruleName: rule.name,
        index: order,
        page,
        result: '重复',
      })
      return true
    }
    let insertSql = `INSERT INTO email (email,keywordsId,ruleId,shopUrl,reptileTime,bizName,firstName,lastName,phone) VALUES `
    // insertSql += `("${tool.toSql(bizName)}", ${
    //   keyword.id
    // },1,"${shopUrl}","${email}")`;
    insertSql += `("${email}",${keywords.id},${rule.id},"${shopUrl}",now(),"${
      bizName || 'null'
    }","${firstName}","${lastName}","${phone}")`
    await db.query(insertSql)
    wss.broadcast(`${email}已入库`)
    wss.broadcast({
      type: 'table',
      page,
      keywordsName: keywords.name,
      ruleName: rule.name,
      index: order,
      result: '已保存',
    })
    // wss.broadcast(bookName + "---" + catalog.name + "存取成功");
    return true
  } catch (err) {
    log.error(err)
    return false
  }
}
/**
 * 更新关键词进度表
 * @param {*} param0
 * @returns
 */
async function updateKeywordsProgress({ keywords, rule, page, finished }) {
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
    wss.broadcast(`更新进度成功`)
    return true
  } catch (err) {
    log.error(err)
    return false
  }
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
}) {
  try {
    const records = await db.query(`select * from errortask where uri="${uri}"`)
    if (records.length !== 0) {
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
    wss.broadcast(`插入errortask成功`)
    wss.broadcast({
      type: 'table',
      keywordsName: keywords.name,
      ruleName: rule.name,
      page,
      index: order,
      result: '存入错误记录',
    })
    return true
  } catch (err) {
    log.error(err)
    return false
  }
}
async function deleteErrorTask(id) {
  try {
    await db.query(`delete from errortask where id=${id}`)
    wss.broadcast(`删除errortask成功`)
    return true
  } catch (err) {
    log.error(err)
    return false
  }
}
module.exports = {
  insertEmail,
  insertErrorTask,
  deleteErrorTask,
  updateKeywordsProgress,
}

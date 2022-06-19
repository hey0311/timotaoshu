const { fs, rp, timoRp, path, tool, log, db } = require("../tool/require");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");

async function insertEmail({ keyword, bizName, shopUrl, email }) {
  try {
    // 先判断是否和表中的重复
    let sql = `select COUNT(*) from catalogcontent where email="${email}"`;
    let result = tool.getData(await db.query(sql));
    if (result) {
      //如果数据库里有这本书
      log.info(`${email}在数据库已存在`);
      return true;
    }
    let insertSql = `INSERT INTO catalogcontent (content, bookId, num, shopUrl, email) VALUES `;
    insertSql += `("${tool.toSql(bizName)}", ${
      keyword.id
    },1,"${shopUrl}","${email}")`;
    await db.query(insertSql);
    log.info(`${email}已入库`);
    // wss.broadcast(bookName + "---" + catalog.name + "存取成功");
    return true;
  } catch (err) {
    log.error(err);
    return false;
  }
}
async function insertErrorTask(keyword, reptileType, reptileAddress, pageType) {
  try {
    const retryCount = 0;
    await db.query(
      `INSERT INTO errortask (bookId,reptileType,reptileAddress,retryCount,pageType) VALUES (${keyword.id}, "${reptileType}", "${reptileAddress}", "${retryCount}", ${pageType})`
    );
    log.info(`插入errortask成功`);
    return true;
  } catch (err) {
    log.error(err);
    return false;
  }
}
async function deleteErrorTask(id) {
  try {
    await db.query(`delete from errortask where id=${id}`);
    log.info(`删除errortask成功`);
    return true;
  } catch (err) {
    log.error(err);
    return false;
  }
}
module.exports = {
  insertEmail,
  insertErrorTask,
  deleteErrorTask,
};

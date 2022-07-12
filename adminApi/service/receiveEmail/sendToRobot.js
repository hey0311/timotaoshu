const receiveEmail = require('../../mailTool/receiveEmail')
const { batchSend } = require('../../sendTools/batchSend')
const { oauth, tool, db, log, fs, path } = require('../../tool/require')
const moment = require('moment')

async function receiveEmailService() {
  return new Promise(async (resolve, reject) => {
    let data = []
    // 获取发件箱列表
    let mailBoxList = await db.query(`select * from emailbox`)
    for (let i = 0; i < mailBoxList.length; i++) {
      const result = await receiveEmail(mailBoxList[i].email)
      console.log(
        '🚀 ~ file: receiveEmailService.js ~ line 13 ~ returnnewPromise ~ result',
        result
      )
      // 过滤
      // let sql = `select COUNT(*) from email where email="${mailBoxList[i].email}"`
      // let exist = tool.getData(await db.query(sql))
      // if (exist) {
      //   data.push(...result)
      // }
      for (let j = 0; j < result.length; j++) {
        const mail = result[j]
        if (
          mail.from.indexOf('buyshiphere') === -1 &&
          mail.from.indexOf('weixin.qq.com') === -1
        ) {
          data.push(mail)
        }
      }
    }
    console.log(
      '🚀 ~ file: receiveEmailService.js ~ line 27 ~ returnnewPromise ~ data',
      data
    )
    // 存到数据库里

    for (let i = 0; i < data.length; i++) {
      if (!data[i]) {
        continue
      }
      // 检测重复
      let sql = `select COUNT(*) from receivemail where from_box="${data[i].from}" and receive_time="${data[i].date}"`
      let count = tool.getData(await db.query(sql))
      if (count) {
        console.log(`${data[i]}重复,跳过`)
        continue
      }
      await db.query(
        `insert into receivemail (from_box,to_box,receive_time,subject,content,status) values ("${data[i].from}","${data[i].to}","${data[i].date}","${data[i].subject}","",0)`
      )
    }
    resolve(data)
  })
}

module.exports = receiveEmailService

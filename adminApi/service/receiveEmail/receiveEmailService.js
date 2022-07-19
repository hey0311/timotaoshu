const receiveEmail = require('../../mailTool/receiveEmail')
const { batchSend } = require('../../sendTools/batchSend')
const { oauth, tool, db, log, fs, path } = require('../../tool/require')
const moment = require('moment')
const sendMessage = require('../../mailTool/robot')

async function receiveEmailService() {
  return new Promise(async (resolve, reject) => {
    let data = []
    // 获取发件箱列表
    let mailBoxList = await db.query(`select * from emailbox`)
    // 加上一个邮箱
    mailBoxList.push({
      email: 'monica@apriltec.com',
    })
    for (let i = 0; i < mailBoxList.length; i++) {
      const result = await receiveEmail(mailBoxList[i].email)
      const keys = Object.keys(result)
      for (let j = 0; j < keys.length; j++) {
        const mail = result[keys[j]]
        if (
          mail.from.indexOf('buyshiphere') === -1 &&
          mail.from.indexOf('weixin.qq.com') === -1
        ) {
          data.push(mail)
        }
      }
    }
    // 存到数据库里

    for (let i = 0; i < data.length; i++) {
      if (!data[i]) {
        continue
      }
      // 检测重复
      const mails = await db.query(
        `select * from receivemail where from_box="${data[i].from}" and receive_time="${data[i].date}"`
      )
      if (mails.length > 0) {
        // 判断有没有发送消息
        console.log(`${data[i]}重复,跳过`)
        continue
      }
      const html = data[i].html ? data[i].html.replace(/"/g, "'") : ''
      await db.query(
        `insert into receivemail (from_box,to_box,receive_time,subject,html,message_status,handle_status) values ("${data[i].from}","${data[i].to}","${data[i].date}","${data[i].subject}","${html}",0,0)`
      )
      console.log(`邮件${data[i].email}插入成功`)
    }
    resolve(data)
  })
}

module.exports = receiveEmailService

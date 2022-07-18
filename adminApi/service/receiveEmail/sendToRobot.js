const receiveEmail = require('../../mailTool/receiveEmail')
const { batchSend } = require('../../sendTools/batchSend')
const { oauth, tool, db, log, fs, path } = require('../../tool/require')
const moment = require('moment')
const sendMessage = require('../../mailTool/robot')

async function sendToRobot() {
  return new Promise(async (resolve, reject) => {
    const mails = await db.query(
      `select * from receivemail where message_status=0`
    )

    for (let i = 0; i < mails.length; i++) {
      const messageResult = await sendMessage(mails[i])
      if (messageResult) {
        await db.query(`update receivemail set message_status=1`)
      }
      // 如果出现垃圾邮件,该邮箱暂停发送
      if (mails[i].subject === '邮件未能发送成功') {
        const to_boxStr = mails[i].to_box.split('<')[1].slice(0, -1)
        const to_box = await db.query(
          `select * from emailbox where email="${to_boxStr}"`
        )
        if (to_box.length !== 0) {
          const updateResult = await db.query(
            `update emailbox set active=0 where id="${to_box[0].id}"`
          )
          console.log(`${to_box}被判断垃圾邮件,暂停发送`)
        }
      }
    }
    resolve(true)
  })
}

module.exports = sendToRobot

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
    console.log(
      '🚀 ~ file: sendToRobot.js ~ line 12 ~ returnnewPromise ~ mails',
      mails
    )

    for (let i = 0; i < mails.length; i++) {
      const messageResult = await sendMessage(mails[i])
      if (messageResult) {
        await db.query(`update receivemail set message_status=1`)
      }
    }
    resolve(true)
  })
}

module.exports = sendToRobot

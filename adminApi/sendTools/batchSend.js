const { fs, rp, timoRp, path, tool, log, db } = require('../tool/require')
const nodemailer = require('nodemailer')
const { sendEmail } = require('./sendEmail')

async function batchSend() {
  // 取1000个没发过的邮箱
  //   const emailList = await db.query(
  //     `select * from email where sendStatus = 0 limit 0,1000`
  //   )
  const emailList = []
  for (let i = 0; i < emailList.length; i++) {
    // 随机取一个模板
    const template = await db.query(
      `select * from emailtemplate where active=1 order by rand() limit 1`
    )
    if (template.length === 0) {
      return
    }
    console.log(
      '🚀 ~ file: batchSend.js ~ line 15 ~ batchSend ~ template',
      template
    )
    // 随机取一个发件箱
    const sendbox = await db.query(
      `select * from emailbox where active=1 order  by rand() limit 1`
    )
    if (sendbox.length === 0) {
      return
    }
    console.log(
      '🚀 ~ file: batchSend.js ~ line 20 ~ batchSend ~ sendbox',
      sendbox
    )
    const emailParams = {
      from: sendbox[0].email,
      to: emailList[i].email,
      subject: template[0].subject,
      content: template[0].content,
    }
    console.log(
      '🚀 ~ file: batchSend.js ~ line 26 ~ batchSend ~ emailParams',
      emailParams
    )
    await sendEmail(emailParams)
  }
  console.log('already sent')
}
module.exports = {
  batchSend,
}

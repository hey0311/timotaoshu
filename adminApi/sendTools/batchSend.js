const { fs, rp, timoRp, path, tool, log, db } = require('../tool/require')
const nodemailer = require('nodemailer')
const { sendEmail } = require('./sendEmail')

const MAX_SEND_COUNT = 500
async function batchSend() {
  // check,今天是否达到发送上限
  const date = new Date()
  const todayStart = new Date(
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`
  )
  const todayEnd = new Date(
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 23:59:59`
  )
  const sendCountTodayObj = await db.query(
    `select count(*) from email where UNIX_TIMESTAMP(sendTime)>=${
      todayStart.getTime() / 1000
    } and UNIX_TIMESTAMP(sendTime)<=${todayEnd.getTime() / 1000}`
  )
  const sendCount = sendCountTodayObj[0]['count(*)']
  if (sendCount > MAX_SEND_COUNT) {
    console.log(`达到发送上限${MAX_SEND_COUNT},放弃`)
    return
  }
  let email = [];
  for (let i = 0; i < 10; i++) {
    // 随机取1个没发过的邮箱
    email = await db.query(
      `select * from email where email not in (select email from emailblack) and sendStatus=${i} order by sendTime asc limit 1`
    )
    console.log('🚀 ~ file: batchSend.js ~ line 29 ~ batchSend ~ email - 0524',i, email)
    if (email.length !== 0) {
      // 如果没有新邮箱,找旧邮箱
      // email = await db.query(
      //   `select * from email where email not in (select email from emailblack) and sendStatus=2 order by sendTime asc limit 1`
      // )
      // console.log(
      //   '🚀 ~ file: batchSend.js ~ line 34 ~ batchSend ~ email',
      //   email
      // )
      break;
    }
  }
  // 检查黑名单
  const blackList = await db.query(`select * from emailblack`)
  const blackEmail = blackList.find((item) => item.email === email[0].email)
  if (blackEmail) {
    console.log(`是黑名单,取消发送,${blackEmail}`)
    return
  }
  if(email.length===0){
    return
  }
  // 如果不符合邮箱格式,看做发送成功吧
  let reg = /^[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/
  if(!reg.test(email[0].email)){
    console.log('not email format')
    await db.query(
      `update email set sendStatus=99,sendTime=now(),sendbox_id=1,template_id=1,send_result="wrong email" where id=${email[0].id}`
    )
    return
  }
  // if(email[0].email===)
  // 随机取一个模板
  const template = await db.query(
    `select * from emailtemplate where active=1 order by rand() limit 1`
  )
  if (template.length === 0) {
    return
  }
  // 随机取一个发件箱
  const sendbox = await db.query(
    `select * from emailbox where active=1 order  by rand() limit 1`
  )
  if (sendbox.length === 0) {
    return
  }
  const emailParams = {
    from: sendbox[0].email,
    to: email[0].email,
    subject: template[0].subject,
    content: template[0].content,
  }
  const sendResult = await sendEmail(emailParams)
  // 邮箱标记已发送
  if (sendResult && sendResult !== 'error') {
    let sendResponse = 'no response'
    if (sendResult.response && typeof sendResult.response === 'string') {
      sendResponse = sendResult.response.slice(0, 254)
    }
    const sendStatus = email[0].sendStatus ? Number(email[0].sendStatus) + 1 : 1
    await db.query(
      `update email set sendStatus=${sendStatus},sendTime=now(),sendbox_id=${sendbox[0].id},template_id=${template[0].id},send_result="${sendResponse}" where id=${email[0].id}`
    )
  }
  console.log(`${email[0].email} already sent`)
}
module.exports = {
  batchSend,
}

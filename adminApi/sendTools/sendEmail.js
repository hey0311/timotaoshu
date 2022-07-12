const { fs, rp, timoRp, path, tool, log, db } = require('../tool/require')
const nodemailer = require('nodemailer')

async function sendEmail({ from, to, subject, content }) {
  return new Promise(async (resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: 'smtp.exmail.qq.com',
      // service: "qq",
      // port: 587,
      secure: true, // true for 465, false for other ports
      auth: {
        user: from, // generated ethereal user
        pass: 'Fangcuizhu123', // generated ethereal password
      },
    })
    // 更改签名邮箱
    content = content.replace('info@buyshiphere.com', from)

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from, // sender address
      // to: "bar@example.com, baz@example.com", // list of receivers
      to,
      subject,
      text: '', // plain text body
      html: content, // html body
    })

    console.log('Message sent: %s', info)
    if (info.messageId) {
      resolve(info)
    } else {
      resolve('error')
    }
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
  })
}
module.exports = {
  sendEmail,
}

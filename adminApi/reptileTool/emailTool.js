const { fs, rp, timoRp, path, tool, log, db } = require("../tool/require");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");
const nodemailer = require("nodemailer");

async function sendEmail({ subject, content }) {
  let transporter = nodemailer.createTransport({
    host: "smtp.exmail.qq.com",
    // service: "qq",
    // port: 587,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "info@buyshiphere.com", // generated ethereal user
      pass: "Fangcuizhu123", // generated ethereal password
    },
  });
  console.log("ready send email");

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "info@buyshiphere.com", // sender address
    // to: "bar@example.com, baz@example.com", // list of receivers
    to: "hey0311@qq.com",
    subject: "Hello ✔", // Subject line
    text: "", // plain text body
    html: content, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
module.exports = {
  sendEmail,
};

var express = require("express");
var router = express.Router();
const { oauth, tool, db, log, fs, path } = require("../../tool/require");
const getImg = require("../../reptileTool/getImg.js");
let reptileCommon = require("../../reptileTool/common/reptileCommon");
const nodemailer = require("nodemailer");

let lastTime = 0;
router.use("", oauth(), async function (req, res, next) {
  // let startTime = new Date().getTime();
  // if(startTime - lastTime <= 1000*60*60 * 1){  //距离上次爬取超过1个小时
  //     res.send(tool.toJson(null, '爬取全部书本图片功能，1个小时只能爬取一次', 1002));
  //     return;
  // }
  // lastTime = startTime;
  // let bookList = await db.query('select * from book where type=3');
  // bookList.forEach(async (book, index) => {
  //     let exists = fs.existsSync(path.join(__dirname, `../../books/${book.id}/logo.png`));
  //     if(!exists){
  //         let imgUrl = '';
  //         if (book.imgUrl.indexOf("http") === 0) {
  //             imgUrl = book.imgUrl;
  //         } else {
  //             imgUrl = reptileCommon[book.reptileType].baseUrl + book.imgUrl;
  //         }
  //         await getImg(book.id, imgUrl);
  //     }
  // })
  // res.send(tool.toJson('', '', 1000));
  //   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  res.send(tool.toJson("", "", 1000));
});

function sendMail() {
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

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "info@buyshiphere.com", // sender address
    // to: "bar@example.com, baz@example.com", // list of receivers
    to: "hey0311@qq.com",
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
module.exports = router;

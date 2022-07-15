var Imap = require('imap')
var MailParser = require('mailparser').MailParser
const moment = require('moment')

async function receiveEmail(mailbox) {
  return new Promise(async (resolve, reject) => {
    let mails = {}
    var imap = new Imap({
      user: mailbox, //你的邮箱账号
      password: 'Fangcuizhu123', //你的邮箱密码
      host: 'imap.exmail.qq.com', //邮箱服务器的主机地址
      port: 993, //邮箱服务器的端口地址
      tls: true, //使用安全传输协议
      tlsOptions: { rejectUnauthorized: false }, //禁用对证书有效性的检查
    })

    function openInbox(cb) {
      imap.openBox('INBOX', true, cb)
    }

    imap.once('ready', function () {
      openInbox(function (err, box) {
        if (err) throw err

        imap.search(
          ['UNSEEN', ['SINCE', 'May 10,2022']],
          function (err, results) {
            //搜寻2017-05-20以后未读的邮件

            if (err) throw err

            if (results.length === 0) {
              resolve(mails)
              return
            }
            var f = imap.fetch(results, { bodies: '' }) //抓取邮件（默认情况下邮件服务器的邮件是未读状态）

            f.on('message', function (msg, seqno) {
              var mailparser = new MailParser()
              let result = {}

              msg.on('body', function (stream, info) {
                stream.pipe(mailparser) //将为解析的数据流pipe到mailparser

                //邮件头内容
                mailparser.on('headers', function (headers) {
                  // console.log('邮件主题: ' + headers.get('subject'))
                  // console.log('发件人: ' + headers.get('from').text)
                  // console.log('收件人: ' + headers.get('to').text)
                  if (!mails[seqno]) {
                    mails[seqno] = {}
                  }
                  mails[seqno].subject = headers.get('subject')
                  mails[seqno].from = headers.get('from').text
                  mails[seqno].to = headers.get('to').text
                  mails[seqno].date = moment(headers.get('date')).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                  // mailList.push({
                  //   subject: headers.get('subject'),
                  //   from: headers.get('from').text,
                  //   to: headers.get('to').text,
                  //   date: moment(headers.get('date')).format(
                  //     'YYYY-MM-DD HH:mm:ss'
                  //   ),
                  //   // date: headers.get('date').getTime(),
                  // })
                })

                //邮件内容

                mailparser.on('data', function (data) {
                  if (data.type === 'text') {
                    if (!mails[seqno]) {
                      mails[seqno] = {}
                    }
                    mails[seqno].html = data.html || data.text
                    // console.log(
                    //   '🚀 ~ file: receiveEmail.js ~ line 65 ~ data',
                    //   data
                    // )
                    // //邮件正文
                    // console.log(
                    //   '邮件内容信息>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
                    // )
                    // console.log('邮件内容: ' + data.html)
                  }
                  // if (data.type === 'attachment') {
                  //   //附件
                  //   console.log(
                  //     '邮件附件信息>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
                  //   )
                  //   // console.log('附件名称:' + data.filename) //打印附件的名称
                  //   // data.content.pipe(fs.createWriteStream(data.filename)) //保存附件到当前目录下
                  //   data.release()
                  // }
                })
              })
              msg.once('end', function () {
                console.log(seqno + '完成')
                // resolve(result)
              })
            })
            f.once('error', function (err) {
              console.log('抓取出现错误: ' + err)
            })
            f.once('end', function () {
              console.log('所有邮件抓取完成!')
              // resolve(mailList)
              // resolve(result)
              resolve(mails)
              imap.end()
            })
          }
        )
      })
    })

    imap.once('error', function (err) {
      console.log(err)
    })

    imap.once('end', function () {
      console.log('关闭邮箱')
    })

    imap.connect()
  })
}

module.exports = receiveEmail

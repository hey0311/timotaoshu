const axios = require('axios')
const url =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=9ac2c43d-1299-4785-9100-8f516cd0373e'
async function sendMessage(mail) {
  // return new Promise(async (resolve, reject) => {
  //   axios
  //     .post(url, {
  //       msgtype: 'markdown',
  //       markdown: {
  //         content: `猪仔,你收到一封新邮件。\n
  //            >发件人:<font color=\"comment\">${mail.from}</font>
  //            >主题:<font color=\"comment\">${mail.subject}</font>
  //            >收件箱:<font color=\"comment\">${mail.to}</font>
  //            >接收时间:<font color=\"comment\">${mail.date}</font>`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log('🚀 ~ file: testRobot.js ~ line 6 ~ .then ~ res', res)
  //       resolve('发送成功')
  //     })
  // })
  return new Promise(async (resolve, reject) => {
    axios
      .post(url, {
        msgtype: 'template_card',
        template_card: {
          card_type: 'text_notice',
          // source: {
          //   // icon_url:
          //   //   'https://wework.qpic.cn/wwpic/252813_jOfDHtcISzuodLa_1629280209/0',
          //   desc: mail.to,
          //   desc_color: 0,
          // },
          // main_title: {
          //   title: mail.from,
          //   desc: '回复了邮件',
          // },
          // emphasis_content: {
          //   title: '100',
          //   desc: '数据含义',
          // },
          // quote_area: {
          //   type: 1,
          //   url: 'https://work.weixin.qq.com/?from=openApi',
          //   appid: 'APPID',
          //   pagepath: 'PAGEPATH',
          //   title: '邮件内容',
          //   quote_text: mail.content.slice(0, 100),
          // },
          sub_title_text: mail.from_box,
          horizontal_content_list: [
            {
              keyname: '主题',
              value: mail.subject,
            },
            {
              keyname: '收件箱',
              value: mail.to_box,
            },
            {
              keyname: '时间',
              value: mail.receive_time,
            },
            // {
            //   keyname: '企微官网',
            //   value: '点击访问',
            //   type: 1,
            //   url: 'https://work.weixin.qq.com/?from=openApi',
            // },
            // {
            //   keyname: '企微下载',
            //   value: '企业微信.apk',
            //   type: 2,
            //   media_id: 'MEDIAID',
            // },
          ],
          jump_list: [
            {
              type: 1,
              url: `http://43.134.102.124:1111/home?id=${mail.id}`,
              title: '查看详细信息',
            },
            // {
            //   type: 2,
            //   appid: 'APPID',
            //   pagepath: 'PAGEPATH',
            //   title: '跳转小程序',
            // },
          ],
          card_action: {
            type: 1,
            url: `http://43.134.102.124:1111/home?id=${mail.id}`,
            appid: 'APPID',
            pagepath: 'PAGEPATH',
          },
        },
      })
      .then((res) => {
        resolve(true)
      })
      .catch((err) => {
        console.log(
          '🚀 ~ file: robot.js ~ line 103 ~ returnnewPromise ~ err',
          err
        )
        resolve(false)
      })
  })
}

module.exports = sendMessage

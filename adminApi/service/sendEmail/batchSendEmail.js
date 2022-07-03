const { batchSend } = require('../../sendTools/batchSend')
const { oauth, tool, db, log, fs, path } = require('../../tool/require')

async function batchSendEmail() {
  return new Promise(async (resolve, reject) => {
    // reject("mysql服务器爆棚，暂不允许爬取");
    // return;
    await batchSend()
    resolve('已发送')
  })
}

module.exports = batchSendEmail

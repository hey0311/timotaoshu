const { oauth, tool, db, log, wss, rp } = require('../tool/require')
const { check, startReptile } = require('../service/ip/')
const redisData = require('../../common/tool/redisData')
async function reptileIp() {
  return new Promise(async (resolve, reject) => {
    wss.broadcast(`开始检查ip`)
    await check()
    let ipList = await redisData.ipList.getAllIpList()
    while (ipList.length < 10) {
      wss.broadcast(`可用ip数量${ipList.length},重新爬取`)
      await startReptile(1, 1)
      ipList = await redisData.ipList.getAllIpList()
      wss.broadcast(`当前ip数量:${ipList.length}`)
    }
    resolve()
  })
}

module.exports = reptileIp

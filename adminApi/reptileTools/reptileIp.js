const { oauth, tool, db, log, wss, rp } = require('../tool/require')
const { check, startReptile } = require('../service/ip/')
const redisData = require('../../common/tool/redisData')
const { REPTILE_STATUS } = require('../../common/tool/constant')
async function reptileIp() {
  return new Promise(async (resolve, reject) => {
    console.log('开始检查IP')
    wss.broadcast({
      type: REPTILE_STATUS.CHECK_IP,
    })
    await check()
    let ipList = await redisData.ipList.getAllIpList()
    while (ipList.length < 10) {
      console.log(`可用ip数量${ipList.length},重新爬取`)
      await startReptile(1, 1)
      ipList = await redisData.ipList.getAllIpList()
      console.log(`当前ip数量:${ipList.length}`)
    }
    resolve()
  })
}

module.exports = reptileIp

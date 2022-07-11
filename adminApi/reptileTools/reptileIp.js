const { oauth, tool, db, log, wss, rp } = require('../tool/require')
const { check, startReptile } = require('../service/ip/')
const redisData = require('../../common/tool/redisData')
const { REPTILE_STATUS } = require('../../common/tool/constant')
const MIN_IP_NUM = 20
async function reptileIp() {
  return new Promise(async (resolve, reject) => {
    // 判断状态
    if (
      global.reptileStaus !== REPTILE_STATUS.ALL_KEY_WORDS &&
      global.reptileStaus !== REPTILE_STATUS.ERROR_TASKS
    ) {
      console.log('停止爬虫状态,不检查ip')
      return
    }
    console.log('开始检查IP')
    // resolve()
    // return
    await check()
    console.log(`检查完毕`)
    let ipList = await redisData.ipList.getAllIpList()
    while (ipList.length < MIN_IP_NUM) {
      console.log(`可用ip数量${ipList.length},小于${MIN_IP_NUM},重新爬取`)
      await startReptile(1, 1)
      ipList = await redisData.ipList.getAllIpList()
      console.log(`当前ip数量:${ipList.length}`)
    }
    // wss.broadcast({
    //   type: REPTILE_STATUS.CHECK_IP,
    // })
    resolve()
  })
}

module.exports = reptileIp

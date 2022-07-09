const { fs, rp, timoRp, path, tool, log, db, wss } = require('../tool/require')
const axios = require('axios')
const checkIp = require('../reptileTool/ip/checkIp')
const MIN_IP_COUNT = 10
let IP_LIST = []
/**
 * 检查ip是否过期
 * @param {*} ipObj
 * @returns
 */
function isIpTimeout(ipObj) {
  return new Date(ipObj.endtime) <= Date.now()
}
function setIpFail(ipObj) {
  console.log('set ip error', ipObj)
  let curIpObj = IP_LIST.find((item) => item.ip === ipObj.ip)
  if (curIpObj) {
    if (!curIpObj.errorCount) {
      curIpObj.errorCount = 0
    }
    curIpObj.errorCount++
  }
}
// 随机在ipList取一个可用的ip
function getRandomIp() {
  // 如果两次请求失败,就过滤掉
  IP_LIST = IP_LIST.filter((item) => {
    return !isIpTimeout(item) && (!item.errorCount || item.errorCount <= 2)
  })
  // 如果ip数量过少,重新获取,异步的
  if (IP_LIST.length < MIN_IP_COUNT) {
    console.log(
      `当前可用ip数量${IP_LIST.length}条,少于${MIN_IP_COUNT}条,开始补充`
    )
    fetchIpList()
    if (IP_LIST.length === 0) {
      return null
    }
  }
  // 随机返回一个ip
  let random = Math.floor(Math.random() * IP_LIST.length)
  let result = IP_LIST[random]
  return result
  // return `${result.protocol}://${result.ip}:${result.port}`
}
async function checkIpList(ipList) {
  return new Promise(async (resolve, reject) => {
    let yu = length > 10 ? Math.ceil(length / 20) : length > 1 ? 1 : 0 //允许有几个个缺失  默认丢弃最后几个未返回的
    let needCount = length - yu
    let overLength = 0
    let list = []
    for (i; i < ipList.length; i++) {
      tool.ipQueue.push(
        {
          params: [ipList[i]],
          pro: checkIp,
          result: (data, isTrue, err) => {
            overLength++
            if (overLength > needCount) {
              return
            }
            if (isTrue) {
              console.log(
                `${data.protocol}://${data.ip}:${data.port}可以访问，当前第${overLength}条，共${length}条IP需要检查`
              )
              list.push(data)
            } else {
              try {
                console.log(
                  `${data.protocol}://${data.ip}:${data.port}不可以访问，当前第${overLength}条，共${length}条IP需要检查，不可访问原因：${err}`
                )
              } catch (err2) {
                console.log(
                  `当前第${overLength}条，共${length}条IP需要检查，不可访问原因：1、${err2}，2、${err}`
                )
              }
            }
            finish()
          },
          error: () => {
            log.error('由于未知原因，来到了这里，警惕')
            overLength++
            if (overLength > needCount) {
              return
            }
            finish()
          },
        },
        (err) => {}
      )
    }
    async function finish() {
      if (overLength == needCount) {
        end()
      }
    }

    async function end() {
      console.log(
        `共检查了${ipList.length}条数据，其中有${list.length}条IP是有用的，开始保存`
      )
      IP_LIST = IP_LIST.concat(list)
      // await tool.redisData.ipList.setIpList(list)
      console.log(`保存${list.length}条IP完毕`)
      resolve()
    }
  })
}
/**
 * 远程获取ip
 */
async function fetchIpList() {
  return new Promise(async (resolve, reject) => {
    const url =
      'http://http2.9vps.com/getip.asp?username=13641294686&pwd=f5f5cac7bae0538879961dbb8321ed47&geshi=2&fenge=1&fengefu=&Contenttype=1&getnum=20'
    axios
      .get(url)
      .then(async (res) => {
        if (res?.data?.data) {
          const ipArr = res.data.data.map((item) => {
            return {
              protocol: 'http',
              ip: item.ip,
              port: item.port,
              endtime: item.endtime,
            }
          })
          // check一下ip
          await checkIpList(ipArr)
          // IP_LIST = IP_LIST.concat(ipArr)
          // console.log(`补充了${ipArr.length}条ip`)
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch((err) => {
        log.error(err)
        resolve(false)
      })
  })
}
function checkIpList() {}
module.exports = {
  getRandomIp,
  checkIpList,
  fetchIpList,
  setIpFail,
}

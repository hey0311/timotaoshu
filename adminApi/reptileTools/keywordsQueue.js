let async = require('async')

let keywordsQueue = async.queue((obj, cb) => {
  obj.pro
    .apply(this, [obj.params])
    .then(async (data) => {
      if (typeof data == 'string' && data.indexOf('错误：') == 0) {
        obj.error && (await obj.error(data))
        await cb()
      } else {
        obj.result && (await obj.result(data)) //data是字符串或者null
        await cb()
      }
    })
    .catch(async (err) => {
      console.log('shopQueue报错')
      console.log(err)
      obj.error && (await obj.error('错误：' + err))
      await cb(err)
    })
}, 2)

keywordsQueue.empty = function () {
  // console.log("当最后一个任务交给worker执行时，会调用empty函数");
  console.log('shopQWueue已空')
  // console.log("开始执行到最后一个");
}
keywordsQueue.saturated = function () {
  // console.log("即将用完");
  // console.log("worker数量将用完时，会调用saturated函数");
}
keywordsQueue.drain = function () {
  // global.isReptile = false;       //这里是紧急修复bug，。问题是获取小说的json时，没有章节，然后导致爬书的时候，数量不对。到时候需要优化
  // console.log("当所有任务都执行完时，会调用drain函数");
}
async function addKeywordsToQueue(params, pro) {
  // return new Promise((resolve, reject) => {
  keywordsQueue.push({
    params,
    pro,
    result: async (data) => {
      // sucCount++;
      // end();
      // resolve();
    },
    error: async (data) => {
      // errCount++;
      // end();
      // reject();
    },
    // });
  })
}
async function batchAddKeywordsToQueue(paramsList, pro) {
  let emailList = []
  return new Promise((resolve, reject) => {
    let resultCount = 0
    for (let i = 0; i < paramsList.length; i++) {
      shopQueue.push({
        params: paramsList[i],
        pro,
        result: async (data) => {
          // sucCount++;
          // end();
          // resolve();
          resultCount++
          if (data && typeof data === 'object' && data.type === 'email') {
            emailList.push(data)
          }
          paramsList[i].result && paramsList[i].result(data)
          if (resultCount === paramsList.length) {
            resolve(emailList)
          }
        },
        error: async (data) => {
          // errCount++;
          // end();
          // reject();
          resultCount++
          paramsList[i].error && paramsList[i].error(data)
          if (resultCount === paramsList.length) {
            resolve()
          }
        },
      })
    }
  })
}

module.exports = {
  keywordsQueue,
  addKeywordsToQueue,
  batchAddKeywordsToQueue,
}

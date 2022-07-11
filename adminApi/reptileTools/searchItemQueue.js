let async = require('async')

let searchItemQueue = async.queue((obj, cb) => {
  obj.pro
    .apply(this, [obj.params])
    .then(async (data) => {
      if (typeof data == 'string' && data.indexOf('错误：') == 0) {
        // obj.error && (await obj.error(data))
        obj.result && (await obj.result(data)) //data是字符串或者null
        await cb()
      } else {
        obj.result && (await obj.result(data)) //data是字符串或者null
        await cb()
      }
    })
    .catch(async (err) => {
      console.log('searchItemQueue报错')
      console.log(err)
      obj.result && (await obj.result(data)) //data是字符串或者null
      // obj.error && (await obj.error('错误：' + err))
      await cb(err)
    })
}, 50)

searchItemQueue.empty = function () {
  console.log('searchItemQueue已空')
  // console.log("当最后一个任务交给worker执行时，会调用empty函数");
  // console.log("开始执行到最后一个");
}
searchItemQueue.saturated = function () {
  // console.log("即将用完");
  // console.log("worker数量将用完时，会调用saturated函数");
}
searchItemQueue.drain = function () {
  // global.isReptile = false;       //这里是紧急修复bug，。问题是获取小说的json时，没有章节，然后导致爬书的时候，数量不对。到时候需要优化
  // console.log("当所有任务都执行完时，会调用drain函数");
}

async function addSearchItemToQueue(params, pro) {
  // return new Promise((resolve, reject) => {
  searchItemQueue.push({
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
async function batchAddSearchItemToQueue(paramsList, pro) {
  return new Promise((resolve, reject) => {
    let emailList = []
    let length = paramsList.length
    let overLength = 0
    let yu = length > 10 ? Math.ceil(length / 30) : length > 1 ? 1 : 0 //允许有几个个缺失  默认丢弃最后几个未返回的
    let needCount = length - yu
    for (let i = 0; i < paramsList.length; i++) {
      searchItemQueue.push({
        params: paramsList[i],
        pro,
        result: async (data) => {
          if (overLength > needCount) {
            return
          }
          // 把邮箱保存起来,最后插入
          if (data && typeof data === 'object' && data.type === 'email') {
            emailList.push(data)
          }
          overLength++
          paramsList[i].result && paramsList[i].result(data)
          if (overLength === needCount) {
            console.log(`${overLength}错误记录全部完成`)
            resolve(emailList)
          }
        },
        error: async (data) => {
          overLength++
          paramsList[i].error && paramsList[i].error(data)
          if (overLength === needCount) {
            resolve()
          }
        },
      })
    }
  })
}

module.exports = {
  searchItemQueue,
  addSearchItemToQueue,
  batchAddSearchItemToQueue,
}

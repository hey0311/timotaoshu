global.__base = __dirname + '/' //设置全局require目录前缀
const express = require('express'),
  app = express()
var compress = require('compression') //gzip压缩
app.use(compress())
const routeEach = require('./core/routeEach')
// require('./core/datePrototype');
require('../common/prototype')
const morgan = require('./core/morganLog')
const scheduleObj = require('./core/schedule') //定时任务
// const upload = require('./core/upload-mutter');     //文件上传
const { fs, path, tool, log } = require('./tool/require')
const hostArr = require('../common/host') //允许访问的域名
const { REPTILE_STATUS } = require('../common/tool/constant')
// const bodyParser = require('body-parser');
global.server = false //如果是服务器且服务器开启了http代理(其中一种privoxy，若不熟悉请加群问群主)，改为true
global.serverProxy = 'http://127.0.0.1:8118' //服务器的代理
global.reptileCatalog = 0 //爬虫正在爬的数量
global.reptileStatus = REPTILE_STATUS.STOP

/*
 * 创建文件夹 start
 * 上传文件的目录
 * */
tool.hasDir(fs, path.join(__dirname, '../upload/'))
tool.hasDir(fs, path.join(__dirname, '../public'))
tool.hasDir(fs, path.join(__dirname, '../public/img'))
/*
 * 创建文件夹 end
 * */

app.all('*', function (req, res, next) {
  // if (hostArr.indexOf(req.headers.host) == -1) {
  //     log.error(`${req.headers.host}在${new Date().Format()}访问，已被拦截`);
  //     res.send("总有刁民想害朕，锦衣卫护驾");
  // } else {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
  // }
})

app.use(express.static(path.join(__dirname, 'public'))) //静态资源
morgan(app)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// 字段不符合就就不允许
app.use((req, res, next) => {
  let limit = tool.getParams(req, 'limit')
  if (limit && limit > 200) {
    res.send(tool.toJson('', 'limit参数不能大于200', 1002))
  } else {
    next()
  }
})
routeEach(app)
app.use(function (req, res, next) {
  res.send('没有接口')
})

module.exports = app

//捕获node异常  不允许退出
process.on('uncaughtException', function (err) {
  if (err.name !== 'AssertionError') {
    console.log('api异常退出被捕获了')
    console.log(err.stack)
    console.log('Node NOT Exiting...')
  }
})

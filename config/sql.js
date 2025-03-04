const { IS_LOCAL } = require('./config')

module.exports = {
  // host: '43.134.102.124',
  host: '127.0.0.1',
  port: '3306',
  user: IS_LOCAL ? 'root' : 'heyong',
  password: 'Hey7520_1',
  database: 'timotaoshu',
  multipleStatements: true, //是否允许执行多条sql语句
  // insecureAuth: true, //加入此项可解决此错误！！！  //使用旧（不安全）的连接方式去连接MySQL  远程连接
  // debug: true,            //是否把连接情况打印到文件里
  // connectionLimit: 1000,
  // connectionTimeout: 60 * 60 * 1000,
  // acquireTimeout: 60 * 60 * 1000,
  // timeout: 60 * 60 * 1000,
}

const {
  oauth,
  tool,
  db,
  log,
  rp,
  timoRp,
  request,
  cheerio,
  iconv,
  wss,
} = require('../../tool/require')
const axios = require('axios')

/*
 * 西刺
 * */
async function getIpList(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      uri: 'https://www.xicidaili.com/wt/' + page,
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
        // console.log(body2);
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    timoRp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('#ip_list tr')
        let i = 1,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(1).html(),
            port: value.find('td').eq(2).html(),
            address: value.find('td').eq(3).find('a').html()
              ? value.find('td').find('a').html().trim()
              : '',
            status: value.find('td').eq(4).html()
              ? value.find('td').eq(4).html().trim()
              : '',
            protocol: value.find('td').eq(5).html()
              ? value.find('td').eq(5).html().toLowerCase()
              : '',
            from: '西刺代理',
            fromHref: 'http://www.xicidaili.com/wt/',
            responseTime: value.find('td').eq(6).find('.bar').attr('title')
              ? value.find('td').eq(6).find('.bar').attr('title').trim()
              : '',
          })
        }

        let allPage = $('.pagination>a').eq(-2).html()
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        // console.log("我的西祠");
        // console.log("error了？");
        log.error(err)
        // resolve(false);
        // reject(err);
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
  })
}

/*
 * 快代理
 * */
async function getIpList2(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      uri: 'https://www.kuaidaili.com/free/inha/' + page,
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
        // console.log(body2);
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    rp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('table>tbody>tr')
        let i = 0,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(0).html(),
            port: value.find('td').eq(1).html(),
            address: value.find('td').eq(4).html()
              ? value.find('td').eq(4).html().trim()
              : '',
            status: value.find('td').eq(2).html()
              ? value.find('td').eq(2).html().trim()
              : '',
            protocol: value.find('td').eq(3).html()
              ? value.find('td').eq(3).html().toLowerCase()
              : '',
            from: '快代理',
            fromHref: 'https://www.kuaidaili.com/free/inha/',
            responseTime: value.find('td').eq(5).html()
              ? value.find('td').eq(5).html().trim()
              : '',
          })
        }

        let allPage = $('#listnav>ul>li').eq(-2).find('a').html()
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        log.error(err)
        // resolve(false);
        // reject();
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
  })
}

/*
 * 需要翻墙的
 * */
async function getIpList3(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      uri: 'https://www.us-proxy.org',
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
        // console.log(body2);
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    rp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('.table>tbody>tr')
        console.log(ipList)
        let i = 0,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(0).html(),
            port: value.find('td').eq(1).html(),
            address: value.find('td').eq(4).html()
              ? value.find('td').html().trim()
              : '',
            status: value.find('td').eq(2).html()
              ? value.find('td').eq(4).html().trim()
              : '',
            protocol: value.find('td').eq(3).html()
              ? value.find('td').eq(5).html().toLowerCase()
              : '',
          })
        }

        let allPage = 1
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        log.error(err)
        // resolve(false);
        resolve({
          ipArr: [],
          error: true,
        })
      })
  })
}

/*
 * 老版本开心代理 已经废弃了
 * */
async function getIpList4(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      uri: 'http://ip.kxdaili.com/ipList/' + page + '.html#ip',
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    rp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('.table>tbody>tr')
        let i = 0,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(0).html(),
            port: value.find('td').eq(1).html(),
            address: value.find('td').eq(5).html()
              ? value.find('td').eq(5).html().trim()
              : '',
            status: value.find('td').eq(2).html()
              ? value.find('td').eq(2).html().trim()
              : '',
            protocol: 'http',
            from: '开心代理',
            fromHref: 'http://ip.kxdaili.com',
            responseTime: value.find('td').eq(4).html()
              ? value.find('td').eq(4).html().trim()
              : '',
          })
        }

        let allPage = $('.page>a').eq(-2).html()
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        log.error(err)
        // resolve(false);
        // reject()
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
  })
}

/*
 * 新版本开心代理
 * */
async function getIpList5(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      // uri:"http://ip.kxdaili.com/ipList/" + page + ".html#ip",
      uri: 'http://www.kxdaili.com/dailiip/1/' + page + '.html',
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        let body2 = iconv.decode(body, 'utf-8') //用来查看页面
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
          body2,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    rp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('.active>tbody>tr')
        let i = 0,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(0).html(),
            port: value.find('td').eq(1).html(),
            address: value.find('td').eq(5).html()
              ? value.find('td').eq(5).html().trim()
              : '',
            status: value.find('td').eq(2).html()
              ? value.find('td').eq(2).html().trim()
              : '',
            protocol: 'http',
            from: '开心代理',
            fromHref: 'http://ip.kxdaili.com',
            responseTime: value.find('td').eq(4).html()
              ? value.find('td').eq(4).html().trim()
              : '',
          })
        }

        let allPage = $('#listnav>ul>li>a').eq(-1).html()
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        log.error(err)
        // resolve(false);
        // reject()
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
  })
}

/*
 * 免费IP代理
 * */
async function getIpList6(page) {
  return new Promise(async (resolve, reject) => {
    let option = {
      uri: 'http://ip.jiangxianli.com/?page=' + page,
      encoding: null,
      transform: function (body, response, resolveWithFullResponse) {
        // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
        // console.log(body2);
        return [
          cheerio.load(iconv.decode(body, 'utf-8'), { decodeEntities: false }),
          response.req.path,
        ]
      },
    }
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    rp(option)
      .then(function (data) {
        let $ = data[0]
        let ipList = $('.table-striped>tbody>tr')
        let i = 0,
          length = ipList.length
        let ipArr = []
        for (i; i < length; i++) {
          let value = ipList.eq(i)
          ipArr.push({
            ip: value.find('td').eq(1).html(),
            port: value.find('td').eq(2).html(),
            address: value.find('td').eq(5).html()
              ? value.find('td').eq(5).html().trim()
              : '',
            status: value.find('td').eq(3).html()
              ? value.find('td').eq(3).html().trim()
              : '',
            protocol: value.find('td').eq(4).html()
              ? value.find('td').eq(4).html().toLowerCase()
              : '',
            from: '免费IP代理',
            fromHref: 'http://ip.jiangxianli.com',
            responseTime: value.find('td').eq(7).html()
              ? value.find('td').eq(7).html().trim()
              : '',
          })
        }

        let allPage = $('#listnav>ul>li').eq(-2).find('a').html()
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch(function (err) {
        log.error(err)
        // resolve(false);
        // reject();
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
  })
}

async function getIpList7(page) {
  return new Promise(async (resolve, reject) => {
    const url =
      'http://http2.9vps.com/getip.asp?username=13641294686&pwd=f5f5cac7bae0538879961dbb8321ed47&geshi=2&fenge=1&fengefu=&Contenttype=1&getnum=30'
    axios
      .get(url)
      .then((res) => {
        if (res?.data?.data) {
          resolve({
            ipArr: res.data.data.map((item) => {
              return {
                protocol: 'http',
                ip: item.ip,
                port: item.port,
              }
            }),
            allPage: 100,
          })
        } else {
          resolve({
            // 为了promise.all  不进入catch状态
            ipArr: [],
            error: true,
          })
        }
      })
      .catch((err) => {
        log.error(err)
        resolve({
          // 为了promise.all  不进入catch状态
          ipArr: [],
          error: true,
        })
      })
    // let option = {
    //   uri: "http://http2.9vps.com/getip.asp?username=13641294686&pwd=f5f5cac7bae0538879961dbb8321ed47&geshi=2&fenge=1&fengefu=&Contenttype=1&getnum=100",
    //   encoding: null,
    //   //   transform: function (body, response, resolveWithFullResponse) {
    //   //     // let body2 = iconv.decode(body, "utf-8");  //用来查看页面
    //   //     // console.log(body2);
    //   //     return [
    //   //       cheerio.load(iconv.decode(body, "utf-8"), { decodeEntities: false }),
    //   //       response.req.path,
    //   //     ];
    //   //   },
    // };
    // let ip = await tool.redisData.ipList.getRandomIpList();
    // if(ip) option.proxy = ip;

    // rp(option)
    //   .then(function (data) {
    //     console.log("🚀 ~ file: getIpList.js ~ line 432 ~ data", data);
    //     const ipArr = data.data;
    //     const allPage = 100;
    //     resolve({
    //       ipArr,
    //       allPage,
    //     });
    //   })
    //   .catch(function (err) {
    //     log.error(err);
    //     // resolve(false);
    //     // reject();
    //     resolve({
    //       // 为了promise.all  不进入catch状态
    //       ipArr: [],
    //       error: true,
    //     });
    //   });
    // fetch(url)
    //   .then((res) => {
    //     console.log("🚀 ~ file: getIpList.js ~ line 453 ~ fetch ~ res", res);
    //   })
    //   .catch((err) => {
    //     console.log("🚀 ~ file: getIpList.js ~ line 455 ~ fetch ~ err", err);
    //   });
  })
}
// module.exports = getIpList2;
module.exports = async (page) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      //   getIpList2(page),
      //   getIpList3(page),
      //   getIpList5(page),
      getIpList7(page),
    ])
      .then((data) => {
        let allPage = 100
        let ipArr = []
        data.forEach((value, index) => {
          if (!value.error && allPage > value.allPage) allPage = value.allPage
          wss.broadcast(`获取到${value.ipArr.length}条ip`)
          ipArr = ipArr.concat(value.ipArr)
        })

        if (!allPage) allPage = 3
        resolve({
          ipArr,
          allPage,
        })
      })
      .catch((err) => {
        log.error(err)
        resolve(false)
      })
  })
}

// 用来检测是什么代理
// http://ip.chinaz.com/getip.aspx
// https://ipinfo.io/

// 获取ip代理列表
// http://www.xicidaili.com/
// http://www.xicidaili.com/wn  // 国内高匿代理  https
// http://www.xicidaili.com/wt  // 国内高匿代理  http
// https://www.kuaidaili.com/free/inha/2/   快代理
// http://ip.jiangxianli.com/?page=2//免费IP代理

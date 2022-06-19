const {
  fs,
  rp,
  timoRp,
  cheerio,
  iconv,
  path,
  tool,
  wss,
  log,
  db,
} = require("../tool/require");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");
const { insertEmail, insertErrorTask } = require("./dbTool");
// let reptileCommon = require("./common/reptileCommon")
const reptileCommon2 = require("./common/reptileCommon2");
const { addShopToQueue } = require("./queueTool");
const shopHandler = require("./shopHandler");
// catalog = searchItem
module.exports = async ({ keyword, rule, reptileAddress, page, order }) => {
  // reptileType = parseInt(reptileType);
  // timeout = parseInt(timeout);
  let timeout = 10000;
  return new Promise(async (resolve, reject) => {
    // let reptileCommon = await reptileCommon2(reptileType, keyword);
    let reptileCommon = rule;
    let start = 0;
    let startTime = new Date().getTime();
    global.reptileCatalog++;
    // console.log(`当前有${global.reptileCatalog}条章节正在爬取`);
    await startRp();

    async function startRp() {
      try {
        let msg = await startRpFn();
        resolve(msg);
      } catch (err) {
        reject(err);
        log.error(
          "超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:超乎意料的bug:" +
            err
        );
      }

      async function startRpFn() {
        return new Promise(async (resolve2, reject2) => {
          start++;
          let uri = reptileAddress;
          let option = {
            uri: uri,
            userAgent: reptileCommon.userAgent,
            encoding: null,
            transform: function (body, response, resolveWithFullResponse) {
              // return cheerio.load(iconv.decode(body, "gbk"), {decodeEntities: false});
              // return [cheerio.load(iconv.decode(body, "utf-8"), {decodeEntities: false}),iconv.decode(body, "utf-8")];
              // console.log(iconv.decode(body, reptileCommon.code));
              return [
                cheerio.load(iconv.decode(body, reptileCommon.code), {
                  decodeEntities: false,
                }),
                iconv.decode(body, reptileCommon.code),
              ];
            },
            timeout: timeout || 10000,
          };
          try {
            let data = await timoRp(option);
            let $ = data[0];
            // let body = data[1];
            let bizName = "";
            global.reptileCatalog--;
            try {
              bizName = reptileCommon.getCatalogContent($);
              const shopUrl = reptileCommon.getShopUrl($);
              log.info(
                `第${page}页第${order}个搜索项页面爬取完成,地址${reptileAddress},爬取到店铺:${shopUrl}`
              );
              // 这里再去拿邮箱吧
              if (shopUrl) {
                // push queue
                await addShopToQueue(
                  {
                    keyword,
                    rule,
                    shopUrl,
                    page,
                    order,
                    bizName,
                  },
                  shopHandler
                );
                resolve2();
              } else {
                // await insertErrorTask(
                //   keyword,
                //   // reptileType,
                //   rule.reptileTypeId,
                //   reptileAddress,
                //   ERROR_TASK_PAGE_TYPE.ITEM_PAGE
                // );
                resolve2(); // TODO: 这里应该重爬
              }
            } catch (err) {
              // log.error("我只是看个问题" + bookName + "_" + book.title);
              // log.error(err);

              // await db.query(
              //   `INSERT INTO progresserror (reptileType, originUrl, bookId, catalogId, reptileAddress, bookName, catalogName) VALUES (${reptileType}, "${originUrl}", "${bookId}", "${catalog.id}", "${catalog.reptileAddress}", "${bookName}", "${catalog.name}")`
              // );

              let endTime = new Date().getTime();
              log.error(
                `异常失败,开始时间${startTime},结束时间${endTime},耗时${
                  endTime - startTime
                }毫秒`
              );
              // log.error(
              //   " 错误地址： " +
              //     originUrl +
              //     catalog.reptileAddress +
              //     "，代理IP：" +
              //     option.proxy
              // );
              log.error("异常错误（谨慎）：" + err);
              resolve2("错误：异常错误（谨慎）：" + err);
              // global.reptileCatalog--;
              // console.log(`success:现在有${global.reptileCatalog}条章节正在爬取`)
              // console.log(originUrl + catalog.reptileAddress);
              // let endTime = new Date().getTime();
              // console.log(`成功响应，开始时间${startTime},结束时间${endTime},耗时${endTime-startTime}毫秒`);
            }
          } catch (err) {
            if (start >= 2) {
              global.reptileCatalog--;
              // console.log(`catch：现在有${global.reptileCatalog}条章节正在爬取`)
              // log.error(
              //   " 错误地址： " +
              //     originUrl +
              //     catalog.reptileAddress +
              //     ",代理IP：" +
              //     option.proxy
              // );
              let endTime = new Date().getTime();
              log.error(
                `响应失败,开始时间${startTime},结束时间${endTime},耗时${
                  endTime - startTime
                }毫秒`
              );
              // reject(err);
              log.error("连接2次都是失败，失败原因：" + err);

              // await db.query(
              //   `INSERT INTO progresserror (reptileType, originUrl, bookId, catalogId, reptileAddress, bookName, catalogName) VALUES (${reptileType}, "${originUrl}", ${bookId}, ${catalog.id}, "${catalog.reptileAddress}", "${bookName}", "${catalog.name}")`
              // );
              resolve2("错误：连接2次都是失败" + err); //连接5次都是失败   最好不要改，其他程序是判断这几个字的。
            } else {
              // log.error("连接" + start + "次都是失败" + err);
              resolve2(await startRpFn());
              // let set = setTimeout(() => {
              //     startRp();
              //     clearTimeout(set);
              //     set = null;
              // }, 200);
            }
          }
        });
      }
    }
  });
};

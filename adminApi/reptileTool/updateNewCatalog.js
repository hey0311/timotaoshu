const {
  fs,
  rp,
  timoRp,
  path,
  tool,
  db,
  cheerio,
  iconv,
  log,
} = require("../tool/require");
const { reptileConfig } = require("../tool/require2");

// const getCatalog = require("./getCatalog");
// let reptileCommon = require("./common/reptileCommon");
let reptileCommon2 = require("./common/reptileCommon2");
let getCatalogList = require("../reptileTool/getCatalogList");
/**
 * 爬取关键词
 * @param {*} sqlBook
 * @returns
 */
module.exports = async (sqlBook) => {
  // 找到对应的网站
  var reptileType = parseInt(sqlBook.reptileType);
  // 记录当前正在爬取的关键词列表
  if (!global.updateBookIds) {
    global.updateBookIds = [];
  } else if (global.updateBookIds.indexOf(sqlBook.id) != -1) {
    return false; //正在更新的小说
  }
  global.updateBookIds.push(sqlBook.id);
  // 循环来源网站
  let rules = await reptileConfig.getReptileList();
  // 这里随便取一个没爬取过的网站
  let rule = null;
  for (let i = 0; i < rules.length; i++) {
    console.log(
      "🚀 ~ file: updateNewCatalog.js ~ line 38 ~ module.exports= ~ rules",
      rules[i]
    );
    // TODO: 未完成也要加
    const keywordResult = await db.query(
      `select * from keywordresult where bookId=${sqlBook.id} and reptileType=${rules[i].reptileTypeId}`
    );
    console.log(
      "🚀 ~ file: updateNewCatalog.js ~ line 43 ~ module.exports= ~ keywordResult",
      keywordResult
    );
    if (keywordResult && keywordResult.length === 0) {
      rule = rules[i];
      await updateBookNewCatalog_common(sqlBook, rules[i].reptileTypeId, end);
    }
  }

  // return updateBookNewCatalog_common(sqlBook, reptileType, end);

  async function end() {
    global.updateBookIds.splice(global.updateBookIds.indexOf(sqlBook.id), 1);
  }
};

async function updateBookNewCatalog_common(sqlBook, reptileType, end) {
  // 这里应该取ebay还是其他什么 的
  let reptileCommon = await reptileCommon2(reptileType, sqlBook);
  return new Promise(async (resolve, reject) => {
    let start = 0;
    await startRp();

    async function startRp() {
      start++;
      let result = null;
      let error = null;
      while (!result && start <= 2) {
        let option = {
          uri: reptileCommon.searchUrl,
          userAgent: reptileCommon.userAgent,
          encoding: null,
          transform: function (body) {
            // let body2 = iconv.decode(body, "gbk");  //用来查看页面
            const result = cheerio.load(
              iconv.decode(body, reptileCommon.code),
              { decodeEntities: false, xmlMode: true }
            );
            return result;
          },
          timeout: 10000,
        };
        try {
          let $ = await timoRp(option); // 这里爬完一页应该存一次数据库
          log.info(
            `已爬取${reptileCommon.name},关键词${sqlBook.name},网址${reptileCommon.searchUrl}`
          );
          // 能获取到搜索条目的网址列表,继续循环拿店铺网址
          let updateTime = new Date(reptileCommon.getUpdateTime($)).getTime();
          result = await getCatalogList({
            $,
            reptileCommon,
            book: sqlBook,
            updateNewCatalog: {
              sqlBook,
              updateTime,
              end,
              resolve,
              reptileType,
            },
            keyword: sqlBook,
          });
          if (result) {
            log.info(`${reptileCommon.name}},关键词${sqlBook.name}},爬取完成`);
            await db.query(
              `INSERT INTO keywordresult (reptileType, bookId,emailCount,isFinished) VALUES (${reptileType}, "${sqlBook.id}", 0, 2)`
            );
            resolve();
          }
        } catch (err) {
          start++;
          log.error(
            `第${start}次爬取失败：${err}。失败地址：${sqlBook.originUrl}，body：${option}`
          );
          error = err;
          result = null;
        }
      }
      if (error && !result) {
        // 错误就end
        end();
        reject(
          `获取${sqlBook.originUrl}${start}次失败，最后一次失败原因：${error}`
        );
      }
    }
  });
}

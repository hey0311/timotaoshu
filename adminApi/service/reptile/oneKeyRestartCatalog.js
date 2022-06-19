const { oauth, tool, db, log, fs, path } = require("../../tool/require");
let getCatalog = require("../../reptileTool/getCatalog.js");
const { ERROR_TASK_PAGE_TYPE } = require("../../../common/tool/constant");
const { deleteErrorTask } = require("../../reptileTool/dbTool");
const {
  addShopToQueue,
  addSearchItemToQueue,
} = require("../../reptileTool/queueTool");
const shopHandler = require("../../reptileTool/shopHandler");
const {
  getReptileList,
  getReptileRule,
} = require("../../../common/reptileConfig");
const reptileCommon2 = require("../../reptileTool/common/reptileCommon2");
const getCatalogList = require("../../reptileTool/getCatalogList");

async function oneKeyRestartCatalog(bookName, tiType) {
  return new Promise(async (resolve, reject) => {
    // let startTime = new Date().getTime();
    // if(!bookName && (startTime - (global.oneKeyRestartLastTime || 0) <= 1000*60*5)){
    //     reject("五分钟内不可再次一键全部爬取");
    //     return;
    // } else if(!bookName) {
    //     global.oneKeyRestartLastTime = startTime;
    // }
    // let whereSql = ``
    // if(bookName) {
    //     let books = await db.query(`select * from book where name="${bookName}"`);
    //     let i2 = 0, length2 = books.length;
    //     if(length2 <= 0) {
    //         reject(`没有${bookName}这本书`);
    //         return;
    //     }
    //     whereSql = `where `
    //     for (i2; i2 < length2; i2++) {
    //         if(i2 == length2-1) {
    //             whereSql+= `progresserror.bookId=${books[i2].id}`;
    //         } else {
    //             whereSql+= `progresserror.bookId=${books[i2].id} or `;
    //         }
    //     }
    // }

    let selectSql = `errortask.*,errortask.id as taskId, book.*`;
    let joinSql = `JOIN book on book.id=errortask.bookId`;
    let errorObjs = await db.query(
      `select ${selectSql} from errortask ${joinSql}`
    );
    console.log(
      "🚀 ~ file: oneKeyRestartCatalog.js ~ line 51 ~ returnnewPromise ~ errorObjs",
      errorObjs
    );
    let i = 0,
      length = errorObjs.length;
    let errorResponseCount = 0; //响应的适量
    let errorCount = 0; //爬取失败的数量
    if (length <= 0) {
      resolve(`爬取完毕，共爬取${length}条，${errorCount}条失败`);
      return;
    }
    try {
      for (i; i < length; i++) {
        let errorObj = errorObjs[i];
        // 这里要分类爬取
        //   let rules = await getReptileRule();
        //   const rule = rules[errorObj.reptileType];
        let reptileCommon = await reptileCommon2(errorObj.ruleId, errorObj);
        switch (errorObj.pageType) {
          case ERROR_TASK_PAGE_TYPE.SEARCH_PAGE:
            break;
          case ERROR_TASK_PAGE_TYPE.SHOP_PAGE:
            await addShopToQueue(
              {
                keyword: errorObj,
                rule: reptileCommon,
                shopUrl: errorObj.reptileAddress,
                page: 1,
                order: 1,
                bizName: "",
              },
              shopHandler
            );
            deleteErrorTask(errorObj.taskId);
            break;
          case ERROR_TASK_PAGE_TYPE.ITEM_PAGE:
            await addSearchItemToQueue(
              {
                keyword: errorObj,
                rule: reptileCommon,
                reptileAddress: errorObj.reptileAddress,
                page: 1,
                order: 1,
              },
              getCatalog
            );
            deleteErrorTask(errorObj.taskId);
            break;
        }
        //   tool.catalogQueue.push({
        //     params: [
        //       bookId,
        //       errorObj.reptileType,
        //       errorObj.originUrl,
        //       errorObj.bookName,
        //       catalog,
        //       true,
        //       30000,
        //       tiType,
        //     ],
        //     pro: getCatalog,
        //     result: (data) => {
        //       end(data, errorObj, resolve, reject);
        //     },
        //     error: (err) => {
        //       log.error(err);
        //       end("", errorObj, resolve, reject, err ? err : true);
        //     },
        //   });
      }
    } catch (err) {
      log.info(err);
    }

    /*
     * 当第五个值的布尔值为true的时候，则代表爬取失败了
     * */
    async function end(result, errorObj, resolve, reject, err) {
      errorResponseCount++;
      let whereSql = `where bookName="${errorObj.bookName}" and catalogName="${errorObj.catalogName}" and bookId=${errorObj.bookId} and catalogId=${errorObj.catalogId} and reptileAddress="${errorObj.reptileAddress}" and originUrl="${errorObj.originUrl}"`;

      if (err) {
        //删除progresserror表里匹配这个错误除自己外的其他列表
        errorCount++;
        whereSql += ` and id!=${errorObj.id}`;
      } else {
        //爬取成功        删除progresserror表里匹配到这个错误的所有列表
      }
      await db.query(`delete from progresserror ${whereSql}`);

      log.info(
        `错误列表，一键《${errorObj.bookName}》爬取共${length}条，已响应${errorResponseCount}条，失败${errorCount}条`
      );
      if (errorResponseCount == length) {
        log.info(`错误列表的《${errorObj.bookName}》一键爬取任务结束`);
        log.info(`爬取完毕，共爬取${length}条，${errorCount}条失败`);
        resolve(`爬取完毕，共爬取${length}条，${errorCount}条失败`);
      }
    }
  });
}

module.exports = oneKeyRestartCatalog;

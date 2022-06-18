const {
  fs,
  rp,
  timoRp,
  cheerio,
  iconv,
  path,
  tool,
  db,
  log,
} = require("../tool/require2");
const getNextPage = require("./getNextPage");
const getCatalog = require("./getCatalog");

async function getCatalogList({
  $,
  reptileCommon,
  callback,
  book: {
    id,
    title,
    author,
    description,
    imgUrl,
    baseUrl,
    url,
    updateTime,
    bookType,
    bookStatus,
    reptileType,
  },
  updateNewCatalog,
}) {
  console.log("🚀 ~ file: getCatalogList.js ~ line 34 ~ id", id);
  // let catalogStr = []; // 目录列表
  if (reptileCommon.getIsPage($)) {
    // 有分页的目录
    !updateNewCatalog && log.info(`爬取${title}目录中`);
    let page = 1;
    do {
      log.info(`获取第${page}页数据`);
      if ($) {
        // 这个是dom列表
        let catalogList = reptileCommon.getCatalogList($).toArray();
        for (let i = 0; i < 3; i++) {
          let catalogDom = catalogList[i];
          let catalog = reptileCommon.getCatalog($, catalogDom, i);
          // 别存了,直接爬
          let value = {
            id: "1",
            name: "2",
            reptileAddress: catalog.href,
          };
          // getCatalog(reptileType, book.originUrl, book.title, value, true);
          tool.catalogQueue.push({
            params: [
              id || "1",
              // reptileType,
              2,
              // reptileCommon.originUrlBefore == 2
              //   ? reptileCommon.baseUrl
              //   : originUrl,
              "",
              title,
              value,
              true,
            ],
            pro: getCatalog,
            result: async (data) => {
              // sucCount++;
              // end();
            },
            error: async (data) => {
              // errCount++;
              // end();
            },
          });
        }
        // 但是要更新关键词爬取到的页数
        page++;
      } else {
        throw new Error("章节分页目录请求出错");
        return;
      }
      $ = await getNextPage({ $, reptileCommon });
    } while (page !== 3 && !reptileCommon.isLastPage($));
  } else {
    // catalogStr = reptileCommon.getCatalogList($); // 目录列表
  }
  // catalogStr里存address

  /*
   * 上面是远程获取章节数组
   * */
  return true;
  if (updateNewCatalog) {
    // 更新章节
    let { sqlBook, end, resolve, updateTime, reptileType } = updateNewCatalog;
    // 这里不更新,直接爬
    let firstNum = reptileCommon.getCatalogFirstNum($);
    catalogStr.splice(0, firstNum); //截去前面几个
    let upDateLength = catalogStr.length;
    let nowLength = (
      await db.query(
        `select count(*) from catalog where bookId=${sqlBook.id} and isReptileTool=2`
      )
    )[0]["count(*)"];
    let book = Object.assign({}, sqlBook);
    book.updateTime = book.updateTime.getTime();
    /*
     * 修改书的更新状态
     * */
    let date = new Date(reptileCommon.beforeThreeDay()).getTime();
    if (book.updateTime != updateTime || updateTime <= date) {
      book.updateTime = updateTime;
      if (updateTime <= date) {
        book.bookStatus = 2;
      } else {
        book.bookStatus = 1;
      }
      let bookSql = `update book set updateTime=date_sub("${new Date(
        book.updateTime
      ).Format("yyyy-MM-dd hh:mm:ss")}",interval 0 day), bookStatus=${
        book.bookStatus
      } where id=${sqlBook.id}`;
      await db.query(bookSql);
    }
    if (upDateLength - nowLength > 0) {
      let catalogSql =
        "INSERT INTO catalog (bookId, name, num, type, createTime, reptileAddress) VALUES";
      /*
       * 本地json存储的长度
       * */
      // let length2 = upDateLength;
      let ii = nowLength;
      // 获取邮箱
      for (ii; ii < upDateLength; ii++) {
        let value = reptileCommon.getCatalog($, catalogStr, ii);
        catalogSql += `(${book.id},"${value.title}",${ii * 2},${
          value.type
        }, now(),"${value.href}")`;
        if (ii == upDateLength - 1) {
          // catalogSql += `(${value})`;
        } else {
          catalogSql += ",";
        }
      }
      await db.query(catalogSql);
      book.catalog = await db.query(
        `select * from catalog where bookId=${book.id}`
      );
      let start = nowLength;
      for (start; start < upDateLength; start++) {
        let value = book.catalog[start];
        // getCatalog(reptileType, book.originUrl, book.title, value, true);
        tool.catalogQueue.push({
          params: [
            sqlBook.id,
            reptileType,
            reptileCommon.originUrlBefore == 2
              ? reptileCommon.baseUrl
              : book.originUrl,
            book.title,
            value,
            true,
          ],
          pro: getCatalog,
          result: async (data) => {
            // sucCount++;
            // end();
          },
          error: async (data) => {
            // errCount++;
            // end();
          },
        });
      }
    } else {
      // saveJson(sqlBook.id, book);
    }
    end();
    if (resolve) resolve([upDateLength - nowLength]);
    return true; // 成功则返回true
  } else {
    // 新增一本书的json
    let catalogArr = [];
    let i = reptileCommon.getCatalogFirstNum($),
      length = catalogStr.length;
    for (i; i < length; i++) {
      catalogArr.push(reptileCommon.getCatalog($, catalogStr, i));
    }
    let book = {
      title: title,
      author: author,
      description: description,
      imgUrl: imgUrl,
      baseUrl: baseUrl,
      originUrl: url,
      // catalog:catalogArr,
      updateTime: updateTime,
      bookType: bookType,
      bookStatus: bookStatus,
      reptileType: reptileType,
    };

    let sql = `INSERT INTO book(name, author, description, reptileType, originUrl, imgUrl, type,updateTime,bookType,bookStatus,isJin) VALUES ("${
      book.title
    }","${tool.toSql(book.author)}","${tool.toSql(book.description)}", ${
      book.reptileType
    },"${book.originUrl}","${book.imgUrl}", 2, date_sub("${new Date(
      book.updateTime
    ).Format("yyyy-MM-dd")}",interval 0 day), "${book.bookType}", ${
      book.bookStatus
    },2)`;

    await db.query(sql);
    // let bookIdSql = `select id from book where name="${tool.toSql(
    //   book.title
    // )}" And author="${book.author}"`;
    // let bookId = tool.getData(await db.query(bookIdSql));
    // 这里不要了

    // let catalogSql = `INSERT INTO catalog (bookId, name, num, type, reptileAddress, createTime) VALUES`;
    // let catalogLength = catalogArr.length;
    // catalogArr.forEach((value, index) => {
    //   catalogSql += `(${bookId},"${tool.toSql(value.title)}",${index * 2},${
    //     value.type
    //   },"${value.href}", now())`;
    //   if (index == catalogLength - 1) {
    //     // catalogSql += "(${value})";
    //   } else {
    //     catalogSql += `,`;
    //   }
    // });
    // await db.query(catalogSql);
    // saveJson(book)
    if (callback) callback();
    return true; // 成功则返回true
  }
}

module.exports = getCatalogList;

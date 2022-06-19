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
const { addSearchItemToQueue } = require("./queueTool");

async function getCatalogList({ $, reptileCommon, keyword }) {
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

        await addSearchItemToQueue({
          keyword,
          rule: reptileCommon,
          reptileAddress: catalog.href,
          page,
          order: i + 1,
        });
        // await addSearchItemToQueue([
        //   keyword.id || "1", //bookId
        //   2,
        //   "",
        //   keyword.title,
        //   value,
        //   true,
        //   "",
        //   "",
        //   keyword,
        //   page,
        //   i + 1,
        // ]);
        // getCatalog(reptileType, book.originUrl, book.title, value, true);
      }
      // 但是要更新关键词爬取到的页数
      page++;
    } else {
      throw new Error("章节分页目录请求出错");
      return;
    }
    $ = await getNextPage({ $, reptileCommon });
  } while (page !== 3 && !reptileCommon.isLastPage($));
  return true;
}

module.exports = getCatalogList;

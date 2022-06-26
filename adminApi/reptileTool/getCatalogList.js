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
const getCatalog = require("./getCatalog");
const getNextPage = require("./getNextPage");
const { addSearchItemToQueue } = require("./queueTool");

async function getCatalogList({ $, reptileCommon, keywords }) {
  let page = 1;
  do {
    log.info(`获取第${page}页数据`);
    if ($) {
      // 这个是dom列表
      let catalogList = reptileCommon.getCatalogList($).toArray();
      for (let i = 0; i < 3; i++) {
        let catalogDom = catalogList[i];
        let catalog = reptileCommon.getCatalog($, catalogDom, i);
        await addSearchItemToQueue(
          {
            keywords,
            rule: reptileCommon,
            reptileAddress: catalog.href,
            page,
            order: i + 1,
          },
          getCatalog
        );
      }
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

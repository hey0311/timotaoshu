const { oauth, tool, db, log } = require("../tool/require");

async function getReptileList() {
  let count = await tool.redisData.reptileList.getReptileCount();
  if (!count) {
    /*
     * 以后弄一个common服务，专门弄一个定时任务。。
     * 下面这种写法，目测没问题，但是并发量上去了则会出现一些不可控的bug
     * */
    // let allData = await db.query(`select id,codeType,originUrl,remark from reptiletool`);
    // let allData = await db.query(`select * from reptiletool2`);
    // tool.redisData.reptileList.setReptileList(allData);
    let allData = [
      {
        2: {
          reptileTypeId: 2,
          code: "gbk",
          name: "笔趣阁5200",
          baseUrl: "https://www.ebay.co.uk",
          codeTransform: "utf-8",
          searchUrl:
            "https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p2380057.m570.l1313&_sacat=0&_nkw=${name}",
          searchList: ".grid>tbody>tr",
          searchListStart: "1",
          searchListEnd: "0",
          searchListTitle: "td>a、html",
          searchListUrl: "td>a、attrhref",
          searchListAuthor: "td:nth-child(3)、html",
          searchListStatus: "td:nth-child(6)、html",
          searchListLastTime: "td:nth-child(5)、html",
          bookTitle: "#info>h1、html",
          bookAuthor: "#info>p:nth-child(2)、html、split、：、1",
          updateTime: "#info>p:nth-child(4)、html、split、：、1",
          bookType: ".con_top、html、split、>、9、split、<、0",
          isPage: "",
          nextPage: "",
          nowPage: "",
          allPage: "",
          originUrlBefore: "1",
          userAgent: "pc",
          catalogList: "#list a",
          firstCatalogList: "#list>dl>dt:eq(1)、index-2",
          endCatalogList: "",
          bookImgUrl: "#fmimg>img、attrsrc",
          bookDescription: "#intro>p、html",
          catalogContent: "#content、html",
          isSearch: 2,
          catalogListUrl: "",
          catalogTitle: "、html",
          catalogUrl: "、attrhref、split、/、length-1",
          reason: "1",
        },
      },
    ];
    tool.redisData.reptileList.updateReptileList(allData);
  }

  count = await tool.redisData.reptileList.getReptileCount();
  // reptileList = await tool.redisData.reptileList.getReptileList((page-1)*limit, page*limit-1);
  // return await tool.redisData.reptileList.getReptileList(0, count-1);
  return [
      {
        2: {
          reptileTypeId: 2,
          code: "gbk",
          name: "笔趣阁5200",
          baseUrl: "https://www.ebay.co.uk",
          codeTransform: "utf-8",
          searchUrl:
            "https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p2380057.m570.l1313&_sacat=0&_nkw=${name}",
          searchList: ".grid>tbody>tr",
          searchListStart: "1",
          searchListEnd: "0",
          searchListTitle: "td>a、html",
          searchListUrl: "td>a、attrhref",
          searchListAuthor: "td:nth-child(3)、html",
          searchListStatus: "td:nth-child(6)、html",
          searchListLastTime: "td:nth-child(5)、html",
          bookTitle: "#info>h1、html",
          bookAuthor: "#info>p:nth-child(2)、html、split、：、1",
          updateTime: "#info>p:nth-child(4)、html、split、：、1",
          bookType: ".con_top、html、split、>、9、split、<、0",
          isPage: "",
          nextPage: "",
          nowPage: "",
          allPage: "",
          originUrlBefore: "1",
          userAgent: "pc",
          catalogList: "#list a",
          firstCatalogList: "#list>dl>dt:eq(1)、index-2",
          endCatalogList: "",
          bookImgUrl: "#fmimg>img、attrsrc",
          bookDescription: "#intro>p、html",
          catalogContent: ".s-item__title、html",
          isSearch: 2,
          catalogListUrl: "",
          catalogTitle: "、html",
          catalogUrl: "、attrhref、split、/、length-1",
          reason: "1",
        },
      },
    ];
}

/*
 * 更新redis里的reptile配置数据
 * */
async function refreshReptileList() {
  let allData = await db.query(`select * from reptiletool2`);
  await tool.redisData.reptileList.updateReptileList(allData);
  let count = await tool.redisData.reptileList.getReptileCount();
  return await tool.redisData.reptileList.getReptileList(0, count - 1);
}

/*
 * 获取规则
 * */
async function getReptileRule() {
  let reptileList = await getReptileList();
  let rules = {};
  reptileList.forEach((value, index) => {
    // let value2 = JSON.parse(value);
    let value2 = value;
    rules[value2.reptileTypeId] = value2;
  });
  return rules;
}

module.exports = {
  getReptileList,
  refreshReptileList,
  getReptileRule,
};

const { oauth, tool, db, log } = require("../tool/require");

async function getReptileList() {
  //   let count = await tool.redisData.reptileList.getReptileCount();
  //   // if(!count) {
  //   /*
  //    * 以后弄一个common服务，专门弄一个定时任务。。
  //    * 下面这种写法，目测没问题，但是并发量上去了则会出现一些不可控的bug
  //    * */
  //   // let allData = await db.query(`select id,codeType,originUrl,remark from reptiletool`);
  //   // 这里直接代码写死就哦了
  //   let allData = await db.query(`select * from reptiletool2`);
  //   // tool.redisData.reptileList.setReptileList(allData);
  //   tool.redisData.reptileList.updateReptileList(allData);
  //   // }

  //   count = await tool.redisData.reptileList.getReptileCount();
  //   // reptileList = await tool.redisData.reptileList.getReptileList((page-1)*limit, page*limit-1);
  //   const result = await tool.redisData.reptileList.getReptileList(0, count - 1);
  //   console.log(
  //     "🚀 ~ file: index.js ~ line 21 ~ getReptileList ~ result",
  //     result
  //   );
  //   return result;
  return [
    {
      reptileTypeId: 1,
      code: "gbk",
      name: "ebay德国",
      baseUrl: "https://www.ebay.de/",
      codeTransform: "utf-8",
      searchUrl: "https://www.ebay.de/sch/i.html?_from=R40&rt=nc&_nkw=${name}",
      searchList: ".srp-results.srp-list.clearfix",
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
      catalogList: ".srp-river-results .s-item__link",
      firstCatalogList: "#list>dl>dt:eq(1)、index-2",
      endCatalogList: "",
      bookImgUrl: "#fmimg>img、attrsrc",
      bookDescription: "#intro>p、html",
      catalogContent: ".ux-seller-section__item--seller、text",
      isSearch: 1,
      catalogListUrl: ".srp-river-results .s-item__link、attrhref",
      catalogTitle: ".s-item__title、text",
      catalogUrl: "、attrhref",
      reason: "",
    },
    {
      reptileTypeId: 2,
      code: "gbk",
      name: "ebay英国",
      baseUrl: "https://www.ebay.co.uk/",
      codeTransform: "utf-8",
      searchUrl:
        "https://www.ebay.co.uk/sch/i.html?_from=R40&rt=nc&_nkw=${name}",
      searchList: ".srp-results.srp-list.clearfix",
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
      catalogList: ".srp-river-results .s-item__link",
      firstCatalogList: "#list>dl>dt:eq(1)、index-2",
      endCatalogList: "",
      bookImgUrl: "#fmimg>img、attrsrc",
      bookDescription: "#intro>p、html",
      catalogContent: ".ux-seller-section__item--seller、text",
      isSearch: 1,
      catalogListUrl: ".srp-river-results .s-item__link、attrhref",
      catalogTitle: ".s-item__title、text",
      catalogUrl: "、attrhref",
      reason: "",
    },
  ];
  // return [{

  // }]
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
    rules[value.reptileTypeId] = value;
  });
  return rules;
}

module.exports = {
  getReptileList,
  refreshReptileList,
  getReptileRule,
};

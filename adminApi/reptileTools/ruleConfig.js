const { oauth, tool, db, log } = require("../../common/tool/require");

function getRuleConfigList() {
  return [
    {
      id: 1,
      name: "ebay德国",
      baseUrl: "https://www.ebay.de/",
      searchUrl:
        "https://www.ebay.de/sch/i.html?_from=R40&rt=nc&_nkw=${name}&_pgn=${page}",
      nextPage: ".pagination__next、attrhref",
      lastPage: '.pagination__item[aria-current="page"]',
      nowPage: "",
      allPage: "",
      searchItemList: ".srp-river-results .s-item__link",
      searchItemUrl: "、attrhref",
      searchItemTitle: ".s-item__title、text",
      shopName: ".ux-seller-section__item--seller、text",
      shopUrl: [
        ".ux-seller-section__item--seller a、attrhref",
        ".si-inner .mbg a、attrhref",
      ],
      email: "#email~span、text",
    },
    {
      id: 2,
      name: "ebay英国",
      baseUrl: "https://www.ebay.co.uk/",
      searchUrl:
        "https://www.ebay.co.uk/sch/i.html?_from=R40&rt=nc&_nkw=${name}&_pgn=${page}",
      nextPage: ".pagination__next、attrhref",
      lastPage: '.pagination__item[aria-current="page"]',
      nowPage: "",
      allPage: "",
      searchItemList: ".srp-river-results .s-item__link",
      searchItemUrl: "、attrhref",
      searchItemTitle: ".s-item__title、text",
      shopName: ".ux-seller-section__item--seller、text",
      shopUrl: [
        ".ux-seller-section__item--seller a、attrhref",
        ".si-inner .mbg a、attrhref",
      ],
      email: "#email~span、text",
    },
  ];
  // return [{

  // }]
}

/*
 * 获取规则
 * */
function getRuleConfigMap() {
  let ruleConfigList = getRuleConfigList();
  let rules = {};
  ruleConfigList.forEach((value, index) => {
    rules[value.id] = value;
  });
  return rules;
}

module.exports = {
  getRuleConfigList,
  getRuleConfigMap,
};

const {
  oauth,
  tool,
  db,
  log,
  rp,
  cheerio,
  iconv,
  request,
  reptileConfig,
} = require("../../tool/require2");

/*
 * 兼容cheerio  :eq的写法
 * $("list:eq(1)") 报错
 * $("list").eq(1) 成功
 *
 * 把上面报错的语法转成第二种语法
 * */
function handleEq(dom, ruleSplit0, $) {
  var findDom = null;

  if (ruleSplit0.indexOf(":eq(") == -1) {
    //没有eq的写法
    if (dom) {
      findDom = dom.find(ruleSplit0);
    } else {
      findDom = $(ruleSplit0);
    }
  } else {
    //兼容选择器:eq写法
    let rules = ruleSplit0.split(/:eq\(\d\)/); //这里的数组数量永远比下面多1
    let eqs = ruleSplit0.match(/:eq\(\d\)/g); //这里的数组数量永远比上面少1
    if (dom) {
      findDom = dom.find(rules[0]);
    } else {
      findDom = $(rules[0]);
    }
    findDom = findDom.eq(eqs[0].replace(":eq(", "").replace(")", ""));
    let i = 1,
      length = rules.length - 1;
    for (i; i < length; i++) {
      findDom = findDom.find(rules[i]);
      findDom = findDom.eq(eqs[i].replace(":eq(", "").replace(")", ""));
    }
    findDom = rules[i] ? findDom.find(rules[i]) : findDom;
  }

  return findDom;
}

/*
 * 处理规则
 * ruleSplit   规则数组
 * startIndex  数组从哪里开始
 * result      要处理的数据
 *
 *
 * 目前
 * split规则    split规则是三个三个来的  第一个值是split，固定的，第二个值是分割的值，第三个值是索引值（索引值有个特殊的值length-1 也就是最后一个 length-2也就是倒数第二个，以此类推）
 *
 * */
function handleRule(ruleSplit, startIndex, result) {
  switch (ruleSplit[startIndex]) {
    case "split":
      let resultArr = result.split(ruleSplit[startIndex + 1]);
      let index = 0;
      if (
        ruleSplit[startIndex + 2] &&
        ruleSplit[startIndex + 2].indexOf("length-") == 0
      ) {
        let endIndex = parseInt(ruleSplit[startIndex + 2].split("length-")[1]);
        index = resultArr.length - endIndex;
      } else {
        index = ruleSplit[startIndex + 2] || 0; //默认0
      }
      result = resultArr[index] || result;
      startIndex += 3;
      break;
    default:
      break;
  }
  if (startIndex + 3 <= ruleSplit.length) {
    return handleRule(ruleSplit, startIndex, result);
  } else {
    return result && result.trim();
  }
}

/*
 * 在dom元素下，寻找findDom元素
 * 根据type值获取findDom相对应的数据
 * 若dom为null或空，则默认为为   $(findDom);
 * findDom是rule里、号前面的一位，type是rule里、号的一位
 * 若rule没有、号，则findDom就是rule
 *
 * $是cheerio的方法，先拓展，以防万一以后用得到
 *
 * rule 规则
 *
 * a、html
 * a、val
 * a、attrhref
 * a、attrdata-id
 *
 * a、html、split、：、1        a标签的html()，然后split("：")，再获取1的索引值
 *
 *
 * */
function domCommon(dom, rule, $) {
  if (!rule) return "";
  let ruleSplit = rule.split("、");
  // let ruleLength = ruleSplit.length;
  let type = ruleSplit[1];
  if (!type) return "";
  let findDom = null;
  if (ruleSplit[0]) {
    findDom = handleEq(dom, ruleSplit[0], $);
  } else {
    findDom = dom;
  }

  let result = null;

  if (type == "html") {
    result = findDom.html() && findDom.html().trim();
  } else if (type == "fontHtml") {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?font.*?>)/g, "")
        .trim(); // 过滤标签，保留内容
  } else if (type == "spanHtml") {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?span.*?>)/g, "")
        .trim(); // 过滤标签，保留内容
  } else if (type == "aHtml") {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?a.*?>)/g, "")
        .trim(); // 过滤标签，保留内容
  } else if (type == "allHtml") {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?font.*?>)|(<\/?span.*?>)|(<\/?a.*?>)|"/g, "")
        .trim();
  } else if (type == "text") {
    result = findDom.text() && findDom.text().trim();
  } else if (type == "val") {
    result = findDom.val() && findDom.val().trim();
  } else if (type && type.indexOf("attr") == 0) {
    result =
      findDom.attr(type.split("attr")[1]) &&
      findDom.attr(type.split("attr")[1]).trim();
  } else if (type && type.indexOf("index") === 0) {
    let indexCompute = parseInt(type.replace("index", "")) || 0;
    if (indexCompute) {
      return findDom.index() + indexCompute;
    } else {
      return findDom.index();
    }
  }
  return handleRule(ruleSplit, 2, result);
}

async function reptileCommon2(reptileType, keyword) {
  let rules = await reptileConfig.getReptileRule();
  let rule = rules[reptileType];
  // let rules = await reptileConfig.getReptileList();
  // // 这里随便取一个没爬取过的网站
  // let rule = null;
  // for (let i = 0; i < rules.length; i++) {
  //   // TODO: 未完成也要加
  //   const keywordResult = await db.query(
  //     `select * from keywordresult where bookId=${keyword.id} and reptileType=${rules[i].reptileTypeId}`
  //   );
  //   if (keywordResult && keywordResult.length === 0) {
  //     rule = rules[i];
  //     break;
  //   }
  // }

  let returnObj = null;
  if (rule) {
    returnObj = {
      code: rule.code,
      name: rule.name,
      baseUrl: rule.baseUrl,
      codeTransform: rule.codeTransform,
      originUrlBefore: rule.originUrlBefore, // url前缀
      userAgent: rule.userAgent, // pc或者mobile
      searchUrl: rule.searchUrl.replace(
        "${name}",
        keyword.name.split(" ").join("+")
      ),
      getBookList: ($, url, bookName) => {
        let list = [];
        if (bookName && returnObj.searchUrl(bookName).indexOf(url) == -1) {
          //被302重定向，进入了书的详情页，多存在于只搜到了一本书   目测有问题，以后再改
          list.push({
            title: returnObj.bookTitle($),
            url: url.indexOf("http") == -1 ? rule.baseUrl + url : url,
            author: returnObj.bookAuthor($),
            status: returnObj.getUpdateTime($),
          });
        } else {
          let domList = $(rule.searchList);
          let i = rule.searchListStart,
            length = domList.length;
          for (i; i < length; i++) {
            let status = null;
            if (rule.searchListLastTime) {
              status =
                domCommon(domList.eq(i), rule.searchListLastTime, $) +
                " ____ 最后更新：" +
                domCommon(domList.eq(i), rule.searchListStatus, $);
            } else {
              status = domCommon(domList.eq(i), rule.searchListStatus, $);
            }
            let url = domCommon(domList.eq(i), rule.searchListUrl, $);
            if (url.indexOf("http") != 0) {
              url = rule.baseUrl + url;
            }
            list.push({
              title: domCommon(domList.eq(i), rule.searchListTitle, $),
              url: url,
              author: domCommon(domList.eq(i), rule.searchListAuthor, $),
              status: status,
            });
          }
        }
        return list;
      },

      bookTitle: ($) => {
        return domCommon(null, rule.bookTitle, $);
      },
      bookAuthor: ($) => {
        return domCommon(null, rule.bookAuthor, $);
      },
      getUpdateTime: ($) => {
        return "2022-06-15";
        // return domCommon(null, rule.updateTime, $);
      },
      getCatalogListUrl: ($) => {
        rule.catalogListUrl = ".srp-river-results .s-item__link、attrhref";
        if (rule.catalogListUrl) {
          let catalogListUrl = domCommon(null, rule.catalogListUrl, $);
          // if (catalogListUrl.indexOf("http") !== 0) {
          //   catalogListUrl = rule.baseUrl + catalogListUrl;
          // }
          return catalogListUrl;
        } else {
          return null;
        }
      },
      getIsPage: ($) => {
        // 获取目录是否是分页
        return true;
        // if (rule.isPage) {
        //     return true;
        // } else {
        //     return false;
        // }
      },
      getNextPage: ($) => {
        // 获取下一页目录地址
        rule.nextPage = ".pagination__next、attrhref";
        if (rule.nextPage) {
          let url = domCommon(null, rule.nextPage, $);
          log.info(`下一页地址:${url}`);
          if (!url) {
            return null;
          }
          if (url.indexOf("http") === 0) {
            return url;
          } else {
            return rule.baseUrl + url;
          }
        } else {
          return null;
        }
      },
      getNowPage: ($) => {
        // 解析并判断当前页数
        if (rule.nextPage) {
          return domCommon(null, rule.nowPage, $);
        } else {
          return null;
        }
      },
      isLastPage: ($) => {
        return (
          $('.pagination__item[aria-current="page"]').parent().next().length ===
          0
        );
      },
      getAllPage: ($) => {
        // 总目录页数
        if (rule.nextPage) {
          return domCommon(null, rule.allPage, $);
        } else {
          return null;
        }
      },
      getCatalogList: ($) => {
        return $(rule.catalogList);
      },
      getBookType: ($) => {
        return domCommon(null, rule.bookType, $);
      },
      beforeThreeDay() {
        var date = new Date(); //获取当前时间
        date.setDate(date.getDate() - 3); //设置天数 -3 天
        return date;
      },
      getCatalogFirstNum($) {
        //暂时为0，以后再找规则
        if (!rule.firstCatalogList) {
          return 0;
        } else {
          return 0;
          // return domCommon(null, rule.firstCatalogList, $);
        }
      },
      getBookImgUrl($) {
        return domCommon(null, rule.bookImgUrl, $);
      },
      getDescription: ($) => {
        let description = domCommon(null, rule.bookDescription, $) || "";
        description = description
          .replace(/\n/g, "")
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, ""); //将p标签转换成 null
        return tool.filterHtmlOrContainer(description); // 除br之外，其他标签全部过滤
      },
      getCatalog: ($, catalogStr, i) => {
        //规则暂时有问题，目前先这样
        let catalog = $(catalogStr);
        // let title = catalog.html();
        let title = domCommon(catalog, rule.catalogTitle);
        let type = 1; //1带章节
        if (title.indexOf("章") == -1 && title.indexOf("第") == -1) {
          type = 2; //2没有章节
        }
        let href = domCommon(catalog, rule.catalogUrl);
        // console.log(title,href);
        return {
          title: (title || "").replace(/"/g, ""),
          // href:"/" + domCommon(catalog, "、" + "attrhref、split、/、length-1"),
          href: href,
          // href: "/" + catalog.attr("href").split("/")[catalog.attr("href").split("/").length - 1],
          type: type,
        };
      },
      getShopUrl: ($) => {
        return domCommon(
          null,
          ".ux-seller-section__item--seller a、attrhref",
          $
        );
      },
      getEmail: ($) => {
        return domCommon(null, "#email~span、text", $);
      },
      getCatalogContent: ($) => {
        let content = domCommon(null, rule.catalogContent, $) || "";
        content = content
          .replace(/\n/g, "")
          .replace(/<p>/g, "<br>")
          .replace(/<\/p>/g, "<br>");
        content = tool.filterHtmlOrContainer(content || ""); // 除br之外，其他标签全部过滤
        let contentArr = content.split("<br>");
        let i = 0,
          length = contentArr.length;
        for (i; i < length; i++) {
          if (!contentArr[i] || contentArr[i].trim() == "") {
            contentArr.splice(i, 1);
            i--;
            length--;
          } else {
            contentArr[i] = contentArr[i] && contentArr[i].trim();
          }
        }
        return contentArr.join("<br>");
      },
    };
  }

  return returnObj;
}

module.exports = reptileCommon2;

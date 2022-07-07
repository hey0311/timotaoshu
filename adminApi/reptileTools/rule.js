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
} = require('../tool/require2')
const { getRuleConfigMap } = require('./ruleConfig')

/*
 * 兼容cheerio  :eq的写法
 * $("list:eq(1)") 报错
 * $("list").eq(1) 成功
 *
 * 把上面报错的语法转成第二种语法
 * */
function handleEq(dom, ruleSplit0, $) {
  var findDom = null

  if (ruleSplit0.indexOf(':eq(') == -1) {
    //没有eq的写法
    if (dom) {
      findDom = dom.find(ruleSplit0)
    } else {
      findDom = $(ruleSplit0)
    }
  } else {
    //兼容选择器:eq写法
    let rules = ruleSplit0.split(/:eq\(\d\)/) //这里的数组数量永远比下面多1
    let eqs = ruleSplit0.match(/:eq\(\d\)/g) //这里的数组数量永远比上面少1
    if (dom) {
      findDom = dom.find(rules[0])
    } else {
      findDom = $(rules[0])
    }
    findDom = findDom.eq(eqs[0].replace(':eq(', '').replace(')', ''))
    let i = 1,
      length = rules.length - 1
    for (i; i < length; i++) {
      findDom = findDom.find(rules[i])
      findDom = findDom.eq(eqs[i].replace(':eq(', '').replace(')', ''))
    }
    findDom = rules[i] ? findDom.find(rules[i]) : findDom
  }

  return findDom
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
    case 'split':
      let resultArr = result.split(ruleSplit[startIndex + 1])
      let index = 0
      if (
        ruleSplit[startIndex + 2] &&
        ruleSplit[startIndex + 2].indexOf('length-') == 0
      ) {
        let endIndex = parseInt(ruleSplit[startIndex + 2].split('length-')[1])
        index = resultArr.length - endIndex
      } else {
        index = ruleSplit[startIndex + 2] || 0 //默认0
      }
      result = resultArr[index] || result
      startIndex += 3
      break
    default:
      break
  }
  if (startIndex + 3 <= ruleSplit.length) {
    return handleRule(ruleSplit, startIndex, result)
  } else {
    return result && result.trim()
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
  if (!rule) return ''
  let ruleSplit = rule.split('、')
  // let ruleLength = ruleSplit.length;
  let type = ruleSplit[1]
  if (!type) return ''
  let findDom = null
  if (ruleSplit[0]) {
    findDom = handleEq(dom, ruleSplit[0], $)
  } else {
    findDom = dom
  }

  let result = null

  if (type == 'html') {
    result = findDom.html() && findDom.html().trim()
  } else if (type == 'fontHtml') {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?font.*?>)/g, '')
        .trim() // 过滤标签，保留内容
  } else if (type == 'spanHtml') {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?span.*?>)/g, '')
        .trim() // 过滤标签，保留内容
  } else if (type == 'aHtml') {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?a.*?>)/g, '')
        .trim() // 过滤标签，保留内容
  } else if (type == 'allHtml') {
    result =
      findDom.html() &&
      findDom
        .html()
        .replace(/(<\/?font.*?>)|(<\/?span.*?>)|(<\/?a.*?>)|"/g, '')
        .trim()
  } else if (type == 'text') {
    result = findDom.text() && findDom.text().trim()
  } else if (type == 'val') {
    result = findDom.val() && findDom.val().trim()
  } else if (type && type.indexOf('attr') == 0) {
    result =
      findDom.attr(type.split('attr')[1]) &&
      findDom.attr(type.split('attr')[1]).trim()
  } else if (type && type.indexOf('index') === 0) {
    let indexCompute = parseInt(type.replace('index', '')) || 0
    if (indexCompute) {
      return findDom.index() + indexCompute
    } else {
      return findDom.index()
    }
  }
  return handleRule(ruleSplit, 2, result)
}

/**
 * 获取爬取规则
 * @param {*} ruleId
 * @param {*} keyword
 * @returns
 */
function getRule(ruleConfig, keywords) {
  return {
    id: ruleConfig.id,
    name: ruleConfig.site + '-' + ruleConfig.country,
    // searchUrl:
    getSearchUrl: (page) => {
      // return ruleConfig.searchUrl
      //   .replace('${name}', keywords.name.split(' ').join('+'))
      //   .replace('${page}', page)
      let url = ruleConfig.baseUrl
      const formatKeywords = keywords.name.split(' ').join('+')
      url += `/sch/i.html?_from=R40&rt=nc&_nkw=${formatKeywords}&_pgn=${page}`
      return url
    },
    getSearchItemUrl: ($, searchItem, index) => {
      let href = domCommon($(searchItem), '、attrhref', $)
      return href
    },
    getNextPage: ($) => {
      // 获取下一页目录地址
      return domCommon(null, '.pagination__next、attrhref', $)
    },
    getNowPage: ($) => {
      return null
    },
    isLastPage: ($) => {
      return (
        $('.pagination__item[aria-current="page"]').parent().next().length === 0
      )
    },
    getSearchItemList: ($) => {
      return $('.srp-river-results .s-item__link')
    },
    getShopUrl: ($) => {
      const shopUrlList = [
        '.ux-seller-section__item--seller a、attrhref',
        '.si-inner .mbg a、attrhref',
      ]
      for (let i = 0; i < shopUrlList.length; i++) {
        const shopUrl = domCommon(null, shopUrlList[i], $)
        if (shopUrl) {
          return shopUrl
        }
      }
      return ''
    },
    getEmail: ($, uri) => {
      let email = ''
      email = domCommon(null, '#email~span、text', $) || ''
      if (!email) {
        email =
          domCommon(
            null,
            ".str-business-details__seller-info span:contains('Email') ~ span、text",
            $
          ) || ''
        if (!email) {
          email =
            domCommon(
              null,
              ".str-business-details__seller-info span:contains('E-Mail') ~ span、text",
              $
            ) || ''
          if (!email) {
            const likeEmail = domCommon(null, "span:contains('@')、text", $)
            if (likeEmail) {
              log.info(`疑似有email,地址${uri},email:${likeEmail}`)
            }
          }
        }
      }
      return email
    },
    getBizName: ($) => {
      const bizName = domCommon(null, '#business_name~span、text', $) || ''
      if (bizName && bizName.length > 50) {
        return ''
      }
      return bizName
    },
    getFirstName: ($) => {
      const firstName = domCommon(null, '#first_name~span、text', $) || ''
      if (firstName && firstName.length > 30) {
        return ''
      }
      return firstName
    },
    getLastName: ($) => {
      const lastName = domCommon(null, '#last_name~span、text', $) || ''
      if (lastName && lastName.length > 30) {
        return ''
      }
      return lastName
    },
    getPhone: ($) => {
      const phone = domCommon(null, '#phone_number~span、text', $) || ''
      if (phone && phone.length > 20) {
        return ''
      }
      return phone
    },
  }
}

module.exports = getRule

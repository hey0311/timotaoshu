const { oauth, tool, db, log } = require('../../common/tool/require')

function getRuleConfigList() {
  return [
    {
      id: 1,
      site: 'ebay',
      country: 'America',
      baseUrl: 'https://www.ebay.com',
    },
    {
      id: 2,
      site: 'ebay',
      country: 'Canada',
      baseUrl: 'https://www.ebay.ca',
    },
    {
      id: 3,
      site: 'ebay',
      country: 'France',
      baseUrl: 'https://www.ebay.fr',
    },
    {
      id: 4,
      site: 'ebay',
      country: 'Germany',
      baseUrl: 'https://www.ebay.de',
    },
    {
      id: 5,
      site: 'ebay',
      country: 'Italy',
      baseUrl: 'https://www.ebay.it',
    },
    {
      id: 6,
      site: 'ebay',
      country: 'Holland',
      baseUrl: 'https://www.ebay.nl',
    },
    {
      id: 7,
      site: 'ebay',
      country: 'Spain',
      baseUrl: 'https://www.ebay.es',
    },
    {
      id: 8,
      site: 'ebay',
      country: 'Switzerland',
      baseUrl: 'https://www.ebay.ch',
    },
    {
      id: 9,
      site: 'ebay',
      country: 'England',
      baseUrl: 'https://www.ebay.uk',
    },
    {
      id: 10,
      site: 'ebay',
      country: 'Poland',
      baseUrl: 'https://www.ebay.pl',
    },
  ]
  // return [{

  // }]
}

/*
 * 获取规则
 * */
function getRuleConfigMap() {
  let ruleConfigList = getRuleConfigList()
  let rules = {}
  ruleConfigList.forEach((value, index) => {
    rules[value.id] = value
  })
  return rules
}

module.exports = {
  getRuleConfigList,
  getRuleConfigMap,
}

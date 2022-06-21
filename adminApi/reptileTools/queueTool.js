const { fs, rp, timoRp, path, tool, log, db } = require("../tool/require");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");

/**
 * 添加搜索条目到队列
 * @param {*} params
 * @returns
 */
async function addSearchItemToQueue(params, pro) {
  return new Promise((resolve, reject) => {
    tool.catalogQueue.push({
      params,
      pro,
      result: async (data) => {
        // sucCount++;
        // end();
        resolve();
      },
      error: async (data) => {
        // errCount++;
        // end();
        reject();
      },
    });
  });
}
async function addShopToQueue(params, pro) {
  return new Promise((resolve, reject) => {
    tool.shopQueue.push({
      params,
      pro,
      result: async (data) => {
        // sucCount++;
        // end();
        resolve();
      },
      error: async (data) => {
        // errCount++;
        // end();
        reject();
      },
    });
  });
}

module.exports = {
  addShopToQueue,
  addSearchItemToQueue,
};

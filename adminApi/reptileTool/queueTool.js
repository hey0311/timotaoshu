const { fs, rp, timoRp, path, tool, log, db } = require("../tool/require");
const { ERROR_TASK_PAGE_TYPE } = require("../../common/tool/constant");
const getCatalog = require("./getCatalog");

/**
 * 添加搜索条目到队列
 * @param {*} params
 * @returns
 */
async function addSearchItemToQueue(params) {
  return new Promise((resolve, reject) => {
    tool.catalogQueue.push({
      params,
      pro: getCatalog,
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
  addSearchItemToQueue,
};

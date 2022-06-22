const { oauth, tool, db, log, fs, path } = require("../../tool/require");
let getCatalog = require("../../reptileTool/getCatalog.js");
const { ERROR_TASK_PAGE_TYPE } = require("../../../common/tool/constant");
const { deleteErrorTask } = require("../../reptileTool/dbTool");
const {
  addShopToQueue,
  addSearchItemToQueue,
} = require("../../reptileTool/queueTool");
const shopHandler = require("../../reptileTool/shopHandler");
const {
  getReptileList,
  getReptileRule,
} = require("../../../common/reptileConfig");
const reptileCommon2 = require("../../reptileTool/common/reptileCommon2");
const getCatalogList = require("../../reptileTool/getCatalogList");
const reptileErrorTasks = require("../../reptileTools/reptileErrorTasks");

async function startErrorTasks() {
  return new Promise(async (resolve, reject) => {
    // reject("mysql服务器爆棚，暂不允许爬取");
    // return;
    await reptileErrorTasks();
    resolve("开始爬取");
  });
}

module.exports = startErrorTasks;

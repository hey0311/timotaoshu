const { oauth, tool, db, log, fs, path,wss } = require("../../tool/require");
const updateNewCatalog = require("../../reptileTool/updateNewCatalog");



let oneKeyUpdateNewCatalog = async (bookListFromId) => {
    return new Promise(async (resolve, reject) => {
        if(global.isUpdateReptile) {
            reject("连载小说正在更新中");
            return
        }
        let bookList = [];
        if(bookListFromId) {
            bookList = bookListFromId;
        } else {
            bookList = await db.query(`select * from book where bookStatus=1`);
            global.isUpdateReptile = true;
        }

            console.log("🚀 ~ file: oneKeyUpdateNewCatalog.js ~ line 17 ~ returnnewPromise ~ bookList", bookList)
        let i = 0, length = bookList.length;
        let sucCount = 0, errCount = 0;

        try{
            for(i; i<length; i++) {
                let sqlbook = bookList[i];
                tool.queue.push({
                    params: [sqlbook],
                    pro: updateNewCatalog,
                    result: async (data) => {
                        sucCount++;
                        end(data,null);
                    },
                    error: async (error) => {
                        log.error(error);
                        errCount++;
                        end(null,error);
                    }
                });
            }
            async function end(){

                log.info(`共${length}本连载小说，成功更新${sucCount}本连载小说，失败更新${errCount}本连载小说`);
                wss.broadcast(`共${length}本连载小说，成功更新${sucCount}本连载小说，失败更新${errCount}本连载小说`);
                if((errCount + sucCount) == length){
                    if(!bookListFromId){
                        global.isUpdateReptile = false;
                    }
                }
            }
        }catch (err) {
            log.error(err);
            reject(err);
        }
        resolve({msg:`开始检查并更新${length}本正在连载小说`});
    });
}

module.exports = oneKeyUpdateNewCatalog;
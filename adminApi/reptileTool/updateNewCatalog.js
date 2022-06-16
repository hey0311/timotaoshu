const {fs, rp,timoRp, path, tool, db, cheerio, iconv, log} = require("../tool/require");

// const getCatalog = require("./getCatalog");
// let reptileCommon = require("./common/reptileCommon");
let reptileCommon2 = require("./common/reptileCommon2");
let getCatalogList = require("../reptileTool/getCatalogList");


module.exports = async (sqlBook) => {
    var reptileType = parseInt(sqlBook.reptileType);
    // if (reptileType === 0) {
    //     return updateBookNewCatalog(sqlBook, reptileType);
    // } else if (reptileType === 1) {
    //     return updateBookNewCatalog1(sqlBook, reptileType);
    // } else if (reptileType === 2) {
    //     return updateBookNewCatalog2(sqlBook, reptileType);
    // } else if (reptileType === 3) {
    //     return updateBookNewCatalog3(sqlBook, reptileType);
    // }
    if(!global.updateBookIds){
        global.updateBookIds = [];
    } else if(global.updateBookIds.indexOf(sqlBook.id) != -1) {
        return false;   //正在更新的小说
    }
    global.updateBookIds.push(sqlBook.id);

    return updateBookNewCatalog_common(sqlBook, reptileType, end);

    async function end(){
        global.updateBookIds.splice(global.updateBookIds.indexOf(sqlBook.id),1);
    }

}

async function updateBookNewCatalog_common(sqlBook, reptileType, end) {
    let reptileCommon = await reptileCommon2(reptileType);
    return new Promise(async (resolve, reject) => {
        let start = 0;
        await startRp();

        async function startRp() {
            start++;
            let result = null;
            let error = null;
            while(!result && start<=5) {
                let option = {
                    uri: sqlBook.originUrl,
                    userAgent: reptileCommon.userAgent,
                    encoding: null,
                    transform: function (body) {
                        // let body2 = iconv.decode(body, "gbk");  //用来查看页面
                        const result = cheerio.load(iconv.decode(body, reptileCommon.code), {decodeEntities: false, xmlMode: true});
                        return result;
                    },
                    timeout:10000
                };
                let catalogListUrl = null;
                try{
                    let $ = await timoRp(option);
                    console.log(111)
                    catalogListUrl = reptileCommon.getCatalogListUrl($); // get null
                    console.log(333)
                    let updateTime = new Date(reptileCommon.getUpdateTime($)).getTime();
                        console.log("🚀 ~ file: updateNewCatalog.js ~ line 65 ~ startRp ~ catalogListUrl", catalogListUrl)
                    if(catalogListUrl) {        //小说目录
                        let option2 = {
                            // uri: catalogListUrl,
                    uri: sqlBook.originUrl,
                            userAgent: reptileCommon.userAgent,
                            encoding: null,
                            transform: function (body) {
                                // let body2 = iconv.decode(body, "gbk");  //用来查看页面
                                console.log('into transform')
                                return cheerio.load(iconv.decode(body, reptileCommon.code), {decodeEntities: false});
                            }
                        }
                        try{
                            let $2 = await timoRp(option2);
                            result = await getCatalogList({$:$2, reptileCommon, book:{}, updateNewCatalog:{sqlBook, updateTime, end, resolve, reptileType}});
                            console.log("🚀 ~ file: updateNewCatalog.js ~ line 79 ~ startRp ~ result", result)
                        }catch(err){
                            throw new Error(`访问目录页面错误，错误原因：${err}，失败地址：${catalogListUrl},代理地址：${option2.proxy}`);
                        }
                    } else {        //小说详情页有目录
                        result = await getCatalogList({$, reptileCommon, book:{}, updateNewCatalog:{sqlBook, updateTime, end, resolve, reptileType}});
                    }
                }catch(err){
                    start++;
                    if(err.toString().indexOf('Error: 访问目录页面错误') === 0) {
                        log.error(err);
                    } else {
                        log.error(`第${start}次爬取失败：${err}。失败地址：${sqlBook.originUrl}，body：${option}`);
                    }
                    error = err;
                    result = null;
                }
            }
            if(error && !result) {  // 错误就end
                end();
                reject(`获取${sqlBook.originUrl}${start}次失败，最后一次失败原因：${error}`);
            }
        }
    });
}
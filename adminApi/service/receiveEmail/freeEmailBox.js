const { oauth, tool, db, log, fs, path } = require('../../tool/require')

async function freeEmailBox() {
  return new Promise(async (resolve, reject) => {
    const boxes= await db.query(
      `select * from emailbox`
    )
    for(let i=0;i<boxes.length;i++){
      await db.query(`update emailbox set active=1 where id=${boxes[i].id}`)
    }
    console.log(`重新解封发件箱`)

    resolve(true)
  })
}

module.exports = freeEmailBox

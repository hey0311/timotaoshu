const { REPTILE_STATUS } = require('../../common/tool/constant')
const { oauth, tool, db, log, wss, rp } = require('../tool/require')
function checkstop() {
  console.log('check stop', global.reptileStatus === REPTILE_STATUS.STOP)
  return global.reptileStatus === REPTILE_STATUS.STOP
}

module.exports = checkstop

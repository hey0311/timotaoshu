<template>
  <div>
    <Card>
      <Row>
        <Col span="12" class="lh32">
          与服务器的连接状态：
          <span :style="{ color: state === '已经连接' ? 'green' : 'red' }">
            {{
            state
            }}
          </span>
        </Col>
        <!-- <Col span="4" class="lh32">停留人数：{{ count }}</Col> -->
        <Col span="12" class="tr">
          <Button type="primary" @click="clear">清除log</Button>
          <Button type="primary" @click="startReptile" :disabled="loading">
            {{
            btnTitle
            }}
          </Button>
          <Button type="primary" @click="stopReptile" :disabled="loading">停止</Button>
          <Button type="primary" @click="startReptileErrorTasks" :disabled="loading">开始爬取错误记录</Button>
          <Button type="primary" @click="batchSendEmail" :disabled="loading">批量发送邮件</Button>
          <Button type="primary" @click="syncToRemote" :disabled="loading">同步远程数据库</Button>
        </Col>
      </Row>
    </Card>
    <Card shadow style="margin: 10px 0">
      <Row>
        <Col span="12">
          <div>邮箱数量:{{ emailCount }}</div>
        </Col>
        <Col span="12">
          <div>错误记录数量:{{ errorTaskCount }}</div>
        </Col>
      </Row>
    </Card>
    <!-- <Card shadow style="margin: 10px 0">
      <div class="table-container">
        <div>
          <Table
            border
            highlight-row
            :columns="columns"
            :data="pageTableList1"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div style="margin-left: 20px">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="pageTableList2"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div style="margin-left: 20px">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="pageTableList3"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
      </div>
    </Card>-->
    <Card shadow style="margin: 10px 0">
      <div class="table-container1">
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList0"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList1"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList2"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList3"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList4"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList5"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList6"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList7"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList8"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <div class="table-container">
          <Table
            border
            highlight-row
            :columns="columns"
            :data="errorTableList9"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
      </div>
    </Card>
  </div>
</template>
<style>
.table-container1 {
  display: flex;
}
.table-row {
  height: 18px !important;
}
.table-row td {
  height: 18px !important;
}
.progress_log span {
  width: 400px;
  margin-right: 30px;
  overflow: hidden;
  display: inline-block;
}
</style>
<script type="text/ecmascript-6">
import util from 'util'
import config from '../../config'
import Vue from 'vue'
let pageTableList1 = []
let pageTableList2 = []
let pageTableList3 = []
let errorTableList0 = []
let errorTableList1 = []
let errorTableList2 = []
let errorTableList3 = []
let errorTableList4 = []
let errorTableList5 = []
let errorTableList6 = []
let errorTableList7 = []
let errorTableList8 = []
let errorTableList9 = []
export default {
  name: 'progress__',
  data() {
    return {
      readyState: ['正在连接', '已经连接', '正在断开', '已经断开'],
      ws: null,
      state: '已经断开',
      count: 0, // 留在当前页面的人数
      tableHeight: '500px',
      loading: false,
      columns: [
        // {
        //   title: '序号',
        //   key: 'index',
        //   width: 70,
        //   align: 'center'
        // },
        {
          title: '处理结果',
          key: 'result',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              style: {
                color: (params.row.result && params.row.result.indexOf('@') !== -1) ? 'blue' : (params.row.result && params.row.result.indexOf('失败') !== -1) ? 'red' : 'black',
                wordWrap: 'noWrap'
              }
            }, params.row.result)
          }
        },
      ],
      list: [
        // {progress:'like'}
      ],
      btnTitle: '开始爬取全部关键词',
      index: 1,
      scrollTop: 0,
      pageTableList1: [],
      pageTableList2: [],
      pageTableList3: [],
      errorTableList0: [],
      errorTableList1: [],
      errorTableList2: [],
      errorTableList3: [],
      errorTableList4: [],
      errorTableList5: [],
      errorTableList6: [],
      errorTableList7: [],
      errorTableList8: [],
      errorTableList9: [],
      curReptilePage: 0,
      curKeywordsName: '',
      curRuleName: '',
      curReptileStatus: '',
      emailCount: 0,
      errorTaskCount: 0
    }
  },
  computed: {},
  methods: {
    syncToRemote() {
      let obj = {
        params: {
        }
      }
      util.post.email.sync(obj).then((data) => {
      }).catch((err) => {
      })
    },
    batchSendEmail() {
      let obj = {
        params: {
        }
      }
      util.post.sendEmail.batch(obj).then((data) => {
      }).catch((err) => {
      })
    },
    getErrorTaskCount() {
      let obj = {
        params: {
        }
      }
      util.post.errorTask.list(obj).then((data) => {
        this.errorTaskCount = data.count
      }).catch((err) => {
      })
    },
    getEmailCount() {
      let obj = {
        params: {
        }
      }
      util.post.email.count(obj).then((data) => {
        this.emailCount = data.count
      }).catch((err) => {
      })
    },
    rowClass() {
      return 'table-row'
    },
    clear() {
      // this.list.splice(0,this.list.length);
      this.$refs.body.innerHTML = ''
    },
    startReptileErrorTasks() {

    },
    stopReptile() {
      this.loading = true
      let obj = {
        params: {
        }
      }
      util.post.reptile.stop(obj).then((data) => {
        this.loading = false
      }).catch((err) => {
        this.loading = false
      })
    },
    startReptile() {
      if (this.loading) return
      this.loading = true
      let obj = {
        params: {
        }
      }
      util.post.reptile.startReptileKeywords(obj).then((data) => {
        this.loading = false
      }).catch((err) => {
        this.loading = false
      })
    }
  },
  components: {},
  created() {

    this.ws = new WebSocket(config.wssServer + '?token=token')
    console.log("🚀 ~ file: progress.vue ~ line 211 ~ created ~ config.wssServer", config.wssServer)
    this.ws.onopen = () => {
      console.log('opend')
      this.ws.send('我是从客户端发送的消息')
    }
    this.ws.onmessage = (response) => {
      let data = JSON.parse(response.data)
      for (let i = 0; i < data.length; i++) {
        const progress = data[i].progress;
        if (typeof progress === 'object') {
          if (progress.type === 1) {// 错误记录
            this.curReptileStatus = '爬取错误记录'
            this.curKeywordsName = ''
            this.curRuleName = ''
            this.curReptilePage = ''
            this.getEmailCount()
            this.getErrorTaskCount()
          } else if (progress.type === 3) {
            this.curReptileStatus = '检查IP'
            this.curKeywordsName = ''
            this.curRuleName = ''
            this.curReptilePage = ''
            this.getEmailCount()
            this.getErrorTaskCount()
            this.pageTableList1 = []
            this.pageTableList2 = []
            this.pageTableList3 = []
            pageTableList1 = []
            pageTableList2 = []
            pageTableList3 = []
            this.errorTableList0 = []
            this.errorTableList1 = []
            this.errorTableList2 = []
            this.errorTableList3 = []
            this.errorTableList4 = []
            this.errorTableList5 = []
            this.errorTableList6 = []
            this.errorTableList7 = []
            this.errorTableList8 = []
            this.errorTableList9 = []
            errorTableList0 = []
            errorTableList1 = []
            errorTableList2 = []
            errorTableList3 = []
            errorTableList4 = []
            errorTableList5 = []
            errorTableList6 = []
            errorTableList7 = []
            errorTableList8 = []
            errorTableList9 = []
          } else if (this.curReptilePage !== progress.page || this.curKeywordsName !== progress.keywordsName || this.curRuleName !== progress.ruleName) {
            this.curReptileStatus = '爬取关键词'
            this.curKeywordsName = progress.keywordsName
            this.curRuleName = progress.ruleName
            this.curReptilePage = progress.page
            this.getEmailCount()
            this.getErrorTaskCount()
            this.errorTableList1 = []
            this.errorTableList2 = []
            this.errorTableList3 = []
            errorTableList1 = []
            errorTableList2 = []
            errorTableList3 = []
          }
          // 插入表格
          if (progress.index === undefined) {
            continue
          }
          if (progress.type === 1) {
            let curIndex = -1;
            let lastNumber = (progress.index + '').substr(-1);
            let list = errorTableList0
            switch (lastNumber) {
              case '0':
                list = errorTableList0
                break
              case '1':
                list = errorTableList1
                break
              case '2':
                list = errorTableList2
                break
              case '3':
                list = errorTableList3
                break
              case '4':
                list = errorTableList4
                break
              case '5':
                list = errorTableList5
                break
              case '6':
                list = errorTableList6
                break
              case '7':
                list = errorTableList7
                break
              case '8':
                list = errorTableList8
                break
              case '9':
                list = errorTableList9
                break
            }
            curIndex = list.findIndex(item => item.index === progress.index)
            if (curIndex !== -1) {
              list[curIndex] = Object.assign({}, list[curIndex], progress)
            } else {
              list.push(progress)
            }
            this.errorTableList0 = [...errorTableList0.sort((a, b) => a.index - b.index)]
            this.errorTableList1 = [...errorTableList1.sort((a, b) => a.index - b.index)]
            this.errorTableList2 = [...errorTableList2.sort((a, b) => a.index - b.index)]
            this.errorTableList3 = [...errorTableList3.sort((a, b) => a.index - b.index)]
            this.errorTableList4 = [...errorTableList4.sort((a, b) => a.index - b.index)]
            this.errorTableList5 = [...errorTableList5.sort((a, b) => a.index - b.index)]
            this.errorTableList6 = [...errorTableList6.sort((a, b) => a.index - b.index)]
            this.errorTableList7 = [...errorTableList7.sort((a, b) => a.index - b.index)]
            this.errorTableList8 = [...errorTableList8.sort((a, b) => a.index - b.index)]
            this.errorTableList9 = [...errorTableList9.sort((a, b) => a.index - b.index)]
          } else if (progress.type === 0) { // page
            let curIndex = -1;
            if (progress.index % 3 === 1) {
              curIndex = pageTableList1.findIndex(item => item.index === progress.index)
            } else if (progress.index % 3 === 2) {
              curIndex = pageTableList2.findIndex(item => item.index === progress.index)
            } else {
              curIndex = pageTableList3.findIndex(item => item.index === progress.index)
            }
            if (curIndex !== -1) {
              if (progress.index % 3 === 1) {
                pageTableList1[curIndex] = Object.assign({}, pageTableList1[curIndex], progress)
              } else if (progress.index % 3 === 2) {
                // Vue.set(pageTableList2, curIndex, Object.assign({}, pageTableList2[i], progress))
                pageTableList2[curIndex] = Object.assign({}, pageTableList2[curIndex], progress)
              } else {
                pageTableList3[curIndex] = Object.assign({}, pageTableList3[curIndex], progress)

              }
            } else {
              if (progress.index % 3 === 1) {
                pageTableList1.push(progress)
              } else if (progress.index % 3 === 2) {
                pageTableList2.push(progress)
              } else {
                pageTableList3.push(progress)
              }
            }
            this.pageTableList1 = [...pageTableList1.sort((a, b) => a.index - b.index)]
            this.pageTableList2 = [...pageTableList2.sort((a, b) => a.index - b.index)]
            this.pageTableList3 = [...pageTableList3.sort((a, b) => a.index - b.index)]
          }
        }
      }
      // let firstData = data[0]
      // if (firstData.count >= 0) {
      //   this.count = firstData.count
      // } else {
      //   // this.list = this.list.concat(data);
      //   // data.forEach((value, index) => {
      //   //     this.list.push(value);
      //   // })
      //   var html = ``
      //   data.forEach((value, index) => {
      //     this.index += index
      //     if (typeof value.progress === 'string') {
      //       html += `<div>${value.progress}</div>`
      //     }
      //   })
      //   this.scrollTop += 80
      //   this.$refs.body.innerHTML += html
      //   this.$refs.body.scrollTop = this.scrollTop
      // }

      this.state = this.readyState[this.ws.readyState]
    }
    this.ws.onclose = () => {
      this.state = this.readyState[this.ws.readyState]
      console.log("🚀 ~ file: progress.vue ~ line 294 ~ created ~ this.ws.readyState", this.ws.readyState)
    }
    this.ws.onerror = () => {
      this.state = this.readyState[this.ws.readyState]
      console.log("🚀 ~ file: progress.vue ~ line 298 ~ created ~ this", this)
    }

    // 页面被破坏时触发下
    window.onbeforeunload = () => {
      this.ws.close()
    }
  },
  mounted() {
    this.getEmailCount()
    this.getErrorTaskCount()
    // this.tableHeight = (window.innerHeight - this.$refs.table.$el.offsetTop - 173 ) + 'px';
    // this.tableHeight = (window.innerHeight - this.$refs.body.offsetTop - 173) + 'px'
    // for (let i = 0; i < 63; i++) {
    //   this.tableList.push({
    //     index: i,
    //     shopUrl: 1
    //   })
    // }
  },
  beforeDestroy() {

  },
  destroyed() {
  },
  activated() {

  },
  deactivated() {
    this.ws.close()
    this.$destroy()
  }
}
</script>

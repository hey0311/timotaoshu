<template>
  <div>
    <Card>
      <Row>
        <Col span="12" class="lh32">
          与服务器的连接状态：
          <span :style="{ color: state === '已经连接' ? 'green' : 'red' }">{{
            state
          }}</span>
        </Col>
        <!-- <Col span="4" class="lh32">停留人数：{{ count }}</Col> -->
        <Col span="12" class="tr">
          <Button type="primary" @click="clear">清除log</Button>
          <Button type="primary" @click="startReptile" :disabled="loading">{{
            btnTitle
          }}</Button>
          <Button type="primary" @click="stopReptile" :disabled="loading"
            >停止</Button
          >
          <Button
            type="primary"
            @click="startReptileErrorTasks"
            :disabled="loading"
            >开始爬取错误记录</Button
          >
        </Col>
      </Row>
    </Card>
    <Card shadow style="margin: 10px 0">
      <div>当前步骤:{{ curReptileStatus }}</div>
      <div>当前关键词:{{ curKeywordsName }}</div>
      <div>当前网站:{{ curRuleName }}</div>
      <div>当前页数:{{ curReptilePage }}</div>
    </Card>
    <Card shadow style="margin: 10px 0">
      <div class="table-container">
        <div>
          <Table
            border
            highlight-row
            :columns="columns"
            :data="tableList1"
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
            :data="tableList2"
            ref="table"
            size="small"
            :row-class-name="rowClass"
          ></Table>
        </div>
        <!-- <Col span="8">
          <div
            ref="body"
            class="progress_log"
            :style="{ height: tableHeight, overflowY: 'auto' }"
          ></div>
        </Col> -->
      </div>
    </Card>
  </div>
</template>
<style>
.table-container {
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
let tableList1 = []
let tableList2 = []
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
        {
          title: '序号',
          key: 'index',
          width: 70,
          align: 'center'
        },
        // {
        //   title: '商品网址',
        //   key: 'itemUrl',
        //   align: 'center',
        //   width: 90,
        //   render: (h, params) => {
        //     return h('span', {}, params.row.itemUrl ? '成功' : '')
        //   }
        // },
        // {
        //   title: '店铺网址',
        //   key: 'shopUrl',
        //   align: 'center',
        //   width: 90,
        //   render: (h, params) => {
        //     return h('span', {}, params.row.shopUrl ? '成功' : '')
        //   }
        // },
        // {
        //   title: '邮箱',
        //   key: 'email',
        //   align: 'center',
        // },
        {
          title: '处理结果',
          key: 'result',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              color: params.row.result && params.row.result.indexOf('@') !== -1 ? 'green' : 'black'
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
      tableList1: [],
      tableList2: [],
      curReptilePage: 0,
      curKeywordsName: '',
      curRuleName: '',
      curReptileStatus: ''
    }
  },
  computed: {},
  methods: {
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
      // if(this.loading || this.btnTitle =='正在爬取') {
      //     return;
      // }
      // let obj = {
      //   params: {
      //   }
      // }
      // this.loading = true
      // util.post.reptile.startReptile(obj).then((data) => {
      //   this.loading = false
      //   this.$Message.info('开始爬取')
      //   this.btnTitle = '正在爬取'
      // }).catch((err) => {
      //   this.loading = false
      //   this.btnTitle = '正在爬取'
      //   throw err
      // })
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
      console.log("🚀 ~ file: progress.vue ~ line 143 ~ created ~ data", data)
      for (let i = 0; i < data.length; i++) {
        const progress = data[i].progress;
        if (typeof progress === 'object') {
          if (progress.type === 1) {// 错误记录
            this.curReptileStatus = '爬取错误记录'
            this.curKeywordsName = ''
            this.curRuleName = ''
            this.curReptilePage = ''
          } else if (progress.type === 3) {
            this.curReptileStatus = '检查IP'
            this.curKeywordsName = ''
            this.curRuleName = ''
            this.curReptilePage = ''
            setTimeout(() => {
              this.tableList1 = []
              this.tableList2 = []
              tableList1 = []
              tableList2 = []
            }, 10000)
          } else if (this.curReptilePage !== progress.page || this.curKeywordsName !== progress.keywordsName || this.curRuleName !== progress.ruleName) {
            this.curReptileStatus = '爬取关键词'
            this.curKeywordsName = progress.keywordsName
            this.curRuleName = progress.ruleName
            this.curReptilePage = progress.page
          }
          // 插入表格
          if (progress.index === undefined) {
            continue
          }
          let curIndex = -1;
          if (progress.index % 2 === 1) {
            curIndex = tableList1.findIndex(item => item.index === progress.index)
          } else {
            curIndex = tableList2.findIndex(item => item.index === progress.index)
          }
          if (curIndex !== -1) {
            if (progress.index % 2 === 1) {
              // Vue.set(tableList1, curIndex, Object.assign({}, tableList1[i], progress))
              tableList1[curIndex] = Object.assign({}, tableList1[curIndex], progress)
            } else {
              // Vue.set(tableList2, curIndex, Object.assign({}, tableList2[i], progress))
              tableList2[curIndex] = Object.assign({}, tableList2[curIndex], progress)
            }
          } else {
            if (progress.index % 2 === 1) {
              tableList1.push(progress)
            } else {
              tableList2.push(progress)
            }
          }
          this.tableList1 = [...tableList1.sort((a, b) => a.index - b.index)]
          this.tableList2 = [...tableList2.sort((a, b) => a.index - b.index)]
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

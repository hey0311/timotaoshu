<template>
  <Layout>
    <Card>
      <Row>
        <Col span="6">
          <span class="span-title">搜索邮箱：</span>
          <Input
            @keyup.native.13="getList"
            v-model="searchEmail"
            placeholder="请输入邮箱"
            clearable
            class="w300"
          ></Input>
        </Col>
        <Col span="4">
          <Checkbox v-model="onlyShowSend">只显示已发送</Checkbox>
        </Col>
        <Col span="14" class="tr">
          <Button type="primary" @click="getList">查询</Button>
          <Button type="primary" :disabled="loading" @click="addEmail('add')" >添加</Button>
        </Col>
      </Row>
    </Card>
    <Card style="margin-top:20px" shadow>
      <Table
        border
        highlight-row
        :loading="loading"
        :columns="columns"
        :data="reptileList"
        ref="table"
      ></Table>
    </Card>
    <Card shadow>
      <Page
        :current="params.page"
        :page-size="params.limit"
        :total="total"
        show-total
        show-elevator
        @on-change="getList"
      ></Page>
    </Card>
    <add-email :modal="modal" ref="addEmail" @save="saveEmail"></add-email>
  </Layout>
</template>
<style scoped rel="stylesheet/less" type="text/less" lang="less">
.upload {
  display: inline-block;
  vertical-align: top;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
<script>
import util from 'util'
// import reptileConfig from './components/reptileConfig';
// import editChannel from 'modal/reptile-tool/editChannel.vue'
import uploadMixins from '@/mixins/uploadMixins'
import config from '../../libs/config'
import Cookies from 'js-cookie'
import addEmail from 'modal/reptile-tool/addEmail.vue'

export default {
  mixins: [uploadMixins],
  name: 'reptile',
  components: {
    // reptileConfig,
    // editChannel
    addEmail
  },
  data() {
    return {
      columns: [
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: 'business name',
          key: 'bizName'
        },
        {
          title: 'first name',
          key: 'firstName'
        },
        {
          title: 'last name',
          key: 'lastName'
        },
        {
          title: 'phone',
          key: 'phone'
        },
        {
          title: '店铺网址',
          width: 90,
          key: 'shopUrl',
          render: (h, params) => {
            return h('a', {
              attrs: {
                href: params.row.shopUrl,
                target: '_blank'
              }
            }, '打开')
          }
        },
        {
          title: '爬取时间',
          key: 'reptileTime',
          render: (h, params) => {
            return h('span', {

            }, new Date(params.row.reptileTime).toLocaleString())
          }
        },
        {
          title: '发送状态',
          width: 90,
          key: 'sendStatus'
        },
        {
          title: '发送时间',
          key: 'sendTime',
          render: (h, params) => {
            return h('span', {

            }, new Date(params.row.sendTime).toLocaleString())
          }
        },
        {
          title: '邮件模板',
          key: 'template',
          render: (h, params) => {
            return h('span', {

            }, params.row.template.subject)
          }
        },
        {
          title: '发件箱',
          key: 'sendbox',
          render: (h, params) => {
            return h('span', {

            }, params.row.sendbox.email)
          }
        },
        {
          title: '发送结果',
          key: 'send_result',
        },
      ],
      loading: false,
      params: {
        page: 1,
        limit: 10
      },
      total: 0,
      reptileList: [],
      modal: {
        showModal: false
      },
      baseUrl: config.apiUrl,
      token: Cookies.get('token'),
      uploadParams: {
        token: Cookies.get('token')
      },
      searchEmail: '',
      onlyShowSend: false
    }
  },
  computed: {},
  methods: {
    addEmail() {
      this.modal.showModal = true
      this.$refs.addEmail.$emit('reset', 'add', null)
    },
    saveEmail(id, name) {
      console.log(name)
      this.loading = true
      util.post.email.save({
        params: {
          id,
          name
        }
      }).then((data) => {
        this.loading = false
        console.log(data)
        this.getList()
        this.$Message.info(`${data}`)
        this.$Modal.confirm({
          title: `${data}`,
          closable: true,
          onOk: () => {
            this.$Modal.remove()
          },
          onCancel: () => {
            this.$Modal.remove()
          }
        })
      }).catch((err) => {
        this.loading = false
      })
    },
    batchSendEmail() {
      util.post.sendEmail.batch({ params: {} }).then(data => {

      })
    },
    getList(page) {
      let obj = {
        params: {
          page: page || this.params.page,
          limit: this.params.limit,
          email: this.searchEmail,
          onlyShowSend: this.onlyShowSend
        }
      }
      this.loading = true
      util.post.email.list(obj).then((data) => {
        this.reptileList = data.list
        this.total = data.count
        this.loading = false
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickUpdate() {
      if (this.loading) return
      let obj = {
        params: {
          page: this.params.page,
          limit: this.params.limit
        }
      }
      this.loading = true
      util.post.reptile.updateReptileList(obj).then((data) => {
        this.loading = false
        this.reptileList = data.reptileList
        this.total = data.count
      }).catch((err) => {
        this.loading = false
      })
    },
    // expandToggle(row, index) {  //触发click事件
    //     this.$refs.table.$el.getElementsByClassName("ivu-table-cell-expand")[index].click();
    // },
    onClickDelete(reptileTypeId) {
      if (this.loading) return
      let obj = {
        params: {
          reptileTypeId: reptileTypeId
        }
      }
      this.loading = true
      util.post.reptile.deleteChannel(obj).then((data) => {
        this.loading = false
        this.onClickUpdate()
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickShowModal(type, data) {
      switch (type) {
        case 'add':
          this.$refs.editCannel.$emit('reset', 'add', null)
          break
        case 'look':
          this.$refs.editCannel.$emit('reset', 'look', data)
          break
        case 'copyAdd':
          this.$refs.editCannel.$emit('reset', 'copyAdd', data)
          break
        case 'edit':
          this.$refs.editCannel.$emit('reset', 'edit', data)
          break
        default:
          return
          break
      }
      this.modal.showModal = true
    },
    onClickToggleUse(reptileTypeId, isSearch, reason) {
      // console.log(isSearch);//1、启用 2、禁用

      let isSearchTitle = `${isSearch === 1 ? '启用' : '禁用'}`
      this.$Modal.confirm({
        title: `你确定要${isSearchTitle}吗？`,
        closable: true,
        loading: true, // onOk异步关闭
        onOk: () => {
          let reason = document.getElementById('reasonTextarea').value
          this.onClickConfirmToggleUse(reptileTypeId, isSearch, reason, () => {
            this.$Modal.remove()
          })
        },
        onCancel: () => {
          this.$Message.info(`取消${isSearchTitle}`)
        },
        render: (h) => {
          return h('div', {
            attrs: {
              style: `padding-top:20px;`
            },
            on: {
              input: (val) => {
                this.value = val
              }
            }
          }, [
            h('span', {
              attrs: {
                style: `line-height:20px;margin-bottom:5px;display:block;`
              },
              on: {
                click: (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }
              }
            }, `禁用原因：`),
            h('textarea', {
              attrs: {
                style: 'line-height:20px;min-height:100px;',
                placeholder: '请填写禁用原因',
                class: 'ivu-input',
                id: 'reasonTextarea'
              }
            }, `${reason}`)
          ])
        }
      })
    },
    onClickConfirmToggleUse(reptileTypeId, isSearch, reason, callback) {
      if (this.loading) return
      let obj = {
        params: {
          reptileTypeId: reptileTypeId,
          isSearch: isSearch,
          reason: reason
        }
      }
      this.loading = true
      util.post.reptile.updateChannelSearch(obj).then((data) => {
        this.loading = false
        callback()
        this.getList()
      }).catch((error) => {
        this.loading = false
      })
    },
    onClickExportChannel() { // 导出
      let obj = {
        responseType: 'blob',
        params: {}
      }
      this.loading = true
      util.post.reptile.exportChannel(obj).then((data) => {
        this.loading = false

        const content = data
        const blob = new Blob([content])
        const fileName = '来源渠道列表.xls'
        /* xls下载 */
        if ('download' in document.createElement('a')) { // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else { // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      }).catch((err) => {
        this.loading = false
        console.error(err)
      })
    },
    succesFun(data) {
      this.getList()
    }
  },
  mounted() {
    this.getList()
    this.$on('reset', () => {
      this.onClickUpdate()
    })
  },
  activated() {

  },
  deactivated() {
  }
}
</script>

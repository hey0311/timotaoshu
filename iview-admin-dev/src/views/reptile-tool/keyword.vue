<template>
  <Layout>
    <Card shadow>
      <div class="header">
        <h3>关键词</h3>
        <Button type="primary" :disabled="loading" @click="onClickShowModal('add')">添加</Button>
      </div>
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
    <!-- <edit-channel :modal="modal" ref="editCannel"></edit-channel> -->
    <add-keywords :modal="modal" ref="addKeywords" @save="saveKeywords"></add-keywords>
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
import uploadMixins from '@/mixins/uploadMixins'
import config from '../../libs/config'
import Cookies from 'js-cookie'
import addKeywords from '../../modal/reptile-tool/addKeywords.vue'

export default {
  mixins: [uploadMixins],
  name: 'reptile',
  components: {
    addKeywords
  },
  data() {
    return {
      columns: [
        {
          title: 'id',
          width: 50,
          key: 'id'
        },
        {
          title: '关键词',
          key: 'name'
        },
        {
          title: '是否启用',
          key: 'active',
          render: (h, params) => {
            return h('div', {

            }, params.row.active ? '启用' : '禁用')
          }
        },
        {
          title: '操作',
          key: 'handle',
          render: (h, params) => {
            return h('div', [
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  style: `margin-left:10px;`,
                  id: `${params.row.title}_ti${params.row.id}`
                },
                on: {
                  click: () => {
                    // this.onClickUpdate(params, 1)
                    this.onClickShowModal('edit', params.row)
                  }
                }
              }, `编辑`),
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  style: `margin-left:10px;`
                },
                on: {
                  click: () => {
                    this.onClickDelete(params.row.id)
                  }
                }
              }, `删除`)
            ])
          }
        }
      ],
      loading: false,
      params: {
        page: 1,
        limit: 100
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
      }
    }
  },
  computed: {},
  methods: {
    saveKeywords(id, name) {
      this.loading = true
      util.post.keywords.save({
        params: {
          id,
          name
        }
      }).then((data) => {
        this.loading = false
        this.getList()
      }).catch((err) => {
        this.loading = false
      })
    },
    getList(page) {
      let obj = {
        params: {
          page: page || this.params.page,
          limit: this.params.limit
        }
      }
      this.loading = true
      util.post.keywords.list(obj).then((data) => {
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
    onClickDelete(id) {
      if (this.loading) return
      this.loading = true
      util.post.keywords.delete({ params: { id } }).then((data) => {
        this.loading = false
        this.getList()
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickShowModal(type, data) {
      switch (type) {
        case 'add':
          this.$refs.addKeywords.$emit('reset', 'add', null)
          break
        // case 'look':
        //   this.$refs.editCannel.$emit('reset', 'look', data)
        //   break
        // case 'copyAdd':
        //   this.$refs.editCannel.$emit('reset', 'copyAdd', data)
        //   break
        case 'edit':
          this.$refs.addKeywords.$emit('reset', 'edit', data)
          break
        // case 'addBlackEmail':
        //   this.$refs.addBlackEmail.$emit('reset')
        //   break
        // case 'addWhiteEmail':
        //   this.$refs.addWhiteEmail.$emit('reset')
        //   break
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

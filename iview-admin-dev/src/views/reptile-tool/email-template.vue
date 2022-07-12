<template>
  <Layout>
    <Card shadow>
      <div class="header">
        <h3>邮件模板</h3>
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
    <!-- <Card shadow>
      <Page
        :current="params.page"
        :page-size="params.limit"
        :total="total"
        show-total
        show-elevator
        @on-change="getList"
      ></Page>
    </Card>-->
    <!-- <edit-channel :modal="modal" ref="editCannel"></edit-channel> -->
    <edit-template :modal="modal" ref="editTemplate" @save="saveTemplate"></edit-template>
    <set-test-email :modal="setEmailModal" ref="setEmailModal" @save="testTemplate"></set-test-email>
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
import editChannel from 'modal/reptile-tool/editChannel.vue'
import editTemplate from 'modal/reptile-tool/editTemplate.vue'
import uploadMixins from '@/mixins/uploadMixins'
import config from '../../libs/config'
import Cookies from 'js-cookie'
import setTestEmail from 'modal/reptile-tool/setTestEmail'

export default {
  mixins: [uploadMixins],
  name: 'reptile',
  components: {
    // reptileConfig,
    setTestEmail,
    editChannel,
    editTemplate
  },
  data() {
    return {
      columns: [
        {
          title: 'id',
          key: 'id',
          width: 50
        },
        {
          title: '主题',
          key: 'subject'
        },
        {
          title: '备注',
          key: 'remark'
        },
        {
          title: '已发送邮件数',
          key: 'sendCount',
          width: 120
        },
        {
          title: '状态',
          key: 'active',
          width: 100,
          render: (h, params) => {
            return h('div', {}, params.row.active === 1 ? '启用' : '禁用')
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
                  target: '_blank',
                  style: `margin-left:10px;`
                },
                on: {
                  click: (e) => {
                    this.onClickShowModal('edit', params.row)
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }
              }, '编辑'),
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  target: '_blank',
                  style: `margin-left:10px;`
                },
                on: {
                  click: (e) => {
                    this.onClickShowModal('sendToTest', params.row)
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }
              }, '发送到测试邮箱'),
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  target: '_blank',
                  style: `margin-left:10px;`
                },
                on: {
                  click: (e) => {
                    this.onClickShowModal('copyAdd', params.row)
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }
              }, '复制新增'),
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  target: '_blank',
                  style: `margin-left:10px;${params.row.isSearch === 2 ? '' : 'color:red;'}`
                },
                on: {
                  click: (e) => {
                    // this.$router.push("/catalog?bookId=" + params.row.id);
                    this.onClickToggleUse(params.row.id, params.row.active)
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }
              }, `${params.row.active === 0 ? '启用' : '禁用'}`),
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  target: '_blank',
                  style: `margin-left:10px;color:red;`
                },
                on: {
                  click: (e) => {
                    // this.$router.push("/catalog?bookId=" + params.row.id);
                    this.onClickDelete(params.row.id)
                    e.stopPropagation()
                    e.preventDefault()
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
      setEmailModal: {
        showModal: false
      },
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
    /**
     * 测试邮件
     */
    testTemplate(params) {
      this.loading = true
      util.post.template.test({ params }).then((data) => {
        this.loading = false
      }).catch((err) => {
        this.loading = false
      })
    },
    /**
     * 保存
     */
    saveTemplate(params) {
      this.loading = true;
      util.post.template.save({
        params
      }).then((data) => {
        this.loading = false;
        this.getList()
      }).catch((err) => {
        this.loading = false;
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
      util.post.template.list(obj).then((data) => {
        this.reptileList = data.list
        this.total = data.count
        this.loading = false
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickDelete(id) {
      if (this.loading) return
      this.loading = true
      util.post.template.delete({
        params: {
          id
        }
      }).then((data) => {
        this.loading = false
        this.getList()
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickShowModal(type, data) {
      switch (type) {
        case 'add':
          this.$refs.editTemplate.$emit('reset', 'add', null)
          this.modal.showModal = true
          break
        case 'look':
          this.$refs.editTemplate.$emit('reset', 'look', data)
          break
        case 'copyAdd':
          util.post.template.save({
            params: Object.assign({}, data, { id: '' })
          }).then((data) => {
            this.getList()
          }).catch((err) => {
            // this.loading = false;
          })
          break
        case 'edit':
          this.$refs.editTemplate.$emit('reset', 'edit', data)
          this.modal.showModal = true
          break
        case 'sendToTest':
          this.$refs.setEmailModal.$emit('reset', data)
          this.setEmailModal.showModal = true
          break
        default:
          break
      }
    },
    onClickToggleUse(id, curAble) {
      this.loading = true;
      util.post.template.active({ params: { id, active: curAble === 1 ? 0 : 1 } }).then((data) => {
        this.loading = false
        this.getList()
      }).catch((err) => {
        this.loading = false
      })
    },
  },
  mounted() {
    this.getList()
  },
  activated() {

  },
  deactivated() {
  }
}
</script>

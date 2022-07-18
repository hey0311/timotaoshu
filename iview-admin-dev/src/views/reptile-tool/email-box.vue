<template>
  <Layout>
    <Button type="primary" @click="receiveEmail">收取邮件</Button>
    <Card shadow>
      <Table
        border
        highlight-row
        :loading="receiveLoading"
        :columns="columnsReceive"
        :data="mailList"
        ref="table"
      ></Table>
    </Card>
    <Card shadow>
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
    <edit-channel :modal="modal" ref="editCannel"></edit-channel>
  </Layout>
</template>
<style scoped rel="stylesheet/less" type="text/less" lang="less">
.upload {
  display: inline-block;
  vertical-align: top;
}
</style>
<script>
import util from 'util';
// import reptileConfig from './components/reptileConfig';
import editChannel from 'modal/reptile-tool/editChannel.vue';
import uploadMixins from '@/mixins/uploadMixins';
import config from '../../libs/config';
import Cookies from 'js-cookie';

export default {
  mixins: [uploadMixins],
  name: 'reptile',
  components: {
    // reptileConfig,
    editChannel
  },
  data() {
    return {
      columns: [
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: '已发邮件数',
          key: 'sendCount'
        },
        {
          title: '状态',
          key: 'active',
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
            ])
          }
        }
      ],
      columnsReceive: [
        {
          title: '发件人',
          key: 'from'
        },
        {
          title: '收件箱',
          key: 'to'
        },
        {
          title: '主题',
          key: 'subject'
        },
      ],
      loading: false,
      receiveLoading: false,
      params: {
        page: 1,
        limit: 100
      },
      total: 0,
      reptileList: [],
      mailList: [],
      modal: {
        showModal: false
      },
      baseUrl: config.apiUrl,
      token: Cookies.get('token'),
      uploadParams: {
        token: Cookies.get('token')
      }
    };
  },
  computed: {},
  methods: {
    receiveEmail() {
      let obj = {
        params: {
        }
      }
      this.receiveLoading = true
      util.post.receive.list(obj).then((data) => {
        this.mailList = data
        this.receiveLoading = false
      }).catch((err) => {
        this.receiveLoading = false
      })
    },
    getList(page) {
      let obj = {
        params: {
          page: page || this.params.page,
          limit: this.params.limit
        }
      };
      this.loading = true;
      util.post.emailbox.list(obj).then((data) => {
        this.reptileList = data.list;
        this.total = data.count;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
    },
    onClickUpdate() {
      if (this.loading) return;
      let obj = {
        params: {
          page: this.params.page,
          limit: this.params.limit
        }
      };
      this.loading = true;
      util.post.reptile.updateReptileList(obj).then((data) => {
        this.loading = false;
        this.reptileList = data.reptileList;
        this.total = data.count;
      }).catch((err) => {
        this.loading = false;
      });
    },
    // expandToggle(row, index) {  //触发click事件
    //     this.$refs.table.$el.getElementsByClassName("ivu-table-cell-expand")[index].click();
    // },
    onClickDelete(reptileTypeId) {
      if (this.loading) return;
      let obj = {
        params: {
          reptileTypeId: reptileTypeId
        }
      };
      this.loading = true;
      util.post.reptile.deleteChannel(obj).then((data) => {
        this.loading = false;
        this.onClickUpdate();
      }).catch((err) => {
        this.loading = false;
      });
    },
    onClickShowModal(type, data) {
      switch (type) {
        case "add":
          this.$refs.editCannel.$emit('reset', 'add', null);
          break;
        case "look":
          this.$refs.editCannel.$emit('reset', 'look', data);
          break;
        case "copyAdd":
          this.$refs.editCannel.$emit('reset', 'copyAdd', data);
          break;
        case "edit":
          this.$refs.editCannel.$emit('reset', 'edit', data);
          break;
        default:
          return;
          break;
      }
      this.modal.showModal = true;
    },
    onClickToggleUse(id, curAble) {
      this.loading = true;
      util.post.emailbox.active({ params: { id, active: curAble === 1 ? 0 : 1 } }).then((data) => {
        this.loading = false
        this.getList()
      }).catch((err) => {
        this.loading = false
      })
    },
    onClickConfirmToggleUse(reptileTypeId, isSearch, reason, callback) {
      if (this.loading) return;
      let obj = {
        params: {
          reptileTypeId: reptileTypeId,
          isSearch: isSearch,
          reason: reason
        }
      };
      this.loading = true;
      util.post.reptile.updateChannelSearch(obj).then((data) => {
        this.loading = false;
        callback();
        this.getList();
      }).catch((error) => {
        this.loading = false;
      })
    },
    onClickExportChannel() { // 导出
      let obj = {
        responseType: 'blob',
        params: {}
      };
      this.loading = true;
      util.post.reptile.exportChannel(obj).then((data) => {
        this.loading = false;

        const content = data;
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
        this.loading = false;
        console.error(err);
      });
    },
    succesFun(data) {
      this.getList();
    }
  },
  mounted() {
    this.getList();
    // this.receiveEmail()
    this.$on('reset', () => {
      this.onClickUpdate();
    });
  },
  activated() {

  },
  deactivated() {
  }
};
</script>

<template>
  <Layout>
    <Card shadow>
      <div class="header">
        <h3>黑名单</h3>
        <Button
          type="primary"
          :disabled="loading"
          @click="onClickShowModal('addBlackEmail')"
          >添加</Button
        >
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
    <Card shadow style="margin-top: 30px">
      <div class="header">
        <h3>白名单</h3>
        <Button
          type="primary"
          :disabled="loading"
          @click="onClickShowModal('addWhiteEmail')"
          >添加</Button
        >
      </div>
      <Table
        border
        highlight-row
        :loading="loading"
        :columns="columnsWhite"
        :data="reptileList2"
        ref="table"
      ></Table>
    </Card>
    <Card shadow>
      <Page
        :current="params.page"
        :page-size="params.limit"
        :total="total2"
        show-total
        show-elevator
        @on-change="getList"
      ></Page>
    </Card>
    <!-- <edit-channel :modal="modal" ref="editCannel"></edit-channel> -->
    <add-black-email
      :modal="modal"
      ref="addBlackEmail"
      @save="saveBlackEmail"
    ></add-black-email>
    <add-black-email
      :modal="modal"
      ref="addWhiteEmail"
      @save="saveWhiteEmail"
    ></add-black-email>
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
import util from 'util';
// import reptileConfig from './components/reptileConfig';
import editChannel from 'modal/reptile-tool/editChannel.vue';
import uploadMixins from '@/mixins/uploadMixins';
import config from '../../libs/config';
import Cookies from 'js-cookie';
import addBlackEmail from 'modal/reptile-tool/addBlackEmail.vue';

export default {
  mixins: [uploadMixins],
  name: 'reptile',
  components: {
    // reptileConfig,
    addBlackEmail,
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
          title: '启用状态',
          key: 'name'
        },
      ],
      columnsWhite: [
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: '启用状态',
          key: 'name'
        },
      ],
      loading: false,
      params: {
        page: 1,
        limit: 100
      },
      total: 0,
      reptileList: [],
      total2: 0,
      reptileList2: [],
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
    saveWhiteEmail(email) {
      this.loading = true;
      util.post.reptile.saveWhiteEmail({
        params: {
          email
        }
      }).then((data) => {
        this.loading = false;
        this.getList();
      }).catch((err) => {
        this.loading = false;
      });
    },
    saveBlackEmail(email) {
      this.loading = true;
      util.post.reptile.saveBlackEmail({
        params: {
          email
        }
      }).then((data) => {
        this.loading = false;
        this.getList();
      }).catch((err) => {
        this.loading = false;
      });
    },
    getList(page) {
      let obj = {
        params: {
          page: page || this.params.page,
          limit: this.params.limit
        }
      };
      this.loading = true;
      util.post.reptile.emailBlack(obj).then((data) => {
        this.reptileList = data.list;
        this.total = data.count;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
      util.post.reptile.emailWhite(obj).then((data) => {
        this.reptileList2 = data.list;
        this.total2 = data.count;
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
        case "addBlackEmail":
          this.$refs.addBlackEmail.$emit('reset');
          break;
        case "addWhiteEmail":
          this.$refs.addWhiteEmail.$emit('reset');
          break;
        default:
          return;
          break;
      }
      this.modal.showModal = true;
    },
    onClickToggleUse(reptileTypeId, isSearch, reason) {

      // console.log(isSearch);//1、启用 2、禁用

      let isSearchTitle = `${isSearch == 1 ? "启用" : "禁用"}`;
      this.$Modal.confirm({
        title: `你确定要${isSearchTitle}吗？`,
        closable: true,
        loading: true,      //onOk异步关闭
        onOk: () => {
          let reason = document.getElementById("reasonTextarea").value;
          this.onClickConfirmToggleUse(reptileTypeId, isSearch, reason, () => {
            this.$Modal.remove();
          });

        },
        onCancel: () => {
          this.$Message.info(`取消${isSearchTitle}`);
        },
        render: (h) => {
          return h('div', {
            attrs: {
              style: `padding-top:20px;`,
            },
            on: {
              input: (val) => {
                this.value = val;
              }
            }
          }, [
            h('span', {
              attrs: {
                style: `line-height:20px;margin-bottom:5px;display:block;`
              },
              on: {
                click: (e) => {

                  e.stopPropagation();
                  e.preventDefault();
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
            }, `${reason}`),
          ])
        }
      });
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

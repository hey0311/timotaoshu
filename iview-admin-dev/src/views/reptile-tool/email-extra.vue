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
      :modal="whiteModal"
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
          title: 'id',
          key: 'id',
          width: 80
        },
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: '操作',
          key: 'handle',
          render: (h, params) => {
            return h('div', [
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  style: `margin-left:10px;`
                },
                on: {
                  click: () => {
                    this.onClickDeleteBlack(params.row.id)
                  }
                }
              }, `删除`)
            ])
          }
        }
      ],
      columnsWhite: [
        {
          title: 'id',
          key: 'id',
          width: 80
        },
        {
          title: '邮箱',
          key: 'email'
        },
        {
          title: '操作',
          key: 'handle',
          render: (h, params) => {
            return h('div', [
              h('a', {
                attrs: {
                  href: 'javascript:void(0);',
                  style: `margin-left:10px;`
                },
                on: {
                  click: () => {
                    this.onClickDeleteWhite(params.row.id)
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
        limit: 10
      },
      total: 0,
      reptileList: [],
      total2: 0,
      reptileList2: [],
      modal: {
        showModal: false
      },
      whiteModal: {
        showModal: false
      },
      baseUrl: config.apiUrl,
      token: Cookies.get('token'),
    };
  },
  computed: {},
  methods: {
    onClickDeleteBlack(id) {
      this.loading = true;
      util.post.emailExtra.deleteBlackEmail({
        params: {
          id
        }
      }).then((data) => {
        this.loading = false;
        this.getList();
      }).catch((err) => {
        this.loading = false;
      });
    },
    onClickDeleteWhite(id) {
      this.loading = true;
      util.post.emailExtra.deleteWhiteEmail({
        params: {
          id
        }
      }).then((data) => {
        this.loading = false;
        this.getList();
      }).catch((err) => {
        this.loading = false;
      });
    },
    saveWhiteEmail(email) {
      this.loading = true;
      util.post.emailExtra.saveWhiteEmail({
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
      console.log('aaaaaaaaa')
      this.loading = true;
      util.post.emailExtra.saveBlackEmail({
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
      util.post.emailExtra.listBlackEmail(obj).then((data) => {
        this.reptileList = data.list;
        this.total = data.count;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
      util.post.emailExtra.listWhiteEmail(obj).then((data) => {
        this.reptileList2 = data.list;
        this.total2 = data.count;
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
    },
    onClickShowModal(type, data) {
      switch (type) {
        case "addBlackEmail":
          this.$refs.addBlackEmail.$emit('reset');
          this.modal.showModal = true;
          break;
        case "addWhiteEmail":
          this.$refs.addWhiteEmail.$emit('reset');
          this.whiteModal.showModal = true;
          break;
        default:
          return;
          break;
      }
    },
  },
  mounted() {
    this.getList();
  },
  activated() {

  },
  deactivated() {
  }
};
</script>

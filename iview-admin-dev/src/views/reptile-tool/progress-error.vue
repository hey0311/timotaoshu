<template>
  <Layout>
    <Card shadow>
      <Table
        border
        highlight-row
        :loading="loading"
        :columns="columns"
        :data="list"
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
        @on-change="onClickSearch"
      ></Page>
    </Card>
  </Layout>
</template>
<script type="text/ecmascript-6">
import util from "util";
export default {
  name: "progress-error",
  data() {
    return {
      loading: false,
      reptileList: { length: 0 },
      columns: [
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '网址',
          key: 'uri',
        },
        {
          title: '重试次数',
          key: 'retryCount'
        },
      ],
      list: [],
      params: {
        page: 1,
        limit: 10
      },
      total: 0,
      bookName: '',
      showSimpleReptile: "",
      first: true,//第一次
    }
  },
  computed: {},
  methods: {
    getReptileList() {  //获取配置列表
      let obj = {
        params: {
        }
      };
      util.post.errorTask.list(obj).then((data) => {
        // this.reptileList = this.reptileList.concat(data.reptileList);
        this.list = data.list;
        // data.reptileList.forEach((value, index) => {
        //   this.reptileList[value.reptileTypeId] = value;
        // })
        this.list.length = data.count
        this.total = data.count
      }).catch((error) => { });
    },
  },
  components: {},
  created() {
    this.getReptileList();
  },
  mounted() {
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  activated() {
    this.start();
  },
  deactivated() {

  }
}
</script>

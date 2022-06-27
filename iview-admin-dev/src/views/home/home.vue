<style lang="less">
@import "./home.less";
</style>
<template>
  <Layout>
    <card>
      <Row>
        <Col span="8">爬取状态:</Col>
        <Col span="8">爬取中</Col>
        <Col span="8">
          <Button type="primary" :disabled="loading" @click="startReptileAllKeywords">开始爬取关键词</Button>
        </Col>
      </Row>
    </card>
    <div id="chart-container" style="width:600px;height:400px"></div>
    <v-chart :option="eOption" style="height:400px"></v-chart>
  </Layout>
</template>

<script>
import util from 'util'
import echarts from 'echarts'
// import config from "config"
export default {
  name: 'home',
  components: {
  },
  data() {
    return {
      loading: false,
      eOption: {
        title: '1',
        xAxis: {
          data: ['a', 'b']
        },
        series: [{
          name: '销量',
          type: 'bar',
          data: [1, 2]
        }]
      }
    }
  },
  computed: {},
  methods: {
    startReptileAllKeywords() {
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
  created() {
  },
  mounted() {
    echarts.init(document.getElementById('chart-container'))
    echarts.setOption({
      title: '1',
      xAxis: {
        data: ['a', 'b']
      },
      series: [{
        name: '销量',
        type: 'bar',
        data: [1, 2]
      }]
    })
  },
  activated() {
  },
  deactivated() {
  }
}
</script>

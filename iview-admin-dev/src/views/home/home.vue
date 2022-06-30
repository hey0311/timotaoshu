<style lang="less">
@import "./home.less";
</style>
<template>
  <Layout> </Layout>
</template>

<script>
import util from 'util'
// import config from "config"
export default {
  name: 'home',
  components: {
  },
  data() {
    return {
      loading: false,
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
  },
  activated() {
  },
  deactivated() {
  }
}
</script>

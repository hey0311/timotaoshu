<template>
  <div>
    <!--:closable  启用右上角关闭（含Esc键）-->
    <!--mask-closable  启用遮罩层关闭-->
    <Modal
      v-model="modal.showModal"
      :closable="false"
      :mask-closable="true"
      :width="500"
      @on-cancel="onClickCancel"
    >
      <h3 slot="header" class="modal-header-color">设置接收邮箱</h3>
      <div class="email-row">
        <span style="margin-right: 10px">邮箱:</span>
        <Input v-model="email" placeholder="输入邮箱" style="width: 400px" />
      </div>
      <div slot="footer">
        <Button type="text" @click="onClickCancel">取消</Button>
        <Button type="primary" :loading="loading" @click="onClickSave"
          >保存</Button
        >
      </div>
    </Modal>
  </div>
</template>

<style scoped rel="stylesheet/less" type="text/less" lang="less">
.email-row {
  display: flex;
  align-items: center;
}
</style>
<script type="text/ecmascript-6">
export default {
  name: 'set-test-email',
  props: {
    modal: {
      type: Object,
      default: { showModal: false }
    }
  },
  data() {
    return {
      loading: false,
      email: '',
      id: ''
    }
  },
  computed: {},
  methods: {
    onClickCancel() {
      this.modal.showModal = false
    },
    onClickSave() {
      this.$emit('save', { id: this.id, email: this.email })
      this.modal.showModal = false
    }
  },
  components: {},
  created() {

  },
  mounted() {
    this.$on('reset', (data) => {
      console.log(data)
      console.log('初始化')
      this.id = data.id
    })
  },
  beforeDestroy() {

  },
  destroyed() {
  },
  activated() {

  },
  deactivated() {

  }
}
</script>

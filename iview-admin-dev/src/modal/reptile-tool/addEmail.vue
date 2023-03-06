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
      <h3 slot="header" class="modal-header-color">添加邮箱</h3>
      <div style="margin-bottom: 10px">
        {{ isAdd ? "邮箱(每行一个):" : "邮箱" }}
      </div>
      <div v-if="isAdd" class="email-row">
        <Input
          v-model="name"
          placeholder="输入邮箱"
          type="textarea"
          :rows="10"
        />
      </div>
      <div v-else class="email-row">
        <Input v-model="name" placeholder="输入关键词" />
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
  name: 'add-email',
  props: {
    modal: {
      type: Object,
      default: { showModal: false }
    }
  },
  data() {
    return {
      loading: false,
      name: '',
      id: '',
      isAdd: false
    }
  },
  computed: {},
  methods: {
    onClickCancel() {
      this.modal.showModal = false
    },
    onClickSave() {
      this.$emit('save', this.id, this.name)
      this.modal.showModal = false
    }
  },
  components: {},
  created() {

  },
  mounted() {
    this.$on('reset', (type, data) => {
      console.log(data)
      console.log('初始化')
      if (type === 'edit') {
        this.id = data.id;
        this.name = data.name;
        this.isAdd = false
      } else if (type === 'add') {
        this.id = ''
        this.name = ''
        this.isAdd = true
      }
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

<template>
    <div>
        <!--:closable  启用右上角关闭（含Esc键）-->
        <!--mask-closable  启用遮罩层关闭-->
        <Modal v-model="modal.showModal" :closable='false' :mask-closable='true' :width="1000" @on-cancel="onClickCancel">
            <h3 slot="header" class="modal-header-color">模板</h3>
            <div>
                <text-editor></text-editor>
            </div>
            <div slot="footer">
                <Button type="text" @click="onClickCancel">取消</Button>
                <Button type="primary" :loading="loading" @click="onClickSave">保存</Button>
            </div>
        </Modal>
    </div>
</template>

<style scoped rel="stylesheet/less" type="text/less" lang="less">

</style>
<script type="text/ecmascript-6">
    import textEditor from '../../views/my-components/text-editor/text-editor.vue';
import tinymce from 'tinymce';
    export default {
        name: "edit-template",
        props:{
            modal: {
                type: Object,
                default: {showModal:false}
            },
        },
        data() {
            return {
                id:'',
                loading:false,
            }
        },
        computed: {},
        methods: {
            onClickCancel(){
                this.modal.showModal = false;
            },
            onClickSave(){
                this.$emit('save',{
                    id:this.id,
                    content:tinymce.get('tinymceEditer').getContent()
                });
                this.modal.showModal = false;
            }
        },
        components: {
            textEditor 
        },
        created() {

        },
        mounted() {
            this.$on('reset', (type,data) => {
                console.log(data);
                console.log("初始化");
                this.id=data.id;
                tinymce.get('tinymceEditer').setContent(data.content);
            });
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

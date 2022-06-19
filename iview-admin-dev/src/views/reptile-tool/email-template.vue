<template>
    <Layout>
        <Card shadow>
            <Table border highlight-row :loading="loading" :columns="columns" :data="reptileList" ref="table"></Table>
        </Card>
        <Card shadow>
            <Page :current="params.page" :page-size="params.limit" :total="total" show-total show-elevator
                  @on-change="getList"></Page>
        </Card>
        <!-- <edit-channel :modal="modal" ref="editCannel"></edit-channel> -->
        <edit-template :modal="modal" ref="editTemplate" @save="saveTemplate"></edit-template>
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
    import editTemplate from 'modal/reptile-tool/editTemplate.vue';
    import uploadMixins from '@/mixins/uploadMixins';
    import config from '../../libs/config';
    import Cookies from 'js-cookie';

    export default {
        mixins: [uploadMixins],
        name: 'reptile',
        components: {
            // reptileConfig,
            editChannel,
            editTemplate
        },
        data() {
            return {
                columns: [
                    {
                        title: 'id',
                        key: 'id'
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
                        title: '操作',
                        key: 'handle',
                        render: (h, params) => {
                            return h('div', [
                                h('a', {
                                    attrs: {
                                        href: 'javascript:void(0);',
                                        target: '_blank',
                                    },
                                    on: {
                                        click: (e) => {
                                            this.onClickShowModal('look', params.row)
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }
                                    }
                                }, '查看'),
                                h('a', {
                                    attrs: {
                                        href: 'javascript:void(0);',
                                        target: '_blank',
                                        style: `margin-left:10px;`
                                    },
                                    on: {
                                        click: (e) => {
                                            console.log("🚀 ~ file: email-template.vue ~ line 75 ~ data ~ params", params)
                                            this.onClickShowModal('edit', params.row)
                                            e.stopPropagation();
                                            e.preventDefault();
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
                                            this.onClickShowModal('sendToTest', params.row);
                                            e.stopPropagation();
                                            e.preventDefault();
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
                                            this.onClickShowModal('copyAdd', params.row);
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }
                                    }
                                }, '复制新增'),
                                h('a', {
                                    attrs: {
                                        href: 'javascript:void(0);',
                                        target: '_blank',
                                        style: `margin-left:10px;${params.row.isSearch == 2 ? '' : 'color:red;'}`
                                    },
                                    on: {
                                        click: (e) => {
                                            // this.$router.push("/catalog?bookId=" + params.row.id);
                                            this.onClickToggleUse(params.row.reptileTypeId, (params.row.isSearch == 2 ? 1 : 2), params.row.reason);
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }
                                    }
                                }, `${params.row.isSearch == 2 ? '启用' : '禁用'}`),
                                h('a', {
                                    attrs: {
                                        href: 'javascript:void(0);',
                                        target: '_blank',
                                        style: `margin-left:10px;color:red;`
                                    },
                                    on: {
                                        click: (e) => {
                                            // this.$router.push("/catalog?bookId=" + params.row.id);
                                            this.onClickDelete(params.row.reptileTypeId);
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }
                                    }
                                }, `删除`),
                            ])
                        }
                    },
                ],
                loading: false,
                params: {
                    page: 1,
                    limit: 100
                },
                total: 0,
                reptileList: [],
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
            saveTemplate(params){
                util.post.reptile.saveTemplate({
                    params
                }).then((data) => {
                    // this.reptileList = data.list;
                    // this.total = data.count;
                    // this.loading = false;
                    this.getList();
                }).catch((err) => {
                    // this.loading = false;
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
                util.post.reptile.emailTemplate(obj).then((data) => {
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
                        this.$refs.editTemplate.$emit('reset', 'edit', data);
                        break;
                    case "sendToTest":
                util.post.reptile.testTemplate({params:{id:data.id}}).then((data) => {
                    this.loading = false;
                    // this.reptileList = data.reptileList;
                    // this.total = data.count;
                }).catch((err) => {
                    this.loading = false;
                });
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

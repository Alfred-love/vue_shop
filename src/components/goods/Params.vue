<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 警告区域 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon
            >
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的联级选择框  options为数据源-->
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cateProps"
                        @change="handleChange"
                    >
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tab页签区域 activeName 属性值表示tab标签里面的标签的name属性，
            同时会将数据存储在activeName里面，且页面显示的也是存储的值对应的标签-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button 
                        type="primary" 
                        size="mini" 
                        :disabled="isBtnDisabled"
                        @click="addDialogVisible = true"
                        class="addParamsButton"
                    >
                    添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <!-- 循环渲染Tag标签，注意：这里一定得用index属性值动态绑定key属性 -->
                                <el-tag 
                                    v-for="(item, i) in scope.row.attr_vals" 
                                    :key="i" 
                                    closable
                                    @close="handleClosed(i, scope.row)"
                                >
                                {{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引行 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button 
                                    type="primary"  
                                    icon="el-icon-edit" 
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >
                                编辑</el-button>
                                <el-button 
                                    type="danger" 
                                    icon="el-icon-delete" 
                                    size="mini" 
                                    @click="removeParams(scope.row.attr_id, scope.row.attr_name)"
                                >
                                删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button 
                        type="primary" 
                        size="mini" 
                        :disabled="isBtnDisabled"
                        @click="addDialogVisible = true"
                        class="addParamsButton"
                    >
                    添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <!-- 循环渲染Tag标签，注意：这里一定得用index属性值动态绑定key属性 -->
                                <el-tag 
                                    v-for="(item, i) in scope.row.attr_vals" 
                                    :key="i" 
                                    closable
                                    @close="handleClosed(i, scope.row)"
                                >
                                {{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引行 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button 
                                    type="primary" 
                                    icon="el-icon-edit" 
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >
                                编辑</el-button>
                                <el-button 
                                    type="danger" 
                                    icon="el-icon-delete" 
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id, scope.row.attr_name)"
                                >
                                删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数的对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
        >
            <!-- 添加参数的表单 -->
            <el-form 
                ref="addFormRef" 
                :model="addForm" 
                label-width="120px"
                :rules="addFormRules"
            >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改参数的对话框 -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
        >
            <!-- 修改参数的表单 -->
            <el-form 
                ref="editFormRef" 
                :model="editForm" 
                label-width="120px"
                :rules="editFormRules"
            >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Params',
    data() {
        return {
            cateList: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            }, //级联选择框的配置对象
            selectedCateKeys: [], //级联选择框双向绑定到的数组,里面拿到的值是value，也就是id
            activeName: 'many', //被激活的页签的名称
            manyTableData: [], //被激活的动态属性的数据
            onlyTableData: [], //被激活的静态属性的数据
            addDialogVisible: false, //控制添加对话框的显示与隐藏
            addForm: {}, //添加参数的表单数据对象
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            }, //添加表单的验证规则对象
            editDialogVisible: false, //控制修改对话框的显示与隐藏
            editForm: {}, //修改的表单数据对象
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                ]
            },
        }
    },
    methods: {
        async getCateList() {
            const {data: res} = await this.$http('categories')
            if (res.meta.status !== 200) {
                this.$message.error('获取商品分类失败')
            }
            this.cateList = res.data
        },
        // 将双向绑定的 selectedCateKeys 清空，那么就可以重置你选择的n级商品分类数据
        handleChange() {
            this.getParamsData()
        },
        //tab页签点击事件的处理函数
        handleTabClick() {
            console.log(this.activeName)
            this.getParamsData()
        },
        //获取参数的列表数据
        async getParamsData() {
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            //根据所选分类的Id和当前所处的面板，获取对应的参数
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}}) 
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数失败')
            }
            console.log(res.data)
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                //看着文本框的显示与隐藏
                item.inputVisible = false
                item.inputValue = ''
            })
            if (this.activeName === 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        //监听添加对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        //点击按钮，添加参数 vaild为 turn 就是通过表单验证
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, 
                {attr_name: this.addForm.attr_name, attr_sel: this.activeName})
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数失败！')
                }
                this.$message.success('添加参数成功！')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        //点击按钮，展示修改的对话框
        async showEditDialog(attr_id) {
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, 
            {params: {attr_sel: this.activeName}})
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数信息失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //监听添加对话框的关闭事件，重置修改的表单
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        //点击按钮，修改参数信息 以下的attr_id（参数Id） 属性从上上面的函数的 editForm 对象里面的属性
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.put(
                `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
                if (res.meta.status !== 200) {
                    return this.$message.error('修改数据失败！')
                }
                this.$message.success('修改数据成功！')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        //根据Id删除对应的参数项
        async removeParams(attr_id, attr_name) {
            const confirmResult = await this.$confirm(`此操作将永久删除${attr_name}参数, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            //用户取消了删除的操作
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            //删除的业务逻辑
            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除参数失败')
            }
            this.$message.success('删除参数成功')
            this.getParamsData()
        },
        //文本输入框失去焦点和 enter 按键抬起事件
        async handleInputConfirm(row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            //如果没有return，则证明输入的内容需要做后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            //需要发起请求，保存这次操作
            this.saveAttrVals(row)
        },
        //将对 attr_vals 的操作封装为函数并保存到数据库，这里不必过分深究
        async saveAttrVals(row) {
            const {data: res} = await this.$http.put(
            `categories/${this.cateId}/attributes/${row.attr_id}`,
            {
                attr_name: row.attr_name, 
                attr_sel: row.attr_sel, 
                attr_vals: row.attr_vals.join(',')
            })
            if (res.meta.status !== 200) {
                return this.$message.error('修改参数项失败！')
            }
            this.$message.success('修改参数项成功！')
        },
        //点击按钮展示文本输入框
        showInput(row) {
            row.inputVisible = true
            //让文本框自动获取焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            })
        },
        //监听Tag标签关闭事件,也就是删除对应的参数可选项
        handleClosed(i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        //如果按钮需要被禁用，则返回true， 否则返回false
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        //当前选中的 三级 分类的Id
        cateId() {
            if (this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        //动态计算标题的文本
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        }
    },
    mounted() {
        this.getCateList()
    },
}
</script>

<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }
    .addParamsButton {
        margin-bottom: 15px;
    }
    .el-tag {
        margin: 10px;
    }
    // .el-tag:first-child {
    //     margin-left: 50px;
    // }
    .input-new-tag {
        width: 120px;
    }
</style>
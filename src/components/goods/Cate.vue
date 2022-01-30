<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类的按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table 
                :data="cateList" 
                :columns="columns" 
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false"
                class="treeTable"
            >
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: lightgreen;"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <template>
                        <el-button 
                            type="primary" 
                            icon="el-icon-edit" 
                            size="mini"
                            @click="showEditDialog(scope.row)"
                        >
                        编辑</el-button>
                    </template>
                    <template>
                        <el-button 
                            type="danger" 
                            icon="el-icon-delete" 
                            size="mini"
                            @click="removeCateById(scope.row.cat_id, scope.row.cat_name)"
                        >
                        删除</el-button>
                    </template>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClosed"
        >
            <!-- 添加分类的表单 -->
            <el-form 
                :model="addCateForm" 
                :rules="addCateFormRules" 
                ref="addCateFormRef" 
                label-width="100px"
            >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options 用来指定数据源 props 用来指定配置对象  change事件就是收集的输入框内容发生变化-->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChanged"
                        clearable
                    >
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加编辑的对话框 -->
        <el-dialog
            title="编辑提交分类"
            :visible.sync="addEditDialogVisible"
            width="50%"
            @close="addEditDialogClosed"
        >
            <el-form 
                ref="editFormRef" 
                :model="editForm" 
                label-width="80px"
                :rules="editFormRules"
            >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveEditCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Cate',
    data() {
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            }, //查询条件
            cateList: [], //商品分类的数据列表，默认为空
            total: 0, //总数据条数
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    //表示将当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    //表示将当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    //表示将当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用模板名称
                    template: 'opt'
                },
            ], //为table指定列的定义 prop表示请求的数组里面单个对象的单个属性，注意：是子对象及其后代对象里面的属性
            addCateDialogVisible: false, //控制添加分类对话框的分类与隐藏
            addCateForm: {
                cat_name: '', //将要添加的分类的名称
                cat_pid: 0, //父级分类的Id
                cat_level: 0  //分类的等级，默认添加的是1级分类
            }, //添加分类的表单数据对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },
            parentCateList: [], //父级分类的列表
            cascaderProps: { 
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
            }, //指定级联选择器配置对象，此对象里面第二至四项的属性都是parentCateList选项对象的属性，
            //checkStrictly选中任意一级数据
            selectedKeys: [], //选中的父级分类的Id数组,一定得是数组。
            addEditDialogVisible: false, //编辑分类对话框的关闭与开启
            editForm: {}, //查询到的分类信息对象
            editFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },
            CateId: '', //分类信息的Id
        }
    },
    methods: {
        //获取商品分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败')
            }
            this.cateList = res.data.result
            //为总数据条数赋值
            this.total = res.data.total
        },
        //监听 pagesize 每页条数改变
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        //监听 pagenum 当前页改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        //点击按钮，展示添加分类的对话框
        showAddCateDialog() {
            this.getParentCateList()
            this.addCateDialogVisible = true

        },
        //获取父级分类的数据列表
        async getParentCateList() {
            const {data: res} = await this.$http.get('categories', {params: {type: 2}})
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级数据失败！')
            }
            this.parentCateList = res.data
        },
        //选择项发生变化触发函数 为父级分类的Id赋值，为当前分类的等级赋值
        parentCateChanged() {
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮，添加新的分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功！')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        //监听对话框关闭事件，重置表单数据
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
        //编辑分类对话框
        async showEditDialog(row) {
            console.log(row.cat_id)
            this.CateId = row.cat_id
            const {data: res} = await this.$http.get('categories/' + row.cat_id)
            if (res.meta.status !== 200) {
                return this.$message.error('获取数据分类失败')
            }
            this.editForm = res.data
            this.addEditDialogVisible = true
        },
        //修改分类信息并提交
        saveEditCate() {
            this.$refs.editForm.validate(async valid => {
                if(!valid) return
                const {data: res} = await this.$http.put('categories/' + this.CateId, {cat_name: this.editForm.cat_name})
                if (res.meta.status !== 200) {
                    return this.$message.error('修改数据分类失败')
                }
                this.addEditDialogVisible = false
                this.getCateList()
                this.$message.success('修改数据分类成功')
            })
        },
        //监听编辑对话框的关闭事件
        addEditDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        //根据Id删除分类信息并提交
        async removeCateById(id, name) {
            //弹框询问用户是否删除数据
            const confirmResult = await this.$confirm(`此操作将永久删除${name}分类, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const {data: res} = await this.$http.delete('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除分类失败')
            }
            this.$message.success('删除分类成功')
            this.getCateList()
        }
    },
    created() {
        this.getCateList()
    }
}
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 15px;
    }
    .el-cascader{
        width: 100%;
    }
</style>
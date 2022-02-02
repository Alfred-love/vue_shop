<template>
  <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 gutter 属性表示栅栏间隔-->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- table表格区域  prop 属性是 goodslist 数组单个对象的属性-->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px"></el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot="scope">
                        <el-button 
                            type="primary" 
                            icon="el-icon-edit" 
                            size="mini"
                            @click="showEditDialog(scope.row.goods_id)"
                        >
                        </el-button>
                        <el-button 
                            type="danger" 
                            icon="el-icon-delete" 
                            size="mini"
                            @click="removeById(scope.row.goods_id)"
                        >
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </el-card>
        <!-- 1.修改商品参数的对话框 -->
        <el-dialog
            title="修改商品参数，接口错误，不能修改"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
        >
            <el-form ref="editFormRef" :model="editData" :rules="editFormRules" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editData.goods_name" disabled></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="goods_price">
                    <el-input v-model.number="editData.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="数量" prop="goods_number">
                    <el-input v-model.number="editData.goods_number" type="number"></el-input>
                </el-form-item>
                <el-form-item label="重量" prop="goods_weight">
                    <el-input v-model.number="editData.goods_weight" type="number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    name: 'List',
    data() {
        return {
            //查询参数对象，query表示查询参数文本，pagenum表示当前页，pagesize表示每页条数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            //商品列表
            goodslist: [],
            //总数据条数
            total: 0,
            editDialogVisible: false, //2.控制修改对话框的开启与关闭
            editFormRules: {
                goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
                goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
                goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
                goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}]
            }, //修改表单的验证规则对象
            editData: {} //根据id查询到的用户信息对象
        }
    },
    methods: {
        //根据分页获取相应的商品列表
        async getGoodsList() {
            const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
            if (res.meta.status !== 200) {
                return this.$message.error('请求商品数据失败')
            }
            console.log(res.data)
            this.goodslist = res.data.goods
            this.total = res.data.total
            this.time()
        },
        //定义创建时间
        time() {
            this.goodslist.forEach(item => {
                item.add_time = this.dayjs(item.add_time).format('YYYY-MM-DD HH:mm:ss')
            })
        },
        //每页显示的数据条数，底层传进来的参数，不需要自己传参
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        //当前页码发生变化，底层传进来的参数，不需要自己传参
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        //根据Id删除数据
        async removeById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除！')
            }
            const {data: res} = await this.$http.delete(`goods/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除失败！')
            }
            this.$message.success('删除成功！')
            this.getGoodsList()
        },
        //跳转Add页面
        goAddPage() {
            this.$router.push('/goods/add')
        },
        //3.根据 ID 查询商品
        async showEditDialog(id) {
            const {data: res} = await this.$http.get(`goods/${id}`)
            if (res.meta.status !== 200) {
                return this.$message.error('查询商品失败')
            }
            this.editData = res.data
            this.editDialogVisible = true
        },
        //监听修改商品参数对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        //修改商品信息并提交
        // editGoodsInfo() {
        //     this.$refs.editFormRef.validate(async valid => {
        //         if(!valid) return
        //         //发起修改商品信息的请求
        //         const {data: res} = await this.$http.put('goods/' + this.editData.goods_id, 
        //         {
        //             goods_name: this.editData.goods_name, 
        //             goods_price: this.editData.goods_price,
        //             goods_number: this.editData.goods_number,
        //             goods_weight: this.editData.goods_weight,
        //             goods_introduce: this.editData.goods_introduce,
        //             pics: this.editData.pics,
        //             attrs: this.editData.attrs
        //         })
        //         if (res.meta.status !== 200) {
        //             return this.$message.error('更新商品信息失败')
        //         }
        //         //1.关闭对话框
        //         this.editDialogVisible = false
        //         //2.刷新数据列表
        //         this.getGoodsList()
        //         //3.提示修改成功
        //         this.$message.success('更新商品信息成功')
        //     })
        // },
    },
    mounted() {
        this.getGoodsList()
    },
}
</script>

<style lang="less" scoped>
    .el-table {
        margin-top: 15px;
        font-size: 10px;
    }
</style>
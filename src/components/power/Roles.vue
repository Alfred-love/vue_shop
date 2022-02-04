<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域-->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row class="addRole">
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                    {{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                    {{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
            <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.id)"
                >
                编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeroleById(scope.row.id, scope.row.roleName)"
                >
                删除</el-button>
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="showSetRightDialog(scope.row)"
                >
                分配权限</el-button>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%"
        @close = "addDialogClosed"
    >
        <!-- 内容主体区域 -->
        <el-form
            :model="addForm"
            label-width="100px"
            :rules="addFormRules"
            ref="addFormRef"
        >
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
    >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 show-checkbox选中效果，node-key：标签框选中之后的值，
      id是每一个rightsList属性子对象及其后代对象里面的属性
      default-checked-keys：属性值为一个数组，来确定默认选中的标签节点框,，注意：数组里面放的是标签框对应的Id值 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [], // 所有角色列表数据
      addForm: { roleName: '', roleDesc: '' }, // 添加的角色数据
      addDialogVisible: false, // 控制添加角色对话框的显示与隐藏
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名称的长度在2~10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '角色描述的长度在2~10个字符之间', trigger: 'blur' }
        ]
      }, // 添加表单的验证规则对象
      editDialogVisible: false, // 控制修改角色对话框的显示与隐藏
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名称的长度在2~10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '角色描述的长度在2~10个字符之间', trigger: 'blur' }
        ]
      }, // 修改表单的验证规则对象
      editForm: {}, // 查询到的用户信息对象
      setRightDialogVisible: false, // 控制分配权限对话框的显示与隐藏
      rightsList: [], // 所有权限的数据
      treeProps: {
        label: 'authName',
        children: 'children'
      }, // 树形控件的属性绑定对象, authName（标签）children（子元素）都是rightsList数据的属性
      defkeys: [], // 默认选中的节点Id值数组
      roleId: '' // 当前即将分配权限的角色id
    }
  },
  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    // 添加角色数据
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 监听添加角色对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 根据Id展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色数据
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('更新用户信息成功')
      })
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 根据Id删除用户信息
    async removeroleById(id, roleName) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(`此操作将永久删除名为${roleName}的角色, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认删除，则 confirmResult 返回值为字符串 confirm
      // 如果用户取消了删除，则 confirmResult 返回值为字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('删除角色成功!')
      this.getRolesList()
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      this.$message.success('删除权限成功')
      // this.getRolesList()
      // 只修改传进来的角色权限 children属性里面就包含权限 这里就是浅拷贝，不懂去c站我的收藏
      role.children = res.data
    },
    // 展示分配权限的对话框 role拿到一行数据，也就是主管角色的所有数据，详见页面
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
      console.log(role)
      // 递归获取三级节点的Id
      this.getLeafkeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafkeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafkeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defkeys = []
    },
    // 监听分配权限对话框的确定关闭事件
    // getCheckedKeys函数和getHalfCheckedKeys函数是获取树形控件选中和半选中标签的id所组成的数组，详见官网。
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const rids = keys.join()
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
  // 数据代理后，请求获取角色列表数据
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
  .el-table {
      margin-top: 15px;
      font-size: 12px;
  }
  .el-tag{
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>

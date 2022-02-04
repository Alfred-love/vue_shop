<template>
    <el-container class="home-container">
        <!-- 页面头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <!-- 侧边栏菜单区域 -->
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409eff"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    :default-active="activePath"
                >
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 index去往的路由地址 -->
                        <el-menu-item
                            :index="'/' + subItem.path"
                            v-for="subItem in item.children"
                            :key="subItem.id"
                            @click="saveNavState('/' + subItem.path)"
                        >
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符，home页面所有的子组件都会出现在这里 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [], // 左侧菜单数据
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      }, // 一级菜单图标
      isCollapse: false, // 是否折叠
      activePath: '' // 被激活的链接地址
    }
  },
  methods: {
    // 退出功能
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单功能
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status === 200) {
        this.menuList = res.data
      } else {
        this.$message({
          msg: res.meta.msg,
          type: 'error'
        })
      }
    },
    // 折叠菜单功能
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 二级菜单激活高亮功能
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    // 解决刷新时二级菜单高亮效果消失
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }
    .el-header {
        background-color: #373D41;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        font-size: 20px;
        div {
            display: flex;
            align-items: center;
            span {
                margin-left: 15px;
            }
        }
    }
    .el-aside {
        background-color: #333744;
        .toggle-button {
            background-color: #4a5064;
            font-size: 10rpx;
            line-height: 24px;
            color: #fff;
            text-align: center;
            letter-spacing: 0.2em;
            cursor: pointer;
        }
        .el-menu {
            border-right: none;
            .iconfont {
                margin-right: 10px;
            }
        }
    }
    .el-main {
        background-color: #eaedf1;
    }
</style>

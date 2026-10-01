<template>
  <aside class="side-menu" :class="{ 'is-collapsed': collapsed }">
    <div class="brand">
      <div class="brand-logo">
        <el-icon :size="20"><Cpu /></el-icon>
      </div>
      <transition name="fade-slide">
        <div v-show="!collapsed" class="brand-text">
          <div class="brand-title">工业 miniApp</div>
          <div class="brand-sub">制造数字化管理</div>
        </div>
      </transition>
    </div>

    <el-scrollbar class="menu-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="#a9b8cd"
        active-text-color="#ffffff"
        router
        unique-opened
      >
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <div class="side-footer">
      <transition name="fade-slide">
        <div v-show="!collapsed" class="footer-text">
          <div>基于华为 iDME · xDM-F</div>
          <div class="footer-sub">数据建模引擎驱动</div>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ collapsed: boolean }>()

const route = useRoute()

const menus = [
  { path: '/dashboard', title: '首页概览', icon: 'Odometer' },
  { path: '/equipment', title: '设备管理', icon: 'Cpu' },
  { path: '/part', title: '物料管理', icon: 'Box' },
  { path: '/procedure', title: '工序管理', icon: 'SetUp' },
  { path: '/plan', title: '工艺路线', icon: 'Guide' },
  { path: '/model-graph', title: '数据模型图谱', icon: 'Share' },
  { path: '/api-list', title: 'xDM-F 接口清单', icon: 'Document' }
]

const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  width: $sidebar-width;
  display: flex;
  flex-direction: column;
  background: $sidebar-bg;
  transition: width 0.22s ease;
  overflow: hidden;

  &.is-collapsed {
    width: $sidebar-width-collapsed;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: $header-height;
  padding: 0 16px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.brand-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.brand-text {
  overflow: hidden;
  white-space: nowrap;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}

.brand-sub {
  font-size: 11px;
  color: #7c8ba1;
}

.menu-scroll {
  flex: 1;
  padding: 10px 0;

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item) {
    height: 44px;
    line-height: 44px;
    margin: 2px 8px;
    border-radius: 8px;
    font-size: 13px;

    &:hover {
      background: $sidebar-bg-hover !important;
      color: #fff !important;
    }

    &.is-active {
      background: linear-gradient(90deg, rgba(37, 99, 235, 0.9), rgba(56, 189, 248, 0.65)) !important;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.32);
    }
  }
}

.side-footer {
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 11px;
  color: #5d6b80;
  line-height: 1.6;
  white-space: nowrap;
}

.footer-sub {
  color: #46536a;
}
</style>

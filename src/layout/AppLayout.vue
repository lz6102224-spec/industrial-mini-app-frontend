<template>
  <div class="app-layout">
    <SideMenu :collapsed="appStore.sidebarCollapsed" />
    <div class="app-main" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
      <NavBar />
      <div class="app-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <keep-alive :max="6">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideMenu from './SideMenu.vue'
import NavBar from './NavBar.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: $sidebar-width;
  transition: margin-left 0.22s ease;
  background: $page-bg;

  &.is-collapsed {
    margin-left: $sidebar-width-collapsed;
  }
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

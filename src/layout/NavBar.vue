<template>
  <header class="nav-bar">
    <div class="nav-left">
      <el-icon class="collapse-btn" :size="18" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="nav-right">
      <el-tooltip :content="tooltipContent" placement="bottom">
        <span class="datasource-badge" :class="appStore.useMock ? 'is-mock' : 'is-real'">
          <el-icon><component :is="appStore.useMock ? 'MagicStick' : 'Connection'" /></el-icon>
          {{ appStore.dataSourceLabel }}
        </span>
      </el-tooltip>

      <el-button v-if="appStore.useMock" text size="small" @click="handleReset">
        <el-icon><RefreshLeft /></el-icon>
        <span style="margin-left: 4px">重置演示数据</span>
      </el-button>

      <el-button text size="small" @click="tokenDialogVisible = true">
        <el-icon><Key /></el-icon>
        <span style="margin-left: 4px">连接配置</span>
      </el-button>
    </div>

    <el-dialog v-model="tokenDialogVisible" title="xDM-F 运行态连接配置" width="560px">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="模型建好后下载运行态 SDK 部署到本地，业务层调用本地运行态 API。以下信息来自 .env 配置。"
        style="margin-bottom: 16px"
      />
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="当前数据源">
          <span class="datasource-badge" :class="appStore.useMock ? 'is-mock' : 'is-real'">
            {{ appStore.dataSourceLabel }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="基础路径">
          <span class="text-mono">{{ appStore.baseUrl }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="应用英文名">{{ appStore.appId }}</el-descriptions-item>
        <el-descriptions-item label="环境 ID">{{ appStore.envId }}</el-descriptions-item>
      </el-descriptions>

      <el-form label-width="110px" style="margin-top: 16px">
        <el-form-item label="X-Auth-Token">
          <el-input
            v-model="tokenInput"
            type="textarea"
            :rows="3"
            placeholder="粘贴 iDME 获取的 X-Auth-Token（有效期 24 小时）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="tokenDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveToken">保存 Token</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { XDMF_CONFIG } from '@/api/xdmf/config'

const appStore = useAppStore()
const route = useRoute()

const currentTitle = computed(() => (route.meta?.title as string) || '')
const tooltipContent = computed(() =>
  appStore.useMock
    ? '当前使用内置 Mock 数据，接口形态与 xDM-F 完全一致。参赛演示请切换为真实运行态。'
    : `已连接 xDM-F 运行态：${appStore.baseUrl}`
)

const tokenDialogVisible = ref(false)
const tokenInput = ref(XDMF_CONFIG.token)

function saveToken() {
  appStore.updateToken(tokenInput.value.trim())
  ElMessage.success('Token 已保存到本地')
  tokenDialogVisible.value = false
}

function handleReset() {
  ElMessageBox.confirm('将清空所有本地演示数据并恢复到初始种子数据，确定继续吗？', '重置演示数据', {
    type: 'warning',
    confirmButtonText: '确定重置',
    cancelButtonText: '取消'
  })
    .then(() => {
      appStore.resetDemoData()
      ElMessage.success('演示数据已重置')
      setTimeout(() => window.location.reload(), 400)
    })
    .catch(() => undefined)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.nav-bar {
  height: $header-height;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid $border-color;
  box-shadow: 0 1px 3px rgba(16, 28, 46, 0.04);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  cursor: pointer;
  color: $text-regular;
  transition: color 0.15s;

  &:hover {
    color: $color-primary;
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

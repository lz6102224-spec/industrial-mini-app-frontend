import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { DATA_SOURCE_LABEL, XDMF_CONFIG, XDMF_BASE_URL, setToken } from '@/api/xdmf/config'
import { resetMockDb } from '@/mock'

/** 应用级状态：侧边栏、数据源信息 */
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const useMock = ref(XDMF_CONFIG.useMock)

  const dataSourceLabel = computed(() => DATA_SOURCE_LABEL)
  const baseUrl = computed(() => XDMF_BASE_URL)
  const appId = computed(() => XDMF_CONFIG.appId)
  const envId = computed(() => XDMF_CONFIG.envId)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /** 重置演示数据（仅 Mock 模式有效） */
  function resetDemoData() {
    resetMockDb()
  }

  /** 运行时更新 Token（联调时使用） */
  function updateToken(token: string) {
    setToken(token)
  }

  return {
    sidebarCollapsed,
    useMock,
    dataSourceLabel,
    baseUrl,
    appId,
    envId,
    toggleSidebar,
    resetDemoData,
    updateToken
  }
})

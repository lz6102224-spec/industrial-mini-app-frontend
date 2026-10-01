<template>
  <div class="search-bar">
    <el-form :inline="true" :model="model" @submit.prevent>
      <slot />
      <el-form-item class="search-actions">
        <el-button type="primary" :loading="loading" @click="emit('search')">
          <el-icon><Search /></el-icon>
          <span style="margin-left: 4px">查询</span>
        </el-button>
        <el-button @click="emit('reset')">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 4px">重置</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    model?: Record<string, unknown>
    loading?: boolean
  }>(),
  { model: () => ({}), loading: false }
)

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()
</script>

<style scoped lang="scss">
.search-bar {
  :deep(.el-form-item) {
    margin-bottom: 12px;
    margin-right: 12px;
  }

  :deep(.el-form-item__label) {
    font-size: 12.5px;
    color: #64748b;
  }
}
</style>

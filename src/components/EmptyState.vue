<template>
  <div class="empty-state" :style="{ padding: compact ? '16px 0' : '44px 0' }">
    <el-icon :size="compact ? 26 : 40" class="empty-icon"><Files /></el-icon>
    <p class="empty-text">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    description?: string
    compact?: boolean
  }>(),
  {
    description: '暂无数据',
    compact: false
  }
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: $text-secondary;
}

.empty-icon {
  color: #cbd5e1;
}

.empty-text {
  margin: 0;
  font-size: 13px;
}
</style>

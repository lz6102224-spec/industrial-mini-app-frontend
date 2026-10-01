<template>
  <div class="pro-table">
    <el-table
      v-loading="loading"
      :data="data"
      :row-key="rowKey"
      stripe
      border
      :height="height"
      :max-height="maxHeight"
      highlight-current-row
      v-bind="$attrs"
    >
      <slot />
      <template #empty>
        <EmptyState :description="emptyText" />
      </template>
    </el-table>

    <div v-if="showPagination" class="pro-table__pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[]
    loading?: boolean
    page?: number
    pageSize?: number
    total?: number
    rowKey?: string
    height?: string | number
    maxHeight?: string | number
    showPagination?: boolean
    emptyText?: string
    pageSizes?: number[]
  }>(),
  {
    loading: false,
    page: 1,
    pageSize: 10,
    total: 0,
    rowKey: 'id',
    showPagination: true,
    emptyText: '暂无数据，可点击「新增」创建',
    pageSizes: () => [10, 20, 50, 100]
  }
)

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change'): void
}>()

function handlePageChange(value: number) {
  emit('update:page', value)
  emit('change')
}

function handleSizeChange(value: number) {
  emit('update:pageSize', value)
  emit('update:page', 1)
  emit('change')
}
</script>

<style scoped lang="scss">
.pro-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>

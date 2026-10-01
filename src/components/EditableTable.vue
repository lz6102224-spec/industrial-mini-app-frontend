<template>
  <div class="editable-table">
    <div class="editable-table__bar">
      <span class="editable-table__hint">{{ hint }}</span>
      <el-button type="primary" link size="small" @click="addRow">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 3px">添加一行</span>
      </el-button>
    </div>
    <el-table :data="rows" border size="small" :row-key="rowKey">
      <el-table-column type="index" label="#" width="48" align="center" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
      >
        <template #default="{ row }">
          <el-select
            v-if="col.type === 'select'"
            v-model="row[col.prop]"
            size="small"
            placeholder="请选择"
            style="width: 100%"
            @change="emitChange"
          >
            <el-option v-for="opt in col.options || []" :key="String(opt)" :label="String(opt)" :value="opt" />
          </el-select>
          <el-input-number
            v-else-if="col.type === 'number'"
            v-model="row[col.prop]"
            size="small"
            :min="0"
            controls-position="right"
            style="width: 100%"
            @change="emitChange"
          />
          <el-input
            v-else
            v-model="row[col.prop]"
            size="small"
            :placeholder="col.placeholder || `请输入${col.label}`"
            @input="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center" fixed="right">
        <template #default="{ $index }">
          <el-button type="danger" link size="small" @click="removeRow($index)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <EmptyState compact description="暂无数据，点击「添加一行」录入" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import type { EditableColumn } from './types'

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, unknown>[]
    columns: EditableColumn[]
    template?: Record<string, unknown>
    hint?: string
    rowKey?: string
  }>(),
  {
    template: () => ({}),
    hint: '',
    rowKey: 'key'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>[]): void
}>()

const rows = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

function addRow() {
  const row: Record<string, unknown> = { key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
  props.columns.forEach((col) => {
    row[col.prop] = props.template[col.prop] ?? (col.type === 'number' ? 0 : '')
  })
  rows.value = [...rows.value, row]
}

function removeRow(index: number) {
  const next = [...rows.value]
  next.splice(index, 1)
  rows.value = next
}

function emitChange() {
  rows.value = [...rows.value]
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.editable-table__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.editable-table__hint {
  font-size: 12px;
  color: $text-secondary;
}
</style>

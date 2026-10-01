<template>
  <div class="procedure-picker">
    <div class="procedure-picker__bar">
      <el-select
        v-model="pendingId"
        filterable
        clearable
        placeholder="选择要加入工艺路线的工序"
        style="width: 320px"
      >
        <el-option
          v-for="item in availableProcedures"
          :key="item.id"
          :label="`${item.procedureCode} · ${item.procedureName}`"
          :value="item.id"
        />
      </el-select>
      <el-button type="primary" :disabled="!pendingId" @click="addProcedure">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 4px">加入工艺路线</span>
      </el-button>
      <el-button :disabled="!modelValue.length" @click="handleClear">清空</el-button>
      <span class="procedure-picker__tip">
        已选 {{ modelValue.length }} 道工序，可通过上移 / 下移调整执行顺序
      </span>
    </div>

    <el-table :data="modelValue" border size="small" row-key="procedureId">
      <el-table-column label="执行顺序" width="96" align="center">
        <template #default="{ $index }">
          <el-tag size="small" type="primary" effect="plain">{{ $index + 1 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="procedureCode" label="工序编号" width="120">
        <template #default="{ row }"><span class="text-mono">{{ row.procedureCode }}</span></template>
      </el-table-column>
      <el-table-column prop="procedureName" label="工序名称" width="130" />
      <el-table-column prop="productionSteps" label="生产步骤" min-width="240" show-overflow-tooltip />
      <el-table-column prop="productionInspectionEquipment" label="生产和检测设备" min-width="220" show-overflow-tooltip />
      <el-table-column prop="operator" label="操作人员" width="94" />
      <el-table-column label="操作" width="170" align="center" fixed="right">
        <template #default="{ $index }">
          <el-button link type="primary" size="small" :disabled="$index === 0" @click="moveUp($index)">上移</el-button>
          <el-button link type="primary" size="small" :disabled="$index === modelValue.length - 1" @click="moveDown($index)">下移</el-button>
          <el-button link type="danger" size="small" @click="removeAt($index)">移除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <EmptyState compact description="尚未关联工序，请从上方选择并加入" />
      </template>
    </el-table>

    <!-- 工艺流程预览 -->
    <div v-if="modelValue.length" class="procedure-picker__preview">
      <span class="preview-label">流程预览：</span>
      <template v-for="(item, index) in modelValue" :key="item.procedureId">
        <span class="preview-node">{{ item.procedureName }}</span>
        <el-icon v-if="index < modelValue.length - 1" class="preview-arrow"><DArrowRight /></el-icon>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import type { PlanProcedureItem } from '@/types/plan'
import type { WorkingProcedure } from '@/types/procedure'

const props = defineProps<{
  modelValue: PlanProcedureItem[]
  procedures: WorkingProcedure[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PlanProcedureItem[]): void
}>()

const pendingId = ref('')

const availableProcedures = computed(() =>
  props.procedures.filter((item) => !props.modelValue.some((sel) => sel.procedureId === item.id))
)

function update(list: PlanProcedureItem[]) {
  emit('update:modelValue', list.map((item, index) => ({ ...item, sequenceOrder: index + 1 })))
}

function addProcedure() {
  const target = props.procedures.find((item) => item.id === pendingId.value)
  if (!target) return
  update([
    ...props.modelValue,
    {
      procedureId: target.id,
      procedureCode: target.procedureCode,
      procedureName: target.procedureName,
      productionSteps: target.productionSteps,
      productionInspectionEquipment: target.productionInspectionEquipment,
      operator: target.operator,
      sequenceOrder: props.modelValue.length + 1
    }
  ])
  pendingId.value = ''
}

function removeAt(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  update(next)
}

function moveUp(index: number) {
  if (index === 0) return
  const next = [...props.modelValue]
  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  update(next)
}

function moveDown(index: number) {
  if (index === props.modelValue.length - 1) return
  const next = [...props.modelValue]
  ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
  update(next)
}

function handleClear() {
  update([])
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.procedure-picker__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.procedure-picker__tip {
  font-size: 12px;
  color: $text-secondary;
}

.procedure-picker__preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding: 12px;
  border-radius: $radius-sm;
  background: #f8fafc;
  border: 1px dashed $border-color;
}

.preview-label {
  font-size: 12px;
  color: $text-secondary;
}

.preview-node {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: $color-primary;
  background: #e9effd;
}

.preview-arrow {
  color: #cbd5e1;
}
</style>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#8b5cf6"><SetUp /></el-icon>
          工序管理
        </h2>
        <p class="page-desc">
          依据行星减速器核心零件生产工艺流程（毛坯制造 → 机械加工〈粗加工〉 → 轴类零件加工〈精加工〉 → 检测 → 入库）配置工序，
          维护工序编号、生产步骤、生产和检测设备、操作人员及起止时间。
        </p>
      </div>
      <div class="header-actions">
        <el-button type="success" plain :loading="initializing" @click="handleInitProcedures">
          <el-icon><MagicStick /></el-icon>
          <span style="margin-left: 4px">一键初始化 5 道工序</span>
        </el-button>
        <el-button type="primary" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 4px">新增工序</span>
        </el-button>
      </div>
    </div>

    <!-- 工艺流程条 -->
    <div class="card-panel flow-panel">
      <div class="panel-title">工艺流程</div>
      <div class="flow">
        <template v-for="(item, index) in list" :key="item.id">
          <div class="flow-node">
            <div class="flow-node__index">{{ item.sequence ?? index + 1 }}</div>
            <div class="flow-node__name">{{ item.procedureName }}</div>
            <div class="flow-node__code">{{ item.procedureCode }}</div>
          </div>
          <el-icon v-if="index < list.length - 1" class="flow-arrow"><DArrowRight /></el-icon>
        </template>
        <EmptyState v-if="!list.length && !loading" description="暂无工序，可点击「一键初始化 5 道工序」快速创建" />
      </div>
    </div>

    <div class="card-panel">
      <SearchBar :model="query" :loading="loading" @search="search" @reset="handleReset">
        <el-form-item label="工序编号">
          <el-input v-model="query.procedureCode" placeholder="支持模糊查询" clearable style="width: 160px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="工序名称">
          <el-input v-model="query.procedureName" placeholder="支持模糊查询" clearable style="width: 160px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input v-model="query.operator" placeholder="支持模糊查询" clearable style="width: 140px" @keyup.enter="search" />
        </el-form-item>
      </SearchBar>

      <div class="toolbar">
        <div class="toolbar-left">
          <el-button :disabled="!selection.length" type="danger" plain @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            <span style="margin-left: 4px">批量删除{{ selection.length ? ` (${selection.length})` : '' }}</span>
          </el-button>
          <el-button @click="load">
            <el-icon><Refresh /></el-icon>
            <span style="margin-left: 4px">刷新</span>
          </el-button>
        </div>
        <span class="text-muted">共 {{ total }} 道工序</span>
      </div>

      <ProTable
        v-model:page="page"
        v-model:page-size="pageSize"
        :data="list"
        :loading="loading"
        :total="total"
        @change="load"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" />
        <el-table-column prop="sequence" label="顺序" width="64" align="center" />
        <el-table-column prop="procedureCode" label="工序编号" width="110">
          <template #default="{ row }"><span class="text-mono">{{ row.procedureCode }}</span></template>
        </el-table-column>
        <el-table-column prop="procedureName" label="工序名称" width="120" />
        <el-table-column prop="productionSteps" label="生产步骤" min-width="280" show-overflow-tooltip />
        <el-table-column prop="productionInspectionEquipment" label="生产和检测设备" min-width="240" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人员" width="94" />
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <ProcedureForm v-model="formVisible" :record="current" :next-sequence="nextSequence" @saved="load" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import ProTable from '@/components/ProTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProcedureForm from './components/ProcedureForm.vue'
import { useTable } from '@/composables/useTable'
import { useCrud } from '@/composables/useCrud'
import {
  batchCreateProcedures,
  batchDeleteProcedures,
  deleteProcedure,
  listProcedures,
  type ProcedureQuery
} from '@/api/xdmf/modules/procedure'
import { PROCEDURE_TEMPLATES } from '@/constants/dict'
import { formatDateTime } from '@/utils/format'
import type { WorkingProcedure } from '@/types/procedure'

const { loading, list, page, pageSize, total, query, load, search, reset, refreshAfterRemove } = useTable<WorkingProcedure>({
  fetcher: (q, size, current) => listProcedures(q as ProcedureQuery, size, current),
  initialQuery: { procedureCode: '', procedureName: '', operator: '' }
})

const { confirmRemove } = useCrud(load)

const selection = ref<WorkingProcedure[]>([])
const formVisible = ref(false)
const current = ref<WorkingProcedure | null>(null)
const initializing = ref(false)

const nextSequence = computed(() => {
  const sequences = list.value.map((item) => Number(item.sequence ?? 0))
  return sequences.length ? Math.max(...sequences) + 1 : 1
})

function handleSelectionChange(rows: WorkingProcedure[]) {
  selection.value = rows
}

function openCreate() {
  current.value = null
  formVisible.value = true
}

function openEdit(row: WorkingProcedure) {
  current.value = { ...row }
  formVisible.value = true
}

function handleReset() {
  reset({ procedureCode: '', procedureName: '', operator: '' })
}

async function handleDelete(row: WorkingProcedure) {
  await confirmRemove(row.procedureName, () => deleteProcedure(row.id), () => refreshAfterRemove(1))
}

async function handleBatchDelete() {
  const ids = selection.value.map((item) => item.id)
  if (!ids.length) return
  await confirmRemove(`选中的 ${ids.length} 道工序`, () => batchDeleteProcedures(ids), () => {
    selection.value = []
  })
}

/** 一键初始化赛题要求的 5 道工序 */
async function handleInitProcedures() {
  const existingNames = new Set(list.value.map((item) => item.procedureName))
  const pending = PROCEDURE_TEMPLATES.filter((item) => !existingNames.has(item.procedureName))

  if (!pending.length) {
    ElMessage.info('5 道工序已全部存在，无需重复初始化')
    return
  }

  try {
    await ElMessageBox.confirm(
      `将新增 ${pending.length} 道工序：${pending.map((item) => item.procedureName).join('、')}。是否继续？`,
      '一键初始化工序',
      { type: 'info', confirmButtonText: '确认创建', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  initializing.value = true
  try {
    const today = new Date().toISOString().slice(0, 10)
    const payload = pending.map((item, index) => ({
      ...item,
      startTime: `${today}T08:00:00`,
      endTime: `${today}T17:00:00`,
      sequence: item.sequence ?? index + 1
    }))
    const result = await batchCreateProcedures(payload)
    if (result.ok) {
      ElMessage.success(`已成功创建 ${result.succeeded} 道工序`)
    } else {
      ElMessage.warning(`创建完成：成功 ${result.succeeded} / ${result.total} 道`)
    }
    await load()
  } finally {
    initializing.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.flow-panel {
  margin-bottom: 16px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16px;
}

.flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.flow-node {
  flex: 1;
  min-width: 100px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: linear-gradient(180deg, #fafbff, #f4f7fd);
}

.flow-node__index {
  width: 22px;
  height: 22px;
  margin: 0 auto 6px;
  border-radius: 50%;
  background: #8b5cf6;
  color: #fff;
  font-size: 12px;
  line-height: 22px;
}

.flow-node__name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.flow-node__code {
  font-size: 11px;
  color: $text-secondary;
  margin-top: 2px;
}

.flow-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}
</style>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#16a34a"><Guide /></el-icon>
          工艺路线管理
        </h2>
        <p class="page-desc">
          按工艺流程（毛坯制造 → 粗加工 → 精加工 → 检测 → 入库）配置工艺路线，维护工艺编号、名称、所属产品、版本、工艺描述，
          并关联工序、编排执行顺序。
        </p>
      </div>
      <div class="header-actions">
        <el-button type="success" plain :loading="initializing" @click="handleInitPlan">
          <el-icon><MagicStick /></el-icon>
          <span style="margin-left: 4px">一键创建「中心轮零件加工」</span>
        </el-button>
        <el-button type="primary" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 4px">新增工艺路线</span>
        </el-button>
      </div>
    </div>

    <div class="card-panel">
      <SearchBar :model="query" :loading="loading" @search="search" @reset="handleReset">
        <el-form-item label="工艺编号">
          <el-input v-model="query.planCode" placeholder="支持模糊查询" clearable style="width: 160px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="工艺名称">
          <el-input v-model="query.planName" placeholder="支持模糊查询" clearable style="width: 170px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="所属产品">
          <el-input v-model="query.productName" placeholder="支持模糊查询" clearable style="width: 180px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="query.version" placeholder="如 1.0" clearable style="width: 110px" @keyup.enter="search" />
        </el-form-item>
      </SearchBar>

      <div class="toolbar">
        <el-button @click="load">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 4px">刷新</span>
        </el-button>
        <span class="text-muted">共 {{ total }} 条工艺路线</span>
      </div>

      <ProTable
        v-model:page="page"
        v-model:page-size="pageSize"
        :data="list"
        :loading="loading"
        :total="total"
        @change="load"
      >
        <el-table-column type="index" label="#" width="52" align="center" />
        <el-table-column prop="planCode" label="工艺编号" width="130">
          <template #default="{ row }"><span class="text-mono">{{ row.planCode }}</span></template>
        </el-table-column>
        <el-table-column prop="planName" label="工艺名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productName" label="所属产品" min-width="180" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain">v{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人员" width="94" />
        <el-table-column label="操作时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.operationTime) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="工艺描述" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已发布' ? 'success' : 'info'" effect="plain">
              {{ row.status || '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <PlanForm
      v-model="formVisible"
      :record="current"
      :all-procedures="procedures"
      :initial-procedures="currentProcedures"
      @saved="load"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import ProTable from '@/components/ProTable.vue'
import PlanForm from './components/PlanForm.vue'
import { useTable } from '@/composables/useTable'
import { useCrud } from '@/composables/useCrud'
import {
  createPlan,
  deletePlan,
  listPlanProcedureRels,
  listPlans,
  savePlanProcedures
} from '@/api/xdmf/modules/plan'
import { listAllProcedures } from '@/api/xdmf/modules/procedure'
import { PLAN_TEMPLATE } from '@/constants/dict'
import { formatDateTime } from '@/utils/format'
import type { PlanProcedureItem, PlanQuery, WorkingPlan } from '@/types/plan'
import type { WorkingProcedure } from '@/types/procedure'

const router = useRouter()

const { loading, list, page, pageSize, total, query, load, search, reset, refreshAfterRemove } = useTable<WorkingPlan>({
  fetcher: (q, size, current) => listPlans(q as PlanQuery, size, current),
  initialQuery: { planCode: '', planName: '', productName: '', version: '' }
})

const { confirmRemove } = useCrud(load)

const procedures = ref<WorkingProcedure[]>([])
const formVisible = ref(false)
const current = ref<WorkingPlan | null>(null)
const currentProcedures = ref<PlanProcedureItem[]>([])
const initializing = ref(false)

async function loadProcedures() {
  const result = await listAllProcedures()
  procedures.value = result.data || []
}

function handleReset() {
  reset({ planCode: '', planName: '', productName: '', version: '' })
}

function openCreate() {
  current.value = null
  currentProcedures.value = []
  formVisible.value = true
}

async function openEdit(row: WorkingPlan) {
  current.value = { ...row }
  const relResult = await listPlanProcedureRels(row.id)
  currentProcedures.value = (relResult.data || [])
    .slice()
    .sort((a, b) => Number(a.sequenceOrder) - Number(b.sequenceOrder))
    .map((rel) => {
      const proc = procedures.value.find((item) => item.id === rel.procedureId)
      return {
        relId: rel.id,
        procedureId: rel.procedureId,
        procedureCode: proc?.procedureCode || '',
        procedureName: proc?.procedureName || '未知工序',
        productionSteps: proc?.productionSteps,
        productionInspectionEquipment: proc?.productionInspectionEquipment,
        operator: proc?.operator,
        sequenceOrder: rel.sequenceOrder
      }
    })
  formVisible.value = true
}

function openDetail(row: WorkingPlan) {
  router.push(`/plan/${row.id}`)
}

async function handleDelete(row: WorkingPlan) {
  await confirmRemove(row.planName, () => deletePlan(row.id), () => refreshAfterRemove(1))
}

/** 一键创建赛题要求的「中心轮零件加工」工艺路线，并关联 5 道工序 */
async function handleInitPlan() {
  const existed = list.value.find((item) => item.planName === PLAN_TEMPLATE.planName)
  if (existed) {
    ElMessage.info(`工艺路线「${PLAN_TEMPLATE.planName}」已存在，请直接编辑`)
    return
  }
  if (!procedures.value.length) {
    ElMessage.warning('尚未配置工序，请先在「工序管理」中初始化工序')
    return
  }

  try {
    await ElMessageBox.confirm(
      `将创建工艺路线「${PLAN_TEMPLATE.planName}」v${PLAN_TEMPLATE.version}，并按流程顺序关联 ${procedures.value.length} 道工序。是否继续？`,
      '一键创建工艺路线',
      { type: 'info', confirmButtonText: '确认创建', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  initializing.value = true
  try {
    const result = await createPlan({ ...PLAN_TEMPLATE })
    if (!result.ok || !result.data) return

    const ordered = procedures.value
      .slice()
      .sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0))
    await savePlanProcedures(
      result.data.id,
      ordered.map((item) => item.id)
    )
    ElMessage.success(`工艺路线已创建并关联 ${ordered.length} 道工序`)
    await load()
  } finally {
    initializing.value = false
  }
}

onMounted(loadProcedures)
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
</style>

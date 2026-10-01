<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#16a34a"><Guide /></el-icon>
          工艺路线详情
        </h2>
        <p class="page-desc">查看工艺路线的工序编排、各工序关联的生产检测设备与物料。</p>
      </div>
      <el-button @click="router.back()">
        <el-icon><Back /></el-icon>
        <span style="margin-left: 4px">返回</span>
      </el-button>
    </div>

    <template v-if="plan">
      <div class="card-panel">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="工艺编号">
            <span class="text-mono">{{ plan.planCode }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="工艺名称">{{ plan.planName }}</el-descriptions-item>
          <el-descriptions-item label="版本">
            <el-tag size="small" type="success" effect="plain">v{{ plan.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所属产品">{{ plan.productName }}</el-descriptions-item>
          <el-descriptions-item label="操作人员">{{ plan.operator }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDateTime(plan.operationTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="small" :type="plan.status === '已发布' ? 'success' : 'info'" effect="plain">
              {{ plan.status || '草稿' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备使用情况" :span="2">{{ plan.equipmentUsage }}</el-descriptions-item>
          <el-descriptions-item label="工艺描述" :span="3">{{ plan.description }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="card-panel">
        <div class="panel-title">工序流程（{{ procedureItems.length }} 道工序）</div>
        <el-steps :active="procedureItems.length" align-center finish-status="success" class="plan-steps">
          <el-step
            v-for="item in procedureItems"
            :key="item.procedureId"
            :title="item.procedureName"
            :description="item.procedureCode"
          />
        </el-steps>

        <div v-if="!procedureItems.length" class="text-muted" style="text-align: center; padding: 20px">
          该工艺路线尚未关联工序
        </div>
      </div>

      <div class="card-panel">
        <div class="panel-title">工序明细与关联资源</div>
        <el-table :data="procedureItems" border size="small">
          <el-table-column label="顺序" width="64" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="primary" effect="plain">{{ row.sequenceOrder }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="procedureCode" label="工序编号" width="110">
            <template #default="{ row }"><span class="text-mono">{{ row.procedureCode }}</span></template>
          </el-table-column>
          <el-table-column prop="procedureName" label="工序名称" width="120" />
          <el-table-column prop="productionSteps" label="生产步骤" min-width="240" show-overflow-tooltip />
          <el-table-column label="关联设备" min-width="220">
            <template #default="{ row }">
              <template v-if="equipmentOf(row.procedureId).length">
                <el-tag
                  v-for="eq in equipmentOf(row.procedureId)"
                  :key="eq.id"
                  size="small"
                  effect="plain"
                  style="margin: 2px 4px 2px 0"
                >
                  {{ eq.equipmentName }}
                </el-tag>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="关联物料" min-width="180">
            <template #default="{ row }">
              <template v-if="materialOf(row.procedureId).length">
                <el-tag
                  v-for="mt in materialOf(row.procedureId)"
                  :key="mt.id"
                  size="small"
                  type="warning"
                  effect="plain"
                  style="margin: 2px 4px 2px 0"
                >
                  {{ mt.partName }}
                </el-tag>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <EmptyState v-else-if="!loading" description="未找到该工艺路线" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import { getPlan, listAllPlanProcedureRels } from '@/api/xdmf/modules/plan'
import {
  listAllProcedures,
  listProcedureEquipmentRels,
  listProcedureMaterialRels
} from '@/api/xdmf/modules/procedure'
import { listAllEquipments } from '@/api/xdmf/modules/equipment'
import { listAllParts } from '@/api/xdmf/modules/part'
import { formatDateTime } from '@/utils/format'
import type { PlanProcedureItem, WorkingPlan } from '@/types/plan'
import type { WorkingProcedure } from '@/types/procedure'
import type { Equipment } from '@/types/equipment'
import type { Part } from '@/types/part'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const plan = ref<WorkingPlan | null>(null)
const procedureItems = ref<PlanProcedureItem[]>([])
const procedures = ref<WorkingProcedure[]>([])
const equipments = ref<Equipment[]>([])
const parts = ref<Part[]>([])
const equipmentRels = ref<Array<{ procedureId: string; equipmentId: string }>>([])
const materialRels = ref<Array<{ procedureId: string; materialId: string }>>([])

const planId = computed(() => String(route.params.id || ''))

function equipmentOf(procedureId: string) {
  const ids = equipmentRels.value.filter((rel) => rel.procedureId === procedureId).map((rel) => rel.equipmentId)
  return equipments.value.filter((item) => ids.includes(item.id))
}

function materialOf(procedureId: string) {
  const ids = materialRels.value.filter((rel) => rel.procedureId === procedureId).map((rel) => rel.materialId)
  return parts.value.filter((item) => ids.includes(item.id))
}

async function load() {
  loading.value = true
  try {
    const [planResult, relResult, procResult, eqResult, matResult, eqListResult, partResult] = await Promise.all([
      getPlan(planId.value),
      listAllPlanProcedureRels(),
      listAllProcedures(),
      listProcedureEquipmentRels(),
      listProcedureMaterialRels(),
      listAllEquipments(),
      listAllParts()
    ])

    plan.value = planResult.ok ? planResult.data : null
    procedures.value = procResult.data || []
    equipments.value = eqListResult.data || []
    parts.value = partResult.data || []
    equipmentRels.value = (eqResult.data || []) as never
    materialRels.value = (matResult.data || []) as never

    procedureItems.value = (relResult.data || [])
      .filter((rel) => rel.planId === planId.value)
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
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 18px;
}

.plan-steps {
  padding: 10px 0 4px;

  :deep(.el-step__title) {
    font-size: 13px;
  }
}
</style>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#2563eb"><Odometer /></el-icon>
          制造数字化管理概览
        </h2>
        <p class="page-desc">
          精密行星减速器制造企业 · 设备 / 物料 / 工序 / 工艺 一体化管理平台，数据交互全部通过华为 iDME xDM-F 数据建模引擎 API 完成。
        </p>
      </div>
      <span class="datasource-badge" :class="appStore.useMock ? 'is-mock' : 'is-real'">
        <el-icon><component :is="appStore.useMock ? 'MagicStick' : 'Connection'" /></el-icon>
        {{ appStore.dataSourceLabel }}
      </span>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        :style="{ '--accent': card.color }"
        @click="router.push(card.path)"
      >
        <div class="stat-card__icon">
          <el-icon :size="22"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__label">{{ card.label }}</div>
          <div class="stat-card__value">
            <el-skeleton v-if="loading" animated style="width: 60px">
              <template #template><el-skeleton-item variant="h3" style="width: 60px; height: 26px" /></template>
            </el-skeleton>
            <template v-else>{{ card.value }}<span class="unit">{{ card.unit }}</span></template>
          </div>
        </div>
        <el-icon class="stat-card__arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <el-row :gutter="16">
      <!-- 工艺流程图 -->
      <el-col :xs="24" :lg="15">
        <div class="card-panel">
          <div class="panel-title">
            <span>中心轮零件加工工艺流程</span>
            <el-tag size="small" type="success" effect="plain">工艺路线 v1.0</el-tag>
          </div>
          <div class="flow">
            <template v-for="(step, index) in flowSteps" :key="step.name">
              <div class="flow-node" :class="{ 'is-active': activeStep === index }" @click="activeStep = index">
                <div class="flow-node__index">{{ index + 1 }}</div>
                <div class="flow-node__name">{{ step.name }}</div>
                <div class="flow-node__code">{{ step.code }}</div>
              </div>
              <el-icon v-if="index < flowSteps.length - 1" class="flow-arrow"><DArrowRight /></el-icon>
            </template>
          </div>
          <el-descriptions v-if="currentStep" :column="1" border size="small" style="margin-top: 16px">
            <el-descriptions-item label="工序名称">{{ currentStep.name }}</el-descriptions-item>
            <el-descriptions-item label="生产步骤">{{ currentStep.steps }}</el-descriptions-item>
            <el-descriptions-item label="生产与检测设备">{{ currentStep.equipment }}</el-descriptions-item>
            <el-descriptions-item label="操作人员">{{ currentStep.operator }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>

      <!-- 快捷入口 -->
      <el-col :xs="24" :lg="9">
        <div class="card-panel">
          <div class="panel-title"><span>快捷操作</span></div>
          <div class="quick-list">
            <div v-for="item in quickActions" :key="item.path" class="quick-item" @click="router.push(item.path)">
              <div class="quick-item__icon" :style="{ background: item.bg, color: item.color }">
                <el-icon :size="17"><component :is="item.icon" /></el-icon>
              </div>
              <div class="quick-item__text">
                <div class="quick-item__title">{{ item.title }}</div>
                <div class="quick-item__desc">{{ item.desc }}</div>
              </div>
              <el-icon class="quick-item__arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card-panel">
      <div class="panel-title">
        <span>设备分布</span>
        <el-button text size="small" @click="router.push('/equipment')">查看全部</el-button>
      </div>
      <el-table :data="equipmentPreview" size="small" border stripe>
        <el-table-column prop="equipmentCode" label="设备编码" width="130" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="110" />
        <el-table-column prop="model" label="规格型号" width="150" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '在用' ? 'success' : 'info'" effect="plain">
              {{ row.status || '在用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { countEquipments, listEquipments } from '@/api/xdmf/modules/equipment'
import { countParts } from '@/api/xdmf/modules/part'
import { countProcedures } from '@/api/xdmf/modules/procedure'
import { countPlans } from '@/api/xdmf/modules/plan'
import { PROCEDURE_TEMPLATES } from '@/constants/dict'
import type { Equipment } from '@/types/equipment'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const counts = ref({ equipment: 0, part: 0, procedure: 0, plan: 0 })
const equipmentPreview = ref<Equipment[]>([])

const statCards = computed(() => [
  { key: 'equipment', label: '设备总数', value: counts.value.equipment, unit: ' 台', icon: 'Cpu', color: '#2563eb', path: '/equipment' },
  { key: 'part', label: '物料总数', value: counts.value.part, unit: ' 项', icon: 'Box', color: '#0ea5e9', path: '/part' },
  { key: 'procedure', label: '工序总数', value: counts.value.procedure, unit: ' 道', icon: 'SetUp', color: '#8b5cf6', path: '/procedure' },
  { key: 'plan', label: '工艺路线', value: counts.value.plan, unit: ' 条', icon: 'Guide', color: '#16a34a', path: '/plan' }
])

const flowSteps = PROCEDURE_TEMPLATES.map((item) => ({
  name: item.procedureName,
  code: item.procedureCode,
  steps: item.productionSteps,
  equipment: item.productionInspectionEquipment,
  operator: item.operator
}))

const activeStep = ref(0)
const currentStep = computed(() => flowSteps[activeStep.value])

const quickActions = [
  { title: '新增设备档案', desc: '录入设备基础信息与扩展属性', icon: 'Plus', path: '/equipment', bg: '#e9effd', color: '#2563eb' },
  { title: '构建物料 BOM', desc: '维护 Part 之间的组成关系', icon: 'Share', path: '/part', bg: '#e0f2fe', color: '#0284c7' },
  { title: '配置工艺路线', desc: '编排工序顺序并建立关联', icon: 'Guide', path: '/plan', bg: '#f3e8ff', color: '#7c3aed' },
  { title: '查看模型图谱', desc: '设备/物料/工序/工艺关系图', icon: 'DataAnalysis', path: '/model-graph', bg: '#dcfce7', color: '#15803d' }
]

async function loadData() {
  loading.value = true
  try {
    const [eq, part, proc, plan, preview] = await Promise.all([
      countEquipments(),
      countParts(),
      countProcedures(),
      countPlans(),
      listEquipments({}, 5, 1)
    ])
    counts.value = {
      equipment: eq.data ?? 0,
      part: part.data ?? 0,
      procedure: proc.data ?? 0,
      plan: plan.data ?? 0
    }
    equipmentPreview.value = preview.data || []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-float;

    .stat-card__arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, white);
}

.stat-card__label {
  font-size: 12.5px;
  color: $text-secondary;
  margin-bottom: 4px;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 650;
  line-height: 1.1;
  color: $text-primary;

  .unit {
    font-size: 12px;
    font-weight: 400;
    color: $text-secondary;
    margin-left: 2px;
  }
}

.stat-card__arrow {
  position: absolute;
  right: 14px;
  bottom: 14px;
  color: var(--accent);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s ease;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16px;
}

.flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.flow-node {
  flex: 1;
  min-width: 96px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &.is-active {
    background: #e9effd;
    border-color: $color-primary;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  }
}

.flow-node__index {
  width: 22px;
  height: 22px;
  margin: 0 auto 6px;
  border-radius: 50%;
  background: $color-primary;
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

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: $radius-sm;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: #f8fafc;
    border-color: $border-color;

    .quick-item__arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.quick-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-item__text {
  flex: 1;
  min-width: 0;
}

.quick-item__title {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.quick-item__desc {
  font-size: 11.5px;
  color: $text-secondary;
  margin-top: 2px;
}

.quick-item__arrow {
  color: $text-secondary;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s ease;
}

.card-panel + .card-panel {
  margin-top: 16px;
}
</style>

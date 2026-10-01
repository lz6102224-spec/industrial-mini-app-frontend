<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#7c3aed"><Share /></el-icon>
          工业数据模型图谱
        </h2>
        <p class="page-desc">
          基于华为 iDME 数据建模引擎（xDM-F）设计的数据模型与关系实体图谱。四个核心数据实体（设备 / 物料 / 工序 / 工艺）
          通过参考对象与关系实体建立关联，支撑 miniApp 全部业务功能。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="exportGraphData">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 4px">导出图谱数据</span>
        </el-button>
        <el-button type="primary" @click="renderChart">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 4px">刷新图谱</span>
        </el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="17">
        <div class="card-panel graph-panel">
          <div ref="chartRef" class="graph-canvas" />
        </div>
      </el-col>

      <el-col :xs="24" :lg="7">
        <div class="card-panel">
          <div class="panel-title">数据实体</div>
          <div v-for="entity in entityList" :key="entity.name" class="entity-item">
            <span class="entity-dot" :style="{ background: entity.color }" />
            <div class="entity-body">
              <div class="entity-name">{{ entity.label }}</div>
              <div class="entity-meta">
                <span class="text-mono">{{ entity.name }}</span>
                <span class="entity-count">{{ entity.count }} 条</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-panel">
          <div class="panel-title">关系实体</div>
          <div v-for="rel in relationList" :key="rel.entity" class="relation-item">
            <div class="relation-name">
              <span class="relation-dot" />
              {{ rel.label }}
            </div>
            <div class="relation-entity text-mono">{{ rel.entity }}</div>
            <div class="relation-count">{{ rel.count }} 条关系数据</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { DATA_ENTITIES, RELATION_ENTITIES } from '@/api/xdmf/entities'
import { countEquipments } from '@/api/xdmf/modules/equipment'
import { countParts, listBomRelations, listCategories } from '@/api/xdmf/modules/part'
import { countProcedures, listProcedureEquipmentRels, listProcedureMaterialRels } from '@/api/xdmf/modules/procedure'
import { countPlans, listAllPlanProcedureRels } from '@/api/xdmf/modules/plan'
import { downloadTextFile } from '@/utils/format'

const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()

interface EntityItem {
  name: string
  label: string
  color: string
  count: number
  desc: string
}

interface RelationItem {
  entity: string
  label: string
  source: string
  target: string
  count: number
}

const entityList = ref<EntityItem[]>([
  { name: DATA_ENTITIES.Equipment, label: '设备 / Equipment', color: '#2563eb', count: 0, desc: '设备基础档案与扩展属性' },
  { name: DATA_ENTITIES.Part, label: '部件 / Part', color: '#0ea5e9', count: 0, desc: '物料主数据、分类与版本' },
  { name: DATA_ENTITIES.WorkingProcedure, label: '工序 / WorkingProcedure', color: '#8b5cf6', count: 0, desc: '工序定义与执行信息' },
  { name: DATA_ENTITIES.WorkingPlan, label: '工艺 / WorkingPlan', color: '#16a34a', count: 0, desc: '工艺路线编排' }
])

const relationList = ref<RelationItem[]>([
  { entity: RELATION_ENTITIES.PlanProcedureRel, label: '工艺 - 工序', source: DATA_ENTITIES.WorkingPlan, target: DATA_ENTITIES.WorkingProcedure, count: 0 },
  { entity: RELATION_ENTITIES.ProcedureEquipmentRel, label: '工序 - 设备', source: DATA_ENTITIES.WorkingProcedure, target: DATA_ENTITIES.Equipment, count: 0 },
  { entity: RELATION_ENTITIES.ProcedureMaterialRel, label: '工序 - 物料', source: DATA_ENTITIES.WorkingProcedure, target: DATA_ENTITIES.Part, count: 0 },
  { entity: RELATION_ENTITIES.PartBomRel, label: 'BOM 组成', source: DATA_ENTITIES.Part, target: DATA_ENTITIES.Part, count: 0 }
])

async function loadCounts() {
  const [eq, part, proc, plan, cat, planRel, eqRel, matRel, bom] = await Promise.all([
    countEquipments(),
    countParts(),
    countProcedures(),
    countPlans(),
    listCategories(),
    listAllPlanProcedureRels(),
    listProcedureEquipmentRels(),
    listProcedureMaterialRels(),
    listBomRelations()
  ])

  const countMap: Record<string, number> = {
    [DATA_ENTITIES.Equipment]: eq.data ?? 0,
    [DATA_ENTITIES.Part]: part.data ?? 0,
    [DATA_ENTITIES.WorkingProcedure]: proc.data ?? 0,
    [DATA_ENTITIES.WorkingPlan]: plan.data ?? 0
  }

  entityList.value.forEach((item) => {
    item.count = countMap[item.name] ?? 0
  })

  // 部件模型同时承载分类与版本，附加展示
  const categoryCount = cat.data?.length ?? 0

  const relCountMap: Record<string, number> = {
    [RELATION_ENTITIES.PlanProcedureRel]: planRel.data?.length ?? 0,
    [RELATION_ENTITIES.ProcedureEquipmentRel]: eqRel.data?.length ?? 0,
    [RELATION_ENTITIES.ProcedureMaterialRel]: matRel.data?.length ?? 0,
    [RELATION_ENTITIES.PartBomRel]: bom.data?.length ?? 0
  }
  relationList.value.forEach((item) => {
    item.count = relCountMap[item.entity] ?? 0
  })

  return categoryCount
}

function buildOption(): echarts.EChartsOption {
  const colorMap = new Map(entityList.value.map((item) => [item.name, item.color]))

  const nodes = entityList.value.map((item) => ({
    name: item.name,
    value: item.count,
    symbolSize: 58 + Math.min(item.count, 20) * 1.6,
    itemStyle: {
      color: item.color,
      shadowBlur: 18,
      shadowColor: `${item.color}55`,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: true,
      color: '#fff',
      fontSize: 11,
      fontWeight: 600 as const,
      formatter: `${item.label.split(' / ')[0]}\n${item.count}`
    },
    tooltip: { formatter: `${item.label}<br/>数据量：${item.count} 条<br/>${item.desc}` }
  }))

  // 关系边：同一实体自关联时使用曲线，避免重叠
  const links = relationList.value.flatMap((rel) => {
    const isSelfLoop = rel.source === rel.target
    return [
      {
        source: rel.source,
        target: rel.target,
        label: { show: true, formatter: rel.label, fontSize: 10, color: '#475569' },
        lineStyle: {
          color: colorMap.get(rel.target) || '#94a3b8',
          width: 1.6,
          curveness: isSelfLoop ? 0.6 : 0.08,
          type: isSelfLoop ? ('solid' as const) : ('dashed' as const)
        },
        tooltip: { formatter: `${rel.label}<br/>关系实体：${rel.entity}<br/>关系数据：${rel.count} 条` }
      }
    ]
  })

  return {
    backgroundColor: 'transparent',
    tooltip: { confine: true },
    legend: {
      top: 8,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: '#475569' },
      data: entityList.value.map((item) => item.name)
    },
    series: [
      {
        type: 'graph',
        layout: 'circular',
        circular: { rotateLabel: false },
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
        top: 60,
        bottom: 30,
        data: nodes as never,
        links: links as never,
        labelLayout: { hideOverlap: true },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 },
          label: { fontSize: 12 }
        }
      } as never
    ]
  }
}

async function renderChart() {
  await loadCounts()
  if (!chart.value && chartRef.value) {
    chart.value = echarts.init(chartRef.value)
  }
  chart.value?.setOption(buildOption(), true)
  chart.value?.resize()
}

function exportGraphData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    engine: '华为 iDME 数据建模引擎（xDM-F）',
    entities: entityList.value,
    relations: relationList.value
  }
  downloadTextFile('xdmf-model-graph.json', JSON.stringify(payload, null, 2), 'application/json')
  ElMessage.success('图谱数据已导出为 JSON')
}

function handleResize() {
  chart.value?.resize()
}

onMounted(async () => {
  await renderChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.graph-panel {
  padding: 8px;
}

.graph-canvas {
  width: 100%;
  height: 560px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 14px;
}

.entity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.entity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.entity-body {
  flex: 1;
  min-width: 0;
}

.entity-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.entity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 11.5px;
  color: $text-secondary;
}

.entity-count {
  color: $color-primary;
  font-weight: 500;
}

.relation-item {
  padding: 10px 0;
  border-bottom: 1px dashed $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.relation-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: $text-primary;
}

.relation-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: $color-primary;
}

.relation-entity {
  margin: 4px 0 2px 14px;
  font-size: 11px;
  color: $text-secondary;
  word-break: break-all;
}

.relation-count {
  margin-left: 14px;
  font-size: 11.5px;
  color: #0ea5e9;
}
</style>

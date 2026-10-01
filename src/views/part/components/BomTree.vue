<template>
  <div class="bom-tree">
    <div class="bom-tree__head">
      <div class="bom-tree__title">
        <el-icon><Share /></el-icon>
        BOM 物料清单
        <span v-if="rootPart" class="bom-tree__root">
          {{ rootPart.partCode }} · {{ rootPart.partName }}
        </span>
      </div>
      <div class="bom-tree__actions">
        <el-button type="primary" link size="small" @click="load">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 3px">刷新</span>
        </el-button>
        <el-button type="primary" size="small" :disabled="!rootPart" @click="emit('add')">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 3px">添加子件</span>
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="treeData"
      row-key="key"
      border
      size="small"
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="partCode" label="物料编号" width="130">
        <template #default="{ row }">
          <span class="text-mono">{{ row.partCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="partName" label="物料名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="model" label="规格型号" min-width="130" show-overflow-tooltip />
      <el-table-column label="用量" width="90" align="center">
        <template #default="{ row }">
          <span v-if="row.isRoot" class="text-muted">—</span>
          <template v-else>{{ row.quantity }} {{ row.unit || '' }}</template>
        </template>
      </el-table-column>
      <el-table-column label="装配顺序" width="96" align="center">
        <template #default="{ row }">{{ row.isRoot ? '—' : row.sequence ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="层级" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.isRoot ? 'primary' : 'info'" effect="plain">
            {{ row.isRoot ? '根节点' : `第 ${row.level} 层` }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" align="center">
        <template #default="{ row }">
          <el-button v-if="!row.isRoot" link type="danger" size="small" @click="handleRemove(row)">移除</el-button>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <template #empty>
        <EmptyState compact :description="rootPart ? '该物料暂无 BOM 子件' : '请先在左侧选择物料'" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import { useCrud } from '@/composables/useCrud'
import { deleteBomRelation, listAllParts, listBomRelations } from '@/api/xdmf/modules/part'
import type { BomRel, BomTreeNode, Part } from '@/types/part'

const props = defineProps<{ rootPart: Part | null }>()
const emit = defineEmits<{ (e: 'add'): void; (e: 'refresh'): void }>()

const loading = ref(false)
const relations = ref<BomRel[]>([])
const parts = ref<Part[]>([])
const { confirmRemove } = useCrud(() => load())

function partMap() {
  return new Map(parts.value.map((item) => [item.id, item]))
}

/** 递归构建 BOM 树（带层级与循环保护） */
function buildNodes(parentId: string, level: number, visited: Set<string>): BomTreeNode[] {
  const map = partMap()
  return relations.value
    .filter((rel) => rel.parentPartId === parentId)
    .sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0))
    .map((rel) => {
      const child = map.get(rel.childPartId)
      const node: BomTreeNode & { level: number; relId: string } = {
        key: rel.id,
        relId: rel.id,
        partId: rel.childPartId,
        partCode: child?.partCode || rel.childPartId,
        partName: child?.partName || '未知物料',
        model: child?.model || '-',
        quantity: rel.quantity,
        unit: rel.unit,
        sequence: rel.sequence,
        level,
        children: []
      }
      if (!visited.has(rel.childPartId)) {
        const nextVisited = new Set(visited)
        nextVisited.add(rel.childPartId)
        node.children = buildNodes(rel.childPartId, level + 1, nextVisited)
      }
      return node
    })
}

const treeData = computed(() => {
  if (!props.rootPart) return []
  const root = props.rootPart
  return [
    {
      key: `root-${root.id}`,
      partId: root.id,
      partCode: root.partCode,
      partName: root.partName,
      model: root.model,
      quantity: 1,
      unit: root.unit,
      isRoot: true,
      level: 0,
      children: buildNodes(root.id, 1, new Set([root.id]))
    }
  ] as never[]
})

async function load() {
  loading.value = true
  try {
    const [relResult, partResult] = await Promise.all([listBomRelations(), listAllParts()])
    relations.value = relResult.data || []
    parts.value = partResult.data || []
  } finally {
    loading.value = false
  }
}

async function handleRemove(row: BomTreeNode & { relId?: string }) {
  if (!row.relId) return
  await confirmRemove(`${row.partName} 的 BOM 关系`, () => deleteBomRelation(row.relId!), () => {
    emit('refresh')
  })
}

watch(() => props.rootPart?.id, load, { immediate: true })

defineExpose({ load })
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.bom-tree__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.bom-tree__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.bom-tree__root {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 400;
  color: $color-primary;
  background: #e9effd;
}

.bom-tree__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

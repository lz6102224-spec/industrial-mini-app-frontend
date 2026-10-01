<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#0ea5e9"><Box /></el-icon>
          物料管理
        </h2>
        <p class="page-desc">
          维护物料（Part）属性与分类管理，支持版本管理、按物料编码 / 名称 / 规格型号等属性搜索，并支持构建物料清单 BOM（Part 之间的组成关系）。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 4px">新增物料</span>
      </el-button>
    </div>

    <div class="part-layout">
      <!-- 左侧分类树 -->
      <div class="card-panel part-aside">
        <CategoryTree
          v-model:selected="selectedCategory"
          :data="categories"
          :total-count="total"
          @refresh="loadCategories"
        />
      </div>

      <!-- 右侧内容 -->
      <div class="card-panel part-main">
        <el-tabs v-model="activeTab">
          <!-- 物料列表 -->
          <el-tab-pane name="list">
            <template #label>
              <span><el-icon><List /></el-icon> 物料列表</span>
            </template>

            <SearchBar :model="query" :loading="loading" @search="search" @reset="handleReset">
              <el-form-item label="物料编号">
                <el-input v-model="query.partCode" placeholder="支持模糊查询" clearable style="width: 160px" @keyup.enter="search" />
              </el-form-item>
              <el-form-item label="物料名称">
                <el-input v-model="query.partName" placeholder="支持模糊查询" clearable style="width: 160px" @keyup.enter="search" />
              </el-form-item>
              <el-form-item label="规格型号">
                <el-input v-model="query.model" placeholder="支持模糊查询" clearable style="width: 150px" @keyup.enter="search" />
              </el-form-item>
              <el-form-item label="供应商">
                <el-input v-model="query.supplier" placeholder="支持模糊查询" clearable style="width: 150px" @keyup.enter="search" />
              </el-form-item>
            </SearchBar>

            <div class="toolbar">
              <div class="toolbar-left">
                <el-tag v-if="selectedCategory" closable type="primary" effect="plain" @close="handleCategoryClear">
                  已按分类过滤：{{ selectedCategoryName }}
                </el-tag>
                <el-button @click="load">
                  <el-icon><Refresh /></el-icon>
                  <span style="margin-left: 4px">刷新</span>
                </el-button>
              </div>
              <span class="text-muted">共 {{ total }} 项物料</span>
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
              <el-table-column prop="partCode" label="物料编号" width="130" fixed="left">
                <template #default="{ row }"><span class="text-mono">{{ row.partCode }}</span></template>
              </el-table-column>
              <el-table-column prop="partName" label="物料名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="model" label="规格型号" min-width="130" show-overflow-tooltip />
              <el-table-column prop="stockQuantity" label="库存数量" width="100" align="right">
                <template #default="{ row }">{{ formatNumber(row.stockQuantity) }}</template>
              </el-table-column>
              <el-table-column prop="supplier" label="供应商" min-width="180" show-overflow-tooltip />
              <el-table-column label="分类" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-tag size="small" effect="plain">{{ categoryName(row.categoryId) || '未分类' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="版本" width="90" align="center">
                <template #default="{ row }">
                  <el-tag size="small" type="success" effect="plain">{{ row.version }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openBom(row)">BOM</el-button>
                  <el-button link type="primary" size="small" @click="openVersion(row)">版本</el-button>
                  <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </ProTable>
          </el-tab-pane>

          <!-- BOM 结构 -->
          <el-tab-pane name="bom">
            <template #label>
              <span><el-icon><Share /></el-icon> BOM 结构</span>
            </template>
            <div class="bom-toolbar">
              <el-select
                v-model="bomRootId"
                filterable
                clearable
                placeholder="选择根物料以查看 BOM 结构"
                style="width: 340px"
                @change="handleBomRootChange"
              >
                <el-option
                  v-for="item in allParts"
                  :key="item.id"
                  :label="`${item.partCode} · ${item.partName}`"
                  :value="item.id"
                />
              </el-select>
            </div>
            <BomTree :root-part="bomRoot" @add="openBomAdd" @refresh="loadAllParts" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <PartForm v-model="formVisible" :record="current" :categories="categories" @saved="load" />

    <BomEditDialog
      v-model="bomDialogVisible"
      :parent-part="bomRoot"
      :parts="allParts"
      :next-sequence="nextBomSequence"
      @saved="handleBomSaved"
    />

    <VersionDialog v-model="versionVisible" :part="current" @saved="load" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import ProTable from '@/components/ProTable.vue'
import CategoryTree from './components/CategoryTree.vue'
import PartForm from './components/PartForm.vue'
import BomTree from './components/BomTree.vue'
import BomEditDialog from './components/BomEditDialog.vue'
import VersionDialog from './components/VersionDialog.vue'
import { useTable } from '@/composables/useTable'
import { useCrud } from '@/composables/useCrud'
import { deletePart, listAllParts, listCategories, listParts } from '@/api/xdmf/modules/part'
import { formatNumber } from '@/utils/format'
import type { Part, PartCategory, PartQuery } from '@/types/part'

const activeTab = ref('list')
const selectedCategory = ref('')

const {
  loading,
  list,
  page,
  pageSize,
  total,
  query,
  load,
  search,
  reset,
  refreshAfterRemove
} = useTable<Part>({
  fetcher: (q, size, current) => {
    const payload = { ...(q as PartQuery) }
    if (selectedCategory.value) payload.categoryId = selectedCategory.value
    return listParts(payload, size, current)
  },
  initialQuery: { partCode: '', partName: '', model: '', supplier: '' }
})

const { confirmRemove } = useCrud(load)

const categories = ref<PartCategory[]>([])
const allParts = ref<Part[]>([])
const formVisible = ref(false)
const current = ref<Part | null>(null)
const versionVisible = ref(false)
const bomDialogVisible = ref(false)
const bomRootId = ref('')

const bomRoot = computed(() => allParts.value.find((item) => item.id === bomRootId.value) || null)
const nextBomSequence = computed(() => 1)
const selectedCategoryName = computed(
  () => categories.value.find((item) => item.id === selectedCategory.value)?.categoryName || ''
)

function categoryName(id?: string) {
  if (!id) return ''
  return categories.value.find((item) => item.id === id)?.categoryName || ''
}

async function loadCategories() {
  const result = await listCategories()
  categories.value = result.data || []
}

async function loadAllParts() {
  const result = await listAllParts()
  allParts.value = result.data || []
}

watch(selectedCategory, () => {
  page.value = 1
  load()
})

function handleCategoryClear() {
  selectedCategory.value = ''
}

function handleReset() {
  reset({ partCode: '', partName: '', model: '', supplier: '' })
}

function openCreate() {
  current.value = null
  formVisible.value = true
}

function openEdit(row: Part) {
  current.value = { ...row }
  formVisible.value = true
}

function openVersion(row: Part) {
  current.value = { ...row }
  versionVisible.value = true
}

function openBom(row: Part) {
  activeTab.value = 'bom'
  bomRootId.value = row.id
}

function openBomAdd() {
  if (!bomRoot.value) return
  bomDialogVisible.value = true
}

function handleBomRootChange() {
  // BomTree 通过 watch 自动响应
}

async function handleBomSaved() {
  await loadAllParts()
}

async function handleDelete(row: Part) {
  await confirmRemove(row.partName, () => deletePart(row.id), () => refreshAfterRemove(1))
}

onMounted(() => {
  loadCategories()
  loadAllParts()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.part-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.part-aside {
  width: 260px;
  flex-shrink: 0;
}

.part-main {
  flex: 1;
  min-width: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bom-toolbar {
  margin-bottom: 14px;
}

:deep(.el-tabs__header) {
  margin-bottom: 14px;
}

:deep(.el-tabs__item) {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1200px) {
  .part-layout {
    flex-direction: column;
  }

  .part-aside {
    width: 100%;
  }
}
</style>

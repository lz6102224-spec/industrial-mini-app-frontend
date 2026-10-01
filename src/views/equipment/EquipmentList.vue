<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#2563eb"><Cpu /></el-icon>
          设备管理
        </h2>
        <p class="page-desc">
          设备基础档案管理：录入设备编码、名称、生产厂家、品牌、规格型号、供应商、生产日期、使用年限、折旧方式、位置等基础信息，
          并支持技术参数、备品备件等自定义扩展属性。每台设备注册时分配唯一标识符。
        </p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 4px">新增设备</span>
      </el-button>
    </div>

    <div class="card-panel">
      <SearchBar :model="query" :loading="loading" @search="search" @reset="handleReset">
        <el-form-item label="设备编码">
          <el-input v-model="query.equipmentCode" placeholder="支持模糊查询" clearable style="width: 170px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="query.equipmentName" placeholder="支持模糊查询" clearable style="width: 170px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="生产厂家">
          <el-input v-model="query.manufacturer" placeholder="支持模糊查询" clearable style="width: 170px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="query.brand" placeholder="支持模糊查询" clearable style="width: 130px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="query.location" placeholder="支持模糊查询" clearable style="width: 150px" @keyup.enter="search" />
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
        <span class="text-muted">共 {{ total }} 台设备</span>
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
        <el-table-column type="index" label="#" width="52" align="center" />
        <el-table-column prop="equipmentCode" label="设备编码" width="128" fixed="left">
          <template #default="{ row }">
            <span class="text-mono">{{ row.equipmentCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="equipmentName" label="设备名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="190" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="model" label="规格型号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="supplier" label="供应商" min-width="170" show-overflow-tooltip />
        <el-table-column prop="productionDate" label="生产日期" width="112" />
        <el-table-column prop="serviceLife" label="使用年限" width="94" align="center">
          <template #default="{ row }">{{ row.serviceLife }} 年</template>
        </el-table-column>
        <el-table-column prop="depreciationMethod" label="折旧方式" width="130" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" min-width="170" show-overflow-tooltip />
        <el-table-column label="扩展信息" width="140" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.technicalParams?.length" size="small" effect="plain" style="margin-right: 4px">
              技术参数 {{ row.technicalParams.length }}
            </el-tag>
            <el-tag v-if="row.spareParts?.length" size="small" type="warning" effect="plain">
              备件 {{ row.spareParts.length }}
            </el-tag>
            <span v-if="!row.technicalParams?.length && !row.spareParts?.length" class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </ProTable>
    </div>

    <EquipmentForm v-model="formVisible" :record="current" @saved="load" />

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="设备档案详情" size="640px">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="设备编码">{{ detail.equipmentCode }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ detail.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="生产厂家">{{ detail.manufacturer }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ detail.brand }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ detail.model }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ detail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ detail.productionDate }}</el-descriptions-item>
          <el-descriptions-item label="使用年限">{{ detail.serviceLife }} 年</el-descriptions-item>
          <el-descriptions-item label="折旧方式">{{ detail.depreciationMethod }}</el-descriptions-item>
          <el-descriptions-item label="设备状态">{{ detail.status || '在用' }}</el-descriptions-item>
          <el-descriptions-item label="位置" :span="2">{{ detail.location }}</el-descriptions-item>
          <el-descriptions-item label="唯一标识符" :span="2">
            <span class="text-mono">{{ detail.uuid }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <div class="detail-section__title">技术参数信息（扩展属性）</div>
          <el-table :data="detail.technicalParams || []" size="small" border>
            <el-table-column prop="paramName" label="参数名称" min-width="120" />
            <el-table-column prop="paramValue" label="参数值" min-width="110" />
            <el-table-column prop="paramType" label="类型" width="80" />
            <el-table-column prop="unit" label="单位" width="80" />
            <template #empty><EmptyState compact description="未配置技术参数" /></template>
          </el-table>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">备品备件信息（扩展属性）</div>
          <el-table :data="detail.spareParts || []" size="small" border>
            <el-table-column prop="spareCode" label="备件编码" min-width="110" />
            <el-table-column prop="spareName" label="备件名称" min-width="120" />
            <el-table-column prop="specification" label="规格型号" min-width="110" />
            <el-table-column prop="stockQuantity" label="库存" width="70" align="center" />
            <el-table-column prop="unit" label="单位" width="64" align="center" />
            <el-table-column prop="safetyStock" label="安全库存" width="86" align="center" />
            <template #empty><EmptyState compact description="未配置备品备件" /></template>
          </el-table>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import ProTable from '@/components/ProTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import EquipmentForm from './components/EquipmentForm.vue'
import { useTable } from '@/composables/useTable'
import { useCrud } from '@/composables/useCrud'
import {
  batchDeleteEquipments,
  deleteEquipment,
  listEquipments
} from '@/api/xdmf/modules/equipment'
import type { Equipment, EquipmentQuery } from '@/types/equipment'

const { loading, list, page, pageSize, total, query, load, search, reset, refreshAfterRemove } = useTable<Equipment>({
  fetcher: (q, size, current) => listEquipments(q as EquipmentQuery, size, current),
  initialQuery: { equipmentCode: '', equipmentName: '', manufacturer: '', brand: '', location: '' }
})

const { confirmRemove } = useCrud(load)

const selection = ref<Equipment[]>([])
const formVisible = ref(false)
const current = ref<Equipment | null>(null)
const detailVisible = ref(false)
const detail = ref<Equipment | null>(null)

function handleSelectionChange(rows: Equipment[]) {
  selection.value = rows
}

function openCreate() {
  current.value = null
  formVisible.value = true
}

function openEdit(row: Equipment) {
  current.value = { ...row }
  formVisible.value = true
}

function openDetail(row: Equipment) {
  detail.value = row
  detailVisible.value = true
}

function handleReset() {
  reset({ equipmentCode: '', equipmentName: '', manufacturer: '', brand: '', location: '' })
}

async function handleDelete(row: Equipment) {
  await confirmRemove(row.equipmentName, () => deleteEquipment(row.id), () => refreshAfterRemove(1))
}

async function handleBatchDelete() {
  const ids = selection.value.map((item) => item.id)
  if (!ids.length) return
  await confirmRemove(`选中的 ${ids.length} 台设备`, () => batchDeleteEquipments(ids), () => {
    selection.value = []
    ElMessage.success(`已删除 ${ids.length} 台设备`)
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.toolbar-left {
  display: flex;
  gap: 8px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section__title {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid $color-primary;
}
</style>

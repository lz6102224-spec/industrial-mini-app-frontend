<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          <el-icon color="#0ea5e9"><Document /></el-icon>
          xDM-F 接口清单
        </h2>
        <p class="page-desc">
          工程中调用的全部华为 iDME 数据建模引擎（xDM-F）API 列表。所有业务数据交互均通过 xDM-F 动态数据服务完成，
          接口统一为 POST 方法，请求体包裹在 <code>{"params": {...}}</code> 中。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="exportMarkdown">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 4px">导出 Markdown</span>
        </el-button>
        <el-button type="primary" @click="exportJson">
          <el-icon><Download /></el-icon>
          <span style="margin-left: 4px">导出 JSON</span>
        </el-button>
      </div>
    </div>

    <div class="card-panel">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="基础路径">
          <span class="text-mono">{{ appStore.baseUrl }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="应用英文名">{{ appStore.appId }}</el-descriptions-item>
        <el-descriptions-item label="环境 ID">{{ appStore.envId }}</el-descriptions-item>
        <el-descriptions-item label="接口总数">
          <el-tag type="primary" size="small" effect="plain">{{ API_REGISTRY.length }} 个</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-for="group in groupedRegistry" :key="group.module" class="card-panel">
      <div class="panel-title">
        <span>{{ group.module }}</span>
        <el-tag size="small" effect="plain">{{ group.items.length }} 个接口</el-tag>
      </div>
      <el-table :data="group.items" border size="small">
        <el-table-column prop="entity" label="实体" width="210">
          <template #default="{ row }">
            <span class="text-mono">{{ row.entity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="entityType" label="实体类型" width="96" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.entityType === '关系实体' ? 'warning' : 'primary'" effect="plain">
              {{ row.entityType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="op" label="原子操作" width="110">
          <template #default="{ row }"><span class="text-mono">{{ row.op }}</span></template>
        </el-table-column>
        <el-table-column prop="method" label="方法" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="接口路径" min-width="330">
          <template #default="{ row }">
            <span class="text-mono path-text">{{ row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" min-width="300" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { API_REGISTRY, groupRegistryByModule, registryToMarkdown } from '@/api/xdmf/registry'
import { useAppStore } from '@/stores/app'
import { downloadTextFile } from '@/utils/format'

const appStore = useAppStore()
const groupedRegistry = computed(() => groupRegistryByModule())

function exportMarkdown() {
  downloadTextFile('xdmf-api-list.md', registryToMarkdown(), 'text/markdown')
  ElMessage.success('接口清单已导出为 Markdown')
}

function exportJson() {
  downloadTextFile(
    'xdmf-api-list.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), total: API_REGISTRY.length, apis: API_REGISTRY }, null, 2),
    'application/json'
  )
  ElMessage.success('接口清单已导出为 JSON')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 14px;
}

.path-text {
  color: #0f766e;
  word-break: break-all;
}

code {
  padding: 1px 5px;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 12px;
  color: #be123c;
}
</style>

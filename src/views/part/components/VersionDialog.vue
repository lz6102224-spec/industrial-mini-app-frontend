<template>
  <el-dialog v-model="visible" title="物料版本管理" width="680px" destroy-on-close>
    <template v-if="part">
      <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
        <el-descriptions-item label="物料编号">{{ part.partCode }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ part.partName }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ part.model }}</el-descriptions-item>
        <el-descriptions-item label="当前版本">
          <el-tag type="success" size="small" effect="plain">{{ part.version }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="版本管理基于 xDM-F 的 saveAs 原子操作实现：升级后生成新版本物料记录，并写入版本历史。"
        style="margin-bottom: 16px"
      />

      <div class="version-form">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="新版本号">
            <el-input v-model="newVersion" placeholder="如 V1.1" style="width: 140px" />
          </el-form-item>
          <el-form-item label="变更说明">
            <el-input v-model="remark" placeholder="本次版本变更内容" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleUpgrade">升级版本</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="version-list">
        <div class="version-list__title">版本历史</div>
        <el-table v-loading="loading" :data="versions" size="small" border>
          <el-table-column prop="version" label="版本号" width="100" />
          <el-table-column prop="remark" label="变更说明" min-width="220" show-overflow-tooltip />
          <el-table-column label="变更时间" width="170">
            <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.isCurrent ? 'success' : 'info'" effect="plain">
                {{ row.isCurrent ? '当前' : '历史' }}
              </el-tag>
            </template>
          </el-table-column>
          <template #empty><EmptyState compact description="暂无版本记录" /></template>
        </el-table>
      </div>
    </template>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import { listPartVersions, savePartAsNewVersion } from '@/api/xdmf/modules/part'
import { formatDateTime } from '@/utils/format'
import type { Part, PartVersion } from '@/types/part'

const props = defineProps<{ modelValue: boolean; part: Part | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const submitting = ref(false)
const versions = ref<PartVersion[]>([])
const newVersion = ref('')
const remark = ref('')

function bumpVersion(version?: string) {
  const matched = String(version || 'V1.0').match(/^(V?)(\d+)\.(\d+)$/i)
  if (!matched) return `${version || 'V1.0'}.1`
  return `${matched[1]}${matched[2]}.${Number(matched[3]) + 1}`
}

async function load() {
  if (!props.part) return
  loading.value = true
  try {
    const result = await listPartVersions(props.part.id)
    versions.value = result.data || []
  } finally {
    loading.value = false
  }
}

async function handleUpgrade() {
  if (!props.part) return
  if (!newVersion.value) {
    ElMessage.warning('请输入新版本号')
    return
  }
  submitting.value = true
  try {
    const result = await savePartAsNewVersion(props.part, newVersion.value, remark.value)
    if (result.ok) {
      ElMessage.success(`已升级至 ${newVersion.value}`)
      remark.value = ''
      await load()
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    newVersion.value = bumpVersion(props.part?.version)
    remark.value = ''
    load()
  }
)
</script>

<style scoped lang="scss">
.version-form {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.version-list__title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1f2937;
}
</style>

<template>
  <div class="category-tree">
    <div class="category-tree__head">
      <span class="category-tree__title">
        <el-icon><Files /></el-icon>
        物料分类
      </span>
      <el-button type="primary" link size="small" @click="openCreate(null)">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <el-input v-model="keyword" placeholder="搜索分类" size="small" clearable class="category-tree__search">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>

    <el-scrollbar class="category-tree__body">
      <div class="all-node" :class="{ 'is-active': !selected }" @click="selectCategory('')">
        <el-icon><Menu /></el-icon>
        <span>全部分类</span>
        <span class="count">{{ totalCount }}</span>
      </div>

      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="{ label: 'categoryName', children: 'children' }"
        node-key="id"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        default-expand-all
        highlight-current
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="tree-node__label">{{ data.categoryName }}</span>
            <span class="tree-node__actions">
              <el-icon title="新增子分类" @click.stop="openCreate(data)"><Plus /></el-icon>
              <el-icon title="编辑" @click.stop="openEdit(data)"><Edit /></el-icon>
              <el-icon title="删除" @click.stop="handleDelete(data)"><Delete /></el-icon>
            </span>
          </div>
        </template>
      </el-tree>

      <EmptyState v-if="!treeData.length" compact description="暂无分类" />
    </el-scrollbar>

    <el-dialog v-model="dialogVisible" :title="editRecord ? '编辑分类' : '新增分类'" width="460px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="分类编码" prop="categoryCode">
          <el-input v-model="form.categoryCode" placeholder="如 CAT-GEAR-SUN" />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="如 中心轮（太阳轮）" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="form.parentId"
            :data="treeData"
            :props="{ label: 'categoryName', value: 'id', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="不选则为一级分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ElTree, FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import EmptyState from '@/components/EmptyState.vue'
import { useCrud } from '@/composables/useCrud'
import { createCategory, deleteCategory, updateCategory } from '@/api/xdmf/modules/part'
import { buildTree } from '@/utils/tree'
import type { PartCategory } from '@/types/part'

const props = defineProps<{
  data: PartCategory[]
  selected: string
  totalCount?: number
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: string): void
  (e: 'refresh'): void
}>()

const keyword = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const dialogVisible = ref(false)
const editRecord = ref<PartCategory | null>(null)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const { confirmRemove, submit } = useCrud(() => emit('refresh'))

const treeData = computed(() => buildTree(props.data as never) as unknown as PartCategory[])

watch(keyword, (value) => treeRef.value?.filter(value))

function filterNode(value: string, data: PartCategory) {
  if (!value) return true
  return String(data.categoryName || '').includes(value)
}

function selectCategory(id: string) {
  emit('update:selected', id)
  if (!id) treeRef.value?.setCurrentKey(undefined)
}

function handleNodeClick(data: PartCategory) {
  selectCategory(data.id)
}

const form = reactive<PartCategory>({
  id: '',
  categoryCode: '',
  categoryName: '',
  parentId: '',
  sortOrder: 0
} as PartCategory)

const rules: FormRules = {
  categoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

function openCreate(parent: PartCategory | null) {
  editRecord.value = null
  Object.assign(form, { id: '', categoryCode: '', categoryName: '', parentId: parent?.id || '', sortOrder: 0 })
  dialogVisible.value = true
}

function openEdit(record: PartCategory) {
  editRecord.value = record
  Object.assign(form, JSON.parse(JSON.stringify(record)))
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await submit(
    async () => {
      const payload = { ...form } as Record<string, unknown>
      const result = editRecord.value
        ? await updateCategory(payload as Partial<PartCategory>)
        : await createCategory(payload as Partial<PartCategory>)
      return result
    },
    {
      onSuccess: () => {
        dialogVisible.value = false
      }
    }
  )
}

async function handleDelete(record: PartCategory) {
  const hasChildren = props.data.some((item) => item.parentId === record.id)
  if (hasChildren) {
    ElMessage.warning('该分类下存在子分类，请先删除子分类')
    return
  }
  await confirmRemove(record.categoryName, () => deleteCategory(record.id))
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.category-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.category-tree__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-tree__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.category-tree__search {
  margin-bottom: 10px;
}

.category-tree__body {
  flex: 1;
  min-height: 260px;
  max-height: calc(100vh - 320px);
}

.all-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  margin-bottom: 4px;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-regular;
  cursor: pointer;

  &:hover {
    background: #f2f6fd;
  }

  &.is-active {
    background: #e9effd;
    color: $color-primary;
    font-weight: 500;
  }

  .count {
    margin-left: auto;
    font-size: 11px;
    color: $text-secondary;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 6px;

  &:hover .tree-node__actions {
    opacity: 1;
  }
}

.tree-node__label {
  font-size: 13px;
}

.tree-node__actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s;
  color: $text-secondary;

  .el-icon:hover {
    color: $color-primary;
  }
}

:deep(.el-tree-node__content) {
  height: 32px;
  border-radius: $radius-sm;
}
</style>

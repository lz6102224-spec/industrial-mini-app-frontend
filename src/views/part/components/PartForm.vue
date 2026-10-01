<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑物料' : '新增物料'"
    width="760px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="物料编号" prop="partCode">
            <el-input v-model="form.partCode" placeholder="如 P-SUN-001" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料名称" prop="partName">
            <el-input v-model="form.partName" placeholder="如 中心轮（太阳轮）" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号" prop="model">
            <el-input v-model="form.model" placeholder="如 PR-20-SUN" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存数量" prop="stockQuantity">
            <el-input-number v-model="form.stockQuantity" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplier">
            <el-input v-model="form.supplier" placeholder="如 自制 / 苏州精密齿轮有限公司" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料分类" prop="categoryId">
            <el-tree-select
              v-model="form.categoryId"
              :data="categoryOptions"
              :props="{ label: 'categoryName', value: 'id', children: 'children' }"
              node-key="id"
              check-strictly
              clearable
              placeholder="请选择物料分类"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="如 V1.0">
              <template #append>
                <el-button @click="form.version = bumpVersion(form.version)">升版</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="unit">
            <el-select v-model="form.unit" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in UNITS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in PART_STATUS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否自制件">
            <el-switch v-model="form.selfMade" active-text="自制" inactive-text="外购" inline-prompt />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="物料描述">
            <el-input v-model="form.description" type="textarea" :rows="2" placeholder="物料用途、材质、热处理要求等" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createPart, updatePart } from '@/api/xdmf/modules/part'
import { PART_STATUS, UNITS } from '@/constants/dict'
import type { Part, PartCategory } from '@/types/part'

const props = defineProps<{
  modelValue: boolean
  record?: Part | null
  categories?: PartCategory[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => Boolean(props.record?.id))
const formRef = ref<FormInstance>()
const submitting = ref(false)

/** 分类树选项（含虚拟根，便于平铺展示多级结构） */
const categoryOptions = computed(() => buildCategoryTree(props.categories || []))

function buildCategoryTree(list: PartCategory[]) {
  const map = new Map<string, PartCategory & { children: PartCategory[] }>()
  const roots: Array<PartCategory & { children: PartCategory[] }> = []
  list.forEach((item) => map.set(item.id, { ...item, children: [] }))
  list.forEach((item) => {
    const node = map.get(item.id)!
    const parent = item.parentId ? map.get(item.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  return roots
}

function bumpVersion(version: string) {
  const matched = String(version || 'V1.0').match(/^(V?)(\d+)\.(\d+)$/i)
  if (!matched) return `${version || 'V1.0'}.1`
  return `${matched[1]}${matched[2]}.${Number(matched[3]) + 1}`
}

function emptyForm(): Part {
  return {
    id: '',
    partCode: '',
    partName: '',
    model: '',
    stockQuantity: 0,
    supplier: '',
    categoryId: '',
    version: 'V1.0',
    unit: '件',
    status: '启用',
    selfMade: true,
    description: ''
  } as Part
}

const form = reactive<Part>(emptyForm())

const rules: FormRules = {
  partCode: [{ required: true, message: '请输入物料编号', trigger: 'blur' }],
  partName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  stockQuantity: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    Object.assign(form, emptyForm(), props.record ? JSON.parse(JSON.stringify(props.record)) : {})
    formRef.value?.clearValidate()
  }
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善必填项')
    return
  }
  submitting.value = true
  try {
    const payload = { ...form } as Record<string, unknown>
    const result = isEdit.value ? await updatePart(payload as Partial<Part>) : await createPart(payload as Partial<Part>)
    if (result.ok) {
      visible.value = false
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}
</script>

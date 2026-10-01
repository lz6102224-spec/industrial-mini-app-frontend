<template>
  <el-dialog v-model="visible" title="构建 BOM 组成关系" width="560px" destroy-on-close>
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="BOM 用于描述 Part 之间的组成关系（父件由哪些子件构成）。xDM-F 关系实体不支持批量创建，多条关系将逐条写入。"
      style="margin-bottom: 16px"
    />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="父物料">
        <el-input :model-value="parentPart ? `${parentPart.partCode} · ${parentPart.partName}` : ''" readonly />
      </el-form-item>
      <el-form-item label="子物料" prop="childPartId">
        <el-select v-model="form.childPartId" filterable placeholder="请选择子物料" style="width: 100%">
          <el-option
            v-for="item in selectableParts"
            :key="item.id"
            :label="`${item.partCode} · ${item.partName} (${item.model})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用量" prop="quantity">
            <el-input-number v-model="form.quantity" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="unit">
            <el-select v-model="form.unit" style="width: 100%">
              <el-option v-for="item in UNITS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="装配顺序" prop="sequence">
        <el-input-number v-model="form.sequence" :min="1" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="装配说明" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认建立关系</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createBomRelation } from '@/api/xdmf/modules/part'
import { UNITS } from '@/constants/dict'
import type { Part } from '@/types/part'

const props = defineProps<{
  modelValue: boolean
  parentPart: Part | null
  parts: Part[]
  nextSequence?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const selectableParts = computed(() => props.parts.filter((item) => item.id !== props.parentPart?.id))

const form = reactive({
  childPartId: '',
  quantity: 1,
  unit: '件',
  sequence: 1,
  remark: ''
})

const rules: FormRules = {
  childPartId: [{ required: true, message: '请选择子物料', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入用量', trigger: 'blur' }],
  sequence: [{ required: true, message: '请输入装配顺序', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    Object.assign(form, { childPartId: '', quantity: 1, unit: '件', sequence: props.nextSequence ?? 1, remark: '' })
    formRef.value?.clearValidate()
  }
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.parentPart) return

  submitting.value = true
  try {
    const result = await createBomRelation({
      parentPartId: props.parentPart.id,
      childPartId: form.childPartId,
      quantity: form.quantity,
      unit: form.unit,
      sequence: form.sequence,
      remark: form.remark
    })
    if (result.ok) {
      ElMessage.success('BOM 关系已建立')
      visible.value = false
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}
</script>

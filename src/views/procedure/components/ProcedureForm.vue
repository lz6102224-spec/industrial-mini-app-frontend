<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑工序' : '新增工序'"
    width="720px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="工序编号" prop="procedureCode">
            <el-input v-model="form.procedureCode" placeholder="如 OP-010" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工序名称" prop="procedureName">
            <el-input v-model="form.procedureName" placeholder="如 毛坯制造" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工序顺序" prop="sequence">
            <el-input-number v-model="form.sequence" :min="1" :max="99" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作人员" prop="operator">
            <el-input v-model="form.operator" placeholder="如 张伟" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="生产步骤" prop="productionSteps">
            <el-input v-model="form.productionSteps" type="textarea" :rows="2" placeholder="如 下料 → 加热 → 模锻成形 → 正火 → 入库" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="生产和检测设备" prop="productionInspectionEquipment">
            <el-input v-model="form.productionInspectionEquipment" placeholder="如 中频感应锻造加热炉、锻压机、硬度计" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" placeholder="选择开始时间" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" placeholder="选择结束时间" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工时（分钟）">
            <el-input-number v-model="form.workingHours" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="工序说明">
            <el-input v-model="form.description" type="textarea" :rows="2" placeholder="工序目的与质量要求" />
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
import { createProcedure, updateProcedure } from '@/api/xdmf/modules/procedure'
import type { WorkingProcedure } from '@/types/procedure'

const props = defineProps<{ modelValue: boolean; record?: WorkingProcedure | null; nextSequence?: number }>()
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

function emptyForm(): WorkingProcedure {
  return {
    id: '',
    procedureCode: '',
    procedureName: '',
    productionSteps: '',
    productionInspectionEquipment: '',
    operator: '',
    startTime: '',
    endTime: '',
    sequence: props.nextSequence ?? 1,
    workingHours: 0,
    description: ''
  } as WorkingProcedure
}

const form = reactive<WorkingProcedure>(emptyForm())

const rules: FormRules = {
  procedureCode: [{ required: true, message: '请输入工序编号', trigger: 'blur' }],
  procedureName: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
  productionSteps: [{ required: true, message: '请输入生产步骤', trigger: 'blur' }],
  productionInspectionEquipment: [{ required: true, message: '请输入生产和检测设备', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人员', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
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
    const result = isEdit.value ? await updateProcedure(payload as Partial<WorkingProcedure>) : await createProcedure(payload as Partial<WorkingProcedure>)
    if (result.ok) {
      visible.value = false
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}
</script>

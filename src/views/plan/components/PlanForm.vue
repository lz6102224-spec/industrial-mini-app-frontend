<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑工艺路线' : '新增工艺路线'"
    width="1000px"
    top="5vh"
    destroy-on-close
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="工艺基本信息" name="basic">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="工艺编号" prop="planCode">
                <el-input v-model="form.planCode" placeholder="如 WP-SUN-001" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺名称" prop="planName">
                <el-input v-model="form.planName" placeholder="如 中心轮零件加工" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属产品" prop="productName">
                <el-input v-model="form.productName" placeholder="如 精密行星减速器 PR-20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="版本" prop="version">
                <el-input v-model="form.version" placeholder="如 1.0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="操作人员" prop="operator">
                <el-input v-model="form.operator" placeholder="如 李强" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="操作时间" prop="operationTime">
                <el-date-picker
                  v-model="form.operationTime"
                  type="datetime"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  placeholder="选择操作时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="form.status" style="width: 100%">
                  <el-option v-for="item in PLAN_STATUS" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="设备使用情况" prop="equipmentUsage">
                <el-input v-model="form.equipmentUsage" type="textarea" :rows="2" placeholder="如 中频感应锻造加热炉、数控车削中心、数控磨齿机…" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="工艺描述" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="工艺路线适用范围与要点" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane name="procedure">
        <template #label>
          <span>工序关联 <el-badge :value="procedures.length" :hidden="!procedures.length" type="primary" /></span>
        </template>
        <ProcedurePicker v-model="procedures" :procedures="allProcedures" />
      </el-tab-pane>
    </el-tabs>

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
import ProcedurePicker from './ProcedurePicker.vue'
import { createPlan, savePlanProcedures, updatePlan } from '@/api/xdmf/modules/plan'
import { PLAN_STATUS } from '@/constants/dict'
import type { PlanProcedureItem, WorkingPlan } from '@/types/plan'
import type { WorkingProcedure } from '@/types/procedure'

const props = defineProps<{
  modelValue: boolean
  record?: WorkingPlan | null
  allProcedures: WorkingProcedure[]
  initialProcedures?: PlanProcedureItem[]
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
const activeTab = ref('basic')
const formRef = ref<FormInstance>()
const submitting = ref(false)
const procedures = ref<PlanProcedureItem[]>([])

function emptyForm(): WorkingPlan {
  return {
    id: '',
    planCode: '',
    planName: '',
    productName: '',
    version: '1.0',
    description: '',
    operator: '',
    operationTime: '',
    equipmentUsage: '',
    status: '草稿'
  } as WorkingPlan
}

const form = reactive<WorkingPlan>(emptyForm())

const rules: FormRules = {
  planCode: [{ required: true, message: '请输入工艺编号', trigger: 'blur' }],
  planName: [{ required: true, message: '请输入工艺名称', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入所属产品', trigger: 'blur' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  description: [{ required: true, message: '请输入工艺描述', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人员', trigger: 'blur' }],
  operationTime: [{ required: true, message: '请选择操作时间', trigger: 'change' }]
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    activeTab.value = 'basic'
    Object.assign(form, emptyForm(), props.record ? JSON.parse(JSON.stringify(props.record)) : {})
    procedures.value = JSON.parse(JSON.stringify(props.initialProcedures || []))
    formRef.value?.clearValidate()
  }
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    activeTab.value = 'basic'
    ElMessage.warning('请完善工艺基本信息中的必填项')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form } as Record<string, unknown>
    const result = isEdit.value
      ? await updatePlan(payload as Partial<WorkingPlan>)
      : await createPlan(payload as Partial<WorkingPlan>)

    if (!result.ok) return

    const planId = result.data?.id || form.id
    if (planId) {
      await savePlanProcedures(
        planId,
        procedures.value.map((item) => item.procedureId)
      )
    }
    ElMessage.success(isEdit.value ? '工艺路线已更新' : '工艺路线已创建')
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

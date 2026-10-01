<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑设备档案' : '新增设备档案'"
    width="900px"
    top="6vh"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-tabs v-model="activeTab">
      <!-- 基础信息 -->
      <el-tab-pane label="基础信息" name="basic">
        <el-alert
          v-if="!isEdit"
          type="info"
          :closable="false"
          show-icon
          title="设备注册时会自动分配唯一标识符（UUID），用于全生命周期追溯。"
          style="margin-bottom: 16px"
        />
        <el-form ref="formRef" :model="form" :rules="rules" label-width="104px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="设备编码" prop="equipmentCode">
                <el-input v-model="form.equipmentCode" placeholder="如 EQ-CNC-007" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称" prop="equipmentName">
                <el-input v-model="form.equipmentName" placeholder="如 五轴联动加工中心" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产厂家" prop="manufacturer">
                <el-input v-model="form.manufacturer" placeholder="如 科德数控股份有限公司" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="品牌" prop="brand">
                <el-input v-model="form.brand" placeholder="如 KEDE" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规格型号" prop="model">
                <el-input v-model="form.model" placeholder="如 KMC800U" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商" prop="supplier">
                <el-input v-model="form.supplier" placeholder="如 科德数控华南服务中心" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产日期" prop="productionDate">
                <el-date-picker
                  v-model="form.productionDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择生产日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用年限" prop="serviceLife">
                <el-input-number v-model="form.serviceLife" :min="0" :max="100" controls-position="right" style="width: 100%" />
                <span class="unit-suffix">年</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="折旧方式" prop="depreciationMethod">
                <el-select v-model="form.depreciationMethod" placeholder="请选择折旧方式" style="width: 100%">
                  <el-option v-for="item in DEPRECIATION_METHODS" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                  <el-option v-for="item in EQUIPMENT_STATUS" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="位置" prop="location">
                <el-input v-model="form.location" placeholder="如 一号车间 A 区 03 工位" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="唯一标识符">
                <el-input v-model="form.uuid" readonly class="text-mono">
                  <template #append>
                    <el-button @click="form.uuid = uuid()">重新生成</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="设备用途、注意事项等" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 技术参数 -->
      <el-tab-pane name="tech">
        <template #label>
          <span>技术参数 <el-badge :value="form.technicalParams.length" :hidden="!form.technicalParams.length" type="primary" /></span>
        </template>
        <EditableTable
          v-model="form.technicalParams"
          :columns="techColumns"
          :template="techTemplate"
          hint="自定义技术参数扩展属性，如主轴转速、定位精度等"
        />
      </el-tab-pane>

      <!-- 备品备件 -->
      <el-tab-pane name="spare">
        <template #label>
          <span>备品备件 <el-badge :value="form.spareParts.length" :hidden="!form.spareParts.length" type="primary" /></span>
        </template>
        <EditableTable
          v-model="form.spareParts"
          :columns="spareColumns"
          :template="spareTemplate"
          hint="自定义备品备件信息，用于设备维护与库存预警"
        />
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
import EditableTable from '@/components/EditableTable.vue'
import type { EditableColumn } from '@/components/types'
import { DEPRECIATION_METHODS, EQUIPMENT_STATUS, PARAM_TYPES, UNITS } from '@/constants/dict'
import { createEquipment, updateEquipment } from '@/api/xdmf/modules/equipment'
import { uuid } from '@/utils/uuid'
import type { Equipment, SparePart, TechnicalParam } from '@/types/equipment'

const props = defineProps<{ modelValue: boolean; record?: Equipment | null }>()
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

function emptyForm(): Equipment {
  return {
    id: '',
    equipmentCode: '',
    equipmentName: '',
    manufacturer: '',
    brand: '',
    model: '',
    supplier: '',
    productionDate: '',
    serviceLife: 10,
    depreciationMethod: '平均年限法',
    location: '',
    uuid: uuid(),
    status: '在用',
    remark: '',
    technicalParams: [],
    spareParts: []
  } as Equipment
}

const form = reactive<Equipment>(emptyForm())

const rules: FormRules = {
  equipmentCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  equipmentName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  serviceLife: [{ required: true, message: '请输入使用年限', trigger: 'blur' }],
  depreciationMethod: [{ required: true, message: '请选择折旧方式', trigger: 'change' }],
  location: [{ required: true, message: '请输入设备位置', trigger: 'blur' }]
}

const techColumns: EditableColumn[] = [
  { prop: 'paramName', label: '参数名称', minWidth: 140 },
  { prop: 'paramValue', label: '参数值', minWidth: 120 },
  { prop: 'paramType', label: '参数类型', type: 'select', options: [...PARAM_TYPES], width: 110 },
  { prop: 'unit', label: '单位', width: 90 }
]

const techTemplate: Partial<TechnicalParam> = { paramName: '', paramValue: '', paramType: '文本', unit: '' }

const spareColumns: EditableColumn[] = [
  { prop: 'spareCode', label: '备件编码', minWidth: 130 },
  { prop: 'spareName', label: '备件名称', minWidth: 140 },
  { prop: 'specification', label: '规格型号', minWidth: 120 },
  { prop: 'stockQuantity', label: '库存数量', type: 'number', width: 110 },
  { prop: 'unit', label: '单位', type: 'select', options: [...UNITS], width: 90 },
  { prop: 'safetyStock', label: '安全库存', type: 'number', width: 110 },
  { prop: 'storageLocation', label: '存放位置', minWidth: 120 }
]

const spareTemplate: Partial<SparePart> = {
  spareCode: '',
  spareName: '',
  specification: '',
  stockQuantity: 0,
  unit: '件',
  safetyStock: 0,
  storageLocation: ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    activeTab.value = 'basic'
    const source = props.record ? JSON.parse(JSON.stringify(props.record)) : emptyForm()
    Object.assign(form, emptyForm(), source)
    form.technicalParams = (source.technicalParams || []).map((item: TechnicalParam, index: number) => ({
      ...item,
      key: `t-${index}-${Date.now()}`
    }))
    form.spareParts = (source.spareParts || []).map((item: SparePart, index: number) => ({
      ...item,
      key: `s-${index}-${Date.now()}`
    }))
    formRef.value?.clearValidate()
  }
)

function handleClosed() {
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    activeTab.value = 'basic'
    ElMessage.warning('请完善基础信息中的必填项')
    return
  }

  const payload: Record<string, unknown> = {
    ...form,
    technicalParams: (form.technicalParams || []).map(({ key, ...rest }) => rest),
    spareParts: (form.spareParts || []).map(({ key, ...rest }) => rest)
  }
  delete payload.key

  submitting.value = true
  try {
    const result = isEdit.value ? await updateEquipment(payload as Partial<Equipment>) : await createEquipment(payload as Partial<Equipment>)
    if (result.ok) {
      visible.value = false
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.unit-suffix {
  margin-left: 8px;
  color: #8b95a5;
  font-size: 12px;
}
</style>

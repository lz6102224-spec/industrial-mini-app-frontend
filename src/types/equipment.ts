import type { XdmfBaseEntity } from '@/api/xdmf/types'

/** 设备扩展属性 · 技术参数 */
export interface TechnicalParam {
  /** 参数名称 */
  paramName: string
  /** 参数值 */
  paramValue: string
  /** 参数类型：文本 / 数值 / 布尔 */
  paramType: '文本' | '数值' | '布尔'
  /** 参数单位 */
  unit?: string
  remark?: string
}

/** 设备扩展属性 · 备品备件 */
export interface SparePart {
  /** 备件编码 */
  spareCode: string
  /** 备件名称 */
  spareName: string
  /** 规格型号 */
  specification?: string
  /** 库存数量 */
  stockQuantity: number
  /** 计量单位 */
  unit: string
  /** 安全库存 */
  safetyStock?: number
  /** 存放位置 */
  storageLocation?: string
}

/**
 * 设备模型 Equipment
 * 对应 xDM-F 设计态实体：设备 / Equipment
 */
export interface Equipment extends XdmfBaseEntity {
  /** 设备编码（唯一） */
  equipmentCode: string
  /** 设备名称 */
  equipmentName: string
  /** 生产厂家 */
  manufacturer: string
  /** 品牌 */
  brand: string
  /** 规格型号 */
  model: string
  /** 供应商 */
  supplier: string
  /** 生产日期 */
  productionDate: string
  /** 使用年限（年） */
  serviceLife: number
  /** 折旧方式 */
  depreciationMethod: string
  /** 位置 */
  location: string
  /** 设备注册时分配的唯一标识符 */
  uuid: string
  /** 设备状态 */
  status?: string
  /** 扩展：技术参数信息 */
  technicalParams?: TechnicalParam[]
  /** 扩展：备品备件信息 */
  spareParts?: SparePart[]
  remark?: string
}

/** 设备查询条件 */
export interface EquipmentQuery {
  equipmentCode?: string
  equipmentName?: string
  manufacturer?: string
  brand?: string
  location?: string
}

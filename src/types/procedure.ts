import type { XdmfBaseEntity } from '@/api/xdmf/types'

/**
 * 工序模型 WorkingProcedure
 * 对应 xDM-F 设计态实体：工序 / WorkingProcedure
 */
export interface WorkingProcedure extends XdmfBaseEntity {
  /** 工序编号（唯一） */
  procedureCode: string
  /** 工序名称 */
  procedureName: string
  /** 生产步骤 */
  productionSteps: string
  /** 生产和检测设备 */
  productionInspectionEquipment: string
  /** 操作人员 */
  operator: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 工序序号（流程顺序） */
  sequence?: number
  /** 工序说明 */
  description?: string
  /** 工时（分钟） */
  workingHours?: number
}

/** 工序与设备关系 */
export interface ProcedureEquipmentRel extends XdmfBaseEntity {
  procedureId: string
  equipmentId: string
  /** 设备在该工序中的用途 */
  usageRemark?: string
}

/** 工序与物料关系 */
export interface ProcedureMaterialRel extends XdmfBaseEntity {
  procedureId: string
  materialId: string
  /** 投料数量 */
  quantity: number
}

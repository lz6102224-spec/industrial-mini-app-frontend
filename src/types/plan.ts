import type { XdmfBaseEntity } from '@/api/xdmf/types'

/**
 * 工艺（工艺路线）模型 WorkingPlan
 * 对应 xDM-F 设计态实体：工艺 / WorkingPlan
 */
export interface WorkingPlan extends XdmfBaseEntity {
  /** 工艺编号（唯一） */
  planCode: string
  /** 工艺名称 */
  planName: string
  /** 所属产品 */
  productName: string
  /** 版本号 */
  version: string
  /** 工艺描述 */
  description: string
  /** 操作人员 */
  operator: string
  /** 操作时间 */
  operationTime: string
  /** 设备使用情况 */
  equipmentUsage: string
  /** 状态：草稿 / 已发布 / 已归档 */
  status?: string
}

/**
 * 工艺与工序关联关系
 * 对应 xDM-F 关系实体：WorkingPlan_WorkingProcedure_Rel
 */
export interface PlanProcedureRel extends XdmfBaseEntity {
  planId: string
  procedureId: string
  /** 工序在工艺路线中的执行顺序 */
  sequenceOrder: number
  remark?: string
}

/** 工艺路线中的工序明细（联查后组装） */
export interface PlanProcedureItem {
  relId?: string
  procedureId: string
  procedureCode: string
  procedureName: string
  productionSteps?: string
  productionInspectionEquipment?: string
  operator?: string
  sequenceOrder: number
}

/** 工艺查询条件 */
export interface PlanQuery {
  planCode?: string
  planName?: string
  productName?: string
  version?: string
}

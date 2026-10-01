/**
 * xDM-F 实体名称常量
 * 必须与 xDM-F 设计态发布的实体英文名完全一致，否则 dynamic/api/{entityName} 会 404
 */

/** 数据实体（Data Entity） */
export const DATA_ENTITIES = {
  /** 设备 */
  Equipment: 'Equipment',
  /** 物料 / 部件 */
  Part: 'Part',
  /** 物料分类 */
  PartCategory: 'PartCategory',
  /** 物料版本 */
  PartVersion: 'PartVersion',
  /** 工序 */
  WorkingProcedure: 'WorkingProcedure',
  /** 工艺（工艺路线） */
  WorkingPlan: 'WorkingPlan'
} as const

/** 关系实体（Relationship Entity） */
export const RELATION_ENTITIES = {
  /** 物料 BOM 组成关系 */
  PartBomRel: 'Part_BOM_Rel',
  /** 工艺 - 工序 关联 */
  PlanProcedureRel: 'WorkingPlan_WorkingProcedure_Rel',
  /** 工序 - 设备 关联 */
  ProcedureEquipmentRel: 'WorkingProcedure_Equipment_Rel',
  /** 工序 - 物料 关联 */
  ProcedureMaterialRel: 'WorkingProcedure_Material_Rel'
} as const

export type DataEntityName = (typeof DATA_ENTITIES)[keyof typeof DATA_ENTITIES]
export type RelationEntityName = (typeof RELATION_ENTITIES)[keyof typeof RELATION_ENTITIES]

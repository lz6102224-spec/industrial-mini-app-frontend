import type { XdmfBaseEntity } from '@/api/xdmf/types'

/**
 * 物料模型 Part
 * 对应 xDM-F 设计态实体：部件 / Part
 */
export interface Part extends XdmfBaseEntity {
  /** 物料编号（唯一） */
  partCode: string
  /** 物料名称 */
  partName: string
  /** 规格型号 */
  model: string
  /** 库存数量 */
  stockQuantity: number
  /** 供应商 */
  supplier: string
  /** 所属分类（参考 PartCategory） */
  categoryId?: string
  /** 版本号 */
  version: string
  /** 计量单位 */
  unit?: string
  /** 物料描述 */
  description?: string
  /** 状态：启用 / 停用 */
  status?: string
  /** 是否自制件 */
  selfMade?: boolean
}

/** 物料分类（支持多级树形） */
export interface PartCategory extends XdmfBaseEntity {
  /** 分类编码 */
  categoryCode: string
  /** 分类名称 */
  categoryName: string
  /** 父分类 ID，空表示一级分类 */
  parentId?: string
  /** 排序 */
  sortOrder?: number
  description?: string
}

/** 物料版本记录 */
export interface PartVersion extends XdmfBaseEntity {
  /** 所属物料 ID */
  partId: string
  /** 版本号 */
  version: string
  /** 变更说明 */
  remark?: string
  /** 是否当前生效版本 */
  isCurrent?: boolean
}

/**
 * BOM 组成关系（Part 与 Part 之间的父子关系）
 * 对应 xDM-F 关系实体：Part_BOM_Rel
 */
export interface BomRel extends XdmfBaseEntity {
  /** 父物料 ID */
  parentPartId: string
  /** 子物料 ID */
  childPartId: string
  /** 用量 */
  quantity: number
  /** 装配顺序 */
  sequence: number
  /** 计量单位 */
  unit?: string
  remark?: string
}

/** BOM 树节点（前端组装） */
export interface BomTreeNode {
  key: string
  partId: string
  partCode: string
  partName: string
  model: string
  quantity: number
  unit?: string
  sequence?: number
  /** 是否为 BOM 根节点 */
  isRoot?: boolean
  children?: BomTreeNode[]
}

/** 物料查询条件 */
export interface PartQuery {
  partCode?: string
  partName?: string
  model?: string
  supplier?: string
  categoryId?: string
}

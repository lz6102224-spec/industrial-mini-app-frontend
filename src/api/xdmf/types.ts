/**
 * xDM-F 通用类型定义
 * 对齐华为 iDME 数据建模引擎（xDM-F）运行态动态数据服务的请求/响应形态
 */

/** 动态数据服务的原子操作 */
export type XdmfOp =
  | 'create'
  | 'batchCreate'
  | 'update'
  | 'batchUpdate'
  | 'delete'
  | 'batchDelete'
  | 'get'
  | 'batchGet'
  | 'list'
  | 'find'
  | 'query'
  | 'count'
  | 'select'
  | 'saveAs'
  | 'queryRelatedObjects'
  | 'batchQueryRelatedObjects'
  | 'queryRelationship'
  | 'queryTarget'
  | 'deleteTarget'

/** xDM-F 支持的查询运算符 */
export type XdmfOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'like'
  | 'in'
  | 'not in'
  | 'ISNULL'
  | 'NOTNULL'

/** 单条过滤条件 */
export interface XdmfCondition {
  conditionName: string
  operator: XdmfOperator
  conditionValues?: Array<string | number | boolean>
}

/** 组合过滤条件 */
export interface XdmfFilter {
  joiner: 'and' | 'or'
  conditions: XdmfCondition[]
}

/** 排序项 */
export interface XdmfSort {
  orderBy: string
  sort: 'ASC' | 'DESC'
}

/** find / query 的查询参数 */
export interface XdmfQueryParams {
  filter?: XdmfFilter
  sorts?: XdmfSort[]
  isNeedTotal?: boolean
  selectedFields?: string[]
  characterSet?: string
}

/** 所有实体共有的系统字段 */
export interface XdmfBaseEntity {
  id: string
  rdmVersion?: number
  rdmDeleteFlag?: number
  creator?: string
  createTime?: string
  lastModifiedBy?: string
  lastUpdateTime?: string
}

/** 分页信息 */
export interface XdmfPageInfo {
  totalCount: number
  totalPages: number
  pageSize: number
  currentPage: number
}

/** 归一化后的统一响应（页面层只消费这个结构） */
export interface NormalizedResult<T> {
  ok: boolean
  data: T
  pageInfo?: XdmfPageInfo
  message?: string
}

/** 原始响应外层可能出现的多种字段命名（不同版本 xDM-F 存在差异） */
export interface RawXdmfResponse<T = unknown> {
  code?: number | string
  result?: string
  msg?: string
  message?: string
  data?: T | T[]
  pageInfo?: Partial<XdmfPageInfo>
  errors?: Array<{ code?: string; message?: string }>
  requestId?: string
}

/** 请求配置 */
export interface RequestOptions {
  /** 是否静默（不弹全局错误提示） */
  silent?: boolean
  /** 自定义成功提示 */
  successMessage?: string
}

/** 通用业务类型 */
export interface Option<T = string> {
  label: string
  value: T
}

export interface TreeNode<T = Record<string, unknown>> {
  id: string
  label: string
  children?: TreeNode<T>[]
  raw?: T
}

/** 表格分页状态 */
export interface TablePageState {
  pageSize: number
  currentPage: number
  total: number
}

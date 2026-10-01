/** 通用组件类型定义 */

/** 可编辑表格的列配置 */
export interface EditableColumn {
  prop: string
  label: string
  type?: 'input' | 'number' | 'select'
  options?: Array<string | number>
  width?: string | number
  minWidth?: string | number
  placeholder?: string
}

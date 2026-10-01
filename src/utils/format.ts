/** 格式化工具 */

/** 日期时间格式化 */
export function formatDateTime(value?: string | number | Date, withTime = true): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return withTime ? `${base} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : base
}

/** 日期格式化（yyyy-MM-dd） */
export function formatDate(value?: string | number | Date): string {
  return formatDateTime(value, false)
}

/** 数值千分位 */
export function formatNumber(value?: number | string): string {
  if (value === undefined || value === null || value === '') return '-'
  const num = Number(value)
  return Number.isNaN(num) ? String(value) : num.toLocaleString('zh-CN')
}

/** 相对时间 */
export function fromNow(value?: string): string {
  if (!value) return '-'
  const diff = Date.now() - new Date(value).getTime()
  if (Number.isNaN(diff)) return '-'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return formatDate(value)
}

/** 导出文本文件（用于 API 列表 / 图谱数据下载） */
export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

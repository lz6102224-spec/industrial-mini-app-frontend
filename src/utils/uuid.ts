/** 生成符合 UUID v4 的唯一标识符 */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** 生成业务编码：前缀 + 序号，例如 EQ-CNC-007 */
export function nextCode(prefix: string, existing: string[], pad = 3): string {
  const numbers = existing
    .map((code) => {
      const matched = String(code).match(/(\d+)\s*$/)
      return matched ? Number(matched[1]) : 0
    })
    .filter((n) => !Number.isNaN(n))
  const max = numbers.length ? Math.max(...numbers) : 0
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}

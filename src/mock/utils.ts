/**
 * Mock 查询语义复刻
 * 与 xDM-F 动态数据服务的 filter / sorts / 分页行为保持一致
 */
import type { EntityRecord } from './db'

export interface MockCondition {
  conditionName: string
  operator: string
  conditionValues?: Array<string | number | boolean>
}

export interface MockFilter {
  joiner?: 'and' | 'or'
  conditions: MockCondition[]
}

export interface MockSort {
  orderBy: string
  sort?: 'ASC' | 'DESC'
}

/** 值比较：兼顾布尔 / 数值 / 字符串 */
function equals(actual: unknown, expected: unknown): boolean {
  if (actual === null || actual === undefined) return expected === null || expected === undefined
  if (typeof actual === 'boolean' || typeof expected === 'boolean') {
    return String(actual) === String(expected)
  }
  if (typeof actual === 'number' || typeof expected === 'number') {
    return Number(actual) === Number(expected)
  }
  return String(actual) === String(expected)
}

/** like 语义：支持 % 通配，忽略大小写 */
function likeMatch(actual: unknown, pattern: unknown): boolean {
  if (actual === null || actual === undefined) return false
  const text = String(actual).toLowerCase()
  const raw = String(pattern).toLowerCase()
  if (!raw.includes('%')) return text.includes(raw)
  const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*')
  return new RegExp(`^${escaped}$`, 'i').test(text)
}

export function matchCondition(record: EntityRecord, cond: MockCondition): boolean {
  const value = record[cond.conditionName]
  const values = cond.conditionValues ?? []
  switch (cond.operator) {
    case '=':
      return equals(value, values[0])
    case '!=':
      return !equals(value, values[0])
    case '>':
      return Number(value) > Number(values[0])
    case '>=':
      return Number(value) >= Number(values[0])
    case '<':
      return Number(value) < Number(values[0])
    case '<=':
      return Number(value) <= Number(values[0])
    case 'like':
      return likeMatch(value, values[0])
    case 'in':
      return values.some((v) => equals(value, v))
    case 'not in':
      return !values.some((v) => equals(value, v))
    case 'ISNULL':
      return value === null || value === undefined || value === ''
    case 'NOTNULL':
      return !(value === null || value === undefined || value === '')
    default:
      return true
  }
}

export function applyFilter(list: EntityRecord[], filter?: MockFilter): EntityRecord[] {
  if (!filter || !filter.conditions?.length) return list
  const joiner = filter.joiner ?? 'and'
  return list.filter((record) => {
    const results = filter.conditions.map((cond) => matchCondition(record, cond))
    return joiner === 'and' ? results.every(Boolean) : results.some(Boolean)
  })
}

export function applySorts(list: EntityRecord[], sorts?: MockSort[]): EntityRecord[] {
  if (!sorts?.length) return list
  const sorted = [...list]
  sorted.sort((a, b) => {
    for (const s of sorts) {
      const av = a[s.orderBy]
      const bv = b[s.orderBy]
      if (av === bv) continue
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'zh-CN')
      return (s.sort ?? 'ASC').toUpperCase() === 'DESC' ? -cmp : cmp
    }
    return 0
  })
  return sorted
}

export interface PageResult {
  list: EntityRecord[]
  pageInfo: {
    totalCount: number
    totalPages: number
    pageSize: number
    currentPage: number
  }
}

export function paginate(list: EntityRecord[], pageSize = 10, curPage = 1): PageResult {
  const totalCount = list.length
  const size = pageSize > 0 ? pageSize : totalCount || 1
  const totalPages = Math.max(1, Math.ceil(totalCount / size))
  const page = Math.min(Math.max(1, curPage), totalPages)
  const start = (page - 1) * size
  return {
    list: list.slice(start, start + size),
    pageInfo: { totalCount, totalPages, pageSize: size, currentPage: page }
  }
}

/**
 * Mock · 动态数据服务处理器
 * 复刻 xDM-F 数据实体 / 关系实体的原子操作语义
 */
import {
  getCollection,
  getRawCollection,
  persist,
  nextId,
  withSystemFields,
  type EntityRecord
} from '../db'
import { applyFilter, applySorts, paginate } from '../utils'
import { RELATION_ENTITIES } from '@/api/xdmf/entities'

export interface RawResponse {
  result: 'SUCCESS' | 'FAIL'
  data?: unknown
  pageInfo?: unknown
  errors?: Array<{ code?: string; message: string }>
}

const ok = (data: unknown = null, pageInfo?: unknown): RawResponse => ({
  result: 'SUCCESS',
  data,
  pageInfo,
  errors: []
})

const fail = (message: string, code = 'MOCK_ERROR'): RawResponse => ({
  result: 'FAIL',
  data: null,
  errors: [{ code, message }]
})

/** 各实体的唯一性字段 */
const UNIQUE_FIELDS: Record<string, string> = {
  Equipment: 'equipmentCode',
  Part: 'partCode',
  PartCategory: 'categoryCode',
  WorkingProcedure: 'procedureCode',
  WorkingPlan: 'planCode'
}

const RELATION_ENTITY_SET = new Set<string>(Object.values(RELATION_ENTITIES))

/** 关系实体不支持批量操作 */
const BATCH_OPS = new Set(['batchCreate', 'batchUpdate', 'batchDelete'])

function checkUnique(entity: string, record: EntityRecord, excludeId?: string): string | null {
  const field = UNIQUE_FIELDS[entity]
  if (!field) return null
  const value = record[field]
  if (value === undefined || value === null || value === '') return null
  const duplicated = getCollection(entity).some(
    (item) => String(item[field]) === String(value) && item.id !== excludeId
  )
  return duplicated ? `${field} 已存在：${value}` : null
}

/** 版本号自增：V1.0 -> V1.1；1.0 -> 1.1 */
function bumpVersion(version: string | undefined): string {
  if (!version) return 'V1.0'
  const matched = String(version).match(/^(V?)(\d+)\.(\d+)$/i)
  if (!matched) return `${version}.1`
  const [, prefix, major, minor] = matched
  return `${prefix}${major}.${Number(minor) + 1}`
}

/**
 * 处理动态数据服务请求
 * @param entity 实体英文名
 * @param op 原子操作
 * @param params 请求体中的 params
 * @param pageSize find 的路径分页参数
 * @param curPage find 的路径分页参数
 */
export function handleDynamic(
  entity: string,
  op: string,
  params: unknown,
  pageSize?: number,
  curPage?: number
): RawResponse {
  const isRelation = RELATION_ENTITY_SET.has(entity)
  if (isRelation && BATCH_OPS.has(op)) {
    return fail(`关系实体 ${entity} 不支持批量操作 ${op}，请逐条调用 create`, 'RELATION_NO_BATCH')
  }

  const p = (params ?? {}) as Record<string, unknown>

  switch (op) {
    case 'create': {
      const record = p as EntityRecord
      const dup = checkUnique(entity, record)
      if (dup) return fail(dup, 'DUPLICATE_KEY')
      const created = withSystemFields({ ...record, id: record.id || nextId() }, true)
      getRawCollection(entity).push(created)
      persist()
      return ok(created)
    }

    case 'batchCreate': {
      const list = (Array.isArray(params) ? params : (p.records as EntityRecord[])) || []
      if (!Array.isArray(list) || !list.length) return fail('批量新增数据为空', 'EMPTY_PAYLOAD')
      const createdList: EntityRecord[] = []
      for (const record of list) {
        const dup = checkUnique(entity, record)
        if (dup) return fail(dup, 'DUPLICATE_KEY')
        const created = withSystemFields({ ...record, id: record.id || nextId() }, true)
        getRawCollection(entity).push(created)
        createdList.push(created)
      }
      persist()
      return ok(createdList)
    }

    case 'update': {
      const record = p as EntityRecord
      if (!record.id) return fail('缺少主键 id', 'MISSING_ID')
      const list = getRawCollection(entity)
      const index = list.findIndex((item) => item.id === record.id)
      if (index < 0) return fail(`未找到数据：${record.id}`, 'NOT_FOUND')
      const dup = checkUnique(entity, { ...list[index], ...record }, record.id)
      if (dup) return fail(dup, 'DUPLICATE_KEY')
      const merged = withSystemFields(
        { ...list[index], ...record, createTime: list[index].createTime },
        false
      )
      merged.rdmVersion = Number(list[index].rdmVersion ?? 1) + 1
      list[index] = merged
      persist()
      return ok(merged)
    }

    case 'batchUpdate': {
      const list = (Array.isArray(params) ? params : (p.records as EntityRecord[])) || []
      if (!Array.isArray(list) || !list.length) return fail('批量更新数据为空', 'EMPTY_PAYLOAD')
      const updated: EntityRecord[] = []
      const store = getRawCollection(entity)
      for (const record of list) {
        const index = store.findIndex((item) => item.id === record.id)
        if (index < 0) return fail(`未找到数据：${record.id}`, 'NOT_FOUND')
        const merged = withSystemFields(
          { ...store[index], ...record, createTime: store[index].createTime },
          false
        )
        merged.rdmVersion = Number(store[index].rdmVersion ?? 1) + 1
        store[index] = merged
        updated.push(merged)
      }
      persist()
      return ok(updated)
    }

    case 'delete': {
      const id = String(p.id ?? '')
      if (!id) return fail('缺少主键 id', 'MISSING_ID')
      const list = getRawCollection(entity)
      const target = list.find((item) => item.id === id)
      if (!target) return fail(`未找到数据：${id}`, 'NOT_FOUND')
      // 软删除，与 xDM-F 语义一致
      target.rdmDeleteFlag = 1
      target.lastUpdateTime = new Date().toISOString()
      persist()
      return ok(target)
    }

    case 'batchDelete': {
      const ids = (p.ids as string[]) || (Array.isArray(params) ? (params as string[]) : [])
      if (!ids?.length) return fail('缺少待删除的 ids', 'MISSING_ID')
      const list = getRawCollection(entity)
      const deleted: EntityRecord[] = []
      for (const id of ids) {
        const target = list.find((item) => item.id === id)
        if (target) {
          target.rdmDeleteFlag = 1
          target.lastUpdateTime = new Date().toISOString()
          deleted.push(target)
        }
      }
      persist()
      return ok(deleted)
    }

    case 'get': {
      const id = String(p.id ?? '')
      const target = getCollection(entity).find((item) => item.id === id)
      return target ? ok(target) : fail(`未找到数据：${id}`, 'NOT_FOUND')
    }

    case 'batchGet': {
      const ids = (p.ids as string[]) || []
      const list = getCollection(entity).filter((item) => ids.includes(item.id))
      return ok(list)
    }

    case 'list': {
      const ids = (p.ids as string[]) || []
      const all = getCollection(entity)
      return ok(ids.length ? all.filter((item) => ids.includes(item.id)) : all)
    }

    case 'find': {
      let list = getCollection(entity)
      list = applyFilter(list, p.filter as never)
      list = applySorts(list, (p.sorts as never) || [{ orderBy: 'createTime', sort: 'DESC' }])
      const result = paginate(list, Number(pageSize) || 10, Number(curPage) || 1)
      return ok(result.list, result.pageInfo)
    }

    case 'query': {
      let list = getCollection(entity)
      list = applyFilter(list, p.filter as never)
      list = applySorts(list, (p.sorts as never) || [])
      return ok(list)
    }

    case 'count': {
      let list = getCollection(entity)
      list = applyFilter(list, p.filter as never)
      return ok(list.length)
    }

    case 'select': {
      let list = getCollection(entity)
      list = applyFilter(list, p.filter as never)
      const fields = (p.selectedFields as string[]) || []
      if (fields.length) {
        list = list.map((item) => {
          const picked: EntityRecord = { id: item.id }
          fields.forEach((f) => (picked[f] = item[f]))
          return picked
        })
      }
      return ok(list)
    }

    case 'saveAs': {
      // 版本升级：复制一条新记录，版本号自增
      const id = String(p.id ?? '')
      const source = getCollection(entity).find((item) => item.id === id)
      if (!source) return fail(`未找到数据：${id}`, 'NOT_FOUND')
      const { id: _omit, ...rest } = source
      const newVersion = (p.version as string) || bumpVersion(source.version as string)
      const created = withSystemFields(
        {
          ...rest,
          ...p,
          id: nextId(),
          version: newVersion,
          rdmVersion: 1
        } as EntityRecord,
        true
      )
      delete (created as Record<string, unknown>).version_
      getRawCollection(entity).push(created)
      persist()
      return ok(created)
    }

    case 'queryRelatedObjects':
    case 'batchQueryRelatedObjects': {
      const objectId = String(p.objectId ?? '')
      const relatedEntityName = String(p.relatedEntityName ?? '')
      const relatedIds = String(p.relatedObjectIds ?? '')
        .split(',')
        .filter(Boolean)
      let list = getCollection(entity)
      if (objectId) {
        list = list.filter(
          (item) => item.sourceId === objectId || item.targetId === objectId || item.id === objectId
        )
      }
      if (relatedIds.length) {
        list = list.filter((item) => relatedIds.includes(String(item.targetId)))
      }
      if (relatedEntityName) {
        list = list.filter((item) => item.targetEntity === relatedEntityName)
      }
      return ok(list)
    }

    default:
      return fail(`不支持的原子操作：${op}`, 'UNSUPPORTED_OP')
  }
}

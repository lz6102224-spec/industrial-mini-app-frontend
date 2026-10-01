/**
 * Mock 内存数据库
 * 复刻 xDM-F 的数据存储语义：系统字段、软删除（rdmDeleteFlag）、持久化到 localStorage
 */

export interface EntityRecord {
  id: string
  rdmVersion?: number
  rdmDeleteFlag?: number
  creator?: string
  createTime?: string
  lastModifiedBy?: string
  lastUpdateTime?: string
  [key: string]: unknown
}

export type CollectionMap = Record<string, EntityRecord[]>

const STORAGE_KEY = 'xdmf_mock_db_v1'

let db: CollectionMap = {}
let loaded = false

/** 生成 xDM-F 风格的雪花式 ID（数字字符串） */
let seq = Math.floor(Math.random() * 1000)
export function nextId(): string {
  seq += 1
  return `${Date.now()}${String(seq % 100000).padStart(5, '0')}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** 补齐系统字段 */
export function withSystemFields<T extends Partial<EntityRecord>>(
  record: T,
  isCreate = true
): EntityRecord {
  const base: EntityRecord = {
    id: record.id || nextId(),
    rdmVersion: record.rdmVersion ?? 1,
    rdmDeleteFlag: record.rdmDeleteFlag ?? 0,
    creator: record.creator ?? 'admin',
    createTime: record.createTime ?? nowIso(),
    lastModifiedBy: 'admin',
    lastUpdateTime: nowIso()
  }
  const merged = { ...record, ...base } as EntityRecord
  if (!isCreate) {
    merged.createTime = record.createTime ?? base.createTime
  }
  return merged
}

function readStorage(): CollectionMap | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CollectionMap) : null
  } catch {
    return null
  }
}

/** 初始化数据库：优先读本地缓存，否则灌入种子数据 */
export function initDb(seeds: CollectionMap) {
  if (loaded) return
  loaded = true
  const cached = readStorage()
  if (cached && cached.__seeded) {
    db = cached
    delete (db as Record<string, unknown>).__seeded
    return
  }
  db = JSON.parse(JSON.stringify(seeds)) as CollectionMap
  persist()
}

/** 重置为种子数据（界面上提供「重置演示数据」入口） */
export function resetDb(seeds: CollectionMap) {
  db = JSON.parse(JSON.stringify(seeds)) as CollectionMap
  loaded = true
  persist()
}

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...db, __seeded: true }))
  } catch {
    /* 忽略容量或隐私模式异常 */
  }
}

/** 获取集合（不包含软删除数据，与 xDM-F 原子接口默认行为一致） */
export function getCollection(entity: string): EntityRecord[] {
  if (!db[entity]) db[entity] = []
  return db[entity].filter((item) => Number(item.rdmDeleteFlag ?? 0) === 0)
}

/** 获取集合（含软删除，内部使用） */
export function getRawCollection(entity: string): EntityRecord[] {
  if (!db[entity]) db[entity] = []
  return db[entity]
}

export function setCollection(entity: string, list: EntityRecord[]) {
  db[entity] = list
}

export function getAllCollections(): CollectionMap {
  return db
}

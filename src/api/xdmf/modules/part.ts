/** 物料管理 API（物料 / 分类 / 版本 / BOM） */
import { DATA_ENTITIES, RELATION_ENTITIES } from '../entities'
import {
  createOne,
  deleteOne,
  findAll,
  findPage,
  orderBy,
  saveAs,
  updateOne,
  where,
  countAll
} from '../request'
import type { XdmfQueryParams } from '../types'
import type { BomRel, Part, PartCategory, PartQuery, PartVersion } from '@/types/part'

const PART = DATA_ENTITIES.Part
const CATEGORY = DATA_ENTITIES.PartCategory
const VERSION = DATA_ENTITIES.PartVersion
const BOM_REL = RELATION_ENTITIES.PartBomRel

// ==================== 物料 ====================

function buildPartQuery(query: PartQuery = {}): XdmfQueryParams {
  const conditions = []
  if (query.partCode) conditions.push(where.like('partCode', query.partCode))
  if (query.partName) conditions.push(where.like('partName', query.partName))
  if (query.model) conditions.push(where.like('model', query.model))
  if (query.supplier) conditions.push(where.like('supplier', query.supplier))
  if (query.categoryId) conditions.push(where.eq('categoryId', query.categoryId))

  return {
    filter: conditions.length ? where.and(conditions) : undefined,
    sorts: [orderBy('createTime', 'DESC')],
    isNeedTotal: true
  }
}

/** 分页查询物料（支持按物料编码、名称等属性搜索） */
export function listParts(query: PartQuery = {}, pageSize = 10, curPage = 1) {
  return findPage<Part>(PART, buildPartQuery(query), pageSize, curPage)
}

/** 查询全部物料 */
export function listAllParts() {
  return findAll<Part>(PART, { sorts: [orderBy('partCode', 'ASC')] })
}

/** 新增物料 */
export function createPart(data: Partial<Part>) {
  return createOne<Part>(PART, data as Record<string, unknown>, { successMessage: '物料新增成功' })
}

/** 修改物料 */
export function updatePart(data: Partial<Part>) {
  return updateOne<Part>(PART, data as Record<string, unknown>, { successMessage: '物料修改成功' })
}

/** 删除物料 */
export function deletePart(id: string) {
  return deleteOne<Part>(PART, id, { successMessage: '物料已删除' })
}

/** 统计物料总数 */
export function countParts() {
  return countAll(PART)
}

/** 物料版本升级（另存为新版本） */
export function savePartAsNewVersion(part: Partial<Part>, newVersion: string, remark?: string) {
  return saveAs<Part>(
    PART,
    { ...part, version: newVersion },
    { successMessage: `已升级至 ${newVersion}` }
  ).then(async (result) => {
    if (result.ok && result.data && part.id) {
      await createPartVersion({
        partId: part.id,
        version: newVersion,
        remark: remark || '版本升级',
        isCurrent: true
      })
    }
    return result
  })
}

// ==================== 物料分类 ====================

/** 查询全部分类（用于构建分类树） */
export function listCategories() {
  return findAll<PartCategory>(CATEGORY, { sorts: [orderBy('sortOrder', 'ASC')] })
}

/** 新增分类 */
export function createCategory(data: Partial<PartCategory>) {
  return createOne<PartCategory>(CATEGORY, data as Record<string, unknown>, {
    successMessage: '分类新增成功'
  })
}

/** 修改分类 */
export function updateCategory(data: Partial<PartCategory>) {
  return updateOne<PartCategory>(CATEGORY, data as Record<string, unknown>, {
    successMessage: '分类修改成功'
  })
}

/** 删除分类 */
export function deleteCategory(id: string) {
  return deleteOne<PartCategory>(CATEGORY, id, { successMessage: '分类已删除' })
}

// ==================== 物料版本 ====================

/** 查询某物料的版本历史 */
export function listPartVersions(partId: string) {
  return findAll<PartVersion>(
    VERSION,
    {
      filter: where.and([where.eq('partId', partId)]),
      sorts: [orderBy('createTime', 'DESC')]
    },
    { silent: true }
  )
}

/** 新增版本记录 */
export function createPartVersion(data: Partial<PartVersion>) {
  return createOne<PartVersion>(VERSION, data as Record<string, unknown>)
}

// ==================== BOM ====================

/** 查询全部 BOM 关系 */
export function listBomRelations(parentPartId?: string) {
  const conditions = parentPartId ? [where.eq('parentPartId', parentPartId)] : []
  return findAll<BomRel>(BOM_REL, {
    filter: conditions.length ? where.and(conditions) : undefined,
    sorts: [orderBy('sequence', 'ASC')]
  })
}

/**
 * 构建 BOM：新增父子物料组成关系
 * 关系实体不支持批量，故逐条调用 create
 */
export async function createBomRelation(data: Partial<BomRel>) {
  return createOne<BomRel>(BOM_REL, data as Record<string, unknown>, {
    successMessage: 'BOM 关系已建立'
  })
}

/** 批量构建 BOM（逐条循环，因关系实体不支持批量接口） */
export async function createBomRelations(list: Array<Partial<BomRel>>) {
  const results = []
  for (const item of list) {
    results.push(await createBomRelation(item))
  }
  const failed = results.filter((r) => !r.ok)
  return { ok: failed.length === 0, failedCount: failed.length, total: list.length }
}

/** 删除 BOM 关系 */
export function deleteBomRelation(id: string) {
  return deleteOne<BomRel>(BOM_REL, id, { successMessage: 'BOM 关系已删除' })
}

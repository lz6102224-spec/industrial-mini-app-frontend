/** 工序管理 API */
import { DATA_ENTITIES, RELATION_ENTITIES } from '../entities'
import {
  batchDelete,
  countAll,
  createOne,
  deleteOne,
  findAll,
  findPage,
  orderBy,
  updateOne,
  where
} from '../request'
import type { XdmfQueryParams } from '../types'
import type {
  ProcedureEquipmentRel,
  ProcedureMaterialRel,
  WorkingProcedure
} from '@/types/procedure'

const ENTITY = DATA_ENTITIES.WorkingProcedure
const EQ_REL = RELATION_ENTITIES.ProcedureEquipmentRel
const MAT_REL = RELATION_ENTITIES.ProcedureMaterialRel

export interface ProcedureQuery {
  procedureCode?: string
  procedureName?: string
  operator?: string
}

function buildQuery(query: ProcedureQuery = {}): XdmfQueryParams {
  const conditions = []
  if (query.procedureCode) conditions.push(where.like('procedureCode', query.procedureCode))
  if (query.procedureName) conditions.push(where.like('procedureName', query.procedureName))
  if (query.operator) conditions.push(where.like('operator', query.operator))

  return {
    filter: conditions.length ? where.and(conditions) : undefined,
    sorts: [orderBy('sequence', 'ASC')],
    isNeedTotal: true
  }
}

/** 分页查询工序 */
export function listProcedures(query: ProcedureQuery = {}, pageSize = 10, curPage = 1) {
  return findPage<WorkingProcedure>(ENTITY, buildQuery(query), pageSize, curPage)
}

/** 查询全部工序（按流程顺序） */
export function listAllProcedures() {
  return findAll<WorkingProcedure>(ENTITY, { sorts: [orderBy('sequence', 'ASC')] })
}

/** 新增工序 */
export function createProcedure(data: Partial<WorkingProcedure>) {
  return createOne<WorkingProcedure>(ENTITY, data as Record<string, unknown>, {
    successMessage: '工序新增成功'
  })
}

/** 修改工序 */
export function updateProcedure(data: Partial<WorkingProcedure>) {
  return updateOne<WorkingProcedure>(ENTITY, data as Record<string, unknown>, {
    successMessage: '工序修改成功'
  })
}

/** 删除工序 */
export function deleteProcedure(id: string) {
  return deleteOne<WorkingProcedure>(ENTITY, id, { successMessage: '工序已删除' })
}

/** 批量删除工序 */
export function batchDeleteProcedures(ids: string[]) {
  return batchDelete<WorkingProcedure>(ENTITY, ids, { successMessage: `已删除 ${ids.length} 道工序` })
}

/** 统计工序总数 */
export function countProcedures() {
  return countAll(ENTITY)
}

/** 批量初始化工序（逐条 create） */
export async function batchCreateProcedures(list: Array<Partial<WorkingProcedure>>) {
  const results = []
  for (const item of list) {
    results.push(await createOne<WorkingProcedure>(ENTITY, item as Record<string, unknown>, { silent: true }))
  }
  const succeeded = results.filter((r) => r.ok).length
  return { ok: succeeded === list.length, succeeded, total: list.length }
}

// ==================== 工序关联关系 ====================

/** 关联工序与设备 */
export function createProcedureEquipmentRel(data: Partial<ProcedureEquipmentRel>) {
  return createOne<ProcedureEquipmentRel>(EQ_REL, data as Record<string, unknown>, {
    successMessage: '工序-设备关联成功'
  })
}

/** 关联工序与物料 */
export function createProcedureMaterialRel(data: Partial<ProcedureMaterialRel>) {
  return createOne<ProcedureMaterialRel>(MAT_REL, data as Record<string, unknown>, {
    successMessage: '工序-物料关联成功'
  })
}

/** 查询工序-设备关系 */
export function listProcedureEquipmentRels() {
  return findAll<ProcedureEquipmentRel>(EQ_REL, {}, { silent: true })
}

/** 查询工序-物料关系 */
export function listProcedureMaterialRels() {
  return findAll<ProcedureMaterialRel>(MAT_REL, {}, { silent: true })
}

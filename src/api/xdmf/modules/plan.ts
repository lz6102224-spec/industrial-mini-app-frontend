/** 工艺路线管理 API */
import { DATA_ENTITIES, RELATION_ENTITIES } from '../entities'
import {
  countAll,
  createOne,
  deleteOne,
  findAll,
  findPage,
  getById,
  orderBy,
  updateOne,
  where
} from '../request'
import type { XdmfQueryParams } from '../types'
import type { PlanProcedureRel, PlanQuery, WorkingPlan } from '@/types/plan'

const ENTITY = DATA_ENTITIES.WorkingPlan
const REL = RELATION_ENTITIES.PlanProcedureRel

function buildQuery(query: PlanQuery = {}): XdmfQueryParams {
  const conditions = []
  if (query.planCode) conditions.push(where.like('planCode', query.planCode))
  if (query.planName) conditions.push(where.like('planName', query.planName))
  if (query.productName) conditions.push(where.like('productName', query.productName))
  if (query.version) conditions.push(where.like('version', query.version))

  return {
    filter: conditions.length ? where.and(conditions) : undefined,
    sorts: [orderBy('createTime', 'DESC')],
    isNeedTotal: true
  }
}

/** 分页查询工艺路线 */
export function listPlans(query: PlanQuery = {}, pageSize = 10, curPage = 1) {
  return findPage<WorkingPlan>(ENTITY, buildQuery(query), pageSize, curPage)
}

/** 工艺路线详情 */
export function getPlan(id: string) {
  return getById<WorkingPlan>(ENTITY, id)
}

/** 新增工艺路线 */
export function createPlan(data: Partial<WorkingPlan>) {
  return createOne<WorkingPlan>(ENTITY, data as Record<string, unknown>, {
    successMessage: '工艺路线新增成功'
  })
}

/** 修改工艺路线 */
export function updatePlan(data: Partial<WorkingPlan>) {
  return updateOne<WorkingPlan>(ENTITY, data as Record<string, unknown>, {
    successMessage: '工艺路线修改成功'
  })
}

/** 删除工艺路线 */
export function deletePlan(id: string) {
  return deleteOne<WorkingPlan>(ENTITY, id, { successMessage: '工艺路线已删除' })
}

/** 统计工艺路线总数 */
export function countPlans() {
  return countAll(ENTITY)
}

// ==================== 工艺 - 工序 关联 ====================

/** 查询某工艺路线已关联的工序关系 */
export function listPlanProcedureRels(planId: string) {
  return findAll<PlanProcedureRel>(
    REL,
    {
      filter: where.and([where.eq('planId', planId)]),
      sorts: [orderBy('sequenceOrder', 'ASC')]
    },
    { silent: true }
  )
}

/** 查询全部工艺-工序关系 */
export function listAllPlanProcedureRels() {
  return findAll<PlanProcedureRel>(REL, { sorts: [orderBy('sequenceOrder', 'ASC')] }, { silent: true })
}

/** 新增工艺-工序关联（关系实体不支持批量，逐条调用） */
export function createPlanProcedureRel(data: Partial<PlanProcedureRel>) {
  return createOne<PlanProcedureRel>(REL, data as Record<string, unknown>)
}

/** 删除工艺-工序关联 */
export function deletePlanProcedureRel(id: string) {
  return deleteOne<PlanProcedureRel>(REL, id)
}

/**
 * 保存工艺路线的工序编排
 * 先清空原有关系，再按顺序逐条建立新关系（关系实体不支持批量操作）
 */
export async function savePlanProcedures(planId: string, procedureIds: string[]) {
  const existing = await listPlanProcedureRels(planId)
  if (existing.ok && existing.data?.length) {
    for (const rel of existing.data) {
      await deletePlanProcedureRel(rel.id)
    }
  }
  let index = 0
  for (const procedureId of procedureIds) {
    index += 1
    await createPlanProcedureRel({ planId, procedureId, sequenceOrder: index })
  }
  return { ok: true, count: procedureIds.length }
}

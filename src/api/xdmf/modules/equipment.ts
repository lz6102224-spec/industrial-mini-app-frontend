/** 设备管理 API */
import { DATA_ENTITIES } from '../entities'
import {
  batchDelete,
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
import type { Equipment, EquipmentQuery } from '@/types/equipment'

const ENTITY = DATA_ENTITIES.Equipment

function buildQuery(query: EquipmentQuery = {}): XdmfQueryParams {
  const conditions = []
  if (query.equipmentCode) conditions.push(where.like('equipmentCode', query.equipmentCode))
  if (query.equipmentName) conditions.push(where.like('equipmentName', query.equipmentName))
  if (query.manufacturer) conditions.push(where.like('manufacturer', query.manufacturer))
  if (query.brand) conditions.push(where.like('brand', query.brand))
  if (query.location) conditions.push(where.like('location', query.location))

  return {
    filter: conditions.length ? where.and(conditions) : undefined,
    sorts: [orderBy('createTime', 'DESC')],
    isNeedTotal: true
  }
}

/** 分页查询设备 */
export function listEquipments(query: EquipmentQuery = {}, pageSize = 10, curPage = 1) {
  return findPage<Equipment>(ENTITY, buildQuery(query), pageSize, curPage)
}

/** 查询全部设备（下拉选择用） */
export function listAllEquipments() {
  return findAll<Equipment>(ENTITY, { sorts: [orderBy('equipmentCode', 'ASC')] })
}

/** 设备详情 */
export function getEquipment(id: string) {
  return getById<Equipment>(ENTITY, id)
}

/** 新增设备 */
export function createEquipment(data: Partial<Equipment>) {
  return createOne<Equipment>(ENTITY, data as Record<string, unknown>, { successMessage: '设备新增成功' })
}

/** 修改设备 */
export function updateEquipment(data: Partial<Equipment>) {
  return updateOne<Equipment>(ENTITY, data as Record<string, unknown>, { successMessage: '设备修改成功' })
}

/** 删除设备 */
export function deleteEquipment(id: string) {
  return deleteOne<Equipment>(ENTITY, id, { successMessage: '设备已删除' })
}

/** 批量删除设备 */
export function batchDeleteEquipments(ids: string[]) {
  return batchDelete<Equipment>(ENTITY, ids, { successMessage: `已删除 ${ids.length} 台设备` })
}

/** 统计设备总数 */
export function countEquipments() {
  return countAll(ENTITY)
}

/**
 * xDM-F 请求客户端
 * - 注入鉴权头
 * - 归一化响应
 * - 统一错误提示
 * - 提供语义化的原子操作封装
 */
import axios, { AxiosError, type AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { DYNAMIC_API_PREFIX, XDMF_BASE_URL, XDMF_CONFIG } from './config'
import { normalizeResponse, resolveAdapter } from './adapter'
import type {
  NormalizedResult,
  RequestOptions,
  XdmfFilter,
  XdmfQueryParams,
  XdmfSort
} from './types'

export const http: AxiosInstance = axios.create({
  baseURL: XDMF_BASE_URL,
  timeout: XDMF_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
  adapter: resolveAdapter()
})

/** 请求拦截：注入 xDM-F 鉴权信息 */
http.interceptors.request.use(
  (config) => {
    if (XDMF_CONFIG.token) {
      config.headers.set('X-Auth-Token', XDMF_CONFIG.token)
    }
    if (XDMF_CONFIG.projectId) {
      config.headers.set('X-Project-Id', XDMF_CONFIG.projectId)
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** 响应拦截：归一化外层结构 */
http.interceptors.response.use(
  (response) => {
    response.data = normalizeResponse(response.data)
    return response
  },
  (error: AxiosError) => {
    let message = '网络异常，请检查 xDM-F 运行态服务是否可用'
    if (error.code === 'ECONNABORTED') message = '请求超时，请稍后重试'
    else if (error.response) {
      const status = error.response.status
      if (status === 401 || status === 403) message = '鉴权失败：X-Auth-Token 无效或已过期（有效期 24 小时）'
      else if (status === 404) message = '接口不存在：请确认实体英文名与 xDM-F 设计态发布名称一致'
      else message = `请求失败（HTTP ${status}）`
    }
    return Promise.reject({ ok: false, data: null, message } as NormalizedResult<null>)
  }
)

export interface DynamicCallOptions extends RequestOptions {
  /** find 操作的路径分页参数 */
  pageSize?: number
  curPage?: number
}

/**
 * 调用 xDM-F 动态数据服务
 * @param entity 实体英文名
 * @param op 原子操作
 * @param params 请求参数（会自动包进 {"params": {...}}）
 */
export async function dynamicApi<T = unknown>(
  entity: string,
  op: string,
  params: unknown = {},
  options: DynamicCallOptions = {}
): Promise<NormalizedResult<T>> {
  const path = `${DYNAMIC_API_PREFIX}/${entity}/${op}${
    options.pageSize !== undefined && options.curPage !== undefined
      ? `/${options.pageSize}/${options.curPage}`
      : ''
  }`

  try {
    const response = await http.post(path, { params })
    const result = response.data as NormalizedResult<T>
    if (!result.ok && !options.silent) {
      ElMessage.error(result.message || '操作失败')
    }
    if (result.ok && options.successMessage) {
      ElMessage.success(options.successMessage)
    }
    return result
  } catch (error) {
    const failed = error as NormalizedResult<null>
    const result: NormalizedResult<T> = {
      ok: false,
      data: null as unknown as T,
      message: failed?.message || '请求失败'
    }
    if (!options.silent) ElMessage.error(result.message!)
    return result
  }
}

// ==================== 语义化封装 ====================

/** 条件构造器 */
export const where = {
  and: (conditions: XdmfFilter['conditions']): XdmfFilter => ({ joiner: 'and', conditions }),
  or: (conditions: XdmfFilter['conditions']): XdmfFilter => ({ joiner: 'or', conditions }),
  /** 模糊匹配 */
  like: (field: string, value: string) => ({
    conditionName: field,
    operator: 'like' as const,
    conditionValues: [`%${value}%`]
  }),
  /** 精确匹配 */
  eq: (field: string, value: string | number | boolean) => ({
    conditionName: field,
    operator: '=' as const,
    conditionValues: [value]
  }),
  /** 非空 */
  notNull: (field: string) => ({
    conditionName: field,
    operator: 'NOTNULL' as const
  })
}

/** 分页查询 */
export function findPage<T>(
  entity: string,
  payload: XdmfQueryParams = {},
  pageSize = 10,
  curPage = 1,
  options: RequestOptions = {}
) {
  return dynamicApi<T[]>(entity, 'find', payload, { ...options, pageSize, curPage })
}

/** 全量查询（自动取足够大的分页） */
export function findAll<T>(entity: string, payload: XdmfQueryParams = {}, options: RequestOptions = {}) {
  return dynamicApi<T[]>(entity, 'find', { isNeedTotal: false, ...payload }, {
    ...options,
    pageSize: 9999,
    curPage: 1
  })
}

/** 按 ID 查询 */
export function getById<T>(entity: string, id: string, options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'get', { id }, options)
}

/** 新增 */
export function createOne<T>(entity: string, data: Record<string, unknown>, options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'create', data, options)
}

/** 修改 */
export function updateOne<T>(entity: string, data: Record<string, unknown>, options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'update', data, options)
}

/** 删除（软删除） */
export function deleteOne<T>(entity: string, id: string, options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'delete', { id }, options)
}

/** 批量删除 */
export function batchDelete<T>(entity: string, ids: string[], options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'batchDelete', { ids }, options)
}

/** 统计数量 */
export function countAll(entity: string, filter?: XdmfFilter, options: RequestOptions = {}) {
  return dynamicApi<number>(entity, 'count', { filter }, { ...options, silent: true })
}

/** 另存为（版本升级） */
export function saveAs<T>(entity: string, data: Record<string, unknown>, options: RequestOptions = {}) {
  return dynamicApi<T>(entity, 'saveAs', data, options)
}

/** 排序辅助 */
export const orderBy = (field: string, sort: 'ASC' | 'DESC' = 'DESC'): XdmfSort => ({
  orderBy: field,
  sort
})

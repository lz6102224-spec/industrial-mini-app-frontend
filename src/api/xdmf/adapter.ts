/**
 * 响应适配器
 * 1) 提供自定义 axios adapter，实现 Mock 与真实 xDM-F 的一键切换
 * 2) 把不同版本的 xDM-F 响应外层统一归一化
 */
import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { XDMF_CONFIG } from './config'
import { mockDispatch } from '@/mock'
import type { NormalizedResult, RawXdmfResponse } from './types'

/** 判定响应是否为成功 */
function isSuccess(raw: RawXdmfResponse): boolean {
  const errors = Array.isArray(raw.errors) ? raw.errors : []
  if (errors.length > 0) return false
  if (raw.result !== undefined) return String(raw.result).toUpperCase() === 'SUCCESS'
  if (raw.code !== undefined) {
    const code = String(raw.code).toUpperCase()
    return code === '0' || code === '200' || code === 'SUCCESS'
  }
  // 无任何状态标识时，有 data 即视为成功
  return raw.data !== undefined
}

/** 归一化任意 xDM-F 响应为统一结构 */
export function normalizeResponse<T = unknown>(raw: unknown): NormalizedResult<T> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, data: null as unknown as T, message: '响应数据格式异常' }
  }
  const res = raw as RawXdmfResponse<T>
  const okFlag = isSuccess(res as RawXdmfResponse)
  const message =
    res.errors?.[0]?.message || res.msg || res.message || (okFlag ? '' : 'xDM-F 接口返回失败')
  return {
    ok: okFlag,
    data: (res.data ?? null) as T,
    pageInfo: res.pageInfo
      ? {
          totalCount: Number(res.pageInfo.totalCount ?? 0),
          totalPages: Number(res.pageInfo.totalPages ?? 1),
          pageSize: Number(res.pageInfo.pageSize ?? 10),
          currentPage: Number(res.pageInfo.currentPage ?? 1)
        }
      : undefined,
    message
  }
}

/**
 * 自定义 axios adapter —— Mock 模式的数据入口
 * 不发真实网络请求，直接调用本地 Mock 引擎，但请求/响应结构与真实完全一致
 */
export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const url = config.url || ''
  let body: Record<string, unknown> = {}
  if (typeof config.data === 'string') {
    try {
      body = JSON.parse(config.data)
    } catch {
      body = {}
    }
  } else if (config.data && typeof config.data === 'object') {
    body = config.data as Record<string, unknown>
  }

  const raw = await mockDispatch({ url, method: config.method, body })

  const response = {
    data: raw,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config as AxiosRequestConfig,
    request: { mock: true }
  } as AxiosResponse

  return response
}

/** 依据当前配置选择实际使用的 adapter */
export function resolveAdapter(): AxiosAdapter | undefined {
  return XDMF_CONFIG.useMock ? mockAdapter : undefined
}

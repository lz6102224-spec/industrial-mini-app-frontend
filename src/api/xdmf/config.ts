/**
 * xDM-F 运行态连接配置
 * 所有可配置项均来自 .env 文件，便于 Mock / 真实环境一键切换
 */

function readEnv(key: string, fallback = ''): string {
  const value = (import.meta.env as Record<string, unknown>)[key]
  return value === undefined || value === null ? fallback : String(value)
}

export const XDMF_CONFIG = {
  /** 运行态服务地址 */
  endpoint: readEnv('VITE_XDMF_ENDPOINT', 'http://127.0.0.1:8080'),
  /** 运行态环境 ID */
  envId: readEnv('VITE_XDMF_ENV_ID', 'env-01'),
  /** 应用英文名 */
  appId: readEnv('VITE_XDMF_APP_ID', 'IndustrialMiniAPP'),
  /** 鉴权 Token */
  token: readEnv('VITE_XDMF_TOKEN', ''),
  /** 专属云 ProjectId */
  projectId: readEnv('VITE_XDMF_PROJECT_ID', ''),
  /** 请求超时 */
  timeout: Number(readEnv('VITE_REQUEST_TIMEOUT', '15000')),
  /** 是否启用内置 Mock */
  useMock: readEnv('VITE_USE_MOCK', 'true') === 'true'
}

/**
 * xDM-F 运行态基础路径：{endpoint}/{envId}/rdm_{appId}_app
 * 生产环境若与业务层同源部署，可置空 endpoint 走相对路径
 */
export const XDMF_BASE_URL = `${XDMF_CONFIG.endpoint.replace(/\/+$/, '')}/${XDMF_CONFIG.envId}/rdm_${XDMF_CONFIG.appId}_app`

/** 动态数据服务前缀 */
export const DYNAMIC_API_PREFIX = '/services/dynamic/api'

/** 当前数据源描述，用于界面角标提示 */
export const DATA_SOURCE_LABEL = XDMF_CONFIG.useMock ? 'Mock 内置数据' : 'xDM-F 运行态'

/** 可在运行时覆盖 Token（例如联调时手动填写） */
export function setToken(token: string) {
  XDMF_CONFIG.token = token
  try {
    localStorage.setItem('xdmf_token', token)
  } catch {
    /* ignore */
  }
}

export function restoreToken() {
  try {
    const cached = localStorage.getItem('xdmf_token')
    if (cached) XDMF_CONFIG.token = cached
  } catch {
    /* ignore */
  }
}

restoreToken()

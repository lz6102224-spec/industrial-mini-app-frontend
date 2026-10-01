/**
 * Mock 引擎入口
 * 解析 xDM-F 动态数据服务 URL，分发到对应的处理器
 */
import { initDb, resetDb } from './db'
import { SEEDS } from './seeds'
import { handleDynamic, type RawResponse } from './handlers/crud'

initDb(SEEDS)

/** 重置演示数据 */
export function resetMockDb() {
  resetDb(SEEDS)
}

const DYNAMIC_API_RE = /\/services\/dynamic\/api\/([^/?]+)\/([A-Za-z]+)(?:\/(\d+)\/(\d+))?/

export interface MockRequest {
  url: string
  method?: string
  body?: Record<string, unknown>
}

/** 模拟网络延迟，让 loading 效果可见 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockDispatch(request: MockRequest): Promise<RawResponse> {
  await delay(120 + Math.random() * 180)

  const path = request.url.split('?')[0]
  const matched = DYNAMIC_API_RE.exec(path)

  if (!matched) {
    return {
      result: 'FAIL',
      data: null,
      errors: [{ code: 'MOCK_ROUTE_NOT_FOUND', message: `Mock 未匹配到接口：${path}` }]
    }
  }

  const [, entity, op, pageSize, curPage] = matched
  const params = request.body?.params

  return handleDynamic(entity, op, params, pageSize ? Number(pageSize) : undefined, curPage ? Number(curPage) : undefined)
}

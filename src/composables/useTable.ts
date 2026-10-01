import { reactive, ref, type Ref } from 'vue'
import type { NormalizedResult } from '@/api/xdmf/types'

export interface UseTableOptions<T> {
  /** 列表加载函数 */
  fetcher: (query: Record<string, unknown>, pageSize: number, curPage: number) => Promise<NormalizedResult<T[]>>
  /** 查询条件初始值 */
  initialQuery?: Record<string, unknown>
  /** 每页条数 */
  pageSize?: number
  /** 是否立即加载 */
  immediate?: boolean
}

/**
 * 列表页通用逻辑：查询条件、分页、加载状态、增删改后刷新
 * 收敛各页面的样板代码，保证交互行为一致
 */
export function useTable<T = Record<string, unknown>>(options: UseTableOptions<T>) {
  const { fetcher, initialQuery = {}, pageSize: initialPageSize = 10, immediate = true } = options

  const loading = ref(false)
  const list = ref([]) as Ref<T[]>
  const page = ref(1)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  const query = reactive({ ...initialQuery })

  async function load() {
    loading.value = true
    try {
      const result = await fetcher({ ...query }, pageSize.value, page.value)
      if (result.ok) {
        list.value = (result.data || []) as T[]
        total.value = result.pageInfo?.totalCount ?? (result.data?.length || 0)
      } else {
        list.value = []
        total.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  /** 查询（重置到第一页） */
  function search() {
    page.value = 1
    return load()
  }

  /** 重置查询条件 */
  function reset(defaults: Record<string, unknown> = {}) {
    Object.keys(query).forEach((key) => {
      ;(query as Record<string, unknown>)[key] = defaults[key] ?? ''
    })
    page.value = 1
    return load()
  }

  /** 删除后处理当前页数据不足的情况 */
  function refreshAfterRemove(removedCount = 1) {
    if (list.value.length - removedCount <= 0 && page.value > 1) {
      page.value -= 1
    }
    return load()
  }

  if (immediate) load()

  return {
    loading,
    list,
    page,
    pageSize,
    total,
    query,
    load,
    search,
    reset,
    refreshAfterRemove
  }
}

import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 增删改查通用交互逻辑
 * 统一「删除确认 -> 调用接口 -> 提示 -> 刷新列表」的流程
 */
export function useCrud(refresh: () => void | Promise<void>) {
  const submitting = ref(false)

  /** 删除确认 + 执行 */
  async function confirmRemove(
    name: string,
    handler: () => Promise<{ ok: boolean; message?: string }>,
    onSuccess?: () => void | Promise<void>
  ) {
    try {
      await ElMessageBox.confirm(`确定要删除「${name}」吗？该操作执行软删除，可通过数据重置恢复。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      })
    } catch {
      return false
    }

    const result = await handler()
    if (result.ok) {
      await onSuccess?.()
      await refresh()
      return true
    }
    return false
  }

  /** 提交表单（新增 / 修改） */
  async function submit(
    handler: () => Promise<{ ok: boolean; message?: string }>,
    options: { successMessage?: string; onSuccess?: () => void | Promise<void> } = {}
  ) {
    submitting.value = true
    try {
      const result = await handler()
      if (!result.ok) return false
      if (options.successMessage) ElMessage.success(options.successMessage)
      await options.onSuccess?.()
      await refresh()
      return true
    } finally {
      submitting.value = false
    }
  }

  return { submitting, confirmRemove, submit }
}

/** 布尔值格式化 */
export function useBoolText() {
  return computed(() => (value: unknown) => (value ? '是' : '否'))
}

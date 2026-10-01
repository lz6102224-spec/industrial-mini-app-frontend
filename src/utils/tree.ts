/** 树结构工具 */

export interface FlatNode {
  id: string
  parentId?: string | null
  [key: string]: unknown
}

export interface BuildTreeOptions {
  idKey?: string
  parentKey?: string
  rootValue?: unknown
  childrenKey?: string
}

/**
 * 由扁平列表构建树
 * 自动处理 parentId 为空 / 指向不存在节点 的情况（降级为根节点）
 */
export function buildTree<T extends FlatNode>(
  list: T[],
  options: BuildTreeOptions = {}
): Array<T & { children: Array<T & { children: unknown[] }> }> {
  const { idKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = options
  const map = new Map<string, Record<string, unknown>>()
  const roots: Record<string, unknown>[] = []

  list.forEach((item) => {
    map.set(String(item[idKey]), { ...item, [childrenKey]: [] })
  })

  list.forEach((item) => {
    const node = map.get(String(item[idKey]))!
    const parentId = item[parentKey]
    const parent = parentId ? map.get(String(parentId)) : undefined
    if (parent) {
      ;(parent[childrenKey] as Record<string, unknown>[]).push(node)
    } else {
      roots.push(node)
    }
  })

  return roots as never
}

/** 深度遍历树 */
export function traverseTree<T extends { children?: T[] }>(
  nodes: T[],
  visitor: (node: T, depth: number) => void,
  depth = 0
) {
  nodes.forEach((node) => {
    visitor(node, depth)
    if (node.children?.length) traverseTree(node.children, visitor, depth + 1)
  })
}

/** 收集某节点的所有子孙 id */
export function collectDescendantIds<T extends { id: string; children?: T[] }>(node: T): string[] {
  const ids: string[] = []
  const walk = (n: T) => {
    n.children?.forEach((child) => {
      ids.push(child.id)
      walk(child)
    })
  }
  walk(node)
  return ids
}

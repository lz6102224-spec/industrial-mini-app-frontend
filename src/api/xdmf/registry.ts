/**
 * xDM-F API 登记表
 *
 * 本文件是「工程中调用的 xDM-F API 列表」这一交付物的唯一数据源。
 * 每新增一处对 xDM-F 的调用，都应在此登记，ApiList 页面与 scripts/gen-api-doc.mjs
 * 会自动读取本表生成清单文档。
 */

export interface ApiRegistryEntry {
  /** 所属业务模块 */
  module: string
  /** 实体英文名 */
  entity: string
  /** 实体类型：数据实体 / 关系实体 */
  entityType: '数据实体' | '关系实体'
  /** 原子操作 */
  op: string
  /** HTTP 方法 */
  method: 'POST'
  /** 相对 xDM-F 运行态基础路径的接口路径（{pageSize}/{curPage} 为路径参数占位） */
  path: string
  /** 功能说明 */
  desc: string
  /** 调用方（页面 / 组件） */
  usedBy: string[]
}

const DYNAMIC = '/services/dynamic/api'

/** 生成数据实体接口路径 */
const dataPath = (entity: string, op: string) => `${DYNAMIC}/${entity}/${op}`
/** 生成关系实体接口路径 */
const relPath = (entity: string, op: string) => `${DYNAMIC}/${entity}/${op}`

export const API_REGISTRY: ApiRegistryEntry[] = [
  // ==================== 设备管理 ====================
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('Equipment', 'find')}/{pageSize}/{curPage}`,
    desc: '分页条件查询设备列表（支持编码/名称/厂家/品牌/位置模糊查询）',
    usedBy: ['views/equipment/EquipmentList.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'get',
    method: 'POST',
    path: dataPath('Equipment', 'get'),
    desc: '按 ID 查询设备详情（含技术参数、备品备件扩展属性）',
    usedBy: ['views/equipment/EquipmentList.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('Equipment', 'create'),
    desc: '新增设备档案，注册时分配唯一标识符 uuid',
    usedBy: ['views/equipment/components/EquipmentForm.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'update',
    method: 'POST',
    path: dataPath('Equipment', 'update'),
    desc: '修改设备基础信息与扩展信息',
    usedBy: ['views/equipment/components/EquipmentForm.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'delete',
    method: 'POST',
    path: dataPath('Equipment', 'delete'),
    desc: '删除单台设备（软删除）',
    usedBy: ['views/equipment/EquipmentList.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'batchDelete',
    method: 'POST',
    path: dataPath('Equipment', 'batchDelete'),
    desc: '批量删除设备',
    usedBy: ['views/equipment/EquipmentList.vue']
  },
  {
    module: '设备管理',
    entity: 'Equipment',
    entityType: '数据实体',
    op: 'count',
    method: 'POST',
    path: dataPath('Equipment', 'count'),
    desc: '统计设备总数（首页看板）',
    usedBy: ['views/dashboard/Index.vue']
  },

  // ==================== 物料管理 ====================
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('Part', 'find')}/{pageSize}/{curPage}`,
    desc: '分页条件查询物料（支持按物料编码/名称/规格型号/供应商搜索，支持按分类过滤）',
    usedBy: ['views/part/PartList.vue']
  },
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('Part', 'create'),
    desc: '新增物料（含版本号、所属分类）',
    usedBy: ['views/part/components/PartForm.vue']
  },
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'update',
    method: 'POST',
    path: dataPath('Part', 'update'),
    desc: '修改物料属性',
    usedBy: ['views/part/components/PartForm.vue']
  },
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'delete',
    method: 'POST',
    path: dataPath('Part', 'delete'),
    desc: '删除物料（软删除）',
    usedBy: ['views/part/PartList.vue']
  },
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'saveAs',
    method: 'POST',
    path: dataPath('Part', 'saveAs'),
    desc: '物料另存为，用于版本升级（M-V 版本管理）',
    usedBy: ['views/part/components/VersionDialog.vue']
  },
  {
    module: '物料管理',
    entity: 'Part',
    entityType: '数据实体',
    op: 'count',
    method: 'POST',
    path: dataPath('Part', 'count'),
    desc: '统计物料总数（首页看板）',
    usedBy: ['views/dashboard/Index.vue']
  },
  {
    module: '物料管理',
    entity: 'PartCategory',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('PartCategory', 'find')}/{pageSize}/{curPage}`,
    desc: '查询物料分类（用于构建多级分类树）',
    usedBy: ['views/part/components/CategoryTree.vue']
  },
  {
    module: '物料管理',
    entity: 'PartCategory',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('PartCategory', 'create'),
    desc: '新增物料分类节点',
    usedBy: ['views/part/components/CategoryTree.vue']
  },
  {
    module: '物料管理',
    entity: 'PartCategory',
    entityType: '数据实体',
    op: 'update',
    method: 'POST',
    path: dataPath('PartCategory', 'update'),
    desc: '修改物料分类节点',
    usedBy: ['views/part/components/CategoryTree.vue']
  },
  {
    module: '物料管理',
    entity: 'PartCategory',
    entityType: '数据实体',
    op: 'delete',
    method: 'POST',
    path: dataPath('PartCategory', 'delete'),
    desc: '删除物料分类节点',
    usedBy: ['views/part/components/CategoryTree.vue']
  },
  {
    module: '物料管理',
    entity: 'PartVersion',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('PartVersion', 'find')}/{pageSize}/{curPage}`,
    desc: '查询物料的版本历史记录',
    usedBy: ['views/part/components/VersionDialog.vue']
  },
  {
    module: '物料管理',
    entity: 'PartVersion',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('PartVersion', 'create'),
    desc: '新增物料版本记录',
    usedBy: ['views/part/components/VersionDialog.vue']
  },
  {
    module: '物料管理',
    entity: 'Part_BOM_Rel',
    entityType: '关系实体',
    op: 'create',
    method: 'POST',
    path: relPath('Part_BOM_Rel', 'create'),
    desc: '构建 BOM：新增父物料与子物料的组成关系（关系实体不支持批量，需逐条调用）',
    usedBy: ['views/part/components/BomEditDialog.vue']
  },
  {
    module: '物料管理',
    entity: 'Part_BOM_Rel',
    entityType: '关系实体',
    op: 'find',
    method: 'POST',
    path: `${relPath('Part_BOM_Rel', 'find')}/{pageSize}/{curPage}`,
    desc: '查询 BOM 组成关系集合，用于构建 BOM 树',
    usedBy: ['views/part/components/BomTree.vue']
  },
  {
    module: '物料管理',
    entity: 'Part_BOM_Rel',
    entityType: '关系实体',
    op: 'delete',
    method: 'POST',
    path: relPath('Part_BOM_Rel', 'delete'),
    desc: '删除 BOM 组成关系',
    usedBy: ['views/part/components/BomTree.vue']
  },

  // ==================== 工序管理 ====================
  {
    module: '工序管理',
    entity: 'WorkingProcedure',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('WorkingProcedure', 'find')}/{pageSize}/{curPage}`,
    desc: '分页条件查询工序列表',
    usedBy: ['views/procedure/ProcedureList.vue']
  },
  {
    module: '工序管理',
    entity: 'WorkingProcedure',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('WorkingProcedure', 'create'),
    desc: '新增工序（毛坯制造/粗加工/精加工/检测/入库）',
    usedBy: ['views/procedure/components/ProcedureForm.vue']
  },
  {
    module: '工序管理',
    entity: 'WorkingProcedure',
    entityType: '数据实体',
    op: 'update',
    method: 'POST',
    path: dataPath('WorkingProcedure', 'update'),
    desc: '修改工序信息',
    usedBy: ['views/procedure/components/ProcedureForm.vue']
  },
  {
    module: '工序管理',
    entity: 'WorkingProcedure',
    entityType: '数据实体',
    op: 'delete',
    method: 'POST',
    path: dataPath('WorkingProcedure', 'delete'),
    desc: '删除工序（软删除）',
    usedBy: ['views/procedure/ProcedureList.vue']
  },
  {
    module: '工序管理',
    entity: 'WorkingProcedure',
    entityType: '数据实体',
    op: 'count',
    method: 'POST',
    path: dataPath('WorkingProcedure', 'count'),
    desc: '统计工序总数（首页看板）',
    usedBy: ['views/dashboard/Index.vue']
  },

  // ==================== 工艺路线 ====================
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'find',
    method: 'POST',
    path: `${dataPath('WorkingPlan', 'find')}/{pageSize}/{curPage}`,
    desc: '分页条件查询工艺路线列表',
    usedBy: ['views/plan/PlanList.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'get',
    method: 'POST',
    path: dataPath('WorkingPlan', 'get'),
    desc: '按 ID 查询工艺路线详情',
    usedBy: ['views/plan/PlanDetail.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'create',
    method: 'POST',
    path: dataPath('WorkingPlan', 'create'),
    desc: '新增工艺路线（中心轮零件加工 v1.0）',
    usedBy: ['views/plan/components/PlanForm.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'update',
    method: 'POST',
    path: dataPath('WorkingPlan', 'update'),
    desc: '修改工艺路线',
    usedBy: ['views/plan/components/PlanForm.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'delete',
    method: 'POST',
    path: dataPath('WorkingPlan', 'delete'),
    desc: '删除工艺路线（软删除）',
    usedBy: ['views/plan/PlanList.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan',
    entityType: '数据实体',
    op: 'count',
    method: 'POST',
    path: dataPath('WorkingPlan', 'count'),
    desc: '统计工艺路线总数（首页看板）',
    usedBy: ['views/dashboard/Index.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan_WorkingProcedure_Rel',
    entityType: '关系实体',
    op: 'create',
    method: 'POST',
    path: relPath('WorkingPlan_WorkingProcedure_Rel', 'create'),
    desc: '建立工艺路线与工序的关联关系（含执行顺序 sequenceOrder）',
    usedBy: ['views/plan/components/ProcedurePicker.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan_WorkingProcedure_Rel',
    entityType: '关系实体',
    op: 'find',
    method: 'POST',
    path: `${relPath('WorkingPlan_WorkingProcedure_Rel', 'find')}/{pageSize}/{curPage}`,
    desc: '查询工艺路线已关联的工序',
    usedBy: ['views/plan/PlanDetail.vue']
  },
  {
    module: '工艺路线',
    entity: 'WorkingPlan_WorkingProcedure_Rel',
    entityType: '关系实体',
    op: 'delete',
    method: 'POST',
    path: relPath('WorkingPlan_WorkingProcedure_Rel', 'delete'),
    desc: '解除工艺路线与工序的关联关系',
    usedBy: ['views/plan/components/ProcedurePicker.vue']
  },

  // ==================== 工序关联关系 ====================
  {
    module: '工业数据建模',
    entity: 'WorkingProcedure_Equipment_Rel',
    entityType: '关系实体',
    op: 'create',
    method: 'POST',
    path: relPath('WorkingProcedure_Equipment_Rel', 'create'),
    desc: '建立工序与设备的关联关系',
    usedBy: ['views/procedure/ProcedureList.vue']
  },
  {
    module: '工业数据建模',
    entity: 'WorkingProcedure_Equipment_Rel',
    entityType: '关系实体',
    op: 'find',
    method: 'POST',
    path: `${relPath('WorkingProcedure_Equipment_Rel', 'find')}/{pageSize}/{curPage}`,
    desc: '查询工序关联的设备',
    usedBy: ['views/model/ModelGraph.vue']
  },
  {
    module: '工业数据建模',
    entity: 'WorkingProcedure_Material_Rel',
    entityType: '关系实体',
    op: 'create',
    method: 'POST',
    path: relPath('WorkingProcedure_Material_Rel', 'create'),
    desc: '建立工序与物料的关联关系',
    usedBy: ['views/procedure/ProcedureList.vue']
  },
  {
    module: '工业数据建模',
    entity: 'WorkingProcedure_Material_Rel',
    entityType: '关系实体',
    op: 'find',
    method: 'POST',
    path: `${relPath('WorkingProcedure_Material_Rel', 'find')}/{pageSize}/{curPage}`,
    desc: '查询工序关联的物料',
    usedBy: ['views/model/ModelGraph.vue']
  }
]

/** 按模块分组 */
export function groupRegistryByModule(entries: ApiRegistryEntry[] = API_REGISTRY) {
  const map = new Map<string, ApiRegistryEntry[]>()
  entries.forEach((item) => {
    if (!map.has(item.module)) map.set(item.module, [])
    map.get(item.module)!.push(item)
  })
  return Array.from(map.entries()).map(([module, items]) => ({ module, items }))
}

/** 导出为 Markdown（供 ApiList 页面下载与脚本生成文档复用） */
export function registryToMarkdown(entries: ApiRegistryEntry[] = API_REGISTRY): string {
  const lines: string[] = []
  lines.push('# 工程调用的 iDME xDM-F API 列表')
  lines.push('')
  lines.push(`> 基础路径：\`{endpoint}/{envId}/rdm_{appId}_app\``)
  lines.push('> 所有动态数据服务接口均为 **POST**，请求体统一包裹在 `{"params": {...}}` 中。')
  lines.push(`> 接口总数：**${entries.length}**`)
  lines.push('')
  groupRegistryByModule(entries).forEach(({ module, items }) => {
    lines.push(`## ${module}`)
    lines.push('')
    lines.push('| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |')
    lines.push('| --- | --- | --- | --- | --- | --- |')
    items.forEach((it) => {
      lines.push(
        `| ${it.entity} | ${it.entityType} | ${it.op} | ${it.method} | \`${it.path}\` | ${it.desc} |`
      )
    })
    lines.push('')
  })
  return lines.join('\n')
}

/** 业务字典与预设模板 */

/** 折旧方式 */
export const DEPRECIATION_METHODS = [
  '平均年限法',
  '双倍余额递减法',
  '年数总和法',
  '工作量法'
] as const

/** 设备状态 */
export const EQUIPMENT_STATUS = ['在用', '闲置', '维修中', '报废'] as const

/** 物料状态 */
export const PART_STATUS = ['启用', '停用'] as const

/** 工艺路线状态 */
export const PLAN_STATUS = ['草稿', '已发布', '已归档'] as const

/** 技术参数类型 */
export const PARAM_TYPES = ['文本', '数值', '布尔'] as const

/** 计量单位 */
export const UNITS = ['件', '套', '台', '个', '根', '片', '支', 'kg', 'm'] as const

/**
 * 行星减速器核心零件生产工艺流程（赛题要求配置的 5 道工序）
 * 毛坯制造 → 机械加工(粗加工) → 轴类零件加工(精加工) → 检测 → 入库
 */
export const PROCEDURE_TEMPLATES = [
  {
    procedureCode: 'OP-010',
    procedureName: '毛坯制造',
    sequence: 1,
    productionSteps: '下料 → 中频感应加热 → 模锻成形 → 正火处理 → 毛坯入库',
    productionInspectionEquipment: '中频感应锻造加热炉、锻压机、硬度计',
    operator: '张伟',
    description: '齿轮毛坯锻造与正火，为后续机加工提供合格毛坯',
    workingHours: 480
  },
  {
    procedureCode: 'OP-020',
    procedureName: '粗加工',
    sequence: 2,
    productionSteps: '粗车外圆 → 粗镗内孔 → 粗铣端面 → 去应力',
    productionInspectionEquipment: '数控车削中心、五轴联动加工中心、游标卡尺',
    operator: '李强',
    description: '去除大部分余量，留精加工余量 0.3mm',
    workingHours: 480
  },
  {
    procedureCode: 'OP-030',
    procedureName: '精加工',
    sequence: 3,
    productionSteps: '精车基准 → 磨齿 → 齿面渗碳淬火 → 精磨内孔',
    productionInspectionEquipment: '数控磨齿机、可控气氛热处理炉、数控车削中心',
    operator: '王芳',
    description: '保证齿轮精度等级 4 级，降低传动噪音',
    workingHours: 960
  },
  {
    procedureCode: 'OP-040',
    procedureName: '检测',
    sequence: 4,
    productionSteps: '三坐标尺寸检测 → 齿形齿向检测 → 硬度检测 → 出具检测报告',
    productionInspectionEquipment: '三坐标测量机、齿轮测量中心、洛氏硬度计',
    operator: '赵敏',
    description: '关键尺寸与形位公差全检',
    workingHours: 240
  },
  {
    procedureCode: 'OP-050',
    procedureName: '入库',
    sequence: 5,
    productionSteps: '清洗防锈 → 打标 → 包装 → 成品入库',
    productionInspectionEquipment: '超声波清洗机、激光打标机',
    operator: '陈刚',
    description: '合格品清洗防锈后入库',
    workingHours: 240
  }
]

/** 工艺路线模板（赛题要求：中心轮零件加工 v1.0） */
export const PLAN_TEMPLATE = {
  planCode: 'WP-SUN-001',
  planName: '中心轮零件加工',
  productName: '精密行星减速器 PR-20',
  version: '1.0',
  description:
    '中心轮零件从毛坯制造到成品入库的完整加工工艺路线，涵盖锻造、粗加工、精加工、检测与入库五个工序环节。',
  operator: '李强',
  equipmentUsage:
    '中频感应锻造加热炉、数控车削中心、五轴联动加工中心、数控磨齿机、可控气氛热处理炉、三坐标测量机',
  status: '已发布'
}

/** 物料分类模板（赛题示例） */
export const CATEGORY_TEMPLATES = [
  { categoryCode: 'CAT-ELEC', categoryName: '电子元器件', parentCode: '', sortOrder: 1 },
  { categoryCode: 'CAT-ELEC-PASSIVE', categoryName: '无源分立元件', parentCode: 'CAT-ELEC', sortOrder: 1 },
  { categoryCode: 'CAT-ELEC-PASSIVE-MAG', categoryName: '磁性元件', parentCode: 'CAT-ELEC-PASSIVE', sortOrder: 1 },
  { categoryCode: 'CAT-STRUCT', categoryName: '结构件', parentCode: '', sortOrder: 2 },
  { categoryCode: 'CAT-STRUCT-STEEL', categoryName: '高强钢安装件', parentCode: 'CAT-STRUCT', sortOrder: 1 }
]

/** 模型图谱节点定义（工业数据建模可视化用） */
export const MODEL_GRAPH_DEFINITION = {
  entities: [
    { name: 'Equipment', label: '设备 / Equipment', category: 0, desc: '设备基础档案与扩展信息' },
    { name: 'Part', label: '部件 / Part', category: 1, desc: '物料主数据、分类与版本' },
    { name: 'WorkingProcedure', label: '工序 / WorkingProcedure', category: 2, desc: '工序定义与执行信息' },
    { name: 'WorkingPlan', label: '工艺 / WorkingPlan', category: 3, desc: '工艺路线编排' }
  ],
  relations: [
    { source: 'WorkingPlan', target: 'WorkingProcedure', label: '工艺-工序', entity: 'WorkingPlan_WorkingProcedure_Rel' },
    { source: 'WorkingProcedure', target: 'Equipment', label: '工序-设备', entity: 'WorkingProcedure_Equipment_Rel' },
    { source: 'WorkingProcedure', target: 'Part', label: '工序-物料', entity: 'WorkingProcedure_Material_Rel' },
    { source: 'Part', target: 'Part', label: 'BOM 组成', entity: 'Part_BOM_Rel' }
  ]
}

/**
 * Mock 种子数据
 * 场景：精密行星减速器制造企业 —— 设备 / 物料 / 工序 / 工艺 及关联关系
 */
import type { CollectionMap, EntityRecord } from '../db'

const t = (d: string) => new Date(d).toISOString()

function sys(id: string, createTime: string, extra: Record<string, unknown>): EntityRecord {
  return {
    id,
    rdmVersion: 1,
    rdmDeleteFlag: 0,
    creator: 'admin',
    createTime: t(createTime),
    lastModifiedBy: 'admin',
    lastUpdateTime: t(createTime),
    ...extra
  }
}

// ==================== 设备 ====================
const equipment: EntityRecord[] = [
  sys('1000000000000000001', '2025-01-06 09:00:00', {
    equipmentCode: 'EQ-CNC-001',
    equipmentName: '五轴联动加工中心',
    manufacturer: '科德数控股份有限公司',
    brand: 'KEDE',
    model: 'KMC800U',
    supplier: '科德数控华南服务中心',
    productionDate: '2022-03-15',
    serviceLife: 10,
    depreciationMethod: '平均年限法',
    location: '一号车间 A 区 03 工位',
    uuid: 'e7b1c2d4-3f56-4a8b-9c01-2d3e4f5a6b71',
    status: '在用',
    remark: '用于行星架、中心轮的高精度铣削与钻孔',
    technicalParams: [
      { paramName: '主轴转速', paramValue: '20000', paramType: '数值', unit: 'rpm' },
      { paramName: '定位精度', paramValue: '0.005', paramType: '数值', unit: 'mm' },
      { paramName: '工作台尺寸', paramValue: 'Φ800×630', paramType: '文本' },
      { paramName: '是否支持在线测量', paramValue: 'true', paramType: '布尔' }
    ],
    spareParts: [
      { spareCode: 'SP-CNC-001', spareName: '主轴拉刀爪', specification: 'HSK-A63', stockQuantity: 4, unit: '套', safetyStock: 2, storageLocation: '备件库 A-01' },
      { spareCode: 'SP-CNC-002', spareName: '精密滚珠丝杠', specification: 'R32-10K5', stockQuantity: 2, unit: '根', safetyStock: 1, storageLocation: '备件库 A-02' }
    ]
  }),
  sys('1000000000000000002', '2025-01-06 09:10:00', {
    equipmentCode: 'EQ-LATHE-002',
    equipmentName: '数控车削中心',
    manufacturer: '沈阳机床股份有限公司',
    brand: 'SMTCL',
    model: 'HTC3650',
    supplier: '沈阳机床华东经销处',
    productionDate: '2021-07-20',
    serviceLife: 10,
    depreciationMethod: '平均年限法',
    location: '一号车间 B 区 01 工位',
    uuid: 'a3f9d1e8-2c47-4b90-8d13-5e6f7a8b9c02',
    status: '在用',
    remark: '轴类零件车削加工（输入轴、输出轴）',
    technicalParams: [
      { paramName: '最大回转直径', paramValue: '650', paramType: '数值', unit: 'mm' },
      { paramName: '主轴功率', paramValue: '22', paramType: '数值', unit: 'kW' },
      { paramName: '重复定位精度', paramValue: '0.003', paramType: '数值', unit: 'mm' }
    ],
    spareParts: [
      { spareCode: 'SP-LATHE-001', spareName: '液压卡盘', specification: 'Φ254', stockQuantity: 1, unit: '套', safetyStock: 1, storageLocation: '备件库 A-05' }
    ]
  }),
  sys('1000000000000000003', '2025-01-06 09:20:00', {
    equipmentCode: 'EQ-GRIND-003',
    equipmentName: '数控磨齿机',
    manufacturer: '秦川机床工具集团股份公司',
    brand: 'QCMT&T',
    model: 'YK7236A',
    supplier: '秦川机床西南服务中心',
    productionDate: '2020-11-08',
    serviceLife: 15,
    depreciationMethod: '双倍余额递减法',
    location: '二号车间 C 区 02 工位',
    uuid: 'b8c2e4a1-7d39-4f52-9a86-1b2c3d4e5f93',
    status: '在用',
    remark: '行星轮、中心轮齿面精加工，保证传动精度与低噪音',
    technicalParams: [
      { paramName: '最大模数', paramValue: '6', paramType: '数值', unit: 'mm' },
      { paramName: '磨削精度等级', paramValue: 'GB/T 10095 4级', paramType: '文本' },
      { paramName: '砂轮线速度', paramValue: '63', paramType: '数值', unit: 'm/s' }
    ],
    spareParts: [
      { spareCode: 'SP-GRIND-001', spareName: 'CBN 成形砂轮', specification: 'Φ200×20', stockQuantity: 6, unit: '片', safetyStock: 3, storageLocation: '备件库 B-01' }
    ]
  }),
  sys('1000000000000000004', '2025-01-06 09:30:00', {
    equipmentCode: 'EQ-HEAT-004',
    equipmentName: '可控气氛热处理炉',
    manufacturer: '爱协林热处理系统（北京）有限公司',
    brand: 'AICHELIN',
    model: 'VKES-5/2',
    supplier: '爱协林华北服务部',
    productionDate: '2019-05-12',
    serviceLife: 20,
    depreciationMethod: '年数总和法',
    location: '二号车间 D 区 01 工位',
    uuid: 'c9d3f5b2-8e41-4a63-8b97-2c3d4e5f6a04',
    status: '在用',
    remark: '齿轮渗碳淬火，提升齿面硬度与耐磨性',
    technicalParams: [
      { paramName: '最高炉温', paramValue: '950', paramType: '数值', unit: '℃' },
      { paramName: '有效加热区', paramValue: '600×600×900', paramType: '文本' },
      { paramName: '碳势控制精度', paramValue: '0.05', paramType: '数值', unit: '%C' }
    ],
    spareParts: [
      { spareCode: 'SP-HEAT-001', spareName: '氧探头', specification: 'CP-2000', stockQuantity: 2, unit: '支', safetyStock: 1, storageLocation: '备件库 C-01' }
    ]
  }),
  sys('1000000000000000005', '2025-01-06 09:40:00', {
    equipmentCode: 'EQ-CMM-005',
    equipmentName: '三坐标测量机',
    manufacturer: '海克斯康测量技术（青岛）有限公司',
    brand: 'HEXAGON',
    model: 'GLOBAL S 07.10.07',
    supplier: '海克斯康华东服务中心',
    productionDate: '2023-02-28',
    serviceLife: 12,
    depreciationMethod: '平均年限法',
    location: '质检中心 恒温间 01 工位',
    uuid: 'd1e4a6c3-9f52-4b74-8ca8-3d4e5f6a7b15',
    status: '在用',
    remark: '零件尺寸与形位公差检测，出具检测报告',
    technicalParams: [
      { paramName: '示值误差', paramValue: '1.5', paramType: '数值', unit: 'μm' },
      { paramName: '测量范围', paramValue: '700×1000×700', paramType: '文本' },
      { paramName: '是否支持扫描测头', paramValue: 'true', paramType: '布尔' }
    ],
    spareParts: [
      { spareCode: 'SP-CMM-001', spareName: '红宝石测针', specification: 'Φ2×20', stockQuantity: 10, unit: '支', safetyStock: 4, storageLocation: '备件库 D-01' }
    ]
  }),
  sys('1000000000000000006', '2025-01-06 09:50:00', {
    equipmentCode: 'EQ-FORGE-006',
    equipmentName: '中频感应锻造加热炉',
    manufacturer: '西安博大电炉有限公司',
    brand: 'BODA',
    model: 'KGPS-500',
    supplier: '博大电炉西北经销处',
    productionDate: '2018-09-01',
    serviceLife: 18,
    depreciationMethod: '工作量法',
    location: '毛坯车间 E 区 01 工位',
    uuid: 'e2f5b7d4-a063-4c85-9db9-4e5f6a7b8c26',
    status: '在用',
    remark: '齿轮毛坯锻造前加热',
    technicalParams: [
      { paramName: '额定功率', paramValue: '500', paramType: '数值', unit: 'kW' },
      { paramName: '加热温度', paramValue: '1200', paramType: '数值', unit: '℃' }
    ],
    spareParts: [
      { spareCode: 'SP-FORGE-001', spareName: '感应圈', specification: 'Φ180', stockQuantity: 2, unit: '个', safetyStock: 1, storageLocation: '备件库 E-01' }
    ]
  })
]

// ==================== 物料分类 ====================
const partCategory: EntityRecord[] = [
  sys('2000000000000000001', '2025-01-05 08:00:00', { categoryCode: 'CAT-ELEC', categoryName: '电子元器件', parentId: '', sortOrder: 1 }),
  sys('2000000000000000002', '2025-01-05 08:01:00', { categoryCode: 'CAT-ELEC-PASSIVE', categoryName: '无源分立元件', parentId: '2000000000000000001', sortOrder: 1 }),
  sys('2000000000000000003', '2025-01-05 08:02:00', { categoryCode: 'CAT-ELEC-PASSIVE-MAG', categoryName: '磁性元件', parentId: '2000000000000000002', sortOrder: 1 }),
  sys('2000000000000000004', '2025-01-05 08:03:00', { categoryCode: 'CAT-STRUCT', categoryName: '结构件', parentId: '', sortOrder: 2 }),
  sys('2000000000000000005', '2025-01-05 08:04:00', { categoryCode: 'CAT-STRUCT-STEEL', categoryName: '高强钢安装件', parentId: '2000000000000000004', sortOrder: 1 }),
  sys('2000000000000000006', '2025-01-05 08:05:00', { categoryCode: 'CAT-GEAR', categoryName: '齿轮类零件', parentId: '', sortOrder: 3 }),
  sys('2000000000000000007', '2025-01-05 08:06:00', { categoryCode: 'CAT-GEAR-SUN', categoryName: '中心轮（太阳轮）', parentId: '2000000000000000006', sortOrder: 1 }),
  sys('2000000000000000008', '2025-01-05 08:07:00', { categoryCode: 'CAT-GEAR-PLANET', categoryName: '行星轮', parentId: '2000000000000000006', sortOrder: 2 }),
  sys('2000000000000000009', '2025-01-05 08:08:00', { categoryCode: 'CAT-SHAFT', categoryName: '轴类零件', parentId: '', sortOrder: 4 }),
  sys('2000000000000000010', '2025-01-05 08:09:00', { categoryCode: 'CAT-BEARING', categoryName: '轴承类', parentId: '', sortOrder: 5 })
]

// ==================== 物料 ====================
const part: EntityRecord[] = [
  sys('3000000000000000001', '2025-01-05 10:00:00', {
    partCode: 'P-SUN-001', partName: '中心轮（太阳轮）', model: 'PR-20-SUN', stockQuantity: 120, supplier: '自制', categoryId: '2000000000000000007', version: 'V1.0', unit: '件', status: '启用', selfMade: true, description: '行星减速器中心轮，模数2，齿数20'
  }),
  sys('3000000000000000002', '2025-01-05 10:05:00', {
    partCode: 'P-PLANET-002', partName: '行星轮', model: 'PR-20-PLT', stockQuantity: 360, supplier: '自制', categoryId: '2000000000000000008', version: 'V1.0', unit: '件', status: '启用', selfMade: true, description: '行星减速器行星轮，模数2，齿数32，3件/台'
  }),
  sys('3000000000000000003', '2025-01-05 10:10:00', {
    partCode: 'P-RING-003', partName: '内齿圈', model: 'PR-20-RING', stockQuantity: 80, supplier: '苏州精密齿轮有限公司', categoryId: '2000000000000000006', version: 'V1.0', unit: '件', status: '启用', selfMade: false, description: '行星减速器内齿圈，模数2，齿数84'
  }),
  sys('3000000000000000004', '2025-01-05 10:15:00', {
    partCode: 'P-CARRIER-004', partName: '行星架', model: 'PR-20-CAR', stockQuantity: 95, supplier: '自制', categoryId: '2000000000000000004', version: 'V2.0', unit: '件', status: '启用', selfMade: true, description: '行星架总成基体，高强钢安装件'
  }),
  sys('3000000000000000005', '2025-01-05 10:20:00', {
    partCode: 'P-SHAFT-IN-005', partName: '输入轴', model: 'PR-20-IN', stockQuantity: 150, supplier: '自制', categoryId: '2000000000000000009', version: 'V1.0', unit: '件', status: '启用', selfMade: true, description: '减速器输入轴，40Cr 调质'
  }),
  sys('3000000000000000006', '2025-01-05 10:25:00', {
    partCode: 'P-SHAFT-OUT-006', partName: '输出轴', model: 'PR-20-OUT', stockQuantity: 150, supplier: '自制', categoryId: '2000000000000000009', version: 'V1.0', unit: '件', status: '启用', selfMade: true, description: '减速器输出轴，40Cr 调质'
  }),
  sys('3000000000000000007', '2025-01-05 10:30:00', {
    partCode: 'P-PIN-007', partName: '行星销轴', model: 'PR-20-PIN', stockQuantity: 900, supplier: '常州标准件厂', categoryId: '2000000000000000005', version: 'V1.0', unit: '件', status: '启用', selfMade: false, description: '行星轮支撑销轴，高强钢'
  }),
  sys('3000000000000000008', '2025-01-05 10:35:00', {
    partCode: 'P-BRG-008', partName: '深沟球轴承', model: '6205-2RS', stockQuantity: 600, supplier: '洛阳轴承集团', categoryId: '2000000000000000010', version: 'V1.0', unit: '套', status: '启用', selfMade: false, description: '行星轮支撑轴承'
  }),
  sys('3000000000000000009', '2025-01-05 10:40:00', {
    partCode: 'P-MAG-009', partName: '钕铁硼磁钢', model: 'N42-10×5', stockQuantity: 2400, supplier: '宁波韵升股份有限公司', categoryId: '2000000000000000003', version: 'V1.0', unit: '片', status: '启用', selfMade: false, description: '用于磁性编码器组件的磁性元件'
  }),
  sys('3000000000000000010', '2025-01-05 10:45:00', {
    partCode: 'P-BLANK-010', partName: '中心轮毛坯', model: 'BLK-PR-20', stockQuantity: 260, supplier: '自制', categoryId: '2000000000000000007', version: 'V1.0', unit: '件', status: '启用', selfMade: true, description: '锻造毛坯，供中心轮加工'
  })
]

// ==================== 物料版本 ====================
const partVersion: EntityRecord[] = [
  sys('4000000000000000001', '2025-01-05 10:16:00', { partId: '3000000000000000004', version: 'V1.0', remark: '初版发布，铸铁行星架', isCurrent: false }),
  sys('4000000000000000002', '2025-03-11 14:20:00', { partId: '3000000000000000004', version: 'V2.0', remark: '升级为高强钢安装件，减重 12%，提升疲劳寿命', isCurrent: true }),
  sys('4000000000000000003', '2025-01-05 10:01:00', { partId: '3000000000000000001', version: 'V1.0', remark: '初版发布', isCurrent: true })
]

// ==================== BOM 关系 ====================
const partBomRel: EntityRecord[] = [
  sys('5000000000000000001', '2025-01-05 11:00:00', { parentPartId: '3000000000000000004', childPartId: '3000000000000000002', quantity: 3, sequence: 1, unit: '件', remark: '行星架装配 3 个行星轮' }),
  sys('5000000000000000002', '2025-01-05 11:01:00', { parentPartId: '3000000000000000004', childPartId: '3000000000000000007', quantity: 3, sequence: 2, unit: '件', remark: '行星销轴' }),
  sys('5000000000000000003', '2025-01-05 11:02:00', { parentPartId: '3000000000000000004', childPartId: '3000000000000000008', quantity: 3, sequence: 3, unit: '套', remark: '行星轮轴承' }),
  sys('5000000000000000004', '2025-01-05 11:03:00', { parentPartId: '3000000000000000002', childPartId: '3000000000000000010', quantity: 1, sequence: 1, unit: '件', remark: '行星轮毛坯来源' })
]

// ==================== 工序 ====================
const workingProcedure: EntityRecord[] = [
  sys('6000000000000000001', '2025-01-07 08:00:00', {
    procedureCode: 'OP-010', procedureName: '毛坯制造', productionSteps: '下料 → 中频感应加热 → 模锻成形 → 正火处理 → 毛坯入库',
    productionInspectionEquipment: '中频感应锻造加热炉、锻压机、硬度计', operator: '张伟', startTime: '2025-01-07T08:00:00', endTime: '2025-01-07T17:00:00',
    sequence: 1, workingHours: 480, description: '齿轮毛坯锻造与正火，为后续机加工提供合格毛坯'
  }),
  sys('6000000000000000002', '2025-01-08 08:00:00', {
    procedureCode: 'OP-020', procedureName: '粗加工', productionSteps: '粗车外圆 → 粗镗内孔 → 粗铣端面 → 去应力',
    productionInspectionEquipment: '数控车削中心、五轴联动加工中心、游标卡尺', operator: '李强', startTime: '2025-01-08T08:00:00', endTime: '2025-01-08T17:00:00',
    sequence: 2, workingHours: 480, description: '去除大部分余量，留精加工余量 0.3mm'
  }),
  sys('6000000000000000003', '2025-01-09 08:00:00', {
    procedureCode: 'OP-030', procedureName: '精加工', productionSteps: '精车基准 → 磨齿 → 齿面渗碳淬火 → 精磨内孔',
    productionInspectionEquipment: '数控磨齿机、可控气氛热处理炉、数控车削中心', operator: '王芳', startTime: '2025-01-09T08:00:00', endTime: '2025-01-10T17:00:00',
    sequence: 3, workingHours: 960, description: '保证齿轮精度等级 4 级，降低传动噪音'
  }),
  sys('6000000000000000004', '2025-01-11 08:00:00', {
    procedureCode: 'OP-040', procedureName: '检测', productionSteps: '三坐标尺寸检测 → 齿形齿向检测 → 硬度检测 → 出具检测报告',
    productionInspectionEquipment: '三坐标测量机、齿轮测量中心、洛氏硬度计', operator: '赵敏', startTime: '2025-01-11T08:00:00', endTime: '2025-01-11T12:00:00',
    sequence: 4, workingHours: 240, description: '关键尺寸与形位公差全检'
  }),
  sys('6000000000000000005', '2025-01-11 13:00:00', {
    procedureCode: 'OP-050', procedureName: '入库', productionSteps: '清洗防锈 → 打标 → 包装 → 成品入库',
    productionInspectionEquipment: '超声波清洗机、激光打标机', operator: '陈刚', startTime: '2025-01-11T13:00:00', endTime: '2025-01-11T17:00:00',
    sequence: 5, workingHours: 240, description: '合格品清洗防锈后入库'
  })
]

// ==================== 工艺路线 ====================
const workingPlan: EntityRecord[] = [
  sys('7000000000000000001', '2025-01-12 09:00:00', {
    planCode: 'WP-SUN-001', planName: '中心轮零件加工', productName: '精密行星减速器 PR-20', version: '1.0',
    description: '中心轮零件从毛坯制造到成品入库的完整加工工艺路线，涵盖锻造、粗加工、精加工、检测与入库五个工序环节。',
    operator: '李强', operationTime: '2025-01-12T09:00:00', equipmentUsage: '中频感应锻造加热炉、数控车削中心、五轴联动加工中心、数控磨齿机、可控气氛热处理炉、三坐标测量机',
    status: '已发布'
  })
]

// ==================== 关系：工艺 - 工序 ====================
const planProcedureRel: EntityRecord[] = [
  sys('8000000000000000001', '2025-01-12 09:30:00', { planId: '7000000000000000001', procedureId: '6000000000000000001', sequenceOrder: 1, remark: '第一步：毛坯制造' }),
  sys('8000000000000000002', '2025-01-12 09:31:00', { planId: '7000000000000000001', procedureId: '6000000000000000002', sequenceOrder: 2, remark: '第二步：粗加工' }),
  sys('8000000000000000003', '2025-01-12 09:32:00', { planId: '7000000000000000001', procedureId: '6000000000000000003', sequenceOrder: 3, remark: '第三步：精加工' }),
  sys('8000000000000000004', '2025-01-12 09:33:00', { planId: '7000000000000000001', procedureId: '6000000000000000004', sequenceOrder: 4, remark: '第四步：检测' }),
  sys('8000000000000000005', '2025-01-12 09:34:00', { planId: '7000000000000000001', procedureId: '6000000000000000005', sequenceOrder: 5, remark: '第五步：入库' })
]

// ==================== 关系：工序 - 设备 ====================
const procedureEquipmentRel: EntityRecord[] = [
  sys('9000000000000000001', '2025-01-12 10:00:00', { procedureId: '6000000000000000001', equipmentId: '1000000000000000006', usageRemark: '毛坯加热锻造' }),
  sys('9000000000000000002', '2025-01-12 10:01:00', { procedureId: '6000000000000000002', equipmentId: '1000000000000000002', usageRemark: '轴类/盘类零件粗车' }),
  sys('9000000000000000003', '2025-01-12 10:02:00', { procedureId: '6000000000000000002', equipmentId: '1000000000000000001', usageRemark: '端面与孔系粗铣' }),
  sys('9000000000000000004', '2025-01-12 10:03:00', { procedureId: '6000000000000000003', equipmentId: '1000000000000000003', usageRemark: '齿面精磨' }),
  sys('9000000000000000005', '2025-01-12 10:04:00', { procedureId: '6000000000000000003', equipmentId: '1000000000000000004', usageRemark: '渗碳淬火' }),
  sys('9000000000000000006', '2025-01-12 10:05:00', { procedureId: '6000000000000000004', equipmentId: '1000000000000000005', usageRemark: '三坐标尺寸检测' })
]

// ==================== 关系：工序 - 物料 ====================
const procedureMaterialRel: EntityRecord[] = [
  sys('A000000000000000001', '2025-01-12 11:00:00', { procedureId: '6000000000000000001', materialId: '3000000000000000010', quantity: 1, remark: '投入中心轮毛坯' }),
  sys('A000000000000000002', '2025-01-12 11:01:00', { procedureId: '6000000000000000003', materialId: '3000000000000000001', quantity: 1, remark: '产出中心轮成品' }),
  sys('A000000000000000003', '2025-01-12 11:02:00', { procedureId: '6000000000000000004', materialId: '3000000000000000001', quantity: 1, remark: '检测对象' })
]

export const SEEDS: CollectionMap = {
  Equipment: equipment,
  Part: part,
  PartCategory: partCategory,
  PartVersion: partVersion,
  WorkingProcedure: workingProcedure,
  WorkingPlan: workingPlan,
  Part_BOM_Rel: partBomRel,
  WorkingPlan_WorkingProcedure_Rel: planProcedureRel,
  WorkingProcedure_Equipment_Rel: procedureEquipmentRel,
  WorkingProcedure_Material_Rel: procedureMaterialRel
}

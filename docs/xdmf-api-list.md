<!-- 由 scripts/gen-api-doc.mjs 自动生成于 2026/10/1 12:55:05 -->
# 工程调用的 iDME xDM-F API 列表

> 基础路径：`{endpoint}/{envId}/rdm_{appId}_app`
> 所有动态数据服务接口均为 **POST**，请求体统一包裹在 `{"params": {...}}` 中。
> 接口总数：**40**

## 设备管理

| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Equipment | 数据实体 | find | POST | `/services/dynamic/api/Equipment/find/{pageSize}/{curPage}` | 分页条件查询设备列表（支持编码/名称/厂家/品牌/位置模糊查询） |
| Equipment | 数据实体 | get | POST | `/services/dynamic/api/Equipment/get` | 按 ID 查询设备详情（含技术参数、备品备件扩展属性） |
| Equipment | 数据实体 | create | POST | `/services/dynamic/api/Equipment/create` | 新增设备档案，注册时分配唯一标识符 uuid |
| Equipment | 数据实体 | update | POST | `/services/dynamic/api/Equipment/update` | 修改设备基础信息与扩展信息 |
| Equipment | 数据实体 | delete | POST | `/services/dynamic/api/Equipment/delete` | 删除单台设备（软删除） |
| Equipment | 数据实体 | batchDelete | POST | `/services/dynamic/api/Equipment/batchDelete` | 批量删除设备 |
| Equipment | 数据实体 | count | POST | `/services/dynamic/api/Equipment/count` | 统计设备总数（首页看板） |

## 物料管理

| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Part | 数据实体 | find | POST | `/services/dynamic/api/Part/find/{pageSize}/{curPage}` | 分页条件查询物料（支持按物料编码/名称/规格型号/供应商搜索，支持按分类过滤） |
| Part | 数据实体 | create | POST | `/services/dynamic/api/Part/create` | 新增物料（含版本号、所属分类） |
| Part | 数据实体 | update | POST | `/services/dynamic/api/Part/update` | 修改物料属性 |
| Part | 数据实体 | delete | POST | `/services/dynamic/api/Part/delete` | 删除物料（软删除） |
| Part | 数据实体 | saveAs | POST | `/services/dynamic/api/Part/saveAs` | 物料另存为，用于版本升级（M-V 版本管理） |
| Part | 数据实体 | count | POST | `/services/dynamic/api/Part/count` | 统计物料总数（首页看板） |
| PartCategory | 数据实体 | find | POST | `/services/dynamic/api/PartCategory/find/{pageSize}/{curPage}` | 查询物料分类（用于构建多级分类树） |
| PartCategory | 数据实体 | create | POST | `/services/dynamic/api/PartCategory/create` | 新增物料分类节点 |
| PartCategory | 数据实体 | update | POST | `/services/dynamic/api/PartCategory/update` | 修改物料分类节点 |
| PartCategory | 数据实体 | delete | POST | `/services/dynamic/api/PartCategory/delete` | 删除物料分类节点 |
| PartVersion | 数据实体 | find | POST | `/services/dynamic/api/PartVersion/find/{pageSize}/{curPage}` | 查询物料的版本历史记录 |
| PartVersion | 数据实体 | create | POST | `/services/dynamic/api/PartVersion/create` | 新增物料版本记录 |
| Part_BOM_Rel | 关系实体 | create | POST | `/services/dynamic/api/Part_BOM_Rel/create` | 构建 BOM：新增父物料与子物料的组成关系（关系实体不支持批量，需逐条调用） |
| Part_BOM_Rel | 关系实体 | find | POST | `/services/dynamic/api/Part_BOM_Rel/find/{pageSize}/{curPage}` | 查询 BOM 组成关系集合，用于构建 BOM 树 |
| Part_BOM_Rel | 关系实体 | delete | POST | `/services/dynamic/api/Part_BOM_Rel/delete` | 删除 BOM 组成关系 |

## 工序管理

| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |
| --- | --- | --- | --- | --- | --- |
| WorkingProcedure | 数据实体 | find | POST | `/services/dynamic/api/WorkingProcedure/find/{pageSize}/{curPage}` | 分页条件查询工序列表 |
| WorkingProcedure | 数据实体 | create | POST | `/services/dynamic/api/WorkingProcedure/create` | 新增工序（毛坯制造/粗加工/精加工/检测/入库） |
| WorkingProcedure | 数据实体 | update | POST | `/services/dynamic/api/WorkingProcedure/update` | 修改工序信息 |
| WorkingProcedure | 数据实体 | delete | POST | `/services/dynamic/api/WorkingProcedure/delete` | 删除工序（软删除） |
| WorkingProcedure | 数据实体 | count | POST | `/services/dynamic/api/WorkingProcedure/count` | 统计工序总数（首页看板） |

## 工艺路线

| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |
| --- | --- | --- | --- | --- | --- |
| WorkingPlan | 数据实体 | find | POST | `/services/dynamic/api/WorkingPlan/find/{pageSize}/{curPage}` | 分页条件查询工艺路线列表 |
| WorkingPlan | 数据实体 | get | POST | `/services/dynamic/api/WorkingPlan/get` | 按 ID 查询工艺路线详情 |
| WorkingPlan | 数据实体 | create | POST | `/services/dynamic/api/WorkingPlan/create` | 新增工艺路线（中心轮零件加工 v1.0） |
| WorkingPlan | 数据实体 | update | POST | `/services/dynamic/api/WorkingPlan/update` | 修改工艺路线 |
| WorkingPlan | 数据实体 | delete | POST | `/services/dynamic/api/WorkingPlan/delete` | 删除工艺路线（软删除） |
| WorkingPlan | 数据实体 | count | POST | `/services/dynamic/api/WorkingPlan/count` | 统计工艺路线总数（首页看板） |
| WorkingPlan_WorkingProcedure_Rel | 关系实体 | create | POST | `/services/dynamic/api/WorkingPlan_WorkingProcedure_Rel/create` | 建立工艺路线与工序的关联关系（含执行顺序 sequenceOrder） |
| WorkingPlan_WorkingProcedure_Rel | 关系实体 | find | POST | `/services/dynamic/api/WorkingPlan_WorkingProcedure_Rel/find/{pageSize}/{curPage}` | 查询工艺路线已关联的工序 |
| WorkingPlan_WorkingProcedure_Rel | 关系实体 | delete | POST | `/services/dynamic/api/WorkingPlan_WorkingProcedure_Rel/delete` | 解除工艺路线与工序的关联关系 |

## 工业数据建模

| 实体 | 实体类型 | 操作 | 方法 | 接口路径 | 说明 |
| --- | --- | --- | --- | --- | --- |
| WorkingProcedure_Equipment_Rel | 关系实体 | create | POST | `/services/dynamic/api/WorkingProcedure_Equipment_Rel/create` | 建立工序与设备的关联关系 |
| WorkingProcedure_Equipment_Rel | 关系实体 | find | POST | `/services/dynamic/api/WorkingProcedure_Equipment_Rel/find/{pageSize}/{curPage}` | 查询工序关联的设备 |
| WorkingProcedure_Material_Rel | 关系实体 | create | POST | `/services/dynamic/api/WorkingProcedure_Material_Rel/create` | 建立工序与物料的关联关系 |
| WorkingProcedure_Material_Rel | 关系实体 | find | POST | `/services/dynamic/api/WorkingProcedure_Material_Rel/find/{pageSize}/{curPage}` | 查询工序关联的物料 |

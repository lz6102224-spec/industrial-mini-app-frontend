# 工业 miniApp · 制造数字化管理平台

> 赛项：**工业 miniAPP 开发赛项（本科组）** · 铸魂育人・智汇工软
> 场景：某精密行星减速器制造企业的制造数字化管理
> 数据底座：华为 **iDME 数据建模引擎（xDM-F）**

---

## 一、项目简介

本工程为该赛项的前端（展现层）实现。围绕精密行星减速器制造企业的设备、物料、工序、工艺管理需求，构建符合 xDM-F 数据模型驱动的工业 miniApp。

**核心原则：业务层、展示层与数据层的交互全部通过 xDM-F API 完成**（赛题硬性前提，绕过 xDM-F 得 0 分）。前端所有数据访问统一收敛在 `src/api/xdmf/` 封装层，页面层不直接拼接 URL、不直接读写本地假数据。

### 技术栈

| 层次 | 技术 |
|---|---|
| 框架 | Vue 3.5 + TypeScript 5.6 |
| 构建 | Vite 5.4 |
| UI | Element Plus 2.8 |
| 状态 | Pinia 2.2 |
| 路由 | Vue Router 4.4 |
| 请求 | Axios 1.7 |
| 可视化 | ECharts 5.5（模型图谱） |
| 样式 | SCSS |

---

## 二、快速开始

```bash
cd mini-app-frontend

# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 Mock 模式，可独立演示）
npm run dev

# 3. 浏览器访问
#    http://localhost:5173
```

---

## 三、运行模式

| 命令 | 数据源 | 适用场景 |
|---|---|---|
| `npm run dev` | **Mock 内置数据** | 本地开发、功能演示，无需后端即可跑通全部功能 |
| `npm run dev:real` | 真实 xDM-F 运行态 | 本地联调，需先完成 `.env` 配置与运行态 SDK 部署 |
| `npm run build` | Mock 数据的生产包 | 构建产物到 `dist/` |
| `npm run build:real` | 真实接口的生产包 | 参赛演示构建（走真实 xDM-F） |
| `npm run preview` | — | 本地预览构建产物 |
| `npm run gen:api-doc` | — | 生成 `docs/xdmf-api-list.md`（参赛提交物） |
| `npm run typecheck` | — | TypeScript 类型检查 |

> **重要提示**：Mock 仅作为开发期替身，其**请求/响应结构与 xDM-F 完全一致**。参赛演示与最终验收必须切换到真实 xDM-F 接口。

---

## 四、接入真实 xDM-F 运行态

赛题要求：数据建模在 xDM-F 公有云完成，模型建好后**下载运行态 SDK 部署到本地**，业务层调用**本地运行态 API**，在本地完成 miniApp 开发。

### 1. 配置 `.env`

工程根目录 `.env`：

```ini
# 本地运行态 SDK 部署后的访问地址
VITE_XDMF_ENDPOINT=http://127.0.0.1:8080

# 运行态环境 ID（部署 xDM-F 运行态时生成）
VITE_XDMF_ENV_ID=env-01

# 应用英文名（设计态发布的应用 ID）
# ⚠️ 必须与 xDM-F 设计态发布的应用英文名完全一致
VITE_XDMF_APP_ID=IndustrialMiniAPP

# iDME 获取的 X-Auth-Token（有效期 24 小时，过期需重新获取）
VITE_XDMF_TOKEN=

# 专属云场景需要，公有云留空
VITE_XDMF_PROJECT_ID=

VITE_REQUEST_TIMEOUT=15000
```

最终请求基础路径为：

```
{endpoint}/{envId}/rdm_{appId}_app
```

### 2. 切换模式并启动

```bash
npm run dev:real
```

开发服务器已配置 `/rdm_` 代理转发（见 `vite.config.ts` 的 `server.proxy`），可规避跨域问题。

### 3. 运行时填写 Token

页面右上角 **「连接配置」** 可直接粘贴 `X-Auth-Token`，会保存到浏览器 localStorage，无需重启服务。

### 4. 实体英文名必须对齐

前端调用形如 `POST /services/dynamic/api/{entityName}/{op}`。以下实体名**必须与 xDM-F 设计态发布的英文名完全一致**，否则返回 404：

| 前端常量 | 实体名 | 类型 |
|---|---|---|
| `DATA_ENTITIES.Equipment` | `Equipment` | 数据实体 |
| `DATA_ENTITIES.Part` | `Part` | 数据实体 |
| `DATA_ENTITIES.PartCategory` | `PartCategory` | 数据实体 |
| `DATA_ENTITIES.PartVersion` | `PartVersion` | 数据实体 |
| `DATA_ENTITIES.WorkingProcedure` | `WorkingProcedure` | 数据实体 |
| `DATA_ENTITIES.WorkingPlan` | `WorkingPlan` | 数据实体 |
| `RELATION_ENTITIES.PlanProcedureRel` | `WorkingPlan_WorkingProcedure_Rel` | 关系实体 |
| `RELATION_ENTITIES.ProcedureEquipmentRel` | `WorkingProcedure_Equipment_Rel` | 关系实体 |
| `RELATION_ENTITIES.ProcedureMaterialRel` | `WorkingProcedure_Material_Rel` | 关系实体 |
| `RELATION_ENTITIES.PartBomRel` | `Part_BOM_Rel` | 关系实体 |

定义位置：`src/api/xdmf/entities.ts`。若本地建模时命名不同，只需改动此文件。

---

## 五、Mock ↔ 真实 一键切换机制

切换由 `src/api/xdmf/adapter.ts` 中的**自定义 axios adapter** 实现：

```
VITE_USE_MOCK=true   → 挂载 mockAdapter，请求不发出网络，直接由本地 Mock 引擎处理
VITE_USE_MOCK=false  → 使用 axios 默认 httpAdapter，请求打到真实 xDM-F 运行态
```

关键文件职责：

| 文件 | 职责 |
|---|---|
| `src/api/xdmf/config.ts` | 读取环境变量，拼装基础路径 |
| `src/api/xdmf/request.ts` | axios 实例、注入 `X-Auth-Token`、统一错误处理、语义化操作封装 |
| `src/api/xdmf/adapter.ts` | **Mock/真实切换 + 响应外层归一化** |
| `src/api/xdmf/registry.ts` | API 登记表（提交物「接口列表」的唯一数据源） |
| `src/mock/utils.ts` | 复刻 xDM-F 的 filter 求值 / 分页 / 排序语义 |
| `src/mock/db.ts` | 内存数据库，含软删除 `rdmDeleteFlag`，持久化到 localStorage |

**响应归一化**：不同版本 xDM-F 的响应外层字段存在差异（`code/msg` 或 `result/pageInfo/errors`），统一由 adapter 归一化为 `{ ok, data, pageInfo, message }`，页面层只消费该结构。

### xDM-F 接口形态要点

- 业务实体走**动态数据服务**，全部为 **POST**，请求体包裹在 `{"params": {...}}`
- 路径：`/services/dynamic/api/{entityName}/{op}`
- `op`：`create | batchCreate | update | batchUpdate | delete | batchDelete | get | batchGet | list | find | query | count | select | saveAs`
- **分页在路径中**：`/services/dynamic/api/{entityName}/find/{pageSize}/{curPage}`
- 条件查询结构：

```json
{
  "params": {
    "filter": {
      "joiner": "and",
      "conditions": [
        { "conditionName": "equipmentCode", "operator": "like", "conditionValues": ["EQ%"] }
      ]
    },
    "sorts": [{ "orderBy": "createTime", "sort": "DESC" }],
    "isNeedTotal": true
  }
}
```

- 运算符：`= != > >= < <= like in not in ISNULL NOTNULL`
- **布尔值只能传 `true/false`**；日期用 ISO8601 格式
- **关系实体不支持批量操作**，工序关联、BOM、工艺-工序均逐条调用 `create`

---

## 六、目录结构

```
mini-app-frontend/
├─ index.html                 入口 HTML
├─ vite.config.ts             构建配置（含 /rdm_ 代理）
├─ tsconfig.json              TS 配置
├─ .env                       通用配置（xDM-F 连接参数）
├─ .env.mock                  Mock 模式：VITE_USE_MOCK=true
├─ .env.development           联调模式：VITE_USE_MOCK=false
├─ .env.production            生产模式：VITE_USE_MOCK=false
├─ scripts/
│  └─ gen-api-doc.mjs         由 registry 生成接口清单文档
├─ docs/
│  └─ xdmf-api-list.md        【提交物】xDM-F 接口列表
└─ src/
   ├─ main.ts                 应用入口
   ├─ App.vue                 根组件
   ├─ api/xdmf/               ★ xDM-F 封装层
   │  ├─ config.ts            环境配置与基础路径
   │  ├─ request.ts           axios 实例 + 语义化操作
   │  ├─ adapter.ts           ★ Mock/真实切换 + 响应归一化
   │  ├─ registry.ts          ★ API 登记表
   │  ├─ entities.ts          实体英文名常量
   │  └─ modules/             业务接口（equipment/part/procedure/plan）
   ├─ mock/                   Mock 引擎
   │  ├─ index.ts             URL 解析与分发
   │  ├─ db.ts                内存数据库（软删除、localStorage）
   │  ├─ utils.ts             filter/排序/分页语义复刻
   │  ├─ handlers/crud.ts     动态数据服务处理器
   │  └─ seeds/index.ts       种子数据
   ├─ stores/                 Pinia 状态
   ├─ router/                 路由配置
   ├─ layout/                 布局（侧边菜单、顶栏）
   ├─ views/                  页面
   │  ├─ dashboard/           首页概览
   │  ├─ equipment/           设备管理
   │  ├─ part/                物料管理
   │  ├─ procedure/           工序管理
   │  ├─ plan/                工艺路线
   │  ├─ model/               数据模型图谱
   │  └─ dev/                 xDM-F 接口清单
   ├─ components/             通用组件（ProTable/EditableTable/EmptyState…）
   ├─ composables/            useTable / useCrud
   ├─ constants/dict.ts       字典与预设模板
   ├─ utils/                  工具函数
   ├─ types/                  TS 类型定义
   └─ styles/                 全局样式与主题变量
```

---

## 七、功能与评分点对照

| 评分项 | 分值 | 前端功能 | 页面 |
|---|---|---|---|
| 设备管理 | 10 | 设备增删改查；10 项基础字段；技术参数 / 备品备件自定义扩展属性；注册分配唯一标识符 | 设备管理 |
| 物料管理 | 25 | 物料 CRUD；多级分类管理；版本管理（saveAs 升版）；按编码/名称等属性搜索；BOM 构建 | 物料管理 |
| 配置工序 | 5 | 5 道工序（毛坯制造 → 粗加工 → 精加工 → 检测 → 入库），支持一键初始化 | 工序管理 |
| 配置工艺路线 | 10 | 工艺路线「中心轮零件加工」v1.0；工序关联与顺序编排；详情步骤条 | 工艺路线 |
| 工业数据建模 | 30 | 四实体 + 四关系图谱可视化，含数据量统计与导出 | 数据模型图谱 |
| 架构先进性 | 10 | 统一 API 封装层、Mock 可切换、composables 复用、类型完备 | 全局 |
| 用户体验 | 10 | 首页看板、loading/骨架屏/空态、统一错误提示、响应式布局 | 全局 |

### 赛题要求的关键配置

- **5 道工序**：毛坯制造、粗加工、精加工、检测、入库 —— 工序管理页「一键初始化 5 道工序」
- **工艺路线**：中心轮零件加工，版本 1.0 —— 工艺路线页「一键创建『中心轮零件加工』」（自动按流程顺序关联 5 道工序）

---

## 八、交付物生成

赛题要求提交以下内容，命名格式：`参赛编号-团队名-作品名`。

### 1. 应用功能演示录屏

```bash
npm run dev
```

建议演示路径：首页概览 → 设备管理（新增含扩展属性的设备）→ 物料管理（分类 / 版本 / BOM）→ 工序管理（一键初始化 5 道工序）→ 工艺路线（一键创建 + 工序关联）→ 数据模型图谱 → xDM-F 接口清单。

### 2. 工程代码 zip 文件

```bash
# 排除依赖与构建产物
cd mini-app-frontend
# 打包时请剔除 node_modules 与 dist
```

建议压缩包内保留：`src/`、`scripts/`、`docs/`、`public/`、`package.json`、`vite.config.ts`、`tsconfig*.json`、`.env*`、`README.md`。

### 3. xDM-F 模型图谱与模型导出

- **模型图谱截图**：进入「数据模型图谱」页面截图，页面内可点「导出图谱数据」下载 JSON（`xdmf-model-graph.json`）
- **模型导出 Excel**：在 xDM-F 设计态完成模型导出（本工程仅前端，Excel 由设计态导出）

### 4. 调用的 xDM-F API 列表

两种方式任选：

- 页面导出：进入「xDM-F 接口清单」页，点击「导出 Markdown」或「导出 JSON」
- 命令行生成：

```bash
npm run gen:api-doc
# 产物：docs/xdmf-api-list.md
```

---

## 九、常见问题

### Q1. 启动报错 `The package "@esbuild/win32-x64" could not be found`

**原因**：`esbuild` 主包与 `@esbuild/win32-x64` 平台包**版本不一致**（esbuild 按精确版本查找平台包，版本对不上即报"找不到"）。

**排查**：

```bash
node -e "console.log(require('./node_modules/esbuild/package.json').version)"
node -e "console.log(require('./node_modules/@esbuild/win32-x64/package.json').version)"
```

两者版本必须一致。若不一致：

```bash
rm -rf node_modules/@esbuild/win32-x64
npm install @esbuild/win32-x64@<与esbuild主包一致的版本> --save-optional
```

若仍无法解决，彻底重装：

```bash
rm -rf node_modules package-lock.json
npm install
```

### Q2. 真实模式下接口返回 404

**原因**：前端实体英文名与 xDM-F 设计态发布名称不一致。

**处理**：核对 `src/api/xdmf/entities.ts`，确保与设计态完全一致。

### Q3. 真实模式下返回 401 / 403

**原因**：`X-Auth-Token` 无效或已过期（xDM-F 的 Token 有效期为 **24 小时**）。

**处理**：重新从 iDME 获取 Token，在页面右上角「连接配置」中更新。

### Q4. 请求跨域失败

**处理**：确认通过 `npm run dev:real` 启动（已配置 `/rdm_` 代理），并检查 `.env` 中 `VITE_XDMF_ENDPOINT` 是否指向本地运行态。

### Q5. 如何恢复演示数据

Mock 模式下，点击页面右上角 **「重置演示数据」**，会清空 localStorage 中的本地数据并恢复种子数据。

### Q6. 页面上的数据源角标是什么

右上角角标显示当前数据源：**Mock 内置数据**（黄）或 **xDM-F 运行态**（绿）。演示前请确认已切换为真实运行态。

---

## 十、说明

本工程为赛项**前端（展现层）**实现。业务层（SpringBoot 3.0 / JDK17）与数据层（xDM-F）的建模工作需在对应环境中完成，本工程通过标准化封装层与之对接。

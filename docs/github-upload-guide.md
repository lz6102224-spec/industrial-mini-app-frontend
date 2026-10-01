# GitHub 上传操作指南

> 目标：把本工程（`E:\workfiles\mini-app-frontend`）上传到一个 **GitHub 私有仓库**。  
> 环境已就绪，**无需安装任何额外工具**，全程在 PowerShell 中执行。

---

## 一、前置检查

打开 **PowerShell**，先确认三项就绪：

```powershell
git --version
git config --global user.name
git config --global user.email
git config --global credential.helper
```

预期输出（本机实际情况）：

| 命令                  | 预期结果                                                      |
| ------------------- | --------------------------------------------------------- |
| `git --version`     | `git version 2.54.0.windows.1`                            |
| `user.name`         | `sniffer`                                                 |
| `user.email`        | `lz6102224@qq.com`                                        |
| `credential.helper` | `manager` ← **关键**，这是 Git Credential Manager，推送时能自动弹浏览器授权 |

> **为什么不用装 gh CLI**：本机系统 Git 自带 GCM 2.7.3，`git push` 时会自动唤起浏览器完成 GitHub 授权，比命令行工具更省事。
>
> ⚠️ 若 `credential.helper` 输出不是 `manager`，执行一次：
>
> ```powershell
> git config --global credential.helper manager
> ```

---

## 二、步骤 1：完善忽略规则与换行符配置

`.gitignore` 决定哪些文件**不进版本库**。本工程当前已有基础版（含 `node_modules`、`dist`），够用。

推荐替换为下面这份更完整的版本（用编辑器打开 `E:\workfiles\mini-app-frontend\.gitignore`，全选覆盖）：

```gitignore
# ===== 依赖与构建产物 =====
node_modules
dist
dist-ssr
.vite
*.tsbuildinfo

# ===== 环境变量 =====
# .env / .env.mock / .env.development / .env.production 为共享配置模板，需要提交
# 本地覆盖与含密钥的配置一律忽略
.env.local
.env.*.local
*.local

# ===== 日志 =====
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# ===== 编辑器与 IDE =====
.vscode/*
!.vscode/extensions.json
.idea

# ===== 操作系统 =====
.DS_Store
Thumbs.db
desktop.ini

# ===== 缓存 =====
.eslintcache
.cache
```

### 关于 `.env` 为什么要提交

Vite 的约定是：

| 文件                                                   | 是否提交 | 用途                    |
| ---------------------------------------------------- | ---- | --------------------- |
| `.env`                                               | ✅ 提交 | 共享配置模板（团队共用）          |
| `.env.mock` / `.env.development` / `.env.production` | ✅ 提交 | 各模式开关，无敏感信息           |
| `.env.local`                                         | ❌ 忽略 | 放**真实 Token 等密钥**，不共享 |

本工程 `.env` 中 `VITE_XDMF_TOKEN` 为**空值**，作为模板提交是安全的。  
将来拿到真实 Token，请写进 `.env.local`（已被忽略），**不要**填进 `.env`。

> 💡 `node_modules` 有 226MB、`dist` 有 2.8MB，**一旦被提交会让仓库体积爆炸**。  
> 后面的核对步骤务必认真执行。

### 统一换行符：`.gitattributes`

Windows 与 macOS / Linux 的换行符不同（`CRLF` vs `LF`）。本机系统 Git 的 `core.autocrlf` 为 `true`，会在提交时把 `LF` 转成 `CRLF`，导致两个问题：

- 提交时 git 反复警告 `LF will be replaced by CRLF the next time Git touches it`
- 与 Linux / macOS 协作或跑跨平台 CI 时，产生**整文件假 diff**（内容一个字没改，却显示整个文件被改动）

解决办法：在工程根目录新增 `.gitattributes`，统一声明为 `LF`。

新建文件 `E:\workfiles\mini-app-frontend\.gitattributes`，内容：

```gitattributes
# 统一换行符为 LF，避免 Windows / macOS / Linux 协作时产生整文件假 diff
* text=auto eol=lf

# 批处理脚本保持 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# 二进制文件不做换行转换
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
```

> 💡 本工程现有文件**全部是 LF**，与 `eol=lf` 的要求一致，因此**不会产生任何重新规范化的改动**，放心添加。
>
> 验证是否生效（在工程根目录执行）：
>
> ```powershell
> git check-attr text eol -- README.md
> # 预期输出：
> # README.md: text: auto
> # README.md: eol: lf
> ```

---

## 三、步骤 2：初始化本地仓库并提交

```powershell
(git ls-files).Count

git init
git add -A

# ★ 关键核对：确认 node_modules 与 dist 没有被纳入
git status --short
```

**核对要点**：`git status --short` 的输出里**不应出现** `node_modules` 或 `dist`。  
如果出现了，说明 `.gitignore` 没生效，请回到步骤 1 检查。

**状态字母含义**：`git status --short` 每行前两列是状态码，重点看下面几种：

| 状态   | 含义                    | 处理                                    |
| ---- | --------------------- | ------------------------------------- |
| `A ` | 已暂存（新文件，等待提交）         | ✅ 正常，可直接 `commit`                      |
| `AM` | 已暂存，但暂存后工作区又被改动       | ⚠️ 需**重新执行 `git add -A`**，把最新改动补进暂存区   |
| `??` | 未跟踪（未被 `.gitignore` 匹配） | 确认是否要提交，要则 `git add <文件>`            |

> 💡 最常见的 `AM` 触发场景：`git add` 之后又用编辑器打开文件保存过（编辑器自动格式化、行尾补空格都会算作改动）。处理办法很简单——**再执行一次 `git add -A`** 即可。

再确认一下待提交文件数量：

```powershell
(git ls-files).Count
```

预期为 **73**（72 个工程文件 + 1 个本指南文档）。若数字是几万，说明 `node_modules` 被纳入了，立即停止：

```powershell
git rm -r --cached node_modules
git rm -r --cached dist
git status --short
```

确认无误后提交：

```powershell
git commit -m "feat: 工业 miniApp 前端工程初始化"
```

确认分支名为 `main`：

```powershell
git branch
```

若不是 `main`，执行 `git branch -M main`。

---

## 四、步骤 3：在 GitHub 创建空私有仓库

1. 浏览器打开 **<https://github.com/new>**
2. 填写：
   | 字段              | 值                                                 |
   | --------------- | ------------------------------------------------- |
   | Repository name | `industrial-mini-app-frontend`                    |
   | Description     | `工业 miniApp 前端 · 精密行星减速器制造数字化管理（基于华为 iDME xDM-F）` |
   | 可见性             | 选 **Private**（私有）                                 |
3. ⚠️ **三个复选框全部不要勾**：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   > 勾了会导致远程仓库**非空**，推送时报 `failed to push some refs`。
4. 点 **Create repository**
5. 创建后页面会显示仓库地址，形如：
   ```
   https://github.com/<你的用户名>/industrial-mini-app-frontend.git
   ```
   复制它（点右侧复制按钮）。

---

## 五、步骤 4：关联远程并推送

回到 PowerShell（把下面的 URL 换成你自己的）：

```powershell
git remote add origin https://github.com/<你的GitHub用户名>/industrial-mini-app-frontend.git

# 确认远程配置正确
git remote -v

# 推送
git push -u origin main
```

**首次推送会自动弹出 Git Credential Manager 的授权窗口**：

1. 窗口里选 **Sign in with your browser**
2. 浏览器打开 GitHub 授权页，点 **Authorize**
3. 回到 PowerShell，推送自动继续

> 无需输入密码。GitHub 早已停用密码认证，GCM 走的是 OAuth 授权。
>
> 授权一次后会记住，之后 `git push` 不再询问。

---

## 六、步骤 5：验证上传结果

### 网页核对

刷新仓库页面，应看到：

- 文件列表包含 `README.md`、`src/`、`docs/`、`package.json`、`vite.config.ts` 等
- **不包含** `node_modules/`、`dist/`
- 页面顶部有 **Private** 标记

### 命令行核对

```powershell
# 查看远程分支
git branch -r

# 确认没有 node_modules 被跟踪（应无任何输出）
git ls-files | Select-String node_modules

# 查看已跟踪文件总数
(git ls-files).Count
```

---

## 七、后续日常使用

### 改了代码后提交

```powershell
git add -A
git commit -m "描述本次改动"
git push
```

### 打版本标签（便于对照参赛提交版本）

```powershell
git tag -a v1.0.0 -m "首次提交：赛题前端工程"
git push origin v1.0.0
```

之后在 GitHub 的 **Releases / Tags** 页面就能看到 `v1.0.0`，可下载对应版本的源码 zip。

### 查看改动历史

```powershell
git log --oneline
git status
```

---

## 八、常见问题排查

| 现象                             | 原因                     | 解决办法                                                                               |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------------------------- |
| `remote: Repository not found` | URL 用户名/仓库名写错，或当前账号无权限 | `git remote -v` 核对 URL；确认登录的是有权限的账号                                                |
| 推送时要求输入用户名和密码                  | 凭据助手未生效                | `git config --global credential.helper manager`，然后重试                               |
| 没弹出授权窗口                        | 同上                     | 同上；或手动执行 `git credential-manager github login`                                     |
| `failed to push some refs`     | 建仓库时勾了 README，远程非空     | `git pull --rebase origin main` 后再 `git push`                                      |
| 误提交了 `node_modules`            | `.gitignore` 未生效       | `git rm -r --cached node_modules` → `git commit -m "chore: 移除误提交的依赖"` → `git push` |
| 想改仓库名或可见性                      | —                      | GitHub 仓库 **Settings** 页直接改；若改了仓库名，本地需 `git remote set-url origin <新URL>`          |
| 想彻底撤销本地仓库                      | —                      | 删除 `E:\workfiles\mini-app-frontend\.git` 文件夹即可（源码不受影响）                             |
| 文件显示 `AM` 而非 `A `                 | 暂存后又被改动（编辑器自动格式化、行尾补空格等） | 再执行一次 `git add -A`，然后 `git status --short` 确认变回 `A `                                |

---

## 九、合规提醒

- 📌 本工程为**参赛作品**，建议保持仓库为 **Private**，评审结束前不对外公开
- 📌 **切勿**把真实 `X-Auth-Token` 提交进版本库。真实 Token 写 `.env.local`（已被忽略）
- 📌 若需团队协作：仓库 **Settings → Collaborators** 添加成员，无需改为公开
- 📌 提交前扫一眼 `git status --short`，确认没有意外文件混入

---

## 附录：不想用命令行的替代方案

如果完全不想碰命令行，也可以用 GitHub 网页上传：

1. 在 <https://github.com/new> 创建空私有仓库
2. 进入仓库页，点 **uploading an existing file**
3. 把工程文件**拖拽**进去

⚠️ 但这个方式有两个明显问题：

- **必须手动剔除 `node_modules` 和 `dist`**，否则网页上传会失败或极慢
- 后续更新文件需要重复拖拽，无法追踪改动历史

**因此仍推荐用上面的 Git 命令流程**，一次配置好，之后维护成本极低。

---

*文档生成时间：2026-10-01*

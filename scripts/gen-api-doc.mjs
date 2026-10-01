/**
 * 由 API 登记表生成 xDM-F 接口清单文档
 *
 * 用法：npm run gen:api-doc
 * 产物：docs/xdmf-api-list.md（可直接作为参赛作品提交物「工程中调用的 iDME xDM-F API 列表」）
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { transform } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = path.join(root, 'src', 'api', 'xdmf', 'registry.ts')
const outputDir = path.join(root, 'docs')
const outputPath = path.join(outputDir, 'xdmf-api-list.md')

async function loadRegistry() {
  const source = await readFile(registryPath, 'utf8')
  // registry.ts 无外部依赖，直接转译为 ESM 后动态导入
  const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'node18' })
  const cacheDir = path.join(root, 'node_modules', '.cache')
  await mkdir(cacheDir, { recursive: true })
  const cacheFile = path.join(cacheDir, `xdmf-registry-${Date.now()}.mjs`)
  await writeFile(cacheFile, code, 'utf8')
  return import(pathToFileURL(cacheFile).href)
}

async function main() {
  const { API_REGISTRY, registryToMarkdown } = await loadRegistry()
  await mkdir(outputDir, { recursive: true })

  const header = [
    `<!-- 由 scripts/gen-api-doc.mjs 自动生成于 ${new Date().toLocaleString('zh-CN')} -->`,
    ''
  ].join('\n')

  await writeFile(outputPath, header + registryToMarkdown(API_REGISTRY), 'utf8')

  console.log(`[gen-api-doc] 已生成接口清单：${path.relative(root, outputPath)}`)
  console.log(`[gen-api-doc] 共登记 ${API_REGISTRY.length} 个 xDM-F 接口`)
}

main().catch((error) => {
  console.error('[gen-api-doc] 生成失败：', error)
  process.exitCode = 1
})

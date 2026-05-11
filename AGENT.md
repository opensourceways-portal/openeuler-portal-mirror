# AGENT.md — openEuler-portal GEO 开发工作流

## 工作流目标

建立「新页面开发 → 本地验证 → 上线复检」的闭环，确保每个页面上线前完成 SEO/GEO 全量检查。

## 适用场景

- 新页面开发
- 重大内容改版
- SEO 问题修复验证

## 工作流编排

### Phase 1: 开发阶段

```
开发新页面 → 配置 SEO 元素 → 本地预览验证
```

**步骤**：

1. 运行 `/new-page-init` — 关键词研究 + 内容规划
2. 开发页面内容（Markdown + Vue 组件）
3. 运行 `/optimize-meta` — 配置 TDK + OG 标签
4. 运行 `/generate-schema` — 配置 JSON-LD
5. 启动本地开发服务器：`pnpm dev`

### Phase 2: 本地验证阶段

```
本地预览 → SEO 全量诊断 → 问题修复 → 循环验证
```

**步骤**：

1. 确认开发服务器已启动（默认 http://localhost:5173）
2. 运行 `/local-check` — 本地 SEO 诊断
3. 检查诊断报告，修复 Critical 问题
4. 重新运行 `/local-check`，直到 Critical 问题全部解决
5. Important 问题建议修复，Minor 问题可选

### Phase 3: 上线后复检

```
页面上线 → 等待索引更新 → 生产环境验证
```

**步骤**：

1. 合并 PR，等待部署完成
2. 等待 7-14 天（AI 索引更新周期）
3. 运行 `/post-deploy-check` — 生产环境验证
4. 对比本地审计 vs 线上实际，确认优化效果

### Phase 4: GEO 效果追踪（可选）

```
关联 geo-workflow → AI 引用率评估 → 再优化
```

**步骤**：

1. 在 geo-workflow 的 questions.json 中添加该页面相关问题
2. 填写 official_urls（指向该页面）
3. 运行 geo-workflow 的评估流程
4. 如果 AI 引用率低，返回 Phase 1 再优化

## 快速检查

在任意阶段，可使用 `/quick-seo-check` 快速检查单个页面的 SEO 基础状态。

## 检查项清单

### 基础 SEO 检查项（Critical）

- Title 长度 30-60 字符
- Description 长度 120-160 字符
- Canonical 存在且正确
- H1 有且仅 1 个
- JSON-LD 至少 1 个有效 schema
- 图片 alt 覆盖率 ≥95%

### GEO 特定检查项（Critical）

- 首段 150 字内有定义句（含具体数字+来源）
- FAQ 区块覆盖 5-8 个问题
- FAQPage JSON-LD 配置
- 每个数据有出处标注

## 文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| TDK 配置 | `app/.vitepress/tdks/zh.ts` / `en.ts` | 页面 title/description/keywords |
| JSON-LD | `app/.vitepress/jsonld/general.ts` | 通用页面 schema |
| SIG Schema | `app/.vitepress/jsonld/sigs/*.jsonld.json` | SIG 专用 schema |
| llms.txt | `app/.vitepress/LLMsTxtSections.ts` | AI 可引用内容配置 |

## 环境依赖

- **geo-skills**：本地 SEO 诊断工具（crawl.js + analyze.js）
  - 默认路径：`/Users/gzbang/Desktop/Project/10_Common/Code/geo-skills`
  - 可通过 `geo_skills_path` 参数自定义

## 注意事项

1. **本地验证必须用 browser 模式**（开发服务器是客户端渲染）
2. **OG 标签需要补充**（当前 config.ts 未配置 og:image 等）
3. **llms.txt 自动生成**，确保新页面路径被包含
4. **sitemap 自动生成**，无需手动维护
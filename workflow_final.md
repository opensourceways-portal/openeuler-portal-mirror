# WORKFLOW.md — openEuler-portal GEO 优化工作流

## 一、工作流概述

基于「可检索性 → 可信度 → 易读性」三维度，建立「开发 → 验证 → 修复 → 再验证」的闭环。

核心流程：
```
开发阶段（配置 SEO 元素）
    ↓
本地验证（开发服务器）
    ↓
线上验证（生产环境）
    ↓
GEO 效果追踪（geo-workflow）
    ↓
问题修复 → 再验证
```

---

## 二、GEO 优化维度（analytics.md）

| 维度 | 目标 | 开发类改进 | 内容类改进 |
|------|------|-----------|-----------|
| **可检索性** | AI 爬虫能发现 | 静态化、Schema、TDK、Sitemap、llms.txt | 补充重点页面 |
| **可信度** | AI 放心引用 | 过时页面标记 | 结论前置、FAQ、数据表格、内链密度 |
| **易读性** | AI 易理解 | 语义化标签 | 数据表格、锚点链接 |

---

## 三、开发阶段

### 3.1 静态化页面

**现状**：已实现（VitePress SSG）

**验证方式**：
- 检查构建产物 `dist/` 是否为纯静态 HTML
- 使用 crawl.js 抓取，检查是否无需 JS 渲染

---

### 3.2 增加 Schema（JSON-LD）

**对应工具**：
- 生成脚本：`geo-skills/scripts/generate-schema.js`（待开发）
- 或 CLI：`geo-skills/bin/generate-schema`（待开发）

**来源约束**：Schema 内容必须来源于页面本身（标题、描述、FAQ、发布日期等）

**配置位置**：
- 通用页面：`app/.vitepress/jsonld/general.ts`
- SIG 专用：`app/.vitepress/jsonld/sigs/*.jsonld.json`

**Schema 类型（按页面类型）**：

| 页面类型 | Schema 类型 | 必需字段 |
|---------|------------|---------|
| 首页 | Organization + FAQPage | name、url、logo、faq |
| 博客/新闻 | Article | headline、author、datePublished、dateModified |
| SIG 详情 | Organization + CollectionPage | name、description、member |
| 下载页 | SoftwareApplication | name、version、downloadUrl |
| 迁移专区 | HowTo + FAQPage | step、faq |
| 用户案例 | CaseStudy | name、client、result |
| Q&A 页面 | FAQPage | question、answer |

---

### 3.3 完善 TDK

**对应工具**：
- 生成脚本：`geo-skills/scripts/optimize-tdk.js`（待开发）
- 或 CLI：`geo-skills/bin/optimize-tdk`（待开发）

**来源约束**：TDK 内容必须来源于页面本身
- Title：来源于页面 H1 或 frontmatter.title
- Description：来源于页面首段摘要
- Keywords：来源于页面核心关键词提取

**配置位置**：
- `app/.vitepress/tdks/zh.ts`（中文）
- `app/.vitepress/tdks/en.ts`（英文）

**标准**：
- Title：30-60 字符，关键词在前半部分
- Description：120-160 字符，包含关键信息和行动引导
- Keywords：3-5 个核心关键词

---

### 3.4 完善 Sitemap

**对应工具**：
- 生成脚本：`openEuler-portal/genSitemap.js`（已有）
- 或 VitePress 内置 sitemap 插件（已有）

**配置位置**：
- `app/.vitepress/sitemap/sitemap-zh.ts`
- `app/.vitepress/sitemap/sitemap-en.ts`

**验证项**：
- 所有页面路径已包含
- lastmod 时间戳正确
- priority 合理分配（首页 1.0，重要页面 0.8，其他 0.5）

---

### 3.5 完善 robots.txt

**对应工具**：
- 生成脚本：`geo-skills/scripts/generate-robots.js`（待开发）
- 或手动配置（已有）

**配置位置**：
- `app/.vitepress/public/robots.txt`（静态文件）

**标准**：
- Allow 所有重要页面
- Disallow 无意义页面（如后台、临时页面）
- 指明 Sitemap 位置

---

### 3.6 完善 llms.txt 和 llms-full.txt

**对应工具**：
- 生成脚本：`app/.vitepress/plugins/generateLLMsTxtNew/`（已有）
- 或 CLI：`geo-skills/bin/generate-llms-txt`（待开发）

**来源约束**：内容必须来源于页面本身
- llms.txt：页面路径 + 标题 + 简要描述
- llms-full.txt：页面正文内容（自动提取）

**配置位置**：
- `app/.vitepress/LLMsTxtSections.ts`（定义哪些页面要包含）

**验证项**：
- 重要页面全部覆盖
- 内容结构清晰（标题、摘要、正文分段）
- 更新频率与页面更新同步

---

### 3.7 语义化页面标签

**对应工具**：无（开发时手动保证）

**标准**：
- H1 有且仅 1 个（页面主标题）
- H2-H6 层次清晰，无跳跃
- 使用 `<article>`、`<section>`、`<nav>` 等语义化标签
- 图片必须有 alt（描述性文本，包含关键词）

---

### 3.8 过时页面标记

**对应工具**：
- 管理脚本：`geo-skills/scripts/mark-obsolete.js`（待开发）

**标准**：
- 在页面 frontmatter 标记 `archived: true`
- 添加警告提示：「本文档已过时，请查看最新版本」
- 在 sitemap 降低 priority 或排除

---

## 四、验证阶段

### 4.1 本地验证（开发服务器）

**触发时机**：开发完成后，提交 PR 前

**验证方式**：根据 Sitemap 遍历所有页面

**验证流程**：

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 根据 Sitemap 遍历验证
node geo-skills/scripts/validate-local.js \
  --sitemap=dist/sitemap.xml \
  --dev-server=http://localhost:5173 \
  --mode=browser \
  --output=geo-audit/local/
```

**验证脚本（对应开发项）**：

| 开发项 | 验证脚本 | 验证内容 |
|--------|---------|---------|
| 静态化 | `validate-static.js` | 检查 HTML 是否可无 JS 渲染 |
| Schema | `validate-schema.js` | JSON-LD 有效性、类型匹配 |
| TDK | `validate-tdk.js` | Title/Description/Keywords 长度、关键词 |
| Sitemap | `validate-sitemap.js` | URL 覆盖、lastmod、priority |
| robots.txt | `validate-robots.js` | 格式正确、Allow/Disallow 合理 |
| llms.txt | `validate-llms-txt.js` | 页面覆盖、内容来源正确 |
| 语义化 | `validate-semantics.js` | H1 数量、层次、alt 覆盖率 |
| 过时标记 | `validate-archived.js` | 标记页面是否正确提示 |

**验证结果**：
- 按页面生成报告：`geo-audit/local/{page_path}-validation.md`
- 按严重级别分类：Critical（必须修复）、Important（建议）、Minor（可选）
- 修复清单：优先级排序

---

### 4.2 线上验证（生产环境）

**触发时机**：PR 合并后，部署完成

**验证方式**：根据 Sitemap 遍历所有页面（HTTP 模式）

**验证流程**：

```bash
# 根据 Sitemap 遍历验证
node geo-skills/scripts/validate-production.js \
  --sitemap=https://www.openeuler.org/sitemap.xml \
  --mode=http \
  --output=geo-audit/deployed/
```

**验证脚本（同本地）**：
- 静态化、Schema、TDK、Sitemap、robots.txt、llms.txt、语义化、过时标记

**额外验证项（线上特有）**：
- HTTP 状态码（200）
- robots.txt 未阻止
- Sitemap.xml 包含
- llms.txt 包含
- 页面加载速度（可选）

**对比验证**：
- 对比本地验证 vs 线上验证
- 确认开发配置已正确部署

---

### 4.3 验证报告格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEO 验证报告 — {page_path}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

验证时间: {timestamp}
验证模式: local / production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
可检索性验证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 静态化: HTML 可无 JS 渲染
✅ Schema: FAQPage JSON-LD 有效
❌ TDK: Description 长度 180 字符（超出标准）
✅ Sitemap: 已包含，priority 0.8
✅ robots.txt: Allow
✅ llms.txt: 已包含

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
易读性验证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ H1: 1 个
❌ 图片 alt: 覆盖率 85%（标准 ≥95%）
⚠️  H2 层次: 有一处跳跃（H1 → H3）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
修复清单
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [Critical] Description 镀度超出标准
   → 操作：修改 tdks/zh.ts，缩短至 120-160 字符
   → 来源：重新从页面首段提取摘要

2. [Critical] 图片 alt 覆盖率不足
   → 操作：检查 Markdown 图片标签，补充 alt

3. [Important] H2 层次跳跃
   → 操作：调整标题结构，确保 H1→H2→H3
```

---

## 五、问题修复阶段

### 5.1 问题来源

**来源 1**：验证阶段发现的问题（本地/线上）
**来源 2**：geo-workflow 发现的问题（AI 未引用）

### 5.2 问题分类（按 analytics.md）

| 问题类型 | 修复方式 | 涉及文件 |
|---------|---------|---------|
| **可检索性问题** | 工程修复 | Schema、TDK、Sitemap、llms.txt 配置文件 |
| **可信度问题** | 内容修复 | 页面 Markdown、FAQ、数据表格 |
| **易读性问题** | 工程+内容 | 标题结构、图片 alt、语义化标签 |

### 5.3 修复流程

**工程类问题**：
```
问题定位 → 使用对应脚本修复 → 本地验证 → 提交 PR
```

**内容类问题**：
```
问题定位 → 创建内容工单 → SIG 协作 → 内容审核 → PR 合入
```

---

## 六、GEO 效果追踪阶段

### 6.1 触发时机

PR 合并后 7-14 天（等待 AI 索引更新）

### 6.2 验证方式

通过 geo-workflow 评估 AI 引用率

### 6.3 流程

```
geo-workflow 添加问题 → 填写 official_urls → 采样评分
    ↓
引用率 OK → 结束
    ↓
引用率低 → 分析原因 → 返回修复阶段
```

### 6.4 引用率低的原因（按 analytics.md）

| 原因 | 归因维度 | 修复方向 |
|------|---------|---------|
| Schema 缺失 | 可检索性 | 添加 Schema |
| TDK 不优 | 可检索性 | 优化 TDK（关键词、描述） |
| 内容单薄 | 可信度 | 补充内容、FAQ、数据表格 |
| 无内链 | 可信度 | 增加相关页面链接 |
| 标签混乱 | 易读性 | 语义化改造 |

---

## 七、Issue Label 状态机

| Label | 含义 | 触发时机 |
|------|------|----------|
| `geo:dimension/discoverable` | 可检索性问题 | 验证阶段发现 |
| `geo:dimension/trustworthy` | 可信度问题 | 验证阶段发现 |
| `geo:dimension/readable` | 易读性问题 | 验证阶段发现 |
| `geo:category/schema` | Schema 问题 | 分类 |
| `geo:category/tdk` | TDK 问题 | 分类 |
| `geo:category/content` | 内容问题 | 分类 |
| `geo:category/semantics` | 语义化问题 | 分类 |
| `geo:status/fixing` | 正在修复 | PR open |
| `geo:status/merged-pending-recheck` | 已合并待回归 | PR merge |
| `geo:status/verified-improved` | GEO 有效 | geo-workflow 验证通过 |
| `geo:status/verified-no-effect` | GEO 无效 | geo-workflow 验证失败 |

---

## 八、关键文件映射

| 改进项 | 配置/生成文件 | 验证脚本 |
|--------|--------------|---------|
| 静态化 | `dist/*.html`（构建产物） | `validate-static.js` |
| Schema | `app/.vitepress/jsonld/*.ts` | `validate-schema.js` |
| TDK | `app/.vitepress/tdks/*.ts` | `validate-tdk.js` |
| Sitemap | `dist/sitemap.xml`（自动生成） | `validate-sitemap.js` |
| robots.txt | `app/.vitepress/public/robots.txt` | `validate-robots.js` |
| llms.txt | `app/.vitepress/LLMsTxtSections.ts` | `validate-llms-txt.js` |
| 语义化 | 页面 Markdown + Vue 组件 | `validate-semantics.js` |
| 过时标记 | frontmatter `archived: true` | `validate-archived.js` |

---

## 九、工具脚本清单（待开发）

### 开发类脚本

| 脚本 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `generate-schema.js` | 生成 JSON-LD | 页面内容 | jsonld/*.ts |
| `optimize-tdk.js` | 优化 TDK | 页面内容 | tdks/*.ts |
| `generate-robots.js` | 生成 robots.txt | 配置规则 | robots.txt |
| `generate-llms-txt.js` | 生成 llms.txt | 页面内容 | llms.txt / llms-full.txt |
| `mark-obsolete.js` | 标记过时页面 | 页面列表 | frontmatter 更新 |

### 验证类脚本

| 脚本 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `validate-local.js` | 本地全量验证 | Sitemap + dev server | validation reports |
| `validate-production.js` | 线上全量验证 | Sitemap (URL) | validation reports |
| `validate-static.js` | 验证静态化 | HTML 文件 | report |
| `validate-schema.js` | 验证 Schema | HTML + jsonld/*.ts | report |
| `validate-tdk.js` | 验证 TDK | HTML + tdks/*.ts | report |
| `validate-sitemap.js` | 验证 Sitemap | sitemap.xml | report |
| `validate-robots.js` | 验证 robots.txt | robots.txt | report |
| `validate-llms-txt.js` | 验证 llms.txt | llms.txt + pages | report |
| `validate-semantics.js` | 验证语义化 | HTML | report |
| `validate-archived.js` | 验证过时标记 | HTML | report |

---

## 十、工作流执行示例

### 示例：新页面开发完整流程

```
1. 开发新页面（Markdown + Vue）
    ↓
2. 配置 SEO 元素（使用脚本）
   - generate-schema.js（来源：页面内容）
   - optimize-tdk.js（来源：页面内容）
   - 验证 llms.txt 自动包含（来源：页面内容）
    ↓
3. 本地验证
   - 启动 pnpm dev
   - validate-local.js（Sitemap 遍历）
   - 修复 Critical 问题
    ↓
4. 提交 PR → L1 验证（CI）
    ↓
5. 合并入主分支 → 部署
    ↓
6. 线上验证
   - validate-production.js（Sitemap 遍历）
   - 确认配置已部署
    ↓
7. GEO 效果追踪（7-14 天后）
   - geo-workflow 评估 AI 引用率
   - 引用率 OK → 结束
   - 引用率低 → 返回修复
```

---

## 十一、自动化建议（可选）

### CI 集成（本地验证自动化）

**文件**：`openEuler-portal/.github/workflows/geo-validation.yml`

```yaml
on: [pull_request]
jobs:
  local-validation:
    steps:
      - pnpm dev &（启动开发服务器）
      - node geo-skills/scripts/validate-local.js
      - 生成验证报告
      - Critical 问题 → fail PR
```

### CI 集成（线上验证自动化）

**文件**：`openEuler-portal/.github/workflows/production-validation.yml`

```yaml
on:
  push:
    branches: [main]
jobs:
  production-validation:
    steps:
      - 等待部署完成
      - node geo-skills/scripts/validate-production.js
      - 生成验证报告
      - 保存到 geo-audit/deployed/
```

---

## 十二、版本记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.0 | 2026-05-08 | 结合 workflow2 + analytics.md，明确脚本映射 |
| v1.0 | 2026-05-08 | 初版工作流框架 |
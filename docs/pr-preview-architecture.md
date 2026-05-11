# openEuler Portal PR 预览系统技术方案

## 1. 背景与目标

**目标**：实现 PR 提交后自动构建并生成预览地址，运营人员可自行提 PR、查看预览效果。

**预览地址**：`https://preview.openeuler.org/pr-{number}/`

---

## 2. 整体架构

```
┌──────────────┐    Webhook    ┌──────────────────┐    上传     ┌─────────────────────┐
│   AtomGit    │ ────────────► │   CI 构建        │ ──────────► │   华为云 OBS         │
│   PR 事件     │               │                  │             │   preview.openeuler │
└──────────────┘               └──────────────────┘             └─────────────────────┘
        │                              │                                  │
        │                              │                                  │
        │◄─────────────────────────────┴──────────────────────────────────┘
                              评论预览链接
```

**流程**：
1. 开发者提交 PR
2. AtomGit 触发 Webhook，CI 开始构建
3. 构建完成，上传静态资源到 OBS
4. 自动在 PR 下评论预览链接

---

## 3. OBS 部署结构

```
Bucket: openeuler-portal-preview
域名: preview.openeuler.org（需绑定并开启静态网站托管）

目录结构:
├── pr-123/          # PR #123 预览
│   ├── index.html
│   └── assets/
├── pr-124/          # PR #124 预览
└── ...

访问方式:
https://preview.openeuler.org/pr-123/  → PR #123 预览
https://preview.openeuler.org/pr-124/  → PR #124 预览
```

**清理策略**：PR 关闭或合并后自动删除对应目录。

---

## 4. 核心技术方案

### 4.1 VitePress base URL 问题

**问题**：当前 `base: '/'` 写死在 `app/.vitepress/config.ts:150`，预览部署在 `/pr-123/` 子路径会导致静态资源 404。

**解决方案**：环境变量动态设置 base。

**修改 `app/.vitepress/config.ts`**：

```ts
// 在文件顶部添加
const PREVIEW_BASE = process.env.VITE_PREVIEW_BASE || '/';

// 修改 sitemap 配置（预览环境禁用）
const config: UserConfig = {
  sitemap: PREVIEW_BASE === '/' ? {
    hostname: sitemapHostname,
    // ... 原有配置保持不变
  } : false,
  
  // 修改 base
  base: PREVIEW_BASE,
  
  // ... 其他配置保持不变
};
```

**CI 构建时注入**：
```bash
export VITE_PREVIEW_BASE="/pr-${CI_MERGE_REQUEST_IID}/"
pnpm build
```

### 4.2 硬编码路径排查

| 类型 | 示例 | 是否需要处理 |
|------|------|--------------|
| VitePress 配置 | `base: '/'` | ✅ 已处理 |
| head 中的资源 | `/favicon.ico` | ❌ VitePress 自动处理 |
| public 目录资源 | 直接引用 | ❌ VitePress 自动处理 |
| 代码中绝对路径 | `fetch('/api/xxx')` | ⚠️ 需排查 |
| 路由跳转 | `router.push('/zh/xxx')` | ⚠️ 需排查 |

**排查命令**：
```bash
grep -rn '"/zh/' app/.vitepress/src --include="*.vue" --include="*.ts"
grep -rn '"/en/' app/.vitepress/src --include="*.vue" --include="*.ts"
grep -rn "fetch('/" app/.vitepress/src --include="*.vue" --include="*.ts"
```

### 4.3 Git Clone 优化

**不需要完整 clone**，使用浅克隆 + 缓存：

```yaml
variables:
  GIT_DEPTH: 1              # 浅克隆，只取最新提交
  GIT_STRATEGY: fetch       # 增量拉取

cache:
  key: "${CI_COMMIT_REF_SLUG}"
  paths:
    - node_modules/
    - app/.vitepress/cache/
```

**预计构建时间**：
- 首次构建：~3 分钟
- 缓存命中后：~1-1.5 分钟

### 4.4 构建优化（跳过 git fetch）

当前 `package.json` 中 build 命令：
```json
"build": "git fetch --unshallow && vitepress build app"
```

`git fetch --unshallow` 用于获取完整 git 历史以生成 last-modified 信息，预览环境可跳过。

**方案**：修改 build 脚本或通过环境变量控制。

---

## 5. CI/CD 完整配置

创建 `.atomgit-ci.yml`：

```yaml
stages:
  - build
  - deploy
  - comment
  - cleanup

variables:
  GIT_DEPTH: 1
  OBS_BUCKET: openeuler-portal-preview
  PREVIEW_DOMAIN: https://preview.openeuler.org

# ==================== 构建阶段 ====================
build:preview:
  stage: build
  only:
    - merge_requests
  cache:
    key: "node-${CI_COMMIT_REF_SLUG}"
    paths:
      - node_modules/
  script:
    - echo "Building preview for MR ${CI_MERGE_REQUEST_IID}"
    - export VITE_PREVIEW_BASE="/pr-${CI_MERGE_REQUEST_IID}/"
    - pnpm install --prefer-offline
    - pnpm build
  artifacts:
    paths:
      - app/.vitepress/dist/
    expire_in: 1 day

# ==================== 部署阶段 ====================
deploy:preview:
  stage: deploy
  only:
    - merge_requests
  needs:
    - build:preview
  script:
    - OBS_PATH="pr-${CI_MERGE_REQUEST_IID}"
    - echo "Deploying to ${OBS_BUCKET}/${OBS_PATH}"
    - obsutil sync ./app/.vitepress/dist/ obs://${OBS_BUCKET}/${OBS_PATH}/ -delete
  environment:
    name: preview/pr-${CI_MERGE_REQUEST_IID}
    url: ${PREVIEW_DOMAIN}/pr-${CI_MERGE_REQUEST_IID}/
    on_stop: cleanup:preview

# ==================== 评论阶段 ====================
comment:preview:
  stage: comment
  only:
    - merge_requests
  needs:
    - deploy:preview
  script:
    - |
      PREVIEW_URL="${PREVIEW_DOMAIN}/pr-${CI_MERGE_REQUEST_IID}/"
      COMMENT="## 预览已就绪
      
      **预览地址**: ${PREVIEW_URL}
      
      > 此预览会在 PR 关闭或合并后自动清理"
      
      curl -X POST \
        "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/merge_requests/${CI_MERGE_REQUEST_IID}/notes" \
        -H "PRIVATE-TOKEN: ${ATOMGIT_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"body\": \"${COMMENT}\"}"

# ==================== 清理阶段 ====================
cleanup:preview:
  stage: cleanup
  only:
    variables:
      - $CI_MERGE_REQUEST_EVENT_TYPE == "closed"
  script:
    - OBS_PATH="pr-${CI_MERGE_REQUEST_IID}"
    - echo "Cleaning up ${OBS_BUCKET}/${OBS_PATH}"
    - obsutil rm -r obs://${OBS_BUCKET}/${OBS_PATH}/
  when: always
```

### 5.1 CI 环境变量配置

在 AtomGit CI 项目设置中配置：

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `OBS_ACCESS_KEY` | 华为云 AK | 华为云控制台 |
| `OBS_SECRET_KEY` | 华为云 SK | 华为云控制台 |
| `ATOMGIT_TOKEN` | AtomGit API Token | AtomGit 个人设置 |
| `OBS_BUCKET` | OBS Bucket 名称 | 固定值 |
| `PREVIEW_DOMAIN` | 预览域名 | 固定值 |

### 5.2 obsutil 工具安装

CI 环境需预装 obsutil，或在 CI 中安装：

```yaml
before_script:
  - |
    if ! command -v obsutil &> /dev/null; then
      wget https://obs-community.obs.cn-north-1.myhuaweicloud.com/obsutil/current/obsutil_linux_amd64.tar.gz
      tar -xzf obsutil_linux_amd64.tar.gz
      ./obsutil_linux_amd64*/obsutil config -i=${OBS_ACCESS_KEY} -k=${OBS_SECRET_KEY} -e=obs.cn-north-4.myhuaweicloud.com
      export PATH=$PATH:$(pwd)/obsutil_linux_amd64*
    fi
```

---

## 6. 文件修改清单

| 文件 | 改动内容 | 优先级 |
|------|----------|--------|
| `app/.vitepress/config.ts` | 动态 base，条件禁用 sitemap | 高 |
| `.atomgit-ci.yml` | 新增 CI 配置 | 高 |
| `package.json` | 可选：build 命令优化 | 中 |
| 代码中硬编码路径 | 排查并修复（如有） | 中 |

---

## 7. 实施步骤

| 步骤 | 任务 | 负责人 | 依赖 |
|------|------|--------|------|
| 1 | 创建 OBS Bucket、绑定域名、开启静态网站托管 | 运营 | - |
| 2 | 配置 CI 环境变量（AK/SK、Token） | 运营 | 步骤1 |
| 3 | 修改 `config.ts` 支持动态 base | 开发 | - |
| 4 | 排查代码中硬编码绝对路径 | 开发 | - |
| 5 | 创建 `.atomgit-ci.yml` | 开发 | 步骤3、4 |
| 6 | 提测试 PR 验证流程 | 开发 | 步骤2、5 |
| 7 | 合并到主分支，正式上线 | 开发 | 步骤6 |

---

## 8. 待确认事项

| 序号 | 事项 | 说明 |
|------|------|------|
| 1 | AtomGit CI 变量名 | 需确认 MR 编号变量名（示例用 GitLab 风格 `CI_MERGE_REQUEST_IID`） |
| 2 | AtomGit API 格式 | 需确认 PR 评论 API 地址和鉴权方式 |
| 3 | PR 关闭事件 | 需确认 CI 是否支持 MR 关闭事件触发 |
| 4 | obsutil 安装方式 | 需确认 CI 环境是否预装，或需自行安装 |

---

## 9. 成本估算

| 资源 | 单价 | 预估用量 | 月成本 |
|------|------|----------|--------|
| OBS 存储 | ¥0.099/GB/月 | 50GB | ~¥5 |
| OBS 流量 | ¥0.5/GB | 100GB | ~¥50 |
| CI 构建时间 | 按实际计费 | ~500分钟 | ~¥50 |
| **合计** | - | - | **~¥105/月** |
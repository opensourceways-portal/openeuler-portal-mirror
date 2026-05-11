---
title: 'openEuler × OpenSSF OSV 协作成果分享'
date: '2026-01-23'
category: news
tags:
  - openEuler
banner: 'img/news/20260123-openEuler-OpenSSF OSV/20260123openEuler-OpenSSF OSV_01.jpg'
author: 'openEuler'
summary: 'openEuler × OpenSSF OSV 协作成果分享'
---

OpenAtom openEuler（简称“openEuler”或 “开源欧拉”）安全委员会宣布一项阶段性进展：在软件供应链安全方向，我们与 OpenSSF Open Source Vulnerabilities（简称“OSV”） 生态完成了端到端对接。作为较早完成 OSV 生态对接的 Linux 发行版之一，openEuler 在发行版对接 OSV 的探索中走在前沿，也让 openEuler 的安全公告能够以更标准、更易复用的方式进入主流开源安全工具链，为社区用户与生态伙伴提供更加一致、可落地的漏洞数据与检测能力。

这次协作的核心目标可以概括为让漏洞数据“可见、易得、精准”：一方面，我们将 openEuler 安全公告按 OSV 规范持续输出与维护；另一方面，借助 osv.dev 的公共服务以及 OSV 相关扫描工具，用户与生态伙伴可以以更低集成成本获取更一致、更可用的漏洞查询、集成与检测能力。本文将对整体思路与成果做一个简要介绍。


### 什么是OSV？

OSV是 OpenSSF 旗下的开源漏洞项目，面向开源生态的漏洞数据发布与消费，提供了一套便于工具集成的标准与公共基础设施。与 CVE 相比，OSV 更侧重开源场景下的可计算表达与自动化集成：在受影响范围描述上支持更贴近上游协作方式的字段与语义（例如 commit range 等），并通过与上游社区的数据源对接，让漏洞数据能够更便捷、更高时效地进入工具链与自动化流程。目前 OSV 生态已覆盖主流编程语言生态与多种 Linux 发行版，并仍在持续扩展中。

**OSV 生态的关键组件包括：**

• [osv-schema]：定义统一的漏洞描述格式，包含受影响组件、版本范围、参考链接、生态标识等字段。

• [osv.dev]：公开的 OSV 漏洞数据库与 API 服务，支持托管、检索与查询多生态的漏洞数据。

• [osv-scanner]：开源漏洞扫描工具，可识别目标环境/软件信息，并向 osv.dev 查询匹配的漏洞结果。（其元数据提取与分析能力也在持续演进，相关能力与组件会在工具链内协同使用，例如 osv-scalibr 等。）通过这套标准与工具链，OSV 把“漏洞规范发布”与“漏洞被工具准确消费”连接起来，让数据更顺畅地进入研发、CI/CD 与运维的日常流程。


### 我们具体做了什么？

在 OSV 社区的协作与建议下，我们重点推动 openEuler 漏洞数据从“可发布”走向“可被准确检测”，打通从发布到检测的链路。

**1）按 osv-schema 输出 openEuler 安全公告**  

类似 CSAF、CVRF 等披露格式，我们参照 osv-schema 将 openEuler 安全公告对齐到 OSV 标准，并将其集成到社区漏洞披露流水线中，便于 OSV 生态兼容的服务与工具一致消费。目前，OSV 格式的安全公告数据已发布并持续更新在 openEuler 仓库：

  • <https://repo.openeuler.org/security/data/>

**2）openEuler 作为官方 datasource 接入 osv.dev** 

通过与 OSV 社区协作，我们披露的漏洞数据已接入 osv.dev 的数据源体系。这样一来，openEuler 安全公告可以像其他生态数据一样，通过 osv.dev 的页面与 API 进行检索、查询与集成： 

 • osv.dev 列表页：<https://osv.dev/list?q=&ecosystem=openEuler>

**3）提升 OSV 工具侧的识别与检测准确性（osv-scanner / osv-scalibr）**  

数据接入只是第一步。如果扫描工具无法可靠识别 openEuler 环境并映射到正确的生态标识，就会出现“数据在，但扫不出来”的问题。为此，我们推动了上游工具侧的支持完善，使 OSV 工具链能够更准确地识别 openEuler 环境，并与 OSV 数据集实现更一致的匹配与检测结果。

下面为一个基本的使用示例（详情可参阅官方文档）：

  • 工具文档：<https://google.github.io/osv-scanner/usage/>

安装：

    go install github.com/google/osv-scanner/v2/cmd/osv-scanner@latest

扫描本地 openEuler OS 软件包漏洞：

    osv-scanner scan /var/lib/rpm --experimental-plugins os/rpm

### 意义与价值

#### 对 openEuler 用户与运维团队

• 扫描结果更一致、更可用：通过OSV 生态工具获得更标准化的漏洞查询与检测体验。

• 使用门槛更低：提供主流开源工具链作为选项，辅助日常风险评估与安全加固决策。

#### 对下游开源发行版厂商与生态伙伴

• 对接更轻量：以 OSV 作为标准输入，在统一数据模型上按需扩展，减少重复建设与长期维护成本。

• 维护成本更可控：能力在上游沉淀、在生态复用，避免多方重复投入。

• 响应效率更高：标准化数据更便于在自动化流程中落地（如告警、统计、处置编排等），提升从披露到治理的效率。

#### 对更广泛的开源安全社区

• 统一标准与公共基础设施有助于减少重复建设，降低生态协作成本。

• 协作让分散的安全数据更易被工具规模化使用，形成更好的生态正循环。

### 未来规划

展望未来，我们将持续以 OSV Schema 输出 openEuler 安全公告，并进一步强化数据质量与可用性：包括更精准的受影响范围描述、以CVE维度披露漏洞信息等，以及与上游社区共同完善覆盖范围与工具侧一致性验证，确保端到端结果长期稳定可靠。openEuler 相信开源协作的力量。通过在上游共同建设、对齐 OSV 等共享标准，我们能够减少生态割裂、提升数据质量，并共同推动软件供应链安全走向更可信、更可持续的未来。



---
title: openEuler社区仓库Pull Request的welcome评论@成员定制化指引
category: blog
date: 2022-02-08
tags:
    - openEuler
    - 仓库PR的welcome评论@成员定制化
archives: 2023-02
author: wanghaosq
sig: Infrastructure
summary: openEuler 仓库PR的welcome评论@成员定制化。
---
# 如何定制Pull Request welcome评论中@成员列表

问题背景：当前某些仓库的Pull Request评论第一条的welcome评论中存在@成员过多的问题，导致提起Pull Request的开发者精确找到修改内容对应的责任人稍显困难。<br>
<br>
实现逻辑：机器人通过Pull Request中涉及到的修改的文件，在PATH_OWNER_MAPPING.YAML中进行查找，如查询到责任人信息则反馈到Pull Request的welcome评论中
和Pull Request的责任人分派上，若在文件中查询不到，则在Pull Request的welcome评论中@所有仓库成员。

## 一.仓库维护人自行提供一份PATH_OWNER_MAPPING.YAML文件
此文件包含仓库中文件路径或文件名，以及其对应的责任人信息。<br>
以openeuler/docs仓库为例：<br>
```yaml
relations:
  - path:
      - PATH_OWNER_MAPPING.yaml # 单一文件
      - docs/zh/docs/A-Ops      # 文件路径
    owner:
      - gitee_id: lanlanbenming
        name: zhangshutong
```

## 二.联系基础设施团队进行服务配置
此操作由基础设施团队进行，您只需告知您的仓库已准备好文件，并且确保文件的规范性和正确性即可。
<br>
<br>
示例：<br>
需要考虑的参数：<br>
need_assign：代表需要将查询到的责任人设置为Pull Request的审查人, 默认值为false<br>
welcome_simpler：代表需要对欢迎信息中@的成员进行简化, 默认值为true<br>
```yaml
- repos:
  - openeuler/docs
  community_name: openEuler
  community_repo: community
  branch: master
  command_link: https://gitee.com/openeuler/community/blob/master/en/sig-infrastructure/command.md
  file_path: PATH_OWNER_MAPPING.YAML
  file_branch: master
  need_assign: true
  welcome_simpler: true
```

## 三.效果展示
### 1.未进行welcome评论定制化处理

<img src=./pictures/before_simplify.png>

### 2.进行了welcome评论定制化处理
<img src=./pictures/after_simplify.png>

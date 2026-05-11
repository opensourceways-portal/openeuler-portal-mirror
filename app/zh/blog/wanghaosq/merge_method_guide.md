---
title: openEuler社区仓库Pull Request合入方式指引
category: blog 
date: 2022-11-24
tags:
    - openEuler
    - 仓库PR合入方式
archives: 2022-11
author: wanghaosq
sig: Infrastructure
summary: openEuler 社区仓库PR合入方式指导。
---

# openEuler社区单仓Pull Request合入方式指引
## 一、社区PR合入方式对比
### 1.rebase merge:
变基合并，将所有的提交都合并到目标分支，且在目标仓库的目标分支的changelog中不包含pull request的任何信息.<br>
rebase example:<br>

<img src=./pictures/rebase.png>

<img src=./pictures/rebase-git.png>

<br>

### 2.squash merge: 
扁平化分支合并，将所有的提交合并为一个以PR的title为changelog的新的提交，然后合并到目标分支上.<br>
squash example: <br>

<img src=./pictures/squash.png>

<img src=./pictures/squash-git.png>

### 3.default merge: 
合并分支（默认方式），将所有提交以及新创建一个以PR的title为changelog的提交均合并到目标分支上.

<img src=./pictures/default.png>

<img src=./pictures/default-git.png>

tips: examples中的测试用例均为有两个提交的PR，测试了三种不同的合入方式<br>

三种合入方式图解对比:<br>
<img src=./pictures/three-merge-methods.png>

## 二、单一仓库文件增加merge_method字段配置方式
当前Gitee平台对PR的合入方式提供了三种：***merge***， ***rebase merge***， ***squash merge***，***merge***是默认的合入方式，可不用进行单独配置。

rebase example：
```yaml
name: A-Tune-BPF-Collection
description: A-Tune-BPF-Collection is BPF based tunning tools collection
branches:
- name: master
  type: protected
type: public
merge_method: rebase
```

squash example：
```yaml
name: A-Tune-BPF-Collection
description: A-Tune-BPF-Collection is BPF based tunning tools collection
branches:
- name: master
  type: protected
type: public
merge_method: squash
```

default example:
```yaml
name: A-Tune-BPF-Collection
description: A-Tune-BPF-Collection is BPF based tunning tools collection
branches:
- name: master
  type: protected
type: public
```

## 三、通过Pull Request评论的方式进行合入方式切换
命令使用方式说明：
<br>
en：https://gitee.com/openeuler/community/blob/master/en/sig-infrastructure/command.md
<br>
zh：https://gitee.com/openeuler/community/blob/master/zh/sig-infrastructure/command.md
#### (1) 使用 "/rebase"命令
通过 ***/rebase*** 命令给Pull Request加上***merge/rebase***标签，标志着此合并请求将以变基合并的方式合入(rebase merge)，如果需要切换合并方式，
请使用 ***/rebase cancel*** 去掉***merge/rebase***标签。
#### (2) 使用 "/squash"命令
通过 ***/squash*** 命令给Pull Request加上***merge/squash***标签，标志着此合并请求将以扁平化分支合并的方式合入(squash merge)，如果需要切换合并方式，
请使用 ***/squash cancel*** 去掉***merge/squash***标签。
#### (3)两者均不使用
Pull Request将以默认的***merge***的方式进行合入。

## 四、更改合入方式生效的优先级
Pull Request评论方式 > 仓库文件中配置的merge_method字段

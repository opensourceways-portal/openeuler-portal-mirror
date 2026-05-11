---
title: QuickIssue服务前世今生
category: blog 
date: 2022-11-01
tags:
    - openEuler
    - QuickIssue
    - issue
    - 问题跟踪
    - PR
archives: 2022-10
author: georgecao
sig: Infrastructure
summary: QuickIssue服务简介，包括服务产生的背景，服务的主要功能等。
---

# QuickIssue服务前世今生
## 背景
一个活跃的开源社区，一定都有大量的issue和PR在交错提交、处理、关闭。PR的管理通常是和代码托管平台强相关，不论第三方托管平台亦或是社区自建平台；但issue管理方案各个社区不尽相同。
openEuler社区成立以来，issue管理平台也经历了几轮迭代~~

## 一路成长
####  Gitee平台issue管理
openEuler社区自成立以来，为开发者提供的问题跟踪服务就是代码托管平台Gitee提供的issue管理服务；

一方面，该服务的好处是：
 - 可以很好的将记录问题的issue信息与问题解决的PR关联在一起; 
 - 系统也提供了相应的issue提交、修改、查询等操作;
 - 还有一些简单的统计功能可以统计并导出整个社区所有的issue等；

另一方面，该系统的也有一些不足：
 - 首先是issue提交的入口比较'散'，issue都'散'落在各个代码仓库中，而很多社区使用者或开发者并不清楚需要将自己发现的问题提交到哪个仓库，从而阻碍了issue正常提交；
 - 再者，gitee平台要求issue提交人必须使用gitee账号登录才能提交，而部分社区使用者没有gitee平台账号信息，这样也会影响issue提交；
 - 另外，在问题筛选、过滤等方面可能因为平台数据量大而导致响应速度不够快捷，处理逻辑也和社区开发者预期有出入，也会给使用者带来不便；

####  Bugziila服务
社区开发者呼吁社区提供一个openEuler自己的问题跟踪服务。
因此社区基础设施在2021年年初提供了[bugzilla管理系统](https://bugzilla.openeuler.org/)。该系统是一款用perl语言开发的开源服务，第一版发布于1998年，可以说历史悠久。
该系统上线后因为难以对接gitee平台已有的issue，界面风格陈旧，用户注册管理繁琐，所以注册使用者寥寥无几。

#### QuickIssue：主角来了~
时间来到了2022年……
基础设施团队在深入分析社区需求后，决定提供一个能够满足社区发展的问题跟踪系统，以解决上述问题。
QuickIssue应运而生……它将是这样的……
 - 在openEuler官网提供统一的issue提交入口；
 - 不论提交人是否有代码托管平台账号，都可以提交issue；
 - 可以指导用户或开发者将issue提交到某个仓库，即便不知道，也有默认的地方可供提交；
 - 只为openEuler服务，保证查询、搜索、筛选等操作足够顺滑；
 - 可以和社区已有的SIG管理、贡献统计等服务互通信息；
 - ……

## QuickIssue介绍
QuickIssue服务正如其名，希望能为使用者和开发者提供更便捷的提交issue途径。
我们首先来一睹为快：
- 可以直接通过域名访问： https://quickissue.openeuler.org/zh/ ；
- 也可以从[openEuler官网](https://www.openeuler.org/zh/)跳转：导航【社区】——>【QuickIssue】；
- 还可以通过官网主页的QuickIssue悬窗直接进入；

它提供三个主要功能： 新建issue，查询issue，查询PR；
（有同学会问啦，你都有PR查询啦，还叫QuickIssue，不是服务名称不准确了吗？ 确实，我们争论过是不是要调整名称，但最后大家还是觉得QuickIssue郎朗上口，方便记忆。就它啦 ）
### 新建issue
新建issue功能主要有三个特点：
- 统一了issue提交入口，openEuler社区的所有issue都可以通过这个入口提交；
- 解决了issue提交人没有代码托管平台账号的问题，可以直接使用邮件和验证码完成issue提交；
- 优化了issue提交人查找issue归属仓库的途径，可以按图索骥找仓库，也可以不管三七二十一直接提交默认仓库;

<img src=./pictures/new_issue.png width=700 height=600 />

如果是通过gitee账号提交，QuickIssue会指引提交人根据不同的领域选择合适的SIG组，进而选择合适的仓库来提交；提交issue后对该问题的所有讨论交流都可以直接评论；
如果是通过邮件方式提交，QuickIssue会根据验证码确认邮箱有效性，通过验证后将通知机器人代替提交一条issue，且如果issue提交后在issue评论区有任何评论，QuickIssue都会贴心的将每一条评论都通过邮件通知到提交人；

### 查询issue
这里会展示openEuler社区所有的issue信息，包括归属于各个SIG组，处于各种状态，不同提交者的提交的issue全集。

<img src=./pictures/query_issue.png width=700 height=460/>

QuickIssue针对不同的使用场景提供了较为便捷的筛选功能，可以按照自己需求定向查找。
如果需要查找通过邮件提交的issue，可以在提交人一栏输入邮箱前半段筛选。出于保护提交人邮箱数据隐私的目的，提交人一栏记录的是提交人邮箱的一部分信息。

### 查询PR
这里会展示openEuler社区所有的pull request信息，包括开启的，合入的，关闭的所有状态的PR。通过PR状态、提交人、标签等信息可以筛选出满足场景的PR。

<img src=./pictures/query_pr.png width=700 height=500/>

由于QuickIssue中只包含openEuler社区的全量PR，比代码托管平台自身所管理的PR信息量少很多，且系统采用了缓存数据，所以查询操作响应速度有保障。

## 写在后面的话
社区在飞速发展，服务也在快速迭代，不论是在使用过程中遇到任何问题还是对QuickIssue有新的需求和想法，欢迎反馈给Infrastructure SIG组： infra@openeuler.org ，让QuickIssue能更好服务社区。

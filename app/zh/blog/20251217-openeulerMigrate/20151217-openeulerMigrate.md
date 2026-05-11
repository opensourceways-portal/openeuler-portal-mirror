---
title: 'openEuler社区代码托管平台切换通知'
date: '2025-12-18'
category: blog
tags:
  - openEuler
author: 'openEuler'
summary: 'openEuler 代码托管平台切换'
---


根据开放原子开源基金会openEuler项目群委员会决议，openEuler社区代码托管平台将由 gitee.com平台迁换至 atomgit.com 平台；
近期基础设施（以下称：我们）将牵头开展社区代码托管平台迁移工作，现将迁移工作相关事宜通知如下：

### 我们需要您协助完成：
1.  登录 [Gitee平台](https://gitee.com/profile/account_information) ，如已登录则忽略；    
2.  根据[迁移指引](https://atomgit.com/openeuler-guide)完成新账号绑定和同意书签署 ；   

### 您在社区的历史贡献数据不会因迁移受到影响。
###  我们将会：
1.  自动收集您绑定后的AtomGit平台账号；    
2.  将openEuler社区SIG组的maintainer和committer账号配置到[community仓库](https://atomgit.com/openeuler/community), 确保openEuler社区的SIG组成员的权限和原平台一致；  
3.  我们会将您加入到AtomGit平台 [openeuler](https://atomgit.com/openeuler) 和 [src-openeuler](https://atomgit.com/src-openeuler) 组织成员中； 

### 迁移计划：
1.  12月10日前完成社区代码仓/分支/PR/ISSUE/Comment等内容迁移，由Infrastructure团队联合托管平台统一实施，开发者无需操作；    
2.  12月10日开放账号迁移，开发者在登录[Gitee](https://gitee.com)后根据[迁移指引](https://atomgit.com/openeuler-guide) 完成个人账号迁移；    
3.  12月10日至12月17日作为开发者试用期，提供试用仓库完成相关测试；    
4.  12月20日社区启动托管平台切换：    
       i. 原组织(https://gitee.com/openeuler,  https://gitee.com/src-openeuler) 仓库将调整为只读，并发布平台切换公告；    
       ii. 开发者在在新平台组织(https://atomgit.com/openeuler, https://atomgit.com/src-openeuler) 下代码仓开展贡献；
 
### 迁移影响：
1.  迁移后，开发者参与贡献需重新fork atomgit平台代码仓库, 本地git config配置需同步适配atomgit账号邮箱；
2.  原Gitee平台未合入PR在迁移后如需叠加修改，需在AtomGit平台重新提交PR；
3.  可能出现双平台账号ID不一致(被他人占用)，昵称可以保持一致，Gitee账号绑定后原平台贡献会继承；


### 问题反馈：    
**如果在迁移过程中遇到任何问题，可通过以下渠道反馈，我们将及时处理：**
- 可以在Infrastructure仓库(https://atomgit.com/openeuler/infrastructure) 提交ISSUE反馈问题；
- 可以邮件联系 infra@openeuler.sh 反馈问题；
- 可以扫码加入迁移讨论微信群，及时沟通；   
- 可以扫描添加 openEuler 小助手，并发送 【 AtomGit 】关键字邀请您进迁移讨论微信群；   
  <img src="./media/assistant.png" style="width: 100%; max-width: 200px; height: auto; border: 1px solid #333; padding: 4px;" /><br>


### 附常见FAQ:  
[openEuler社区代码托管平台迁移指导](https://atomgit.com/openeuler/openEuler-agreements/blob/main/Guide/migration-guide.md)


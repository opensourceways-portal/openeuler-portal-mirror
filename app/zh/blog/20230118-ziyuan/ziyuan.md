---
title: openEuler资源利用率提升之道06：虚拟机混部OpenStack调度
category: blog
date: 2023-01-17
tags:
  - openEuler
archives: 2023-01
author:
  - openEuler
summary: 虚拟机混合部署是指把对 CPU、IO、Memory等资源有不同需求的虚拟机通过调度方式部署、迁移到同一个计算节点上，从而使得节点的资源得到充分利用。

---


虚拟机混合部署是指把对 CPU、IO、Memory
等资源有不同需求的虚拟机通过调度方式部署、迁移到同一个计算节点上，从而使得节点的资源得到充分利用。

虚拟机混合部署的场景有多种，比如通过动态资源调度满足节点资源的动态调整；根据用户使用习惯动态调整节点虚拟机分布等等。而虚拟机高低优先级调度也是其中的一种实现方法。在单机的资源调度分配上，区分出高低优先级，即高优先级虚机和低优先级虚机发生资源竞争时，资源优先分配给前者，严格保障其
QoS。

在 OpenStack Nova 中引入虚拟机高低优先级技术，再配合 Skylark QoS
服务能力，可以一定程度上满足虚拟机的混合部署要求。

实现方案
--------

在 Nova
的虚拟机创建、迁移流程中引入高低优先级概念，虚拟机对象新增高低优先级属性。高优先级虚拟机在调度的过程中，会尽可能的调度到资源充足的节点，这样的节点需要至少满足内存不超卖、高优先级虚拟机所用
CPU 不超卖的要求。

用户创建 flavor 或创建虚机时，可指定其优先级属性。但优先级属性不影响
Nova 现有的资源模型及节点调度策略，即 Nova
仍按正常流程选取计算节点及创建虚机。虚机高低优先级特性主要影响虚机创建后单机层面的资源调度分配策略。高优先级虚机和低优先级虚机发生资源竞争时，资源优先分配给前者，严格保障其
QoS。

Nova 针对虚机高低优先级特性有以下改变：

-   VM 对象和 flavor
    新增高低优先级属性配置。同时结合业务场景，约束高优先级属性只能设置给绑核类型虚机，低优先级属性只能设置给非绑核类虚机。

-   对于具有优先级属性的虚机，需修改 libvirt XML 配置，让单机上的 QoS
    管理组件（名为 Skylark）感知，从而自动进行资源分配和 QoS 管理。

-   低优先级虚机的绑核范围有改变，以充分利用高优先级虚机空闲的资源。

如何使用
--------

### 准备

假设有如下一台主机：

1.  假设主机有 12 个 cpu core。

2.  OS 是 openEuler 22.09，已安装 Skylark 服务，且内核版本符合 Syklark
    要求。

3.  已基于 RPM 安装部署好了 OpenStack Yoga 版本。

### 安装

1.  安装 plugin

```
dnf install openstack-plugin-priority-vm
```

2.  配置数据库

```
nova-manage api_db sync

nova-manage db sync
```

3. 重启 nova 服务

```
systemctl restart openstack-nova-*
```

### 配置

1.  修改nova.conf文件

打开/etc/nova/nova.conf，修改\[compute\]内的cpu\_dedicated\_set、cpu\_shared\_set和cpu\_priority\_mix\_enable，其中cpu\_dedicated\_set表示高优先级虚机使用的
CPU 核心，cpu\_shared\_set指低优先级虚机使用的 CPU
核心，cpu\_priority\_mix\_enable表示是否允许低优先虚机同时使用cpu\_dedicated\_set的
CPU 核心，默认值是 False。

以此文章的主机为例，设置如下：

```
[compute]
cpu_dedicated_set=0-7
cpu_shared_set=8-11
cpu_priority_mix_enable=True
```

2.  重启 nova-compute 服务

```
systemctl restart openstack-nova-compute
```

### 使用

1.  创建新的 flavor

```
openstack flavor create --ram 8192 --disk 50 --vcpus 8 --public  --property hw:cpu_priority='low' low_prio
openstack flavor create --ram 8192 --disk 50 --vcpus 8 --public  --property hw:cpu_priority='high' --property hw:cpu_policy='dedicated' high_prio
```

2.  使用新 flavor 创建虚拟机

```
openstack server create --flavor high_prio --image openEuler2203 --network private-network high_prio_test
openstack server create --flavor low_prio --image openEuler2203 --network private-network low_prio_test
```

### 检查

使用virsh list查看虚机 id，然后使用virsh
vcpuinfo命令分别查看两个虚机，可以发现high\_prio\_test的 CPU 与 0-7 号
CPU 一一绑定，low\_prio\_test的 CPU 在 0-11 号 CPU 中范围绑定。

总结
----

本特性的实现已发布在 openEuler 22.09 创新版的 OpenStack Yoga
版本中，也会在即将发布的 openEuler 22.03 LTS SP1 的 OpenStack Train
中集成。欢迎大家体验，在 OpenStack SIG 中反馈问题、交流经验。

加入我们
--------

文中所述资源利用率提升技术，由  Cloud Native SIG、Kernel SIG、OpenStack
SIG、Virt SIG 共同参与，其源码将在 openEuler
社区逐步开源。如果您对相关技术感兴趣，欢迎您的围观和加入。您可以添加小助手微信，加入对应
SIG 微信群。

![图片](./ziyuan/media/image1.jpeg)

系列文章回顾
------------

\[1\] openEuler  资源利用率提升之道  01  ：概论
：https://mp.weixin.qq.com/s/x9sdogEslRJJ5mDbs5bxgQ

\[2\] openEuler  资源利用率提升之道  02  ：典型应用下的效果
：https://mp.weixin.qq.com/s/anOTdRIufYaj5pl4hy1e\_A

\[3\] openEuler  资源利用率提升之道  03  ：rubik 混部引擎
：https://mp.weixin.qq.com/s/jJXeBCRM2k92rPqyA6SL-Q

\[4\] openEuler 资源利用率提升之道 04 ：CPU 抢占和 SMT 隔离控制
：https://mp.weixin.qq.com/s/8Odi24WjKAho8SYsYd7a1A

\[5\] openEuler 资源利用率提升之道 05 ：虚拟机混部介绍与功耗管理技术
：https://mp.weixin.qq.com/s/wXE5cpx2jBvXEISToqhW3Q

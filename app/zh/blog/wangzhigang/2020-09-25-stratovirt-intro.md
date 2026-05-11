---
title: 下一代全场景虚拟化平台StratoVirt
category: blog
date: 2020-09-25
tags:
  - Virt
archives: 2020-09
author:
  - Xiaohe Yang
  - Zhigang Wang
summary: Introduction of StratoVirt
---

# openEuler 重磅利器： StratoVirt 下一代全场景虚拟化平台

**StratoVirt**是计算产业中面向云数据中心的企业级虚拟化平台，实现了一套架构统一支持虚拟机、容器、Serverless 三种场景。StratoVirt 在轻量低噪、软硬协同、Rust 语言级安全等方面具备关键技术竞争优势。

## 为什么叫 StratoVirt?

Strato， 取自 stratosphere ，意指地球大气层中的平流层，寓意为保护 openEuler 平台上业务平稳运行的轻薄保护层。Strato 承载了项目的愿景与未来： 轻量、灵活、 安全和完整的保护能力。

以 Strato 入名，同样代表着 openEuler 对推进下一代全场景虚拟化技术的繁荣、构建虚拟化关键技术竞争力，有着必胜的信心！

## 为什么需要 StratoVirt？

在数据中心领域，虚拟化是资源隔离的重要手段，能以多种粒度提供安全的虚拟运行时环境。传统的虚拟化软件 Qemu 存在代码量庞大、CVE 安全漏洞频出的问题，业界逐步演进出以 Rust 语言实现 microVM 形态的趋势。安全、轻量、高性能、低损耗，组件灵活拆分，全场景（数据中心、终端、边缘设备）通用的虚拟化技术是未来的趋势。

作为华为自研的下一代全场景、性能领先的虚拟化平台，StratoVirt 以极致轻量快速的特质、灵巧的组件配置能力，为轻量虚拟化场景注入澎湃动力，同时也为向标准虚拟化场景的演进提供了无限可能。

## StratoVirt 优势

更轻、更快、更强！StratoVirt 具有极大的行业竞争力， 在于

- 强安全性与隔离性
  - 采用内存安全语言 Rust 编写， 保证语言级安全性；
  - 基于硬件辅助虚拟化实现安全多租户隔离，并通过 seccomp 进一步约束非必要的系统调用，减小系统攻击面；
- 轻量低噪
  - 轻量化场景下冷启动时间<50ms，内存底噪<4M；
- 高速稳定的 IO 能力
  - 具有精简的设备模型，并提供了稳定高速的 IO 能力；
- 资源伸缩
  - 具有 ms 级别的设备伸缩时延，为轻量化负载提供灵活的资源伸缩能力；
- 全场景支持
  - 完美支持 X86 和 Arm 平台：X86 支持 VT，鲲鹏支持 Kunpeng-V，实现多体系硬件加速；
  - 可完美集成于容器生态，与 Kubernetes 生态完美对接，在虚拟机、容器和 serverless 场景有广阔的应用空间；
- 扩展性
  - 架构设计完备，各个组件可灵活地配置和拆分；
  - 设备模型可扩展，可扩展 PCIe 等复杂设备规范，实现标准虚拟机演进；

## StratoVirt 架构

<img src="./StratoVirt-arch.png" style="zoom:67%;" />

麻雀虽小，五脏俱全。StratoVirt 核心架构自顶向下分为三层：

- OCI 兼容接口：兼容 qmp 协议，具有完备的 OCI 兼容能力。
- BootLoader：抛弃传统的 BIOS + GRUB 启动模式， 实现了更轻更快的 BootLoader，并达到极限启动时延。
- MicroVM：充分利用软硬协同能力；精简化设备模型；低时延资源伸缩能力；

## StratoVirt 未来

StratoVirt 的发展路标为， 通过一套架构，支持轻量虚拟机和标准虚拟机两种模式：

- 轻量虚拟机模式下，单虚机内存底噪小于 4MB，启动时间小于 50ms，且支持 ms 级时延的设备极速伸缩能力，当前已经开发完毕，2020 年 9 月已经在 openEuler 社区开源；
- 标准虚拟机模式下，可支持完整的机器模型，启动标准内核镜像，可以达成 Qemu 的能力，同时在代码规模和安全性上有较大优势。

## 关注我们

目前 StratoVirt 已经在 openEuler 社区开源，期待你的围观和加入！

项目地址：https://gitee.com/openeuler/stratovirt

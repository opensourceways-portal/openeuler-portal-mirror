---
title: 'StratoVirt—Next-Generation All-Scenario Virtualization Platform'
category: blog
date: 2020-09-25
tags:
  - Virt
archives: 2020-09
author:
  - Xiaohe Yang
  - Zhigang Wang
summary: Introduction to StratoVirt
---

# openEuler Next-Generation All-Scenario Virtualization Platform: StratoVirt

StratoVirt is an enterprise-class virtualization platform oriented to cloud data centers in the computing industry. It uses a unified architecture to support VM, container, and serverless scenarios. StratoVirt has competitive advantages in key technologies such as light weight, low overhead, software and hardware synergy, and Rust language-level security.

## What Does StratoVirt Mean?

Strato, shortened from "stratosphere", means that StratoVirt protects the stable running of services on openEuler as the stratosphere protects the Earth. Strato carries the vision of the project: being lightweight, flexible, and secure.

Strato also shows openEuler's confidence in promoting the prosperity of next-generation all-scenario virtualization technologies and building the competitiveness of key virtualization technologies.

## Why Do We Need StratoVirt?

In the data center industry, virtualization is an important means of resource isolation and can provide a secure virtual runtime environment at multiple granularities. The traditional virtualization software QEMU is heavy and encounters frequent CVE vulnerabilities. The industry tends to use the Rust language to implement microVMs. Universal virtualization technologies for all scenarios (data centers, terminals, and edge devices) are the future trend, featuring security, light weight, high performance, low overhead, and flexible component grouping.

StratoVirt is a virtualization platform with leading performance in all scenarios. It is lightweight, fast, and flexible in component grouping, injecting power to lightweight virtualization scenarios and providing infinite possibilities for evolution to standard virtualization scenarios.

## Advantages of StratoVirt

Lighter, faster, and stronger! StratoVirt has great competitiveness in the industry in terms of the following perspectives:

- Enhanced security and isolation  
  - The memory-safe programming language Rust is used to ensure language-level security.  
  - Secure multi-tenant isolation is implemented based on hardware-assisted virtualization. Moreover, seccomp is used to restrict unnecessary system calls to reduce system attack surface.  
- Light weight and low overhead  
  - In lightweight scenarios, the cold startup time is less than 50 ms, and the memory overhead is less than 4 MB.  
- High-speed and stable I/O capabilities  
  - Its simplified device models provide stable and high-speed I/O capabilities.  
- Resource scaling
  - Millisecond-level device scaling latency provides flexible resource scaling capabilities for lightweight loads.  
- All-scenario support
  - Support for x86 and ARM platforms: VT for the x86 platform and Kunpeng-V for the Kunpeng platform, implementing multi-system hardware acceleration.  
  - It can be perfectly integrated into the container ecosystem and interconnected with the Kubernetes ecosystem, thus has wide application in VM, container, and serverless scenarios.  
- Flexible scalability
  - The architecture design is complete, and each component can be flexibly configured and grouped.  
  - The device models can be expanded, including complex device specifications such as PCIe, to implement standard VM evolution.  

## StratoVirt Architecture

<img src="./StratoVirt-arch.png" style="zoom:67%;" />  

The StratoVirt architecture is simple but complete. Its core architecture is divided into three layers from top to bottom:

- OCI-compatible APIs: StratoVirt is compatible with the QEMU Monitor Protocol and has complete OCI compatibility capabilities.  
- BootLoader: StratoVirt abandons the conventional BIOS + GRUB boot mode and implements the lighter and faster BootLoader, achieving low boot latency.  
- MicroVM: StratoVirt fully utilizes software and hardware collaboration capabilities, simplifies device models, and provides low-latency resource scaling capabilities.  

## Roadmap of StratoVirt

The roadmap of StratoVirt is to support both lightweight and standard VMs in one architecture.

- In the lightweight VM mode, the memory overhead of a single VM is less than 4 MB, the startup time is less than 50 ms, and the device scaling latency is millisecond-level. This mode has been developed and open sourced in the openEuler community in September 2020.  
- In the standard VM mode, StratoVirt supports a complete machine model, and the standard kernel image can be started to achieve QEMU capabilities. In addition, StratoVirt has great advantages in code scale and security.  

## Follow Us

StratoVirt is open sourced in the openEuler community. We look forward to your participation!

Project address: https://gitee.com/openeuler/stratovirt

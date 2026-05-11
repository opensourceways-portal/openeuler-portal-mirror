---
title: 'openEuler & Friends 3.0 全场景联合创新'
date: '2023-01-09'
category: news
tags:
  - openEuler
banner: 'img/banners/20230113-live.png'
author: 'openEuler'
summary: '自开源以来，openEuler持续围绕用户实际使用场景进行全流程、全场景的技术创新。'
---


自开源以来，openEuler持续围绕用户实际使用场景进行全流程、全场景的技术创新。在本次openEuler
Summit上，来自数据中心、云计算、边缘计算、嵌入式等主流场景的用户和开发者为我们带来了openEuler
& Friends 3.0 Demo
Show，围绕上(高效迁移)、用(安全、稳定、高效的使用)、管(便捷运维)等全流程为观众们呈现了10场Live
Demo
Show，通过展示openEuler创新技术项目在各领域中的实际使用效果，展现了openEuler的多样性算力支持、丰富的软硬件生态、强大的协同能力，以及openEuler社区与各伙伴的深度合作和繁荣的开发者生态。

-   **迁移场景-高效、可靠**

随着数字化转型深入，操作系统正在向支持多样性计算、支持全场景的方向发展。在数字化转型的过程中，企业面临迁移操作系统的刚性需求，借助x2openEuler工具的迁移评估和原地升级技术，
可以实现全场景业务的“简单、平稳、高效”的迁移。电信天翼云基于openEuler社区的x2openEuler定制化开发了X2ctyunos，在centos系统的搬迁过程中，每一个环节都会用到这个工具进行相关的升级前兼容性检查，满足原地升级的情况下，一键化实现原地升级。借助X2ctyunos的能力，CTyunOS在全国已应用30000+套，新增扩建场景全面替换CentOS，覆盖天翼云IaaS层全部组件以及云翼平台paas组件，已上线时间一年，运行稳定，表现优异；


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/08-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E9%AB%98%E6%95%88%E8%BF%81%E7%A7%BB%E6%96%B9%E6%A1%88.mp4">
</video>

-   **服务器场景-高安全、高性能**

**全链安全可信，服务可信的移动云**

在云场景下，如何结合可信计算、机密计算、全栈国密等技术，在数据传输、数据处理和数据存储等阶段为云主机提供全方位的、多层次立体保护，打造“无死角”的数据安全闭环，构建全链路信任安全架构是移动云重点关注的方向，大云天元操作系统是中国移动自主研发的企业级Linux操作系统，自2015年启动研发，于2021年完成以国内openEuler根开源社区为基础的重要转变，深耕内核创新、安全可信、性能革新、自主开放等领域，为移动云提供高性能、高稳定、更安全可靠的统一技术基座，目前外部商用项目超过130个，累计部署物理节点26万+，在移动云上订购虚机节点4万+，实现规模化商业应用。移动天元操作系统(BC-Linux)通过与openEuler社区联创，实现了数据传输加密、数据生产加密、可信状态传递、国密全栈支持等能力，在安全性满足最新等级保护2.0要求的基础上，启动静态度量性能提升20%+。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/07-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E5%AE%89%E5%85%A8%E9%AB%98%E6%95%88%E7%9A%84%E5%8F%AF%E4%BF%A1%E4%BA%91%E4%B8%BB%E6%9C%BA.mp4">
</video>

**上交所欧拉原生CICD解决方案**

面向未来“十四五”，上海证券交易所在数字化转型中制定了“打造一个体系、构建两条主线、夯实三个基础”的整体规划，以实现加强技术创新应用，打造数字智能型交易所的整体目标；上交所与openEuler社区深度合作，借助openEuler社区的开放性和易用性以及领先的多样性算力支持能力，在较短时间内就完成了欧拉原生的多平台、多制品持续集成流水线，实现了多平台质量控制及制品产出能力，同时openEuler提供的iSula、BiShengJDK等技术项目在性能、底噪、功能等方面有着众多优势，在更高资源利用率的情况下提供了更全面的质量控制能力，帮助上交所实现了增产不增人。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/10-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E5%8E%9F%E5%A3%B0CICD%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88.mp4">
</video>

-   **云计算场景-高资源利用率**

随着业务的不断发展以及集群规模的不断扩大，如何集群的资源利用率是新浪微博近年来重点研究的技术方向，根据实际业务分析，总结出以下三个影响资源利用率的主要问题：1)业务专用集群，非共享模式，独立的服务划分单独的资源池；2)对业务资源预估不准确，按照峰值或者高峰时段的资源使用量申请；3）部署多副本容灾，整体流量分散到多个副本，资源利用率不足。经过充分的调研和对比，新浪微博选择了openEuler社区的Rubik业务混布解决方案来提升整体资源利用率；在
Rubik
解决方案中，包括了集群感知调度、单机混部引擎（Rubik）和内核隔离技术等多层次优化系统，可以在确保QoS的情况下，极大提升资源利用率，在新浪微博的实际使用中，CPU平均利用率从25%提升至60%+，在线业务QoS抖动&lt;10%，同时整体混部规模达到上千节点，为离线任务提供数万个VCore的计算能力，加速离线任务运行速度，节约了数百台服务器采购成本。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/09-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E4%BA%91%E4%B8%8A%E8%B5%84%E6%BA%90%E5%88%A9%E7%94%A8%E7%8E%87%E5%80%8D%E5%A2%9E.mp4">
</video>

-   **嵌入式场景-强实时、富功能**

**完备的嵌入式生态**

openEuler
Embedded具有强实时、高可靠、易用性强等特点，来自北京航空航天大学杭州创新研究院大数据与工业智联网研究室的开发者完成了openEuler
Embedded在工业领域的软硬件适配验证以及30\*24H的不间断测试，基于此研究室决定将北航全部机器人底层系统迁移到openEuler生态，同时加强与openEuler社区的深入合作，继续拓展openEuler在嵌入式领域生态和应用。

同时，openEuler
Embedded还具备了完备的ROS2生态，来自中科创达的社区开发者已经在22.03
LTS版本上完成了ROS2中全量的核心包、超过80%的工具包以及NAV2、cartographer等应用功能的引入和验证，并成功稳定运行，为ROS机器人的开发和应用提供了基础。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/02-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E5%AE%8C%E5%A4%87%E7%9A%84%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%94%9F%E6%80%81.mp4">
</video>

**混合关键性系统**

工控设备、机器人系统、智能车系统、航天设备对功能和生态的需求日益丰富，对实时性、可靠性、安全性提出了更高的要求，由单一OS承载所有功能面临的挑战越来越大。解决方式之一就是不同系统负责各自所擅长的功能，如
Windows 的 UI、Linux
的网络通信与管理、实时操作系统的高实时与高可靠等，而且还要易于开发、部署、扩展，实现的形式可以是容器、虚拟化等，这就是混合关键性系统。openEuler
Embedded 的当前思路是 「混合关键性系统 = 部署 + 隔离 + 调度」
，即首先实现多 OS 的混合部署，再实现多 OS
之间的隔离与保护，最后通过混合关键性调度提升资源利用率，具体可以映射到
「混合部署框架」 和 「嵌入式虚拟化」 。混合部署框架解决
「高效地混合部署问题」 和 「高效地通信与协作问题」 ，嵌入式虚拟化解决
「高效地隔离与保护问题」 和 「高效地资源共享与调度问题」 。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/03-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E6%B7%B7%E5%90%88%E5%85%B3%E9%94%AE%E6%80%A7%E7%B3%BB%E7%BB%9F.mp4">
</video>

-   **端边协同场景-自发现、自组网**

分布式软总线技术可以自动发现周围的其它设备，并且将他们连接形成网络。当前分布式软总线相关服务已引入openEuler社区；本次会议来自openEuler社区的开发者为大家带来了分布式软总线在无人机森林防火场景的具体应用，项目通过分布式软总线提供的分布式通信能力，使无人机、鸿蒙终端、边缘算力设备间能够快速认证和组网；无人机机群作为超级终端，鸿蒙终端作为机群操控中心、欧拉边缘设备作为算力中心；实现超级终端和边缘算力中心之间的高安全、大带宽的视频数据传输和机群控制，使用边缘算力设备进行实时火情识别，解决传统巡检效率低，识别滞后的痛点问题。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/04-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E9%AB%98%E7%B2%BE%E5%BA%A6%E6%99%BA%E8%83%BD%E5%9C%B0%E7%90%86%E5%B7%A1%E6%A3%80.mp4">
</video>


-   **运维场景-便捷、业务无感知**

**极致可靠系统服务管理方案**

在所有 Unix 系统中都有一个进程号为 1
的进程。这是操作系统内核完成启动后，执行的第一个用户态应用程序，很多人一直努力地从某些方面改进传统的
init
守护进程，使它变得更完善。有简洁可靠但低效的sysvinit，有高效但略显复杂的systemd。systemd
目前已成为大多数发行版的标准配置，但systemd
的架构和社区运作定位，使得它不适应云场景中业务快速开发迭代的诉求。云原生场景下，需要一个能够在
业务快速开发迭代中不使绊子、不拖后腿的 init
系统。SysMaster是一款由openEuler社区孵化的机制可好的系统服务管理服务，它使用Rust语言编写，拥有极致可靠、极优体验、极度轻量以及极简架构等技术优势，在最新发布的技术验证版本中，sysMaster已经完成了核心功能的支持，提供了可靠性框架sdk开发及使能相关特性可靠性能力，使得1号进程初步具备永不宕机能力。


<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/05-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E6%9E%81%E8%87%B4%E5%8F%AF%E9%9D%A0%E7%9A%84%E7%B3%BB%E7%BB%9F%E6%9C%8D%E5%8A%A1%E7%AE%A1%E7%90%86%E6%96%B9%E6%A1%88.mp4">
</video>

**业务无感的系统热修复**

中移在线营销服务中心为超过10亿用户提供服务，月服务触达量超过15亿，目前在营销服务中心31个分中心超过100个机房中部署了1万余台服务器，操作系统漏洞补丁更新频繁，传统的漏洞修复方案需对系统进行重启，考虑到业务影响，需非生产时段执行，一次全量操作系统内核升级需用时一个月以上，给系统运维及业务侧带来巨大压力，配合漏洞升级重启服务及测试业务需投入工作量较大。通过引入openEuler社区孵化的SysCare统一内核态/用户态热补丁开发套件，可以实现热补丁一键制作、统一管理、热加载、热修复等相关能力，实现漏洞修复过程业务不中断，漏洞修复效率提升80%以上，每年可节省人力600人/天，集群运维效率得到大幅提升。

--对应视频06
<video width="100%" controls>
    <source type="video/mp4"  
    src="https://openeuler-website-beijing.obs.cn-north-4.myhuaweicloud.com/Blog_video/06-%E5%88%9B%E6%96%B0%E6%8A%80%E6%9C%AF-%E4%B8%9A%E5%8A%A1%E6%97%A0%E6%84%9F%E7%9A%84%E7%B3%BB%E7%BB%9F%E7%83%AD%E4%BF%AE%E5%A4%8D.mp4">
</video>

未来openEuler将持续围绕用户全场景、全流程开展技术创新，以编排调度、实时并发、数据存储、端云协同、异构互联、安全可靠、开发体验、服务智能等八个技术方向为支柱进行纵深创新，引领全场景产业领先，欢迎全球开发者参与openEuler社区，共建最具活力的开源操作系统社区。

---
title: '基于 openEuler和 vLLM Ascend 快速上手 DeepSeek-V3.2-Exp'
date: '2025-09-30'
category: news
tags:
  - openEuler
banner: 'img/banners/20250930-openeuler-deepseekv32-01.png'
author: 'openEuler'
summary: '基于 openEuler和 vLLM Ascend 快速上手 DeepSeek-V3.2-Exp'
---

9 月 29 日，DeepSeek 团队宣布正式发布 DeepSeek-V3.2-Exp，DeepSeek 系列的一个实验版本。作为迈向下一代架构的中间步骤，V3.2-Exp 在 V3.1-Terminus 的基础上引入了 DeepSeek 稀疏注意力机制——一种旨在探索和验证在长上下文场景中训练和推理效率优化的稀疏注意力机制。

vLLM 是 PyTorch Foundation 下的开源 LLM 推理引擎，为用户和开发者提供快速、易用的 LLM 推理能力。vLLM 社区在 9 月 30 日发布了 vLLM Ascend v0.11.0rc0 版本，提供了昇腾对 `DeepSeek-V3.2-Exp` 的支持。本指南将帮助你使用 OpenAtom openEuler（简称：“openEuler”或“开源欧拉”）和 vLLM Ascend 在昇腾上运行 `DeepSeek-V3.2-Exp` 。 

### 基于 openEuler 和 vLLM Ascend 快速上手 DeepSeek-V3.2-Exp

本指南将采用 vLLM Ascend 的镜像的方式，在昇腾 Atlas 800 A3(64G*16)节点上运行 `DeepSeek-V3.2-Exp` 

**步骤 1：** 在拉起容器镜像前，请先确保昇腾驱动已经正常安装，可使用 npu-smi info 命令进行查看。

**步骤 2：** 使用如下命令拉起 vLLM Ascend 容器镜像：

```shell
export IMAGE=quay.io/ascend/vllm-ascend:v0.11.0rc0-a3-openeuler-deepseek-v3.2-exp
export NAME=vllm-ascend

docker run --rm \
--name $NAME \
--net=host \
--device /dev/davinci0 \
--device /dev/davinci1 \
--device /dev/davinci2 \
--device /dev/davinci3 \
--device /dev/davinci4 \
--device /dev/davinci5 \
--device /dev/davinci6 \
--device /dev/davinci7 \
--device /dev/davinci8 \
--device /dev/davinci9 \
--device /dev/davinci10 \
--device /dev/davinci11 \
--device /dev/davinci12 \
--device /dev/davinci13 \
--device /dev/davinci14 \
--device /dev/davinci15 \
--device /dev/davinci_manager \
--device /dev/devmm_svm \
--device /dev/hisi_hdc \
-v /usr/local/dcmi:/usr/local/dcmi \
-v /usr/local/Ascend/driver/tools/hccn_tool:/usr/local/Ascend/driver/tools/hccn_tool \
-v /usr/local/bin/npu-smi:/usr/local/bin/npu-smi \
-v /usr/local/Ascend/driver/lib64/:/usr/local/Ascend/driver/lib64/ \
-v /usr/local/Ascend/driver/version.info:/usr/local/Ascend/driver/version.info \
-v /etc/ascend_install.info:/etc/ascend_install.info \
-v /root/.cache:/root/.cache \
-it $IMAGE bash
```

**步骤 3** : 部署推理服务
以 `DeepSeek-V3.2-Exp-BF16` 为例，需要使用两台 A3 节点拉起服务, 依次在两台节点上运行启动脚本：

node0:

```shell
#!/bin/sh

# ip和网卡名称通过ifconfig命令获取
nic_name="xxxx"
local_ip="xxxx"

export VLLM_USE_MODELSCOPE=True
export HCCL_IF_IP=$local_ip
export GLOO_SOCKET_IFNAME=$nic_name
export TP_SOCKET_IFNAME=$nic_name
export HCCL_SOCKET_IFNAME=$nic_name
export OMP_PROC_BIND=false
export OMP_NUM_THREADS=100
export HCCL_BUFFSIZE=1024

# 模型下载链接：https://modelers.cn/models/Modelers_Park/DeepSeek-V3.2-Exp-BF16
vllm serve <path_of_weight> \
--host 0.0.0.0 \
--port 8000 \
--data-parallel-size 2 \
--data-parallel-size-local 1 \
--data-parallel-address $local_ip \
--data-parallel-rpc-port 13389 \
--tensor-parallel-size 16 \
--seed 1024 \
--served-model-name deepseek_v3.2 \
--enable-expert-parallel \
--max-num-seqs 16 \
--max-model-len 8192 \
--max-num-batched-tokens 8192 \
--trust-remote-code \
--no-enable-prefix-caching \
--gpu-memory-utilization 0.9 \
--additional-config '{"torchair_graph_config":{"enabled":true,"graph_batch_sizes":[16]}}'
```

node1

```shell
#!/bin/sh

nic_name="xxx"
local_ip="xxx"

export VLLM_USE_MODELSCOPE=True
export HCCL_IF_IP=$local_ip
export GLOO_SOCKET_IFNAME=$nic_name
export TP_SOCKET_IFNAME=$nic_name
export HCCL_SOCKET_IFNAME=$nic_name
export OMP_PROC_BIND=false
export OMP_NUM_THREADS=100
export HCCL_BUFFSIZE=1024

vllm serve <path_of_weight> \
--host 0.0.0.0 \
--port 8000 \
--headless \
--data-parallel-size 2 \
--data-parallel-size-local 1 \
--data-parallel-start-rank 1 \
--data-parallel-address <node0_ip> \
--data-parallel-rpc-port 13389 \
--tensor-parallel-size 16 \
--seed 1024 \
--served-model-name deepseek_v3.2 \
--max-num-seqs 16 \
--max-model-len 8192 \
--max-num-batched-tokens 8192 \
--enable-expert-parallel \
--trust-remote-code \
--no-enable-prefix-caching \
--gpu-memory-utilization 0.9 \
--additional-config '{"torchair_graph_config":{"enabled":true,"graph_batch_sizes":[16]}}'
```

待服务启动后，通过 `curl` 命令发送请求来验证是否部署成功
```shell
# 替换为node0 ip地址
curl http://<node0_ip>:<port>/v1/completions \
    -H "Content-Type: application/json" \
    -d '{
        "model": "deepseek_v3.2",
        "prompt": "The future of AI is",
        "max_tokens": 50,
        "temperature": 0
    }'
```
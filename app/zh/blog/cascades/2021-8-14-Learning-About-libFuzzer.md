---
title: 【开源软件供应链点亮计划】LibFuzzer学习
category: blog
date: 2021-08-14
tags:
  - Fuzzing
  - 鹏城实验室
  - summer2021
archives: 2021-08
author: cascades
summary: LibFuzzer是一个in-process, coverage-guided, evolutionary的针对库函数的模糊测试引擎，包含在LLVM项目中。
---

# LibFuzzer 学习

> 本文章来自于[开源软件供应链点亮计划](https://summer.iscas.ac.cn/)的 openEuler 社区项目
> 项目名称：[No.112 qemu 设备 fuzz 测试完善](https://gitee.com/openeuler-competition/summer2021-112)

## 前言

LibFuzzer 是一个`in-process`，`coverage-based`，`evolutionary`的模糊测试引擎，是 LLVM 项目的一部分。它与被测库链接，通过特定的入口点将模糊测试的输入提供给被测函数。在测试过程中不断变异输入，并统计代码覆盖率和崩溃情况。

- [项目地址](https://www.llvm.org/docs/LibFuzzer.html)
- [代码路径](https://github.com/llvm/llvm-project/tree/main/compiler-rt/lib/fuzzer)

## LibFuzzer 使用方法

### 实验环境

采用了鹏城实验室的云主机，操作系统为 openEuler

```bash
[root@host-10-0-0-94 libFuzzer]# lscpu
Architecture:                    aarch64
CPU op-mode(s):                  64-bit
Byte Order:                      Little Endian
CPU(s):                          4

[root@host-10-0-0-94 libFuzzer]# cat /etc/os-release
NAME="openEuler"
VERSION="20.03 (LTS-SP1)"
```

### 简单使用

[入门教学](https://github.com/google/fuzzing/blob/master/tutorial/libFuzzerTutorial.md)

1. 安装 llvm 和 clang

   - [源码编译](https://clang.llvm.org/get_started.html#build)：对于机器性能尤其是内存（8GB）和硬盘（15-20GB）的要求比较高，需要对编译命令进行一些[优化](https://blog.csdn.net/qq_40323844/article/details/103191029)。需要额外安装 LibFuzzer 依赖的[`compile-rt`](https://compiler-rt.llvm.org)。

   ```bash
   git clone https://gitee.com/mirrors/LLVM.git
   cd LLVM ; mkdir build ; cd build
   cmake -DLLVM_ENABLE_PROJECTS="clang;clang-tools-extra;compiler-rt" -DCMAKE_BUILD_TYPE="Release" -DLLVM_TARGETS_TO_BUILD="host" -G "Unix Makefiles" ../llvm
   make -j4
   ```

   - [二进制安装](https://github.com/llvm/llvm-project/releases)：下载对应版本的二进制文件，方便在不同版本间切换。可以使用软链接添加到环境变量中方便使用。
   - [包管理器安装](https://www.rootusers.com/how-to-install-dnf-package-manager-in-centosrhel/)，版本较低，自带了 libFuzzer。

   ```bash
   # sudo apt/dnf search xxx 可以查看包管理器中包含的软件以及对应版本
   sudo apt/dnf install clang llvm compiler-rt
   ```

2. 编译被测二进制文件，加入 LibFuzzer 的编译选项

   ```cpp
   // LibFuzzer提供的函数接口，在被测源代码fuzz_me.cc中实现
   extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
     DoSomethingInterestingWithMyAPI(Data, Size);
     return 0;  // Non-zero return values are reserved for future use.
   }
   ```

   ```bash
   # clang会去寻找libclang_rt.xxx.a的静态链接库，即sanitizers
   # 除了ASAN，还可以添加UBSAN，TSAN等其他sanitizers
   clang -fsantize=address,fuzzer -g fuzz_me.c -o fuzz_me
   ```

如果使用该编译命令失败，说明上一步安装不成功，需要检查 compile-rt 库的位置或重新安装。

3. 运行二进制文件，观察输出
   `bash ./fuzz_me grep ERROR ./*.log | sort -k 3 `
   如果程序的异常行为被 sanitizer 检测到，会产生 Fuzzing output，即 crash。除了 crash，Fuzzer 还会记录 Fuzzing 过程中的参数，例如代码覆盖率（以基本块为单位），种子变异情况等等。

4. 复现该输入，定位漏洞
   `bash ./fuzz_me crash-xxx ./fuzz_me -seed=xxx # xxx为crash的SHA-1哈希值 gdb fuzz_me `
   sanitizer 给出了漏洞类型和漏洞触发的环境。可以重新观察 crash，复现漏洞，或放入 gdb 调试。

![](https://img-blog.csdnimg.cn/img_convert/585afb1d9b9b3892943e01d85abc25de.png)

### 一些有用的 utils

面对大型软件时，还需要开启一些编译选项，来提高 Fuzzing 的效率：

- `-jobs`：任务数，每个 job 的目的就是触发 crash，job 在 workers 进程中运行，一个 worker 可以管理多个 job。如果将 jobs 设置为 1000，可以绕过程序的简单 bug
- `-workers`：进程数，最多可使用一半的 CPU 核心数
- `-forks`：将`-jobs = N`和`-workers = N`替换为`-fork = N`
- `-dict`：字典，在 Fuzzing 特定格式的文件时非常必要
- `CORPUS`：语料库，用于保存 Fuzzing 中触发新路径的输入
- `-max-len`：设置最大输入长度，根据语料库文件大小来定义
- `-run`：减少 crash producer，单位为每次迭代中的变异次数
- `-shrink`：减小语料库大小，可能可以提高代码覆盖率

### 项目实践

- 课程：[`libfuzzer-workshop`](https://github.com/Dor1s/libfuzzer-workshop/)包括了 LibFuzzer 一些常见的使用方法，[此处为课程笔记](https://www.secpulse.com/archives/71898.html)。
- 开源项目 CVE 实战：LibFuzzer 发现了[许多开源软件中的漏洞](https://www.llvm.org/docs/LibFuzzer.html#trophies)，包括 OpenSSL 中的 Heartbleed 漏洞，可以在 Google 的[`fuzzer-test-suite`](https://github.com/google/fuzzer-test-suite)中找到有漏洞的开源软件，并通过 LibFuzzer 进行复现。
- 与其他工具的对比：LibFuzzerTutorial 给出的[参考链接](https://github.com/google/fuzzing/blob/master/tutorial/libFuzzerTutorial.md#related-links)。

## LibFuzzer 原理

### 变异算法

变异（Mutation）是现代 Fuzzer 中的关键步骤，用于产生新的且能够覆盖更多基本块的输入。LibFuzzer 包含了一系列内置的简单的变异算法，大多为 bit 级反转。LibFuzzer 同时也接受用户自定义变异算法，用于定向 Fuzzing。

#### 已有变异算法

通过观察 LibFuzzer 的[`Stderr Output`](https://www.llvm.org/docs/LibFuzzer.html#output)，可以在 MS 字段发现当前输入使用的变异算法，如图所示。

![](https://img-blog.csdnimg.cn/img_convert/cac0122be891840a29113c2a1136c681.png)

LibFuzzer 一共内置了 12 种变异算法，属于`MutationDispatcher`类的成员函数，类定义代码如下：

```cpp
// 代码路径：LLVM/compiler-rt/lib/fuzzer/FuzzerMutate.cpp

MutationDispatcher::MutationDispatcher(Random &Rand, const FuzzingOptions &Options) : Rand(Rand), Options(Options) {
    DefaultMutators.insert(
        DefaultMutators.begin(),
        {
            {&MutationDispatcher::Mutate_EraseBytes, "EraseBytes"},
            {&MutationDispatcher::Mutate_InsertByte, "InsertByte"},
            {&MutationDispatcher::Mutate_InsertRepeatedBytes, "InsertRepeatedBytes"},
            {&MutationDispatcher::Mutate_ChangeByte, "ChangeByte"},
            {&MutationDispatcher::Mutate_ChangeBit, "ChangeBit"},
            {&MutationDispatcher::Mutate_ShuffleBytes, "ShuffleBytes"},
            {&MutationDispatcher::Mutate_ChangeASCIIInteger, "ChangeASCIIInt"},
            {&MutationDispatcher::Mutate_ChangeBinaryInteger, "ChangeBinInt"},
            {&MutationDispatcher::Mutate_CopyPart, "CopyPart"},
            {&MutationDispatcher::Mutate_CrossOver, "CrossOver"},
            {&MutationDispatcher::Mutate_AddWordFromManualDictionary, "ManualDict"},
            {&MutationDispatcher::Mutate_AddWordFromPersistentAutoDictionary, "PersAutoDict"},
        });
        // 以上函数的具体实现
    }
```

大部分变异算法从名称就可以看出实现方法。比如`EraseBytes`即调用`memmove`函数覆盖掉部分比特位；`InsertBytes`即调用`memmove`函数添加一个比特位。值得注意的是，在这些内置的变异算法中，变异的位置的和变异的值都是采用`Rand`系列的随机函数生成。

#### 如何添加新的变异算法

LibFuzzer 和 AFL 属于`coverage-guided`的 Fuzzing 工具，在 Fuzz 具体的对象时，可能由于变异算法不包含语义信息而导致在程序运行的初期就被过滤掉，相对于 generation-based 的 Fuzzing 工具效率低下。Google 由此提出了[`structure-aware-fuzzing`](https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md)的高级概念，可以让用户自行添加变异算法，即`LibFuzzer Plugin`，文中也介绍了如何添加 Plugin，并列举了一系列官方实现的 Plugin。

添加 Plugin 的方法如下面代码所示。首先需要实现一个自定义的`LLVMFuzzerCustomMutator`函数，加入特定的变异算法，然后在该函数中调用`LLVMFuzzerMutate`来实现普通的变异。

在具体的代码实现中，可以通过条件编译指令`ifdef CUSTOM_MUTATOR`和`clang -DCUSTOM_MUTATOR`来开启或关闭自定义的 Plugin。

```cpp
// Optional user-provided custom mutator.
// Mutates raw data in [Data, Data+Size) inplace.
// Returns the new size, which is not greater than MaxSize.
// Given the same Seed produces the same mutation.
size_t LLVMFuzzerCustomMutator(uint8_t *Data, size_t Size, size_t MaxSize, unsigned int Seed);

// libFuzzer-provided function to be used inside LLVMFuzzerCustomMutator.
// Mutates raw data in [Data, Data+Size) inplace.
// Returns the new size, which is not greater than MaxSize.
size_t LLVMFuzzerMutate(uint8_t *Data, size_t Size, size_t MaxSize);
```

对于添加自己的 Plugin 感兴趣的同学，可以参考该文章中给出的[参考链接](https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md#related-links)，也可以参考 2017 年 LLVM 开发者大会上的议题[`"Structure-aware fuzzing for Clang and LLVM with libprotobuf-mutator"`](https://www.youtube.com/watch?v=U60hC16HEDY)

### 覆盖率统计

代码覆盖率统计方法需要从两个维度分析：

- **统计精度**：从粗糙到精细，代码覆盖率（Coverage）的统计大致分为三个层次
  - `function level`：统计调用的函数，忽略对函数内部代码的统计
  - `basic block level`：统计标准块，可以在 LibFuzzer 的[`Stderr Output`](https://www.llvm.org/docs/LibFuzzer.html#output)的 cov 字段查找到
  - `edge level`：edge 不仅包含了基本块信息，还在基本块之间建立虚拟块，以包含执行信息

![](https://img-blog.csdnimg.cn/img_convert/f3d19dfa66d44924b3386cd6860505c5.png)

- **分析对象**：统计的基本方法是插桩（instrumentation），加入计数变量，大致分为三个级别
  - `source code`：在编译选项中提供覆盖率统计方式
  - `intermediate representation`：用`llvm pass`等方式统计
  - `binary`：使用`Pin`，`DynamoRIO`等二进制插桩工具去 hook 统计

综上所述，LibFuzzer 使用了 LLVM 框架中的[`SanitizerCoverage`](https://clang.llvm.org/docs/SanitizerCoverage.html)来实现源代码级别的覆盖率统计，可以通过如下命令指定，默认使用`edge`级别。

```bash
# xxx=edge,bb,func,trace-pc-guard,inline-8bit-counters,inline-bool-flag,pc-table,trace-pc
clang -fsanitize-coverage=xxx fuzz_me.c
```

此外，还可以在`SanitizerCoverage`的基础上开发分析工具。Sanitizer 提供了覆盖率的回调接口，用户可以在 Fuzzing 进程关闭时将覆盖率统计的结果转储为`.sancov`文件。LLVM 框架提供了`Sancov Tool`工具来生成源代码级别的覆盖率报告。

### 错误检查

#### 常见错误

前文提到，LibFuzzer 进程中的每个`job`的使命就是完成检查任务。它直到遇到 crash 或者运行超时后才会停止。这时，LibFuzzer 的守护进程会捕获错误码。如果错误码为 77，则为超时（默认超时时间为 1200 秒）或者 LibFuzzer 本身程序异常；如果为 crash，则将 crash 结果以及造成 crash 的输入记录下来。

#### Sanitizers

而仅仅检测出 crash 并不够覆盖所有 Fuzzing 的检测场景，比如内存泄漏，竞态等情况虽然可能不会造成 crash，但也是非常严重的一类错误。针对这些非 crash 的错误，有像`Valgrind`这样的重量级内存检测工具。而 LibFuzzer 使用的是 LLVM 框架中的一系列[`Sanitizers`](https://github.com/google/sanitizers)。这些工具由 Google 提出，可以用于检测 C/C++语言的各类运行时异常，比较常用的 Sanitizers 列举如下：

- `AddressSanitizer(ASAN)`：捕获堆栈溢出，UAF 等漏洞
- `ThreadSanitizer(TSAN)`：捕获 data race，支持 C/C++和 Go
- `UndefinedBehaviorSanitizer(UBSAN)`：捕获整数溢出，空指针解引用等异常行为

以 ASAN 为例来分析这些错误检查工具的原理，详细介绍可以看[`USENIX ATC 2021`](http://research.google.com/pubs/pub37752.html)。

1. 在编译时，ASAN 在 LLVM IR 级别的访问内存操作（load，store，alloca）的前后插桩。由于内存有 8 字节对齐的要求，所以部分内存处于 unused 状态，可以使用内存映射的方式将其设置为`shadow memory`，来指示其读写情况。
2. 在运行时对 malloc 函数进行 HOOK，并在前后设置`Redzone`区域，类似于 Stack Canary 的做法。将 Redzone 区域的 shadow memory 设置为不可写，即可避免溢出问题。
3. 在运行时对 free 函数进行 HOOK，不立即释放该内存，而是将 shadow memory 设置为负数，即不可读写的状态，并放入隔离区观察。如果发生 UAF 或者野指针解引用的情况，则会被捕获。

![](https://img-blog.csdnimg.cn/img_convert/e70c15eb1734af0179d9745801a3e88d.png)

## 其他 Fuzzer

- 学术界：Fuzzing 作为学术热点，近年来在系统安全，网络安全，软件分析，程序语言等领域的国际顶级会议上都有许多相关论文，可以查看[`FuzzingPaper`](https://github.com/wcventure/FuzzingPaper)项目。这些论文大多是提出一种针对某一特定对象（软件，OS 内核，硬件，程序语言等等）或者特定漏洞类型（竞态条件，缓冲区溢出）的 Fuzzer，并结合符号执行（Concolic Fuzzing），深度学习等方法提高 Fuzzing 效率。

- 工业界：在 AFL，LibFuzzer 这样的工具诞生之后，Github 上陆续有许多在此基础上开发的工具，也有许多主打模糊测试技术的公司兴起。其中比较著名的是 Google 提出的一系列 Fuzzing 工具，包括其维护的`Fuzzbench`平台，可以对 Fuzzer 性能进行统一评估。

总体来说，学术界和工业界在 Fuzzing 的研究上还是非常相关的。因为大部分 Fuzzing 技术基于 LLVM 框架实现，所以可扩展性很强。学术界的工作基于工业界的已有的工具扩展开发，而学术界性能较好的成果，也会发布到 Github 上。以下列举一些我在学习 Fuzzing 过程中收藏的 Fuzzer，更完整的版本可以查看[`Awesome-Fuzzing`](https://github.com/secfigo/Awesome-Fuzzing)

- 通用

  - [`LibFuzzer-gv`](https://github.com/guidovranken/libfuzzer-gv)：LibFuzzer 增强版

  - [`AFL++`](https://aflplus.plus/)：AFL 增强版

  - [`OSS-Fuzz`](https://google.github.io/oss-fuzz/)+[ClusterFuzz](https://google.github.io/clusterfuzz)：前后端配合实现的大规模分布式 Fuzzer

  - [`boofuzz`](https://boofuzz.readthedocs.io/en/stable/)：Sulley 框架增强版

  - [`phuzzer`](https://github.com/angr/phuzzer)：和 AFL 交互的 python 框架

- 安全

  - [`Honggfuzz`](https://honggfuzz.dev/)：更加针对于软件安全漏洞的 Fuzzer

- 网络协议

  - [`AFLNet`](https://github.com/aflnet/aflnet)：针对网络协议的灰盒 Fuzzer

- 内核

  - [`Syzkaller`](https://github.com/google/syzkaller)：无监督的 linux 内核 Fuzzer

- 编程语言

  - [使用 Rust 实现的一系列 Fuzzer](https://github.com/rust-fuzz)：包括 AFL，LibFuzzer，Honggfuzz
  - [`PolyGlot`](https://github.com/s3team/Polyglot)：针对程序语言解释器的 Fuzzer

- IoT
  - [`FirmAFL`](https://github.com/zyw-200/FirmAFL)：针对 IoT 固件的灰盒 Fuzzer
  - [`DIANE`](https://github.com/ucsb-seclab/diane)：针对 IoT 配套的手机 APP 的 Fuzzer
  - [`Frankenstein`](https://github.com/seemoo-lab/frankenstein)：Fuzz 无线物联网设备

> 有错误之处请批评指正，作者联系方式：[cascades-sjtu](https://cascadeschen.cn)

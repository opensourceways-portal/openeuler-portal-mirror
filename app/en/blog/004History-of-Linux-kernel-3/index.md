---
title: 'Linux Kernel Development History (3)'
category: blog
date: 2020-08-06
tags:
    - Linux
    - kernel
    - development history
archives: 2020-08
author:
  - Luo Yuzhe
summary: Linux Kernel Development History (3)
---

 *Author: Luo Yuzhe, Intelligent Software Research Center, Institute of Software, Chinese Academy of Sciences*

This article introduces the main source of Linux applications—GNU.

### 1. GNU

Linux consists of two parts: system kernel and applications that provide system services and tools. The applications used by Linux are programmed and freely released by many developers. Linux upholds the idea of free software. That is, software should not be restricted and should comply with the GNU (a recursive acronym for "GNU's Not Unix!") General Public License (GPL) [1]. The software is usually released in the form of source code, downloading which may require a certain fee as well. The GNU project was originally launched by the Free Software Foundation, whose founder was Richard Stallman. The purpose of the GNU project is to create an operating system and development environment that is compatible with Unix but is not restricted by the name Unix and its source code proprietary rights. [1] Therefore, GNU contributes to the software community many imitations of applications on Unix. These imitations comply with the GPL.  

Here are some of the major GNU project software released under the GPL [1]:

- GCC: GNU compiler collection, which includes the GNU C compiler.  
- G++: C++ compiler, which is a part of GCC.   
- GDB: debugger at the source code level  
- GNU make: free version of the Unix make command   
- Bison: syntax parser generator compatible with Unix Yacc   
- bash: command interpreter (shell)   
- GNU Emacs: text editor and environment

Many other software packages are also developed and distributed in compliance with the principles of free software and GPL terms, including spreadsheets, source code control tools, compilers and interpreters, Internet tools, image manipulation tools (such as GIMP), and two complete graph-based environments (GNOME and KDE).  

### 2. Common Open Source Licenses

Mulan Permissive Software License: The MulanPSL is the first open source license in China. It involves five major aspects: copyright licensing, patent licensing, non-trademark licensing, distribution restriction, and disclaimer and liability limitation. In terms of copyright licensing, the MulanPSL allows "every contributor" to grant you a "perpetual, worldwide, royalty-free, non-exclusive, irrevocable copyright license to reproduce, use, modify, or distribute its contribution, with modification or not." The MulanPSL is more friendly than the Apache license. The Apache license requires that each modified file be listed. However, many projects cannot realize this requirement. Therefore, the MulanPSL cancels this requirement [2].

GPL: The GPL takes two measures to protect the rights of programmers: (1) providing copyright protection for software; (2) providing a license to the programmer. It gives programmers the legal permission to copy, publish, and modify the software. In terms of reproduction and distribution, the GPL states that you may "convey verbatim copies of the program's source code as you receive it, in any medium, provided that you conspicuously and appropriately publish on each copy an appropriate copyright notice; keep intact all notices stating that this License and any non-permissive terms to the code; keep intact all notices of the absence of any warranty; and give all recipients a copy of this License along with the program" and that you may "charge any price or no price for each copy that you convey, and you may offer support or warranty protection for a fee." [3] GPL aims at open-source/free use of code and open-source/free use of linked/modified/derivative code. However, modified and derived code cannot be released or sold as closed-source commercial software. The core content of the GPL is that as long as a piece of software uses products under the GPL ("use" refers to class library linking and use of code after modification or derivative code), the software product must also use the GPL and be open source and free of charge [4].

Lesser General Public License: The LGPL is an open source license designed for use of class libraries. Different from GPL that requires software that uses, modifies, or derives GPL class libraries to use the GPL, the LGPL allows commercial software to use LGPL class libraries through class library linking without open sourcing software code. This allows open source code using the LGPL to be linked, released, and sold as a class library by commercial software. However, if code under the LGPL is modified or derived, the code after the modification, code involving the modification, and derivative code must use the LGPL [4].

Berkeley Software Distribution: The BSD open source license allows users to freely use and modify source code and release the modified code as open source or proprietary software. When you release code under the BSD license or perform secondary development based on the BSD license, the following conditions must be met:

(1) If the redistributed product contains source code, the source code must contain the BSD license in the original code.  

(2) If only the binary class library or software is redistributed, the BSD license in the original code must be included in the class library or software document and copyright statement.  

(3) Do not use the name of the author/organization of open source code or the name of the original product for marketing.  

The BSD license encourages code sharing but requires respect for the author's copyright. BSD is a friendly license for commercial integration because it allows users to modify and redistribute code and also allows users to use or develop commercial software under the BSD license for release and sales [5].  

### 3. Summary

This article briefly introduces an important source of Linux applications—GNU. In the next article, we'll introduce the Linux kernel source code structure.

References

[1] Beginning Linux Programming (4th Edition)

[2] [https://iot.ofweek.com/2019-08/ART-132216-8120-30401877.html](https://iot.ofweek.com/2019-08/ART-132216-8120-30401877.html)

[3] [https://baike.baidu.com/item/GPL/2357903?fromtitle=GPL%E5%8D%8F%E8%AE%AE&fromid=8274607&fr=aladdin](https://baike.baidu.com/item/GPL/2357903?fromtitle=GPL%E5%8D%8F%E8%AE%AE&fromid=8274607&fr=aladdin)

[4] [https://blog.csdn.net/xiaoxiao133/article/details/83049959](https://blog.csdn.net/xiaoxiao133/article/details/83049959)

[5] [https://www.runoob.com/note/13176]( https://www.runoob.com/note/13176)

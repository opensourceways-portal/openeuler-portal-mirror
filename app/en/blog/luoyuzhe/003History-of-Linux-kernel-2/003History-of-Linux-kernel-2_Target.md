---
title: 'Linux Kernel Development History (2)'
category: blog
date: 2020-08-06
tags:
    -Linux
    -kernel
    -development history
archives: 2020-08
author:
  - Luo Yuzhe
summary: Linux Kernel Development History (2)
---

 *Author: Luo Yuzhe, Intelligent Software Research Center, Institute of Software, Chinese Academy of Sciences*  

Linux was developed by Linus Torvalds of the University of Helsinki with the help of Unix programmers from the Internet. It was originally a program developed based on Professor Andy Tanenbaum's Minix (a small Unix-like system) according to Linus's interests, but later it gradually developed into a complete system. Linux stands on the shoulders of the operating systems Unix and GNU and the existing application software. This article will introduce the development history of Unix.  

### 1. Development History of Unix

Unix was originally developed by Bell Labs, a member of the telecommunications giant AT&T, for the PDP series computers of Digital Equipment Corporation (DEC) in the 1970s. It has become a very popular multiuser, multitasking operating system. It can run on a large number of different types of hardware platforms, ranging from PC workstations to multiprocessor servers and supercomputers.  

Unix has the following key features[1]:  

1. Simplicity: Many useful Unix tools are very simple and therefore small and easy to understand.  

2. Focus: In Unix, when users have new requirements, small tools are often combined to complete complex tasks, rather than trying to put all the expected functions into a large program.  

3. Reusable components: The core of an application is implemented as a library. Well-documented libraries with simple but flexible programming interfaces can help others to develop variations or apply the techniques to new application areas.  

4. Filters: Many Unix applications can be used as filters. That is, they transform the input and produce output.  

5. Open file formats: Successful and popular Unix programs use plain ASCII text files or XML files as configuration files and data files.  

6. Flexibility: You can't expect users to use your program very correctly. Therefore, you should consider flexibility in your programming and avoid limiting the length of fields or the number of records at will.  

The original Unix was written in assembly language, and some applications were written in a mixture of interpreted and assembly languages called B. The B language was not powerful enough for system programming, so Kenneth Thompson and Dennis Ritchie turned it into the C language in 1971. In 1973, Thompson and Ritchie rewrote Unix in C. This was a bold and revolutionary innovation at that time, because the system programs were written in assembly language to achieve maximum efficiency. The Unix code written in C language was simple and compact, easy to port, read, and modify, which laid a solid foundation for the development of Unix.  

In 1974, Thompson and Ritchie co-published an article about Unix on Communications of the ACM. This was the first time Unix appeared outside Bell Labs. Since then, Unix has been noticed by government agencies, research institutes, enterprises, and universities, and has gradually become popular.  

In 1975, the forth, fifth, and sixth editions of Unix were released. In 1978, there were 600 computers running Unix. In 1979, the seventh edition was released. This was the last widely released research Unix edition. The eighth, ninth, and tenth editions were released in the 1980s and were authorized only to a few universities. This research focus then shifted to the development of Plan 9, a new distributed system.  

In 1982, AT&T developed the first, commercial version of Unix System III based on the seventh edition for sale only. To end the confusion among various Unix versions developed by other universities and companies, AT&T combined them into Unix System V Release 1.  

This new commercial Unix release no longer contained source code, so the University of California, Berkeley, continued to develop Berkeley Software Distribution (BSD) Unix as an alternative to Unix System III and V. One of the most important contributions made by BSD to Unix was TCP/IP. TCP/IP was contained in eight major BSD releases, including 4.1c, 4.2, 4.3, 4.3-Tahoe, 4.3-Reno, Net/2, 4.4, and 4.4-Lite. The TCP/IP code in these releases was the predecessor of TCP/IP implementations in almost all systems in use today, including AT&T System V Unix and Microsoft Windows. Other companies also started to provide commercial editions of Unix for their own minicomputers or workstations. Some chose System V as the base version, and others chose BSD. One of the leading developers of BSD, Bill Joy, developed SunOS on the basis of BSD and eventually founded Sun Microsystems.  

In 1991, a group of BSD developers (Donn Seeley, Mike Karels, Bill Jolitz, and Trent Hein) left the University of California to found Berkeley Software Design, Inc. (BSDI). BSDI was the first vendor to provide full-featured commercial BSD Unix on the inexpensive Intel platform. Bill Jolitz later left BSDI and started working on 386BSD, the predecessor of FreeBSD, OpenBSD, NetBSD, and DragonFlyBSD. AT&T added features such as file locking, system administration, job control, streams, and remote file systems to Unix System V. From 1987 to 1989, AT&T integrated Xenix (a Unix version for x86 PCs developed by Microsoft), BSD, SunOS, and System V into System V Release 4. The new release integrated multiple features and ended the chaotic competition.  

By 1993, most commercial vendors developed their own Unix variants based on System V Release 4.  

Shortly after the release of System V Release 4, AT&T sold all its rights to Unix to Novell. Novell tried to use this as a marketing tool against Windows NT, but their core markets suffered considerably. Eventually, Novell sold System V Release 4 rights to X/OPEN Consortium, an industry group that defines Unix standards. Later, X/OPEN was merged with OSF/1, creating the Open Group. Standards defined by Open Group define what is and what is not Unix. The actual Unix code went to Santa Cruz Operation, which later sold its Unix to Caldera Systems. Caldera Systems also sold Linux-based operating system products. After the deal was completed, Caldera was renamed SCO Group.  

The following tree diagram shows the operating systems derived from the Unix system[2]:  

<img src="./Derivate-OS-of-NUIX.gif">


### 2. Summary

This article briefly introduces an important basis for the Linux kernel—the Unix operating system. In the next article, we'll introduce another important source of Linux applications—GNU.  

References

[1] Beginning Linux Programming (4th Edition)

[2] https://www.cnblogs.com/alantu2018/p/8991158.html
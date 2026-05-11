---
title: 'Starting a QEMU VM as a Non-root User: Avoiding Permission Issues'
category: blog
date: 2020-08-20
tags:
    - QEMU
    - Permissions
    - Root user
    - libvirt
archives: 2020-08
author:
  - Zeyu Jin
summary: This article describes how to prevent QEMU VM startup failures caused by permission issues as a non-root user.
---

### Background
In a scenario where multiple users use a VM, each user is a non-root user. When a non-root user runs the `virsh` command to start a QEMU VM, the user may encounter a lot of problems.  

The most common problem is about permissions. For example, when the `virsh start` command is executed, error message similar to the following may be displayed:  
```
error: Failed to start domain jzy-lts
error: internal error: qemu unexpectedly closed the monitor: 2020-07-14T13:29:11.323694Z qemu-kvm: -drive file=/home/jzy/kvm/openEuler-20.03-LTS.aarch64.qcow2,format=qcow2,if=none,id=drive-scsi0-0-0-0,cache=none,aio=native: Could not open '/home/jzy/kvm/openEuler-20.03-LTS.aarch64.qcow2': Permission denied
```

You might think that QEMU has bugs when encountering similar problems. However, improper operations are likely the cause.  
The following describes how to start a QEMU VM as a non-root user and avoid possible permission issues.

### Procedure

Perform the following steps:
1. Create a user (for example, **jzy**) and add it to the **kvm** group.
```
[root]    useradd -m jzy
[root]	  gpasswd -a jzy kvm
```
2. Modify the **/etc/libvirt/qemu.conf** file.
```
# user = "root"
Add the following content:
user = "jzy"
```
```
# group = "root"
Add the following content:
group = "jzy"
```
3. Restart libvirtd.
```
[root]    service libvirtd restart
or
[root]    systemctl restart libvirtd.service
```
4. Allow the **jzy** user to use the  `sudo` command.
```
[root]    vim /etc/sudoers
```
Add **jzy ALL=(ALL) ALL**.  
Then, save and exit.

5. Switch to the **jzy** user, go to the **/home/jzy** directory, and prepare related files.  
Ensure that the permissions on files and directories are 755.
```
[jzy@localhost ~]$ pwd
/home/jzy

[jzy@localhost ~]$ ll
total 4.0K
drwxr-xr-x 2 jzy jzy 4.0K Jul 23 11:29 kvm

[jzy@localhost ~]$ ll kvm
total 7.2G
-rwxr-xr-x 1 jzy  jzy  1.6K Jul 23 11:29 openE_jzy.xml
-rwxr-xr-x 1 jzy  jzy  4.4G Jul 23 11:25 openEuler-20.03-LTS-aarch64-dvd.iso
-rwxr-xr-x 1 root root 2.9G Jul 23 11:32 openEuler-image.qcow2
```
6. Then, start a VM.
```
[jzy@localhost ~]$ sudo virsh create kvm/openE_jzy.xml
Domain openEulerVM created from kvm/openE_jzy.xml
```

Note:
Ensure that the owner and group of the file are correct.

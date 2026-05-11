---
title: 'openEuler Installation Using virt-install'
category: blog
date: 2020-10-26
tags:
    - openEuler installation
archives: 2020-10
author:
  - sigui small_leek
summary: This article describes how to use virt-install to install openEuler. Currently, openEuler for ARM supports installation through VNC and CLI, and openEuler for x86 supports only installation through VNC.
---

# Installation Procedure (AArch64)
## Environment Information

1. Host environment: openEuler release 20.09  

2. Virtual machine (VM) ISO: openEuler-20.09-aarch64-dvd.iso  

3. ISO file download address:  
https://repo.openeuler.org/openEuler-20.09/ISO/aarch64/openEuler-20.09-aarch64-dvd.iso  

## Preparations

1. Obtain the ISO file, install VM-related components libvirt, qemu, and virt-install on the host, and enable the libvirtd service.  

        yum install –y libvirt*
        yum install –y qemu*
        yum install –y virt-install
        systemctl start libvirtd

2. Install edk2.  

        yum install –y edk2

Install VNC Viewer on a Windows machine or a machine that can connect to the host and has a graphical user interface (GUI), and set VNC client options.  

## GUI-based Installation
1. Run the following command to use VNC for installation:  

```
virt-install --connect qemu:///system --virt-tpye kvm --vcpus [cpu_num] --memory [memory size] --name [domain name] --cdrom [iso_path] --disk [disk_path_and_parameter] --boot cdrom --network [network] --graphics vnc,listen=0.0.0.0
```

Example:  

```
virt-install --connect qemu:///system --virt-tpye kvm --vcpus 4 --memory 4096 --name sgs-oe-20.09 --cdrom /home/images/openEuler-20.09-aarch64-dvd.iso --disk path=/home/images/test.img,size=50,format=qcow2,bus=scsi --boot cdrom --network network=default --graphics vnc,listen=0.0.0.0
```



2. Start another terminal and run the following command to check the VNC port number:  

```
virsh vncdisplay [domain name]
```



3. Open VNC Viewer and input [host name:port number] to connect to the host. The following figure is an example.  

<img src="./2020-10-26-post-02.jpg">  

Note: If the connection fails, run the following commands on the host to enable the port:  

    firewall-cmd --add-port=[port]/tcp
    firewall-cmd --add-port=[port]/tcp --permanent

The value of [port] should be the sum of 5900 plus the port number. For example:  

    firewall-cmd --add-port=5903/tcp
    firewall-cmd --add-port=5903/tcp --permanent

<img src="./2020-10-26-post-03.jpg">  

Select **Install** or **Test & Install**. The following screen is displayed.  

<img src="./2020-10-26-post-04.jpg">  

Click **Continue**.  

<img src="./2020-10-26-post-05.jpg">  

Complete items marked with ! and then click **Begin Installation**.  

<img src="./2020-10-26-post-06.jpg">  
Restart the host after the installation is complete.  

4. The startup mode is set to **boot** during the installation. After the installation is complete and the system is restarted, the following interface is displayed. Input **exit** to exit the console.  

<img src="./2020-10-26-post-07.jpg">  

5. Go to the BIOS screen, select **Boot Manager** > **UEFI QEMU QEMU HARDDISK** as the system boot mode.  

<img src="./2020-10-26-post-08.jpg">  
<img src="./2020-10-26-post-09.jpg">  

6. Restart the system. The installation is complete.  

<img src="./2020-10-26-post-10.jpg">  

## CLI–based Installation  
1. Run the following command to use VNC for installation:  

```
virt-install --connect qemu:///system --virt-tpye kvm --vcpus [cpu_num] --memory [memory size] --name [domain name] --cdrom [iso_path] --disk [disk_path_and_parameter] --boot cdrom --network [network]
```

Example:

```
virt-install --connect qemu:///system --virt-tpye kvm --vcpus 4 --memory 4096 --name wx-oe-20.09 --cdrom /home/images/openEuler-20.09-aarch64-dvd.iso --disk path=/home/images/test.img,size=50,format=qcow2,bus=scsi --boot cdrom --network network=default
```



2. Type **e** to enter the edit mode.  

<img src="./2020-10-26-post-11.jpg">  
<img src="./2020-10-26-post-12.jpg">  

Modify the console. Set **console=ttyAMA0,115200,tty0**.  
<img src="./2020-10-26-post-13.jpg">  

After the modification, press **Ctrl** and **X** to start the installation.  

3. Select **2) Use text mode**.  

<img src="./2020-10-26-post-14.jpg">  
 
4. The installation starts. Items marked with ! need to be customized.  

<img src="./2020-10-26-post-15.jpg">  

Type **r** to refresh the status of items under processing.  
<img src="./2020-10-26-post-16.jpg">  
<img src="./2020-10-26-post-17.jpg">  
<img src="./2020-10-26-post-18.jpg">  
<img src="./2020-10-26-post-19.jpg">  

5. Set the password of the **root** user.  

<img src="./2020-10-26-post-20.jpg">  

6. After the preceding settings are complete, type **b** to start the installation.  

<img src="./2020-10-26-post-21.jpg">  
<img src="./2020-10-26-post-22.jpg">  

7. The startup mode is set to **boot** during the installation. After the installation is complete and the system is restarted, the following interface is displayed. Input **exit** to exit the console.  

<img src="./2020-10-26-post-23.jpg">  

8. Go to the BIOS screen, select **Boot Manager** > **UEFI QEMU QEMU HARDDISK** as the system boot mode.  

<img src="./2020-10-26-post-24.jpg">  
<img src="./2020-10-26-post-25.jpg">  

9. Restart the system. The installation is complete.  

<img src="./2020-10-26-post-26.jpg">  

# Installation Procedure (x86_64)  
## Environment Information  

1. Host environment: openEuler release 20.09  
2. VM ISO: openEuler-20.09-x86_64-dvd.iso  
3. ISO file download address:  
https://repo.openeuler.org/openEuler-20.09/ISO/x86_64/openEuler-20.09-x86_64-dvd.iso  


## Preparations
1. Obtain the ISO file, install VM-related components libvirt, qemu, and virt-install on the host, and enable the libvirtd service.  

        yum install –y libvirt*
        yum install –y qemu*
        yum install –y virt-install
        systemctl start libvirtd

2. Install edk2.  

        yum install –y edk2

3. Install VNC Viewer on a Windows terminal or a terminal that can connect to the host and has a graphical user interface (GUI), and set VNC client options.  

## GUI-based Installation
1. Run the following command to use VNC for installation:  

```
virt-install --connect qemu:///system --vcpus [cpu_num] --memory [memory size] --name [domain name] --cdrom [iso_path] --disk [disk_path_and_parameter] --boot cdrom --network [network] --graphics vnc,listen=0.0.0.0
```

Example:  

```
virt-install --connect qemu:///system --vcpus 4 --memory 4096 --name wx-oe-20.09 --cdrom /home/images/openEuler-20.09-x86_64-dvd.iso --disk path=/home/images/test.img,size=50,format=qcow2,bus=virtio --video virtio --boot cdrom --network network=default --graphics vnc,listen=0.0.0.0
```



2. Start another terminal and run the following command to check the VNC port number:  

        virsh vncdisplay [domain name]

3. Open VNC Viewer and input [host name:port number] to connect to the host. The following figure is an example.  

<img src="./2020-10-26-post-28.jpg">  

Note: If the connection fails, run the following commands on the host to enable the port:  

        firewall-cmd --add-port=[port]/tcp
        firewall-cmd --add-port=[port]/tcp --permanent
The value of [port] should be the sum of 5900 plus the port number. For example:

        firewall-cmd --add-port=5903/tcp
        firewall-cmd --add-port=5903/tcp --permanent
<img src="./2020-10-26-post-29.jpg">  

4. Select **Install** or **Test & Install**. The following screen is displayed.  

<img src="./2020-10-26-post-30.jpg">  
Click **Continue**.
<img src="./2020-10-26-post-31.jpg">  
Complete items marked with ! and then click **Begin Installation**.  
<img src="./2020-10-26-post-32.jpg">  
Restart the host after the installation is complete.  

5. Start another terminal and shut down the newly installed VM.  

        virsh destroy [domain name]
6. Change the VM boot mode from **boot dev='cdrom'** to **boot dev='hd'**.  

        virsh edit [domain name]
7. Restart the VM.  

        virsh start [domain name]
8. Use VNC Viewer to connect to the VM again and ensure that the VM is restarted successfully.  
---
title: 'OS Migration Practice: Deploying the MySQL Database on openEuler'
category: blog
date: 2022-07-26
tags:
    - openEuler
    - Migration
archives: 2022-07
author:
  - openEuler
summary: The openEuler community provides the x2openEuler tool to assess the compatibility of porting MySQL to the openEuler operating system before data migration.
---


The database migration work in OS migration is brain-racking. A simple task (such as copying a database to the target environment) does not mean that the process is simple. Thanks to the x2openEuler tool provided in the openEuler community, we can assess the compatibility between MySQL and openEuler before data migration, reducing preparation work and time overhead. Here, I share my experience of deploying the MySQL service on openEuler for your reference.  

## 1. Overview

This article describes how to deploy the MySQL service on openEuler 20.03 SP1. In this practice, x86_64 VMs are used. The x2openEuler tool is used to assess the compatibility between MySQL 5.7.21 and openEuler before data migration. You can refer to this article as well If you use MySQL of other versions.  

## 2. Environment

Hardware requirements

| Item                 | Description                  |
| -------------------- | ---------------------------- |
| Server               | TaiShan 200 server           |
| CPU                  | Huawei Kunpeng 920 processor |
| RAID controller card | SAS3508                      |
| NIC                  | Mellanox SP333<br>TM210<br>TM280|
| Drive                | 500 GB or more               |

OS requirements

| Software | Version             | Remarks                      |
| -------- | ------------------- | ---------------------------- |
| OS       | Centos 7.6.1810     | Current MySQL cluster server |
| OS       | openEuler 20.03 SP1 | Target server                |

Software versions

| Software              | Version |
| --------------------- | ------- |
| mysql5                | 5.7.21  |
| mysql5-common         | 5.7.21  |
| mysql5-embedded       | 5.7.21  |
| mysql5-embedded-devel | 5.7.21  |
| mysql5-errmsg         | 5.7.21  |
| mysql5-libs           | 5.7.21  |
| mysql5-server         | 5.7.21  |
| mysql5-test           | 5.7.21  |

## 3. Software Compatibility Assessment

The openEuler community provides [x2openEuler](https://repo.oepkgs.net/openEuler/rpm/openEuler-20.03-LTS-SP1/stable/contrib/x2openEuler/noarch/Packages/) to assess software packages and interfaces of compiled binary programs, and determine whether application software needs to be adapted and whether any dependencies are needed. In addition, the tool checks whether prototypes of interfaces called by the software are different between the two OSs.    
Note: It is difficult to ensure that the binary program is completely compatible with the target OS once it has been compiled and therefore memory corruption risks may occur. Since it is difficult to identify this problem through verification, it is therefore important to perform software compatibility assessment prior to porting.  

(1) Obtain the MySQL RPM package and decompress it to the /opt/mysql directory.  

```csharp
wget –P /opt https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.21-1.el7.x86_64.rpm-bundle.tar
```

```csharp
cd /opt/
mkdir mysql
tar -xf mysql-5.7.21-1.el7.x86_64.rpm-bundle.tar -C mysql
```

(2) Download the x2openEuler tool to **/opt/mysql**.

```csharp
Download address: https://www.openeuler.org/en/other/migration/
```

(3) Deploy the tool.

```csharp
cd /opt/mysql
rpm -ivh x2openEuler-2.0.0-1.x86_64.rpm
```

Note: You need to install the RPM package as the **root** user. This step requires a network connection for downloading and installing the dependencies. Install dependencies such as **bzip2-devel** as prompted.  

```csharp
su x2openEuler
x2openEuler redis-db -init
```

Enter the following information about the Redis database in sequential order:
IP address: 127.0.0.1  
Port: 6379  
Database index (0-16): 0  
Password (encrypted by the tool): If the Redis password is not set or is empty, press **Enter**.

```csharp
x2openEuler init source_centos7.6-openEuler20.03-LTS-SP1.tar.gz
```

Note: After x2openEuler is installed using an RPM package, the default resource package (**source_centos7.6-openEuler20.03-LTS-SP1.tar.gz**) is generated in the **/opt/x2openEuler** directory. To support the compatibility assessment of software ported to openEuler 20.03 LTS SP1 from CentOS 8.2, you need to obtain and import the corresponding static resource package. For example, if the resource package is **source_centos8.2-openEuler20.03-LTS-SP1.tar.gz**, run **x2openEuler init source_centos8.2-openEuler20.03-LTS-SP1.tar.gz** to import the package.  

(4) Scan MySQL.  

```csharp
x2openEuler scan /opt/mysql/
```

The x2openEuler user must have the read permission on the files to be analyzed.
After the scan is complete, an HTML report is generated in the **/opt/x2openEuler/output** directory.  

## 4. Result Analysis

The software compatibility assessment report consists of three parts: dependency compatibility, C/C++ interface compatibility, and Java interface compatibility. Dependency compatibility reflects the direct dependencies required during software installation. If the dependency compatibility is not 100%, the installation will fail. Interface compatibility reflects the calling of other software packages, dynamic libraries, or system interfaces during the running of the software. If the interface compatibility is not 100%, an exception may be triggered when a certain function is called. Manual confirmation is recommended for some results. The priority of software packages is as follows: packages that have been ported to openEuler > manually recompiled packages for openEuler > packages for CentOS.  

### 4.1 Report Analysis

Open and view the HTML report line by line. In the example below, the report shows that using the CentOS MySQL package on openEuler may cause the following risk:    
One to-be-confirmed interface indicates that the MySQL series packages call libaio.so.1.0.1, and that the number of function parameters changes from 4 to 5. When the function is called, an exception may be triggered.    
In addition, the report shows that three dependencies need to be confirmed. It has been manually confirmed that they form a circular dependency between the MySQL series packages. Therefore, the software installation is not affected.  

<img src="./m01.png">  

<img src="./m02.png">  

### 4.2 Suggestion

To avoid function call risks, you are advised to use the MySQL 5.7.21 series packages that have been compiled by and released in the openEuler community.  

```csharp
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mysql5-5.7.21-3.oe1.x86_64.rpm
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mariadb-common-10.3.9-9.oe1.x86_64.rpm
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mysql5-common-5.7.21-3.oe1.x86_64.rpm
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mysql5-server-5.7.21-3.oe1.x86_64.rpm
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mysql5-errmsg-5.7.21-3.oe1.x86_64.rpm
https://repo.openeuler.org/openEuler-20.03-LTS-SP1/everything/x86_64/Packages/mecab-0.996-2.oe1.x86_64.rpm
```

## 5. Installing the MySQL Database

### 5.1 Installing MySQL and Configuring the Password

(1) Install MariaDB and MySQL services.  

```csharp
rpm -ivh mysql5-5.7.21-3.oe1.x86_64.rpm mariadb-common-10.3.9-9.oe1.x86_64.rpm mysql5-common-5.7.21-3.oe1.x86_64.rpm mysql5-server-5.7.21-3.oe1.x86_64.rpm mecab-0.996-2.oe1.x86_64.rpm mysql5-errmsg-5.7.21-3.oe1.x86_64.rpm
```

(2) Start MySQL.  

```csharp
systemctl start mysqld
```

(3) Query the MySQL status.  

`systemctl status mysqld`  
If the status is **running**, MySQL is successfully started.

```csharp
root@vm-2p32g.2288hv5-2s44p-384g--b5-0 ~# systemctl status mysqld
● mysqld.service - MySQL 5.7 database server
Loaded: loaded (/usr/lib/systemd/system/mysqld.service; disabled; vendor preset: disabled)

  Active: active (running) since Thu 2021-09-09 10:23:25 CST; 1 day 4h ago

 Process: 103715 ExecStartPre=/usr/libexec/mysql-check-socket (code=exited, status=0/SUCCESS)

 Process: 103738 ExecStartPre=/usr/libexec/mysql-prepare-db-dir mysqld.service (code=exited, sta>

 Process: 103773 ExecStart=/usr/libexec/mysqld --daemonize --basedir=/usr --pid-file=/run/mysqld>

 Process: 103803 ExecStartPost=/usr/libexec/mysql-check-upgrade (code=exited, status=0/SUCCESS)

 Main PID: 103775 (mysqld)

  Tasks: 37

  Memory: 188.4M

  CGroup: /system.slice/mysqld.service

      └─103775 /usr/libexec/mysqld --daemonize --basedir=/usr --pid-file=/run/mysqld/mysqld.
```

(4) Log in to the database and change the default password.  

`mysql -uroot -p`

 - a. By default, there is no password. Press **Enter** to log in.

```csharp
root@vm-2p32g.2288hv5-2s44p-384g--b5-0 /# mysql -uroot -p

Enter password: 

Welcome to the MySQL monitor. Commands end with ; or \g.

Your MySQL connection id is 2

Server version: 5.7.21 MySQL Community Server (GPL)
Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved. 
Oracle is a registered trademark of Oracle Corporation and/or its affiliates. Other names may be trademarks of their respective owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

 - b. Set the password using the following statement:

alter user 'user'@'localhost' identified by 'passward';

```csharp
mysql> alter user 'root'@'localhost' identified by '123456';

Query OK, 0 rows affected (0.00 sec)

mysql> flush privileges;

Query OK, 0 rows affected (0.00 sec)

mysql>
```

The **flush privileges** statement is mandatory for the settings to take effect.

#### (5) Verify the password.

Log out and log in to MySQL again to check whether the password is changed successfully.

```csharp
root@vm-2p32g.2288hv5-2s44p-384g--b5-0 /# mysql -uroot -p

Enter password: 
Welcome to the MySQL monitor. Commands end with ; or \g.
Your MySQL connection id is 3Server version: 5.7.21 MySQL Community Server (GPL) 
Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates. Other names may be trademarks of their respective owners.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql>
```

## 6. Summary

So far, you can perform the migration based on the assessment result. If you have any questions about the result, contact the openEuler community using the mailing list (dev@openeuler.org).  

### References

[openEuler official website](https://www.openeuler.org/en/other/migration/)

[x2openEuler User Guide](https://docs.openeuler.org/en/docs/20.03_LTS_SP1/docs/thirdparty_migration/x2openEuleruserguide.html)

[openEuler community mailing list](https://www.openeuler.org/en/community/mailing-list/)

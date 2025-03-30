# Linux

## 第一章 linux操作系统

### 一、安装vmware

### 二、安装linux

下载linux发行版的地方很多，这里我们推荐几个权威的镜像站点：

- 阿里云镜像官网：[https://developer.aliyun.com/mirror/](https://developer.aliyun.com/mirror/)
- 清华大学开源软件镜像站：[https://mirrors.tuna.tsinghua.edu.cn](https://mirrors.tuna.tsinghua.edu.cn/)

### 三、linux目录结构

#### 1、基本介绍：

Linux中所有内容都是以文件的形式保存和管理，即：一切皆文件。普通文件是文件；目录(在win下称为文件夹)是文件；硬件设备(键盘、硬盘、打印机，网卡)是文件；套接字(socket)、网络通信等资源也都是文件。

#### 2、目录结构具体介绍：

- /
- root，存放root用户的相关文件
- home，存放普通用户的相关文件
- bin，存放常用命令的目录，如vi，su
- sbin，要具有一定权限才可以使用命令
- mnt，默认挂载光驱和软驱的目录
- etc，存放配置的相关文件
- var，存放经常变化的文件，如网络连接的sock文件 、日志
- boot，存放引导系统启动的相关文件
- usr，安装一个软件的默认目录，相当于windows下的program files
- proc，这个目录是一个虚拟的目录，它是系统内存的映射，访问这个目录来获取系统信息
- srv ，service缩写。该目录存放一些服务启动之后需要提取的数据
- sys，这是linux2.6内核的一个很大的变化，该目录下安装了2.6内核中新出现的一个文件系统
- tmp，这个目录是用来存放一些临时文件的
- del，类似于windows的设备管理器，把所有的硬件用文件的形式存储
- media，系统提供该目录是为了让用户临时挂载别的文件系统的，我们可以将外部的存储挂载在/mnt/上，然后进入该目录就可以查看里面的内容了。
- opt，这是给主机额外安装软件所摆放，如安装oracle数据库就可放到该目录下默认为空。

小知识：

- linux的目录中有且只有一个根目录/,
- linux的各个目录存放的内容是规划好的，不用乱放文件，
- linux是以文件的形式管理我们的设备，因此linux系统。**一切皆文件**。
- linux的各个文件目录下存放什么内容，大家必须有一个认识，
- 你的脑海里应该有一颗linux的目录树。

### 四、虚拟机网络配置

使用了虚拟机之后，我们在同一台电脑中，在【编辑->虚拟网络编辑器】中，我们可以看到vmvare给我们提供了3中网络连接模式：

![1658368245475](..\img\1658368245475-4a0d0486.png)

#### 1、Bridged（桥接模式）

什么是桥接模式？桥接模式就是将【主机网卡】与【虚拟机虚拟的网卡】利用虚拟网桥进行通信。在桥接的作用下，类似于把【物理主机虚拟为一个交换机】，所有桥接设置的【虚拟机】连接到这个交换机的一个接口上，物理主机也同样插在这个交换机当中，所以所有桥接下的网卡与网卡都是交换模式的，相互可以访问而不干扰。在桥接模式下，虚拟机ip地址需要与主机在同一个网段，如果需要联网，则网关与DNS需要与主机网卡一致。其网络结构如下图所示：

![1658328738219](..\img\1658328738219-0ce44023.png)

#### 2、NAT（地址转换模式）

刚刚我们说到，如果你的网络ip资源紧缺或者不稳定，或者不想让虚拟机使用我们的真实IP地址，但是你又希望你的虚拟机能够联网，这时候NAT模式是最好的选择，这也是vmware默认的网络模式。NAT模式借助【虚拟NAT设备】和【虚拟DHCP服务器】，使得虚拟机可以联网。在该模式下我们不需要做任何的配置，即可以实现虚拟机和物理机的互联互通，同时虚拟机可以上网。家用路由器采用的就是这种模式，其网络结构如下图所示：

![1658328767723](..\img\1658328767723-e0c597f9.png)

【DHCP服务器】是自动为计算机【分配IP地址和子网掩码】的服务器，DHCP服务器维护了一个【地址池】，它只会从这个池子里分配地址，一个MAC对应一个地址，如果不用了就放回池子，这样就可以避免搞出重复的IP地址。通常我们的路由器也是采用这种模式：

【虚拟NAT设备】的作用主要是做网络地址转换，我们可以使用内部的局域网络，访问公共网络，转换流程如下图：

![1658390864981](..\img\1658390864981-afa7d4fc.png)

该模式下：

- 物理机会产生一张虚拟网卡（VMnet8）、这张网卡和虚拟机的网卡的ip地址统一有dhcp管理发放。
- 上网时，通过nat设备进行网络地址转化，从而使得所有的网卡均可上网。

![1658391457631](..\img\1658391457631-f7a0a616.png)

#### 3、Host-Only（仅主机模式）

Host-Only模式其实就是NAT模式去除了【虚拟NAT设备】，然后使用VMware Network Adapter VMnet1【虚拟网卡】连接VMnet1【虚拟交换机】来与【虚拟机】通信的，Host-Only模式将虚拟机与外网隔开，使得虚拟机成为一个独立的系统，只与主机相互通讯。其网络结构如下图所示：

![1658328796903](..\img\1658328796903-f057882e.png)

### 五、shell简介

#### 1、shell命令类型

shell是一个程序，用于用户和操作系统进行交互，相当于是一个命令解析器。作为用户和内核交互的接口，既是一种命令语言又是一种程序设计语言。shell命令又分为内置命令和外部命令。

- 内置命令

  【内部命令】实际上是shell程序的一部分，其中包含的是一些比较简单的linux系统命令，这些命令由shell程序识别并在shell程序内部完成运行，通常**在linux系统加载运行时shell就被加载并驻留在系统内存中**。内部命令是写在bashy源码里面的，其执行速度比外部命令快，因为解析内部命令shell不需要创建子进程。比如：cd，echo等 。

- 外部命令

  【外部命令】是linux系统中的实用程序部分，因为实用程序的功能通常都比较强大，所以其包含的程序量也会很大，**在系统加载时并不随系统一起被加载到内存中，而是在需要时才将其调用内存**。通常外部命令的实体并**不包含在shell中，但是其命令执行过程是由shell程序控制的**。shell程序管理外部命令执行的路径查找、加载存放，并控制命令的执行。外部命令是在bash之外额外安装的，通常放在/bin、 /usr/bin、 /sbin、 /usr/sbin 等目录下。可通过“echo $PATH”命令查看外部命令的存储路径，比如：ls、vi等。

如何区分是内部命令还是外部命令？

- 通过type命令，如：type cd 可以看到是内部命令；type mkdir可以看到是外部命令。

内部命令和外部命令最大的区别之处就是性能。内部命令由于构建在shell中而不必创建多余的进程，要比外部命令执行快得多。因此和执行更大的脚本道理一样，执行包含很多外部命令的脚本会损害脚本的性能。

### 六、安装finalshell

下载地址：官网 http://www.hostbuf.com/t/988.html

#### 1、绑定静态ip

使用nat连接方式，dhcp服务器会自动分配ip地址，通常情况这个ip也不会频繁变化，我们也确实可以连接成功，但是ip地址确实有可能会发生改变，所以，我们为了以后连接不出问题，建议直接给虚拟机绑定一个静态ip。

```bash
cd /etc/NetworkManager/system-connections/
```

```bash
[ipv4]
address1=192.168.111.132/24,192.168.111.2
dns=114.114.114.114
method=manual
```

先按`esc`退出编辑模式，再按 `shfit+:` 进入命令模式，再输入` wq`，点击回车保存并退出。

使用nmcli（NetworkManager Command Line）网络管理命令行工具，重启网卡，service和systemctl在centos8及stram中已不能使用！！！

```bash
nmcli c reload                         # 重新加载配置文件
nmcli c up ens33                      # 重启ens33网卡
```

## 第二章、liunx命令详解

### 一、常用快捷键

在正式进入命令学习之前，再介绍几个【linux常用的快捷键】：

| 快捷键 | 作用                                   |
| :----- | -------------------------------------- |
| ctrl+l | 清屏（clear）                          |
| ctrl+c | 停止进程                               |
| 上下键 | 查找曾今执行过的命令                   |
| tab    | 命令补全，多用不仅提高效率还能防止敲错 |

既然linux一切皆文件，了解万能的帮助命令后，我们就从目录文件命令开始学习。

### 二、帮助命令

帮助命令主要有2个：man、help。平时要多于帮助命令，遇到不清楚的命令就用帮助命令查看，无须死记硬背，熟能生巧。

#### 1、man命令

语法：man [命令或配置文件]

作用：获取帮助信息

案例：

```csharp
man date
```

由于帮助信息比较多，需要翻页才能看完，因此先说明一下本界面可能需要用到按键及用途。

| 按键               | 用途                           |
| ------------------ | :----------------------------- |
| 空格键             | 向下翻页                       |
| PgDn （page down） | 向下翻页                       |
| PgUp （page up）   | 向上翻页                       |
| home               | 前往首页                       |
| end                | 前往页尾                       |
| /                  | 从上至下搜索关键字，如“/linux” |
| ？                 | 从下至上搜索关键字，如“?linux” |
| n                  | 定位到下一个搜索到的关键词     |
| N                  | 定位到上一个搜索到的关键词     |
| q                  | 退出帮助文档                   |

初学者一看，这么多的帮助信息反而感到困惑了，其实很简单的，我们来理一下帮助信息的结构（上图中圈红线的部分）。

| 结构名称    | 说明                                   |
| ----------- | -------------------------------------- |
| NAME        | 命令的名称                             |
| SYNOPSIS    | 命令的基本语法格式                     |
| DESCRIPTION | 详细说明语法格式对应的选项和参数的用法 |
| EXAMPLES    | 如何使用命令的示例                     |
| OVERVIEW    | 概述                                   |
| DEFAULTS    | 默认功能                               |
| OPTIONS     | 具体的可用选项                         |
| ENVIRONMENT | 环境变量                               |
| SEE ALSO    | 相关的资料，通常是手册页               |

通过这些帮助信息，就可以轻松的掌握各个命令的用法。

#### 2、help命令

语法：help 命令

作用：获取shell内置命令的帮助信息

案例：

```bash
[root@ydlclass ~]# help cd
```

### 三、目录相关命令

#### 1、pwd

语法：pwd

功能描述：显示当前工作目录的绝对路径

案例：

```csharp
[root@ydlclass ~]# pwd
/root
```

#### 2、ls（list）

语法：ls 选项

功能描述：列出目录下的文件

选项：

- -a(--all):显示全部文件，包括隐藏文件（以.开头的文件）
- -d：directory，列出目录本身
- -l：long长数据串列出，包含文件的属性和权限等。每行列出的信息依次为：文件类型与权限、链接数、文件所属用户、文件属组、文件大小（byte）、创建或最近修改时间、名字，该命令可以简化为 ll。

案例：

```css
[root@ydlclass test]# ls -al
该命令可以简化为：ll -a
```

#### 3、cd

语法：`cd [选项][目录名称]`

功能描述：切换到指定目录

案例：

- cd 绝对路径或相对路径 （跳转到指定目录）
- cd 或cd ~ (返回当前用户家目录)，和windows一样linux会给每一个用户创建一个家目录。
- cd - （返回上一次所在的目录）
- cd .. （返回当前目录的上一级目录）

linux每创建一个普通用户都会在【/home】下创建一个和用户名相同的目录

root用户比较特殊，他有自己独立的家目录

#### 4、mkdir

语法：mkdir [选项] 目录名称

功能描述：创建指定目录

选项：

- -p ：parents，递归创建多层目录

案例：

```bash
[root@ydlclass ~]# mkdir ydlclass
[root@ydlclass ~]# mkdir -p a/b
[root@ydlclass ~]# mkdir c/d -p
```

#### 5、rmdir

语法： rmdir [选项] 目录名称

功能描述：删除空目录

选项：

- -p：删除多级目录

案例：

```bash
[root@ydlclass ~]# rmdir ydlclass
[root@ydlclass ~]#  rmdir -p c/d
 （如果不指定-p参数，则只删除最后一级不为空的目录）
```

#### 6、cp

语法：cp 【源目录或文件】 【目标目录或文件】

功能描述：复制目录或文件

选项：

- -r：recursive，递归复制整个文件夹

案例：

将ydlclass.txt复制为ydlclass.xml，且在复制时进行重命名，没有参数只能复制一个文件：

```bash
cp ydlclass.txt a
[root@ydlclass ~]# cp ydlclass.txt ydlclass.xml
```

将所有ydlclass目录下的内容全部复制到ydl目录，该命令会自动创建ydl目录：

```bash
[root@ydlclass ~]# cp -r ydlclass ydl  
[root@localhost ydlclass]# cp a/* b
```

#### 7、mv

语法：mv [选项] 源 目标

功能描述：移动文件或重命名文件

案例：

将ydlclass.txt文件重命名为ydlclass.ml

```bash
[root@ydlclass test]# mv ydlclass.txt ydlclass.ml
```

将ydlclass目录及其里边所有内容移动到ydl目录，该命令会自动创建ydl目录，其实也可以理解为目录重命名

```bash
[root@ydlclass ~]# mv ydlclass ydlclass  
```

#### 8、rm

语法：rm [选项] 文件

功能描述：删除文件及目录

选项：

- -f：force强制执行
- -r：recursive递归执行

案例：

递归删除目录及其下所有内容：

```bash
 [root@ydlclass ~]# rm -rf ydlclass 
```

通配符 * 代表所有文件，/ydlclass/*代表ydlclass目录下的所有文件

### 四、文件相关命令

#### 1、touch

语法：touch [选项] 文件名

功能描述：创建文件

案例：

```bash
[root@ydlclass test]# touch ydlclass.txt
```

#### 2、echo

语法：echo 字符串或变量

功能描述：输出字符串或变量值，还可以搭配从定向符将内容存储到文件

案例：

```bash
[root@ydlclass test]# echo hello
hello
[root@ydlclass test]# echo $SHELL
/bin/bash
# 将linux这个字符串追加到ydlclass.txt文件
[root@ydlclass test]# echo linux >> ydlclass.txt 
# 将linux这个字符串输出到ydlclass.txt文件，会覆盖原来的内容
[root@ydlclass test]# echo linux > ydlclass.txt 
```

#### 3、cat

语法：cat [选项] 文件名

功能描述：查看文件内容，从第一行开始显示

选项：

- -A：列出特殊字符而非空白
- -b：列出行号，空白行不算行号
- -n：列出行号，空白行也会有行号
- -v：列出一些看不出来的特殊字符

案例：

```bash
 [root@ydlclass test]# cat ydlclass.txt 
 hello
 who are you
 
 where are you from
 [root@ydlclass test]# cat -A ydlclass.txt 
 hello$
 who are you$
 $
 where are you from$
 [root@ydlclass test]# cat -b ydlclass.txt 
      1  hello
      2  who are you
 
      3  where are you from
 [root@ydlclass test]# cat -n ydlclass.txt 
      1  hello
      2  who are you
      3
      4  where are you from
```

#### 4、more

语法：more [选项] 文件

功能描述：查看文件内容，一页一页的显示

使用说明：

- 空格键（space）：向下翻一页
- enter：向下翻一行
- q：退出more，不在显示文件内容
- ctrl+f：向下滚动一屏
- ctrl+b：返回上一屏

```bash
[root@localhost ~]# more /etc/profile
```

#### 5、head

语法：head [选项] 文件

功能描述：查看文件内容，只看头几行，默认展示十行

选项：

- -n：查看头n行

案例：

```bash
[root@localhost ~]# head -n 5 /etc/profile
```

#### 6、tail

语法：tail [选项] 文件

功能描述：查看文件内容，只查看文件末尾几行，默认展示10行

选项：

- -n：末尾几行
- -f：follow输出文件修改的内容，用于追踪文件修改

案例：

```bash
 [root@ydlclass test]# tail -n 2 ydlclass.txt
 [root@ydlclass test]# tail -f ydlclass.txt
```

#### 7、wc

语法：wc [选项] 文本

功能描述：统计指定文本的行数、字数、字节数

选项：

- -l：lines显示行数
- -w：显示单词数
- -c：显示字节数

案例：

```css
[root@ydlclass test]# cat ydlclass.txt 
hello

who are you
where are you form?

wellcome
hahah
test
[root@ydlclass test]# wc -l ydlclass.txt 
8 ydlclass.txt
[root@ydlclass test]# wc -c ydlclass.txt 
60 ydlclass.txt
[root@ydlclass test]# wc -w ydlclass.txt 
11 ydlclass.txt
```

#### 8、stat

语法：stat [选项] 文件

功能描述：查看文件的具体存储信息和时间等信息

案例：

```bash
[root@ydlclass test]# stat ydlclass.txt 
  文件：ydl.txt
  大小：8               块：8          IO 块：4096   普通文件
设备：fd00h/64768d      Inode：16972453    硬链接：1
权限：(0644/-rw-r--r--)  Uid：(    0/    root)   Gid：(    0/    root)
环境：unconfined_u:object_r:admin_home_t:s0
最近访问：2022-07-27 11:35:57.238465130 +0800
最近更改：2022-07-27 11:35:57.237465126 +0800
最近改动：2022-07-27 11:35:57.237465126 +0800
创建时间：2022-07-27 11:34:08.348072454 +0800
```

#### 9、file

语法：file 文件名

功能描述：查看文件类型

案例：

```css
[root@localhost ~]# file ydlclass.txt 
ydl.txt: ASCII text
[root@localhost ~]# echo 张 >> ydlclass.txt 
[root@localhost ~]# file ydl.txt 
ydl.txt: UTF-8 Unicode text
```

### 五、安装软件和资源下载

#### 1、yum

*YUM*（yellowdog updater modified）是一个RPM系统的自动更新和软件包安装/卸载器。它可以自动计算依赖和找出想要安装的软件包。

yum安装软件的流程如下：![image-20220729151414923](..\img\image-20220729151414923-0312b716.png)

**常见命令：**

- search 查找安装包的细节

```text
[root@localhost ydlclass]# yum search vim
上次元数据过期检查：0:10:59 前，执行于 2022年07月29日 星期五 11时24分56秒。
============== 名称 和 概况 匹配：vim ======================
vim-X11.x86_64 : The VIM version of the vi editor for the X Window System - GVim
vim-common.x86_64 : The common files needed by any version of the VIM editor
vim-enhanced.x86_64 : A version of the VIM editor which includes recent enhancements
vim-filesystem.noarch : VIM filesystem layout
vim-minimal.x86_64 : A minimal version of the VIM editor
```

- install 安装程序到到系统

```bash
[root@localhost ydlclass]# yum install vim -y
```

- remove 卸载一个包

```bash
[root@localhost ydlclass]# yum remove vim -y
```

- repolist 显示软件仓库的配置
- upgrade 升级整个系统，一般在系统版本升级的时候使用
- clean 清除YUM 缓存

#### 2、wget

语法：wget [参数] [url地址]

功能：下载网络文件

参数：

- -b：background后台下载
- -P：directory-prefix下载到指定目录
- -O：下载并以指定的文件名保存

### 六、vim编辑器

#### 1、命令模式

（1）光标移动

| 操作类型     | 操作键              | 功能            |
| ------------ | ------------------- | --------------- |
| 方向移动     | H J K L或上下左右键 | 上下左右        |
| 翻页         | Page Down或Ctrl+F   | 下翻页          |
|              | Page up 或Ctrl+B    | 上翻页          |
| 行内快速跳转 | HOME键或 ^ 、数字0  | 跳至行首        |
|              | END键或$            | 跳至行尾        |
| 行间快速跳转 | gg                  | 跳转文件的首行  |
|              | n+gg                | 跳转文件的第n行 |
|              | G                   | 跳转文件的尾行  |

（2）删除、复制、粘贴

| 操作类型 | 操作键   | 功能                                         |
| -------- | -------- | -------------------------------------------- |
| 删除     | x或Del   | 删除光标处的单个字符                         |
|          | dw       | 删除至一个单词的末尾                         |
|          | d2wgg    | 删除两个字符                                 |
|          | dd       | 删除当前光标所在行                           |
|          | n+dd     | 删除从光标所在行开始的n行内容                |
|          | d^       | 删除当前光标之前到行首的所有字符（不含光标） |
|          | d$       | 从当前光标删除到行尾（包含光标）             |
| 复制     | yy       | 复制当前行整行的内容到剪贴板                 |
|          | nyy(3yy) | 复制从光标所在行开始的n行内容                |
| 粘贴     | p        | 粘贴                                         |
| 替换     | r+字符   | 输入r+字符，替换所在位置字符                 |
|          | R+字符   | 连续替换多个字符                             |

（3）可视模式

可视模式可以进行批量文本的选择：

复制粘贴文本，次模式下可进行多行文本复制：

1. v 进入可视模式
2. 移动光标位置
3. 输入y复制文本
4. 输入p粘贴

（4）文件内容查找（区别大小写）

| 操作键 | 功能                             |
| ------ | -------------------------------- |
| /word  | 从上而下在文件中查找字符串“word” |
| n      | 向下查找匹配字符串               |
| N      | 向上查找匹配字符串               |

（5）撤销编辑及保存退出

| 操作键 | 功能                                  |      |
| ------ | ------------------------------------- | ---- |
| u      | 撤销最后执行的命令,多次输入，多次撤销 |      |
| U      | 撤销对整行的命令                      |      |
| ZZ     | 保存当前的文件内容并退出vi编辑器      |      |

#### 2、插入模式

| 命令 | 功能             |
| ---- | ---------------- |
| i    | 光标前插入文本   |
| a    | 光标后插入文本   |
| A    | 行末尾插入文本   |
| o    | 光标下行插入文本 |
| O    | 光标上行插入文本 |

#### 3、末行模式

（1）保存文件及退出vi编辑器

| 功能           | 命令             | 备注                 |
| -------------- | ---------------- | -------------------- |
| 保存文件       | :w               | 保存修改的内容       |
|                | :w /root/newfile | 另存为其他文件       |
| 退出vi         | :q               | 未修改退出           |
|                | :q!              | 放弃修改并退出       |
| 保存文件退出vi | :wq              | 保存修改的内容并退出 |
| 行号显示       | :set nu          | 在编辑器中显示行号   |
|                | :set nonu        | 取消编辑器中显示行号 |

| 命令          | 功能           |
| ------------- | -------------- |
| :s/old/new    | 只替换该行首个 |
| :s/old/new/g  | 替换该行全部   |
| :%s/old/new/g | 替换该文档全部 |

### 七、文本处理命令

```text
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
窦燕山，有义方。教五子，名俱扬。
养不教，父之过。教不严，师之惰。
子不学，非所宜。幼不学，老何为。
玉不琢，不成器。人不学，不知义。
为人子，方少时。亲师友，习礼仪。
香九龄，能温席。孝于亲，所当执。
融四岁，能让梨。弟于长，宜先知。
首孝悌，次见闻。知某数，识某文。
一而十，十而百。百而千，千而万。
三才者，天地人。三光者，日月星。
三纲者，君臣义。父子亲，夫妇顺。
曰春夏，曰秋冬。此四时，运不穷。
曰南北，曰西东。此四方，应乎中。
```

#### 1、grep

语法：grep [参数] 查找内容 源文件

功能描述：在文件内搜索字符串匹配的行并输出

参数：

- -c：count只输出匹配行的计数
- -n：输出匹配的行和行号

案例：

```bash
# 没有参数会匹配所有满足条件的行
[root@localhost ydlclass]# grep 不 ydlclass.txt 
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
养不教，父之过。教不严，师之惰。
子不学，非所宜。幼不学，老何为。
玉不琢，不成器。人不学，不知义。
曰春夏，曰秋冬。此四时，运不穷。
# -n会将行号也显示出来
[root@localhost ydlclass]# grep 不 ydlclass.txt -n
2:苟不教，性乃迁。教之道，贵以专。
3:昔孟母，择邻处。子不学，断机杼。
5:养不教，父之过。教不严，师之惰。
6:子不学，非所宜。幼不学，老何为。
7:玉不琢，不成器。人不学，不知义。
15:曰春夏，曰秋冬。此四时，运不穷。
# -c只会显示满足条件的行的数量
[root@localhost ydlclass]# grep 不 ydlclass.txt -c
6
```

#### 2、sed

sed是一个很好的文本文件处理工具，他是以【行】为单位进行处理，可以将数据行进行替换、删除、新增、刷选等特定工作。

工作原理如下图：

![image-20220729103849117](..\img\image-20220729103849117-39ae0ca1.png)

sed命令行格式为：

```text
sed [-option] 'command' 输入文本
```

常用选项：

- -n∶使用安静(silent)模式。在一般 sed 的用法中，所有来自被处理和未被处理的数据都会显示在控制台。但如果加上 -n 参数后，则只有经过sed 特殊处理的那一行才会被列出来。
- -i∶直接修改读取的档案内容，而不是由控制台输出。

sed的选项还有 -f、-r、-e等，我们不做一一的讲解。

常用命令：

- a∶新增， 在下一行插入
- c∶替换， c 的后面可以接字串，这些字串可以取代 n1,n2 之间的行！
- d∶删除，因为是删除啊，所以 d 后面通常不接任何咚咚；
- i∶插入， 在上一行插入
- p∶展示，列出最终的结果。
- s∶替换，可以直接进行取代的工作哩！通常这个 s 的动作可以搭配正规表示法！例如 1,20s/old/new/g 就是啦！

**举例：**

（1）刷选某行记录：

我们可以使用数字代表第n行，使用$代表最后一行，命令如下：

```bash
#显示第一行
[root@localhost ydlclass] # sed -n '1p' ydlclass.txt  
#显示最后一行
[root@localhost ydlclass] # sed -n '$p' ydlclass.txt 
#显示第一行到第二行
[root@localhost ydlclass] # sed -n '1,2p' ydlclass.txt 
#显示第二行到最后一行
[root@localhost ydlclass] # sed -n '2,$p' ydlclass.txt  
```

还可以使用正则匹配进行查询

```bash
#查询包括关键字ydlclass所在所有行
[root@localhost ydlclass] # sed -n '/子/p' ydlclass.txt 

[root@localhost ydlclass]# sed -n '/^子.*/p' ydlclass.txt 
子不学，非所宜。幼不学，老何为。
# 使用正则表达式匹配一个
[root@localhost ydlclass]# sed -n '/1[3578]\{1\}[0-9]\{9\}/p' ydlclass.txt 
```



（2）删除特定行：

```bash
#删除第一行
[root@localhost ydlclass]# sed '1d' ydlclass.txt 
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
#删除最后一行
[root@localhost ydlclass] # sed '$d' ydlclass.txt  
#删除第一行到第二行
[root@localhost ydlclass] # sed '1,2d' ydlclass.txt  
#删除第二行到最后一行
[root@localhost ydlclass] # sed '2,$d' ydlclass.txt   
```

（3）插入一行或多行字符串

```bash
[root@localhost ydlclass]# sed '1i 锄禾日当午' ydlclass.txt 
锄禾日当午
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。

[root@localhost ydlclass]# sed '2,5a 汗滴禾下土' ydlclass.txt 
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。
汗滴禾下土
昔孟母，择邻处。子不学，断机杼。
汗滴禾下土
窦燕山，有义方。教五子，名俱扬。
汗滴禾下土
养不教，父之过。教不严，师之惰。
汗滴禾下土
```



（1）替换

c命令，整行替换

```bash
[root@localhost ydlclass]# sed '1c 黄河之水' ydlclass.txt 
黄河之水
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
[root@localhost ydlclass]# sed '1,3c 黄河之水' ydlclass.txt 
黄河之水
窦燕山，有义方。教五子，名俱扬。
养不教，父之过。教不严，师之惰。
```

s命令

格式：sed 's/要替换的字符串/新的字符串/g' （要替换的字符串可以用正则表达式）

```bash
[root@localhost ydlclass]# sed 's/子/父/g' ydlclass.txt 
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。父不学，断机杼。
窦燕山，有义方。教五父，名俱扬。
```

#### 3、awk

awk是一个强大的文本分析工具，相对于grep的查找，sed的编辑，awk在其对数据【分析并生成报告】时，显得尤为强大。简单来说awk就是把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行各种分析处理。

我们将ydlclass的数据改为如下：

```text
张三丰 18 3000 研发部
李四 25 3200 销售部
王五 33 4000 产品部
```

命令行格式为：

```text
awk options 'commands' 文件
```

相对来说awk命令是复杂度比较高的命令，我们着重在于了解，不需要掌握很深。

awk有很多的内置变量和函数，我们可以稍作了解：

**awk 内置变量包括：**

- $0:当前行记录
- 1−1-1−n:第一到第n列数据
- FILENAME : 当前输入文件名称
- NR : 记录数（行号）
- NF : 读取文件的记录数（行号）
- OFS : 输出字段分隔符
- FS : 输入字段分隔符
- ORS : 输出记录分隔符
- RS : 输入记录分隔符

我们先举一个列子，大家可以感受一下：

```bash
[root@localhost ydlclass]# awk '{print}' ydlclass.txt 
张三丰 18 3000 研发部
李四 25 3200 销售部
王五 33 4000 产品部
```

只打印第一列：

```bash
[root@localhost ydlclass]# awk '{print $1}' ydlclass.txt 
张三丰
李四
王五
```

只打印第三和第一列：

```bash
[root@localhost ydlclass]# awk '{print $3$1}' ydlclass.txt 
3000张三丰
3200李四
4000王五
```

使用逗号关联，默认会用空格分开：

```bash
[root@localhost ydlclass]# awk '{print $3,$1}' ydlclass.txt 
3000 张三丰
3200 李四
4000 王五
```

我们可以自定义输入分隔符和输出分隔符：

```bash
[root@localhost ydlclass]# awk -v FS=" " -v OFS="|" '{print NR,$3,NF}' ydlclass.txt 
1|工资|4
2|3000|4
3|3200|4
4|4000|4
# 更简单的定义输入分割符的方法
[root@localhost ydlclass]# awk -F, '{print NR,$3,NF}' ydlclass.txt 
[root@localhost ydlclass]# awk -v OFS="\t" '{print NR,$1,$2,$3,$4}' ydlclass.txt  
1       张三丰  18      3000    研发部
2       李四    25      3200    销售部
3       王五    33      4000    产品部
```

BEGIN模块后紧跟着动作块，这个动作块在awk处理任何输入文件之前执行，比如打印标题。

END不匹配任何的输入文件，但是执行动作块中的所有动作，它在整个输入文件处理完成后被执行。

打印标题：

```bash
[root@localhost ydlclass]# awk 'BEGIN {print "姓名 年龄"} {print $0} ' ydlclass.txt 
```

求平均工资：

```bash
[root@localhost ydlclass]# awk '{sum+=$3} END {print sum/NR}' ydlclass.txt 
3400
[root@localhost ~]# awk 'BEGIN {print "平均薪资"} {sum += $3} END {print sum/NR}' ydlclass 
```

### 八、查找命令

有时候需要从大量文件中找出需要的文件或者从指定文件中查找特定内容，这就需要用到查找相关的命令。

#### 1、find

语法：find [搜索范围] [匹配条件]

功能描述：查找文件或目录

参数说明

- -name：按文件名称查找
- -user：按文件拥有者查找
- -size：根按文件大小查找文件（+n大于，-n小于，n等于）

案例：

在test目录下查找test1.txt文件

```bash
[root@localhost ~]# find /etc/ -name profile
/etc/lvm/profile
/etc/dconf/profile
/etc/profile
```

查找test目录下查找用户root的文件

```bash
[root@localhost ~]# find /etc/ -user ydlclass
```

在test目录下查找小于100M的文件

```bash
[root@ydlclass ~]# find /etc/ -size -102400
```

### 九、日期命令

日期相关命令用于设置或获取系统日期。

#### 1、date

语法：date [选项] [格式]

功能描述：显示或设置时间

参数：

-s：set 以字符串格式设置时间

格式：**（注意区分大小写）**

- +%Y：显示当前年份
- +%m：显示当前月份
- +%d：显示当前是哪一天
- +%H：显示当前小时
- +%M：显示当前分钟
- +%S：显示当前秒数
- +%Y%m%d：显示当前年月日
- "+%Y-%m-%d %H:%M:%S"：显示当前年月日时分秒 (用引号括起来)

案例：

设置时间

```css
[root@ydlclass test]# 
Sun Nov 24 11:05:10 CST 2019
```

显示时间

```css
[root@ydlclass test]# date
Sun Nov 24 11:02:21 CST 2019
[root@ydlclass test]# date +%Y%m%d
20191124
[root@ydlclass test]# date "+%Y-%m-%d %H:%M:%S"
2019-11-24 11:02:55
```

date查看非当前时间（比如前一天，后一天、取下周周一等等）以及cal查看日历命令暂时不做讨论，以后有机会在讨论。

### 十、压缩解压

为了便于传输或节省存储空间有时候文件是以压缩包的形式存在，因此就需要了解压缩与解压相关命令。

- 打包是指将一大堆文件或目录什么的变成一个总的文件。
- 压缩是将一个大的文件通过一些压缩算法变成一个小文件。

在linux中打包和压缩是两个过程。

#### 1、tar

语法：tar [参数] 包名.tar.gz 待打包的内容

功能描述：打包目录，压缩后的文件格式为.tar.gz

参数：

| 短指令 | 长指令                     | 描述                                                   |
| ------ | -------------------------- | ------------------------------------------------------ |
| -c     | --create                   | 打包                                                   |
| -v     | --verbose                  | 显示详细的tar处理的文件信息的过程                      |
| -f     | --file                     | 要操作的文件名                                         |
| -x     | --extract                  | 解包                                                   |
| -z     | --gzip, --gunzip, --ungzip | 通过 gzip 来进行归档压缩或解压                         |
| -C     | --directory=DIR            | 解压文件至指定的目录，如果是解压到当前目录，可以不加-C |

案例：

压缩多个文件，将ydlclass.txt和test1.txt压缩为test.tar.gz

```bash
[root@localhost ~]# tar -cf ydletc.tar ydletc/

[root@localhost ~]# tar -czvf ydletc.tar.gz ydletc/

[root@localhost ~]# tar -xzvf ydletc.tar.gz -C ./etc/
tar -czvf   名字  文件名    打包并压缩
tar -xzvf   文件名         解压缩并解包
tar -cvf    名字  文件名    打包
[root@ydlclass test]# tar -zcvf test.tar.gz ydlclass.txt test1.txt 
ydlclass.txt
test1.txt
[root@ydlclass test]# ll
total 10252
-rw-r--r--. 1 root root       26 Nov 23 20:40 test1.txt
-rw-r--r--. 1 root root      210 Nov 23 23:57 test.tar.gz
-rw-r--r--. 1 root root       66 Nov 23 21:56 ydlclass.txt
```

打包并压缩文件或目录：

```bash
[root@ydlclass test]# tar -zcvf ydl.tar.gz ydl.txt 
ydl.txt
```

解压缩并解打包到当前目录：

```bash
[root@ydlclass test]# tar -zxvf ydl.tar.gz 
```

#### 2、zip和unzip

语法：

压缩：zip [参数] 包名.zip 待压缩内容

解压：uzip 包名.zip

功能描述：压缩文件和目录，windows和linux通用且可以压缩目录并保留源文件

参数：

- -r：recurse-paths递归压缩目录

案例：

压缩ydlclass.txt或test1.txt为test.zip

```css
[root@localhost ~]# zip ydl.zip ydl.txt 
  adding: ydl.txt (deflated 57%)
```

解压test.zip

```css
[root@ydlclass test]# unzip ydl.zip
Archive:  test.zip
inflating: ydlclass.txt                
extracting: test1.txt  
```

#### 3、gzip和gunzip

gzip与zip区别主要是适应系统不同，还有就是压缩率不一样，Windows系统下普遍使用zip，Linux系统下面普遍使用gzip。

语法：

压缩：gzip [参数] 文件

解压：gzip [参数] 文件.gz

功能描述：

压缩：压缩文件，只能将文件压缩为\*.gz文件。**只能压缩文件不能压缩目录，压缩解压后不保留原来的文件。对单个文件压缩**

解压：解压文件

案例：

压缩文件：

```css
[root@localhost ~]# gzip ydl.txt 
```

解压文件：

```css
[root@localhost ~]# gunzip ydl.txt.gz 
```

### 十一、进程相关命令

任务都以进程或线程的形式存在，因此需要随时关注系统的进程，查看是否有异常进程以及各进程占用系统资源的情况并使用不同的进程管理命令对进程管理和控制。

#### 1、ps

功能描述：查看系统中所有进程

参数：

- -e：显示所有进程。
- -f：全格式。
- -a：all 显示现行终端机下的所有程序，包括其他用户的程序。
- -u：userlist 以用户为主的格式来显示程序状况
- -x： 显示所有程序，不以终端机来区分 （前面讲过终端有很多类型，不仅显示当前终端）

案例：

```bash
[root@localhost ~]# ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  1.3 171652 12768 ?        Ss   20:05   0:00 /usr/lib/systemd/systemd rhgb --switched-root --system --de
root           2  0.0  0.0      0     0 ?        S    20:05   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   20:05   0:00 [rcu_gp]
root           4  0.0  0.0      0     0 ?        I<   20:05   0:00 [rcu_par_gp]
root           5  0.0  0.0      0     0 ?        I<   20:05   0:00 [netns]
```

我们也经常使用-ef参数，这两条命令基本没有区别，都是"显示全部进程"：

```bash
[root@localhost ~]# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 20:05 ?        00:00:00 /usr/lib/systemd/systemd rhgb --switched-root --system --deserialize 31
root           2       0  0 20:05 ?        00:00:00 [kthreadd]
root           3       2  0 20:05 ?        00:00:00 [rcu_gp]
root           4       2  0 20:05 ?        00:00:00 [rcu_par_gp]
root           5       2  0 20:05 ?        00:00:00 [netns]
```

每一项内容的解释：

| 项      | 含义                                                         |
| ------- | ------------------------------------------------------------ |
| USER    | 进程是由哪个用户产生的                                       |
| PID     | 进程ID                                                       |
| %CPU    | 该进程占用CPU的百分比，占用越高，进程越耗费资源              |
| %MEM    | 该进程占用内存的百分比，占用越高，进程越耗费资源             |
| VSZ     | 占用虚拟内存的大小，单位KB                                   |
| RSS     | 占用实际物理内存的大小，单位KB                               |
| TTY     | 表示该进程在哪个终端中运行，tty1-tty7代表本地控制台终端(tty1-tty6是本地的字符界面终端，tty7是图形终端),pts/0-255代表虚拟终端 |
| STAT    | 进程状态，常用状态有：R（运行）、S（睡眠）、T（停止状态）、s（包含子进程）、+（位于后台） |
| START   | 进程启动时间                                                 |
| TIME    | 进程执行时间，即占用cpu的运算时间，不是系统时间              |
| COMMAND | 产生此进程的命令名                                           |

#### 2、管道命令【|】

我们可以通过管道命令对上一个命令的结果进行过滤：

ps的结果内容太多，我们可以使用管道命令对ps的结果进行二次处理，筛选出满足条件的结果：

```bash
[root@localhost ~]# ps -aux | grep sshd
root         952  0.0  0.8  16084  8564 ?        Ss   20:06   0:00 sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups
root        1502  0.0  1.2  19372 11684 ?        Ss   20:10   0:01 sshd: root [priv]
root        1531  0.4  0.8  19704  7668 ?        S    20:10   0:22 sshd: root@pts/0,pts/1
root        1556  0.0  1.2  19372 11596 ?        Ss   20:10   0:00 sshd: root [priv]
root        1606  0.0  0.7  19372  7172 ?        S    20:10   0:00 sshd: root@notty
root      307674  0.0  0.2 221812  2388 pts/0    S+   21:31   0:00 grep --color=auto sshd
```

#### 3、top

语法：top [选项]

功能描述：查看系统健康状态

参数：

- -d秒数：Delay-time，指定top命令每隔几秒更新，默认是3秒。
- -i：Idle-process，使top命令不显示任何闲置或者僵死进程
- -p：Monitor-PIDs ，通过指定监控进程ID来仅仅监控某个进程的状态
- -s：Secure-mode，使top在安全模式运行，去除交互命令所带来的潜在危险

案例：

查看非僵死进程，一秒钟刷新一次【top -i -d 1】

![1659104010420](..\img\1659104010420-9d2f7a78.png)

在此界面可以通过如下相应按键进行排序操作

| 操作键  | 说明                      |
| :------ | :------------------------ |
| shift+n | 以PID排序                 |
| shift+m | 以内存排序                |
| shift+p | 以cpu使用率排序，默认选项 |
| q       | 退出top                   |

命令结果解释

第一行：任务队列信息

| 内容                           | 说明                                                         |
| :----------------------------- | :----------------------------------------------------------- |
| 12:20:42                       | 当前系统时间                                                 |
| up 1 day, 14:12                | 系统运行时间                                                 |
| 3 users                        | 当前登录用户数                                               |
| load average: 0.08，0.01, 0.05 | 系统在之前1分钟、5分钟、15分钟的平均负载，一般认为小于1时，负载较小，如果大于1说明系统已经超出负载 |

第二行：进程信息

| 内容             | 说明                                      |
| :--------------- | :---------------------------------------- |
| Tasks: 395 total | 系统中的总进程数                          |
| 1 running        | 正在运行的进程数                          |
| 391 sleeping     | 睡眠的进程                                |
| 3 stopped        | 正在停止的进程                            |
| 0 zombie         | 僵尸进程，如果不是0，需要手工检查僵尸进程 |

第三行：cpu信息

| 内容            | 说明                                                         |
| --------------- | :----------------------------------------------------------- |
| %Cpu(s): 0.0 us | 用户模式占用的cpu百分比                                      |
| 1.0 sy          | 系统模式占用的cpu百分比                                      |
| 0.0 ni          | 改变过优先级的用户进程占用的cpu百分比                        |
| 99.0 id         | 空闲cpu的百分比                                              |
| 0.0 wa          | 等待输入、输出的进程占用cpu的百分比                          |
| 0.0 hi          | 硬中断请求服务占用的cpu百分比                                |
| 0.0 si          | 软中断请求服务占用的cpu百分比                                |
| 0.0 st          | steal time虚拟世界百分比，当有虚拟机时，虚拟cpu等待时机cpu的时间百分比 |

> ps：如果服务器有多个cpu，将显示多行

第四行：物理内存信息

| 内容                   | 说明                   |
| ---------------------- | :--------------------- |
| KiB Mem: 1870784 total | 物理内存的总量，单位KB |
| 720520 used            | 已使用的物理内存数量   |
| 1150264 free           | 空闲的物理内存数量     |
| 880 buffers            | 作为缓冲的内存数量     |

第五行：交换分区信息

| 内存                    | 说明                         |
| ----------------------- | ---------------------------- |
| KiB Swap: 2097148 total | 交换分区（虚拟内存）的总大小 |
| 0 used                  | 已经使用的交换分区的大小     |
| 2097148 free            | 空闲交换分区的大小           |
| 238616 cached Mem       | 作为缓存的交换分区的大小     |

第六行：空行

第七行：表头信息

| 内容    | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| PID     | 进程id                                                       |
| USER    | 进程所有者                                                   |
| PR      | 进程优先级                                                   |
| NI      | 负值表示高优先级，正值表示低优先级                           |
| VIRT    | 进程使用的虚拟内存总量，单位kb。VIRT=SWAP+RES                |
| RES     | 进程使用的、未被换出的物理内存大小，单位kb。RES=CODE+DATA    |
| SHR     | 共享内存大小，单位kb                                         |
| S       | 进程状态。D=不可中断的睡眠状态 R=运行 S=睡眠 T=跟踪/停止 Z=僵尸进程 |
| %CPU    | 上次更新到现在的CPU时间占用百分比                            |
| %MEM    | 进程使用的物理内存百分比                                     |
| TIME+   | 进程使用的CPU时间总计，单位1/100秒                           |
| COMMAND | 进程名称（命令名/命令行）                                    |

#### 4、pidof

语法：pidof [参数] 服务名称

功能描述：查询某个指定服务进程的pid值

案例：

查看sshd服务的进程id

```bash
[root@localhost ~]# pidof sshd
1127 1118 1113 1093 961
```

#### 6、kill常用

语法：kill [选项] 进程id

功能描述：终止某个指定pid的服务进程

选项：

-9：强迫进程立即停止

案例：

```bash
[root@ydlclass test]# kill -9 20385
```

#### 7、killall

语法：killall [选项] 服务名

功能描述：终止某个指定名称的服务对应的所有进程

案例：

终止httpd服务的所有进程

```bash
[root@ydlclass test]# killall httpd
```

### 十二、系统状态相关命令

通过相关命令检查系统状态以及资源耗用情况，保证系统健康稳定运行。

#### 1、ip addr

语法：ifconfig 或者 ip addr

功能描述：获取网卡配置和网络状态信息

#### 2、netstat

如果该命令不能用，需要下载net-tools，yum install net-tools。

语法：netstat [参数]

- -t或--tcp 显示TCP传输协议的连接状况。
- -u或--udp 显示UDP传输协议的连接状况。
- -n或--numeric 直接使用IP地址，而不通过域名服务器。
- -l或--listening 显示监控中的服务器的Socket。
- -p或--programs 显示正在使用Socket的程序的进程号和程序名称。

功能描述：显示整个系统目前网络情况，比如目前的链接、数据包传递数据、路由表内容等

案例：

这个命令可以列出目前正在某些端口等待或已经发生了tcp连接的程序：![1659104488417](..\img\1659104488417-d135a10e.png)

#### 3、uname

语法：uname [选项]

功能描述：查看系统内核和系统版本等信息

参数：

- -a：all显示系统完整信息
- -s：kernel-name系统内核名称
- -n：nodename节点名称
- -r：kernel-release内核发行版
- -v：kernel-version内核版本
- -m：machine硬件名称
- -i：hardware-platform硬件平台
- -p：processor处理器类型
- -o：operating-system操作系统名称

案例：

```bash
[root@ydlclass test]# uname
Linux
[root@localhost ~]# uname -a
Linux localhost.localdomain 5.14.0-130.el9.x86_64 #1 SMP PREEMPT_DYNAMIC Fri Jul 15 11:24:09 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux
```

显示信息依次为：内核名称（Linux）、主机名（localhost.localdomain）、内核发行版（5.14.0-130.el9.x86_64）、内核版本（#1 SMP PREEMPT_DYNAMIC Fri Jul 15 11:24:09 UTC 2022）、硬件名称（x86_64）、硬件平台（x86_64）、处理器类型（x86_64）及操作系统名称（GNU/Linux）。

如果要查看系统版本的详细信息，通过查看/etc/redhat-release文件

```bash
[root@localhost ~]# cat /etc/redhat-release 
CentOS Stream release 9
```

#### 4、uptime

语法：uptime [选项]

功能描述：查看系统的负载信息，可以显示当前系统时间、系统已运行时间、启用终端数量以及平均负载值等信息。平均负载值指系统在最近1分钟、5分钟、15分钟内的压力情况，负载值越低越好，尽量不要长期超过1，生产环境不要超过5。

案例：

```css
[root@ydlclass test]# uptime
 21:30:44 up 1 day, 23:23,  3 users,  load average: 0.00, 0.01, 0.05
```

####  5、free

语法：free [选项]

功能描述：显示当前系统中内存的使用信息

选项：

-m：megabytes以兆字节显示

-h：human带单位输出

案例：

```ruby
[root@ydlclass test]# free -h
             total       used       free     shared    buffers     cached
Mem:          1.8G       702M       1.1G       8.9M       880K       233M
-/+ buffers/cache:       468M       1.3G
Swap:         2.0G         0B       2.0G
```

> 字段说明：total（内存总量）、used（已用量）、free（可用量）、shared（进程共享的内存量）、buffers（磁盘缓存的内存量）、cached（缓存的内存量）

#### 6、df

df 以磁盘分区为单位查看文件系统，可以获取硬盘被占用了多少空间，目前还剩下多少空间等信息。

例如，我们使用df -h命令来查看磁盘信息， -h 选项为根据大小适当显示：

![img](..\img\b5ad59f7bd3bc162c13703cf6be9b1ba-8f7edc0b.png)

显示内容参数说明：

- **Filesystem**：文件系统
- **Size**： 分区大小
- **Used**： 已使用容量
- **Avail**： 还可以使用的容量
- **Use%**： 已用百分比
- **Mounted on**： 挂载点

**相关命令：**

- df -hl：查看磁盘剩余空间
- df -h：查看每个根路径的分区大小
- du -sh [目录名]：返回该目录的大小
- du -sm [文件夹]：返回该文件夹总M数
- du -h [目录名]：查看指定文件夹下的所有文件大小（包含子文件夹）

#### 7、who

语法：who [参数]

功能描述：查看当前登入主机的用户终端信息

案例：

```bash
[root@ydlclass test]# who
root     pts/0        2019-11-22 22:10 (192.168.78.1)
root     pts/1        2019-11-23 11:53 (192.168.78.1)
```

#### 8、last

语法：last [参数]

功能描述：查看所有的系统登录记录。但是要注意，这些信息是以日志文件保存的，因此黑客可以很容易进行修改，所以不能单纯以该命令来判断是否有黑客入侵。

案例：

```bash
[root@ydlclass test]# last
root     pts/2        192.168.78.1     Sun Nov 24 13:09 - 13:36  (00:26) 
root     pts/1        192.168.78.1     Sat Nov 23 11:53   still logged in 
... 省略部分内容
```

#### 9、history

语法：history [参数]

功能描述：显示历史执行过的命令

选项：

- -c：清除所有历史记录，但是.bash_history文件内容不会删除

案例：

```bash
[root@ydlclass test]# history
    1  history
    2  ll
    3  ls
    4  history

# 可以用“!编号”执行某一次曾经执行过的命令
[root@ydlclass test]# !2
ll
total 8
-rw-r--r--. 1 root root 26 Nov 23 20:40 test1.txt
-rw-r--r--. 1 root root 66 Nov 23 21:56 ydlclass.txt
```

可以用“!编号”执行某一次曾经执行过的命令

历史命令保存在一个用户家目录的.bash_history文件中（.开头为隐藏文件通过ls或ll -a列出），可以用cat命令查看。

### 十三、关机命令

正确的关机流程：sync>shutdown或reboot或halt

**无论重启还是关机，都需要先sync将内存数据同步到硬盘中，避免数据丢失**

#### 1、shutdown

语法：shutdown [-option]

功能描述：关机

选项：

- -h：关机
- -r：重启

关机时间：

- hh:mm：指定24小时制的小时和分钟后关机
- +m：m分钟后关机(+1：默认值，1分钟后关机; +0：now，立刻关机)

案例：

1分钟后关机并提示所有已登录系统的用户

```kotlin
[root@ydlclass ~]# shutdown -h 1 "this server will shutdown after 1min"
this server will shutdown after 1min
The system is going down for power-off at Sun 2019-11-24 22:25:55 CST!
```

#### 2、reboot

语法：reboot [ 选项]

功能描述：重启系统，等同于shutdown -r now

案例：

```csharp
[root@ydlclass ~]# reboot
```

#### 3、poweroff

语法：poweroff [选项]

功能描述：关闭系统

案例：

```csharp
[root@ydlclass ~]# poweroff
```

#### 4、halt

语法：halt [选项]

功能描述：关闭系统，等同于shutdown -h now和poweroff

案例：

```csharp
[root@ydlclass ~]# halt
```

## 第三章 权限管理

### 一、权限简介

Linux系统上对文件的权限有着严格的控制，对某个文件执行某种操作，必须具有对应的权限方可执行成功。

Linux下文件的权限类型一般包括【读，写，执行】。对应字母为 r、w、x。

Linux下权限的粒度有【拥有者 、群组 、其它组】三种。每个文件都可以针对三个粒度，设置不同的rwx(读写执行)权限。通常情况下，一个文件只能归属于一个用户和组， 如果其它的用户想有这个文件的权限，则可以将该用户加入具备权限的群组，一个用户可以同时归属于多个组。

Linux上通常使用chmod命令对文件的权限进行设置和更改。

### 二、创建用户和组

1、添加用户，Centos 没有任何交互动作！创建用户完毕后，必须修改密码否则无法登陆：

```bash
[root@localhost ~]# useradd itnanls
[root@localhost ~]# passwd itnanls
更改用户 itnanls 的密码 。
新的密码： 
重新输入新的密码： 
passwd：所有的身份验证令牌已经成功更新。
[root@localhost ~]# 
```

切换命令

```bash
su itnanls
```

建工作组

```bash
groupadd ydl       
```

新建用户同时增加工作组

```bash
useradd -g ydl itlils    
```

给已有的用户增加工作组

> usermod命令

usermod可用来修改用户帐号的各项设定。

**参数说明**：

- `-c<备注>` 　修改用户帐号的备注文字。
- `-d<登入目录>` 　修改用户登入时的目录。
- `-e<有效期限>` 　修改帐号的有效期限。
- `-g<群组>` 　修改用户所属的群组。
- `-G<群组>` 　修改用户所属的附加群组。
- `-l<帐号名称>` 　修改用户帐号名称。
- `-L` 　锁定用户密码，使密码无效。
- `-u<uid>` 　修改用户ID。

实例

更改用户的组

```bash
[root@localhost itnanls]# usermod -g ydl itnanls
[root@localhost itnanls]# id itnanls
用户id=1000(itnanls) 组id=1001(ydl) 组=1001(ydl)
```

永久性删除用户账号

```bash
userdel itlils 
groupdel ydl
```

显示用户信息

```bash
[root@localhost ~]# id root
用户id=0(root) 组id=0(root) 组=0(root)
```

### 三、基础权限

1、Linux文件一共有三种身份：

- u：文件的拥有者(user)
- g：文件所属的群组(group)
- o：其他用户(other)

2、对于每个身份，又有四种权限：

- r：读取文件的权限（read）
- w：写入文件的权限（write）
- x：执行的权限（execute）
- s：特殊权限(special)

### 四、如何查询文件权限属性

通过ls -al 文件名 指令来查询文件的属性

```bash
[root@localhost ~]# ll
总用量 13040
-rw-r--r--. 1 root root     7633  8月  6  2021 '1628237260060.png?Expires=1943597258'
-rw-------. 1 root root      701  7月 27 10:02  anaconda-ks.cfg
```

以上7项依次表示【文件的属性和权限-rw-r--r--】、【连接数1】、【文件的拥有者root】、【文件所属的群组root】、【文件大小】、【文件创建时间】和【文件名称】

### 五、文件属性解释

在Linux系统中，文件的属性由10个字符来表示。 第一个字符表示文件的类型，其余9个字符分为三组，每组三个，分别表示文件的拥有者、群组以及其他人对该文件的访问权限。

每组依次表示读取、写入、和执行的权限，如果没有该权限，则以**-**显示。

对于 `-rw-r--r--` 分别为：

| 文件类型 | 文件拥有者的权限 | 群组的权限 | 其他人的权限 |
| -------- | ---------------- | ---------- | ------------ |
| -        | rw-              | r--        | r--          |

> 文件类型：

```swift
-　　　　一般文件
d　　　　文件夹（或者叫目录）
l　　　　符号链接文件（类似windows下的快捷方式一样的东西）
b　　　　磁盘设备文件
c　　　　字符设备文件(（和磁盘设备文件，主要是和周边硬件连接，作为系统和硬件之间的接口）)
s　　　　Socket文件((内部进程通信的一种特殊文件，也可作为和远程主机通信的管道))
p　　　　连接文件(是一种内部进程通信的机制，一个进程把数据写入Pipe中，另一个进程则由Pipe读取数据，数据采用先进先出（FIFO）的次序，称为管道)
```

三、chown修改文件所属组和权限

1、使用语法

- 用法：chown [参数] user[:group] 文件

2、参数说明

| 参数      | 参数说明                             |
| --------- | ------------------------------------ |
| user      | 新的文件拥有者的使用者 ID            |
| group     | 新的文件拥有者的使用者组(group)      |
| -R        | 处理指定目录以及其子目录下的所有文件 |
| –help     | 显示辅助说明                         |
| --version | 显示版本                             |

实例：

把ydlclass.txt 的所有者设置 itnanls：

```bash
chown itnanls ydlclass.txt
```

将文件 ydlclass.txt 的拥有者设为 itnanls，群体的使用者 ydl:

```bash
chown itnanls:ydl ydlclass.txt
```

将当前前目录下的所有文件与子目录的拥有者皆设为 itnanls，群体的使用者 ydl:

```text
chown -R itnanls:ydl *
```

### 六、chmod以字符形式改变文件

给三种身份都赋予执行的权限

```bash
chmod a+x 文件名
```

也拆开写，a表示all所有人分别用u、g、o替换

对应： 去掉某个身份的某个权限，只需要将+变为-即可。比如

```bash
chmod u-r 文件名
```

### 七、chmod以数字形式改变文件

- 读取权限：r 或者4
- 写入权限：w或者2
- 执行权限：x或者1
- 可读写可执行：rwx = 4 + 2 + 1 = 7
- 可读写不可执行：rw- = 4 + 2 = 6
- 可读不可写可执行：r-x = 4 +1 = 5

> 常见权限形式

- -rw------- (600) 只有拥有者有读写权限。
- -rw-r--r-- (644) 只有拥有者有读写权限；而属组用户和其他用户只有读权限。
- -rwx------ (700) 只有拥有者有读、写、执行权限。
- -rwxr-xr-x (755) 拥有者有读、写、执行权限；而属组用户和其他用户只有读、执行权限。
- -rwx--x--x (711) 拥有者有读、写、执行权限；而属组用户和其他用户只有执行权限。
- -rw-rw-rw- (666) 所有用户都有文件读、写权限。
- -rwxrwxrwx (777) 所有用户都有读、写、执行权限。

范例：

```bash
#设置所有人可以读写及执行
chmod 777 file  (等价于  chmod u=rwx,g=rwx,o=rwx file 或 chmod a=rwx file)

#设置拥有者可读写，其他人不可读写执行
chmod 600 file (等价于  chmod u=rw,g=---,o=--- file )
```

### 八、权限提升

在ydl用户下新增用户不被允许：

```bash
[itnanls@localhost root]$ useradd itwangls
useradd: Permission denied.
useradd：无法锁定 /etc/passwd，请稍后再试。
```

我们可以使用sudo命令，暂时提升，但是发现提升权限不被允许：

```bash
[itnanls@localhost root]$ sudo useradd itwangls

我们信任您已经从系统管理员那里了解了日常注意事项。
总结起来无外乎这三点：

    #1) 尊重别人的隐私。
    #2) 输入前要先考虑(后果和风险)。
    #3) 权力越大，责任越大。

[sudo] itnanls 的密码：
itnanls 不在 sudoers 文件中。此事将被报告。
```

这是我们需要修改一下sudo 命令的配置文件 【/etc/sudoers】。(注意，/etc/sudoers 的配置内容十分丰富，我们仅做简单的介绍。要了解更多信息，请参考 man sudoers。)

编辑这个文件是有【单独的命令的 visudo】(这个文件我们最好不要使用 vim 命令来打开)，是因为一旦你的语法写错会造成严重的后果，这个工具会替你检查你写的语法，这个文件的语法遵循以下格式：

```bash
## Allow root to run any commands anywhere 
root    ALL=(ALL)       ALL
```

- root　　　　表示 root 用户。
- ALL　　 　　表示从任何的主机上都可以执行，也可以这样 192.168.100.0/24。
- (ALL) 　 表示是以谁的身份来执行，ALL 就代表 root 可以以任何人的身份来执行命令。
- ALL 　　　　表示任何命令。

那么整条规则就是【 root 用户可以在任何主机以任何人的身份来执行所有的命令】。

再看个例子：

```bash
itnanls  ALL=(root) /usr/sbin/useradd
```

上面的配置只允许 itnanls以 root 权限执行 useradd 命令。

> 设置 sudo 时不需要输入密码

执行 sudo 命令时总是需要输入密码事件很不爽的事情(抛开安全性)。有些应用场景也需要在执行 sudo 时避开输入密码的交互过程。 那么需要如何设置呢？其实很简单，只需要在配置行中添加 NOPASSWD: 就可以了：

```bash
## Allow root to run any commands anywhere 
root    ALL=(ALL)       ALL
itnanls ALL=(ALL)       NOPASSWD:   /usr/sbin/useradd
```

## 第四章 安装软件

### 一、安装jdk，配置环境变量

1、下载jdk11

2、上传jdk到目标目录

3、解压jdk到当前目录

```bash
tar -zvxf jdk-11.0.4_linux-x64_bin.tar.gz 
 mv jdk-11.0.4 jdk11
```

4、编辑配置文件，配置环境变量

```bash
vim /etc/profile
export JAVA_HOME=/opt/software/jdk11
export PATH=$JAVA_HOME/bin:$PATH
```

5、执行命令 ：

```bash
source /etc/profile
```

6、查看安装情况

```bash
[root@localhost jdk11]# java -version
java version "11.0.4" 2019-07-16 LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.4+10-LTS)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.4+10-LTS, mixed mode)
```

### 二、安装宝塔

### 三：防火墙和端口

1、防火墙的开启、关闭、禁用命令

- 设置开机启用防火墙：systemctl enable firewalld.service
- 设置开机禁用防火墙：systemctl disable firewalld.service
- 启动防火墙：systemctl start firewalld
- 关闭防火墙：systemctl stop firewalld
- 检查防火墙状态：systemctl status firewalld

2、使用firewall-cmd配置端口

- 查看防火墙状态：firewall-cmd --state
- 重新加载配置：firewall-cmd --reload
- 查看开放的端口：firewall-cmd --list-ports
- 开启防火墙端口：firewall-cmd --zone=public --add-port=9200/tcp --permanent

命令含义：

- –zone #作用域
- –add-port=9200/tcp #添加端口，格式为：端口/通讯协议
- –permanent #永久生效，没有此参数重启后失效

注意：添加端口后，必须用命令firewall-cmd --reload重新加载一遍才会生效

3、关闭防火墙端口：

```bash
firewall-cmd --zone=public --remove-port=9200/tcp --permanent
```
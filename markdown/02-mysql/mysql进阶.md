# MySQL进阶

## 第一章 mysql架构

### 一、mysql的系统架构

![image-20220424195802351](..\img\image-20220424195802351-3a69069f.png)

**小问题：MySQL8.0为什么取消了查询缓存？**

mysql采用的是hash算法，sql产生微小的变化，比如说加空格，字母大小写，加注释，都会导致缓存失效

同时大量的缓存会因为数据库的修改而导致大量的失效

可能在里面仅仅只有10%是真正需要长久进行缓存的，而且现在有更多的解决方案，比如说我们有专门的内存数据库radis来独立的缓存这10%的热点数据

### 二、目录结构

#### 2、linux中的文件目录

（1）我们可以通过配置文件查看当前mysql的一些基本信息，linux中的配置文件在etc目录 ，名称为my.cnf，如下：

（2）bin目录，一些可执行文件，包括

**bin目录工具汇总：**

> MySQL服务器端工具

- mysqld：SQL后台保护程序(MySQL服务器进程)。该程序必须运行之后。客户端才能通过连接服务器端程序访问和操作数据库。
- mysqld_safe：MySQL服务脚本。mysql_safe增加了一些安全特性，如当出现错误时重启服务器，向错误日志文件写入运行时间信息。
- mysql.server：MySQL服务启动服本。调用mysqld_safe来启动MySQL服务。
- mysql_multi：服务器启动脚本，可以启动或停止系统上安装的多个服务。
- myiasmchk：用来描述、检查、优化和维护MyISAM表的实用工具。
- mysqlbu：MySQL缺陷报告脚本。它可以用来向MySQL邮件系统发送缺陷报告。
- mysql_install_db：用于默认权限创建MySQ授权表。通常只是在系统上首次安装MySQL时执行一次。

> MySQL客户端工具

- mysql：交互式输入SQL语句或从文件以批处理模式执行SQL语句来操作数据库管理系统，就是我们的客户端。
- mysqldump：将MySQL数据库转储到一个文件，可以用来备份数据库。
- mysqladmin：用来检索版本、进程、以及服务器的状态信息。
- mysqlbinlog：用于从二进制日志读取语句。在二进制日志文件中包含执行的语句，可用来帮助系统从崩溃中恢复。
- mysqlcheck：检查、修复、分析以及优化表的表维护。
- mysqlhotcopy：当服务器在运行时，快速备份MyISAM或ISAM表的工具。
- mysql import：使用load data infile将文本文件导入相关表的客户程序。
- perror：显示系统或MySQL错误代码含义的工具。
- myisampack：压缩MyISAP表，产生更小的只读表。
- mysaqlaccess：检查访问主机名、用户名和数据库组合的权限。

**tips**：我们看到在配置文件中有一个socket的配置，socket 即 Unix 域套接字文件，在类 unix 平台，客户端连接 MySQL 服务端的方式有两种，分别是 TCP/IP 方式与 socket 套接字文件方式。Unix 套接字文件连接的速度比 TCP/IP 快，但是只能连接到同一台计算机上的服务器使用。通过设置 socket 变量可配置套接字文件路径及名称，默认值为 /tmp/mysql.sock。本地客户端的连接默认会使用到该文件：

```bash
mysql -uroot -p -S /tmp/mysql.sock
```

接着给大家介绍一个【数据备份工具】，mysqldump可以用来实现轻量级的【快速迁移或恢复数据库】。 mysqldump是将数据表导成 SQL 脚本文件，在不同的 MySQL 版本之间升级时相对比较合适，这也是最常用的备份方法。mysqldump一般在数据量很小的时候（几个G）可以用于 备份。当数据量比较大的情况下，就不建议用mysqldump工具进行备份了。下边我们简单的使用mysqldump工具进行备份数据，命令如下：

```sql
-- 备份一个表
mysqldump -u root -p ydlclass ydl_user  > ~/dump.txt
-- 备份一个数据库
mysqldump -u root -p ydlclass  > ~/dump.txt
-- 备份所有数据库
mysqldump -u root -p --all-databases > dump.txt

备份完成之后使用
```

恢复数据，使用mysql指令：

```sql
mysql -u root -p ydl < ~/dump.txt
```

（3）数据库文件，该文件我们同样可以自由指定，该文件夹包含了日志文件，以及我们的数据文件

### 三、字符集和排序规则

mysql支持大量的字符集，但是我们通常使用的是utf8，【show collation】命令可以查看mysql支持的所有的排序规则和字符集

- utf8-polish-ci，表示utf-8的字符集的波兰语的比较规则，ci代表忽略大小写。
- utf8-general-ci，就是通用的忽略大小写的utf8字符集比较规则。
- utf8mb4_0900_ai_ci中的0900指的是Unicode 9.0的规范，后边的后缀代表不区分重音也不区分大小写，他是utf8mb4字符集一个新的通用排序归则。

| 后缀 | 英文               | 描述                     |
| ---- | ------------------ | ------------------------ |
| _ai  | accent insensitive | 不区分重音（è，é，ê和ë） |
| _as  | accent sensitive   | 区分重音                 |
| _ci  | case insensitive   | 不区分大小写             |
| _cs  | case sensitive     | 区分大小写               |
| _bin | binary             | 以二进制的形式进行比较   |

utf8和utf8mb4的区别：

- utf8mb3(utf-8)：使用1~3个字节表示字符，utf8默认就是utf8mb3。
- utf8mb4：使用1~4个字节表示字符，他是utf8的超集，甚至可以存储很多【emoji表情😀😃😄😁😆】，mysql8.0已经默认字符集设置为utf8mb4。

【字符集】和【比较规则】可以作用在全局、数据库、表、甚至是列级别：

全局：

mysql提供两个变量，进行全局设置。【character_set_server】和【collate_server】对全局的字符集和排序规则进行设置。这两个设置可以在配置文件中修改。

### 四、mysql修改配置的方法

在mysql中变量分为全局变量和会话变量

#### 1、全局变量

（1）查看全局变量

我们查看一个全局变量wait_timeout的值（这个值代表，客户端和服务器的连接不生交互后多久自动断开连接），语法如下：

```sql
show global variables like '%wait_timeout%';
select @@global.wait_timeout;
```

（2）设置全局变量方法1，修改配置文件, 然后重启mysqld：

```ini
# vi /etc/my.cnf
[mysqld]
wait_timeout=10000
# service mysqld restart
```

（3）设置全局变量方法2（推荐），在命令行里通过SET来设置：

如果要修改全局变量, 必须要显示指定"GLOBAL"或者"@@global."，同时必须要有SUPER权限.：

```sql
set global wait_timeout=10000;
set @@global.wait_timeout=10000;
```

然后查看设置是否成功:

```sql
show global variables like 'wait_timeout'
select @@global.wait_timeout
```

#### 2、当前会话的变量

如果要修改会话变量值, 可以指定"SESSION"或者"@@session."或者"@@"或者"LOCAL"或者"@@local.", 或者什么都不使用。语法：

```sql
mysql> set wait_timeout=10000;
mysql> set session wait_timeout=10000;
mysql> set local wait_timeout=10000;
mysql> set @@wait_timeout=10000;
mysql> set @@session.wait_timeout=10000;
mysql> set @@local.wait_timeout=10000;
```

然后查看设置是否成功:

```sql
mysql> select @@wait_timeout;
mysql> select @@session.wait_timeout;
mysql> select @@local.wait_timeout;
mysql> show variables like 'wait_timeout';
mysql> show local variables like 'wait_timeout';
mysql> show session variables like 'wait_timeout';
```

### 五、内置数据库

- mysql：这个库很重要，他是mysql的核心数据库，负责存储数据库的用户、权限设置、关键字等mysql自己需要使用，控制和管理的信息。
- information_schema：这个数据库维护了数据库其他表的一些描述性信息，也称为元数据。比如，当前有哪些表，哪些视图，哪些触发器，哪些列等。
- performation_schema：这个数据库用来存储mysql服务器运行过程中的一些状态信息，是做性能监控的。比如最近执行了什么sql语句，内存使用情况等
- sys：结合information_schema和performation_schema的数据，能更方便的了解mysql服务器的性能信息。

## 第三章 缓冲池 buffer pool

Innodb引擎会在mysql启动的时候，向操作系统申请一块连续的空间当做buffer pool，空间的大小由变量`innodb_buffer_pool_size`确定，我这台电脑他使用了8G，你的可能是128M。

有了缓存之后我们的执行过程如下：

- 访问id为1的数据，需要访问当前表空间的第一行数据，缓存当前页，一次I/O
- 访问id为2的数据，需要访问当前表空间的第二行数据，从缓存获取，无需I/O
- 访问id为3的数据，需要访问当前表空间的第三行数据，从缓存获取，无需I/O......

这个缓冲区的大小可以结合自己服务器的性能而定，这就明白了内存大的好处了吧。

## 第四章 MySQL临时表

#### 内部临时表创建时机

**MySQL在以下几种情况会创建临时表，大家也要思考为什么会产生临时表：**

1、使用GROUP BY分组，且分组字段没有索引时。

2、使用DISTINCT查询。

3、使用UNION进行结果合并，辅助去重。

注意：【union all】不会使用零时表，因为他不需要去重

复杂的sql中很容易产生临时表，这需要大家在工作中不断的学习和积累。

## 第五章 MySQL事务

### 一、事务简介

（1）在 MySQL 中只有使用了 Innodb 数据库引擎的数据库或表才支持事务。

（2）事务处理可以用来维护数据库的完整性，保证成批的 SQL 语句要么全部执行，要么全部不执行。

### 二、事务分类

#### 1、显式事务和隐式事务

（1）mysql的事务可以分为【显式事务】和【隐式事务】。默认的事务是隐式事务，由变量【autocommit】控制。隐式事务的环境下，我们每执行一条sql都会【自动开启和关闭】事务，变量如下：

```sql
SHOW VARIABLES LIKE 'autocommit';
```

（2）显式事务由我们【自己控制】事务的【开启，提交，回滚】等操作

```sql
start transaction;    
commit;
rollback;
```

我们可以使用begin或start transaction开启一个事务，使用commit提交事务，使用rollback回滚当前事务。

#### 2、只读事务和读写事务

我们可以使用read only开启只读事务，开启只读事务模式之后，事务执行期间任何【insert】或者【update】语句都是不允许的，具体语法如下：

```sql
start transaction read only
select * from ....
select * from ....
commit;
```

#### 3、保存点

我们可以使用savepoint 关键字在事务执行中新建【保存点】，之后可以使用rollback向任意保存点回滚。

```sql
start transaction;
UPDATE user set balance = balance - 200 where id = 1;
savepoint a;
UPDATE user set balance = balance + 200 where id = 2;
rollback to a;
```

**注意：**Mysql是不支持嵌套事务的，开启一个事务的情况下，若再开启一个事务，会隐式的提交上一个事务：

```sql
start transaction;
UPDATE user set balance = balance - 200 where id = 1;
    start transaction;    -- 这里会自动将第一个事务提交
    UPDATE user set balance = balance + 200 where id = 2;
    commit;
-- 回滚事务
rollback;
```

### 四、事务隔离级别

| 隔离级别                     | 脏读 | 不可重复读 | 幻读 | 解决方案                                   |
| ---------------------------- | ---- | ---------- | ---- | ------------------------------------------ |
| Read uncommitted（读未提交） | √    | √          | √    |                                            |
| Read committed（读已提交）   | ×    | √          | √    | undo log                                   |
| Repeatable read（可重复读）  | ×    | ×          | √    | MVCC版本控制+间隙锁（mysql的rr不存在幻读） |
| Serializable（串行化）       | ×    | ×          | ×    |                                            |

## 第六章 索引

### 一、数据结构

一方面mysql的数据是存储在磁盘上的，另一方面还要满足对日常操作如【增删改查】的高效稳定的支持，我们当然可以采用更好的硬件来提升性能，但是选用合适的数据结构也很关键，innodb采用的是一种名为【b+树】的数据结构。

#### 1、B-树

![image-20220429152229620](..\img\image-20220429152229620-0c8ec149.png)

#### 2、B+树

【B+树】是【B-树】的变体，也是一种多路搜索树, 它与 B- 树的不同之处在于:

1. 所有关键字存储在叶子节点
2. 为所有叶子结点增加了一个双向指针

简化 B+树 如下图：

![image-20220429152436442](..\img\image-20220429152436442-1eacd588.png)

### 二、索引的分类和创建

#### 1、聚簇索引和非聚簇索引

我们在上边的例子中，【主键和数据】共存的索引被称之为【聚簇索引】，其他的，比如我们使用【姓名列+主键】建立的索引，可以称为【非聚簇索引】，或者【辅助索引】，或者【二级索引】，同时聚簇索引只有在innodb引擎中才存在，而在myIsam中是不存在的，如下图：

![image-20220513141318848](..\img\image-20220513141318848-e4599efe.png)

InnoDB使用的是【聚簇索引】，他会将【主键】组织到一棵B+树中，而【行数据】就储存在叶子节点上，若使用`where id = 14`这样的条件查找主键，则按照B+树的检索算法即可查找到对应的叶节点，之后获得行数据。

若对Name列进行条件搜索，且name列已建立【索引】，则需要两个步骤：

- 第一步在辅助索引B+树中检索Name，到达其叶子节点获取对应的主键。
- 第二步使用主键在主索引B+树种再执行一次B+树检索操作，最终到达叶子节点即可获取整行数据。（重点在于通过其他键需要建立辅助索引）

如下图：![image-20220429171436220](..\img\image-20220429171436220-e060a1c3.png)

MyIsam使用的是【非聚簇索引】

**tips：**

- 聚簇索引【默认使用主键】，如果表中没有定义主键，InnoDB 会选择一个【唯一且非空】的列代替。如果没有这样的列，InnoDB 会隐式定义一个主键rowid来作为聚簇索引的列。
- 如果涉及到大数据量的排序、全表扫描、count之类的操作的话，还是MyIsam占优势些，因为索引所占空间小，这些操作是需要在内存中完成的。

**小问题：主键为什么建议使用自增id?**

- 主键最好不要使用uuid，因为uuid的值太过离散，不适合排序且可能出现新增加记录的uuid，会插入在索引树中间的位置，出现页分裂，导致索引树调整复杂度变大，消耗更多的时间和资源。
- 聚簇索引的数据的物理存放顺序与索引顺序是一致的，即：只要索引是相邻的，那么对应的数据一定也是相邻地存放在磁盘上的。如果主键不是自增id，它会不断地调整数据的物理地址、分页，当然也有其他一些措施来减少这些操作，但却无法彻底避免。但如果是自增的id，它只需要一 页一页地写，索引结构相对紧凑，磁盘碎片少，效率也高。

本章节中讲述了聚簇索引和二级键索引，对于【二级索引】而言，根据其不同的特性，我们又可以分为普通索引、唯一索引、复合索引等，接下来会一一讲解。

#### 2、普通索引 （常规索引）(normal)

就是普普通通的索引，没有什么特殊要求，理论上任何列都可以当做普通索引，创建方式如下：

**第一步：**创建索引前先执行下列语句，观察执行时间：

```sql
select * from user where user_name ='Dorothy William Harris';  -- 整个执行时间为4.297s
```

第二步：创建user_name列的索引：

```sql
create index idx_user_name on user(user_name);   -- 整个索引创建时间为24.502s
```

**结论：**创建索引是一个很费时间的操作。

**第三步：**再次执行下列语句

```sql
select * from ydl_user where user_name ='Dorothy William Harris';   -- 执行时间0.031s
```

**结论：**创建索引后，我们的执行效率提升了138倍。

**第四部：**删除索引

```sql
drop index idx_user_name on ydl_user; 
```

其他创建索引的方法，如下：

（1）创建email列的索引，索引可以截取length长度，只使用这一列的前几个字符

```sql
create index idx_email on user(email(5));     --执行时间16.174s
```

**重点：**

有的列【数据量比较大】，使用前几个字符就能【很快标识】出来一行数据，那我们就可以使用这种方式建立索引，比如我们的邮箱，邮箱很多后缀是相同的我们完全可以忽略。

（2）使用修改表的方式添加索引

```sql
alter table user add index idx_email (email);
```

（3）建表时时，同时创建索引

```sql
create table tbl_name(
    tid int,
    tname varchar(20),
    gender varchar(1),
    index [indexName] (fieldName(length))
)
```

#### 3、唯一索引（UNIQUE ）

对列的要求：索引列的值不能重复

创建表的同时，创建索引：

```sql
create table tbl_name(
    tid int,
    tname varchar(20),
    gender varchar(1),
    unique index unique_index_tname (tname)
)
```

独立的sql语句创建索引，我们的邮箱，用户名就应该创建唯一索引，姓名就应该是普通索引：

```sql
create unique index idx_email on user(email);
```

通过alter语句添加索引：

```sql
ALTER table mytable ADD UNIQUE [ux_indexName] (username(length))
```

唯一约束和唯一索引的区别：

- 唯一约束是通过唯一索引来实现数据唯一。

#### 4、多个二级索引的组合使用

**记住一点**：mysql在执行查询语句的时候一般只会使用【一个索引】，除非是使【用or连接的两个索引列】会产生索引合并。

我们针对某电商平台的检索功能做了优化，添加了三个索引，三个字段分别为【品牌】、【价格】、【销量】这三个的索引结构如下:

**（1）品牌的索引结构：**

![image-20220517162932935](..\img\image-20220517162932935-819a308c.png)

**（2）价格的索引结构：**

![image-20220516145308003](..\img\image-20220516145308003-e5328734.png)

**（3）销量的索引结构：**

![image-20220516145354413](..\img\image-20220516145354413-ca508ef0.png)

针对以上的索引我们进行如下的查询，分析检索过程：

1. 我们要检索品牌为阿玛尼（Armani）的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id，回表查询，得到结果。

   **结论：**会使用一个索引。

2. 我们要检索名称为阿玛尼（Armani），价格在1万到3万之间的包包

   查询的步骤如下：

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id。

   **第二步：**直接回表扫描，根据剩余条件检索结果。

   **结论：**只会使用第一个索引。

3. 我们要检索名称为阿玛尼（Armani），价格为26800，且销量在50以上的包包

   查询的步骤如下：

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id，进行缓存。

   **第二步：**直接回表扫描，根据剩余条件检索结果。

   **结论：**只会使用第一个索引。

4. 我们要检索名称为阿玛尼（Armani）或名称为LV的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id，得到结果。

   **结论：**我们经常听说，有or索引会失效，但是像这样的【type =‘Armani’ or type = ‘LV’】并不会，他相当于一个in关键字，会使用一个索引。

5. 我们要检索名称为阿玛尼（Armani）或价格大于8000的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id，进行缓存。

   **第二步：**通过【价格索引】检索出价格在5万到7万之间的商品id，这是一个连接条件带有【or的查询】，所以需要和上一步的结果进行【并集】，得到结果。

   **结论：**这个过程叫【索引合并】当检索条件有or但是所有的条件都有索引时，索引不失效，可以走【两个索引】。

6. 我们要检索名称为阿玛尼（Armani），且价格大于8000，且【产地（该列无索引）】在北京的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id。

   **第二步：**直接回表扫描，根据剩余条件检索结果。

   **结论：**只会使用第一个索引。

7. 我们要检索名称为阿玛尼（Armani）或价格大于8000，或【产地（该列无索引）】在北京的包包

   **第一步：**优化器发现【产地列】无索引，同时连接的逻辑是【or】没有办法利用【索引】优化，只能全表扫描，索引失效。

   **结论：**发生全表扫描，索引失效，条件中有没建立索引的列，同时关联条件是or。

#### 5、复合索引（联合索引）重要

当【查询语句】中包含【多个查询条件，且查询的顺序基本保持一致】时，我们推荐使用复合索引，索引的【组合使用】效率是低于【复合索引】的。

比如：我们经常按照A列、B列、C列进行查询时，通常的做法是建立一个由三个列共同组成的【复合索引】而不是对每一个列建立【普通索引】。

创建联合索引的方式如下：

```sql
alert table test add idx_a1_a2_a3 table (a1,a2,a3) 
-- 28.531s
create index idx_user_nick_name on ydl_user(user_name,nick_name,email(7));
```

复合索引的结构如下，复合索引会优先按照第一列排序，第一列相同的情况下会按照第二列排序，以此类推，如下图：

![image-20220516130601156](..\img\image-20220516130601156-241ed88b.png)

我们不妨把上边的图，转化为下边的表格，看起来会好一些：

| 品牌   | 价格  | 销量 | id        |
| ------ | ----- | ---- | --------- |
| Armani | 16800 | 35   | 13,24,76  |
| Armani | 26800 | 35   | 12,14,16  |
| Armani | 26800 | 100  | 34,56,17  |
| Armani | 68888 | 15   | 1,4,5,6,7 |
| GUCCI  | 8999  | 135  | 78,92     |
| LV     | 9999  | 326  | 55,63     |
| LV     | 12888 | 99   | 57,99     |
| LV     | 42888 | 69   | 11,22     |
| PRADA  | 9588  | 125  | 111,202   |

认真阅读了上边的介绍和图形，我们再次思考以下几个问题：

1. 我们要检索名称为阿玛尼（Armani）的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的商品id，回表查询，得到结果。

   **结论：**会使用第一部分索引。

2. 我们要检索名称为阿玛尼（Armani），价格在1万到3万之间的包包

   查询的步骤如下：

   **第一步：**通过【品牌索引】检索出所有阿玛尼的叶子节点。

   **第二步：**在【满足上一步条件的叶子节点中】查询价格在1万到3万之间的包包的列，查询出对应的id，回表查询列数据。

   **结论：**会使用复合索引的两个部分。

3. 我们要检索名称为阿玛尼（Armani）或价格大于8000的包包

   **第一步：**优化器发现我们并没有一个【价格列】的单独的二级索引，此时要查询价格大于8000的包，必须进行全表扫描。

   **结论：**但凡查询的条件中没有【复合索引的第一部分】，索引直接【失效】，全表扫描。

4. 我们要检索名称为阿玛尼（Armani），且价格大于8000，且【产地（该列无索引）】在北京的包包

   **第一步：**通过【品牌索引】检索出所有阿玛尼的叶子节点。

   **第二步：**在【满足上一步条件的叶子节点中】查询价格大于8000元的包包的叶子节点。

   **第三步：**因为【产地列】无索引，但是是【and】的关系，我们只需要将上一步得到的结果回表查询，在这个很小的范围内，检索产地是不是北京即可。

   **结论：**可以使用复合索引的两个部分。

5. 我们要检索名称为阿玛尼（Armani）和LV之间，价格为在1万到3万的包包

   查询的步骤如下：

   **第一步：**通过【品牌索引】检索出所有阿玛尼和LV的所有叶子节点。

   **第二步：**我们本想在第一步的结果中，快速定位价格的范围，但是发现一个问题，由于第一步不是等值查询，会导致后边的结果不连续，必须对【上一步的结果】全部遍历，才能拿到对应的结果。

   **结论：**只会使用复合索引的第一个部分，这个就引出了【复合索引中特别重要的一个概念】-【最左前缀原则】。

**重点：**最左前缀原则：

（1）最左前缀匹配原则，非常重要的原则，mysql会一直向右匹配直到遇到范围查询`（>、<、between、like）`就停止匹配，比如`a = 1 and b = 2 and c > 3 and d = 4` ，如果建立（a,b,c,d）顺序的联合索引，d是用不到索引的，如果建立(a,b,d,c)的索引则都可以用到，a,b,d的顺序可以任意调整。

（2）=和in可以乱序，比如`a = 1 and b < 2 and c = 3` ，咱们建立的索引就可以是（a,c,b）或者（c,a,b）。

#### 6、全文索引（FULLTEXT）

做全文检索（不如百度的搜索功能）使用的索引，但是这种场景，我们有更好的替代品，如：ElacticSearch，所以实际使用不多，只当了解。

使用 like + % 实现的模糊匹配有点类似全文索引。但是对于大量的文本数据检索，全文索引比 like + % 快 N 倍，速度不是一个数量级，但是全文索引可能存在【精度问题】。同时普通索引在使用like时如果%放在首位，索引会失效。

> 全文索引的版本支持

1. MySQL 5.6 以前的版本，只有 MyIsam 存储引擎支持全文索引。
2. MySQL 5.6 及以后的版本，MyIsam 和 InnoDB 存储引擎均支持全文索引。
3. 只有字段的数据类型为 char、varchar、text 及其系列才可以建全文索引。

> 使用全文索引的注意

1. 使用全文索引前，搞清楚版本支持情况。
2. 全文索引比 like + % 快 N 倍，但是可能存在精度问题。
3. 如果需要全文索引的是大量数据，建议先添加数据，再创建索引。
4. 对于中文，可以使用 MySQL 5.7.6 之后的版本，或者第三方插件。

（1）创建表时创建全文索引

```sql
create table ydlclass_user (    
    ..   
    FULLTEXT KEY fulltext_text(text)  
) 
```

（2）在已存在的表上创建全文索引

```sql
create fulltext index fulltext_text  on ydlclass_user(text);
```

本次创建用时143s：

（3）通过 SQL 语句 ALTER TABLE 创建全文索引

```sql
alter table ydlclass_user add fulltext index fulltext_text(text);
```

（4）直接使用 DROP INDEX 删除全文索引

```sql
drop index fulltext index on ydlclass_user;
```

（5）全文检索的语法

```sql
select * from ydlclass_user where match(text) against('高号便法还历只办二主厂向际');
```

#### 8、hash索引

hash索引是Memory存储引擎的默认方式，而且只有memory引擎支持hash索引，memory的数据是放在内存中的，一旦服务关闭，表中的数据就会丢失，我们可以使用如下的sql创建一张表:

```sql
CREATE TABLE `hash_user`  (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `user_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户账号',
  ......
) ENGINE = Memory CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;
```

合理的使用memory引擎可以极大的提升性能，针对memory引擎的特点重启丢失），我们最好在其中存储一些公共的、常用的、不经常发生改变的数据，比如一些字典数据、配置数据等。同时，这些数据最好持久化在一些其他的地方，比如配置文件、其他的表，在程序启动的时候，主动的进行加载，我们可以使用如下sql，将一张表的数据加载到内存中：

```sql
insert into hash_user select * from ydl_user where user_id < 2000000;
```

我们在执行的过程种，可能有如下错误：

![image-20220517192903131](..\img\image-20220517192903131.png)

他告诉我，这个表使用的内存满了，放不下了，我们只需要调节下边两个参数，修改配置文件重启即可：

```text
tmp_table_size = 4096M
max_heap_table_size = 4096M
```

基础工作完成，写几个sql语句尝试一下，我们发现真的一个字：快。

我们执行一下的sql

```sql
select * from hash_user where email = 'i.jnoyelrsg@rpnglcvh.museum'  -- 0.189s
```

创建一个hash索引

```sql
create index hash_idx_user_name using hash on hash_user(email);
```

再次查询

```sql
select * from hash_user where email = 'i.jnoyelrsg@rpnglcvh.museum'  -- 0.017s
```

也有不错的效果。

关于hash索引需要了解的几点：

- hash是一种key-value形式的数据结构。实现一般是数组+链表的结构，通过hash函数计算出key在数组中的位置，然后如果出现hash冲突就通过链表来解决。当然还有其他的解决hash冲突的方法。hash这种数据结构是很常用的，比如我们系统使用HashMap来构建热点数据缓存，存取效率很好。
- 即使是相近的key，hash的取值也完全没有规律，索引hash索引不支持范围查询。
- hash索引存储的是hash值和行指针，所以通过hash索引查询数据需要进行两次查询（首先查询行的位置，然后找到具体的数据）。
- hash索引查询数据的前提就是计算hash值，也就是要求key为一个能准确指向一条数据的key，所以对于like等一类的匹配查询是不支持的。
- 只要是只需要做等值比较查询，而不包含排序或范围查询的需求，都适合使用哈希索引。

#### 7、空间索引（SPATIAL）

MySQL在5.7之后的版本支持了空间索引，而且支持OpenGIS几何数据模型。这是在地理位置领域使用的一种索引，其他场景用的很少，所以不需要深入学习。

### 三、explain的用法

explain关键字可以模拟MySQL优化器执行SQL语句，可以很好的分析SQL语句或表结构的性能瓶颈。

explain的使用很简单，只需要在目标sql前加上这个关键字就可以了

**执行explain会产生以下11列内容，如下：**

| 列号 | 列            | 说明                                                         |
| ---- | ------------- | ------------------------------------------------------------ |
| 1    | id            | select查询的序列号，包含一组数字，表示查询中执行select子句或操作表的顺序 |
| 2    | select_type   | 查询类型                                                     |
| 3    | table         | 正在访问哪个表                                               |
| 4    | partitions    | 匹配的分区                                                   |
| 5    | type          | /访问的类型                                                  |
| 6    | possible_keys | 显示可能应用在这张表中的索引，一个或多个，但不一定实际使用到 |
| 7    | key           | 实际使用到的索引，如果为NULL，则没有使用索引                 |
| 8    | key_len       | 表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度 |
| 9    | ref           | 显示索引的哪一列被使用了，如果可能的话，是一个常数，哪些列或常量被用于查找索引列上的值 |
| 10   | rows          | 根据表统计信息及索引选用情况，大致估算出找到所需的记录所需读取的行数 filtered //查询的表行占表的百分比 |
| 11   | filtered      | 查询的表行占表的百分比                                       |
| 12   | Extra         | 包含不适合在其它列中显示但十分重要的额外信息                 |

#### 1、id字段

select查询的序列号，包含一组数字，表示查询中执行select子句或操作表的顺序

（1） id相同

id如果相同，可以认为是一组，执行顺序从上至下，如下查询语句：

```sql
explain select * from student s, scores sc where s.id = sc.s_id
```

![image-20220516175632471](..\img\image-20220516175632471-aec555f3.png)

（2） id不同

如果是子查询，id的序号会递增，id的值越大优先级越高，越先被执行例子

```sql
explain select * from student where age > (
	select age from student where name = '连宇栋'
);
```

![image-20220516180258900](..\img\image-20220516180258900-0f568bab.png)

（3）id部分相同部分不同

id如果相同，可以认为是一组，从上往下顺序执行在所有组中，id值越大，优先级越高，越先执行例子：

```sql
explain 
select * from student s, scores sc where s.id = sc.s_id
union
select * from student s, scores sc where s.id = sc.s_id;
```

![image-20220516180459139](..\img\image-20220516180459139-b4df1b84.png)

#### 2、select_type字段

**（1）SIMPLE**

简单查询，不包含子查询或Union查询的sql语句。

**（2）PRIMARY**

查询中若包含任何复杂的子部分，最外层查询则被标记为主查询。

**（3） SUBQUERY**

在select或where中包含子查询。

**（4）UNION**

若第二个select出现在uion之后，则被标记为UNION。

**（6）UNION RESULT**

从UNION表获取结果的合并操作。

#### 3、type字段

最好到最差备注：掌握以下10种常见的即可NULL>system>const>eq_ref>ref>ref_or_null>index_merge>range>index>ALL

**（1） NULL**

MySQL能够在优化阶段分解查询语句，在执行阶段用不着再访问表或索引，比如通过id没有找到例子：

```sql
explain select min(id) from student;
```

![image-20220516180830093](..\img\image-20220516180830093-f1e439bd.png)

**（2）system**

表只有一行记录（等于系统表），这是const类型的特列，平时不大会出现，可以忽略，我也没有实测出来。

```text
explain select * from mysql.proxies_priv
```

我实测一个只有一行记录的系统表，同样是all。

![image-20220518115948496](..\img\image-20220518115948496-44153fd6.png)

**（3） const**

表示通过索引一次就找到了，const用于比较primary key或uique索引，因为只匹配一行数据，所以很快，如主键置于where列表中，MySQL就能将该查询转换为一个常量例子：

```sql
explain select * from student where id = 1;
```

![image-20220516181115548](..\img\image-20220516181115548-7e73b3f8.png)

**4. eq_ref**

唯一性索引扫描，对于每个索引键，表中只有一条记录与之匹配，常见于主键或唯一索引扫描例子：

被驱动表使用主键索面，结果唯一

```sql
explain select * from scores sc left join student s on s.id = sc.s_id
```

![image-20220516183031354](..\img\image-20220516183031354-2de188ef.png)

**5. ref**

非唯一性索引扫描，返回匹配某个单独值的所有行，本质上也是一种索引访问，返回所有匹配某个单独值的行，然而可能会找到多个符合条件的行，应该属于查找和扫描的混合体例子：

```sql
explain select * from student where name = '白杰'
explain select * from student s left join scores sc on s.id = sc.s_id
```

![image-20220516183118398](..\img\image-20220516183118398-d08c2df6.png)

**6. ref_or_null**

类似ref，但是可以搜索值为NULL的行例子：

```sql
explain select * from student s where name = '白杰' or name is null
```

![image-20220516183229589](..\img\image-20220516183229589-daa35de1.png)

**7. index_merge**

表示使用了索引合并的优化方法例子：

```text
explain select * from student where id = 1 or name ='李兴';
```

![image-20220516181626267](..\img\image-20220516181626267-12ca24b4.png)

**8. range**

只检索给定范围的行，使用一个索引来选择行，key列显示使用了哪个索引一般就是在你的where语句中出现`between、<>、in`等的查询。例子：

```text
explain select * from student where id between 4 and 7;
```

![image-20220516181716830](..\img\image-20220516181716830-9c6ab949.png)

**9. index**（全索引扫描）

Full index Scan，Index与All区别：index只遍历索引树，通常比All快因为索引文件通常比数据文件小，也就是虽然all和index都是读全表，但index是从索引中读取的，而all是从硬盘读的。例子：

```text
explain select name from student;
```

![image-20220516181813844](..\img\image-20220516181813844-c49ee252.png)

**10. ALL**（全表扫）

Full Table Scan，将遍历全表以找到匹配行例子：

```text
explain select * from student;
```

![image-20220516181840924](..\img\image-20220516181840924-dcb02ba6.png)

#### 4、table字段

表示数据来自哪张表

#### 5、possible_keys字段

显示可能应用在这张表中的索引，一个或多个查询涉及到的字段若存在索引，则该索引将被列出，但不一定被实际使用

#### 6、key字段

实际使用到的索引，如果为NULL，则没有使用索引查询中若使用了覆盖索引（查询的列刚好是索引），则该索引仅出现在key列表

#### 7、key_len字段

表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度在不损失精确度的情况下，长度越短越好key_len显示的值为索引字段最大的可能长度，并非实际使用长度即key_len是根据定义计算而得，不是通过表内检索出的

#### 8、ref字段

哪些列或常量被用于查找索引列上的值

#### 9、rows字段

根据表统计信息及索引选用情况，大致估算出找到所需的记录所需读取的行数

#### 10、partitions字段

匹配的分区

#### 11、filtered字段

它指返回结果的行占需要读到的行(rows列的值)的百分比

#### 12、Extra字段

该列包含不适合在其它列中显示，但十分重要的额外信息，我们列举几个例子：

**（1）Using filesort**

只要使用非索引字段排序，就会出现这样的内容。

**（2）Using temporary**

使用了临时表保存中间结果，MySQL在对结果排序时使用临时表，常见于排序order by 和分组查询group by例子：

**（3）Using where**

使用了where条件例子：

**（4）impossible where**

where子句的值总是false，不能用来获取任何数据：

```sql
explain select * from student where name = '白洁' and name = '李兴';
```

![image-20220516182510228](..\img\image-20220516182510228-1803ac6c.png)

**（5）Select tables optimized away**

SELECT操作已经优化到不能再优化了（MySQL根本没有遍历表或索引就返回数据了）例子：

```sql
explain select min(id) from student;
```

![image-20220516182125161](..\img\image-20220516182125161-920194f5.png)

**（6）no matching row in const table**

```sql
explain select * from student where id < 100 and id > 200;
```

![image-20220516182318832](..\img\image-20220516182318832-7e012d1a.png)

### 三、使用索引的问题

设计好MySql的索引可以让你的数据库飞起来。但是，不合理的创建索引同样会产生很多问题？我们在设计MySql索引的时候有一下几点注意：

#### 1、哪些情况下适合建索引

- 频繁作为where条件语句查询的字段
- 关联字段需要建立索引
- 分组，排序字段可以建立索引
- 统计字段可以建立索引，例如count()，max()等

**小案例**：还记得在学习临时表时，分析过group by的执行流程吗（分组字段没有索引）？有了索引之后的分组执行流程如下：

![image-20220512173224645](..\img\image-20220512173224645-3b81778d.png)

直接使用索引信息，统计每个组的人数，直接返回。

#### 2、哪些情况下不适合建索引

- 频繁更新的字段不适合建立索引
- where条件中用不到的字段不适合建立索引
- 表数据可以确定比较少的不需要建索引
- 数据重复且发布比较均匀的的字段不适合建索引（唯一性太差的字段不适合建立索引），例如性别，真假值
- 参与列计算的列不适合建索引，索引会失效

#### 3、能用复合索引的要使用复合索引

#### 4、null值也是可以走索引的，他被处理成最小值放在b+树的最左侧

#### 5、使用短索引

对字符串的列创建索引，如果可能，应该指定一个前缀长度。例如，如果有一个CHAR(255)的 列，如果在前10 个或20 个字符内，多数值是惟一的，那么就不要对整个列进行索引。短索引不仅可以提高查询速度而且可以节省磁盘空间和I/O操作。

#### 6，排序的索引问题

mysql查询只使用一个索引，因此如果where子句中已经使用了索引的话，那么order by中的列是不会使用索引的。因此数据库默认排序可以符合要求的情况下不要使用排序操作；尽量不要包含多个列的排序，如果需要，最好给这些列创建`复合索引`。

#### 7、MySQL索引失效的几种情况

- 如果条件中有or，即使其中有条件带索引也不会使用走索引，除非全部条件都有索引
- 复合索引不满足最左原则就不能使用全部索引
- like查询以%开头
- 存在列计算

```text
explain select * from student where age = (18-1)
```

- 如果mysql估计使用全表扫描要比使用索引快，则不使用索引，比如结果的量很大
- 存在类型转化

```sql
-- 索引不失效
explain select * from student where age = '18'  
explain select * from ydl_user where login_date = '2008-05-31 17:20:54'
-- 索引失效 本来是字符串，你使用数字和他比较
explain select * from student where gander = 1
```

![image-20220518183149811](..\img\image-20220518183149811-7d62b011.png)

![image-20220518183122831](..\img\image-20220518183122831-b15ccfd6.png)

## 第七章 锁机制

锁是为了保证数据库中数据的一致性，使各种【共享资源】在被访问时变得【有序】而设计的一种规则。

MysQL中不同的存储引擎支持不同的锁机制。 InoDB支持【行锁】，有时也会升级为表锁，MyIsam只支持表锁。

- 【表锁】的特点就是开销小、加锁快，不会出现死锁。锁粒度大，发生锁冲突的概率小，并发度相对低。

- 【行锁】的特点就是开销大、加锁慢，会出现死锁。锁粒度小，发生锁冲突的概率高，并发度高。

  今天我们讲锁主要从InnoDB引擎来讲，因为它既支持行锁、也支持表锁。

### 一、InnoDB的锁类型

InnoDB的锁类型主要有读锁(共享锁)、写锁(排他锁)、意向锁和MDL锁。

#### 1、s锁

读锁（共享锁，shared lock）简称S锁。一个事务获取了一个数据行的读锁，其他事务也能获得该行对应的读锁，但不能获得写锁，即一个事务在读取一个数据行时，其他事务也可以读，但不能对该数行增删改的操作。

**注：**读锁是共享锁，多个事务可以同时持有，当有一个或多个事务持有共享锁时，被锁的数据就不能修改。

简而言之：就是可以多个事务读，但只能一个事务写。

读锁是通过【select.... lock in share mode】语句给被读取的行记录或行记录的范围上加一个读锁,让其他事务可以读，但是要想申请加写锁，那就会被阻塞。

事务一：

```sql
begin;
select * from ydl_student where id = 1 lock in share mode;
```

事务二：

```sql
begin;
update ydl_student set score = '90' where id = 1;
```

卡住了，说明程序被阻塞，确实加了锁。

![image-20220517195919549](..\img\image-20220517195919549-32b88fda.png)

s锁是可以被多个事务同时获取的，我们在两个不同的事务中分别对同一行数据加上s锁，结果都可以成功，如下图：

![image-20220517202512738](..\img\image-20220517202512738-401cab24.png)

#### 2、x锁

写锁，也叫排他锁，或者叫独占所，简称x锁（exclusive）。一个事务获取了一个数据行的写锁，既可以读该行的记录，也可以修改该行的记录。但其他事务就不能再获取该行的其他任何的锁，包括s锁，直到当前事务将锁释放。【这保证了其他事务在当前事务释放锁之前不能再修改数据】。

**注：**写锁是独占锁，只有一个事务可以持有，当这个事务持有写锁时，被锁的数据就不能被其他事务修改。

（1）一些DML语句的操作都会对行记录加写锁。

事务一：

```sql
begin;
update ydl_student set score = '90' where id = 1;
```

事务二：

```sql
begin;
update ydl_student set score = '88' where id = 1;
```

卡住了，说明程序被阻塞，确实加了锁。但是，我们发现其他事务还能读，有点不符合逻辑，这是应为mysql实现了MVCC模型，后边会详细介绍。

（2）比较特殊的就是select for update，它会对读取的行记录上加一个写锁，那么其他任何事务不能对被锁定的行上加任何锁了，要不然会被阻塞。

事务一：

```sql
begin;
select * from ydl_student where id = 1 for update;
```

事务二：

```sql
begin;
update teacher set name = 'lucy2' where id = 1;
```

卡住了，说明加了锁了。

（3）x锁是只能被一个事务获取，我们在两个不同的事务中分别对同一行数据加上x锁，发现后者会被阻塞，如下图：

![image-20220517202800421](..\img\image-20220517202800421-b9a51153.png)

#### 3、记录锁（Record Lock）

记录锁就是我们常说的行锁，只有innodb才支持，我们使用以下四个案例来验证记录锁的存在：

（1）两个事务修改【同一行】记录，该场景下，where条件中的列不加索引。

事务一：

```sql
begin;
update ydl_student set score = '77' where name = 'jack';
```

事务二：

```sql
begin;
update ydl_student set score = '80' where name = 'jack';
```

发现事务二卡住了，只有事务一提交了，事务二才能继续执行，很明显，这一行数据被【锁】住了。

（2）两个事务修改同表【不同行】记录，此时where条件也不加索引。

事务一：

```sql
begin;
update ydl_student set score = '76' where name = 'hellen';
```

事务二：

```sql
begin;
update ydl_student set score = '66' where name = 'jack';
```

现事务二卡住了，只有事务一提交了，事务二才能继续执行，很明显，表被【锁】住了。

（3）两个事务修改【同一行】记录，where条件加索引

事务一：

```sql
begin;
update ydl_student set score = '99' where name = 'jack';
```

事务二：

```sql
begin;
update ydl_student set score = '79' where name = 'jack';
```

现事务二卡住了，只有事务一提交了，事务二才能继续执行，很明显，这一行数据被【锁】住了。

（4）两个事务修改同表【不同行】记录，此时where条件加索引。

事务一：

```sql
begin;
update ydl_student set score = '77' where name = 'hellen';
```

事务二：

```sql
begin;
update ydl_student set score = '77' where name = 'jack';
```

发现都可以顺利修改，说明锁的的确是行。

**证明：**行锁是加在索引上的，这是标准的行级锁。

#### 4、间隙锁（GAP Lock）

间隙锁帮我们解决了mysql在rr级别下的一部分幻读问题。间隙锁锁定的是记录范围，不包含记录本身，也就是不允许在某个范围内插入数据。

间隙锁生成的条件：

1、A事务使用where进行范围检索时未提交事务，此时B事务向A满足检索条件的范围内插入数据。

2、where条件必须有索引。

第一步把teacher表的id的4改成8

事务一：

```sql
begin;
select * from ydl_student where id between 3 and 7 lock in share mode;
```

事务二：

```sql
begin;
insert into ydl_student values (5,'tom',66,'d');
```

发现卡住了，第一个事务会将id在3到7之间的数据全部锁定，不允许在缝隙间插入。

事务三：

```sql
begin;
insert into ydl_student values (11,'tom',66,'d');
```

插入一个id为11的数据，竟然成功了，因为11不在事务一的检索的范围。

#### 5、记录锁和间隙锁的组合（next-key lock）

**临键锁**，是**记录锁与间隙锁的组合**，它的封锁范围，既包含【索引记录】，又包含【索引区间】。

**注：\**临键锁的主要目的，也是为了避免\**幻读**(Phantom Read)。如果把事务的隔离级别降级为RC，临键锁则也会失效。

#### 6、MDL锁

MySQL 5.5引入了meta data lock，简称MDL锁，用于保证表中`元数据`的信息。在会话A中，表开启了查询事务后，会自动获得一个MDL锁，会话B就不可以执行任何DDL语句，不能执行为表中添加字段的操作，会用MDL锁来保证数据之间的一致性。

元数据就是描述数据的数据，也就是你的表结构。意思是在你开启了事务之后获得了意向锁，其他事务就不能更改你的表结构。MDL锁都是为了防止在事务进行中，执行DDL语句导致数据不一致。

#### 7、死锁问题

有多个事务持有对方需要的锁，同时需要对方持有的锁，这个时候会形成一个循环的等待，这个等待没有办法被正常结束，就会产生死锁

![image-20220517205641323](..\img\image-20220517205641323-59d24a58.png)

InnoDB使用的是行级锁，在某种情况下会产生死锁问题，所以InnoDB存储引擎采用了一种叫作**等待图**（wait-for graph）的方法来自动检测死锁，如果发现死锁，就会自动回滚一个事务。

![image-20220517205123881](..\img\image-20220517205123881-a8b4a1ca.png)

**在MySQL中，通常通过以下几种方式来避免死锁。**

- 尽量让数据表中的数据检索都通过索引来完成，避免无效索引导致行锁升级为表锁。
- 合理设计索引，尽量缩小锁的范围。
- 尽量减少查询条件的范围，尽量避免间隙锁或缩小间隙锁的范围。
- 尽量控制事务的大小，减少一次事务锁定的资源数量，缩短锁定资源的时间。如果一条SQL语句涉及事务加锁操作，则尽量将其放在整个事务的最后执行。
- 尽量按约定的顺序执行

### 二、表锁

1、对于InnoDB表，在绝大部分情况下都应该使用【行级锁】，因为事务和行锁往往是我们之所以选择InnoDB表的理由。但在个另特殊事务中，也可以考虑使用表级锁。

- 第一种情况是：事务需要更新【大部分或全部数据】，表又比较大，如果使用默认的行锁，不仅这个事务执行效率低，而且可能造成其他事务长时间锁等待和锁冲突，这种情况下可以考虑使用表锁来提高该事务的执行速度。
- 第二种情况是：事务涉及多个表，比较复杂，很可能引起死锁，造成大量事务回滚。这种情况也可以考虑一次性锁定事务涉及的表，从而避免死锁、减少数据库因事务回滚带来的开销。

2、在InnoDB下 ，主动上表锁的方式如下：

```sql
lock tables teacher write,student read;
select * from teacher;
commit;
unlock tables;
```

使用时有几点需要额外注意：

- 使用【LOCK TALBES】虽然可以给InnoDB加表级锁，但必须说明的是，表锁不是由InnoDB存储引擎层管理的，而是由其上一层ＭySQL Server负责的，仅当autocommit=0、innodb_table_lock=1（默认设置）时，InnoDB层才能感知MySQL加的表锁，ＭySQL Server才能感知InnoDB加的行锁，这种情况下，InnoDB才能自动识别涉及表级锁的死锁；否则，InnoDB将无法自动检测并处理这种死锁。
- 在用LOCAK TABLES对InnoDB加锁时要注意，事务结束前，不要用UNLOCAK TABLES释放表锁，因为UNLOCK TABLES会隐含地提交事务；COMMIT或ROLLBACK不能释放用LOCAK TABLES加的表级锁，必须用UNLOCK TABLES释放表锁，正确的方式见如下语句。
- 表锁的力度很大，慎用。

### 三、从另一个角度区分锁的分类

#### 1、乐观锁

乐观锁大多是基于数据【版本记录机制】实现，一般是给数据库表增加一个"version"字段。

读取数据时，将此版本号一同读出，

更新时，对此版本号加一。此时将提交数据的版本数据与数据库表对应记录的当前版本信息进行比对，如果提交的数据版本号大于数据库表当前版本号，则予以更新，否则认为是过期数据。

事务一：

```sql
select * from ydl_student where id = 1;
```

事务二：

```sql
select * from ydl_student where id = 1;
update ydl_student set score = 99,version = version + 1 where id = 1 and version = 1;
commit;
```

事务一：

```sql
update ydl_student set score = 100,version = version + 1 where id = 1 and version = 1;
commit;
```

发现更新失败，因为版本号被事务二、提前修改了，这使用了不加锁的方式，实现了一个事务修改期间，禁止其他事务修改的能力。

#### 2、悲观锁

悲观锁依靠数据库提供的锁机制实现。MySQL中的共享锁和排它锁都是悲观锁。数据库的增删改操作默认都会加排他锁，而查询不会加任何锁。此处不赘述。

## 第八章 日志系统

mysql给我们提供了很多有用的日志，这是mysql服务层给我们提供的：

| 日志类型     | 写入日志的信息                                               |
| ------------ | ------------------------------------------------------------ |
| 二进制日志   | 记录了对MySQL数据库执行更改的所有操作                        |
| 慢查询日志   | 记录所有执行时间超过 long_query_time 秒的所有查询或不使用索引的查询 |
| 错误日志     | 记录在启动，运行或停止mysqld时遇到的问题                     |
| 通用查询日志 | 记录建立的客户端连接和执行的语句                             |
| 中继日志     | 从复制主服务器接收的数据更改                                 |

### 一、bin log日志

#### 1、概述

二进制日志（binnary log）以【事件形式】记录了对MySQL数据库执行更改的所有操作。

binlog记录了所有数据库【表结构】变更（例如CREATE、ALTER TABLE…）以及【表数据】修改（INSERT、UPDATE、DELETE…）的二进制日志。不会记录SELECT和SHOW这类操作，因为这类操作对数据本身并没有修改，但可以通过查询通用日志来查看MySQL执行过的所有语句。

binlog是mysql server层维护的，跟采用何种引擎没有关系，记录的是所有的更新操作的日志记录。binlog是在事务最终commit前写入的。我们执行SELECT等不涉及数据更新的语句是不会记binlog的，而涉及到数据更新则会记录。要注意的是，对支持事务的引擎如innodb而言，必须要提交了事务才会记录binlog。

binlog 文件写满后，会自动切换到下一个日志文件继续写，而不会覆盖以前的日志，这个也区别于 redo log，redo log 是循环写入的，即后面写入的可能会覆盖前面写入的。

binlog有两个常用的使用场景：

- 主从复制：我们会专门有一个章节代领大家搭建一个主从同步的两台mysql服务。
- 数据恢复：通过mysqlbinlog工具来恢复数据。

mysql8中的binLog默认是开启的，5.7默认是关闭的，可以通过参数`log_bin`控制：

#### 2、数据恢复

（1）确认binlog开启，log_bin变量的值为ON代表binlog是开启状态：

```bash
show variables like '%log_bin%';
```

（2）为了防止干扰，我们flush刷新log日志，自此刻会产生一个新编号的binlog日志文件：

```bash
flush logs;
```

（3）查看所有binlog日志列表：

```bash
show master logs;
```

![image-20220507135555872](..\img\image-20220507135555872-fabcd807.png)

（4）查看master状态，即最后(最新)一个binlog日志的编号名称，及其最后一个操作事件pos结束点(Position)值，这一步可有可无：

![image-20220507135613665](..\img\image-20220507135613665.png)

（5）执行sql

先创建表，并插入一些数据：

```sql
DROP TABLE IF EXISTS ydl_student;
CREATE TABLE `ydl_student` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `score` int(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (1, 'lucy', 80, 'a');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (2, 'lily', 90, 'a');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (3, 'jack', 60, 'c');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (4, 'hellen', 40, 'd');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (5, 'tom', 60, 'c');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (6, 'jerry', 10, 'd');
INSERT INTO `ydl_student`(`id`, `name`, `score`, `grade`) VALUES (7, 'sily', 20, 'd');
```

执行删除操作，假装误删除，直接全部删除也可以，把表删了都行，一样的道理：

```sql
delete from ydl_student where id in (3,5);
```

（6）查看binlog日志，我们因为刷新了日志，所以本次操作都会在最新的日志文件上：

因为 binlog 的日志文件是二进制文件，不能用文本编辑器直接打开，需要用特定的工具来打开，MySQL 提供了 mysqlbinlog 来帮助我们查看日志文件内容：

```bash
# 查看全部的日志信息
/www/server/mysql/bin/mysqlbinlog -v mysql-bin.000008
# 指定位置范围
/usr/bin/mysqlbinlog -v mysql-bin.000013 --start-position=0 --stop-position=986
# 指定时间范围
/usr/bin/mysqlbinlog -v mysql-bin.000013 --start-datetime="2022-06-01 11:18:00" --stop-datetime="2022-06-01 12:18:00" 
```

真实的情况下，我们的日志文件比较复杂，内容比较多使用时间范围查询后任然可能需要花费时间去排查问题，这里我们找到了误删除的位置：

![image-20220507143313649](..\img\image-20220507143313649-eea2e039.png)

（7）执行恢复，通过上一步的操作，我们找到了删除的位置3228（即第二个红框），执行下面的语句：

```bash
/www/server/mysql/bin/mysqlbinlog -v mysql-bin.000008 --stop-position=3228 -v | mysql -uroot -p
```

（8）至此，数据已完全恢复了：

![image-20220507143456337](..\img\image-20220507143456337-cf176c97.png)

binlog的数据恢复的本质，就是将之前执行过的sql，从开始到指定位置全部执行一遍，如果报错【当前表已经存在】，就将数据库的表删除，重新恢复。

#### 3、格式分类

binlog 有三种格式， 使用变量`binlog_format`查看当前使用的是哪一种：

- Statement（Statement-Based Replication,SBR）：每一条会修改数据的 SQL 都会记录在 binlog 中。
- Row（Row-Based Replication,RBR）：不记录 SQL 语句上下文信息，仅保存哪条记录被修改。
- Mixed（Mixed-Based Replication,MBR）：Statement 和 Row 的混合体，当前默认的选项，5.7中默认row。

我们举一个例子来说明row和statement的区别，在下面的插入语句中我们有一个函数uuid()，如果日志文件仅仅保存sql语句，下一次执行的结果可能不一致，所以Row格式的文件，他保存的是具体哪一行，修改成了什么数据，记录的是数据的变化，不是简单的sql：

```sql
insert into ydl_student values (8,UUID(),45,'d');
```

![image-20220507150522596](..\img\image-20220507150522596-8036d797.png)

> Statement和row的优劣

- Statement 模式只记录执行的 SQL，不需要记录每一行数据的变化，因此极大的减少了 binlog 的日志量，避免了大量的 IO 操作，提升了系统的性能。
- 由于 Statement 模式只记录 SQL，而如果一些 SQL 中 包含了函数，那么可能会出现执行结果不一致的情况。比如说 uuid() 函数，每次执行的时候都会生成一个随机字符串，在 master 中记录了 uuid，当同步到 slave 之后，再次执行，就得到另外一个结果了。所以使用 Statement 格式会出现一些数据一致性问题。
- 从 MySQL5.1.5 版本开始，binlog 引入了 Row 格式，Row 格式不记录 SQL 语句上下文相关信息，仅仅只需要记录某一条记录被修改成什么样子了。
- 不过 Row 格式也有一个很大的问题，那就是日志量太大了，特别是批量 update、整表 delete、alter 表等操作，由于要记录每一行数据的变化，此时会产生大量的日志，大量的日志也会带来 IO 性能问题。

#### 4、日志格式

- binlog文件以一个值为0Xfe62696e的魔数开头，这个魔数对应0xfebin。
- binlog由一系列的binlog event构成。每个binlog event包含header和data两部分。
  - header部分提供的是event的公共的类型信息，包括event的创建时间，服务器等等。
  - data部分提供的是针对该event的具体信息，如具体数据的修改。

> 常见的事件类型有：

- **FORMAT_DESCRIPTION_EVENT**：该部分位于整个文件的头部，每个binlog文件都必定会有唯一一个该event
- **WRITE_ROW_EVENT**：插入操作。
- **DELETE_ROW_EVENT**：删除操作。
- **UPDATE_ROW_EVENT**：更新操作。记载的是一条记录的完整的变化情况，即从**前量**变为**后量**的过程
- **ROTATE_EVENT**：Binlog结束时的事件，用于说明下一个binlog文件。

一个event的结构如下，我们在恢复数据的时候已经看到了：

![image-20220507142122405](..\img\image-20220507142122405-84f6da7b.png)

- 每个日志的最后都包含一个`rotate event`用于说明下一个binlog文件。
- binlog索引文件是一个文本文件，其中内容为当前的binlog文件列表，比如下面就是一个mysql-bin.index文件的内容。

![image-20220507153011412](..\img\image-20220507153011412-b6b2b640.png)

#### 5、binlog刷盘

 二进制日志文件并不是每次写的时候同步到磁盘。因此当数据库所在操作系统发生宕机时，可能会有最后一部分数据没有写入二进制日志文件中，这给恢复和复制带来了问题。  参数`sync_binlog=[N]`表示每写多少次就同步到磁盘。如果将N设为1，即sync_binlog=1表示采用同步写磁盘的方式来写二进制日志，这时写操作不使用操作系统的缓冲来写二进制日志。（备注：该值默认为0，采用操作系统机制进行缓冲数据同步）。

#### 6、binlog实现主从同步

数据库单点部署的问题：

- 服务器宕机，会导致业务停顿，影响客户体验。
- 服务器损坏，数据丢失，不能及时备份，造成巨大损失。
- 读写操作都在同一台服务器，在并发量大的情况下性能存在瓶颈。

那么我们就可以使用mysql的binlog搭建一个一主多从的mysql集群服务。这样的服务可以帮助我们异地备份数据、进行读写分离，提高系统的可用性。

##### **（1） 主从复制工作原理剖析**

- Master 数据库只要发生变化，立马记录到Binary log 日志文件中
- Slave数据库启动一个I/O thread连接Master数据库，请求Master变化的二进制日志
- Slave I/O获取到的二进制日志，保存到自己的Relay log 日志文件中。
- Slave 有一个 SQL thread定时检查Realy log是否变化，变化那么就更新数据

![image-20220424200331288](..\img\image-20220424200331288-9a3461d4.png)

##### **（2）怎么配置mysql主从复制**

------

> 环境准备

安装两个mysql，使用vmvare安装两个linux系统就可以：

```text
mysql1(master): 42.192.181.133:3306
mysql2(slave):  124.220.197.17:3306
```

> mysql 配置文件配

mysql1（master）: 配置文件设置，开启bin_log（已经开启的可以忽略）且需要配置一个server-id

```bash
#mysql master1 config 
[mysqld]
server-id = 1            # 节点ID，确保唯一

# log config
log-bin = master-bin     #开启mysql的binlog日志功能
```

mysql2（slave）: 需要开启中继日志

```bash
[mysqld]
server-id=2
relay-log=mysql-relay-bin
replicate-wild-ignore-table=mysql.%
replicate-wild-ignore-table=sys.%
replicate-wild-ignore-table=information_schema.%
replicate-wild-ignore-table=performance_schema.%
```

重启两个mysql，让配置生效。

**第三步 在master数据库创建复制用户并授权**

1.进入master的数据库，为master创建复制用户

```sql
CREATE USER 'repl'@'124.220.197.17' IDENTIFIED BY 'Root12345_';
```

2.赋予该用户复制的权利

```csharp
grant replication slave on *.* to 'repl'@'124.220.197.17' 
FLUSH PRIVILEGES;
```

3.查看master的状态

```ruby
show master status;
mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000005      120|              | mysql            |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

4,配置从库

```bash
CHANGE MASTER TO 
MASTER_HOST = '42.192.181.133',  
MASTER_USER = 'repl', 
MASTER_PASSWORD = 'Root12345_',
MASTER_PORT = 3306,
MASTER_LOG_FILE='mysql-bin.000020',
MASTER_LOG_POS=2735,
MASTER_HEARTBEAT_PERIOD = 10000; 

# MASTER_LOG_FILE与主库File 保持一致
# MASTER_LOG_POS=120 , #与主库Position 保持一致
```

解释：MASTER_HEARTBEAT_PERIOD表示心跳的周期。当MASTER_HEARTBEAT_PERIOD时间之内，master没有binlog event发送给slave的时候，就会发送心跳数据给slave。

5.启动从库slave进程

```css
mysql> start slave;
Query OK, 0 rows affected (0.04 sec)
```

6.查看是否配置成功

```text
show slave status \G;
```

- Slave_IO_Running：从库的IO线程，用来接收master发送的binlog，并将其写入到中继日志relag log
- Slave_SQL_Running：从库的SQL线程，用来从relay log中读取并执行binlog。
- Slave_IO_Running、Slave_SQL_Running：这两个进程的状态需全部为 YES，只要有一个为 NO，则复制就会停止。
- Master_Log_File：要同步的主库的binlog文件名。
- Read_Master_Log_Pos：已同步的位置，即同步的 binlog 文件内的字节偏移量，该值会随着主从同步的进行而不断地增长。
- Relay_Log_File：从库的中继日志文件，对接收到的主库的 binlog 进行缓冲。从库的SQL线程不断地从 relay log 中读取 binlog 并执行。
- Relay_Log_Pos：relay log 中已读取的位置偏移量。
- Seconds_Behind_Master: 主从同步延时, 值为 0 为正常情况，正值表示已经出现延迟，数字越大从库落后主库越多。

7.在主库创建一个数据库、创建一张表，执行一些sql语句进行测试。

##### （3）可能遇到的问题

在配置mysql主从复制的时候可能出现一下错误：

```text
Fatal error: The slave I/O thread stops because master and slave have equal MySQL server UUIDs; these UUIDs must be different for replication to work.
```

**原因**

如果你使用了两台虚拟机，一主一从，从库的mysql是直接克隆的。在mysql 5.6的复制引入了uuid的概念，各个复制结构中的server_uuid得保证不一样，但是查看到直接克隆data文件夹后server_uuid是相同的。

**解决**

找到data文件夹下的auto.cnf文件，修改里面的server_uuid值，保证各个db的server_uuid不一样，重启db即可。

```bash
 cd /www/server/data
```

修改server_uuid的值

![image-20220517180545563](..\img\image-20220517180545563-de94e863.png)

使用

```sql
select uuid();
```

生成一个uuid即可，重启数据库。

### 二、其他日志

#### 1、通用查询日志，默认关闭

MySQL通用查询日志，它是记录建立的客户端连接和执行的所有DDL和DML语句(不管是成功语句还是执行有错误的语句)，默认情况下，它是不开启的。请注意，它也是一个文本文件。

可以通过以下的sql查看查询日志的状态：

![image-20220507154040417](..\img\image-20220507154040417-4f619c0d.png)

使用以下命令开启通用查询日志，一般不开启，这是为了测试，当然也可以修改配置文件，重启服务：

```bash
# 在全局模式下，开启通用查询日志，1表示开启，0表示关闭
SET global general_log=1;
```

开启后，我们随便执行sql语句之后，你会发现data目录多了以下文件：

![image-20220507154728204](..\img\image-20220507154728204-b2cfd978.png)使用more命令查看该文件：

```text
more VM-12-17-centos.log 
```

![image-20220507154844881](..\img\image-20220507154844881-2734c9b5.png)

#### 2、慢查询日志

当前版本慢查询日志默认是开启的，有的版本是关闭的，使用如下命令查看慢查询日志的状态：

![image-20220507160012005](..\img\image-20220507160012005-cee5dfa1.png)

那么，何为慢？mysql通过一个变量‘long_query_time’来确定sql慢不慢，执行时间大于该值就会被记录在慢查询日志中，默认是3s：

```sql
show variables like 'long_query_time'
```

![image-20220507160149874](..\img\image-20220507160149874-196fb203.png)

以下是【慢查询日志】的记录文本：

![image-20220507154539012](..\img\image-20220507154539012-bfc82d0b.png)

#### 3、错误日志

错误日志（Error Log）主要记录 MySQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。一旦发生mysql服务无法启动、程序崩溃一定要记得去查询错误日志：

![image-20220507155123988](..\img\image-20220507155123988-72e86ff4.png)

### 三、redo log日志

接下来的两个日志，是innodb为解决不同问题而引出的两类日志文件。

redo log（重做日志）的设计主要是为了防止因系统崩溃而导致的数据丢失，其实解决因系统崩溃导致数据丢失的思路如下：

1、每次提交事务之前，必须将所有和当前事务相关的【buffer pool中的脏页】刷入磁盘，但是，这个效率比较低，可能会影响主线程的效率，产生用户等待，降低响应速度，因为刷盘是I/O操作，同时一个事务的读写操作也不是顺序读写。

2、把当前事务中修改的数据内容在日志中记录下来，日志记录是顺序写，性能很高。其实mysql就是这么做的，这个日志被称为redo log。执行事务中，每执行一条语句，就可能有若干redo日志，并按产生的顺序写入磁盘，redo日志占用的空间非常小，当redo log空间满了之后又会从头开始以循环的方式进行覆盖式的写入。

redo log的格式比较简单，包含一下几个部分：

- type：该日志的类型，在5.7版本中，大概有53种不同类型的redo log，占用一个字节
- space id：表空间id
- page number：页号
- data：日志数据

#### 1、MTR

在innodb执行任务时，有很多操作，必须具有原子性，我们把这一类操作称之为MIni Transaction，我们以下边的例子为例：

在我们向B+树中插入一条记录的时候，需要定位这条数据将要插入的【数据页】，因为插入的位置不同，可能会有以下情况：

1、待插入的页拥有【充足的剩余空间】，足以容纳这条数据，那就直接插入就好了，这种情况需要记录一条【MLOG_COMP_REC_INSERT类型】的redo日志就好了，这种情况成为乐观插入。

![image-20220510121537504](..\img\image-20220510121537504-a3ac363a.png)

2、待插入的页【剩余空间不足】以容纳该条记录，这样就比较麻烦了，必须进行【页分裂】了。必须新建一个页面，将原始页面的数据拷贝一部分到新页面，然后插入数据。这其中对应了好几个操作，必须记录多条rede log，包括申请新的数据页、修改段、区的信息、修改各种链表信息等操作，需要记录的redo log可能就有二三十条，但是本次操作必须是一个【原子性操作】，在记录的过程中，要全部记录，要么全部失败，这种情况就被称之为一个MIni Transaction（最小事务）。

![image-20220510121522561](..\img\image-20220510121522561-cee67760.png)

**（1）MTR的按组写入**

对于一个【MTR】操作必须是原子的，为了保证原子性，innodb使用了组的形式来记录redo 日志，在恢复时，要么这一组的的日志全部恢复，要么一条也不恢复。innodb使用一条类型为`MLO_MULTI_REC_END`类型的redo log作为组的结尾标志，在系统崩溃恢复时只有解析到该项日志，才认为解析到了一组完整的redo log，否则直接放弃前边解析的日志。

![image-20220510121447118](..\img\image-20220510121447118-6fc6234d.png)

**（2）单条redolog的标识方法**

有些操作只会产生一条redo log，innodb是通过【类型标识】的第一个字符来判断，这个日志是单一日志还是组日志，如下图：

![image-20220510121610230](..\img\image-20220510121610230-f3c4f4b4.png)

**（3）事务、sql、MTR、redolog的关系如下**

- 一个事务包含一条或多条sql
- 一条sql包含一个或多个MTR
- 一个MTR包含一个或多个redo log

#### 2、log buffer

任何可能产生大量I/O的操作，一般情况下都会设计【缓冲层】，mysql启动时也会向操作系统申请一片空间作为redo log的【缓冲区】，innodb使用一个变量`buf_free`来标记下一条redo log的插入位置（标记偏移量），log buffer会在合适的时机进行刷盘：

- log buffer空间不足。logbuffer的容量由`innodb_log_buffer_size`指定，当写入log buffer的日志大于容量的50%，就会进行刷盘。
- 提交事务时，如果需要实现崩溃恢复，保证数据的持久性，提交事务时必须提交redo log，当然你也可以为了效率不去提交，可以通过修改配置文件设置该项目。
- 后台有独立线程大约每隔一秒会刷新盘一次。
- 正常关闭服务器。
- 做checkpoint时，后边会讲。

有缓冲就可能存在数据不一致，咱们接着往下看。

#### 3、checkpoint

redolog日志文件容量是有限的，需要循环使用，redo log的作用仅仅是为了在崩溃时恢复脏页数据使用的，如果脏页已经刷到磁盘上，其对应的redo log也就没用了，他也就可以被重复利用了。**checkpoint的作用就是用来标记哪些旧的redo log可以被覆盖。**

我们已经知道，判断redo log占用的磁盘空间是否可以被重新利用的标志就是，对应的脏页有没有被刷新到磁盘。为了实现这个目的，我们需要了解一下下边几个记录值的作用：

**（1）lsn**

lsn（log sequence number）是一个全局变量。mysql在运行期间，会不断的产生redo log，日志的量会不断增加，innodb使用lsn来记录当前总计写入的日志量，lsn的初始值不是0，而是8704，原因未知。系统在记录lsn时是按照【偏移量】不断累加的。**lsn的值越小说明redo log产生的越早。**

每一组redo log都有一个唯一的lsn值和他对应，你可以理解为lsn是redo log的年龄。

**（2）flush_to_disk_lsn**

`flush_to_disk_lsn`也是一个全局变量，表示已经刷入磁盘的redo log的量，他小于等于lsn，举个例子：

1、将redo log写入log buffer，lsn增加，假如：8704+1024 = 9728，此时flush_to_disk_lsn不变。

2、刷如512字节到磁盘，此时flush_to_disk_lsn=8704+512=9256。

如果两者数据相同，说明已经全部刷盘。

**（3）flush链中的lsn**

其实要保证数据不丢失，核心的工作是要将buffer pool中的脏页进行刷盘，但是刷盘工作比较损耗性能，需要独立的线程在后台静默操作。

回顾一下flush链，当第一次修改某个已经加载到buffer pool中的页面时，他会变成【脏页】，会把他放置在flush链表的头部，flush链表是按照第一次修改的时间排序的。再第一次修改缓冲页时，会在【缓冲页对应的控制块】中，记录以下两个属性：

- oldest_modification：**第一次**修改缓冲页时，就将【修改该页面的第一组redo log的lsn值】记录在对应的控制块。
- newest_modification：**每一次**修改缓冲页时，就将【修改该页面的最后组redo log的lsn值】记录在对应的控制块。

既然flush链表是按照修改日期排序的，那么也就意味着，oldest_modification的值也是有序的。

**（4）checkpoint过程**

执行一个check point可以分为两个步骤

**第一步：**计算当前redo log文件中可以被覆盖的redo日志对应的lsn的值是多少：

1、flush链是按照第一次修改的时间排序的，当然控制块内的【oldest_modification】记录的lsn值也是有序的。

2、我们找到flush链表的头节点上的【oldest_modification】所记录的lsn值，也就找到了一个可以刷盘的最大的lsn值，小于这个值的脏页，肯定已经刷入磁盘。

3、所有小于这个lsn值的redo log，都可以被覆盖重用。

4、将这个lsn值赋值给一个全局变量checkpoint_lsn，他代表可以被覆盖的量。

**第二步：**将checkpoint_lsn与对应的redo log日志文件组偏移量以及此次checkpoint的编号（checkpoint_no也是一个变量，记录了checkpoint的次数）全部记录在日志文件的管理信息内。

#### 4、一个事务的执行流程

![image-20220510174411661](..\img\image-20220510174411661-951cbbb0.png)

主线程

1、客户端访问mysql服务，在buffer pool中进行操作（如果目标页不在缓冲区，需要加载进入缓冲区），此时会形成脏页。

2、记录redo log，可能产生很多组日志，redo log优先记录在缓冲区，会在提交事务前刷盘。

3、刷盘时根据checkpoint的结果，选择可以使用的日志空间进行记录。

4、成功后即可返回，此时数据不会落盘，这个过程很多操作只在内存进行，只需要记录redo log（顺序写），所以速度很快。

线程1：

1、不断的对flush链表的脏页进行刷盘，对响应时间没有过高要求。

线程2：

1、不断的进行checkpoin操作，保证redo log可以及时写入。

#### 5、系统崩溃的影响

（1）**log buffer中的日志丢失，**log buffer中的日志会在每次事务前进行刷盘，如果在事务进行中崩溃，事务本来就需要回滚。

（2）**buffer pool中的脏页丢失**，崩溃后可以通过redo log恢复，通过checkpoint操作，我们可以确保，内存中脏页对应的记录都会在redo log日志中存在。

redo log保证了崩溃后，数据不丢失，但是一个事务进行中，如果一部分redo log已经刷盘，那么系统会将本应回滚的数据同样恢复，为了解决回滚的问题，innodb提出了undo log。

### 四、undo log日志
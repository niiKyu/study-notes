

## 一些NoSQL数据库

> memcache

- 很早出现的NoSql数据库
- 数据都在内存中，一般不持久化
- 支持简单的key-value模式
- 一般是作为缓存数据库辅助持久化的数据库

> redis介绍

- 几乎覆盖了Memcached的绝大部分功能
- 数据都在内存中，支持持久化，主要用作备份恢复
- 除了支持简单的key-value模式，还支持多种数据结构的存储，比如 list、set、hash、zset等。
- 一般是作为缓存数据库辅助持久化的数据库
- 现在市面上用得非常多的一款内存数据库

> mongoDB介绍（一般存储评论）

- 高性能、开源、模式自由(schema free)的文档型数据库
- 数据都在内存中， 如果内存不足，把不常用的数据保存到硬盘
- 虽然是key-value模式，但是对value（尤其是json）提供了丰富的查询功能
- 支持二进制数据及大型对象
- 可以根据数据的特点替代RDBMS，成为独立的数据库。或者配合RDBMS，存储特定的数据。

> 列式存储HBase介绍（一般存储大数据，几百T数据）

HBase是**Hadoop**项目中的数据库。它用于需要对大量的数据进行随机、实时读写操作的场景中。HBase的目标就是处理数据量非常庞大的表，可以用普通的计算机处理超过10亿行数据，还可处理有数百万列元素的数据表。

## Redis

redis官网地址：

[https://redis.io/](https://redis.io/)

中文网站

http://www.redis.cn/

### Redis的应用场景

#### 2.1 取最新N个数据的操作

比如典型的取网站最新文章，可以将最新的5000条评论ID放在Redis的List集合中，并将超出集合部分从数据库获取

#### 2.2.排行榜应用，取TOP N操作

这个需求与上面需求的不同之处在于，前面操作以时间为权重，这个是以某个条件为权重，比如按顶的次数排序，可以使用Redis的sorted set，将要排序的值设置成sorted set的score，将具体的数据设置成相应的value，每次只需要执行一条ZADD命令即可。

#### 2.3需要精准设定过期时间的应用

比如可以把上面说到的sorted set的score值设置成过期时间的时间戳，那么就可以简单地通过过期时间排序，定时清除过期数据了，不仅是清除Redis中的过期数据，你完全可以把Redis里这个过期时间当成是对数据库中数据的索引，用Redis来找出哪些数据需要过期删除，然后再精准地从数据库中删除相应的记录。

#### 2.4计数器应用

Redis的命令都是原子性的，你可以轻松地利用INCR，DECR命令来构建计数器系统。

#### 2.5Uniq操作，获取某段时间所有数据排重值

这个使用Redis的set数据结构最合适了，只需要不断地将数据往set中扔就行了，set意为集合，所以会自动排重。

#### 2.6实时系统，反垃圾系统

通过上面说到的set功能，你可以知道一个终端用户是否进行了某个操作，可以找到其操作的集合并进行分析统计对比等。没有做不到，只有想不到。

#### 2.7缓存

将数据直接存放到内存中，性能优于Memcached，数据结构更多样化。

### Redis keys 命令

下表给出了与 Redis 键相关的基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [DEL key ] <br />该命令用于在 key 存在时删除 key。           |
| 2    | [DUMP key ] <br /> 序列化给定 key ，并返回被序列化的值。     |
| 3    | **[EXISTS key]** <br /><br />检查给定 key 是否存在。         |
| 4    | **[EXPIRE key seconds ]** <br /> 为给定 key 设置过期时间，以秒计。 |
| 5    | [EXPIREAT key timestamp ] <br />EXPIREAT 的作用和 EXPIRE 类似，都用于为 key 设置过期时间。 不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。 |
| 6    | [PEXPIRE key milliseconds ] <br />设置 key 的过期时间以毫秒计。 |
| 7    | [PEXPIREAT key milliseconds-timestamp ] <br />设置 key 过期时间的时间戳(unix timestamp) 以毫秒计 |
| 8    | [KEYS pattern ] <br />查找所有符合给定模式( pattern)的 key 。 |
| 9    | [MOVE key db ] <br />将当前数据库的 key 移动到给定的数据库 db 当中。 |
| 10   | [PERSIST key ] <br />移除 key 的过期时间，key 将持久保持。   |
| 11   | [PTTL key ] <br />以毫秒为单位返回 key 的剩余的过期时间。    |
| 12   | **[TTL key ]** <br />以秒为单位，返回给定 key 的剩余生存时间(TTL, time to live)。 |
| 13   | **[RANDOMKEY ]** <br />从当前数据库中随机返回一个 key 。     |
| 14   | [RENAME key newkey ] <br />修改 key 的名称                   |
| 15   | [RENAMENX key newkey ] <br />仅当 newkey 不存在时，将 key 改名为 newkey 。 |
| 16   | [SCAN cursor [MATCH pattern\] [COUNT count] ] <br />迭代数据库中的数据库键。 |
| 17   | [TYPE key ] <br />返回 key 所储存的值的类型。                |

### Redis String命令

下表列出了常用的 redis 字符串命令：

| 序号   | 命令及描述                                                   |
| :----- | :----------------------------------------------------------- |
| **1**  | **[SET key value]** <br />设置指定 key 的值。                |
| **2**  | **[GET key]** <br />获取指定 key 的值。                      |
| 3      | [GETRANGE key start end ] <br />返回 key 中字符串值的子字符  |
| 4      | [GETSET key value ] <br />将给定 key 的值设为 value ，并返回 key 的旧值(old value)。 |
| 5      | [GETBIT key offset 对 key ] <br />所储存的字符串值，获取指定偏移量上的位(bit)。 |
| **6**  | **[MGET key1 [key2..]]** <br />获取所有(一个或多个)给定 key 的值。 |
| 7      | [SETBIT key offset value ] <br />对 key 所储存的字符串值，设置或清除指定偏移量上的位(bit)。 |
| **8**  | **[SETEX key seconds value]** <br />将值 value 关联到 key ，并将 key 的过期时间设为 seconds (以秒为单位)。 |
| **9**  | **[SETNX key value]** <br />只有在 key 不存在时设置 key 的值。 |
| 10     | [SETRANGE key offset value ] <br />用 value 参数覆写给定 key 所储存的字符串值，从偏移量 offset 开始。 |
| 11     | [STRLEN key ] <br />返回 key 所储存的字符串值的长度。        |
| **12** | **[MSET key value [key value ...\]]** <br />同时设置一个或多个 key-value 对。 |
| 13     | [MSETNX key value [key value ...\] ] <br />同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在。 |
| 14     | [PSETEX key milliseconds value ] <br />这个命令和 SETEX 命令相似，但它以毫秒为单位设置 key 的生存时间，而不是像 SETEX 命令那样，以秒为单位。 |
| **15** | **[INCR key]** <br />将 key 中储存的数字值增一。             |
| **16** | **[INCRBY key increment]** <br />将 key 所储存的值加上给定的增量值（increment） 。 |
| 17     | [INCRBYFLOAT key increment ] <br />将 key 所储存的值加上给定的浮点增量值（increment） 。 |
| 18     | **[DECR key]** <br />将 key 中储存的数字值减一。             |
| **19** | **[DECRBY key decrement]** <br />key 所储存的值减去给定的减量值（decrement） 。 |
| 20     | [APPEND key value ] <br />如果 key 已经存在并且是一个字符串， APPEND 命令将指定的 value 追加到该 key 原来值（value）的末尾。 |

### Redis hash 命令

下表列出了 redis hash 基本的相关命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [HDEL key field1 [field2\ ] <br />删除一个或多个哈希表字段   |
| 2    | [HEXISTS key field ] <br />查看哈希表 key 中，指定的字段是否存在。 |
| 3    | [HGET key field ] <br />获取存储在哈希表中指定字段的值。     |
| 4    | [HGETALL key ] <br />获取在哈希表中指定 key 的所有字段和值   |
| 5    | [HINCRBY key field increment ] <br />为哈希表 key 中的指定字段的整数值加上增量 increment 。 |
| 6    | [HINCRBYFLOAT key field increment ] <br />为哈希表 key 中的指定字段的浮点数值加上增量 increment 。 |
| 7    | [HKEYS key ] <br />获取哈希表中的所有字段                    |
| 8    | [HLEN key ] <br />获取哈希表中字段的数量                     |
| 9    | [HMGET key field1 [field2\] ] <br />获取所有给定字段的值     |
| 10   | [HMSET key field1 value1 [field2 value2 \] ] <br />同时将多个 field-value (域-值)对设置到哈希表 key 中。 |
| 11   | [HSET key field value ] <br />将哈希表 key 中的字段 field 的值设为 value 。 |
| 12   | [HSETNX key field value ] <br />只有在字段 field 不存在时，设置哈希表字段的值。 |
| 13   | [HVALS key ] <br />获取哈希表中所有值。                      |
| 14   | [HSCAN key cursor [MATCH pattern\] [COUNT count] ] <br />迭代哈希表中的键值对。 |

### Redis List命令

下表列出了列表相关的基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [BLPOP key1 [key2 \] timeout ] <br />移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 2    | [BRPOP key1 [key2 \] timeout ] <br />移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 3    | [BRPOPLPUSH source destination timeout ] <br />从列表中弹出一个值，将弹出的元素插入到另外一个列表中并返回它； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 4    | [LINDEX key index ] <br />通过索引获取列表中的元素           |
| 5    | [LINSERT key BEFORE\|AFTER pivot value ] <br />在列表的元素前或者后插入元素 |
| 6    | [LLEN key ] <br />获取列表长度                               |
| 7    | [LPOP key ] <br />移出并获取列表的第一个元素                 |
| 8    | [LPUSH key value1 [value2\] ] <br />将一个或多个值插入到列表头部 |
| 9    | [LPUSHX key value ] <br />将一个值插入到已存在的列表头部     |
| 10   | [LRANGE key start stop ] <br />获取列表指定范围内的元素      |
| 11   | [LREM key count value ] <br />移除列表元素                   |
| 12   | [LSET key index value ] <br />通过索引设置列表元素的值       |
| 13   | [LTRIM key start stop ] <br />对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除。 |
| 14   | [RPOP key ] <br />移除列表的最后一个元素，返回值为移除的元素。 |
| 15   | [RPOPLPUSH source destination ] <br />移除列表的最后一个元素，并将该元素添加到另一个列表并返回 |
| 16   | [RPUSH key value1 [value2\] ] <br />在列表中添加一个或多个值到列表尾部 |
| 17   | [RPUSHX key value ] <br />为已存在的列表添加值               |

### Redis Set命令

下表列出了 Redis 集合基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [SADD key member1 [member2\] ] <br />向集合添加一个或多个成员 |
| 2    | [SCARD key ] <br />获取集合的成员数                          |
| 3    | [SDIFF key1 [key2\] ] <br />返回第一个集合与其他集合之间的差异。 |
| 4    | [SDIFFSTORE destination key1 [key2\] ] <br />返回给定所有集合的差集并存储在 destination 中 |
| 5    | **[SINTER key1 [key2\]]** <br />返回给定所有集合的交集**（登入用户和操作用户做交集，可以查找非法操作用户）** |
| 6    | [SINTERSTORE destination key1 [key2\] ] <br />返回给定所有集合的交集并存储在 destination 中 |
| 7    | [SISMEMBER key member ] <br />判断 member 元素是否是集合 key 的成员 |
| 8    | [SMEMBERS key ] <br />返回集合中的所有成员                   |
| 9    | [SMOVE source destination member ] <br />将 member 元素从 source 集合移动到 destination 集合 |
| 10   | [SPOP key ] <br />移除并返回集合中的一个随机元素             |
| 11   | [SRANDMEMBER key [count\] ] <br />返回集合中一个或多个随机数 |
| 12   | [SREM key member1 [member2\] ] <br />移除集合中一个或多个成员 |
| 13   | [SUNION key1 [key2\] ] <br />返回所有给定集合的并集          |
| 14   | [SUNIONSTORE destination key1 [key2\] ] <br />所有给定集合的并集存储在 destination 集合中 |
| 15   | [SSCAN key cursor [MATCH pattern\] [COUNT count] ] <br />迭代集合中的元素 |

### Redis ZSet命令-重要（热搜）

下表列出了 redis 有序集合的基本命令:

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | **[ZADD key score1 member1 [score2 member2\]** <br />向有序集合添加一个或多个成员，或者更新已存在成员的分数 |
| 2    | **[ZCARD key]** <br />获取有序集合的成员数                   |
| 3    | **[ZCOUNT key min max]** <br />计算在有序集合中指定区间分数的成员数 |
| 4    | [ZINCRBY key increment member] <br />有序集合中对指定成员的分数加上增量 increment |
| 5    | [ZINTERSTORE destination numkeys key [key ...\]] <br />计算给定的一个或多个有序集的交集并将结果集存储在新的有序集合 destination 中 |
| 6    | [ZLEXCOUNT key min max] <br />在有序集合中计算指定字典区间内成员数量 |
| 7    | [ZRANGE key start stop [WITHSCORES\]] <br />通过索引区间返回有序集合指定区间内的成员 |
| 8    | [ZRANGEBYLEX key min max [LIMIT offset count\]] <br />通过字典区间返回有序集合的成员 |
| 9    | [ZRANGEBYSCORE key min max [WITHSCORES\] [LIMIT]] <br />通过分数返回有序集合指定区间内的成员 |
| 10   | [ZRANK key member] <br />返回有序集合中指定成员的索引        |
| 11   | [ZREM key member [member ...\]] <br />移除有序集合中的一个或多个成员 |
| 12   | [ZREMRANGEBYLEX key min max] <br />移除有序集合中给定的字典区间的所有成员 |
| 13   | [ZREMRANGEBYRANK key start stop] <br />移除有序集合中给定的排名区间的所有成员 |
| 14   | [ZREMRANGEBYSCORE key min max] <br />移除有序集合中给定的分数区间的所有成员 |
| 15   | **[ZREVRANGE key start stop [WITHSCORES\]]** <br />返回有序集中指定区间内的成员，通过索引，分数从高到低**（使用最多，效率很高）** |
| 16   | [ZREVRANGEBYSCORE key max min [WITHSCORES\]] <br />返回有序集中指定分数区间内的成员，分数从高到低排序 |
| 17   | **[ZREVRANK key member]** <br />返回有序集合中指定成员的排名，有序集成员按分数值递减(从大到小)排序 |
| 18   | [ZSCORE key member] <br />返回有序集中，成员的分数值         |
| 19   | [ZUNIONSTORE destination numkeys key [key ...\]] <br />计算给定的一个或多个有序集的并集，并存储在新的 key 中 |
| 20   | [ZSCAN key cursor [MATCH pattern\] [COUNT count]] <br />迭代有序集合中的元素（包括元素成员和元素分值） |

```text
1添加
zadd pv 100 page1.html 200 page2.html 300 page3.html
2查看
zcard pv
3查询指定权重范围的成员数
ZCOUNT pv 150 500
4增加权重
ZINCRBY pv 1 page1.html
5交集
ZADD pv_zset1 10 page1.html 20  page2.html
ZADD pv_zset2 5 page1.html 10  page2.html
ZINTERSTORE pv_zset_result 2 pv_zset1  pv_zset2
6成员的分数值
ZSCORE pv_zset page3.html   
7 获取下标范围内的成员。 排序，默认权重由低到高
ZRANGE pv 0 -1
8获取由高到低的几个成员（reverse）使用最多的
效率很高，因为本身zset就是排好序的。
ZREVRANGE key start stop
```

### 对位图BitMaps的操作

- Bitmaps不是一种数据结构，操作是基于String结构的，一个String最大可以存储512M，那么一个Bitmaps则可以设置2^32个位

* Bitmaps单独提供了一套命令，所以在Redis中使用Bitmaps和使用字符串的方法不太相同。可以**把Bitmaps想象成一个以位为单位的数组**，数组的每个单元**只能存储0和1**，数组的下标在Bitmaps中叫做偏移量offset

**设置值**

```text
SETBIT key offset value  
```

**unique:users:2022-04-05**代表2022-04-05这天的独立访问用户的Bitmaps

```text
 setbit unique:users:2022-04-05 0  1  
 setbit unique:users:2022-04-05 5 1  
 setbit unique:users:2022-04-05 11 1  
 setbit unique:users:2022-04-05 15 1  
 setbit unique:users:2022-04-05 19 1 
```

**获取值**

```text
GETBIT key offset
```

```text
getbit unique:users:2022-04-05 8
```

**获取Bitmaps指定范围值为1的个数**

```text
BITCOUNT key [start end] 
```

例：下面操作计算2022-04-05这天的独立访问用户数量：

```text
bitcount unique:users:2022-04-05  
```

**Bitmaps间的运算**

```text
BITOP operation destkey key [key, …] 
```

bitop是一个复合操作， 它可以做多个Bitmaps的and（交集） 、 or（并集） 、 not（非） 、 xor（异或） 操作并将结果保存在destkey中。

需求：假设2022-04-04访问网站的userid=1， 2， 5， 9， 如图3-13所示：

```text
setbit unique:users:2022-04-04 1 1  
setbit  unique:users:2022-04-04 2 1  
setbit  unique:users:2022-04-04 5 1  
setbit  unique:users:2022-04-04 9 1  
```

例1：下面操作计算出2022-04-04和2022-04-05两天都访问过网站的用户数量， 如下所示。

```text
bitop and unique:users:and:2022-04-04_05  unique:users:2022-04-04 unique:users:2022-04-05  
bitcount unique:users:and:2022-04-04_05
```

### 对HyperLogLog结构的操作

HyperLogLog常用于大数据量的统计，比如页面访问量统计或者用户访问量统计。

**UV计算示例**

```text
node1.ydlclass.cn:6379> help @hyperloglog      

PFADD  key element [element ...]   
summary:  Adds the specified elements to the specified HyperLogLog.   
since:  2.8.9      

PFCOUNT  key [key ...]   
summary:  Return the approximated cardinality（基数） of the set(s) observed by the HyperLogLog at  key(s).   
since:  2.8.9      

PFMERGE  destkey sourcekey [sourcekey ...]   
summary:  Merge N different HyperLogLogs into a single one.   
since:  2.8.9  
```

**pfadd**和**pfcount**常用于统计，需求：假如两个页面很相近，现在想统计这两个页面的用户访问量呢？这里就可以用**pfmerge**合并统计了，语法如例子：

```text
node1.ydlclass.cn:6379> pfadd page1 user1 user2  user3 user4 user5  
(integer) 1  
node1.ydlclass.cn:6379> pfadd page2 user1 user2  user3 user6 user7  
(integer) 1  
node1.ydlclass.cn:6379> pfmerge page1+page2  page1 page2  
OK  
node1.ydlclass.cn:6379> pfcount page1+page2  
(integer) 7
```

## Redis Java API操作

### 使用JedisPool

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.9.0</version>
</dependency>
```

```java
// JedisPoolConfig配置对象
JedisPoolConfig config = new JedisPoolConfig();
// 指定最大空闲连接为10个
config.setMaxIdle(10);
// 最小空闲连接5个
config.setMinIdle(5);
// 最大等待时间为3000毫秒
config.setMaxWaitMillis(3000);
// 最大连接数为50
config.setMaxTotal(50);

jedisPool = new JedisPool(config, "192.168.200.131", 6379);
// 从Redis连接池获取Redis连接
Jedis jedis = jedisPool.getResource();
// 调用keys方法获取所有的key
Set<String> keySet = jedis.keys("*");

// 关闭连接池
jedisPool.close();
```

### 使用Spring的RedisTemplate
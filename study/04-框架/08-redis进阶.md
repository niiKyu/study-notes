## Redis的持久化

在redis当中，提供了两种数据持久化的方式，分别为**RDB**以及**AOF**，且Redis默认开启的数据持久化方式为RDB方式。

### RDB持久化方案

可以在配置文件中配置Redis进行快照保存的时机：

```text
save [seconds] [changes]  
```

意为在seconds秒内如果发生了changes次数据修改，则进行一次RDB快照保存，例如

```text
save  60 100
save  600 500
```

### AOF持久化方案

AOF默认是关闭的，如要开启，进行如下配置：

```text
  # 第594行  
  appendonly  yes 
```

#### 配置AOF

AOF提供了三种fsync配置：always/everysec/no，通过配置项[appendfsync]指定：

1. **appendfsync no**：不进行fsync，将flush文件的时机交给OS决定，速度最快
2. **appendfsync always**：每写入一条日志就进行一次fsync操作，数据安全性最高，但速度最慢
3. **appendfsync everysec**：折中的做法，交由后台线程每秒fsync一次

### RDB or AOF

如果对数据安全不敏感，就关闭AOF，RDB1000秒1次

如果对数据安全敏感，开启AOF，RDB5秒1次

比如：最后的从机上，rdb aof都开启。

## Redis 事务

```sh
192.168.200.131:6379> set key1 v1
OK
192.168.200.131:6379> set key2 v2
OK
192.168.200.131:6379> multi  				# 开启事务
OK  
192.168.200.131:6379> set key1 v1  
QUEUED  
192.168.200.131:6379> set key2 v2  
QUEUED  
192.168.200.131:6379> discard  				# 取消事务
OK  
192.168.200.131:6379> get key1  
"v1"
192.168.200.131:6379> get key2  
"v2" 
```

## 数据删除与淘汰策略

- 1.定时删除
- 2.惰性删除
- 3.定期删除

## Redis的主从复制架构

### 主从复制的工作流程（三个阶段）

> 阶段一：建立连接

![image-20220301180213179](..\img\image-20220301180213179-69b85b61.png)

> 阶段二：数据同步

![image-20220301230944836](..\img\image-20220301230944836-c1284320.png)

> 阶段三：命令传播

![image-20220302004108225](..\img\image-20220302004108225-246adaf9.png)

至此：我们可以总结出完整的主从复制流程：

![image-20220302005829154](..\img\image-20220302005829154-38f96bf0.png)

### 搭建主从架构

```sh
# 修改配置文件
port 6380
pidfile /var/run/redis_6380.pid
logfile "/export/server/redis6380/log/redis.log"
dir /export/server/redis6380/data
```

```sh
# 启动一个redis服务，
./bin/redis-server redis.conf slaveof 192.168.200.131 6379
```

## Redis中的Sentinel架构

![image-20220302103622950](..\img\image-20220302103622950-c52453fb.png)

### 搭建哨兵

```sh
# 修改sentinel.conf
port 26379
daemonize yes
pidfile "/var/run/redis-sentinel26379.pid"
logfile "/export/server/sentinel26379/log/log.log"
dir "/export/server/sentinel26379/data"
sentinel monitor mymaster 192.168.200.131 6379 2

sentinel resolve-hostnames no
sentinel announce-hostnames no
```

```sh
# 启动sentinel
# 需要先搭建主从架构
./bin/redis-sentinel sentinel.conf
```

```sh
# 链接sentinel
./bin/redis-cli -h 192.168.200.131 -p 26379
```

### java代码链接sentinel

原生

```java
public class ReidsSentinelTest {
    JedisSentinelPool jedisSentinelPool;
    //1. 在 创建一个新的类 ReidsSentinelTest
    //2. 构建JedisPoolConfig配置对象
    //3. 创建一个HashSet，用来保存哨兵节点配置信息（记得一定要写端口号）
    //4. 构建JedisSentinelPool连接池
    //5. 使用sentinelPool连接池获取连接
    @BeforeTest
    public void beforeTest(){
        //创建jedis连接池
        JedisPoolConfig config=new JedisPoolConfig();
        //最大空闲连接
        config.setMaxIdle(10);
        //最小空闲连接
        config.setMinIdle(5);
        //最大空闲时间
        config.setMaxWaitMillis(3000);
        //最大连接数
        config.setMaxTotal(50);


        Set<String> sentinels=new HashSet<>();
        sentinels.add("192.168.200.131:26379");
        sentinels.add("192.168.200.131:26380");
        sentinels.add("192.168.200.131:26381");

        jedisSentinelPool= new JedisSentinelPool("mymaster",sentinels,config);
    }
    @Test
    public void keysTest(){
        Jedis jedis = jedisSentinelPool.getResource();
        Set<String> keys = jedis.keys("*");
        for (String key : keys) {
            System.out.println(key);
        }
    }
    @AfterTest
    public void afterTest(){
        jedisSentinelPool.close();
    }
}
```

springboot

```yml
spring:
  redis:
    sentinel:
      nodes: 192.168.200.131:26379,192.168.200.131:26380,192.168.200.131:26381 //哨兵的ip和端口
      master: mymaster //这个就是哨兵配置文件中 sentinel monitor mymaster 192.168.200.131 6379 2 配置的mymaster
```

## Redis cluster集群

### Cluster集群结构搭建

```sh
# 修改redis.conf
port 7001
bind 192.168.169.130
protected-mode no
daemonize yes
pidfile /var/run/redis_7001.pid
logfile "/export/server/redis-cluster7001/log/redis.log"
dir /export/server/redis-cluster7001/data/
appendonly yes
cluster-enabled yes
cluster-config-file nodes-7001.conf
cluster-node-timeout 15000
```

```sh
# 启动所有redis服务（包括主和从）
./redis-cluster7001/bin/redis-server ./redis-cluster7001/redis.conf
./redis-cluster7002/bin/redis-server ./redis-cluster7002/redis.conf
./redis-cluster7003/bin/redis-server ./redis-cluster7003/redis.conf
./redis-cluster7004/bin/redis-server ./redis-cluster7004/redis.conf
./redis-cluster7005/bin/redis-server ./redis-cluster7005/redis.conf
./redis-cluster7006/bin/redis-server ./redis-cluster7006/redis.conf
# 让六台机器组成集群，自动分配主从服务器
redis-cli --cluster create 192.168.169.130:7001 192.168.169.130:7002 192.168.169.130:7003 192.168.169.130:7004 192.168.169.130:7005 192.168.169.130:7006 --cluster-replicas 1
```

```sh
# 客户端连接cluster
./redis-cli -c -h 192.168.200.131 -p 7001
```

```sh
# 客户端连接cluster
./redis-cli -c -h 192.168.200.131 -p 7001
```

**Cluster配置**

- 是否启用cluster，加入cluster节点

```properties
cluster-enabled yes|no
```

- cluster配置文件名，该文件属于自动生成，仅用于快速查找文件并查询文件内容

```properties
cluster-config-file filename
```

- 节点服务响应超时时间，用于判定该节点是否下线或切换为从节点

```properties
cluster-node-timeout milliseconds
```

- master连接的slave最小数量

```properties
cluster-migration-barrier min_slave_number
```

**Cluster节点操作命令**

- 查看集群节点信息

```properties
cluster nodes
```

- 更改slave指向新的master

```properties
cluster replicate master-id
```

- 发现一个新节点，新增master

```properties
cluster meet ip:port
```

- 忽略一个没有solt的节点

```properties
cluster forget server_id
```

- 手动故障转移

```properties
cluster failover
```

**集群操作命令：**

- 创建集群

```properties
redis-cli –-cluster create masterhost1:masterport1 masterhost2:masterport2  masterhost3:masterport3 [masterhostn:masterportn …] slavehost1:slaveport1  slavehost2:slaveport2 slavehost3:slaveport3 -–cluster-replicas n
```

注意：master与slave的数量要匹配，一个master对应n个slave，由最后的参数n决定

master与slave的匹配顺序为第一个master与前n个slave分为一组，形成主从结构

- 添加master到当前集群中，连接时可以指定任意现有节点地址与端口

```properties
redis-cli --cluster add-node new-master-host:new-master-port now-host:now-port
```

- 添加slave

```properties
redis-cli --cluster add-node new-slave-host:new-slave-port master-host:master-port --cluster-slave --cluster-master-id masterid
```

- 删除节点，如果删除的节点是master，必须保障其中没有槽slot

```properties
redis-cli --cluster del-node del-slave-host:del-slave-port del-slave-id
```

- 重新分槽，分槽是从具有槽的master中划分一部分给其他master，过程中不创建新的槽

```properties
redis-cli --cluster reshard new-master-host:new-master:port --cluster-from src-  master-id1, src-master-id2, src-master-idn --cluster-to target-master-id --  cluster-slots slots
```

注意：将需要参与分槽的所有masterid不分先后顺序添加到参数中，使用，分隔

指定目标得到的槽的数量，所有的槽将平均从每个来源的master处获取

- 重新分配槽，从具有槽的master中分配指定数量的槽到另一个master中，常用于清空指定master中的槽

```properties
redis-cli --cluster reshard src-master-host:src-master-port --cluster-from src-  master-id --cluster-to target-master-id --cluster-slots slots --cluster-yes
```

### java操作

原生

```java
public class RedisClusterTest {
    JedisCluster jedisCluster;
    @BeforeTest
    public void beforeTest(){
        //创建jedis连接池
        JedisPoolConfig config=new JedisPoolConfig();
        //最大空闲连接
        config.setMaxIdle(10);
        //最小空闲连接
        config.setMinIdle(5);
        //最大空闲时间
        config.setMaxWaitMillis(3000);
        //最大连接数
        config.setMaxTotal(50);

        Set<HostAndPort> nodes=new HashSet<>();
        nodes.add(new HostAndPort("192.168.200.131", 7001));
        nodes.add(new HostAndPort("192.168.200.131", 7002));
        nodes.add(new HostAndPort("192.168.200.131", 7003));
        nodes.add(new HostAndPort("192.168.200.131", 7004));
        nodes.add(new HostAndPort("192.168.200.131", 7005));
        nodes.add(new HostAndPort("192.168.200.131", 7006));

        jedisCluster= new JedisCluster(nodes,config);
    }
    @Test
    public void addTest(){
        jedisCluster.set("c", "d");
        String str = jedisCluster.get("c");
        System.out.println(str);
    }
    @AfterTest
    public void afterTest(){
        try {
            jedisCluster.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

springboot

```yml
spring:
  redis:
    pool:
      max-idle: 100
      min-idle: 1
      max-active: 1000
      max-wait: -1
    cluster:
      nodes:
        - 192.168.200.131:7001
        - 192.168.200.131:7002
        - 192.168.200.131:7003
        - 192.168.200.131:7004
        - 192.168.200.131:7005
        - 192.168.200.131:7006
    database: 0
    timeout: 15000
    connect-timeout: 5000
```

## Redis高频面试题

### 1、缓存预热

**场景**：“宕机”

服务器启动后迅速宕机

**问题排查**：

1.请求数量较高，大量的请求过来之后都需要去从缓存中获取数据，但是缓存中又没有，此时从数据库中查找数据然后将数据再存入缓存，造成了短期内对redis的高强度操作从而导致问题

2.主从之间数据吞吐量较大，数据同步操作频度较高

**解决方案：**

- 前置准备工作：

1.日常例行统计数据访问记录，统计访问频度较高的热点数据

2.利用LRU数据删除策略，构建数据留存队列例如：storm与kafka配合

- 准备工作：

1.将统计结果中的数据分类，根据级别，redis优先加载级别较高的热点数据

2.利用分布式多服务器同时进行数据读取，提速数据加载过程

3.热点数据主从同时预热

- 实施：

4.使用脚本程序固定触发数据预热过程

5.如果条件允许，使用了CDN（内容分发网络），效果会更好

![image-20220302143005379](..\img\image-20220302143005379-de9b1aa7.png)

**总的来说**：缓存预热就是系统启动前，提前将相关的缓存数据直接加载到缓存系统。避免在用户请求的时候，先查询数据库，然后再将数据缓存的问题！用户直接查询事先被预热的缓存数据！

### 2、缓存雪崩

**场景**：数据库服务器崩溃，一连串的场景会随之儿来

1.系统平稳运行过程中，忽然数据库连接量激增

2.应用服务器无法及时处理请求

3.大量408，500错误页面出现

4.客户反复刷新页面获取数据

5.数据库崩溃

6.应用服务器崩溃

7.重启应用服务器无效

8.Redis服务器崩溃

9.Redis集群崩溃

10.重启数据库后再次被瞬间流量放倒

**问题排查**：

1.在一个较短的时间内，缓存中较多的key集中过期

2.此周期内请求访问过期的数据，redis未命中，redis向数据库获取数据

3.数据库同时接收到大量的请求无法及时处理

4.Redis大量请求被积压，开始出现超时现象

5.数据库流量激增，数据库崩溃

6.重启后仍然面对缓存中无数据可用

7.Redis服务器资源被严重占用，Redis服务器崩溃

8.Redis集群呈现崩塌，集群瓦解

9.应用服务器无法及时得到数据响应请求，来自客户端的请求数量越来越多，应用服务器崩溃

10.应用服务器，redis，数据库全部重启，效果不理想

总而言之就两点：短时间范围内，大量key集中过期

![image-20220302143411228](..\img\image-20220302143411228-bb434b73.png)

**解决方案**

- 思路：

1.更多的页面静态化处理

2.构建多级缓存架构

 Nginx缓存+redis缓存+ehcache缓存

3.检测Mysql严重耗时业务进行优化

 对数据库的瓶颈排查：例如超时查询、耗时较高事务等

4.灾难预警机制

 监控redis服务器性能指标

 CPU占用、CPU使用率

 内存容量

 查询平均响应时间

 线程数

5.限流、降级

短时间范围内牺牲一些客户体验，限制一部分请求访问，降低应用服务器压力，待业务低速运转后再逐步放开访问

- 落地实践：

1.LRU与LFU切换

2.数据有效期策略调整

 根据业务数据有效期进行分类错峰，A类90分钟，B类80分钟，C类70分钟

 过期时间使用固定时间+随机值的形式，稀释集中到期的key的数量

3.超热数据使用永久key

4.定期维护（自动+人工）

 对即将过期数据做访问量分析，确认是否延时，配合访问量统计，做热点数据的延时

5.加锁：慎用！

**总的来说**：缓存雪崩就是瞬间过期数据量太大，导致对数据库服务器造成压力。如能够有效避免过期时间集中，可以有效解决雪崩现象的 出现（约40%），配合其他策略一起使用，并监控服务器的运行数据，根据运行记录做快速调整。

### 3、缓存击穿

**场景**：还是数据库服务器崩溃，但是跟之前的场景有点不太一样

1.系统平稳运行过程中

2.数据库连接量瞬间激增

3.Redis服务器无大量key过期

4.Redis内存平稳，无波动

5.Redis服务器CPU正常

6.数据库崩溃

**问题排查：**

1.Redis中某个key过期，该key访问量巨大

2.多个数据请求从服务器直接压到Redis后，均未命中

3.Redis在短时间内发起了大量对数据库中同一数据的访问

总而言之就两点：单个key高热数据，key过期

![image-20220302143844340](..\img\image-20220302143844340-c120484c.png)

**解决方案**：

1.预先设定

 以电商为例，每个商家根据店铺等级，指定若干款主打商品，在购物节期间，加大此类信息key的过期时长 注意：购物节不仅仅指当天，以及后续若干天，访问峰值呈现逐渐降低的趋势

2.现场调整

 监控访问量，对自然流量激增的数据延长过期时间或设置为永久性key

3.后台刷新数据

 启动定时任务，高峰期来临之前，刷新数据有效期，确保不丢失

4.二级缓存

 设置不同的失效时间，保障不会被同时淘汰就行

5.加锁

 分布式锁，防止被击穿，但是要注意也是性能瓶颈，慎重！

**总的来说**：缓存击穿就是单个高热数据过期的瞬间，数据访问量较大，未命中redis后，发起了大量对同一数据的数据库访问，导致对数 据库服务器造成压力。应对策略应该在业务数据分析与预防方面进行，配合运行监控测试与即时调整策略，毕竟单个key的过 期监控难度较高，配合雪崩处理策略即可。

### 4、缓存穿透

**场景**：数据库服务器又崩溃了，跟之前的一样吗？

1.系统平稳运行过程中

2.应用服务器流量随时间增量较大

3.Redis服务器命中率随时间逐步降低

4.Redis内存平稳，内存无压力

5.Redis服务器CPU占用激增

6.数据库服务器压力激增

7.数据库崩溃

**问题排查：**

1.Redis中大面积出现未命中

2.出现非正常URL访问

![image-20220302144257762](..\img\image-20220302144257762-00e6718b.png)

**问题分析**：

- 获取的数据在数据库中也不存在，数据库查询未得到对应数据
- Redis获取到null数据未进行持久化，直接返回
- 下次此类数据到达重复上述过程
- 出现黑客攻击服务器

**解决方案**：

1.缓存null

 对查询结果为null的数据进行缓存（长期使用，定期清理），设定短时限，例如30-60秒，最高5分钟

2.白名单策略

 提前预热各种分类数据id对应的bitmaps，id作为bitmaps的offset，相当于设置了数据白名单。当加载正常数据时放行，加载异常数据时直接拦截（效率偏低）

 使用布隆过滤器（有关布隆过滤器的命中问题对当前状况可以忽略）

2.实施监控

 实时监控redis命中率（业务正常范围时，通常会有一个波动值）与null数据的占比

 非活动时段波动：通常检测3-5倍，超过5倍纳入重点排查对象

 活动时段波动：通常检测10-50倍，超过50倍纳入重点排查对象

 根据倍数不同，启动不同的排查流程。然后使用黑名单进行防控（运营）

4.key加密

 问题出现后，临时启动防灾业务key，对key进行业务层传输加密服务，设定校验程序，过来的key校验

 例如每天随机分配60个加密串，挑选2到3个，混淆到页面数据id中，发现访问key不满足规则，驳回数据访问。

**总的来说**：缓存击穿是指访问了不存在的数据，跳过了合法数据的redis数据缓存阶段，每次访问数据库，导致对数据库服务器造成压力。通常此类数据的出现量是一个较低的值，当出现此类情况以毒攻毒，并及时报警。应对策略应该在临时预案防范方面多做文章。

无论是黑名单还是白名单，都是对整体系统的压力，警报解除后尽快移除。

### 5、Redis的命名规范

- 使用统一的命名规范
  - 一般使用业务名(或数据库名)为前缀，用冒号分隔，例如，业务名:表名:id。
  - 例如：shop:usr:msg_code（电商:用户:验证码）
- 控制key名称的长度，不要使用过长的key
  - 在保证语义清晰的情况下，尽量减少Key的长度。有些常用单词可使用缩写，例如，user缩写为u，messages缩写为msg。
- 名称中不要包含特殊字符
  - 包含空格、单双引号以及其他转义字符

### 6、性能指标监控

redis中的监控指标如下：

- 性能指标：Performance

> 响应请求的平均时间:
>
> ```properties
> latency
> ```
>
> 平均每秒处理请求总数
>
> ```properties
> instantaneous_ops_per_sec
> ```
>
> 缓存查询命中率（通过查询总次数与查询得到非nil数据总次数计算而来）
>
> ```properties
> hit_rate(calculated)
> ```

- 内存指标：Memory

> 当前内存使用量
>
> ```properties
> used_memory
> ```
>
> 内存碎片率（关系到是否进行碎片整理）
>
> ```properties
> mem_fragmentation_ratio
> ```
>
> 为避免内存溢出删除的key的总数量
>
> ```properties
> evicted_keys
> ```
>
> 基于阻塞操作（BLPOP等）影响的客户端数量
>
> ```properties
> blocked_clients
> ```

- 基本活动指标：Basic_activity

> 当前客户端连接总数
>
> ```properties
> connected_clients
> ```
>
> 当前连接slave总数
>
> ```properties
> connected_slaves
> ```
>
> 最后一次主从信息交换距现在的秒
>
> ```properties
> master_last_io_seconds_ago
> ```
>
> key的总数
>
> ```properties
> keyspace
> ```

- 持久性指标：Persistence

> 当前服务器最后一次RDB持久化的时间
>
> ```properties
> rdb_last_save_time
> ```
>
> 当前服务器最后一次RDB持久化后数据变化总量
>
> ```properties
> rdb_changes_since_last_save
> ```

- 错误指标：Error

> 被拒绝连接的客户端总数（基于达到最大连接值的因素）
>
> ```properties
> rejected_connections
> ```
>
> key未命中的总次数
>
> ```properties
> keyspace_misses
> ```
>
> 主从断开的秒数
>
> ```properties
> master_link_down_since_seconds
> ```

要对redis的相关指标进行监控，我们可以采用一些用具：

- CloudInsight Redis
- Prometheus
- Redis-stat
- Redis-faina
- RedisLive
- zabbix

也有一些命令工具：

- benchmark

> 测试当前服务器的并发性能
>
> ```properties
> redis-benchmark [-h ] [-p ] [-c ] [-n <requests]> [-k ]
> ```
>
> 范例1：50个连接，10000次请求对应的性能
>
> ```properties
> redis-benchmark
> ```
>
> 范例2：100个连接，5000次请求对应的性能
>
> ```properties
> redis-benchmark -c 100 -n 5000
> ```
>
> ![img](..\img\29-ff859b17.png)

- redis-cli

   monitor：启动服务器调试信息

> ```properties
> monitor
> ```

```
slowlog：慢日志
```

> 获取慢查询日志
>
> ```properties
> slowlog [operator]
> ```
>
>  get ：获取慢查询日志信息
>
>  len ：获取慢查询日志条目数
>
>  reset ：重置慢查询日志
>
> 相关配置
>
> ```properties
> slowlog-log-slower-than 1000 #设置慢查询的时间下线，单位：微妙
> slowlog-max-len 100	#设置慢查询命令对应的日志显示长度，单位：命令数
> ```
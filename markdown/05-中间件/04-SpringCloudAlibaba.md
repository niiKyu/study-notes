# Spring Cloud Alibaba

官网：https://sca.aliyun.com

官网版本对应：https://sca.aliyun.com/docs/2023/overview/version-explain/?spm=5176.29160081.0.0.74805c72RMeqvD

GitHub中文文档：https://github.com/alibaba/spring-cloud-alibaba/blob/master/README-zh.md

Github版本对应：[https://github.com/alibaba/spring-cloud-alibaba/wiki/版本说明](https://github.com/alibaba/spring-cloud-alibaba/wiki/版本说明)

主要功能：

- **服务限流降级**：默认支持 WebServlet、WebFlux, OpenFeign、RestTemplate、Spring Cloud Gateway, Zuul, Dubbo 和 RocketMQ 限流降级功能的接入，可以在运行时通过控制台实时修改限流降级规则，还支持查看限流降级 Metrics 监控。
- **服务注册与发现**：适配 Spring Cloud 服务注册与发现标准，默认集成了 Ribbon 的支持。
  分布式配置管理：支持分布式系统中的外部化配置，配置更改时自动刷新。
- **消息驱动能力**：基于 Spring Cloud Stream 为微服务应用构建消息驱动能力。
- **分布式事务**：使用`@GlobalTransactional`注解， 高效并且对业务零侵入地解决分布式事务问题。。 
- **阿里云对象存储**：阿里云提供的海量、安全、低成本、高可靠的云存储服务。支持在任何应用、任何时间、任何地点存储和访问任意类型的数据。
- **分布式任务调度**：提供秒级、精准、高可靠、高可用的定时（基于 Cron 表达式）任务调度服务。同时提供分布式的任务执行模型，如网格任务。网格任务支持海量子任务均匀分配到所有 Worker（schedulerx-client）上执行。
- **阿里云短信服务**：覆盖全球的短信服务，友好、高效、智能的互联化通讯能力，帮助企业迅速搭建客户触达通道。

组件：

- **Sentinel**：把流量作为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。
- **Nacos**：一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
- **RocketMQ**：一款开源的分布式消息系统，基于高可用分布式集群技术，提供低延时的、高可靠的消息发布与订阅服务。
- **Dubbo**：Apache Dubbo 是一款高性能 Java RPC 框架。
- **Seata**：阿里巴巴开源产品，一个易于使用的高性能微服务分布式事务解决方案。
- **Alibaba Cloud OSS**: 阿里云对象存储服务（Object Storage Service，简称 OSS），是阿里云提供的海量、安全、低成本、高可靠的云存储服务。您可以在任何应用、任何时间、任何地点存储和访问任意类型的数据。
- **Alibaba Cloud SchedulerX**: 阿里中间件团队开发的一款分布式任务调度产品，提供秒级、精准、高可靠、高可用的定时（基于 Cron 表达式）任务调度服务。
- **Alibaba Cloud SMS**: 覆盖全球的短信服务，友好、高效、智能的互联化通讯能力，帮助企业迅速搭建客户触达通道。

版本锁定

```xml
<dependencyManagement>
    <!--spring-cloud-alibaba-->
    <dependencies>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>2023.0.3.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!--spring-cloud-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2023.0.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Nacos

官方文档：[nacos.io](https://nacos.io)

```txt
Nacos = Eureka + Config + Bus
```

```sh
# linux
sh startup.sh -m standalone
# windows
startup.cmd -m standalone
```

### 服务提供

pom

```xml
<!--SpringCloud Alibaba nacos-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

yml

```yml
server:
  port: 48990
spring:
  application:
    name: nacos-provider
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
```

app

```java
@EnableDiscoveryClient
```

### 服务消费

pom

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    <version>2023.0.3.2</version>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-loadbalancer</artifactId>
    <version>4.1.4</version>
</dependency>
```

yml

```yml
server:
  port: 48992
spring:
  application:
    name: nacos-consumer
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
```

app

```java
@EnableDiscoveryClient
```

RestConfig

```java
@Configuration
public class RestConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

feign

```java
@FeignClient(value = "nacos-provider")
public interface GoodsFeign {
    @GetMapping("echo/{string}")
    String hello(@PathVariable String string);
}
```

consumer调用provider

```java
@Resource
GoodsFeign goodsFeign;

@GetMapping("echo/{string}")
public String hello(@PathVariable String string) {
    return goodsFeign.hello(string);
}
```

### 配置中心

以`${spring.applicaiton.name}-${spring.profiles.active}.${file-extension}`查找配置文件，如：`nacos-provider-dev.yaml`

![img](..\img\1713934127132-309431d5-f4c7-4c9a-ada6-52081c07c12b.webp)

pom

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

yml

```yml
server:
  port: 48990
spring:
  application:
    name: nacos-provider
  profiles:
    active: dev
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
        # group:
        # namespace: 
  config:
    import: nacos:nacos-provider-dev.yaml?group=DEFAULT_GROUP
```

在使用了配置的类上标明`@RefreshScope`即可自动重载配置

```java
@RestController
@RefreshScope
public class GoodsController {
    @Value("${ydlclass}")
    String ydlclass;
    @Value("${server.port}")
    String port;
    @GetMapping("echo/{string}")
    public String hello(@PathVariable String string) {
        return "Hello Nacos Discovery " + ydlclass + " " + string + " | " + port;
    }
}
```

### 更换mysql进行持久化

在nacos配置中设置数据库即可使用mysql持久化，默认使用文件系统持久化

```properties
spring.sql.init.platform=mysql
### Count of DB:
db.num=1
### Connect URL of DB:
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user=nacos
db.password=nacos
```

### 集群和持久化配置（重要）

#### Nacos支持三种部署模式

- 单机模式 - 用于测试和单机试用。
- 集群模式 - 用于生产环境，确保高可用。
- 多集群模式 - 用于多数据中心场景。

集群用SLB（Nginx）（使用Nginx后只需要访问一个地址）

## Sentinel

**一句话**：就是hystrix的替代！

官网：https://github.com/alibaba/sentinel
中文版：[https://github.com/alibaba/Sentinel/wiki/%E4%BB%8B%E7%BB%8D](https://github.com/alibaba/Sentinel/wiki/介绍)

### 控制台dashboard

下载：https://github.com/alibaba/Sentinel/releases

```sh
java -jar sentinel-dashboard-1.8.8.jar
# http://localhost:8080
```

### 项目接入Sentinel

pom

```xml
<!-- SpringCloud ailibaba nacos-->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <!-- SpringCloud ailibaba sentinel-datasource-nacos 持久化需要用到-->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-datasource-nacos</artifactId>
    </dependency>
    <!-- SpringCloud ailibaba sentinel-->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
```

yml

```yml
server:
  port: 8000

spring:
  application:
    name: cloudalibaba-sentinal-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    sentinel:
      transport:
      	# 控制台地址
        dashboard: localhost:8080
        # 默认8719端口，假如被占用了会自动从8719端口+1进行扫描，直到找到未被占用的 端口
        port: 8719
      # 是否忽略根路径，Sentinel作用粒度
      # true /userapp/api/users/list -> /api/users/list
      # false /userapp/api/users/list -> /userapp/api/users/list
      web-context-unify: false
```

app

```java
@EnableDiscoveryClient
```

访问dashboard即可看到或操作所有接口

### 流量控制

![img](..\img\1713934129265-7b820b1b-bcdf-4d78-8146-7b25cf32d4a9.webp)

- 资源名：唯一名称，默认请求路径
- 针对来源：sentinel可以针对调用者进行限流，填写微服务名，默认default（不区分来源）
- 阈值类型/单机值：
  * QPS（每秒钟的请求数量）：当调用该api就QPS达到阈值的时候，进行限流
  * 线程数．当调用该api的线程数达到阈值的时候，进行限流

- 是否集群：不需要集群
- 流控模式：
  * 直接：api达到限流条件时，直接限流。分为QPS和线程数、
  * 关联：当关联的资到阈值时，就限流自己。别人惹事，自己买单
  * 链路：只记录指定链路上的流量（指定资源从入口资源进来的流量，如果达到阈值，就进行限流）【api级别的针对来源】

- 流控效果：
  * 快速失败：直接抛异常 Blocked by Sentinel (flow limiting)
  * warm up：根据codeFactor（冷加载因子，默认3）的值，从阈值codeFactor，经过预热时长，才达到设置的QPS阈值
  * 排队等待：匀速排队，让请求以均匀的速度通过，阈值类型必须设置为QPS,否则无效

| Field           | 说明                                                         | 默认值                      |
| --------------- | ------------------------------------------------------------ | --------------------------- |
| resource        | 资源名，资源名是限流规则的作用对象                           |                             |
| count           | 限流阈值                                                     |                             |
| grade           | 限流阈值类型，QPS 或线程数模式                               | QPS 模式                    |
| limitApp        | 流控针对的调用来源                                           | default，代表不区分调用来源 |
| strategy        | 调用关系限流策略：直接、链路、关联                           | 根据资源本身（直接）        |
| controlBehavior | 流控效果（直接拒绝 / 排队等待 / 慢启动模式），不支持按调用关系限流 | 直接拒绝                    |

### 熔断降级

![img](..\img\1713934130848-847aeb61-da12-4b15-b7fa-ab6ae3193d9e.webp)

* 慢调用比例 (SLOW_REQUEST_RATIO)：当慢调用的比例大于阈值，自动被熔断。

  经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求响应时间小于设置的慢调用 RT 则结束熔断，若大于设置的慢调用 RT 则会再次被熔断。

* 异常比例 (ERROR_RATIO)：当异常的比例大于阈值，自动被熔断。

  经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。异常比率的阈值范围是 [0.0, 1.0]，代表 0% - 100%。

* 异常数 (ERROR_COUNT)：当单位统计时长内的异常数目超过阈值之后会自动进行熔断。

  经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。

### 热点参数限流

![img](..\img\1713934132544-6e731b85-61db-41ba-b30a-3aa2957e8d72.webp)

很多时候我们希望统计某个热点数据中访问频次最高的数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

要使用热点参数限流功能，需要引入以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-parameter-flow-control</artifactId>
    <version>1.8.4</version>
</dependency>
```

### 系统自适应限流

Sentinel 系统自适应限流从整体维度对应用入口流量进行控制![img](..\img\1713934132810-d31cfd57-ca15-4824-9dc1-608da8c9b8e5.webp)

![img](..\img\1713934132947-58a2b39f-a352-4315-a76f-8aff95c6532b.webp)

### `@SentinelResource`

`@SentinelResource`用于定义资源，并提供可选的异常处理和 fallback 配置项。 

- value：资源名称，必需项（不能为空）
- entryType：entry 类型，可选项（默认为 EntryType.OUT）
- blockHandler / blockHandlerClass: blockHandler 对应处理 BlockException 的函数名称，可选项。blockHandler 函数访问范围需要是 public，返回类型需要与原方法相匹配，参数类型需要和原方法相匹配并且最后加一个额外的参数，类型为 BlockException。blockHandler 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 blockHandlerClass 为对应的类的 Class 对象，注意对应的函数必需为 static 函数，否则无法解析。
- fallback/fallbackClass：fallback 函数名称，可选项，用于在抛出异常的时候提供 fallback 处理逻辑。fallback 函数可以针对所有类型的异常（除了exceptionsToIgnore里面排除掉的异常类型）进行处理。fallback 函数签名和位置要求：

- 返回值类型必须与原函数返回值类型一致；
- 方法参数列表需要和原函数一致，或者可以额外多一个 Throwable 类型的参数用于接收对应的异常。
- fallback 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 fallbackClass 为对应的类的 Class 对象，注意对应的函数必需为 static 函数，否则无法解析。

- defaultFallback（since 1.6.0）：默认的 fallback 函数名称，可选项，通常用于通用的 fallback 逻辑（即可以用于很多服务或方法）。默认 fallback 函数可以针对所有类型的异常（除了exceptionsToIgnore里面排除掉的异常类型）进行处理。若同时配置了 fallback 和 defaultFallback，则只有 fallback 会生效。defaultFallback 函数签名要求：

- 返回值类型必须与原函数返回值类型一致；
- 方法参数列表需要为空，或者可以额外多一个 Throwable 类型的参数用于接收对应的异常。
- defaultFallback 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 fallbackClass 为对应的类的 Class 对象，注意对应的函数必需为 static 函数，否则无法解析。

- exceptionsToIgnore（since 1.6.0）：用于指定哪些异常被排除掉，不会计入异常统计中，也不会进入 fallback 逻辑中，而是会原样抛出。

```java
@SentinelResource(value = "resume",
        blockHandlerClass = CommonBlockHandler.class,
        blockHandler = "handlerBlock2")
```

### 降级

生产者用`@SentinelResource`降级

```java
@SentinelResource(value = "/goods/findById",
        blockHandler = "block_findById",
        fallback = "fallback_findById")
public ResponseEntity<Goods> findById(@PathVariable("id") Integer id) {
    Goods goods = goodsService.findById(id);
    goods.setTitle(goods.getTitle() + " | " + port);
    return ResponseEntity.ok(goods);
}
public ResponseEntity<Goods> block_findById(@PathVariable("id") Integer id, BlockException ex) {
    Goods goods = new Goods(-1, "生产端流控降级", -1.1, -1);
    ex.printStackTrace();
    return ResponseEntity.ok(goods);
}
public ResponseEntity<Goods> fallback_findById(@PathVariable("id") Integer id, Throwable ex) {
    Goods goods = new Goods(-2, "生产端异常降级", -2.2, -2);
    ex.printStackTrace();
    return ResponseEntity.ok(goods);
}
```

消费者用feign降级

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```yml
#前面也已经添加了
#激活Sentinel对Feign的支持
feign:
  sentinel:
    enabled: true
```

```java
@FeignClient(value = "nacos-provider",fallback = GoodsFeignImpl.class)
public interface GoodsFeign {
    @GetMapping("echo/{string}")
    String hello(@PathVariable String string);
}
```

```java
//降级
@Component
public class GoodsFeignImpl implements GoodsFeign{
    @Override
    public Goods findById(Integer id) {
        Goods goods =new Goods();
        goods.setGoodId(-3);
        goods.setPrice(-3);
        goods.setStock(-3);
        goods.setTitle("feign出错之后的特殊对象");

        return goods;
    }
}
```

### 配置持久化

sentinel的流控配置是临时的，所以我们可以把配置持久化到nacos

```xml
<!-- SpringCloud ailibaba sentinel-datasource-nacos 持久化需要用到-->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

```yml
sentinel: 
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848  #nacos
            dataId: ${spring.application.name}
            groupId: DEFAULT_GROUP
            data-type: json
            rule-type: flow
```

nacos添加配置

```json
[
    {
        "resource": "/order/add1/{id}",
        "limitApp": "default",
        "grade": 1,
        "count": 1,
        "strategy": 0,
        "controlBehavior": 0,
        "clusterMode": false
    }
]
```

- resource：资源名称；
- limitApp：来源应用；
- grade：阈值类型，0表示线程数，1表示QPS；
- count：单机阈值；
- strategy：流控模式，0表示直接，1表示关联，2表示链路；
- controlBehavior：流控效果，0表示快速失败，1表示Warm Up，2表示排队等待；
- clusterMode：是否集群

![img](..\img\1713934134635-7fe81a20-6af5-429d-adf3-7c7b91bfe2ea.webp)

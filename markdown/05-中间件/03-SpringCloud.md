# Spring Cloud Eureka

红色不维护。绿色是alibaba一套，推荐使用。![img](..\img\1713934112945-497fc666-8878-4abb-a25f-0b7d2c7db68a.webp)

 cloud与boot版本对应关系![PixPin_2025-04-29_18-09-37](..\img\PixPin_2025-04-29_18-09-37.png)

## 注册中心

### Eureka

父工程pom

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>

<modules>
    <module>eureka-provider</module>
    <module>eureka-consumer</module>
    <module>eureka-server</module>
</modules>

<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

    <!--spring cloud 版本-->
    <spring-cloud.version>2021.0.9</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### eureka-server工程

pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    </dependency>
</dependencies>
```

App

```java
@SpringBootApplication
// 启用EurekaServer
@EnableEurekaServer
public class ServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class,args);
    }
}
```

application.yml

```yml
server:
  port: 48990
spring:
  application:
    name: eureka-server

# eureka 配置
# eureka 一共有4部分 配置
# 1. dashboard:eureka的web控制台配置
# 2. server:eureka的服务端配置
# 3. client:eureka的客户端配置
# 4. instance:eureka的实例配置
eureka:
  instance:
    hostname: localhost # 主机名
  client:
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka # eureka服务端地址，将来客户端使用该地址和eureka进行通信

    register-with-eureka: false # 是否将自己的路径 注册到eureka上。eureka server 不需要的，eureka provider client 需要
    fetch-registry: false # 是否需要从eureka中抓取路径。eureka server 不需要的，eureka consumer client 需要
```

访问`localhost:48990`

![img](..\img\1713934113704-cb288c4a-6daf-48cd-9ce2-98b2b340058a.webp)

#### Provider

pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

App

```java
@EnableEurekaClient
```

application.yml

```yml
server:
  port: 48991
spring:
  application:
    name: eureka-provider
eureka:
  instance:
    hostname: localhost # 主机名
  client:
    service-url:
      defaultZone: http://localhost:48990/eureka # eureka服务端地址，将来客户端使用该地址和eureka进行通信
```

#### Consumer

pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

App

```java
@EnableEurekaClient
```

application.yml

```yml
server:
  port: 48992
spring:
  application:
    name: eureka-consumer
eureka:
  instance:
    hostname: localhost # 主机名
  client:
    service-url:
      defaultZone: http://localhost:48990/eureka # eureka服务端地址，将来客户端使用该地址和eureka进行通信
```

通过从 Eureka Server 中抓取 Provider 地址，完成远程调用

```java
@RestController
@RequestMapping("goods")
public class GoodsController {

    @Resource
    RestTemplate restTemplate;
    @Resource
    DiscoveryClient discoveryClient;

    @GetMapping("{id}")
    public ResponseEntity<Goods> getOne(@PathVariable Integer id) {
        //服务发现
        List<ServiceInstance> instances = discoveryClient.getInstances("EUREKA-PROVIDER");
        if (instances.isEmpty()) {
            return null;
        }
        //通过某个策略拿到一个实例
        ServiceInstance instance = instances.get(0);
        String host = instance.getHost();
        int port = instance.getPort();
        String url = "http://"+ host +":"+ port +"/goods/2";
        System.out.println(url);

        Goods goods = restTemplate.getForObject(url, Goods.class);
        return ResponseEntity.ok(goods);
    }
}
```

#### 高可用

1. 准备两个Eureka Server
2. 分别进行配置，**相互注册**
3. Eureka Client 分别注册到这两个 Eureka Server中

**创建eureka-server1**

```yml
server:
  port: 8761

eureka:
  instance:
    hostname: eureka-server1
  client:
    service-url:
      defaultZone: http://eureka-server2:8762/eureka  # 本来是写自己的地址，现在写了另一个eureka服务地址
    register-with-eureka: true
    fetch-registry: true
spring:
  application:
    name: eureka-server-ha
```

**创建eureka-server2**

```yml
server:
  port: 8762

eureka:
  instance:
    hostname: eureka-server2
  client:
    service-url:
      defaultZone: http://eureka-server1:8761/eureka  # 本来是写自己的地址，现在写了另一个eureka服务地址

    register-with-eureka: true
    fetch-registry: true
spring:
  application:
    name: eureka-server-ha
```

provider，consumer

```yml
server:
  port: 8001

eureka:
  instance:
    hostname: localhost
  client:
    service-url:
      defaultZone: http://eureka-server1:8761/eureka,http://eureka-server2:8762/eureka # 写了2个服务的地址
spring:
  application:
    name: eureka-provider
```

### Zookeeper

服务端server

1 下载：https://zookeeper.apache.org/

2 zoo_sample.cfg 修改为 zoo.cfg，创建data目录，并修改dataDir配置

3 cmd输入 `bin/zkServer.cmd`

客户端provider和consumer

pom

```xml
<dependencies>
    <!--springcloud 整合 zookeeper 组件-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <!--zk发现-->
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <!--引入你上面下载的zk版本-->
        <version>3.4.9</version>
        <exclusions>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

yml

```yml
server:
  port: 8004

spring:
  application:
    name: zookeeper-provider
  cloud:
    zookeeper:
      connect-string: 127.0.0.1:2181 # zk地址
```

app

```java
@EnableDiscoveryClient //开启发现客户端
```

consumer获取provider地址

```java
List<ServiceInstance> instances = discoveryClient.getInstances("zookeeper-provider");
// zk为spring.application.name
// eureka为spring.application.name大写
```

## Ribbon负载均衡服务调用

eureka依赖已经集成了Ribbon依赖，所以可以不引用

```xml
<!--Ribbon的依赖-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
 </dependency>
```

![img](..\img\1713934115678-8db96f66-560b-4f5c-8a5c-86e7560985d4.webp)

2.消费者声明restTemplate时`@LoadBalanced`

3.restTemplate请求远程服务时，ip端口替换为服务名

```java
String url="http://EUREKA-PROVIDER/goods/findById/"+id;
Goods goods = restTemplate.getForObject(url, Goods.class);
```

### ribbon 负载均衡策略

| **内置负载均衡规则类**    | **规则描述**                                                 |
| ------------------------- | ------------------------------------------------------------ |
| RoundRobinRule            | 简单轮询服务列表来选择服务器。它是Ribbon默认的负载均衡规则。 |
| AvailabilityFilteringRule | 对以下两种服务器进行忽略：（1）在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加。注意：可以通过修改配置loadbalancer..connectionFailureCountThreshold来修改连接失败多少次之后被设置为短路状态。默认是3次。（2）并发数过高的服务器。如果一个服务器的并发连接数过高，配置了AvailabilityFilteringRule规则的客户端也会将其忽略。并发连接数的上线，可以由客户端的..ActiveConnectionsLimit属性进行配置。 |
| WeightedResponseTimeRule  | 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择服务器，这个权重值会影响服务器的选择。 |
| ZoneAvoidanceRule         | 以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。 |
| BestAvailableRule         | 忽略哪些短路的服务器，并选择并发数较低的服务器。             |
| RandomRule                | 随机选择一个可用的服务器。                                   |
| Retry                     | 重试机制的选择逻辑                                           |

#### 更换策略

默认使用轮询

```java
@Configuration
public class MyRule {
    @Bean
    public IRule rule(){
        return new RandomRule();
    }
}
```

##### 注解方式

app

```java
@RibbonClient(name ="EUREKA-PROVIDER",configuration = MyRule.class)
```

##### yml方式

```yml
EUREKA-PROVIDER: #远程服务名
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule #策略
```

## OpenFeign服务接口调用

Feign 是一个声明式的 REST 客户端，它用了**基于接口的注解方式**，很方便实现客户端像调用本地接口方法一样，进行远程调用。让开发人员调用时不需要关心ip和端口。Feign 底层依赖于 Ribbon 实现负载均衡和远程调用

pom

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

feign

```java
@FeignClient("EUREKA-PROVIDER")
public interface GoodsFeign {
    @GetMapping("/goods/findById/{id}")
    public Goods findById(@PathVariable("id") Integer id);
}
```

app

```java
@EnableFeignClients
```

controller调用

```java
@Autowired
GoodsFeign goodsFeign;

@GetMapping("/add/{id}")
public Goods add(@PathVariable("id") Integer id){
    Goods goods = goodsFeign.findById(id);
    return goods;
}
```

### 超时设置

```yml
# 设置Ribbon的超时时间
ribbon:
  ConnectTimeout: 1000 # 连接超时时间 默认1s
  ReadTimeout: 3000 # 逻辑处理的超时时间 默认1s
```

连接超时![image-20250507163009320](..\img\image-20250507163009320.png)

逻辑处理超时![img](..\img\1713934116225-6f50c321-9237-42a4-bbf4-9514033019e0.webp)

### 日志记录

1.Feign 只能记录 debug 级别的日志信息。

```yml
# 设置当前的日志级别 debug，feign只支持记录debug级别的日志
logging:
  level:
    com.ydlclass: debug
```

FeignLogConfig

```java
@Configuration
public class FeignLogConfig {
    /*
        NONE,不记录
        BASIC,记录基本的请求行，响应状态码数据
        HEADERS,记录基本的请求行，响应状态码数据，记录响应头信息
        FULL;记录完成的请求 响应数据
     */
    @Bean
    public Logger.Level level(){
        return Logger.Level.FULL;
    }
}
```

启用

```java
@FeignClient(value = "FEIGN-PROVIDER",configuration = FeignLogConfig.class)
```

## Hystrix断路器 （豪猪）-保险丝

重点：能让服务的调用方，够快的知道被调方挂了！不至于说让用户在等待。

Hystix 是 Netflix 开源的一个延迟和容错库，用于隔离访问远程服务、第三方库，防止出现级联失败（雪崩）。

雪崩：一个服务失败，导致整条链路的服务都失败的情形。

**Hystix 主要功能**

1. **隔离**

2. **降级**

3. **熔断**

4. **限流**

### 服务降级

当服务提供异常、超时返回特殊结果

#### 服务提供方

pom

```xml
<!-- hystrix -->
         <dependency>
             <groupId>org.springframework.cloud</groupId>
             <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
         </dependency>
```

方法

```java
/** 定义降级方法   返回特殊对象
 *  1方法的返回值要和原方法一致
 *  2方法参数和原方法一样
 */
public Goods findById_fallback(Integer id){
    Goods goods=new Goods();
    goods.setGoodId(-1);
    goods.setTitle("provider提供方降级！");
    goods.setPrice(-9.9);
    goods.setStock(-10);

    return goods;
}
```

使用`@HystrixCommand`注解配置降级方法 

```java
@GetMapping("/findById/{id}")
@HystrixCommand(fallbackMethod = "findById_fallback",commandProperties = {
		//设置Hystrix的超时时间，默认1s
    	//下面2种情况会执行fallbackMethod
    	//1. 当抛异常值
    	//2. 方法执行时间大于超时时间，且客户端等待时间（OpenFeign逻辑处理超时时间）大于超时时间
//如果客户端等待时间小于等于超时时间，客户端将报错（即OpenFeign逻辑处理超时，客户端收不到fallbackMethod结果）
        @HystrixProperty(name="execution.isolation.thread.timeoutInMilliseconds",value = "3000")
})
public Goods findById(@PathVariable("id") Integer id){
    Goods goods = goodsService.findById(id);
    goods.setTitle(goods.getTitle()+"|端口号："+port);

    return goods;
}
```

app

```java
@EnableCircuitBreaker
```

#### 服务消费方

当服务提供无响应（网络异常），自己创建特殊结果

feign 组件已经集成了 hystrix 组件。![img](..\img\1713934117542-2ba87c4c-ee2c-4184-bf50-8bcab5743ffb.webp)

GoodsFeignClientFallback

```java
@Component
public class GoodsFeignCallback implements GoodsFeign{
    @Override
    public Goods findById(Integer id) {
        Goods goods=new Goods();
        goods.setGoodId(-2);
        goods.setTitle("调用方降级了！");
        goods.setPrice(-5.5);
        goods.setStock(-5);
        return goods;
    }
}
```

GoodsFeignClient，在`@FeignClient`注解中使用 fallback 属性设置降级处理类。 

```java
@FeignClient(value = "EUREKA-PROVIDER",configuration = FeignLogConfig.class,fallback = GoodsFeignCallback.class)
public interface GoodsFeign {
    @GetMapping("/goods/findById/{id}")
    public Goods findById(@PathVariable("id") Integer id);
}
```

yml

```yml
# 开启feign对hystrix的支持
feign:
  hystrix:
    enabled: true
```

### 熔断

Hyst rix 熔断机制，用于监控微服务调用情况，当失败的情况达到预定的阈值（5秒失败20次），会打开断路器，拒绝所有请求（所有请求都会走fallbackMethod），直到服务恢复正常为止。

```java
@HystrixCommand(fallbackMethod = "findOne_fallback",commandProperties = {
        //设置Hystrix的超时时间，默认1s
        @HystrixProperty(name="execution.isolation.thread.timeoutInMilliseconds",value = "3000"),
        //监控时间 默认5000 毫秒
        @HystrixProperty(name="circuitBreaker.sleepWindowInMilliseconds",value = "5000"),
        //失败次数。默认20次
        @HystrixProperty(name="circuitBreaker.requestVolumeThreshold",value = "20"),
        //失败率 默认50%
        @HystrixProperty(name="circuitBreaker.errorThresholdPercentage",value = "50")
})
```

### 熔断监控-运维

Hystrix 提供了 Hystrix-dashboard 功能，用于实时监控微服务运行状态。但是Hystrix-dashboard只能监控一个微服务。Netflix 还提供了 Turbine ，进行聚合监控。

## Gateway新一代网关

功能：路由+过滤

### 路由

pom

```xml
<dependencies>
    <!--引入gateway 网关-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <!-- eureka-client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

app

```java
@SpringBootApplication
@EnableEurekaClient
public class ApiGatewayApp {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApp.class,args);
    }
}
```

yml

```yml
server:
  port: 80

spring:
  application:
    name: api-gateway-server

  cloud:
    # 网关配置
    gateway:
      # 路由配置：转发规则
      routes: #集合。
      # id: 唯一标识。默认是一个UUID
      # uri: 转发路径
      # predicates: 条件,用于请求网关路径的匹配规则
      # filters：配置局部过滤器的

      - id: eureka-provider
        # 静态路由
        # uri: http://localhost:8001/
        # 动态路由
        uri: lb://GATEWAY-PROVIDER
        predicates:
        - Path=/goods/**	# localhost:80/goods/** -> http://GATEWAY-PROVIDER/goods/**
        filters:
        - AddRequestParameter=username,zhangsan

      - id: eureka-consumer
        # uri: http://localhost:9000
        uri: lb://GATEWAY-CONSUMER
        predicates:
        - Path=/order/**
        # 微服务名称配置
      discovery:
      # 一般不开启 
      # http://localhost/eureka-provider/goods/** -> http://GATEWAY-PROVIDER/goods/**
        locator:
          enabled: true # 设置为true 请求路径前可以添加微服务名称
          lower-case-service-id: true # 允许为小写
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

### 过滤器

两个维度：
内置过滤器 自定义过滤器
局部过滤器 全局过滤器

内置过滤器、局部过滤器：

```yml
- id: gateway-provider
     #uri: http://localhost:8001/
     uri: lb://GATEWAY-PROVIDER
     predicates:
     - Path=/goods/**
        filters:
            - AddResponseHeader=foo, bar
```

内置过滤器 全局过滤器： route同级

```yml
default-filters:
        - AddResponseHeader=yld,itlils
```

**拓展：**

内置的过滤器工厂

这里简单将Spring Cloud Gateway内置的所有过滤器工厂整理成了一张表格。如下：

| 过滤器工厂                  | 作用                                                         | 参数                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| AddRequestHeader            | 为原始请求添加Header                                         | Header的名称及值                                             |
| AddRequestParameter         | 为原始请求添加请求参数                                       | 参数名称及值                                                 |
| AddResponseHeader           | 为原始响应添加Header                                         | Header的名称及值                                             |
| DedupeResponseHeader        | 剔除响应头中重复的值                                         | 需要去重的Header名称及去重策略                               |
| Hystrix                     | 为路由引入Hystrix的断路器保护                                | HystrixCommand的名称                                         |
| FallbackHeaders             | 为fallbackUri的请求头中添加具体的异常信息                    | Header的名称                                                 |
| PrefixPath                  | 为原始请求路径添加前缀                                       | 前缀路径                                                     |
| PreserveHostHeader          | 为请求添加一个preserveHostHeader=true的属性，路由过滤器会检查该属性以决定是否要发送原始的Host | 无                                                           |
| RequestRateLimiter          | 用于对请求限流，限流算法为令牌桶                             | keyResolver、rateLimiter、statusCode、denyEmptyKey、emptyKeyStatus |
| RedirectTo                  | 将原始请求重定向到指定的URL                                  | http状态码及重定向的url                                      |
| RemoveHopByHopHeadersFilter | 为原始请求删除IETF组织规定的一系列Header                     | 默认就会启用，可以通过配置指定仅删除哪些Header               |
| RemoveRequestHeader         | 为原始请求删除某个Header                                     | Header名称                                                   |
| RemoveResponseHeader        | 为原始响应删除某个Header                                     | Header名称                                                   |
| RewritePath                 | 重写原始的请求路径                                           | 原始路径正则表达式以及重写后路径的正则表达式                 |
| RewriteResponseHeader       | 重写原始响应中的某个Header                                   | Header名称，值的正则表达式，重写后的值                       |
| SaveSession                 | 在转发请求之前，强制执行WebSession::save操作                 | 无                                                           |
| secureHeaders               | 为原始响应添加一系列起安全作用的响应头                       | 无，支持修改这些安全响应头的值                               |
| SetPath                     | 修改原始的请求路径                                           | 修改后的路径                                                 |
| SetResponseHeader           | 修改原始响应中某个Header的值                                 | Header名称，修改后的值                                       |
| SetStatus                   | 修改原始响应的状态码                                         | HTTP 状态码，可以是数字，也可以是字符串                      |
| StripPrefix                 | 用于截断原始请求的路径                                       | 使用数字表示要截断的路径的数量                               |
| Retry                       | 针对不同的响应进行重试                                       | retries、statuses、methods、series                           |
| RequestSize                 | 设置允许接收最大请求包的大小。如果请求包大小超过设置的值，则返回 413 Payload Too Large | 请求包大小，单位为字节，默认值为5M                           |
| ModifyRequestBody           | 在转发请求之前修改原始请求体内容                             | 修改后的请求体内容                                           |
| ModifyResponseBody          | 修改原始响应体的内容                                         | 修改后的响应体内容                                           |
| Default                     | 为所有路由添加过滤器                                         | 过滤器工厂名称及值                                           |

**Tips：**每个过滤器工厂都对应一个实现类，并且这些类的名称必须以GatewayFilterFactory结尾，这是Spring Cloud Gateway的一个约定，例如AddRequestHeader对应的实现类为AddRequestHeaderGatewayFilterFactory。

------

#### 自定义过滤器

1、自定义 局部过滤器（麻烦，不常用），参考下面官方类

```java
public class StripPrefixGatewayFilterFactory extends AbstractGatewayFilterFactory<StripPrefixGatewayFilterFactory.Config>
```

2、自定义 全局过滤器

需求：1黑客ip，直接给你拒接掉。2某些请求路径 如“goods/findById”,危险操作，记录日志。

1. 定义类实现 GlobalFilter 和 Ordered接口
2. 复写方法
3. 完成逻辑处理

IpFilter

```java
@Component
public class IpFilter implements GlobalFilter, Ordered {

    //写业务逻辑
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //1黑客ip，直接给你拒接掉。

        //拿到请求和响应，为所欲为
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        InetSocketAddress remoteAddress = request.getRemoteAddress();
        String hostName = remoteAddress.getHostName();
        System.out.println(hostName);
        InetAddress address = remoteAddress.getAddress();
        String hostAddress = address.getHostAddress();
        System.out.println(hostAddress);
        String hostName1 = address.getHostName();
        System.out.println(hostName1);

        if (hostAddress.equals("192.168.31.11")) {
            //拒绝
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }

        //走完了，该到下一个过滤器了
        return chain.filter(exchange);
    }

    //返回数值，越小越先执行
    @Override
    public int getOrder() {
        return 0;
    }
}
```

UrlFilter

```java
@Component
public class UrlFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //某些请求路径 如“goods/findById”,危险操作，记录日志。

        //拿到请求和响应，为所欲为
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        URI uri = request.getURI();
        String path = uri.getPath();
        System.out.println(path);

        if(path.contains("goods/findById")){
            //打日志
            System.out.println("path很危险！");
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 1;
    }
}
```

-----

下面章节不重要，超大型公司才会用到

| 组件          | 作用                                                         |
| ------------- | ------------------------------------------------------------ |
| config-server | 将微服务配置集中存在git仓库                                  |
| actuator      | 配合配置中心重载单个微服务的配置                             |
| Bus           | 使用RabbitMQ或kafuka+actuator批量重载微服务的配置            |
| Stream        | 类似JDBC可以快速切换mysql和orecal，使用Stream可以切换RabbitMQ和kafuka（只支持这两） |
| Sleuth+zipkin | 微服务的调用链路的可视化，前者链路收集、后者链路展现         |

## 分布式配置中心

![img](..\img\1713934120002-8571b138-ea85-49f1-8f83-9e928795729d.webp)

### config-server

1. 使用gitee创建远程仓库，上传配置文件config-dev.yml
2. 搭建 config-server 模块ConfigServerApp

```java
@SpringBootApplication
@EnableConfigServer // 启用config server功能
public class ConfigServerApp {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApp.class,args);
    }
}
```

3. pom

```xml
<!-- config-server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
        </dependency>
```

4. yml

```yml
server:
  port: 9527

spring:
  application:
    name: config-server
  # spring cloud config
  cloud:
    config:
      server:
        # git 的 远程仓库地址
        git:
          uri: https://gitee.com/ydlclass_cch/ydlclass-configs.git
      label: master # 分支配置
```

`http://localhost:9527/master/provider-dev.yml`= 访问git仓库master分支下的`provider-dev.yml`

### config-client

1. 导入 starter-config 依赖

```xml
<!--config client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
```

2. 配置config server 地址，读取配置文件名称等信息bootstrap.yml

```yml
# 配置config-server地址
# 配置获得配置文件的名称等信息
spring:
  cloud:
    config:
      # 配置config-server地址
      uri: http://localhost:9527
      # 配置获得配置文件的名称等信息
      name: provider
      profile: dev # provider-dev.yml
      label: master # 分支
      # http://localhost:9527/${label}/${provider}-${dev}.yml
```

3. 获取配置值（git仓库中配置文件的值）

```java
@Value("${ydlclass}")
private String ydlclass;

goods.setTitle(goods.getTitle()+"|端口号："+port+"|ydlclass"+ydlclass);
```

### Config 客户端刷新

1. 在 config 客户端引入 actuator 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

2. 获取配置信息类上（如使用了`@Value`的类），添加 `@RefreshScope`注解

3. 添加配置bootstrap.yml

```yml
management:
  endpoints:
    web:
      exposure:
        include: '*'
```

4.  使用POST请求访问`http://localhost:8000/actuator/refresh`即可主动重载配置

### Config 集成Eureka

上面所述配置中心的地址是写死的，使用Eureka变为动态地址

#### config-client

从eureka获取配置中心的地址

pom

```xml
<!-- eureka-client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

app

```java
@EnableEurekaClient
```

bootstrap.yml

```yml
# 配置config-server地址
# 配置获得配置文件的名称等信息
spring:
  cloud:
    config:
      # 配置config-server地址
      #uri: http://localhost:9527
      # 配置获得配置文件的名称等信息
      name: config # 文件名
      profile: dev # profile指定，  config-dev.yml
      label: master # 分支
      discovery:
        enabled: true
        service-id: CONFIG-SERVER

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

#### config-server

将配置中心注册到eureka

pom

```xml
<!-- eureka-client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

app

```java
@EnableEurekaClient
```

yml

```yml
eureka:
   client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

## Bus消息总线

## Stream消息驱动

## Sleuth分布式请求链路追踪
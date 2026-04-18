# SpringBoot

## 使用

### yml语法

```yml
msg1: 'hello \n world'  # 单引忽略转义字符
msg2: "hello \n world"  # 双引识别转义字符
```

**@ConfigurationProperties**将yml配置的属性直接变成一个bean

```yml
person:
  name: itlils
  age: 18
  address:
    - beijing
    - shanghai
```

```java
@ConfigurationProperties(prefix = "person")
public class Person {
    private String name = "";
    private int age = 0;
    private String[] address;
}
```

```java
@Configuration
//将Person使用@Import注入容器
@EnableConfigurationProperties(Person.class)
public class PersonConfiguration {
    @Bean			//直接获取
    public Object xxx(Person person) {
        return new xxx(person.getName());
    }
}
```

### 多环境

![PixPin_2025-03-20_09-59-24](..\img\PixPin_2025-03-20_09-59-24.png)

```sh
# 给一个profiles值，然后使用内部配置文件
java -jar xxx.jar --spring.profiles.acive=prod
# 直接使用外部配置文件
java -jar myproject.jar --spring.config.location=d://application.properties
```

## 高级

### 条件注入

```java
@Bean
@ConditionalOnBean(RedisTemplate.class)
@ConditionalOnMissingBean(RedisTemplate.class)				//如果没有这个bean就注入
@ConditionalOnProperty(name = "ydlclass", value = "itlils")	// 如果有这个配置就注入
public User user(){
```

```java
@Configuration
@ConditionalOnBean(RedisTemplate.class)
@ConditionalOnMissingBean								//如果没有这个bean就注入，可以不传值
@ConditionalOnProperty(name = "ydlclass", value = "itlils")	// 如果有这个配置就注入
public class AppConfig {
```

为什么引了redis起步依赖，就能直接使用redistemplate？

springboot中的autoconfig工程里把常用的对象的配置类都写好了，这些配置类使用了@ConditionOnClass，@ConditionOnMissionBean等注解，只要工程中，引入了相关起步依赖，这些对象在我们本项目的容器中就有了

![img](..\img\1713932996676-6d53530f-fcc4-486d-800b-20a9d0031cd3.webp)

面试题：springboot 自动配置原理？

![img](..\img\1713932997334-8c16946e-fa15-4965-a65a-b21210ab8c40.png)

- @EnableAutoConfiguration 注解内部使用 @Import(AutoConfigurationImportSelector.**class**)来加载配置类。
- 配置文件位置：META-INF/spring.factories，该配置文件中定义了大量的配置类，当 SpringBoot 应用启动时，会自动加载这些配置类，初始化Bean
- 并不是所有的Bean都会被初始化，在配置类中使用Condition来加载满足条件的Bean

### 自定义starter实现（不重要）

模仿mybatis起步依赖，包括`spring-boot-starter`和`spring-boot-autoconfigure`2个包，前者只需要一个pom文件管理依赖。后者编写配置类

**创建redis-spring-boot-autoconfigure配置工程**

创建RedisProperties配置文件参数绑定类

```java
@ConfigurationProperties(prefix = "redis")
public class RedisProperties {

    private String host = "localhost";
    private int port = 6379;


    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }
}
```

创建RedisAutoConfiguration自动配置类

```java
@Configuration
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {

    /**
     * 提供Jedis的bean
     */
    @Bean
    public Jedis jedis(RedisProperties redisProperties) {
        return new Jedis(redisProperties.getHost(), redisProperties.getPort());
    }
}
```

在resource目录下创建META-INF文件夹并创建spring.factories

注意：”\ “是换行使用的

```text
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.ydlclass.redis.config.RedisAutoConfiguration
```

### SpringBoot事件

![PixPin_2025-03-21_16-11-39](..\img\PixPin_2025-03-21_16-11-39-1742544717405-2.png)

MyApplicationRunner

```java
@Component
public class MyApplicationRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunner --- run");
    }
}
```

MyCommandLineRunner

```java
@Component
public class MyCommandLineRunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("CommandLineRunner --- run");
    }
}
```

MyApplicationContextInitializer(需要META-INF/spring.factories)

```properties
org.springframework.context.ApplicationContextInitializer=com.ydlclass.listener.MyApplicationContextInitializer
```

```java
public class MyApplicationContextInitializer implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        System.out.println("ApplicationContextInitializer --- initialize");
    }
}
```

MySpringApplicationRunListener(需要META-INF/spring.factories和构造器)

```properties
org.springframework.boot.SpringApplicationRunListener=com.ydlclass.listener.MySpringApplicationRunListener
```

```java
public class MySpringApplicationRunListener implements SpringApplicationRunListener {
    public MySpringApplicationRunListener(SpringApplication application, String[] args) {
    }
    @Override
    public void starting(ConfigurableBootstrapContext bootstrapContext) {
        System.out.println("SpringApplicationRunListener --- starting");
    }
    @Override
    public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext, ConfigurableEnvironment environment) {
        System.out.println("SpringApplicationRunListener --- environmentPrepared");
    }
    @Override
    public void contextPrepared(ConfigurableApplicationContext context) {
        System.out.println("SpringApplicationRunListener --- contextPrepared");
    }
    @Override
    public void contextLoaded(ConfigurableApplicationContext context) {
        System.out.println("SpringApplicationRunListener --- contextLoaded");
    }
    @Override
    public void started(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("SpringApplicationRunListener --- started");
    }
    @Override
    public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("SpringApplicationRunListener --- ready");
    }
    @Override
    public void failed(ConfigurableApplicationContext context, Throwable exception) {
        System.out.println("SpringApplicationRunListener --- failed");
    }
}
```

### 监控-运维

#### 监控-actuator基本使用

①导入依赖坐标

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
# 开关
management.endpoint.health.show-details=always
# 开启所有详细信息
management.endpoints.web.exposure.include=*
```

②访问`http://localhost:8080/acruator`

#### admin图形化界面使用

需要启动两个服务，客户端(Client)和服务端(Server)。

**admin-server：**

①创建 admin-server 模块

②导入依赖坐标 admin-starter-server

![img](..\img\1713932997744-b6c2bcd0-6199-40e6-ba8f-8faf6081023c.webp)

③在引导类上启用监控功能@EnableAdminServer

```java
@EnableAdminServer
@SpringBootApplication
public class SpringbootAdminServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringbootAdminServerApplication.class, args);
    }
}
```

**admin-client：**

①创建 admin-client 模块

②导入依赖坐标 admin-starter-client

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
</dependency>
```

③配置相关信息：server地址等

```properties
# 服务端admin.server地址
spring.boot.admin.client.url=http://localhost:9000

# 开关
management.endpoint.health.show-details=always
# 开启所有详细信息
management.endpoints.web.exposure.include=*
```


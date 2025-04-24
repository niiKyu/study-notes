# Activiti

官方网站：https://www.activiti.org

## Activit如何使用

1. 创建springboot项目
   `activiti8.3` + `java21`
2. 添加指定仓库

```xml
<!--可不加，activiti本身是一个庞大的系统，存在着众多依赖。虽然这一步不是必须的，但是强烈建议添加上。-->
<dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.activiti</groupId>
        <artifactId>activiti-dependencies</artifactId>
        <version>8.3.0</version>
        <scope>import</scope>
        <type>pom</type>
      </dependency>
    </dependencies>
</dependencyManagement>
<!--仓库-->
<repositories>
  <repository>
    <id>activiti-releases</id>
    <url>https://artifacts.alfresco.com/nexus/content/repositories/activiti-releases</url>
  </repository>
</repositories>
```

3. 添加activiti

```xml
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter</artifactId>
    <version>8.3.0</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

完整pom

```xml
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <lombok.version>1.18.36</lombok.version>
    <mysql-connector-j.version>8.3.0</mysql-connector-j.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.activiti</groupId>
        <artifactId>activiti-spring-boot-starter</artifactId>
        <version>8.3.0</version>
    </dependency>

    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>${mysql-connector-j.version}</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
    </dependency>

</dependencies>

<repositories>
    <repository>
        <id>activiti-releases</id>
        <url>https://artifacts.alfresco.com/nexus/content/repositories/activiti-releases</url>
    </repository>
</repositories>
```

数据库配置

```yml
server:
  port: 8088
  servlet:
    context-path: /admin
spring:
  datasource:
    url: jdbc:mysql://192.168.169.130:3306/activiti?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf8&useSSL=false&useServerPrepStmts=true&cachePrepStmts=true
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: Cirno760
  activiti:
    database-schema-update: true
    db-history-used: true
    history-level: full
    check-process-definitions: true

```

关于 *processEngineConfiguration* 中的 **databaseSchemaUpdate****参数，**通过此参数设计 activiti数据表的处理策略，参数如下：
false（默认）：检查数据库表的版本和依赖库的版本， 如果版本不匹配就抛出异常。
true: 构建流程引擎时，执行检查，如果需要就执行更新。 如果表不存在，就创建。
create-drop: 构建流程引擎时创建数据库表， 关闭流程引擎时删除这些表。
drop-create：先删除表再创建表。
create: 构建流程引擎时创建数据库表， 关闭流程引擎时不删除这些表。

4. 配置spring security

```java
package org.openoa.antflow_future.config;
 
import org.activiti.engine.impl.util.ProcessDefinitionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
 
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
 
@Configuration
public class AntFlowSecurityConfiguration {
    private Logger logger = LoggerFactory.getLogger(AntFlowSecurityConfiguration.class);
    @Bean
    public UserDetailsService myUserDetailsService() {
        InMemoryUserDetailsManager inMemoryUserDetailsManager = new InMemoryUserDetailsManager();
        //这里添加用户，后面处理流程时用到的任务负责人，需要添加在这里
        String[][] usersGroupsAndRoles = {
                {"jack", "password", "ROLE_ACTIVITI_USER", "GROUP_activitiTeam"},
                {"rose", "password", "ROLE_ACTIVITI_USER", "GROUP_activitiTeam"},
                {"tom", "password", "ROLE_ACTIVITI_USER", "GROUP_activitiTeam"},
                {"other", "password", "ROLE_ACTIVITI_USER", "GROUP_otherTeam"},
                {"system", "password", "ROLE_ACTIVITI_USER"},
                {"admin", "password", "ROLE_ACTIVITI_ADMIN"},
        };
 
        for (String[] user : usersGroupsAndRoles) {
            List<String> authoritiesStrings = Arrays.asList(Arrays.copyOfRange(user, 2, user.length));
            logger.info("> Registering new user: " + user[0] + " with the following Authorities[" + authoritiesStrings + "]");
            inMemoryUserDetailsManager.createUser(new User(user[0], passwordEncoder().encode(user[1]),
                    authoritiesStrings.stream().map(s -> new SimpleGrantedAuthority(s)).collect(Collectors.toList())));
        }

        return inMemoryUserDetailsManager;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

5. 添加工具类

```java
package org.openoa.antflow_future.util;
 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
 
import java.util.Collection;
 
 
@Component
public class SecurityUtil {
    private Logger logger = LoggerFactory.getLogger(SecurityUtil.class);
 
    @Autowired
    @Qualifier("myUserDetailsService")
    private UserDetailsService userDetailsService;
 
    public void logInAs(String username) {
        UserDetails user = userDetailsService.loadUserByUsername(username);
 
        if (user == null) {
            throw new IllegalStateException("User " + username + " doesn't exist, please provide a valid user");
        }
        logger.info("> Logged in as: " + username);
 
        SecurityContextHolder.setContext(
                new SecurityContextImpl(
                        new Authentication() {
                            @Override
                            public Collection<? extends GrantedAuthority> getAuthorities() {
                                return user.getAuthorities();
                            }
                            @Override
                            public Object getCredentials() {
                                return user.getPassword();
                            }
                            @Override
                            public Object getDetails() {
                                return user;
                            }
                            @Override
                            public Object getPrincipal() {
                                return user;
                            }
                            @Override
                            public boolean isAuthenticated() {
                                return true;
                            }
                            @Override
                            public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException { }
                            @Override
                            public String getName() {
                                return user.getUsername();
                            }
                        }));
        org.activiti.engine.impl.identity.Authentication.setAuthenticatedUserId(username);
    }
}
```

6. 启动项目
   启动项目后会自动创建mysql表

## 数据库表的命名规则

**官网地址：**https://www.activiti.org/userguide/#creatingDatabaseTable

### a、表前缀说明

- act_ge_ 通用数据表，ge是general的缩写
- act_hi_ 历史数据表，hi是history的缩写，对应 **HistoryService** 接口
- act_id_ 身份数据表，id是identity的缩写，对应 **IdentityService** 接口
- act_re_ 流程存储表，re是repository的缩写，对应 **RepositoryService** 接口，存储流程部署和流程定义等静态数据
- act_ru_ 运行时数据表，ru是runtime的缩写，对应 **RuntimeService** 接口和 **TaskService** 接口，存储流程实例和用户任务等动态数据

### b、Activiti 数据表清单:

| **表分类**       | **表名**            | **备注说明**                                                 |
| ---------------- | ------------------- | ------------------------------------------------------------ |
| **一般数据**     | ACT_GE_BYTEARRAY    | 流程定义的bpmn和png文件                                      |
|                  | ACT_GE_PROPERTY     | 系统相关属性                                                 |
| **流程历史记录** | ACT_HI_ACTINST      | 历史的流程实例                                               |
|                  | ACT_HI_ATTACHMENT   | 历史的流程附件                                               |
|                  | ACT_HI_COMMENT      | 历史的说明性信息                                             |
|                  | ACT_HI_DETAIL       | 历史的流程运行中的细节信息                                   |
|                  | ACT_HI_IDENTITYLINK | 历史的流程运行过程中用户关系                                 |
|                  | ACT_HI_PROCINST     | 历史的流程实例                                               |
|                  | ACT_HI_TASKINST     | 历史的任务实例                                               |
|                  | ACT_HI_VARINST      | 历史的流程实例变量表                                         |
| 用户组表         | ACT_ID_GROUP        | 身份信息-组信息                                              |
|                  | ACT_ID_INFO         | 身份信息-信息                                                |
|                  | ACT_ID_MEMBERSHIP   | 身份信息-用户和组关系的中间表                                |
|                  | ACT_ID_USER         | 身份信息-用户信息                                            |
| **流程定义表**   | ACT_RE_DEPLOYMENT   | 流程定义部署表                                               |
|                  | ACT_RE_MODEL        | 模型信息                                                     |
|                  | ACT_RE_PROCDEF      | 流程定义信息                                                 |
| **运行实例表**   | ACT_RU_EVENT_SUBSCR | 运行时事件                                                   |
|                  | ACT_RU_EXECUTION    | 运行时流程执行实例                                           |
|                  | ACT_RU_IDENTITYLINK | 运行时参与者的用户信息                                       |
|                  | ACT_RU_JOB          | 运行时作业                                                   |
|                  | ACT_RU_TASK         | 运行时任务                                                   |
|                  | ACT_RU_VARIABLE     | 流程运行时变量表，记录当前流程可使用的变量，包括 global 和 local |

## Activiti架构

![api.services](..\img\api.services.png)

```java
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();

RuntimeService runtimeService = processEngine.getRuntimeService();
RepositoryService repositoryService = processEngine.getRepositoryService();
TaskService taskService = processEngine.getTaskService();
ManagementService managementService = processEngine.getManagementService();
IdentityService identityService = processEngine.getIdentityService();
HistoryService historyService = processEngine.getHistoryService();
FormService formService = processEngine.getFormService();
DynamicBpmnService dynamicBpmnService = processEngine.getDynamicBpmnService();
```

**注意**：在新版本中，我们通过实验可以发现 IdentityService，FormService 两个 Serivce 都已经删除了。所以后面我们对于这两个 Service 也不讲解了，但老版本中还是有这两个 Service，同学们需要了解一下。

### activiti.cfg.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                    http://www.springframework.org/schema/beans/spring-beans.xsd
http://www.springframework.org/schema/contex
http://www.springframework.org/schema/context/spring-context.xsd
http://www.springframework.org/schema/tx
http://www.springframework.org/schema/tx/spring-tx.xsd">

    <!-- 这里可以使用 链接池 dbcp-->
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver" />
        <property name="url" value="jdbc:mysql://localhost:3306/activiti?nullCatalogMeansCurrent=true&amp;serverTimezone=GMT%2B8" />
        <property name="username" value="root" />
        <property name="password" value="ydlclass666" />
        <property name="maxActive" value="3" />
        <property name="maxIdle" value="1" />
    </bean>

    <bean id="processEngineConfiguration"
          class="org.activiti.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        <!-- 引用数据源 上面已经设置好了-->
        <property name="dataSource" ref="dataSource" />
<!--        <property name="jdbcDriver" value="com.mysql.cj.jdbc.Driver" />-->
<!--        <property name="jdbcUrl" value="jdbc:mysql://localhost:3306/activiti?nullCatalogMeansCurrent=true&amp;serverTimezone=GMT%2B8" />-->
<!--        <property name="jdbcUsername" value="root" />-->
<!--        <property name="jdbcPassword" value="ydlclass666" />-->
        <!-- activiti 数据库表处理策略 -->
        <property name="databaseSchemaUpdate" value="true"/>
    </bean>
</beans>
```

### `ProcessEngineConfiguration`

通过`ProcessEngineConfiguration`可以创建工作流引擎`ProceccEngine`

#### 1、`StandaloneProcessEngineConfiguration`

Activiti 可以单独运行（非Spring环境），通常在 activiti.cfg.xml 配置文件中定义一个 id 为 processEngineConfiguration 的 bean

```xml
<bean id="processEngineConfiguration"
          class="org.activiti.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        <!-- 引用数据源 上面已经设置好了-->
        <property name="dataSource" ref="dataSource" />
        <!-- activiti 数据库表处理策略 -->
        <property name="databaseSchemaUpdate" value="true"/>
    </bean>
```

#### 2、`SpringProcessEngineConfiguration`

Spring环境

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-3.1.xsd
http://www.springframework.org/schema/mvc
http://www.springframework.org/schema/mvc/spring-mvc-3.1.xsd
http://www.springframework.org/schema/context
http://www.springframework.org/schema/context/spring-context-3.1.xsd
http://www.springframework.org/schema/aop
http://www.springframework.org/schema/aop/spring-aop-3.1.xsd
http://www.springframework.org/schema/tx
http://www.springframework.org/schema/tx/spring-tx-3.1.xsd ">
    <!-- 工作流引擎配置bean -->
    <bean id="processEngineConfiguration"
          class="org.activiti.spring.SpringProcessEngineConfiguration">
        <!-- 数据源 -->
        <property name="dataSource" ref="dataSource"/>
        <!-- 使用spring事务管理器 -->
        <property name="transactionManager" ref="transactionManager"/>
        <!-- 数据库策略 -->
        <property name="databaseSchemaUpdate" value="drop-create"/>
        <!-- activiti的定时任务关闭 -->
        <property name="jobExecutorActivate" value="false"/>
    </bean>
    <!-- 流程引擎 -->
    <bean id="processEngine"
          class="org.activiti.spring.ProcessEngineFactoryBean">
        <property name="processEngineConfiguration"
                  ref="processEngineConfiguration"/>
    </bean>
    <!-- 资源服务service -->
    <bean id="repositoryService" factory-bean="processEngine"
          factory-method="getRepositoryService"/>
    <!-- 流程运行service -->
    <bean id="runtimeService" factory-bean="processEngine"
          factory-method="getRuntimeService"/>
    <!-- 任务管理service -->
    <bean id="taskService" factory-bean="processEngine"
          factory-method="getTaskService"/>
    <!-- 历史管理service -->
    <bean id="historyService" factory-bean="processEngine"
          factory-method="getHistoryService"/>
    <!-- 用户管理service -->
    <bean id="identityService" factory-bean="processEngine"
          factory-method="getIdentityService"/>
    <!-- 引擎管理service -->
    <bean id="managementService" factory-bean="processEngine"
          factory-method="getManagementService"/>
    <!-- 数据源 -->
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/activiti"/>
        <property name="username" value="root"/>
        <property name="password" value="mysql"/>
        <property name="maxActive" value="3"/>
        <property name="maxIdle" value="1"/>
    </bean>
    <!-- 事务管理器 -->
    <bean id="transactionManager"
          class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <!-- 通知 -->
    <tx:advice id="txAdvice" transaction-manager="transactionManager">
        <tx:attributes>
            <!-- 传播行为 -->
            <tx:method name="save*" propagation="REQUIRED"/>
            <tx:method name="insert*" propagation="REQUIRED"/>
            <tx:method name="delete*" propagation="REQUIRED"/>
            <tx:method name="update*" propagation="REQUIRED"/>
            <tx:method name="find*" propagation="SUPPORTS" read-only="true"/>
            <tx:method name="get*" propagation="SUPPORTS" read-only="true"/>
        </tx:attributes>
    </tx:advice>
    <!-- 切面，根据具体项目修改切点配置 -->
    <aop:config proxy-target-class="true">
        <aop:advisor advice-ref="txAdvice"
                     pointcut="execution(* com.ydlclass.ydloa.service.impl.*.*(..))"/>
    </aop:config>
</beans>
```

### ProcessEngine

#### 1、一般创建方式

```java
//先构建ProcessEngineConfiguration
ProcessEngineConfiguration configuration = ProcessEngineConfiguration.createProcessEngineConfigurationFromResource("activiti.cfg.xml");
//通过ProcessEngineConfiguration创建ProcessEngine，此时会创建数据库
ProcessEngine processEngine = configuration.buildProcessEngine();
```

#### 2、简单创建方式

```java
//直接使用工具类 ProcessEngines，使用classpath下的activiti.cfg.xml中的配置创建processEngine
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
```

### Servcie服务接口

#### 1、 Service创建方式

```java
RuntimeService runtimeService = processEngine.getRuntimeService();
RepositoryService repositoryService = processEngine.getRepositoryService();
TaskService taskService = processEngine.getTaskService();
```

#### 2、 Service总览

| service名称       | service作用              |
| ----------------- | ------------------------ |
| RepositoryService | activiti的资源管理类     |
| RuntimeService    | activiti的流程运行管理类 |
| TaskService       | activiti的任务管理类     |
| HistoryService    | activiti的历史管理类     |
| ManagerService    | activiti的引擎管理类     |

简单介绍：

**RepositoryService**

是activiti的资源管理类，提供了管理和控制流程发布包和流程定义的操作。使用工作流建模工具设计的业务流程图需要使用此service将流程定义文件的内容部署到计算机。

除了部署流程定义以外还可以：查询引擎中的发布包和流程定义。

暂停或激活发布包，对应全部和特定流程定义。 暂停意味着它们不能再执行任何操作了，激活是对应的反向操作。获得多种资源，像是包含在发布包里的文件， 或引擎自动生成的流程图。

获得流程定义的pojo版本， 可以用来通过java解析流程，而不必通过xml。

**RuntimeService**

Activiti的流程运行管理类。可以从这个服务类中获取很多关于流程执行相关的信息

**TaskService**

Activiti的任务管理类。可以从这个类中获取任务的信息。

**HistoryService**

Activiti的历史管理类，可以查询历史信息，执行流程时，引擎会保存很多数据（根据配置），比如流程实例启动时间，任务的参与者， 完成任务的时间，每个流程实例的执行路径，等等。 这个服务主要通过查询功能来获得这些数据。

**ManagementService**

Activiti的引擎管理类，提供了对 Activiti 流程引擎的管理和维护功能，这些功能不在工作流驱动的应用程序中使用，主要用于 Activiti 系统的日常维护。

## Activiti入门

创建Activiti工作流主要包含以下几步：

1、定义流程，按照BPMN的规范，使用流程定义工具，用**流程符号**把整个流程描述出来

2、部署流程，把画好的流程定义文件，加载到数据库中，生成表的数据

3、启动流程，使用java代码来操作数据库表中的内容

### 一、流程符号

BPMN2.0的**基本符合**主要包含：

#### 1、事件 Event

![img](..\img\1713934064210-2a3e14b8-b31b-4876-a8c3-fa7d31779899.webp)

![img](..\img\1713934064295-7295ea36-3b82-4448-95c1-fd99c33f4129.webp)

#### 2、活动 Activity

活动是工作或任务的一个通用术语。一个活动可以是一个任务，还可以是一个当前流程的子处理流程； 其次，你还可以为活动指定不同的类型。常见活动如下：

![img](..\img\1713934064375-638abc4e-5ce0-4aa9-aaaa-bc26be13a5da.webp)

![img](..\img\1713934064437-e625919e-e6de-4be0-af1b-019120c5de87.webp)

#### 3、网关 GateWay

网关用来处理决策，有几种常用网关需要了解：

![img](..\img\1713934064525-a78d713a-9c2a-4a0a-bf95-ac0b14778a6f.webp)

![img](..\img\1713934064597-e6ab038d-78dd-4d3c-962e-46096ee3df33.webp)

##### （1）排他网关 (x)

——只有一条路径会被选择。流程执行到该网关时，按照输出流的顺序逐个计算，当条件的计算结果为true时，继续执行当前网关的输出流；

如果多条线路计算结果都是 true，则会执行第一个值为 true 的线路。如果所有网关计算结果没有true，则引擎会抛出异常。

排他网关需要和条件顺序流结合使用，default 属性指定默认顺序流，当所有的条件不满足时会执行默认顺序流。

##### （2）并行网关 (+)

——所有路径会被同时选择

拆分 —— 并行执行所有输出顺序流，为每一条顺序流创建一个并行执行线路。

合并 —— 所有从并行网关拆分并执行完成的线路均在此等候，直到所有的线路都执行完成才继续向下执行。

##### （3）包容网关 (+)

—— 可以同时执行多条线路，也可以在网关上设置条件

拆分 —— 计算每条线路上的表达式，当表达式计算结果为true时，创建一个并行线路并继续执行

合并 —— 所有从并行网关拆分并执行完成的线路均在此等候，直到所有的线路都执行完成才继续向下执行。

##### （4）事件网关 (+)

—— 专门为中间捕获事件设置的，允许设置多个输出流指向多个不同的中间捕获事件。当流程执行到事件网关后，流程处于等待状态，需要等待抛出事件才能将等待状态转换为活动状态。

#### 4、流向 Flow

流是连接两个流程节点的连线。常见的流向包含以下几种：

![img](..\img\1713934064682-e909bb8d-3d59-4c2c-8c39-f0bd7c74b779.webp)

### 二、 流程设计器使用

#### 1、activiti BPMN visualizer 使用

**Palette**（画板）

在idea中安装插件即可使用，画板中包括以下结点：
Connection—连接
Event---事件
Task---任务
Gateway---网关
Container—容器
Boundary event—边界事件
Intermediate event- -中间事件

流程图设计完毕保存生成.bpmn文件

![PixPin_2025-04-21_15-39-12](..\img\PixPin_2025-04-21_15-39-12.png)

## 流程操作

### 一、流程定义

.bpmn文件
生成png图片文件

### 二、流程定义部署

将上面在设计器中定义的流程部署到activiti数据库中，就是流程定义部署。
通过调用activiti的api将流程定义的bpmn和png两个文件一个一个添加部署到activiti中，也可以将两个文件打成zip包进行部署。

#### 1、单个文件部署方式

分别将bpmn文件和png图片文件部署。

```java
//        1、创建ProcessEngine
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        2、得到RepositoryService实例
RepositoryService repositoryService = processEngine.getRepositoryService();
//        3、使用RepositoryService进行部署
Deployment deployment = repositoryService.createDeployment()
        .addClasspathResource("bpmn/holiday.bpmn") // 添加bpmn资源
        .addClasspathResource("bpmn/holiday.png")  // 添加png资源
        .name("出差申请流程")
        .deploy();
//        4、输出部署信息
System.out.println("流程部署id：" + deployment.getId());
System.out.println("流程部署名称：" + deployment.getName());
```

#### 2、压缩包部署方式

将holiday.bpmn20.xml和holiday.png压缩成zip包。

```java
// 定义zip输入流
InputStream inputStream = this
        .getClass()
        .getClassLoader()
        .getResourceAsStream(
                "bpmn/holiday.zip");
ZipInputStream zipInputStream = new ZipInputStream(inputStream);
// 获取repositoryService
RepositoryService repositoryService = processEngine
        .getRepositoryService();
// 流程部署
Deployment deployment = repositoryService.createDeployment()
        .addZipInputStream(zipInputStream)
        .deploy();
System.out.println("id：" + deployment.getId());
System.out.println("Name：" + deployment.getName());
```

流程定义部署后操作activiti的3张表如下：
act_re_deployment 流程定义部署表，每部署一次增加一条记录
act_re_procdef 流程定义表，部署每个新的流程定义都会在这张表中增加一条记录
act_ge_bytearray 流程资源表
接下来我们来看看，写入了什么数据：

act_re_deployment 流程定义部署表，记录流程部署信息
![img](..\img\1713934065819-266fbfa8-a13b-4c17-9874-9295df4ce4ac.webp)

act_re_procdef 流程定义表，记录流程定义信息
KEY 这个字段是用来唯一识别不同流程的关键字
![img](..\img\1713934065893-5e0e1f8b-f5da-4635-9e35-50fc77ee1389.webp)

act_ge_bytearray 资源表![img](..\img\1713934066023-24452b66-a144-4666-878a-42c9b918e6e3.webp)

建议：一次部署一个流程，这样部署表和流程定义表是一对一有关系，方便读取流程部署及流程定义信息。

### 三、启动流程实例

```java
//        1、创建ProcessEngine
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        2、获取RunTimeService
        RuntimeService runtimeService = processEngine.getRuntimeService();
//        3、根据流程定义Id启动流程
        ProcessInstance processInstance = runtimeService
                .startProcessInstanceByKey("holiday");
//        输出内容
        System.out.println("流程定义id：" + processInstance.getProcessDefinitionId());
        System.out.println("流程实例id：" + processInstance.getId());
        System.out.println("当前活动Id：" + processInstance.getActivityId());
```

**操作数据表**

act_hi_actinst 流程实例执行历史
act_hi_identitylink 流程的参与用户历史信息
act_hi_procinst 流程实例历史信息
act_hi_taskinst 流程任务历史信息
act_ru_execution 流程执行信息
act_ru_identitylink 流程的参与用户信息
act_ru_task 任务信息

### 四、任务查询

```java
//        任务负责人
        String assignee = "itlils";
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        创建TaskService
        TaskService taskService = processEngine.getTaskService();
//        根据流程key 和 任务负责人 查询任务
        List<Task> list = taskService.createTaskQuery()
                .processDefinitionKey("holiday") //流程Key
                .taskAssignee(assignee)//只查询该任务负责人的任务
                .list();

        for (Task task : list) {
            System.out.println("流程实例id：" + task.getProcessInstanceId());
            System.out.println("任务id：" + task.getId());
            System.out.println("任务负责人：" + task.getAssignee());
            System.out.println("任务名称：" + task.getName());

        }
```

### 五、流程任务处理

```java
//        获取引擎
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        获取taskService
        TaskService taskService = processEngine.getTaskService();

//        根据流程key 和 任务的负责人 查询任务
//        返回一个任务对象
        Task task = taskService.createTaskQuery()
                .processDefinitionKey("holiday") //流程Key
                .taskAssignee("itlils")  //要查询的负责人
                .singleResult();

//        完成任务,参数：任务id
        taskService.complete(task.getId());
```

### 六、流程定义信息查询

```java
        //        获取引擎
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        repositoryService
        RepositoryService repositoryService = processEngine.getRepositoryService();
//        得到ProcessDefinitionQuery 对象
        ProcessDefinitionQuery processDefinitionQuery = repositoryService.createProcessDefinitionQuery();
//          查询出当前所有的流程定义
//          条件：processDefinitionKey =evection
//          orderByProcessDefinitionVersion 按照版本排序
//        desc倒叙
//        list 返回集合
        List<ProcessDefinition> definitionList = processDefinitionQuery.processDefinitionKey("holiday")
                .orderByProcessDefinitionVersion()
                .desc()
                .list();
//      输出流程定义信息
        for (ProcessDefinition processDefinition : definitionList) {
            System.out.println("id="+processDefinition.getId());
            System.out.println("name="+processDefinition.getName());
            System.out.println("key="+processDefinition.getKey());
            System.out.println("Version="+processDefinition.getVersion());
            System.out.println("DeploymentId ="+processDefinition.getDeploymentId());
        }

```

### 七、流程删除

```java
		// 流程部署id
		String deploymentId = "1";
		
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    // 通过流程引擎获取repositoryService
		RepositoryService repositoryService = processEngine
				.getRepositoryService();
		//删除流程定义，如果该流程定义已有流程实例启动则删除时出错
		repositoryService.deleteDeployment(deploymentId);
		//设置true 级联删除流程定义，即使该流程有流程实例启动也可以删除，设置为false非级别删除方式，如果流程
		//repositoryService.deleteDeployment(deploymentId, true);
```

### 八、流程资源下载

使用commons-io.jar或使用javaio

```xml
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.6</version>
</dependency>
```

```java
//创建流程引擎配置文件
ProcessEngineConfiguration configuration
        = ProcessEngineConfiguration.createProcessEngineConfigurationFromResource("activiti.cgf.xml","processEngineConfiguration");
//通过配置文件，创建流程
ProcessEngine processEngine = configuration.buildProcessEngine();

RepositoryService repositoryService = processEngine.getRepositoryService();
//1repositoryService 获取相应的数据
ProcessDefinition definition = repositoryService.createProcessDefinitionQuery().processDefinitionKey("holiday").singleResult();
String deploymentId = definition.getDeploymentId();

InputStream xmlFileInputStream = repositoryService.getResourceAsStream(deploymentId,definition.getResourceName());
InputStream pngInputStream = repositoryService.getResourceAsStream(deploymentId, definition.getDiagramResourceName());

//2转成输出流，放到本地文件夹下
FileOutputStream xmlFileOutputStream=new FileOutputStream(new File("e:/holiday.bpmn20.xml"));
FileOutputStream pngFileOutputStream=new FileOutputStream(new File("e:/holiday.png"));

//3工具类把输入流转成输出流
IOUtils.copy(xmlFileInputStream,xmlFileOutputStream);
IOUtils.copy(pngInputStream,pngFileOutputStream);

//4关流
pngFileOutputStream.close();
xmlFileOutputStream.close();
pngInputStream.close();
xmlFileInputStream.close();
```

### 九、流程历史信息的查看

```java
//      获取引擎
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        获取HistoryService
HistoryService historyService = processEngine.getHistoryService();
//        获取 actinst表的查询对象
HistoricActivityInstanceQuery instanceQuery = historyService.createHistoricActivityInstanceQuery();
//        查询 actinst表，条件：根据 InstanceId 查询
//        instanceQuery.processInstanceId("2503");
//        查询 actinst表，条件：根据 DefinitionId 查询
instanceQuery.processDefinitionId("holiday:1:4");
//        增加排序操作,orderByHistoricActivityInstanceStartTime 根据开始时间排序 asc 升序
instanceQuery.orderByHistoricActivityInstanceStartTime().asc();
//        查询所有内容
List<HistoricActivityInstance> activityInstanceList = instanceQuery.list();
//        输出
for (HistoricActivityInstance hi : activityInstanceList) {
    System.out.println(hi.getActivityId());
    System.out.println(hi.getActivityName());
    System.out.println(hi.getProcessDefinitionId());
    System.out.println(hi.getProcessInstanceId());
    System.out.println("<==========================>");
}
```

## 流程实例

### 一、启动流程实例 并添加Businesskey（业务标识）

![img](..\img\1713934066309-ee4e7aef-0b0e-43ea-960e-6cdd49759bdd.webp)

Businesskey：业务标识，通常为业务表的主键，业务标识和流程实例一一对应。业务标识来源于业务系统（即上图OA系统）。

```java
//        1、得到ProcessEngine
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        2、得到RunTimeService
RuntimeService runtimeService = processEngine.getRuntimeService();
//        3、启动流程实例，同时还要指定业务标识businessKey，也就是出差申请单id，这里是1001
ProcessInstance processInstance = runtimeService.
        startProcessInstanceByKey("holiday","10001");
//        4、输出processInstance相关属性
System.out.println("id=="+processInstance.getBusinessKey());

```

### 二、挂起、激活流程实例

#### 1、全部流程实例挂起

```java
//        获取processEngine
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        获取repositoryService
RepositoryService repositoryService = processEngine.getRepositoryService();
//        查询流程定义的对象
ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery().
        processDefinitionKey("holiday").
        singleResult();
//        得到当前流程定义的实例是否都为暂停状态
boolean suspended = processDefinition.isSuspended();
//        流程定义id
String processDefinitionId = processDefinition.getId();
//        判断是否为暂停
if(suspended){
//         如果是暂停，可以执行激活操作 ,参数1 ：流程定义id ，参数2：派生的流程实例是否也激活，参数3：激活时间
    repositoryService.activateProcessDefinitionById(processDefinitionId,
            true,
            null
    );
    System.out.println("processDefinitionId："+processDefinitionId+",activate");
}else{
//          如果是激活状态，可以暂停，参数1 ：流程定义id ，参数2：派生的流程实例是否也暂停，参数3：暂停时间
    repositoryService.suspendProcessDefinitionById(processDefinitionId,
            true,
            null);
    System.out.println("processDefinitionId："+processDefinitionId+",suspend");
}

```

#### 2、单个流程实例挂起

```java
//        获取processEngine
ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
//        RuntimeService
RuntimeService runtimeService = processEngine.getRuntimeService();
//        查询流程定义的对象
ProcessInstance processInstance = runtimeService.
        createProcessInstanceQuery().
        processInstanceId("15001").
        singleResult();
//        得到当前流程定义的实例是否都为暂停状态
boolean suspended = processInstance.isSuspended();
//        流程定义id
String processDefinitionId = processInstance.getId();
//        判断是否为暂停
if(suspended){
//         如果是暂停，可以执行激活操作 ,参数：流程定义id
    runtimeService.activateProcessInstanceById(processDefinitionId);
    System.out.println("processDefinitionId："+processDefinitionId+",activate");
}else{
//          如果是激活状态，可以暂停，参数：流程定义id
    runtimeService.suspendProcessInstanceById( processDefinitionId);
    System.out.println("processDefinitionId："+processDefinitionId+",suspend");
}
```

### 三、UEL 表达式（变量）

#### 1、读取变量

```java
${assignee0}
${user.assignee}
${userBean.getUserId()}
${order.price > 100 && order.price < 250}
//表达式支持解析基础类型、 bean、 list、 array 和 map
```

#### 2、global变量

```java
Map<String,Object> map=new HashMap<>();
Holidays holidays = new Holidays();
holidays.setNum(2d);
map.put("holidays",holidays);
map.put("assignee0","itlils");
map.put("assignee1","zhuzhu");
map.put("assignee2","itnanls");
map.put("assignee3","weiwei");
```

##### a、启动流程时设置变量

```java
//流程变量作用域是一个流程实例，key相同，后者覆盖前者
runtimeService.startProcessInstanceByKey("holiday-global1",map);
```

##### b、任务办理时设置变量

```java
//该流程变量只有在该任务完成后其它结点才可使用该变量，作用域是整个流程实例
Task task = taskService.createTaskQuery()
    .processDefinitionKey(key)
    .taskAssignee(assingee)
    .singleResult();
if(task != null){
    //完成任务时，设置流程变量的值
    taskService.complete(task.getId(),map);
    System.out.println("任务执行完成");
}
```

##### c、通过当前流程实例设置

```java
//该流程实例必须未执行完成。通过runtimeService.getVariable()获取流程变量。
runtimeService.setVariable(executionId, "holidays", holidays);
```

##### d、通过当前任务设置

```java
//务id必须是当前待办任务id。通过taskService.getVariable()获取流程变量。
taskService.setVariable(taskId, "holidays", holidays);
```

#### 3、local流程变量

```java
//只能在该任务结束前使用，作用域为该任务
taskService.setVariablesLocal(taskId, variables);

//可通过historyService查询每个历史任务时将流程变量的值也查询出来。
HistoricTaskInstanceQuery historicTaskInstanceQuery = historyService.createHistoricTaskInstanceQuery();
      // 查询结果包括 local变量
List<HistoricTaskInstance> list = historicTaskInstanceQuery.includeTaskLocalVariables().list();
for (HistoricTaskInstance historicTaskInstance : list) {
         System.out.println("==============================");
         System.out.println("任务id：" + historicTaskInstance.getId());
         System.out.println("任务名称：" + historicTaskInstance.getName());
         System.out.println("任务负责人：" + historicTaskInstance.getAssignee());
     System.out.println("任务local变量："+ historicTaskInstance.getTaskLocalVariables());

}
```

#### 分配任务负责人

![img](..\img\1713934067223-8fe5d05a-848a-4faa-964a-549c8f77505e.webp)

```java
//创建流程引擎配置文件
ProcessEngineConfiguration configuration
        = ProcessEngineConfiguration.createProcessEngineConfigurationFromResource("activiti.cgf.xml","processEngineConfiguration");
//通过配置文件，创建流程
ProcessEngine processEngine = configuration.buildProcessEngine();

RuntimeService runtimeService = processEngine.getRuntimeService();
//如果将 pojo 存储到流程变量中，必须实现序列化接口 serializable，为了防止由于新增字段无法反序列化，需要生成 serialVersionUID。
Map<String,Object> map=new HashMap<>();
map.put("assignee0","itlils");
map.put("assignee1","zhuzhu");
map.put("assignee2","itnanls");
map.put("assignee3","weiwei");
ProcessInstance instance = runtimeService.startProcessInstanceByKey("holiday1",map);

System.out.println("ProcessDefinitionId"+instance.getProcessDefinitionId());
System.out.println("Id"+instance.getId());
System.out.println("ActivityId"+instance.getActivityId());
```

#### 分支

![img](..\img\1713934067928-c4df520e-7e5e-45d5-b05c-6d3c5716dda6.webp)

![img](..\img\1713934069482-b2adebb5-2aa3-4149-865a-d7efbe0830fb.webp)

## 组任务

临时任务负责人变更需要修改流程定义，系统可扩展性差。针对这种情况可以给任务设置多个候选人，可以从候选人中选择参与者来完成任务。

### 一、设置任务候选人

设置 candidate-users(候选人)，多个候选人之间用逗号分开。![img](..\img\1713934069561-e6459903-6945-4b9e-9c60-4855ee182d37.webp)

### 二、组任务办理流程

#### 1、查询组任务

查询该候选人当前的待办任务。候选人不能立即办理任务。

```java
//查询组任务
List<Task> list = taskService.createTaskQuery()
     .processDefinitionKey(processDefinitionKey)
     .taskCandidateUser(candidateUser)//根据候选人查询
     .list();
for (Task task : list) {
  System.out.println("----------------------------");
  System.out.println("InstanceId：" + task.getProcessInstanceId());
  System.out.println("id：" + task.getId());
  System.out.println("Assignee：" + task.getAssignee());
  System.out.println("Name：" + task.getName());
}
```

#### 2、拾取(claim)任务

该组任务的所有候选人都能拾取。组任务拾取后，该任务已有负责人（assignee），通过候选人将查询不到该任务

如果拾取后不想办理该任务？需要将已经拾取的个人任务归还到组里边，将个人任务变成了组任务。

```java
//要拾取的任务id
String taskId = "6302";
//任务候选人id
String userId = "itwangls";
//拾取任务
//即使该用户不是候选人也能拾取(建议拾取时校验是否有资格)    
//校验该用户有没有拾取任务的资格
Task task = taskService.createTaskQuery()
     .taskId(taskId)
     .taskCandidateUser(userId)//根据候选人查询
     .singleResult();
if(task!=null){
//拾取任务
  taskService.claim(taskId, userId);
  System.out.println("任务拾取成功");
}
```

#### 3、查询个人任务

查询方式同个人任务部分，根据assignee查询用户负责的个人任务。

```java
TaskService taskService = processEngine.getTaskService();
List<Task> list = taskService.createTaskQuery()
   .processDefinitionKey(processDefinitionKey)
   .taskAssignee(assignee)
   .list();
for (Task task : list) {
   System.out.println("----------------------------");
   System.out.println("流程实例id：" + task.getProcessInstanceId());
   System.out.println("任务id：" + task.getId());
   System.out.println("任务负责人：" + task.getAssignee());
   System.out.println("任务名称：" + task.getName());
}
```

#### 4、办理个人任务

```java
String taskId = "12304";
taskService().complete(taskId);
```

#### 5、归还或交接组任务

```java
// 当前待办任务
String taskId = "6004";
// 任务负责人
String userId = "zhangsan2";
// 校验userId是否是taskId的负责人，如果是负责人才可以归还组任务
Task task = taskService
   .createTaskQuery()
   .taskId(taskId)
   .taskAssignee(userId)
   .singleResult();
if (task != null) {
   // 如果设置为null，归还组任务,该任务没有负责人
   // 如果设置为其他用户，委托给其它用户负责
   taskService.setAssignee(taskId, null);
}
```

## 网关

### 一、排他网关ExclusiveGateway

排他网关只会选择一个为true的分支执行。
如果有两个分支条件都为true，排他网关会选择id值较小的一条分支去执行。
如果从网关出去的线所有条件都不满足则系统抛出异常。

为什么要用排他网关？
不用排他网关也可以实现分支，如：在连线的condition条件上设置分支条件。
在连线设置condition条件的缺点：如果条件都不满足，流程就结束了(是异常结束)。

### 二、并行网关ParallelGateway

fork分支：进入分支网关会给每一条线都创建一个任务。

join汇聚：所有人的任务完成，流程才会通过汇聚网关。

注意，如果同一个并行网关有多个进入和多个外出顺序流， 它就同时具有分支和汇聚功能。 这时，网关会先汇聚所有进入的顺序流，然后再切分成多个并行分支。

**与其他网关的主要区别是，并行网关不会解析条件。 即使顺序流中定义了条件，也会被忽略。**

![img](..\img\1713934069825-ec8f547c-528c-4713-b924-a50bdb9992ae.webp)

### 三、包含网关InclusiveGateway

包含网关可以看做是排他网关和并行网关的结合体。

和排他网关一样，你可以在外出顺序流上定义条件，包含网关会解析它们。 但是主要的区别是包含网关可以选择多于一条顺序流，这和并行网关一样。

l 分支：

所有外出顺序流的条件都会被解析，结果为true的顺序流会以并行方式继续执行， 会为每个顺序流创建一个分支。

l 汇聚：

包含网关只会等待满足分支条件的顺序流。 在汇聚之后，流程会穿过包含网关继续执行。

### 四、事件网关EventGateway

事件网关允许根据事件判断流向。网关的每个外出顺序流都要连接到一个中间捕获事件。 当流程到达一个基于事件网关，网关会进入等待状态：会暂停执行。与此同时，会为每个外出顺序流创建相对的事件订阅。

事件网关的外出顺序流和普通顺序流不同，这些顺序流不会真的"执行"， 相反它们让流程引擎去决定执行到事件网关的流程需要订阅哪些事件。 要考虑以下条件：

1. 事件网关必须有两条或以上外出顺序流；
2. 事件网关后，只能使用intermediateCatchEvent类型（activiti不支持基于事件网关后连接ReceiveTask）
3. 连接到事件网关的中间捕获事件必须只有一个入口顺序流。

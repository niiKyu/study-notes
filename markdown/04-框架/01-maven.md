# Maven使用

下载，配置环境变量

## 配置文件settings.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>

<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd">

<localRepository>D:\Java\software\maven-repository</localRepository>

<mirrors>
    <mirror>
        <id>alimaven</id>
        <mirrorOf>central</mirrorOf>
        <name>aliyun maven</name>
        <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    </mirror>
</mirrors>

<profiles>
    <profile>
		<id>jdk-11</id>
		<properties>
			<maven.compiler.source>11</maven.compiler.source>
			<maven.compiler.target>11</maven.compiler.target>
			<maven.compiler.compilerVersion>11</maven.compiler.compilerVersion>
		</properties>
	</profile>
</profiles>

<activeProfiles>
    <activeProfile>jdk-11</activeProfile>
</activeProfiles>
</settings>
```

## idea配置

2个都要配

![maven](..\img\maven.png)

![](..\img\mavenConfig.png)

## 依赖范围

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>servlet-api</artifactId>
    <version>2.5</version>
    <!--已提供：编译和测试有效，运行无效-->
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <!--测试：测试有效-->
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.25</version>
    <!--运行时：测试和运行有效，编译无效-->
    <scope>runtime</scope>
</dependency>
```

## 依赖传递

```xml
<!--依赖传递会自动引需要的包-->
<dependency>
    <groupId>dev.tuxjsql</groupId>
    <artifactId>hikaricp-cp</artifactId>
    <version>2.1</version>
    <!--如果不想引依赖传递进来的包(想要新版)，就可以使用下面的标签-->
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 聚合工程和继承

```xml
<packaging>pom</packaging>
```

packaging改成pom就是聚合工程，在此project下可建子maven工程

![](..\img\maven2.png)

可以被继承的POM元素如下

* groupId：项目组ID，项目坐标的核心元素
* version：项目版本，项目坐标的核心元素
* properties：自定义的Maven属性，一般用于统一制定各个依赖的版本号
* dependencies：项目的依赖配置，公共的依赖
* dependencyManagement：项目的依赖管理配置
* repositories：项目的仓库配置
* build：包括项目的源码目录配置、输出目录配置、插件配置、插件管理配置等

#### 依赖管理

在聚合工程中，如果在父工程直接引入依赖，子工程打包时，会引入所有依赖（包括未使用的）

这时就需要`<dependencyManagement>`，父工程只管理依赖的版本，子工程负责`<dependencies>`引入自己需要的依赖

## 多环境配置

```xml
<profiles></profiles>
<!--
常用环境：开发、测试、真实（生产）
不同环境可以使用不同数据库
测试环境连接测试库
开发环境连接开发库
真实环境连接真实库
-->
```

## Maven仓库

使用仓库的几种方式

1. 中央仓库，默认仓库
2. 镜像仓库，通过settings.xml中的settings.mirrors.mirror配置
3. 全局profile仓库，通过settings.xml中的settings.repositories.repository配置
4. 项目仓库，通过pom.xml中的project.repositoies.repository配置
5. 项目profile仓库，通过pom.xml中的project.profiles.profile.repositories.repository配置
6. 本地仓库

搜索顺序如下：

local_repo > setting_profile_repo > pom_profile_repo > pom_repositories > settings_mirror > central

## 搭建私服

Nexus

## 完整配置

父工程

```xml
<properties>
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j2-impl</artifactId>
            <version>2.24.3</version>
        </dependency>
        <!-- log4j2的异步日志，需要引这个包 -->
        <dependency>
            <groupId>com.lmax</groupId>
            <artifactId>disruptor</artifactId>
            <version>4.0.0</version>
        </dependency>

        <!-- pagehelper 分页插件 -->
        <dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper-spring-boot-starter</artifactId>
            <version>${pagehelper.boot.version}</version>
        </dependency>

        <!-- 阿里JSON解析器 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>${fastjson.version}</version>
        </dependency>


    </dependencies>
</dependencyManagement>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.source}</target>
                <encoding>${project.build.sourceEncoding}</encoding>
            </configuration>
        </plugin>
    </plugins>
</build>

<repositories>
    <repository>
        <id>public</id>
        <name>aliyun nexus</name>
        <url>https://maven.aliyun.com/repository/public</url>
        <releases>
            <enabled>true</enabled>
        </releases>
    </repository>
</repositories>
```


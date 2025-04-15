# Mybatis

## 使用

```java
try (SqlSession sqlSession = sqlSessionFactory.openSession();){
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    List<User> list = mapper.selectAll();
    LOGGER.debug("result is [{}]",list);
}
```

 这里很明显使用了动态代理的方式，`sqlSession.getMapper(UserMapper.class);`帮我们生成一个代理对象，该对象实现了这个接口的方法，具体的数据库操作比如建立连接，创建statment等重复性的工作交给框架来处理，唯一需要额外补充的就是sql语句了，xml文件就是在补充这个描述信息，比如具体的sql，返回值的类型等，框架会根据命名空间自动匹配对应的接口，根据id自动匹配接口的方法，不需要我们再做额外的操作。

### 其他

#### \#{}还有${}的区别

- \#{} 的作用主要是替换预编译语句(PrepareStatement)中的占位符? 【推荐使用】

  ```sql
  INSERT INTO user (username) VALUES (#{username});
  INSERT INTO user (username) VALUES (?);
  ```

- ${} 的作用是直接进行字符串替换

  ```sql
  INSERT INTO user (username) VALUES ('${username}');
  INSERT INTO user (username) VALUES ('楠哥');
  ```

#### 模糊查询

> 方案一：用concat拼串

```xml
<select id="getUsersByName">
	select * from user where name like concat('%',#{name},'%')
</select>
```

> 方案二：在配置文件中拼接

```xml
<select id="getUsersByName">
    select * from user where name like "%${name}%"
</select>
```

#### 使用注解开发

- @select ()
- @update ()
- @Insert ()
- @delete ()

**注意：**利用注解开发就不需要mapper.xml映射文件了 .

```xml
<mapper class="com.ydlclass.mapper.UserMapper"/>
```

## 别名系统

```xml
<select id="selectAll" resultType="com.ydlclass.entity.User">
    select id,username,password,balance from `user`
</select>
```

问题：resultType太长了，我们可以使用mybatis的别名

#### 1.mybatis-config.xml

```xml
<typeAliases>
    <!-- 配置一个类的别名 -->
    <typeAlias type="com.ydlclass.entity.User" alias="user" />
    <!-- 配置包下所有的类的别名 -->
    <package name="com.ydlclass.entity"/>
</typeAliases>
```

```xml
<select id="selectAll" resultType="user">
    select id,username,password,balance from `user`
</select>
```

#### 2.或使用注解

```java
@Alias("user")
public class User
```

### 默认别名

```java
this.typeAliasRegistry.registerAlias("JDBC", JdbcTransactionFactory.class);
this.typeAliasRegistry.registerAlias("MANAGED", ManagedTransactionFactory.class);
this.typeAliasRegistry.registerAlias("JNDI", JndiDataSourceFactory.class);
this.typeAliasRegistry.registerAlias("POOLED", PooledDataSourceFactory.class);
this.typeAliasRegistry.registerAlias("UNPOOLED", UnpooledDataSourceFactory.class);
this.typeAliasRegistry.registerAlias("PERPETUAL", PerpetualCache.class);
this.typeAliasRegistry.registerAlias("FIFO", FifoCache.class);
this.typeAliasRegistry.registerAlias("LRU", LruCache.class);
this.typeAliasRegistry.registerAlias("SOFT", SoftCache.class);
this.typeAliasRegistry.registerAlias("WEAK", WeakCache.class);
this.typeAliasRegistry.registerAlias("DB_VENDOR", VendorDatabaseIdProvider.class);
this.typeAliasRegistry.registerAlias("XML", XMLLanguageDriver.class);
this.typeAliasRegistry.registerAlias("RAW", RawLanguageDriver.class);
this.typeAliasRegistry.registerAlias("SLF4J", Slf4jImpl.class);
this.typeAliasRegistry.registerAlias("COMMONS_LOGGING", JakartaCommonsLoggingImpl.class);
this.typeAliasRegistry.registerAlias("LOG4J", Log4jImpl.class);
this.typeAliasRegistry.registerAlias("LOG4J2", Log4j2Impl.class);
this.typeAliasRegistry.registerAlias("JDK_LOGGING", Jdk14LoggingImpl.class);
this.typeAliasRegistry.registerAlias("STDOUT_LOGGING", StdOutImpl.class);
this.typeAliasRegistry.registerAlias("NO_LOGGING", NoLoggingImpl.class);
this.typeAliasRegistry.registerAlias("CGLIB", CglibProxyFactory.class);
this.typeAliasRegistry.registerAlias("JAVASSIST", JavassistProxyFactory.class);
```

```java
this.registerAlias("string", String.class);
this.registerAlias("byte", Byte.class);
this.registerAlias("char", Character.class);
this.registerAlias("character", Character.class);
this.registerAlias("long", Long.class);
this.registerAlias("short", Short.class);
this.registerAlias("int", Integer.class);
this.registerAlias("integer", Integer.class);
this.registerAlias("double", Double.class);
this.registerAlias("float", Float.class);
this.registerAlias("boolean", Boolean.class);
this.registerAlias("byte[]", Byte[].class);
this.registerAlias("char[]", Character[].class);
this.registerAlias("character[]", Character[].class);
this.registerAlias("long[]", Long[].class);
this.registerAlias("short[]", Short[].class);
this.registerAlias("int[]", Integer[].class);
this.registerAlias("integer[]", Integer[].class);
this.registerAlias("double[]", Double[].class);
this.registerAlias("float[]", Float[].class);
this.registerAlias("boolean[]", Boolean[].class);
this.registerAlias("_byte", Byte.TYPE);
this.registerAlias("_char", Character.TYPE);
this.registerAlias("_character", Character.TYPE);
this.registerAlias("_long", Long.TYPE);
this.registerAlias("_short", Short.TYPE);
this.registerAlias("_int", Integer.TYPE);
this.registerAlias("_integer", Integer.TYPE);
this.registerAlias("_double", Double.TYPE);
this.registerAlias("_float", Float.TYPE);
this.registerAlias("_boolean", Boolean.TYPE);
this.registerAlias("_byte[]", byte[].class);
this.registerAlias("_char[]", char[].class);
this.registerAlias("_character[]", char[].class);
this.registerAlias("_long[]", long[].class);
this.registerAlias("_short[]", short[].class);
this.registerAlias("_int[]", int[].class);
this.registerAlias("_integer[]", int[].class);
this.registerAlias("_double[]", double[].class);
this.registerAlias("_float[]", float[].class);
this.registerAlias("_boolean[]", boolean[].class);
this.registerAlias("date", Date.class);
this.registerAlias("decimal", BigDecimal.class);
this.registerAlias("bigdecimal", BigDecimal.class);
this.registerAlias("biginteger", BigInteger.class);
this.registerAlias("object", Object.class);
this.registerAlias("date[]", Date[].class);
this.registerAlias("decimal[]", BigDecimal[].class);
this.registerAlias("bigdecimal[]", BigDecimal[].class);
this.registerAlias("biginteger[]", BigInteger[].class);
this.registerAlias("object[]", Object[].class);
this.registerAlias("map", Map.class);
this.registerAlias("hashmap", HashMap.class);
this.registerAlias("list", List.class);
this.registerAlias("arraylist", ArrayList.class);
this.registerAlias("collection", Collection.class);
this.registerAlias("iterator", Iterator.class);
this.registerAlias("ResultSet", ResultSet.class);
```

## 自定义数据源-druid

需要实现mybatis的接口

```java
public class MyDataSourceFactory implements DataSourceFactory {

    private DataSource dataSource;

    @Override
    public void setProperties(Properties props) {
        try {
            dataSource = DruidDataSourceFactory.createDataSource(props);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public DataSource getDataSource() {
        return this.dataSource;
    }
}
```

注册到mybatis

```xml
<environments default="development">
    <environment id="test">
        <transactionManager type="JDBC"/>
        <dataSource type="druid">
            <property name="druid.driverClassName" value="${driver}"/>
            <property name="druid.url" value="${url}"/>
            <property name="druid.username" value="${username}"/>
            <property name="druid.password" value="${password}"/>
        </dataSource>
    </environment>
</environments>
```

## 日志配置

指定 MyBatis 应该使用哪个日志记录实现。如果此设置不存在，则会自动发现日志记录实现。

```xml
<settings>
    <setting name="logImpl" value="SLF4J"/>
    <!--将sql日志独立出来，实现只输出sql日志-->
    <setting name="logPrefix" value="mysql.sql."/>
</settings>
```

#### 给sql单独打日志

配置文件log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns="https://logging.apache.org/xml/ns"
               xsi:schemaLocation="
                       https://logging.apache.org/xml/ns
                       https://logging.apache.org/xml/ns/log4j-config-2.xsd" status="fatal" monitorInterval="30">

    <Properties>
        <Property name="log_dir">D://Java/code/logs/</Property>
        <property name="pattern">%d{HH:mm:ss.SSS} [%thread] %-5level %-50logger{20} - [%method,%line] - %msg%n</property>

        <Property name="appName">ssm-study</Property>
        <!--日志类型，推荐分类有 stats/monitor/visit-->
        <Property name="logType">monitor</Property>

        <!--文件名字，代表日志描述-->
        <property name="info_file_name">sys-info</property>
        <property name="warn_file_name">sys-warn</property>
        <property name="error_file_name">sys-error</property>
        <property name="sql_file_name">mysql-sql</property>
    </Properties>

    <Appenders>
        <Console name="CONSOLE">
            <PatternLayout pattern="${pattern}"/>
        </Console>

        <RollingFile name="file_info" fileName="${log_dir}/${appName}_${logType}_${info_file_name}.log" filePattern="${log_dir}/${appName}_${logType}_${info_file_name}.%d{yyyy-MM-dd}.log%i.gz">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <!--根据filePattern来决定最小粒度，%d{yyyy-MM-dd}最小粒度为天，即每1天滚动一次-->
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
                <!--日志文件大于10 MB滚动一次-->
                <!--<SizeBasedTriggeringPolicy size="10 MB"/>-->
            </Policies>
            <!-- 日志最大保留时间 60天 -->
            <DefaultRolloverStrategy>
                <!-- 删除${log_dir}最多遍历2级目录，删除匹配*${info_file_name}*.gz的文件 -->
                <Delete basePath="${log_dir}" maxDepth="1">
                    <IfFileName glob="*${info_file_name}*.gz" />
                    <IfLastModified age="60d" />
                    <!--如果文件数超过了100GB则删除文件。-->
                    <!--<IfAccumulatedFileSize exceeds="100 GB" />-->
                    <!--如果文件数超过了1000则删除文件。-->
                    <!--<IfAccumulatedFileCount exceeds="1000" />-->

                </Delete>
            </DefaultRolloverStrategy>
            <!--保存日志文件个数，默认为7-->
            <!--<DefaultRolloverStrategy max="10"/>-->
            <LevelMatchFilter level="INFO" onMatch="ACCEPT" onMismatch="DENY"/>
        </RollingFile>

        <RollingFile name="file_warn" fileName="${log_dir}/${appName}_${logType}_${warn_file_name}.log" filePattern="${log_dir}/${appName}_${logType}_${warn_file_name}.%d{yyyy-MM-dd}.log%i.gz">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy>
                <Delete basePath="${log_dir}" maxDepth="1">
                    <IfFileName glob="*${warn_file_name}*.gz" />
                    <IfLastModified age="60d" />
                </Delete>
            </DefaultRolloverStrategy>
            <LevelMatchFilter level="WARN" onMatch="ACCEPT" onMismatch="DENY"/>
        </RollingFile>

        <RollingFile name="file_error" fileName="${log_dir}/${appName}_${logType}_${error_file_name}.log" filePattern="${log_dir}/${appName}_${logType}_${error_file_name}.%d{yyyy-MM-dd}.log%i.gz">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy>
                <Delete basePath="${log_dir}" maxDepth="1">
                    <IfFileName glob="*${error_file_name}*.gz" />
                    <IfLastModified age="60d" />
                </Delete>
            </DefaultRolloverStrategy>
            <LevelMatchFilter level="ERROR" onMatch="ACCEPT" onMismatch="DENY"/>
        </RollingFile>
        
        <!--有mybatis的情况下，可以单独把sql日志打到一个文件中，需要在mybatis中配置logPrefix-->
        <RollingFile name="file_sql" fileName="${log_dir}/${appName}_${logType}_${sql_file_name}.log" filePattern="${log_dir}/${appName}_${logType}_${sql_file_name}.%d{yyyy-MM-dd}.log%i.gz">
            <PatternLayout pattern="${pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy>
                <Delete basePath="${log_dir}" maxDepth="1">
                    <IfFileName glob="*${sql_file_name}*.gz" />
                    <IfLastModified age="60d" />
                </Delete>
            </DefaultRolloverStrategy>
        </RollingFile>


        <Async name="file_info_async">
            <AppenderRef ref="file_info"/>
        </Async>
        <Async name="file_warn_async">
            <AppenderRef ref="file_warn"/>
        </Async>
        <Async name="file_error_async">
            <AppenderRef ref="file_error"/>
        </Async>
        <Async name="file_sql_async">
            <AppenderRef ref="file_sql"/>
        </Async>
    </Appenders>

    <Loggers>
        <Logger name="com.ydlclass" level="debug" additivity="false">
            <AppenderRef ref="CONSOLE"/>
            <appender-ref ref="file_info_async" />
            <appender-ref ref="file_warn_async" />
            <appender-ref ref="file_error_async" />
        </Logger>
        <!--有mybatis的情况下，可以单独把sql日志打到一个文件中，需要在mybatis中配置logPrefix-->
        <Logger name="mysql.sql" level="debug" additivity="false">
            <appender-ref ref="file_sql_async" />
        </Logger>

        <Root level="info">
            <AppenderRef ref="CONSOLE"/>
        </Root>
    </Loggers>

</Configuration>
```

## ResultMap

由于mysql和Java的命名规则不一致，abc_abc 和 abcAbc，mybatis推出映射配置

```xml
<resultMap id="UserMap" type="User">
   <!-- id为主键 -->
   <id column="id" property="id"/>
   <!-- column是数据库表的列名 , property是对应实体类的属性名 -->
   <result column="username" property="name"/>
   <result column="password" property="password"/>
</resultMap>

<select id="selectUserById" resultMap="UserMap">
  select id , username , password from user where id = #{id}
</select>
```

> 还有就是下划线和驼峰命名的自动转化

```xml
<settings>
    <!--开启驼峰命名规则-->
    <setting name="mapUnderscoreToCamelCase" value="true"/>
</settings>
```

## 动态sql

### 1、 概述

MyBatis提供了对SQL语句动态的组装能力，大大减少了我们编写代码的工作量。

> 动态SQL的元素

| 元素                    | 作用                         | 备注                    |
| ----------------------- | ---------------------------- | ----------------------- |
| if                      | 判断语句                     | 单条件分支判断          |
| choose、when、otherwise | 相当于Java中的 case when语句 | 多条件分支判断          |
| trim、where、set        | 辅助元素                     | 用于处理一些SQL拼装问题 |
| foreach                 | 循环语句                     | 在in语句等列举条件常用  |

### 2、select

```xml
<select id="findUserById" resultType="com.ydlclass.entity.User">
    select id,username,password from user
    <where>
        <if test="id != null">
            AND id = #{id}
        </if>
        <if test="username != null and username != ''">
            AND username = #{username}
        </if>
        <if test="password != null and password != ''">
            AND password = #{password}
        </if>
    </where>
</select>
```

### 3、update

```xml
<update id="update">
    UPDATE user
    <set>
        <if test="username != null and username != ''">
            username = #{username},
        </if>
        <if test="password != null and password != ''">
            password = #{password}
        </if>
    </set>
    WHERE id = #{id}
</update>
```

### 4、批量

1、批量查询

```xml
<select id="selectByIds" resultType="com.ydlclass.entity.User">
    SELECT * from user
    WHERE id in
    <foreach collection="ids" open="(" close=")" separator="," item="id">
        #{id}
    </foreach>
</select>
```

2、批量删除

```xml
<delete id="deleteByIds">
    delete from user
    WHERE id in
    <foreach collection="ids" open="(" close=")" separator="," item="id">
        #{id}
    </foreach>
</delete>
```

3、批量插入

```xml
<insert id="batchInsert" parameterType="list">
    insert into `user`( user_name, pass)
    values
    <foreach collection="users" item="user" separator=",">
        (#{user.username}, #{user.password})
    </foreach>
</insert>
```

### 5、SQL片段

有时候可能某个 sql 语句我们用的特别多，为了增加代码的重用性，简化代码，我们需要将这些代码抽取出来，然后使用时直接调用。

**提取SQL片段：**

```xml
<sql id="if-title-author">
   <if test="title != null">
      title = #{title}
   </if>
   <if test="author != null">
      and author = #{author}
   </if>
</sql>
```

**引用SQL片段：**

```xml
<select id="queryBlogIf" parameterType="map" resultType="blog">
  select * from blog
   <where>
       <!-- 引用 sql 片段，如果refid 指定的不在本文件中，那么需要在前面加上 namespace -->
       <include refid="if-title-author"></include>
       <!-- 在这里还可以引用其他的 sql 片段 -->
   </where>
</select>
```

## 正规写法

### 单表增删改查

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ydlclass.dao.UserDao">
    <!--映射mysql字段和Java字段-->
    <!--如果一样，可以省略不写-->
<!--    <resultMap id="userMap" type="user">-->
<!--        <id column="id" property="id"/>-->
<!--        <result column="username" property="username"/>-->
<!--        <result column="password" property="password"/>-->
<!--        <result column="balance" property="balance"/>-->
<!--    </resultMap>-->
    <!--sql片段，代码抽离-->
<!--    <sql id="userColumn">-->
<!--        id,username,password,balance-->
<!--    </sql>-->
    <select id="select" resultType="user">
        select id,username,password,balance from `user`
        <where>
            <if test="id != null">
                and id = #{id}
            </if>
            <if test="username != null and username != ''">
                and username = #{username}
            </if>
            <if test="password != null and password != ''">
                and password = #{password}
            </if>
            <if test="balance != null">
                and balance = #{balance}
            </if>
        </where>
    </select>
    <select id="selectById" resultType="user">
        select id,username,password,balance from `user` where id = #{id}
    </select>
    <select id="selectByIds" resultType="user">
        select id,username,password,balance from `user` where id in
        <foreach collection="ids" open="(" close=")" separator="," item="id">
            #{id}
        </foreach>
    </select>

    <insert id="insert">
        insert into user (username,password,balance) values (#{username},#{password},#{balance})
    </insert>
    <insert id="batchInsert">
        insert into user (username,password,balance) values
        <foreach collection="users" item="user" separator=",">
            (#{user.username},#{user.password},#{user.balance})
        </foreach>
    </insert>

    <update id="update">
        update user
        <set>
            <if test="username != null and username != ''">
                username = #{username},
            </if>
            <if test="password != null and password != ''">
                password = #{password},
            </if>
            <if test="balance != null">
                balance = #{balance},
            </if>
        </set>
        where id = #{id}
    </update>

    <delete id="delete">
        delete from user where id = #{id}
    </delete>
    <delete id="deleteByIds">
        delete from user where id in
        <foreach collection="ids" open="(" close=")" separator="," item="id">
            #{id}
        </foreach>
    </delete>
</mapper>
```

### 多表查询 高级映射-association

一对一映射

```java
public class Course {
    private Integer id;
    private String name;
    private Teacher teacher;
}
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ydlclass.dao.CourseDao">

    <resultMap id="courseMap" type="course">
        <id column="cid" property="id"/>
        <result column="cname" property="name"/>
        <!--映射teacher成员变量-->
        <association property="teacher" javaType="teacher">
            <id column="tid" property="id"/>
            <result column="tname" property="name"/>
        </association>
    </resultMap>

    <select id="select" resultMap="courseMap">
        select c.id cid,c.name cname,t.id tid,t.name tname from course c left join teacher t on c.t_id = t.id
        <where>
            <if test="id != null">
                and c.id = #{id}
            </if>
            <if test="name != null and name != ''">
                and c.name = #{name}
            </if>
            <if test="teacher != null">
                <if test="teacher.id != null">
                    and t.id = #{teacher.id}
                </if>
                <if test="teacher.name != null and teacher.name != ''">
                    and t.name = #{teacher.name}
                </if>
            </if>
        </where>
    </select>
    <select id="selectById" resultMap="courseMap">
        select c.id cid,c.name cname,t.id tid,t.name tname from course c left join teacher t on c.t_id = t.id where c.id = #{id}
    </select>
</mapper>
```

### 多表查询 高级映射-collection

一对多映射

```java
public class Teacher {
    private Integer id;
    private String name;
    private List<Course> courses;
}
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ydlclass.dao.TeacherDao">
    <resultMap id="teacherMap" type="teacher">
        <id column="tid" property="id"/>
        <result column="tname" property="name"/>
        <!--list类型需要指定ofType-->
        <collection property="courses" javaType="list" ofType="course">
            <id column="cid" property="id"/>
            <result column="cname" property="name"/>
        </collection>
    </resultMap>

    <select id="select" resultMap="teacherMap">
        select t.id tid,t.name tname,c.id cid,c.name cname from teacher t left join course c on t.id = c.t_id
        <where>
            <if test="id != null">
                and t.id = #{id}
            </if>
            <if test="name != null and name != ''">
                and t.name = #{name}
            </if>
        </where>
    </select>
</mapper>
```

#### 懒加载

通俗的讲就是按需加载，我们需要什么的时候再去进行什么操作。 而且先从单表查询，需要时再从关联表去关联查询，能大大提高数据库性能，因为查询单表要比关联查询多张表速度要快。 在mybatis中，resultMap可以实现高级映射(使用 association、collection实现一对一及一对多映射)，association、 collection具备延迟加载功能。

```xml
<!-- 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。 -->
<setting name="lazyLoadingEnabled" value="true"/>
<!-- 开启时，任一方法的调用都会加载该对象的所有延迟加载属性。 否则，每个延迟加载属性会按需加载 -->
<setting name="aggressiveLazyLoading" value="false"/>
```

### 完整XML配置文件

mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties>
        <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://192.168.169.130:3306/ydlclass?serverTimezone=Asia/Shanghai&amp;useUnicode=true&amp;characterEncoding=utf8&amp;useSSL=false&amp;useServerPrepStmts=true&amp;cachePrepStmts=true"/>
        <property name="username" value="root"/>
        <property name="password" value="Cirno760"/>
    </properties>
    <settings>
        <setting name="logImpl" value="SLF4J"/>
        <!--将sql日志独立出来，实现只输出sql日志-->
        <setting name="logPrefix" value="mysql.sql."/>
        <!--开启驼峰命名规则-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。 -->
        <setting name="lazyLoadingEnabled" value="true"/>
        <!-- 开启时，任一方法的调用都会加载该对象的所有延迟加载属性。 否则，每个延迟加载属性会按需加载 -->
        <setting name="aggressiveLazyLoading" value="false"/>
    </settings>
    <typeAliases>
        <typeAlias type="com.ydlclass.util.MyDataSourceFactory" alias="druid"/>
        <package name="com.ydlclass.entity"/>
    </typeAliases>
    <!--配置多环境-->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
        <environment id="test">
            <transactionManager type="JDBC"/>
            <dataSource type="druid">
                <property name="druid.driverClassName" value="${driver}"/>
                <property name="druid.url" value="${url}"/>
                <property name="druid.username" value="${username}"/>
                <property name="druid.password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
        <mapper resource="mapper/TeacherMapper.xml"/>
        <mapper resource="mapper/CourseMapper.xml"/>
    </mappers>
</configuration>
```

### 小知识：

#### （2）Mybatis 获取自增主键的方式

> 使用 xml

直接在标签属性上添加 useGeneratedKeys（是否是自增长，必须设置 true） 和 keyProperty（实体类主键属性名称） 、keyColumn（数据库主键字段名称）

```xml
<insert id="insert" useGeneratedKeys="true" keyColumn="id" keyProperty="id">
    insert into `user`(id, username, password)
    values (#{id}, #{username}, #{password})
</insert>
```

> 注解方式 useGeneratedKeys（是否是自增长，必须设置 true） 和 keyProperty（实体类主键属性名称） 、keyColumn（数据库主键字段名称）

```java
@Insert("INSERT INTO user(name,age) VALUES(#{user.name},#{user.age})")
@Options(useGeneratedKeys=true, keyProperty="user.id",keyColumn="id"  )
public int insert(@Param("user")User user);
```

也可以全局设置

```xml
<setting name="useGeneratedKeys" value="true"/>
```

## Mybatis缓存

### 一级缓存：

> 一级缓存失效

1. sqlSession不同
2. 当sqlSession对象相同的时候，查询的条件不同，原因是第一次查询时候，一级缓存中没有第二次查询所需要的数据
3. 当sqlSession对象相同，两次查询之间进行了插入的操作
4. 当sqlSession对象相同，手动清除了一级缓存中的数据

> 一级缓存生命周期

1. MyBatis在开启一个数据库会话时，会创建一个新的SqlSession对象，SqlSession对象中会有一个新的Executor对象，Executor对象中持有一个新的PerpetualCache对象；当会话结束时，SqlSession对象及其内部的Executor对象还有PerpetualCache对象也一并释放掉。
2. 如果SqlSession调用了close()方法，会释放掉一级缓存PerpetualCache对象，一级缓存将不可用。
3. 如果SqlSession调用了clearCache()，会清空PerpetualCache对象中的数据，但是该对象仍可使用。
4. SqlSession中执行了任何一个update操作(update()、delete()、insert()) ，都会清空PerpetualCache对象的数据，但是该对象可以继续使用。

### 二级缓存：

用的比较少，学redis
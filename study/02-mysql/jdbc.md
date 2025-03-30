# JDBC

## 第一章 jdbc概述

Mysql提供的【JDBC实现】称为Mysql Connector,不同的数据库版本需要使用不同的Connector。实际开发时根据数据库版本、JDK版本、选择不同的Connector。

| Connector版本 | MySQL版本     | JDK版本        |
| ------------- | ------------- | -------------- |
| 8.0           | 5.6, 5.7, 8.0 | JDK 8.0 或更高 |
| 5.1           | 5.6, 5.7      | JDK 5.0 或更高 |

Mysql Connector可以在下边的网址中进行下载：

```http
https://developer.aliyun.com/mvn/search
```

## 第二章 获取连接

JDBC中定义了操作数据库的各种接口和类型，以下章节可能会使用到，如下：

| 接口              | 作用                                       |
| ----------------- | ------------------------------------------ |
| Driver            | 驱动接口                                   |
| DriverManager     | 工具类，用于管理驱动，可以获取数据库的链接 |
| Connection        | 表示Java与数据库建立的连接对象（接口）     |
| PreparedStatement | 发送SQL语句的工具                          |
| ResultSet         | 结果集，用于获取查询语句的结果             |

我们使用java代码获取mysql连接时需要以下三个要素：

### 一 、驱动

#### 1、Driver接口介绍

`java.sql.Driver` 接口是所有【驱动程序】需要实现的接口。这个接口是提供给数据库厂商使用的，不同数据库厂商提供不同的实现。

在程序中不需要直接去访问实现了 Driver 接口的类，而是由驱动程序管理器类(java.sql.DriverManager)去调用这些Driver实现。

不同的厂商提供了不同的驱动，如下：

```java
- Oracle的驱动：oracle.jdbc.driver.OracleDriver
- mySql 的驱动：com.mysql.cj.jdbc.Driver | com.mysql.jdbc.Driver
```

将上述jar包拷贝到Java工程的一个目录中，习惯上新建一个lib文件夹，不同的idea有不同的操作。

#### 2、加载与注册驱动

- 加载驱动：我们需要将数据的的驱动实现类加载到JVM中，实现这个目的我们可以使用 Class 类的静态方法 forName()，向其传递要加载的驱动的类名`Class.forName(“com.mysql.cj.jdbc.Driver”)`。当然，理论上你new一个也行，第一次主动使用一个类就会触发类的加载。这里【为什么不new】我们先卖一个关子。

  ```java
  Class clazz = Class.forName("com.mysql.cj.jdbc.Driver");
  ```

- 创建驱动：

  ```java
  Driver driver = (Driver) clazz.newInstance();
  ```

- 注册驱动：DriverManager 类是驱动程序管理器类，负责管理驱动程序。

  使用DriverManager.registerDriver(com.mysql.cj.jdbc.Driver)来注册驱动。

  ```java
  DriverManager.registerDriver(driver);
  ```

### 二、URL

3、MySQL的连接URL编写方式：

- 最简单的写法：jdbc:mysql://localhost:3306/ydlclass。

- 带参数的写法：jdbc:mysql://localhost:3306/ydlclass?key1=value1&key2=value2

- mysql8.0后必需要加上`serverTimezone=UTC`"，指定当前服务器所处的时区。（也要看jdbc的版本）

  ```url
  serverTimezone=Asia/Shanghai
  ```

  我们也可以使用UTC（世界统一时间），但是这个时间和中国的时间差八小时（东八区），所以我们可以这样写：

  ```url
  serverTimezone=GMT%2B8（%2B相当于“+”号）
  ```

**注：**通常一个高版本的mysql的url还会包含以下三个参数：

```text
useUnicode=true&characterEncoding=utf8&useSSL=false
```

1、`useUnicode=true&characterEncoding=UTF-8`的作用是：指定字符的编码、解码格式。

2、MySQL5.7之后要加上`useSSL=false`，mysql5.7以及之前的版本则不用进行添加useSSL=false，会默认为false。

- useSSL=true：就是一般通过证书或者令牌进行安全验证
- useSSL=false：就是通过账号密码进行连接
- SSL协议提供服务主要：
  认证用户服务器，确保数据发送到正确的服务器； 　　 . 加密数据，防止数据传输途中被窃取使用； 维护数据完整性，验证数据在传输过程中是否丢失；

完整的url:

```http
jdbc:mysql://192.168.169.130:3306/ydlclass?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf8&useSSL=false&useServerPrepStmts=true&cachePrepStmts=true
```

**小知识：**

- Oracle 的连接URL编写方式：

  jdbc:oracle:thin:@主机名称:oracle服务端口号:数据库名称

  jdbc:oracle:thin:@localhost:1521:ydlclass

- SQLServer的连接URL编写方式：

  jdbc:sqlserver://主机名称:sqlserver服务端口号:DatabaseName=数据库名称

  jdbc:sqlserver://localhost:1433:DatabaseName=ydlclass

### 三、用户名和密码

可以调用 DriverManager 类的 getConnection() 方法建立到数据库的连接，此方法需要传递三个参数：

- url：jdbc:mysql://localhost:3306/ydlclass?useUnicode=true&characterEncoding=utf8&&useSSL=false&serverTimezone=GMT%2B8
- username：root （mysql数据库的用户名）
- password：root （mysql数据库的密码）

### 四、获取连接

#### 1、完整写法

按照以上的逻辑我们可以写出如下的代码：

```java
@Test
public void testConnection1() throws Exception{
    //1.数据库连接的4个基本要素：
    String url = "jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    String user = "root";
    String password = "root";
    //8.0之后名字改了  com.mysql.cj.jdbc.Driver
    String driverName = "com.mysql.cj.jdbc.Driver";

    //2.实例化Driver
    Class clazz = Class.forName(driverName);
    Driver driver = (Driver) clazz.newInstance();
    //3.注册驱动
    DriverManager.registerDriver(driver);
    //4.获取连接
    Connection conn = DriverManager.getConnection(url, user, password);
    System.out.println(conn);
}
```

#### 2、静态代码块

事实上我们可以写的更简单：

```java
@Test
public void testConnection2() throws Exception{
    //1.数据库连接的4个基本要素：
    String url = "jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    String user = "root";
    String password = "root";
    String driverName = "com.mysql.cj.jdbc.Driver";

    //2.加载驱动 （①实例化Driver ②注册驱动）
    Class.forName(driverName);

    //3.获取连接
    Connection conn = DriverManager.getConnection(url, user, password);
    System.out.println(conn);
}
```

我们可以看一下，mysql给我们的驱动的源码中有如下代码：

```java
package com.mysql.cj.jdbc;
public class Driver extends NonRegisteringDriver implements java.sql.Driver {
    public Driver() throws SQLException {
    }

    static {
        try {
            DriverManager.registerDriver(new Driver());
        } catch (SQLException var1) {
            throw new RuntimeException("Can't register driver!");
        }
    }
}
```

只要，这个类被加载，就会将自己注册给DriverManager。

#### 3、spi机制

当然我们还可以更简单，如下：

```java
@Test
public void testConnection3() throws Exception{
    //1.数据库连接的4个基本要素：
    String url = "jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai";
    String user = "root";
    String password = "root";
    String driverName = "com.mysql.cj.jdbc.Driver";

    //3.获取连接
    Connection conn = DriverManager.getConnection(url, user, password);
    System.out.println(conn);
}
```

这就不得不提一下spi机制，我们仅仅是引入了这个jar包，他为什么会自动加载呢？

SPI全称Service Provider Interface，是Java提供的一套用来被第三方实现或者扩展的API，它可以用来启用框架扩展和替换组件。

![image-20220810160939944](..\img\image-20220810160939944-be81acea.png)

SPI 实际上是 “基于接口的编程＋策略模式＋配置文件” 组合实现的动态加载机制。

当前场景下的执行逻辑是：

![image-20220810153158842](..\img\image-20220810153158842-d54c3956.png)

其中通过SPI机制加载的逻辑是？

1、第一次主动使用DriverManager（调用静态方法getConnection）的时候会加载这个类。

我们在getConnection方法中跟踪，发现在方法ensureDriversInitialized中有如下代码，这段代码就是使用spi机制加载实现了Driver接口的类：

```java
ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class);
```

2、SPI机制工作，他会在classpath中寻找`META-INF/services/`目录下的所有文件，并加载所有名称为`java.sql.Driver`的文件，因为上一步已经告诉我们加载的目标接口对应的实现类。

![image-20220810155216681](..\img\image-20220810155216681-3639ccd4.png)

![image-20220810132753288](..\img\image-20220810132753288-d4ca8dd9.png)

3、将文件内所对应的实现类的名字使用反射进行加载。

4、加载`com.mysql.cj.jdbc.Driver`又会触发他的静态代码块被调用。

```java
package com.mysql.cj.jdbc;
public class Driver extends NonRegisteringDriver implements java.sql.Driver {
    public Driver() throws SQLException {
    }

    static {
        try {
            DriverManager.registerDriver(new Driver());
        } catch (SQLException var1) {
            throw new RuntimeException("Can't register driver!");
        }
    }
}
```

#### 4、配置文件

事实上，我们将url、driverName、username和password全部写死在代码中是有问题的，如果我们将来想换数据库，想换密码等就必须重新写代码、重新编译。

- 一个程序一旦打包完成，部署完成，重新编译是个很麻烦的事情。
- 相同的代码可能还要部署在不同的环境，比如测试有测试环境、生产有生产环境、开发有开发环境，每个环境的数据源都是不一样的，不能混着用。

```java
@Test
public void testConnection4() throws Exception{
    //1.数据库连接的4个基本要素：
    InputStream in = TestUser.class.getClassLoader().getResourceAsStream("jdbc.config");
    Properties properties = new Properties();
    properties.load(in);

    String url = properties.getProperty("url");
    String user = properties.getProperty("user");
    String password = properties.getProperty("password");
    String driverName = properties.getProperty("driverName");

    //2.加载驱动 （①实例化Driver ②注册驱动）
    Class.forName(driverName);

    //3.获取连接
    Connection conn = DriverManager.getConnection(url, user, password);
    System.out.println(conn);
}

}
```

## 第三章 常用api

### 三、PreparedStatement的使用

（2） 如何使用预编译？

```sql
-- 定义一个预编译语句
prepare name from statement; 
```

第一步：定义预编译SQL语句：

```sql
prepare statement from 'select * from user where id=?';
```

第二步：设置参数值：

```sql
set @id=1;
```

第三步：执行预编译SQL语句：

```sql
execute statement using @id;
```

如果是多个参数使用逗号隔开：

```sql
prepare statement from 'select * from user where id=? and username = ?';
set @id=1,@username='zs';
execute statement using @id , @username;
```

#### 2、使用PreparedStatement

- 通过调用 Connection 对象的 【preparedStatement(String sql)】方法获取 PreparedStatement对象
- PreparedStatement 接口是 Statement 的子接口，它表示一条【预编译】过的 SQL 语句
- PreparedStatement 对象所代表的 SQL 语句中的参数用问号(?)来表示，调用 PreparedStatement 对象的 setXxx() 方法来设置这些参数。

```java
@Test
public void testQuery3()  {

    // 1、定义资源
    Connection connection = null;
    ResultSet resultSet = null;
    PreparedStatement statement = null;
    String sql = "select * from user where id = ?";

    try {
        // 获取连接
        connection = DBUtil.getConnection();
        // 获取使用预编译的statement
        statement = connection.prepareStatement(sql);
        statement.setInt(1,1);
        // 获取结果集
        resultSet = statement.executeQuery();
        // 封装结果
        List<User> users = new ArrayList<>();
        while (resultSet.next()){
            User user = new User();
            int id = resultSet.getInt(1);
            String username = resultSet.getString(2);
            String password = resultSet.getString(3);
            Date date = resultSet.getDate(4);
            user.setId(id);
            user.setUsername(username);
            user.setPassword(password);
            user.setDate(date);
            users.add(user);
        }
        System.out.println(users);
    } catch (SQLException e){
        e.printStackTrace();
    } finally {
        // 关闭资源
        DBUtil.closeAll(connection,statement,resultSet);
    }

}
```

**事实上：**

默认使用PreparedStatement是【不能执行预编译】的，这需要在url中给出`useServerPrepStmts=true`参数（MySQL Server 4.1之前的版本是不支持预编译的，而Connector/J在5.0.5以后的版本，默认是没有开启预编译功能的），url参数如下：

```http
useServerPrepStmts=true&cachePrepStmts=true
```

**注：**当使用不同的PreparedStatement对象来执行相同的SQL语句时，还是会出现编译两次的现象，这是因为驱动没有缓存编译后的函数key，会二次编译。如果希望缓存编译后函数的key，那么就要设置`cachePrepStmts参数为true`，如上url的参数。

url添加了参数之后才能保证mysql驱动先把SQL语句发送给服务器进行预编译，然后在执行executeQuery()时只是把参数发送给服务器。

执行流程如下：

![image-20220818200720649](..\img\image-20220818200720649-b7a5ccc8.png)

为了查看效果，我们不妨打开mysql的通用查询日志：

```text
show VARIABLES like '%general_log%'
SET GLOBAL general_log=1
```

执行成功后，查看日志，发现执行的sql语句依然是普通的sql：

![image-20220818201611291](..\img\image-20220818201611291-082e3595.png)

将url增加参数之后，再次执行，发现日志如下，确实开启了预编译：

![image-20220818201707355](..\img\image-20220818201707355-1510b547.png)



#### 4、使用PreparedStatement实现增、删、改操作

```java
// 获取statement
statement = connection.prepareStatement(sql);
statement.setInt(1,id);
// 获取结果集
resultSet = statement.executeQuery();
```

## 第四章 数据库事务

### 一、事务处理

在jdbc中使用使用的基本步骤：

1. 调用 Connection 对象的 setAutoCommit(false) 以取消自动提交事务
2. 在所有的 SQL 语句都成功执行后，调用 commit()方法提交事务
3. 在出现异常时，调用 rollback()方法回滚事务
4. 若此时 Connection 没有被关闭，还可能被重复使用，则需要恢复其自动提交状态 setAutoCommit(true)

```java
public class DBUtil {

    private static HikariDataSource dataSource;
    public static final ThreadLocal<Connection> THREAD_LOCAL = new ThreadLocal<>();


    static {
        HikariConfig hikariConfig = new HikariConfig("Hikari.properties");
        dataSource = new HikariDataSource(hikariConfig);
    }

    public static Connection getConnection(){
        Connection connection = THREAD_LOCAL.get();
        if (connection == null) {
            try {
                connection = dataSource.getConnection();
                THREAD_LOCAL.set(connection);
            } catch (SQLException e) {
                throw new RuntimeException("连接获取异常");
            }
        }
        return connection;
    }

    public static void closeConnection(Connection connection){
        if (connection != null) {
            try {
                connection.close();
                THREAD_LOCAL.remove();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    public static void closeStatement(Statement statement){
        if (statement != null) {
            try {
                statement.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    public static void closeResultSet(ResultSet resultSet){
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

```java
public class Transaction {

    public static void begin(){
        Connection connection = DBUtil.getConnection();
        try {
            connection.setAutoCommit(false);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void commit(){
        Connection connection = DBUtil.getConnection();
        try {
            connection.commit();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void rollback(){
        Connection connection = DBUtil.getConnection();
        try {
            connection.rollback();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void close() {
        Connection connection = DBUtil.getConnection();
        try {
            connection.setAutoCommit(true);
            DBUtil.closeConnection(connection);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }
}
```

```java
try {
    Transaction.begin();
    userDao.updateBalance(userId,-(goods.getPrice() * n));
    goodsDao.updateStock(goodsId,-n);
    Transaction.commit();
} catch (Exception e) {
    e.printStackTrace();
    Transaction.rollback();
} finally {
    Transaction.close();
}
```

## 第五章 数据库连接池

### 一、连接池概述

#### 1、 JDBC数据库连接池的必要性

传统的jdbc开发形式存在的问题:

- 普通的JDBC数据库连接使用【DriverManager】来获取，每次向数据库建立连接的时候都要将 【Connection】加载到内存中，再验证用户名和密码（保守估计需要花费0.05s～1s的时间）。
- 需要【数据库连接】的时候，就向数据库申请一个，执行完成后再【断开连接】。这样的方式将会消耗大量的资源和时间。数据库的连接资源并没有得到很好的重复利用。若同时有几百人甚至几千人在线，频繁的进行数据库连接操作将占用很多的系统资源，严重的甚至会造成服务器的崩溃。
- 对于每一次数据库连接，使用完后都得断开。否则，如果程序出现异常而未能关闭，将会导致数据库系统中的内存泄漏，最终将导致重启数据库。（回忆：何为Java的内存泄漏？）
- 这种开发方式不能控制【被创建的连接对象数】，系统资源会被毫无顾及的分配出去，如连接过多，也可能导致内存泄漏，服务器崩溃。

#### 2、 数据库连接池技术

为解决传统开发中的数据库连接问题，可以采用数据库连接池技术。

- 数据库连接池的基本思想：就是为数据库连接建立一个“缓冲池”。预先在缓冲池中放入一定数量的连接，当需要建立数据库连接时，只需从“缓冲池”中取出一个，使用完毕之后再放回去。
- 数据库连接池负责分配、管理和释放数据库连接，它允许应用程序【重复使用一个现有的数据库连接】，而不是重新建立一个。
- 数据库连接池在初始化时将【创建一定数量】的数据库连接放到连接池中。无论这些连接是否被使用，连接池都将一直保证至少拥有一定量的连接数量。连接池的【最大数据库连接数】限定了这个连接池能占有的最大连接数，当应用程序向连接池请求的连接数超过最大连接数量时，这些请求将被加入到等待队列中。

#### 3、数据库连接池技术的优点

（1）资源重用

由于数据库连接得以重用，避免了频繁创建，释放连接引起的大量性能开销。在减少系统消耗的基础上，另一方面也增加了系统运行环境的平稳性。

（2）更快的系统反应速度

数据库连接池在初始化过程中，往往已经创建了若干数据库连接置于连接池中备用。此时连接的初始化工作均已完成。对于业务请求处理而言，直接利用现有可用连接，避免了数据库连接初始化和释放过程的时间开销，从而减少了系统的响应时间。

（3）新的资源分配手段

对于多应用共享同一数据库的系统而言，可在应用层通过数据库连接池的配置，实现某一应用最大可用数据库连接数的限制，避免某一应用独占所有的数据库资源。

（4）统一的连接管理，避免数据库连接泄漏

在较为完善的数据库连接池实现中，可根据预先的占用超时设定，强制回收被占用连接，从而避免了常规数据库连接操作中可能出现的资源泄漏。

#### 4、 多种开源的数据库连接池

【DataSource】通常被称为【数据源】，它包含【连接池】和【连接池管理组件】两个部分，习惯上也经常把 DataSource 称为连接池。

【DataSource】用来取代DriverManager来获取Connection，获取速度快，同时可以大幅度提高数据库访问速度。DataSource同样是jdbc的规范，针对不通的连接池技术，我们可以有不同的实现。

特别注意：

- 数据源和数据库连接不同，数据源无需创建多个，它是产生数据库连接的工厂，通常情况下，一个应用只需要一个数据源，当然也会有多数据源的情况。
- 当数据库访问结束后，程序还是像以前一样关闭数据库连接：conn.close(); 但conn.close()并没有关闭数据库的物理连接，它仅仅把数据库连接释放，归还给了数据库连接池。

### 二、连接池技术

#### 1、Druid（德鲁伊）

```properties
druid.driverClassName=com.mysql.cj.jdbc.Driver
druid.url=jdbc:mysql://127.0.0.1:3306/ydlclass?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf8&useSSL=false
druid.username=root
druid.password=root
druid.initialSize=10
druid.minIdle=20
druid.maxActive=50
druid.maxWait=500
    
# 1、初始化时建立物理连接的个数 默认10
# 2、最小连接池数量  默认20
# 2、最大连接池数量  默认50
# 3、获取连接时最大等待时间，单位毫秒。
```

```java
Properties pro = new Properties();		 pro.load(TestDruid.class.getClassLoader().getResourceAsStream("druid.properties"));
DataSource ds = DruidDataSourceFactory.createDataSource(pro);
```

#### 3、 Hikari（光）

```properties
jdbcUrl=jdbc:mysql://localhost:3306/ydlclass?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
username=root
password=root
driverClassName=com.mysql.cj.jdbc.Driver

idleTimeout=600000
connectionTimeout=30000
minimumIdle=10
maximumPoolSize=60

# 1、保持连接的最大时长，比如连接多了，最小连接数不够用，就会继续创建，比如又创建了10个，如果这时没有了业务，超过该设置的时间，新创建的就会被关闭
# 2、连接的超时时间
# 3、连接池最少的连接数
# 4、连接池最大的连接数
```

```java
HikariConfig hikariConfig = new HikariConfig("hikari.properties");
HikariDataSource dataSource = new HikariDataSource(hikariConfig);
```

## 第六章、通用DAO的设计

```java
public interface BaseDao<T> {
    int insert(T t);
    int update(T t);
    int delete(int id, Class<T> clazz);

    T selectById(int id, Class<T> clazz);

    List<T> selectAll(Class<T> clazz);
}
```

```java
public class BaseDaoImpl<T> implements BaseDao<T> {

    public int insert(T t) {
        // 拼接sql
        Class<?> clazz = t.getClass();
        Field[] fields = clazz.getDeclaredFields();
        StringBuilder sb = new StringBuilder("insert into ");
        sb.append(clazz.getSimpleName()).append(" (");
        for (Field field : fields) {
            sb.append(field.getName()).append(",");
        }
        // 删除最后一个逗号，并拼接剩余sql
        sb.replace(sb.length()-1,sb.length(),") values (");
        for (Field field : fields) {
            field.setAccessible(true);
            sb.append("?,");
        }
        sb.replace(sb.length()-1,sb.length(),");");

        System.out.println(sb);

        // 执行sql
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = DBUtil.getConnection();
            statement = connection.prepareStatement(sb.toString());
            for (int i = 0; i < fields.length; i++) {
                fields[i].setAccessible(true);
                statement.setObject(i+1,fields[i].get(t));
            }
            return statement.executeUpdate();
        } catch (SQLException | IllegalAccessException e) {
            e.printStackTrace();
            return -1;
        } finally {
            DBUtil.closeConnection(connection);
            DBUtil.closeStatement(statement);
        }
    }
    public int update(T t) {
        // 拼接sql
        Class<?> clazz = t.getClass();
        Field[] fields = clazz.getDeclaredFields();
        StringBuilder sb = new StringBuilder("update ");
        sb.append(clazz.getSimpleName()).append(" set ");
        // 从1开始，不修改0字段id
        for (int i = 1; i < fields.length; i++) {
            sb.append(fields[i].getName()).append("=?,");
        }
        // 删除最后一个逗号，并拼接剩余sql
        sb.replace(sb.length()-1,sb.length()," where id=?;");

        System.out.println(sb);

        // 执行sql
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = DBUtil.getConnection();
            statement = connection.prepareStatement(sb.toString());
            for (int i = 1; i < fields.length; i++) {
                fields[i].setAccessible(true);
                statement.setObject(i,fields[i].get(t));
            }
            fields[0].setAccessible(true);
            statement.setObject(fields.length,fields[0].get(t));
            return statement.executeUpdate();
        } catch (SQLException | IllegalAccessException e) {
            e.printStackTrace();
            return -1;
        } finally {
            DBUtil.closeConnection(connection);
            DBUtil.closeStatement(statement);
        }
    }
    public int delete(int id, Class<T> clazz) {
        // 拼接sql
        Field[] fields = clazz.getDeclaredFields();
        StringBuilder sb = new StringBuilder("delete from ");
        sb.append(clazz.getSimpleName()).append(" where id=?;");

        System.out.println(sb);

        // 执行sql
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = DBUtil.getConnection();
            statement = connection.prepareStatement(sb.toString());

            fields[0].setAccessible(true);
            statement.setObject(1,id);

            return statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            return -1;
        } finally {
            DBUtil.closeConnection(connection);
            DBUtil.closeStatement(statement);
        }
    }

    public T selectById(int id, Class<T> clazz) {
        // 拼接sql
        Field[] fields = clazz.getDeclaredFields();
        StringBuilder sb = new StringBuilder("select ");
        for (Field field : fields) {
            sb.append(field.getName()).append(",");
        }
        sb.replace(sb.length()-1,sb.length()," from ");
        sb.append(clazz.getSimpleName()).append(" where id=?;");

        System.out.println(sb);

        // 执行sql
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = DBUtil.getConnection();
            statement = connection.prepareStatement(sb.toString());

            fields[0].setAccessible(true);
            statement.setObject(1,id);

            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                Constructor<T> constructor = clazz.getDeclaredConstructor();
                T t = constructor.newInstance();
                for (int i = 0; i < fields.length; i++) {
                    fields[i].setAccessible(true);
                    fields[i].set(t,resultSet.getObject(fields[i].getName()));
                }
                return t;
            } else {
                return null;
            }
        } catch (SQLException | NoSuchMethodException | InstantiationException | IllegalAccessException |
                 InvocationTargetException e) {
            e.printStackTrace();
            return null;
        } finally {
            DBUtil.closeConnection(connection);
            DBUtil.closeStatement(statement);
        }
    }

    public List<T> selectAll(Class<T> clazz) {
        // 拼接sql
        Field[] fields = clazz.getDeclaredFields();
        StringBuilder sb = new StringBuilder("select ");
        for (Field field : fields) {
            sb.append(field.getName()).append(",");
        }
        sb.replace(sb.length()-1,sb.length()," from ");
        sb.append(clazz.getSimpleName()).append(";");

        System.out.println(sb);

        // 执行sql
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = DBUtil.getConnection();
            statement = connection.prepareStatement(sb.toString());

            ResultSet resultSet = statement.executeQuery();
            ArrayList<T> list = new ArrayList<>();
            while (resultSet.next()) {
                Constructor<T> constructor = clazz.getDeclaredConstructor();
                T t = constructor.newInstance();
                for (int i = 0; i < fields.length; i++) {
                    fields[i].setAccessible(true);
                    fields[i].set(t,resultSet.getObject(fields[i].getName()));
                }
                list.add(t);
            }
            return list;
        } catch (SQLException | NoSuchMethodException | InstantiationException | IllegalAccessException |
                 InvocationTargetException e) {
            e.printStackTrace();
            return null;
        } finally {
            DBUtil.closeConnection(connection);
            DBUtil.closeStatement(statement);
        }
    }

}
```
# 第一章javaee入门

## HTTP协议

### HTTP报文格式

一个完整的HTTP协议的报文主要由以下三个部分组成：

1. 起始行（请求行、响应行）：起始行 start line : 描述请求或响应的基本信息。
2. 首部字段（请求头、响应头）：使用key-value的形式更加详细的说明报文。
3. 消息正文（请求体、响应体）：实际的传输数据，不一定是文本，也有可能是图片、音频、视频等二进制数据。

一个请求报文的格式如下：

![image-20210922135409188](..\img\image-20210922135409188-f00c2289.png)

一个响应的报文格式如下：

![image-20210926112949153](..\img\image-20210926112949153-5d39d36e.png)

#### 响应码

- 1xx消息——请求已被服务器接收，继续处理
- 2xx成功——请求已成功被服务器接收、理解、并接受
- 3xx重定向——需要后续操作才能完成这一请求
- 4xx请求错误——请求含有词法错误或者无法被执行，客户端
- 5xx服务器错误——服务器在处理某个正确请求时发生错误，500

一些常见的响应码

|      |                       |                                                              |
| ---- | --------------------- | ------------------------------------------------------------ |
| 200  | OK                    | 从客户端发送的请求，服务端已经正常处理了。                   |
| 204  | No Content            | 服务端已经正常处理了,但是响应中没有实体，也不允许有实体。    |
| 301  | Moved Permanently     | 永久性，重定向。表示请求的资源已经拥有了新的uri，需要重新访问。 |
| 302  | Moved Temporarily     | 临时重定向。                                                 |
| 400  | Bad Request           | 请求报文中存在语法错去。                                     |
| 401  | Unauthorized          | 请求需要有通过HTTP请求的认证信息。                           |
| 403  | Forbidden             | 请求被阻止，可能因为某些权限问题，比如访问的文件没有权限等。 |
| 404  | Not Found             | 表示在服务器上没有你要找的资源                               |
| 500  | Internal server Error | 服务器执行程序出现异常                                       |

#### http首部字段

HTTP/1.1 规范定义了如下 47 种首部字段，分为四大类，我们大致预览一下，不能一一讲解，详情可以通过看书深入理解

1、通用首部字段 9个

| 首部字段名        | 说明                       |
| ----------------- | -------------------------- |
| Cache-Control     | 控制缓存的行为             |
| Connection        | 连接的管理                 |
| Date              | 创建报文的日期时间         |
| Pragma            | 报文指令                   |
| Trailer           | 报文末端的首部一览         |
| Transfer-Encoding | 指定报文主体的传输编码方式 |
| Upgrade           | 升级为其他协议             |
| Via               | 代理服务器的相关信息       |
| Warning           | 错误通知                   |

2、请求首部字段 共18个

| 首部字段名          | 说明                                          |
| ------------------- | --------------------------------------------- |
| Accept              | 用户代理可处理的媒体类型                      |
| Accept-Charset      | 优先的字符集                                  |
| Accept-Encoding     | 优先的内容编码                                |
| Accept-Language     | 优先的语言（自然语言）                        |
| AuthorizationWeb    | 认证信息                                      |
| Expect              | 期待服务器的特定行为                          |
| From                | 用户的电子邮箱地址                            |
| Host                | 请求资源所在服务器                            |
| If-Match            | 比较实体标记（ETag）                          |
| If-Modified-Since   | 比较资源的更新时间                            |
| If-None-Match       | 比较实体标记（与 If-Match 相反）              |
| If-Range            | 资源未更新时发送实体 Byte 的范围请求          |
| If-Unmodified-Since | 比较资源的更新时间（与If-Modified-Since相反） |
| Max-Forwards        | 最大传输逐跳数                                |
| Proxy-Authorization | 代理服务器要求客户端的认证信息                |
| Range               | 实体的字节范围请求                            |
| Referer             | 对请求中 URI 的原始获取方                     |
| TE                  | 传输编码的优先级                              |
| User-Agent          | 客户端程序的信息                              |

3、响应首部字段 共9个

| 首部字段名         | 说明                         |
| ------------------ | ---------------------------- |
| Accept-Ranges      | 是否接受字节范围请求         |
| Age                | 推算资源创建经过时间         |
| ETag               | 资源的匹配信息               |
| Location           | 令客户端重定向至指定URI      |
| Proxy-Authenticate | 代理服务器对客户端的认证信息 |
| Retry-After        | 对再次发起请求的时机要求     |
| Server             | HTTP服务器的安装信息         |
| Vary               | 代理服务器缓存的管理信息     |
| WWW-Authenticate   | 服务器对客户端的认证信息     |

4、实体首部字段 共10个

| 首部字段名       | 说明                         |
| ---------------- | ---------------------------- |
| Allow            | 资源可支持的HTTP方法         |
| Content-Encoding | 实体主体适用的编码方式       |
| Content-Language | 实体主体的自然语言           |
| Content-Length   | 实体主体的大小（单位：字节） |
| Content-Location | 替代对应资源的URI            |
| Content-MD5      | 实体主体的报文摘要           |
| Content-Range    | 实体主体的位置范围           |
| Content-Type     | 实体主体的媒体类型           |
| Expires          | 实体主体过期的日期时间       |
| Last-Modified    | 资源的最后修改日期时间       |

## 手写小型Tomcat

详见D:\Java\code\javaweb

# 第二章 JAKARTAEE

更多的标准我们可以看这里：https://jakarta.ee/specifications/

## Tomcat

https://tomcat.apache.org

# 第三章 Web开发进阶

## Tomcat架构和执行流程

### 1、首先介绍几个概念

Server：服务器，启动一个tomcat就是启动了一个服务器

Service：服务，一个server可以包含多个service 一个service维护多个Connector和一个Engine

Engine：叫引擎，也有资料叫Container，一个服务可以开一个引擎，就是一个公司可以有很多个门，不同身份的人从不同的门进，但是具体干活的就一个部门。引擎负责处理请求，不需要考虑请求链接，协议等。

Context：一个Context管理一个应用，其实就是我们写的程序。

Wrapper：每个都封装着一个Servlet（当然只局限于普通的Http请求）。

![image-20210928105304421](..\img\image-20210928105304421-7276e993.png)

### 2、Tomcat运行流程

客户发送一个请求：http://localhost:8080/test/index.html。请求被发送到本机端口8080后，执行流程如下：

1. 被在那里侦听的Coyote HTTP/1.1 Connector获得,然后引擎负责处理请求，不需要考虑请求链接，协议等。
2. Connector把该请求交给它所在的Service的Engine来处理，并等待Engine的回应。
3. Engine获得请求localhost:8080/test/index.jsp，匹配它所有虚拟主机Host。
4. Engine匹配到名为localhost的Host(即使匹配不到也把请求交给该Host处理，因为该Host被定义为该Engine的默认主机)。
5. localhost Host获得请求/test/index.jsp，匹配它所拥有的所有Context。
6. Host匹配到路径为/test的Context(如果匹配不到就把该请求交给路径名为""的Context去处理)。
7. path="/test"的Context获得请求/index.jsp，在它的mapping table中寻找对应的servlet。
8. Context匹配到URL PATTERN为*.jsp的servlet，对应于JspServlet类，构造HttpServletRequest对象和HttpServletResponse对象，作为参数调用JspServlet的doGet或doPost方法。
9. Context把执行完了之后的HttpServletResponse对象返回给Host。
10. Host把HttpServletResponse对象返回给Engine。
11. Engine把HttpServletResponse对象返回给Connector。
12. Connector把HttpServletResponse对象返回给客户browser。

 我们在使用tomcat的时候可以不理会中间的实现的任何过程，专心于我们的业务代码的编写，不停的写servlet就行了，极大的提升了写代码的效率。

# 第四章 Servlet规范

### 1、 什么是 Servlet

 Servlet 是基于 Jakarta 技术的 Web 组件，由容器管理，可生成动态内容。与其他基于 Jakarta 技术的组件一样，servlet 是独立于平台的 Java 类，它们被编译为与平台无关的字节码，这些字节码可以动态加载到支持 Jakarta 技术的 Web 服务器中并由其运行。容器，有时也称为 servlet 引擎，是提供 servlet 功能的 Web 服务器扩展。Servlet 通过 servlet 容器实现的请求/响应范式与 Web 客户端交互。

### 2、 什么是 Servlet 容器

 Servlet 容器是 Web 服务器或应用程序服务器的一部分，它提供发送请求和响应的网络服务、解码基于 MIME 的请求以及格式化基于 MIME 的响应。Servlet 容器还通过其生命周期包含和管理 Servlet。

Servlet 容器可以内置到主机 Web 服务器中，也可以通过该服务器的本机扩展 API 作为附加组件安装到 Web 服务器。Servlet 容器也可以内置于或可能安装在支持 Web 的应用程序服务器中。

 所有 Servlet 容器都必须支持 HTTP 作为请求和响应的协议，但可以支持其他基于请求/响应的协议，例如 HTTPS（基于 SSL 的 HTTP）。容器必须实现的 HTTP 规范的必需版本是 HTTP/1.1 和 HTTP/2。

 Java SE 8 是必须用来构建 Servlet 容器的底层 Java 平台的最低版本。

### 3、 一个例子

以下是一个典型的事件序列：

1. 客户端（例如，Web 浏览器）访问 Web 服务器并发出 HTTP 请求。
2. 请求由 Web 服务器接收并传递给 Servlet 容器。Servlet 容器可以在与主机 Web 服务器相同的进程中运行，也可以在同一主机上的不同进程中运行，或者在与其处理请求的 Web 服务器不同的主机上运行。
3. Servlet 容器根据其Servlet 的配置确定调用哪个 Servlet，并使用代表请求和响应的对象调用它。
4. Servlet 使用请求对象来找出远程用户是谁、`POST`作为此请求的一部分发送的HTTP参数以及其他相关数据。Servlet 执行它编程的任何逻辑，并生成数据发送回客户端。它通过响应对象将此数据发送回客户端。
5. Servlet 处理完请求后，Servlet 容器会确保正确刷新响应，并将控制权返回给主机 Web 服务器。

## 二、Servlet核心技术

### **1、Servlet加载时机**

 在默认情况下，当Web客户**第一次请求访问某个Servlet时，Web容器会创建这个Servlet的实例。** 当设置了web.xml中的子元素后，Servlet容器在启动Web应用时，将按照指定顺序创建并初始化这个Servlet。设置的数值**大于0**即可。例如：

```xml
<servlet>
    <servlet-name>HelloServlet</servlet-name>
    <servlet-class>com.ydlclass.servlet.HelloServlet</servlet-class>
    <load-on-startup>2</load-on-startup>
</servlet>
```

### 2、Servlet的生命周期

- init()：Servlet进行初始化；
- service()：Servlet处理客户端的请求；
- destroy()：Servlet结束，释放资源；

> init()方法：

 Servlet被装载后，Servlet容器创建一个Servlet实例并且调用Servlet的init()方法进行初始化，在Servlet生命周期中init()方法**只被调用一次**。

> service()方法：

 service()方法是执行实际任务的主要方法。Servlet 容器（即 Web 服务器）调用 service()方法来处理来自客户端（浏览器）的请求，并把格式化的响应写回给客户端。

> destroy()方法：

 destroy()方法只会被调用一次，在关闭Web容器时会调用。 在调用destroy()方法之后，Servlet对象被标记为垃圾回收。

**总结：**

- 在首次访问某个Servlet时，init()方法会被执行，而且也会执行service()方法。
- 再次访问时，只会执行service()方法，不再执行init()方法。
- 在关闭Web容器时会调用destroy()方法。

### 3、实现一个Servlet

 当服务器接收到一个请求，就要有一个Servlet去处理这个请求，所以完成一个Servlet通常需要两步走。一方面要写一个java程序定义一个Servlet，另一方面要配置一下Servlet确定这个Servlet要处理哪一个请求。

#### **（1）创建Servlet的三种方式**

- 实现javax.servlet.Servlet接口。
- 继承javax.servlet.GenericServlet类。
- 继承javax.servlet.http.HttpServlet类。

我们在日常开发中一般会使用第三种方法来进行Servlet的创建，前两种方法理解即可。

## 三、Servlet的匹配规则

### 1、四种匹配规则

#### （1） **精确匹配**

`<url-pattern>`中配置的项必须与url完全精确匹配。

```xml
<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/user/users.html</url-pattern>
    <url-pattern>/index.html</url-pattern>
    <url-pattern>/user/addUser</url-pattern>
</servlet-mapping>
```

#### （2） 路径匹配

**以“/”字符开头，并以“/\*”结尾的字符串用于路径匹配**

```xml
<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/user/*</url-pattern>
</servlet-mapping>
```

#### （3）扩展名匹配

**以“\*.”开头的字符串被用于扩展名匹配**

```xml
<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>*.jsp</url-pattern>
    <url-pattern>*.do</url-pattern>
</servlet-mapping>
```

#### （4） 缺省匹配

```xml
<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

### 2、匹配顺序

1. 精确匹配。

2. 路径匹配，先最长路径匹配，再最短路径匹配。

3. 扩展名匹配。

   **注意：使用扩展名匹配，前面就不能有任何的路径。**

4. 缺省匹配，以上都找不到Servlet，就用默认的Servlet，配置为`<url-pattern>/</url-pattern>`

### 3、需要注意的问题

- “/*”和“/”均会拦截静态资源的加载，需要特别注意

## 四、请求和响应

### 1、请求-request

#### 请求转发-重要

请求转发表示由`多个Servlet共同来处理一个请求`。例如Servlet1来处理请求，然后Servlet1又转发给Servlet2来继续处理这个请求。

在AServlet中，把请求转发到BServlet：

```java
public class AServlet extends HttpServlet {    
    public void doGet(HttpServletRequest  request, HttpServletResponse response) throws ServletException,  IOException {      
        System.out.println("AServlet");     
        RequestDispatcher rd =  request.getRequestDispatcher("/BServlet");      
        rd.forward(request, response);    
    }  
}
public class BServlet extends HttpServlet {    
    public void doGet(HttpServletRequest  request, HttpServletResponse response)  throws ServletException,  IOException {      
        System.out.println("BServlet");    
    }  
} 
```

###  2、响应-response

```java
// 设置字符编码
response.setContentType("text/html;charset=utf-8")
// 重定向
response.sendRedirect("http://www.baidu.com");
```

### 4、session和cookie

http本身是不保存状态的，所以推出了session和cookie机制
cookie是记录在浏览器端的一个字符串
session是保存在服务器端的一个对象。它们俩互相配合让服务器有了能识别客户端一些状态的能力。

#### （1）cookie

cookie是可以通过key和value构建的，我们可以给cookie添加一个有效期，单位是秒：

```text
Set-Cookie：customer=huangxp; path=/foo; domain=.ibm.com; expires= Wednesday, 22-OCT-05 23:12:40 GMT;
```

```java
Cookie cookie = new Cookie("jsession", UUID.randomUUID().toString());
resp.addCookie(cookie);
```

cookie除了key-value之外，还有一些字段用来控制cookie的行为：

> expires/Max-Age 字段

 为此cookie超时时间。若设置其值为一个时间，那么当到达此时间后，此cookie失效。不设置的话默认值是Session，当浏览器关闭(不是浏览器标签页，而是整个浏览器) 后，此cookie失效。

1、过期时间，定cookie的生命期。如果是正数单位是秒，如果是负数代表关闭浏览器失效，如果设置成零也就是将cookie失效。

2、具体是值是过期日期。如果想让cookie的存在期限超过当前浏览器会话时间，就必须使用这个属性。当过了到期日期时，浏览器就可以删除cookie文件，没有任何影响。

> Secure字段

设置是否只能通过https来传递此条cookie

- 安全，指定cookie的值通过网络如何在用户和WEB服务器之间传递。
- 这个属性的值或者是“secure”，或者为空。缺省情况下，该属性为空，也就是使用不安全的HTTP连接传递数据。如果一个 cookie 标记为secure，那么，它与WEB服务器之间就通过HTTPS或者其它安全协议传递数据。不过，设置了secure属性不代表其他人不能看到你机器本地保存的cookie。换句话说，把cookie设置为secure，只保证cookie与WEB服务器之间的数据传输过程加密，而保存在本地的cookie文件并不加密。如果想让本地cookie也加密，得自己加密数据。

> Http字段

cookie的httponly属性。若此属性为true，则只有在http请求头中会带有此cookie的信息，而不能通过document.cookie来访问此cookie。

- 如果在Cookie中设置了”HttpOnly”属性，那么通过后台程序读取，JS脚本将无法读取到Cookie信息，这样能有效的防止XSS攻击。
- 但是设置HttpOnly属性，Cookie盗窃的威胁并没有彻底消除，因为cookie还是有可能传递的过程中被监听捕获后信息泄漏。

> domain字段

- 域，指定关联的WEB服务器或域。
- 值是域名。这是对path路径属性的一个延伸。[如果我们想让dev.mycompany.com 能够访问bbs.mycompany.com设置的cookies，该怎么办? 我们可以把domain属性设置成“mycompany.com”，并把path属性设置成“/”。不能把cookies**域属性设置成与设置它的服务器的所在域**不同的值。

> Path字段

path字段为可以访问此cookie的页面路径。 比如domain是abc.com，path是/test，那么只有/test路径下的页面可以读取此cookie。

- 路径，指定与cookie关联的WEB页。
- 值可以是一个目录，或者是一个路径。如果/head/index.html 建立了一个cookie，那么在/head/目录里的所有页面，以及该目录下面任何子目录里的页面都可以访问这个cookie。这就是说，在/head/stories/articles 里的任何页面都可以访问/head/index.html建立的cookie。但是，如果/zdnn/ 需要访问/head/index.html设置的cookies，该怎么办?这时，我们要把cookies的path属性设置成“/”。在指定路径的时候，凡是来自同一服务器，URL里有相同路径的所有WEB页面都可以共享cookies。现在看另一个例子：如果想让 /head/filters/ 和/head/stories/共享cookies，就要把path设成“/head”。

#### （2）session

创建时机：

服务器端第一次调用getSession()的时候会创建；(保存在服务器内存中)

```java
HttpSession session = req.getSession();
```

这也就意味着，调用这个方法的时候，会去获取session，如果获得了就获得了，如果不能获取则会执行以下操作：

- 在内存创建一个session，同时给这个session一个id
- 响应中加一个首部set-Cookie，带上这个id，这个默认的cookie，会在关闭浏览器时消除。

内存中的session不会一直存在，配置session的失效时间

```xml
<session-config>
    <session-timeout>30</session-timeout>
</session-config>
```

### 5、Servlet三大域对象

| 对象名称    | 对象的类型         |
| ----------- | ------------------ |
| request     | HttpServletRequest |
| session     | HttpSession        |
| application | ServletContext     |

```java
xxx.setAttribute(String name,Object value);
xxx.getAttribute(String name);
xxx.removeAttribute(String name);
```

# 第五章 JSP入门学习

### 常用的内置标签

#### **（1）标签**`<jsp:include>`

#### **（2）标签**`<jsp:forward>`和`<jsp:param>`

`<jsp:forward>`标签用于把请求转发给另外一个资源（服务器跳转，地址不变）。

```xml
<%--使用jsp:forward标签进行请求转发--%>
<jsp:forward page="/index2.jsp" >
    <jsp:param value="10086" name="num"/>
    <jsp:param value="10010" name="num2"/>
</jsp:forward>
```

# 第六章 EL表达式和JSTL标签库

## 一、EL表达式

### 域对象

| jsp         | el               | 描述             |
| ----------- | ---------------- | ---------------- |
| application | applicationScope | 全局作用域对象   |
| session     | sessionScope     | 会话作用域       |
| request     | requestScope     | 请求作用域对象   |
| pageContext | pageScope        | 当前页作用域对象 |

**注：使用时可以省略域对象别名**

默认查找顺序： pageScope -> requestScope -> sessionScope -> applicationScope

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>jsp</title>
</head>
<body>
  <%
    application.setAttribute("name","application");
    session.setAttribute("name","session");
    request.setAttribute("name","request");
    pageContext.setAttribute("name","pageContext");
  %>
  <br>--------------------使用java语言---------------------------<br>
  application中的值：<%= application.getAttribute("name") %> <br>
  session中的值：<%= session.getAttribute("name") %> <br>
  request中的值：<%= request.getAttribute("name") %> <br>
  pageContext中的值：<%= pageContext.getAttribute("name") %> <br>

  <br>--------------------使用EL表达式---------------------------<br>
  application中的值：${applicationScope.name} <br>
  session中的值：${sessionScope.name} <br>
  request中的值：${requestScope.name} <br>
  pageContext中的值：${pageScope.name} <br>

  <br>----------------使用EL表达式,省略域对象---------------------<br>
  application中的值：${name} <br>

</body>
</html>
```

### 4、EL表达式的缺陷

（1）只能读取域对象中的值，不能写入

（2）不支持if判断和控制语句

## 二、JSTL标签工具类

### 2、使用方式

（1）tomcat10 以前的导入依赖的jar包 jstl.jar standard.jar

下载地址[http://archive.apache.org/dist/jakarta/taglibs/standard/binaries/](http://archive.apache.org/dist/jakarta/taglibs/standard/binaries/)

tomcat10以后使用 jakarta.servlet.jsp.jstl-2.0.0.jar

当然在tomcat10中也有这两个jar包，找到tomcat10中的例子程序：

```text
D:\javaweb\tomcat\apache-tomcat-10.0.11\apache-tomcat-10.0.11\webapps\examples\WEB-INF\lib
```

（2）在jsp中引入JSTL的core包依赖约束

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
```

### 3、重要标签的使用

#### （1）` <c:set`>

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
<head>
    <title>  c:set  </title>
</head>
    <body>
        <!--
        相当于
        <%--  <%   --%>
        <%--   request.setAttribute("name","zhangsan");--%>
        <%--  %>  --%>
        -->
        <c:set scope="request" var="name" value="zhangsan" />
        通过JSTL标签添加的作用域中的值：${requestScope.name}   <br>
        <c:set scope="application" var="name" value="lisi" />
        通过JSTL标签添加的作用域中的值：${applicationScope.name}   <br>
        <c:set scope="request" var="name" value="wangwu" />
        通过JSTL标签添加的作用域中的值：${requestScope.name}   <br>
        <c:set scope="page" var="name" value="zhaoliu" />
        通过JSTL标签添加的作用域中的值：${pageScope.name}   <br>
    </body>
</html>

```

#### （2）`<c:if>` 

控制哪些内容能够输出到响应体

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<head>
    <title> c:if </title>
</head>
<body>
    <c:set scope="page" var="age" value="20"/>
    <br>------------------------------使用java语言-------------------------------------<br>
    <%
        if( Integer.parseInt((String)pageContext.getAttribute("age")) >= 18 ){
    %>
    输入：欢迎光临！
    <%  } else { %>
    输入：未满十八，不准入内！
    <%  }  %>
    <br>------------------------------使用JSTL标签-------------------------------------<br>

    <c:if test="${ age ge 18 }">
        输入：欢迎光临！
    </c:if>
    <c:if test="${ age lt 18 }">
        输入：未满十八，不准入内！
    </c:if>
</body>
</html>
```

#### （3）`<c:choose>`

在jsp中进行多分支判断，决定哪个内容写入响应体

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<head>
    <title> c:choose </title>
</head>
<body>
    <c:set scope="page" var="age" value="6"/>
    <br>------------------------------使用java语言-------------------------------------<br>
    <%
        if( Integer.parseInt((String)pageContext.getAttribute("age")) == 18 ){
    %>
    输入：您今年成年了
    <%  } else if( Integer.parseInt((String)pageContext.getAttribute("age")) > 18 ){ %>
    输入：您已经成年了
    <%  }  else {%>
    输出：您还是个孩子
    <% } %>
    <br>------------------------------使用JSTL标签-------------------------------------<br>

    <c:choose>
        <c:when test="${age eq 18}">
            输入：您今年成年了
        </c:when>
        <c:when test="${age gt 18}">
            输入：您已经成年了
        </c:when>
        <c:otherwise>
            输入：您还是个孩子
        </c:otherwise>
    </c:choose>
</body>
</html>
```

#### （4）`<c:forEach>`

循环遍历

使用方式

```jsp
<%@ page import="com.zn.Student" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<head>
    <title> c:forEach </title>
</head>
<body>
    <%
        pageContext.setAttribute("students",new ArrayList(){{
            add(new Student("s1","zhangsan",16));
            add(new Student("s2","lisi",19));
            add(new Student("s3","wangwu",15));
        }});
        pageContext.setAttribute("stuMap", new HashMap(){{
            put("m1",new Student("s1","zhangsan",16));
            put("m2",new Student("s2","lisi",18));
            put("m3",new Student("s3","wangwu",15));
        }});
    %>
    <br>------------------------使用java语言------------------------------<br>
    <table>
        <tr><td>学号</td><td>姓名</td><td>年龄</td></tr>
        <%
            List<Student> stus =            (ArrayList<Student>)pageContext.getAttribute("students");
            for (int i = 0; i < stus.size(); i++) {
        %>
          <tr><td><%=stus.get(i).getSid()%></td>
              <td><%=stus.get(i).getName()%></td>
              <td><%=stus.get(i).getAge()%></td>
          </tr>
        <% } %>
    </table>
    
    <br>----------------------使用JSTL标签读取list-----------------------<br>
    <table>
        <tr><td>学号</td><td>姓名</td><td>年龄</td></tr>
        <c:forEach var="student" items="${students}">
        <tr><td>${student.sid}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
        </tr>
        </c:forEach>
    </table>

    <br>---------------------使用JSTL标签读取map------------------------<br>
    <table>
        <tr><td>学号</td><td>姓名</td><td>年龄</td></tr>
        <c:forEach var="student" items="${stuMap}">
            <tr>
                <td>${student.key}</td>
                <td>${student.value.sid}</td>
                <td>${student.value.name}</td>
                <td>${student.value.age}</td>
            </tr>
        </c:forEach>
    </table>

    <br>--------------使用JSTL标签读取指定for循环-----------------------<br>
    <select>
      <c:forEach var="item" begin="1" end="10" step="1">
          <option> ${item} </option>
      </c:forEach>
    </select>

</body>
</html>
```

## 三、路径问题

1、在服务端进行请求转发，因为转发的过程在服务端进行，所以不需要加contextPath。

```java
req.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(req,resp);
```

2、在服务端进行重定向，大家要明白一点，重定向其实是在浏览器中具体执行的，所以必须加contextPath。

```java
response.sendRedirect(request.getContextPath() + "/login.jsp");
```

以下是我们通常的处理方案：

1、在jsp中定义好我们的basePath，这个路径是带有contextPath的。

2、在Head中指定， `<base href="<%=basePath%>"> `。

3、在具体的地址处使用相对于contextPath的路径。

```jsp
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
   String path = request.getContextPath();
   String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<html>
<head>
   <title>image调用</title>
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">   
   <base href="<%=basePath%>"> 
</head>
<body>
   <h1>图片访问</h1>
   <div>   
     <img alt="图片" src="image/a.png">
   </div>
</body>
</html>
```

以上结构中的图片真实的访问路径是： [http://localhost:8080/first_web/image/a.png](http://localhost:8080/first_web/image/a.png)

## 四、错误页面和404页面

我们可以在web.xml中根据错误码和异常类型，配置不同异常情况下的错误页面。

```jsp
<error-page>
    <error-code>404</error-code>
    <location>/pages/404.jsp</location>
</error-page>

<error-page>
    <exception-type>java.lang.Exception</exception-type>
    <location>/pages/err.jsp</location>
</error-page>
```

# 第七章 Listener、Filter

## 一、观察者设计模式

**观察者模式（Observer）**，又叫**发布-订阅模式（Publish/Subscribe）**，定义对象间一种一对多的依赖关系，使得每当一个对象改变状态，则所有依赖于它的对象都会得到通知并自动更新。

### 1、基本概念

- servlet是一种运行服务器端的java应用程序，它可以用来处理请求和响应。这是我们tomcat容器最重要的组成部分。
- filter称之为过滤器，不像Servlet，它不处理具体的业务逻辑，它是一个中间者，它能够按照具体的规则拦截我们的请求和响应，并执行响应的操作。
- listener叫监听器，它用来监听容器内的一些变化，如session的创建，销毁，servlet容器的创建销毁等。当这些内容变化产生时，监听器就要完成一些工作。这是观察者设计模式的典型使用场景。

### 2、生命周期

**（1）servlet：**servlet的生命周期始于它被装入web服务器的内存时，并在web服务器终止或重新装入servlet时结束。servlet一旦被装入web服务器，一般不会从web服务器内存中删除，直至web服务器关闭或重新结束。

1. 装入：第一次访问，启动服务器时加载Servlet的实例；
2. 初始化：web服务器启动时或web服务器接收到请求时，或者两者之间的某个时刻启动。初始化工作有init（）方法负责执行完成；
3. 调用：从第一次到以后的多次访问，都是只调用doGet()或doPost()方法；
4. 销毁：停止服务器时调用destroy()方法，销毁实例。

**（2）filter：**一定要实现javax.servlet包的Filter接口的三个方法init()、doFilter()、destroy()，空实现也行

1. 启动服务器时加载过滤器的实例，并调用init()方法来初始化实例；
2. 每一次请求时都只调用方法doFilter()进行处理；
3. 停止服务器时调用destroy()方法，销毁实例。

**（3）listener：**类似于servlet和filter

servlet2.4规范中提供了8个listener接口，可以将其分为三类，分别如下：

- 第一类：与servletContext有关的listner接口。包括：ServletContextListener、ServletContextAttributeListener
- 第二类：与HttpSession有关的Listner接口。包括：HttpSessionListner、HttpSessionAttributeListener、HttpSessionBindingListener、 HttpSessionActivationListener；
- 第三类：与ServletRequest有关的Listener接口，包括：ServletRequestListner、ServletRequestAttributeListener

web.xml 的加载顺序是：context- param -> listener -> filter -> servlet

# 第八章 编程式配置

## 一、servlet、filter、listener的配置

如果我们想使用注解进行配置，需要修改一个配置：

```xml
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                      https://jakarta.ee/xml/ns/jakartaee/web-app_5_0.xsd"
         version="5.0"
         metadata-complete="false">
</web-app>
```

 metadata-complete属性必须设置为false，不写这个属性默认就是false，如果是true，注解不生效。

## 二、Resource

### 1、JNDI入门

 JNDI（Java Naming and Directory Interface，Java 命名和目录接口）是一组在Java应用中访问命名服务和目录服务的API。其中，JavaEE要求Web容器（如：tomcat）必须实现JNDI规范。

 资源引用和资源定义的默认 JNDI 命名空间必须始终是`java:comp/env`

### 2、JNDI应用：配置数据源

第一步：向tomcat安装目录下的lib中添加JDBC驱动程序

第二步：修改tomcat中config目录下的context.xml

```xml
	<Resource name="dataSource/mysql/prod"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://127.0.0.1:3306/ydlclass?characterEncoding=utf8&amp;serverTimezone=Asia/Shanghai"
              username="root" password="root"
              maxTotal="20" maxIdle="10"
              maxWaitMillis="10000" />

    <Resource name="dataSource/mysql/test"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://127.0.0.1:3306/boke?characterEncoding=utf8&amp;serverTimezone=Asia/Shanghai"
              username="root" password="root"
              maxTotal="20" maxIdle="10"
              maxWaitMillis="10000" />
```

第三步，在代码中访问

```java
Context ctx = null;
try {
    ctx = new InitialContext();
    DataSource dataSource = (DataSource)ctx.lookup("java:comp/env/dataSource/mysql");
    System.out.println(dataSource);
} catch (Exception e) {
    e.printStackTrace();
}
```

#### （2）在当前工程下新增命名服务

第一步：向WEB-INF/lib目录下添加mysql驱动程序

第二步：在与WEB-INf同级的目录下新建META-INF/context.xml并配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="dataSource/mysql/prod"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://127.0.0.1:3306/ydlclass?characterEncoding=utf8&amp;serverTimezone=Asia/Shanghai"
              username="root" password="root"
              maxTotal="20" maxIdle="10"
              maxWaitMillis="10000" />

    <Resource name="dataSource/mysql/test"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://127.0.0.1:3306/boke?characterEncoding=utf8&amp;serverTimezone=Asia/Shanghai"
              username="root" password="root"
              maxTotal="20" maxIdle="10"
              maxWaitMillis="10000" />

</Context>
```

#### （3）基础数据类型

```xml
<env-entry>
    <env-entry-name>baseUrl</env-entry-name>
    <env-entry-type>java.lang.String</env-entry-type>
    <env-entry-value>D://www/</env-entry-value>
</env-entry>
Context ctx = null;
try {
    ctx = new InitialContext();
    DataSource dataSource = (DataSource)ctx.lookup("java:comp/env/baseUrl");
    System.out.println(dataSource);
} catch (Exception e) {
    e.printStackTrace();
}
```

### 4、@Resource

 使用@resource注解也可以类似将定义的JNDI资源，注入到变量当中，方法中就可以直接使用了，但是要注意，目前只能在Servlet中使用。

```java
@WebServlet("/")
public class MyServlet extends HttpServlet {

    @Resource(lookup="java:comp/env/baseUrl")
    DataSource dataSource;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println(dataSource);
    }
}
```

## 三、postConstruct、preDestory

这两个注解提供了，servlet三个生命周期之外的两个回调函数。

```java
@WebServlet("/")
public class MyServlet extends HttpServlet {
    @PostConstruct
    public void f1(){
        System.out.println("PostConstruct---------");
    }

    @PreDestroy
    public void f2(){
        System.out.println("PreDestroy---------");
    }
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("doGet---------");
    }
}
```











# 第九章 实战案例

### 4、上传下载

上传的实质是从客户端的浏览器上传一个文件到服务器的磁盘上，下载反之，这个过程就是使用流来进行处理。

一个表单中一旦有了文件，就需要在form中新增 enctype="multipart/form-data" 属性。

```html
<form action="user/register" method="post" enctype="multipart/form-data">
```

而在servlet中也需要使用一个新的注解@MultipartConfig，具体代码如下：

```java
@WebServlet("/upload")
@MultipartConfig
public class UploadServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Part file = req.getPart("file");
        InputStream inputStream = file.getInputStream();
        if(inputStream != null) {
            String fileName = "E:\\test\\" + file.getSubmittedFileName();
            OutputStream outputStream = new FileOutputStream(fileName);
            long size = file.getSize();
            long currentSize = 0;
            int len;
            byte[] buf = new byte[1024];
            while ((len = inputStream.read(buf)) != -1) {
                outputStream.write(buf, 0, len);
                currentSize += len;
                int percent = (int) ((currentSize / (size + 0.0)) * 100);
                System.out.println(percent);
            }
            inputStream.close();
            outputStream.close();
        }
    }
}
```

下载时需要几个首部信息配合使用：

```java
@WebServlet("/download")
public class DownLoadServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        FileInputStream fileInputStream = new FileInputStream("E:\\test\\1.mp4");
        ServletOutputStream outputStream = resp.getOutputStream();
        // 支持中文名称文件,需要对header进行单独设置，不然下载的文件名会出现乱码或者无法显示的情况
        // String downloadFileName = new String(fileName .getBytes(), "ISO-8859-1");
        String downloadFileName = URLEncoder.encode("稻香","UTF-8");
        // 设置响应头，控制浏览器下载该文件
        resp.setHeader("Content-Disposition", "attachment;filename=" + downloadFileName);
        byte[] buffer = new byte[1024*5];
        int len;
        while ((len = fileInputStream.read(buffer)) != -1 ){
            outputStream.write(buffer,0,len);
        }
    }
}
```

### 5、tomcat映射路径的配置方法

配置虚拟路径可以帮我们搭建一个简易的图片服务器，让我们上传的图片可以用url访问。

```html
<Context path="/xinzhi/image" docBase="D:\\img" debug="0" reloadbale="true"/>
```

path: Host的虚拟目录 docBase: 映射的物理目录的地址，可指定相对路径，相对appBase下，也可以指定绝对路径（例如：D:\Workes\testtomcat\WebRoot）。如果无此项则默认为appBase/ROOT 。
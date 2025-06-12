# SpringMVC

## 执行流程

![image-20211226000022362](..\img\image-20211226000022362-184919d4.png)

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		HttpServletRequest processedRequest = request;
		HandlerExecutionChain mappedHandler = null;
		boolean multipartRequestParsed = false;

		WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

		try {
			ModelAndView mv = null;
			Exception dispatchException = null;

			try {
                // 判断请求中有没有文件
				processedRequest = checkMultipart(request);
				multipartRequestParsed = (processedRequest != request);

				// 获得一个过滤器链，这就是处理器适配器的工作
				mappedHandler = getHandler(processedRequest);
				if (mappedHandler == null) {
					noHandlerFound(processedRequest, response);
					return;
				}

				// 确定当前请求的处理程序适配器   
				HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

				// 省略一些
				...

                // 处理器链调用所有拦截器的前置处理程序，如有不满足的直接返回：
				if (!mappedHandler.applyPreHandle(processedRequest, response)) {
					return;
				}

				// 此处由处理器适配器调用我们写的controller。
				mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

				if (asyncManager.isConcurrentHandlingStarted()) {
					return;
				}

				applyDefaultViewName(processedRequest, mv);
                // 处理器链调用所有拦截器的后置处理程序，如有不满足的直接返回：
				mappedHandler.applyPostHandle(processedRequest, response, mv);
			}
			catch (Exception ex) {
				dispatchException = ex;
			}
			catch (Throwable err) {
				dispatchException = new NestedServletException("Handler dispatch failed", err);
			}
            // 处理最终结果，视图解析器处理mv，还要做统一的异常处理
			processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
		}
	...
	}
```

1. 通过url匹配一个过滤器链，其中包含多个过滤器和一个处理器
2. 第一步调用拦截器的preHandle方法
3. 第二步执行handler方法
4. 第三部调用拦截器的postHandle方法
5. 将结果给视图解析器进行处理
6. 处理完成后调用afterCompletion

## 三个上下文

在我们的web项目中存在至少三个上下文，分别是【servlet上下文】，【spring上下文】以及【springmvc上下文】，具体如下：

![image-20211227124918177](..\img\image-20211227124918177-f303da98.png)

### （1）ServletContext

- 对于一个web应用，其部署在web容器中，web容器提供其一个全局的上下文环境，这个上下文就是我们的ServletContext，其为后面的spring IoC容器提供一个宿主环境。

### （2）spring上下文

- 在web.xml的配置中，我们需要提供一个监听器【ContextLoaderListener】。在web容器启动时，会触发【容器初始化】事件，此时contextLoaderListener会监听到这个事件，其contextInitialized方法会被调用。
- 在这个方法中，spring会初始化一个【上下文】，这个上下文被称为【根上下文】，即【WebApplicationContext】，这是一个接口类，其实际的实现类是XmlWebApplicationContext。这个就是spring的IoC容器，其对应的Bean定义的配置由web.xml中的【context-param】配置指定，默认配置文件为【/WEB-INF/applicationContext.xml】。
- 在这个IoC容器初始化完毕后，spring以【WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE】为属性Key，将其存储到ServletContext中，便于将来获取；

相关配置：

```xml
<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/app-context.xml</param-value>
</context-param>
```

### （3）springmvc上下文

- contextLoaderListener监听器初始化完毕后，开始初始化web.xml中配置的Servlet，这个servlet可以配置多个，通常只配置一个，以最常见的DispatcherServlet为例，这个servlet实际上是一个【标准的前端控制器】，用以转发、匹配、处理每个servlet请求。
- DispatcherServlet在初始化的时候会建立自己的IoC上下文，用以持有【spring mvc相关的bean】。在建立DispatcherServlet自己的IoC上下文时，会利用【WebApplicationContext.ROOTWEBAPPLICATIONCONTEXTATTRIBUTE】先从ServletContext中获取之前的【根上下文】作为自己上下文的【parent上下文】。有了这个parent上下文之后，再初始化自己持有的上下文，这个上下文本质上也是XmlWebApplicationContext，默认读取的配置文件是【/WEB-INF/springmvc-servlet.xml】，当然我们也可以使用init-param标签的【contextConfigLocation属性】进行配置。
- DispatcherServlet初始化自己上下文的工作在其【initStrategies】方法中可以看到，大概的工作就是初始化处理器映射、视图解析等。这个servlet自己持有的上下文默认实现类也是xmlWebApplicationContext。初始化完毕后，spring以【"org.springframework.web.servlet.FrameworkServlet.CONTEXT"+Servlet名称】为Key，也将其存到ServletContext中，以便后续使用。这样每个servlet就持有自己的上下文，即拥有自己独立的bean空间，同时各个servlet还可以共享相同的bean，即根上下文(第2步中初始化的上下文)定义的那些bean。

注：springMVC容器只负责创建Controller对象，不会创建service和dao，并且他是一个子容器。而spring的容器只负责Service和dao对象，是一个父容器。子容器可以看见父容器的对象，而父容器看不见子容器的对象，这样各司其职。

我们可以通过debug，使用`ServletContext servletContext = req.getServletContext()`查方法看ServletContext，如下：

![image-20220104174425480](..\img\image-20220104174425480-e736a148.png)

## 核心技术篇

```java
@RequestMapping("/test1")
public String testAnnotation(Model model){
    model.addAttribute("hello","hello annotationMvc as string");
    return "annotation";
}
```

### 重定向和转发

> 返回视图字符串加前缀redirect就可以进行重定向：

```text
redirect:/redirectController/redirectTest
redirect:https://www.baidu.com
// 会将请求转发至/a/b
forward:/a/b
```

### RequestMapping和衍生注解

> RequestMapping注解有六个属性，如下

1、`value`， `method`；

- value： 指定请求的实际地址，指定的地址可以是URI Template 模式（后面将会说明）；
- method： 指定请求的method类型， GET、POST、PUT、DELETE等；

2、`consumes`，`produces`；

- consumes：指定request中必须是该类型才会继续执行。例如application/json；
- produces：指定返回数据的类型，仅当request请求头中的(Accept)类型中包含该指定类型才返回

```text
@GetMapping(value = "{id}",produces = {"application/json;charset=utf-8"})
```

3、`params`，`headers`；

- params： 指定request中必须包含某些参数值处理器才会继续执行。
- headers： 指定request中必须包含某些指定的header值处理器才会继续执行。

```java
@RequestMapping(value = "add",method = RequestMethod.POST,
                consumes = "application/json",produces = "text/plain",
                headers = "name",params = {"age","times"}
               )
@ResponseBody
public String add(Model model){
    model.addAttribute("user","add user");
    return "user";
}
```

## URI 模式匹配

> 以下是一些模式匹配的示例：

- `"/resources/ima?e.png"` - 匹配路径段中的一个字符
- `"/resources/*.png"` - 匹配路径段中的零个或多个字符
- `"/resources/**"` - 匹配多个路径段
- `"/projects/{project}/versions"` - 匹配路径段并将其【捕获为变量】
- `"/projects/{project:[a-z]+}/versions"` - 使用正则表达式匹配并【捕获变量】

捕获的 URI 变量可以使用`@PathVariable`注解

```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```

1、完全匹配者，优先级最高

2、都是前缀匹配（/a/**）, 匹配路由越长，优先级越高

3、前缀匹配优先级，比非前缀的低

4、需要匹配的数量越少，优先级越高，this.uriVars + this.singleWildcards + (2 * this.doubleWildcards);

5、路劲越短优先级越高

6、*越少优先级越高

7、{}越少优先级越高

## 传参

### （1）`@RequestParam`

您可以使用`@RequestParam`注解将【请求参数】（即查询参数或表单数据）绑定到控制器中的方法参数。

```java
@GetMapping
public String setupForm(@RequestParam("petId") int petId, Model model){
    //...
}
```

### （2）`@RequestHeader`

您可以使用`@RequestHeader`注解将请求的首部信息绑定到控制器中的方法参数中：

假如我们的请求header如下：

```http
Host localhost:8080 
Accept text/html,application/xhtml+xml,application/xml;q=0.9 
Accept-Language fr,en-gb;q=0.7,en;q=0.3 
Accept-Encoding gzip,deflate 
Accept-Charset ISO -8859-1,utf-8;q=0.7,*;q=0.7 
Keep-Alive 300
```

以下示例获取`Accept-Encoding`和`Keep-Alive`标头的值：

```java
@GetMapping("/demo")
public void handle(
        @RequestHeader("Accept-Encoding") String encoding, 
        @RequestHeader("Keep-Alive") long keepAlive) {
    //...
}
```

小知识：当`@RequestHeader`注解上的使用`Map<String, String>`， `MultiValueMap<String, String>`或`HttpHeaders`参数，则map会被填充有所有header的值。当然，我们依然可以使用requied的属性来执行该参数不是必须的。

### （3）`@CookieValue`

我们可以使用`@CookieValue`注解将请求中的 cookie 的值绑定到控制器中的方法参数。

假设我们的请求中带有如下cookie：

```text
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```

以下示例显示了如何获取 cookie 值：

```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) {
    //...
}
```

### （4）`@ModelAttribute`

您可以使用`@ModelAttribute`注解在方法参数上来访问【模型中的属性】，或者在不存在的情况下对其进行实例化。

```java
@RequestMapping("/register")
public String register(@ModelAttribute("user") UserForm user) {
    //...
}
```

### （5）`@SessionAttribute`

如果您需要访问全局管理的预先存在的会话属性，并且可能存在或可能不存在，您可以`@SessionAttribute`在方法参数上使用注解，如下所示示例显示：

```java
@RequestMapping("/")
public String handle(@SessionAttribute User user) { 
    // ...
}
```

### （6）`@RequestAttribute`

和`@SessionAttribute`一样，您可以使用`@RequestAttribute`注解来访问先前创建的存在与请求中的属性（例如，由 Servlet`Filter` 或`HandlerInterceptor`）创建或在请求转发中添加的数据：

```java
@GetMapping("/")
public String handle(@RequestAttribute Client client) { 
    // ...
}
```

### （7）`@SessionAttributes`

@SessionAttributes注解应用到Controller上面，可以将Model中的属性同步到session当中：

```java
@Controller
@RequestMapping("/Demo.do")
@SessionAttributes(value={"attr1","attr2"})
public class Demo {
}
```

### （8）数组的传递

在类似批量删除的场景中，我们可能需要传递一个id数组，此时我们仅仅需要将方法的参数指定为数组即可：

```java
@GetMapping("/array")
public String testArray(@RequestParam("array") String[] array) throws Exception {
    System.out.println(Arrays.toString(array));
    return "array";
}
```

我们可以发送如下请求，可以是多个名称相同的key，也可以是一个key，但是值以逗号分割的参数：

```http
http://localhost:8080/app/hellomvc?array=1,2,3,4
```

或者

```http
http://localhost:8080/app/hellomvc?array=1&array=3
```

### （9）复杂参数的传递

当然我们在进行参数接收的时候，其中可能包含很复杂的参数，一个请求中可能包含很多项内容，比如以下表单：

当然我们要注意表单中的name（参数中key）的写法：

```html
<form action="user/queryParam" method="post">
    排序字段：<br>
    <input type="text" name="sortField">
    <hr>
    数组：<br>
    <input type="text" name="ids[0]"> <br>
    <input type="text" name="ids[1]">
    <hr>
    user对象：<br>
    <input type="text" name="user.username" placeholder="姓名"><br>
    <input type="text" name="user.password" placeholder="密码">
    <hr>
    list集合<br>
    第一个元素：<br>
    <input type="text" name="userList[0].username" placeholder="姓名"><br>
    <input type="text" name="userList[0].password" placeholder="密码"><br>
    第二个元素： <br>
    <input type="text" name="userList[1].username" placeholder="姓名"><br>
    <input type="text" name="userList[1].password" placeholder="密码">
    <hr>
    map集合<br>
    第一个元素：<br>
    <input type="text" name="userMap['user1'].username" placeholder="姓名"><br>
    <input type="text" name="userMap['user1'].password" placeholder="密码"><br>
    第二个元素：<br>
    <input type="text" name="userMap['user2'].username" placeholder="姓名"><br>
    <input type="text" name="userMap['user2'].password" placeholder="密码"><br>
    <input type="submit" value="提交">
</form>
```

然后我们需要搞一个实体类用来接收这个表单的参数：

```java
@Data
public class QueryVo {
    private String sortField;
    private User user;
    private Long[] ids;
    private List<User> userList;
    private Map<String, User> userMap;
}
```

编写接口进行测试，我们发现表单的数据已经尽数传递了进来：

```java
@PostMapping("queryParam")
public String queryParam(QueryVo queryVo) {
    System.out.println(queryVo);
    return "user";
}
```

> 拓展知识：

- VO（View Object）：视图对象，用于展示层，它的作用是把某个指定页面（或组件）的所有数据封装起来。
- DTO（Data Transfer Object）：数据传输对象，这个概念来源于J2EE的设计模式，原来的目的是为了EJB的分布式应用提供粗粒度的数据实体，以减少分布式调用的次数，从而提高分布式调用的性能和降低网络负载，但在这里，我泛指用于展示层与服务层之间的数据传输对象。
- DO（Domain Object）：领域对象，就是从现实世界中抽象出来的有形或无形的业务实体。
- PO（Persistent Object）：持久化对象，它跟持久层（通常是关系型数据库）的数据结构形成一一对应的映射关系，如果持久层是关系型数据库，那么，数据表中的每个字段（或若干个）就对应PO的一个（或若干个）属性。

![image-20211229113542929](..\img\image-20211229113542929-65d730e2.png)

大致流程如下：

- 用户发出请求（可能是填写表单），表单的数据在展示层被匹配为VO；
- 展示层把VO转换为服务层对应方法所要求的DTO，传送给服务层；
- 服务层首先根据DTO的数据构造（或重建）一个DO，调用DO的业务方法完成具体业务；
- 服务层把DO转换为持久层对应的PO（可以使用ORM工具，也可以不用），调用持久层的持久化方法，把PO传递给它，完成持久化操作；
- 数据传输顺序：VO ===> DTO ===> DO ===> PO

相对来说越是靠近显示层的概念越不稳定，复用度越低。分层的目的，就是复用和相对稳定性。

**小知识：**一般的简单工程中，并不会进行这样的设计，我们可能有一个User类就可以了，并不需要什么VO、DO啥的。但是，随着项目工程的复杂化，简单的对象已经没有办法在各个层的使用，项目越是复杂，就需要越是复杂的设计方案，这样才能满足高扩展性和维护性。

## 设定字符集（中文显示问题）

> springmvc内置了一个统一的字符集处理过滤器，我们只要在`web.xml`中配置即可：

```xml
<filter>
    <filter-name>CharacterEncodingFilter</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>utf-8</param-value>
    </init-param>
    <init-param>
        <param-name>forceResponseEncoding</param-name>
        <param-value>true</param-value>
    </init-param>
    <init-param>
        <param-name>forceRequestEncoding</param-name>
        <param-value>true</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CharacterEncodingFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

## 返回json数据（序列化）

```xml
<dependency>
    <groupId>com.alibaba.fastjson2</groupId>
    <artifactId>fastjson2</artifactId>
    <version>2.0.56</version>
</dependency>
<!-- spring5 -->
<dependency>
    <groupId>com.alibaba.fastjson2</groupId>
    <artifactId>fastjson2-extension-spring5</artifactId>
    <version>2.0.56</version>
</dependency>
```

```java
@RequestMapping("/test")
@ResponseBody
public User doGet() {
    return new User(1,null,null,9999);
}
```

app-context.xml

```xml
<mvc:annotation-driven >
    <mvc:message-converters>
        <bean id="fastjson" class="com.alibaba.fastjson2.support.spring.http.converter.FastJsonHttpMessageConverter"/>
    </mvc:message-converters>
</mvc:annotation-driven>
```

## 接收请求中的json数据

如果客户端发出的数据是json类型，需要使用@RequestBody来接收，需要配置前面的fastjson2Converter

```java
@PostMapping("/test")
public void getUser(@RequestBody User user) {
    System.out.println(user);
}
```

## 数据转化（String->Date）

假如有如下场景，前端传递过来一个日期字符串，但是后端需要使用Date类型进行接收，这时就需要一个类型转化器进行转化。

自定义的类型转化器只支持从**requestParam**获取的参数进行转化，我们可以定义如下，其实学习spring时我们已经接触过这个Converter接口：

```java
public class StringToDateConverter implements Converter<String, Date> {
    @Override
    public Date convert(String source) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy_MM_dd hh,mm,ss");
        try {
            return simpleDateFormat.parse(source);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

然后，我们需要在配置文件中进行配置：

```xml
<!-- 开启mvc的注解 -->
<mvc:annotation-driven conversion-service="conversionService" />

<bean id="conversionService" class="org.springframework.context.support.ConversionServiceFactoryBean">
    <property name="converters">
        <set>
            <bean id="stringToDateConverter" class="cn.itnanls.convertors.StringToDateConverter"/>
        </set>
    </property>
</bean>
```

> 对于时间类型的处理，springmvc给我们提供了一个比较完善的解决方案，使用注解@DateTimeFormat，同时配合fastjson提供的@JSONField注解几乎可以满足我们的所有需求。

@DateTimeFormat：当从requestParam中获取string参数并需要转化为Date类型时，会根据此注解的参数pattern的格式进行转化。

@JSONField：当从请求体中获取json字符序列，需要反序列化为对象时，时间类型会按照这个注解的属性内容进行处理。

这两个注解需要加在实体类的对应字段上即可：

```java
// 对象和json互相转化的过程当中按照此转化方式转哈
@JSONField(format = "yyyy年MM月dd日")
// 从requestParam中获取参数并且转化
@DateTimeFormat(pattern = "yyyy年MM月dd日")
private Date birthday;
```

> 处理的过程大致如下：

![image-20220104170103757](..\img\image-20220104170103757-7595d58e.png)

## 数据校验

- JSR 303 是 Java 为 Bean 数据合法性校验提供的标准框架，它包含在 JavaEE 6.0 中。
- JSR 303 通过在 Bean 属性上标注类似于 @NotNull、@Max 等标准的注解指定校验规则，并通过标准的验证接口对 Bean 进行验证。

| **Constraint**                | **详细信息**                                             |
| ----------------------------- | -------------------------------------------------------- |
| `@Null`                       | 被注解的元素必须为 `null`                                |
| `@NotNull`                    | 被注解的元素必须不为 `null`                              |
| `@AssertTrue`                 | 被注解的元素必须为 `true`                                |
| `@AssertFalse`                | 被注解的元素必须为 `false`                               |
| `@Min(value)`                 | 被注解的元素必须是一个数字，其值必须大于等于指定的最小值 |
| `@Max(value)`                 | 被注解的元素必须是一个数字，其值必须小于等于指定的最大值 |
| `@DecimalMin(value)`          | 被注解的元素必须是一个数字，其值必须大于等于指定的最小值 |
| `@DecimalMax(value)`          | 被注解的元素必须是一个数字，其值必须小于等于指定的最大值 |
| `@Size(max, min)`             | 被注解的元素的大小必须在指定的范围内                     |
| `@Digits (integer, fraction)` | 被注解的元素必须是一个数字，其值必须在可接受的范围内     |
| `@Past`                       | 被注解的元素必须是一个过去的日期                         |
| `@Future`                     | 被注解的元素必须是一个将来的日期                         |
| `@Pattern(value)`             | 被注解的元素必须符合指定的正则表达式                     |

> Hibernate Validator 扩展注解

Hibernate Validator 是 JSR 303 的一个参考实现，除支持所有标准的校验注解外，它还支持以下的扩展注解

Hibernate Validator 附加的 constraint

| **Constraint** | **详细信息**                           |
| -------------- | -------------------------------------- |
| `@Email`       | 被注解的元素必须是电子邮箱地址         |
| `@Length`      | 被注解的字符串的大小必须在指定的范围内 |
| `@NotEmpty`    | 被注解的字符串的必须非空               |
| `@Range`       | 被注解的元素必须在合适的范围内         |

> Spring MVC 数据校验

Spring MVC 可以对表单参数进行校验，并将结果保存到对应的【BindingResult】或 【Errors 】对象中。

> 要实现数据校验，需要引入已下依赖

```xml
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>2.0.1.Final</version>
</dependency>
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.9.Final</version>
</dependency>
```

> 并在实体类加上特定注解

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserVO {

    @NotNull(message = "用户名不能为空")
    private String username;

    @NotNull(message = "用户名不能为空")
    private String password;

    @Min(value = 0, message = "年龄不能小于{value}")
    @Max(value = 120,message = "年龄不能大于{value}")
    private int age;

    @JsonFormat(
            pattern = "yyyy-MM-dd",
            timezone = "GMT-8"
    )
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Past(message = "生日不能大于今天")
    private Date birthday;

    @Pattern(regexp = "^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$", message = "手机号码不正确")
    private String phone;

    @Email
    private String email;
}
```

> 在配置文件中配置如下内容，增加hibernate校验：

```xml
<bean id="localValidator" class="org.springframework.validation.beanvalidation.LocalValidatorFactoryBean">
    <property name="providerClass" value="org.hibernate.validator.HibernateValidator"/>
</bean>
<!--注册注解驱动-->
<mvc:annotation-driven validator="localValidator"/>
```

> controller使用@Validated标识验证的对象，紧跟着的BindingResult获取错误信息

```java
@PostMapping("insert")
public String insert(@Validated UserVO user, BindingResult br) {
    List<ObjectError> allErrors = br.getAllErrors();
    Iterator<ObjectError> iterator = allErrors.iterator();
    // 打印以下错误结果
    while (iterator.hasNext()){
        ObjectError error = iterator.next();
        log.error("user数据校验错误:{}",error.getDefaultMessage());
    }

    if(allErrors.size() > 0){
        return "error";
    }

    System.out.println(user);
    return "user";
}
```

> 测试：

永远不要相信用户的输入，我们开发的系统凡是涉及到用户输入的地方，都要进行校验，这里的校验分为前台校验和后台校验，前台校验通常由javascript来完成，后台校验主要由java来负责，这里我们可以通过spring mvc+hibernate validator完成。

## 视图解析器Tymeleaf

我们默认的视图解析器是如下的配置，它主要是处理jsp页面的映射渲染：

```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver"  id="internalResourceViewResolver">
    <!-- 前缀 -->
    <property name="prefix" value="/WEB-INF/page/" />
    <!-- 后缀 -->
    <property name="suffix" value=".jsp" />
</bean>
```

如果我们想添加新的视图解析器，则需要给旧的新增一个order属性，或者直接删除原有的视图解析器：

```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver" id="internalResourceViewResolver">
    <!-- 前缀 -->
    <property name="prefix" value="/WEB-INF/page/" />
    <!-- 后缀 -->
    <property name="suffix" value=".jsp" />
    <property name="order" value="10"/>
</bean>
```

然后，我们可以配置一个新的Tymeleaf视图解析器，order设置的低一些，这样两个视图解析器都可以生效：

```xml
<!--thymeleaf的视图解析器-->
<bean id="templateResolver"
      class="org.thymeleaf.spring4.templateresolver.SpringResourceTemplateResolver">
    <property name="prefix" value="/WEB-INF/templates/" />
    <property name="suffix" value=".html" />
    <property name="templateMode" value="HTML" />
    <property name="cacheable" value="true" />
    <property name="characterEncoding" value="UTF-8"/>
</bean>
<!--thymeleaf的模板引擎配置-->
<bean id="templateEngine"
      class="org.thymeleaf.spring4.SpringTemplateEngine">
    <property name="templateResolver" ref="templateResolver" />
    <property name="enableSpringELCompiler" value="true" />
</bean>
<bean id="viewResolver" class="org.thymeleaf.spring4.view.ThymeleafViewResolver">
    <property name="order" value="1"/>
    <property name="characterEncoding" value="UTF-8"/>
    <property name="templateEngine" ref="templateEngine"/>
</bean>
```

> 添加两个相关依赖

```xml
<dependency>
    <groupId>org.thymeleaf</groupId>
    <artifactId>thymeleaf</artifactId>
    <version>3.0.15.RELEASE</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.thymeleaf/thymeleaf-spring5 -->
<dependency>
    <groupId>org.thymeleaf</groupId>
    <artifactId>thymeleaf-spring5</artifactId>
    <version>3.0.15.RELEASE</version>
</dependency>
```

> 模板中需要添加对应的命名空间

```html
<html xmlns:th="http://www.thymeleaf.org" >
```

thymeleaf官网：[Thymeleaf](https://www.thymeleaf.org/)

## 全局异常捕获

小知识：service层尽量不要处理异常，如果自己捕获并处理了，异常就不生效了。特别是不要生吞异常。

### （1）HandlerExceptionResolver

![image-20211229185734642](..\img\image-20211229185734642-dcc28802.png)

通过源码我们得知，需要写一个HandlerExceptionResolver，并实现其方法：

```java
@Component
public class GlobalExceptionResolver implements HandlerExceptionResolver {
    @Override
    public ModelAndView resolveException(HttpServletRequest request,
                                         HttpServletResponse response, Object handler, Exception ex) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject("error", ex.getMessage());
        modelAndView.setViewName("error");
        return modelAndView;
    }
}
```

小知识：当然在web中我们也能对异常进行统一处理：

```xml
<!--处理500异常-->
<error-page>
    <error-code>500</error-code>
    <location>/500.jsp</location>
</error-page>
<!--处理404异常-->
<error-page>
    <error-code>404</error-code>
    <location>/404.jsp</location>
</error-page>
```

### （2）@ControllerAdvice

该注解同样能实现异常的全局统一处理，而且实现起来更加简单优雅，当然使用这个注解有一下三个功能：

- 处理全局异常
- 预设全局数据
- 请求参数预处理

我们主要学习其中的全局异常处理，`@ControllerAdvice` 配合 `@ExceptionHandler` 实现全局异常处理：

```java
@Slf4j
@ControllerAdvice
public class GlobalExceptionResolverController  {

    @ExceptionHandler(ArithmeticException.class)
    public String processArithmeticException(ArithmeticException ex){
        log.error("发生了数学类的异常：",ex);
        return "error";
    }

    @ExceptionHandler(BusinessException.class)
    public String processBusinessException(BusinessException ex){
        log.error("发生了业务相关的异常：",ex);
        return "error";
    }

    @ExceptionHandler(Exception.class)
    public String processException(Exception ex){
        log.error("发生了其他的异常：",ex);
        return "error";
    }
}
```

## 处理静态资源

当我们使用了springmvc后，所有的请求都会交给springmvc进行管理，当然也包括静态资源，比如`/static/js/index.js`，这样的请求如果走了中央处理器，必然会抛出异常，因为没有与之对应的controller，这样我们可以使用一下配置进行处理：

```xml
<mvc:resources mapping="/js/**" location="/static/js/"/>
<mvc:resources mapping="/css/**" location="/static/css/"/>
<mvc:resources mapping="/img/**" location="/static/img/"/>
```

经过这样的配置后，我们直接配置了请求url和路径的映射关系，就不会再走我们的前端控制器了。

## 拦截器

1. SpringMVC提供的拦截器类似于JavaWeb中的过滤器，只不过**SpringMVC拦截器只拦截被前端控制器拦截的请求**，而过滤器拦截从前端发送的【任意】请求。
2. 熟练掌握`SpringMVC`拦截器对于我们开发非常有帮助，在没使用权限框架(`shiro，spring security`)之前，一般使用拦截器进行认证和授权操作。
3. SpringMVC拦截器有许多应用场景，比如：登录认证拦截器，字符过滤拦截器，日志操作拦截器等等。

![image-20220106104047477](..\img\image-20220106104047477-af845b9c.png)

### （1）自定义拦截器

> SpringMVC拦截器的实现一般有两种方式

1. 自定义的`Interceptor`类要实现了Spring的HandlerInterceptor接口。
2. 继承实现了`HandlerInterceptor`接口的类，比如Spring已经提供的实现了HandlerInterceptor接口的抽象类HandlerInterceptorAdapter。

```java
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {}

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {}
}
```

### （2）拦截器拦截流程

![image-20220106175037525](..\img\image-20220106175037525-c07ae95f.png)

### （3）拦截器规则

我们可以配置多个拦截器，每个拦截器中都有三个方法。下面将总结多个拦截器中的方法执行规律。

1. preHandle：Controller方法处理请求前执行，根据拦截器定义的顺序，正向执行。
2. postHandle：Controller方法处理请求后执行，根据拦截器定义的顺序，逆向执行。需要所有的preHandle方法都返回true时才会调用。
3. afterCompletion：View视图渲染后处理方法：根据拦截器定义的顺序，逆向执行。preHandle返回false(被拦截)也会调用。

编写完SpringMVC拦截器，我们还需要在springmvc.xml配置文件中，配置我们编写的拦截器，配置代码如下：

1. 配置需要拦截的路径
2. 配置不需要拦截的路径
3. 配置我们自定义的拦截器类

```xml
<mvc:interceptors>
    <mvc:interceptor>
        <!--
            mvc:mapping：拦截的路径
            /**：是指所有文件夹及其子孙文件夹
            /*：是指所有文件夹，但不包含子孙文件夹
            /：Web项目的根目录
        -->
        <mvc:mapping path="/**"/>
        <!--
                mvc:exclude-mapping：不拦截的路径,不拦截登录路径
                /toLogin：跳转到登录页面
                /login：登录操作
            -->
        <mvc:exclude-mapping path="/toLogin"/>
        <mvc:exclude-mapping path="/login"/>
        <!--class属性就是我们自定义的拦截器-->
        <bean id="loginInterceptor" class="com.ydlclass.interceptor.LoginInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

## 全局配置类

springmvc有一个可用作用于做全局配置的接口，这个接口是`WebMvcConfigurer`，在这个接口中有很多默认方法，每一个默认方法都可以进行一项全局配置，这些配置可以和我们配置文件的配置一一对应：这些配置在全局的xml中也可以进行配置：

> 列举几个xml的配置

```xml
<!--处理静态资源-->
<mvc:resources mapping="/js/**" location="/static/js/"/>
<mvc:resources mapping="/css/**" location="/static/css/"/>
<mvc:resources mapping="/./image/**" location="/static/./image/"/>

<!--配置页面跳转-->
<mvc:view-controller path="/toGoods" view-name="goods"/>
<mvc:view-controller path="/toUpload" view-name="upload"/>
<mvc:view-controller path="/websocket" view-name="websocket"/>

<mvc:cors>
    <mvc:mapping path="/goods/**" allowed-methods="*"/>
</mvc:cors>
```

> 列举几个常用的WebMvcConfigurer的配置

```java
@Configuration
@EnableWebMvc
public class MvcConfiguration implements WebMvcConfigurer {
    
    // 拦截器进行配置
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns(List.of("/toLogin","/login"))
                .order(1);
    }

    // 资源的配置
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/js/**").addResourceLocations("/static/js/");
        registry.addResourceHandler("/css/**").addResourceLocations("/static/css/");
    }

    // 跨域的全局配置
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET","POST","PUT","DELETE")
                .maxAge(3600);
    }

    // 页面跳转的配置
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/index").setViewName("index");
    }
    
}
```

## 跨域

### 1、同源策略

同源策略（Sameoriginpolicy）是一种约定，它是浏览器最核心也最基本的安全功能。同源策略会阻止一个域的javascript脚本和另外一个域的内容进行交互。所谓同源（即指在同一个域）就是两个页面具有相同的协议（protocol），主机（host）和端口号（port）。

### 2、什么是跨域

当一个请求url的协议、域名、端口三者之间任意一个与当前页面url不同时，就会产生跨域。

举一个例子：从127.0.0.1:5000访问的页面中，有Javascript使用ajax访问127.0.0.1:8888的接口就会产生跨域；

| 当前页面url                                                  | 被请求页面url                                                | 是否跨域 | 原因                           |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | ------------------------------ |
| [http://www.ydlclass.com/](http://www.ydlclass.com/)         | [http://www.ydlclass.com/index.html](http://www.ydlclass.com/index.html) | 不跨域   | 同源（协议、域名、端口号相同） |
| [http://www.ydlclass.com/](http://www.ydlclass.com/)         | [https://www.ydlclass.com/index.html](https://www.ydlclass.com/index.html) | 跨域     | 协议不同（http/https）         |
| [http://www.ydlclass.com/](http://www.ydlclass.com/)         | [http://www.baidu.com/](http://www.baidu.com/)               | 跨域     | 主域名不同（test/baidu）       |
| [http://www.ydlclass.com/](http://www.ydlclass.com/)         | [http://blog.ydlclass.com/](http://blog.ydlclass.com/)       | 跨域     | 子域名不同（www/blog）         |
| [http://www.ydlclass.com:8080/](http://www.ydlclass.com:8080/) | [http://www.ydlclass.com:7001/](http://www.ydlclass.com:7001/) | 跨域     | 端口号不同（8080/7001）        |

> 非同源限制

- 无法读取非同源网页的 Cookie、LocalStorage 和 IndexedDB。
- 无法接触非同源网页的 DOM
- 无法向非同源地址发送 AJAX 请求

### 3、两种请求

全称是"跨域资源共享"(Cross-origin resource sharing)；

浏览器将CORS请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。

只要同时满足以下两大条件，就属于简单请求：

（1) 请求方法是以下三种方法之一：

- HEAD
- GET
- POST

（2）HTTP的头信息不超出以下几种字段：

- Accept
- Accept-Language
- Content-Language
- Last-Event-ID
- Content-Type：只限于三个值`application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

这是为了兼容表单（form），因为历史上表单一直可以发出跨域请求。AJAX 的跨域设计就是，只要表单可以发，AJAX 就可以直接发。

凡是不同时满足上面两个条件，就属于非简单请求。

浏览器对这两种请求的处理，是不一样的。

#### （1）简单请求

> 基本流程

对于简单请求，浏览器直接发出CORS请求。具体来说，就是在头信息之中，增加一个`Origin`字段。

下面是一个例子，浏览器发现这次跨源AJAX请求是简单请求，就自动在头信息之中，添加一个`Origin`字段。

```http
GET /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.ydlclass.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

上面的头信息中，`Origin`字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。

如果`Origin`指定的源，不在许可范围内，服务器会返回一个正常的HTTP回应。浏览器发现，这个回应的头信息没有包含`Access-Control-Allow-Origin`字段（详见下文），就知道出错了，从而抛出一个错误，被`XMLHttpRequest`的`onerror`回调函数捕获。注意，这种错误无法通过状态码识别，因为HTTP回应的状态码有可能是200。

如果`Origin`指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段。

```http
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

上面的头信息之中，有三个与CORS请求相关的字段，都以`Access-Control-`开头。

**（1）Access-Control-Allow-Origin**

该字段是必须的。它的值要么是请求时`Origin`字段的值，要么是一个`*`，表示接受任意域名的请求。

**（2）Access-Control-Allow-Credentials**

该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为`true`，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为`true`，如果服务器不要浏览器发送Cookie，删除该字段即可。

**（3）Access-Control-Expose-Headers**

该字段可选。CORS请求时，`XMLHttpRequest`对象的`getResponseHeader()`方法只能拿到6个基本字段：`Cache-Control`、`Content-Language`、`Content-Type`、`Expires`、`Last-Modified`、`Pragma`。如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。上面的例子指定，`getResponseHeader('FooBar')`可以返回`FooBar`字段的值。

**（4）withCredentials 属性**

上面说到，CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段。

```http
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在AJAX请求中打开`withCredentials`属性。

```javascript
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

否则，即使服务器同意发送Cookie，浏览器也不会发送。或者，服务器要求设置Cookie，浏览器也不会处理。

但是，如果省略`withCredentials`设置，有的浏览器还是会一起发送Cookie。这时，可以显式关闭`withCredentials`。

```javascript
xhr.withCredentials = false;
```

需要注意的是，如果要发送Cookie，`Access-Control-Allow-Origin`就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的`document.cookie`也无法读取服务器域名下的Cookie。

#### （2）非简单请求

> 预检请求

非简单请求是那种对服务器有特殊要求的请求，比如请求方法是`PUT`或`DELETE`，或者`Content-Type`字段的类型是`application/json`。OPTIONS

非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求（preflight）。

浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。只有得到肯定答复，浏览器才会发出正式的`XMLHttpRequest`请求，否则就报错。

下面是一段浏览器的JavaScript脚本。

```javascript
var url = 'http://api.ydlclass.com/cors';
var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();
```

上面代码中，HTTP请求的方法是`PUT`，并且发送一个自定义头信息`X-Custom-Header`。

浏览器发现，这是一个非简单请求，就【自动】发出一个"预检"请求，要求服务器确认可以这样请求。下面是这个"预检"请求的HTTP头信息。

```http
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.ydlclass.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

"预检"请求用的请求方法是`OPTIONS`，表示这个请求是用来询问的。头信息里面，关键字段是`Origin`，表示请求来自哪个源。

除了`Origin`字段，"预检"请求的头信息包括两个特殊字段。

**（1）Access-Control-Request-Method**

该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是`PUT`。

**（2）Access-Control-Request-Headers**

该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段，上例是`X-Custom-Header`。

> 预检请求的响应

服务器收到"预检"请求以后，检查了`Origin`、`Access-Control-Request-Method`和`Access-Control-Request-Headers`字段以后，确认允许跨源请求，就可以做出回应。

```http
 HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

上面的HTTP回应中，关键的是`Access-Control-Allow-Origin`字段，表示`http://api.bob.com`可以请求数据。该字段也可以设为星号，表示同意任意跨源请求。

```http
Access-Control-Allow-Origin: *
```

如果服务器否定了"预检"请求，会返回一个正常的HTTP回应，但是没有任何CORS相关的头信息字段。这时，浏览器就会认定，服务器不同意预检请求，因此触发一个错误，被`XMLHttpRequest`对象的`onerror`回调函数捕获。控制台会打印出如下的报错信息。

```bash
XMLHttpRequest cannot load http://api.ydlclass.com.
Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.
```

服务器回应的其他CORS相关字段如下。

```http
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000
```

**（1）Access-Control-Allow-Methods**

该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。

**（2）Access-Control-Allow-Headers**

如果浏览器请求包括`Access-Control-Request-Headers`字段，则`Access-Control-Allow-Headers`字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。

**（3）Access-Control-Allow-Credentials**

该字段与简单请求时的含义相同。

**（4）Access-Control-Max-Age**

该字段可选，用来指定本次预检请求的有效期，单位为秒。上面结果中，有效期是20天（1728000秒），即允许缓存该条回应1728000秒（即20天），在此期间，不用发出另一条预检请求。

### 4、解决方案

#### （1）过滤器

首先想到的就是使用过滤器进行统一的处理，当然在单个的servlet或者controller中也可以单独处理，基本的逻辑就是在响应的首部信息中加入需要的首部信息字段，解决方案如下：

```java
public class CORSFilter implements Filter{

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

对api为前缀的请求都进行处理：

```xml
<!-- CORS Filter -->
<filter>
    <filter-name>CORSFilter</filter-name>
    <filter-class>com.ydlclass.filter.CORSFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>CORSFilter</filter-name>
    <url-pattern>/api/*</url-pattern>
</filter-mapping>
```

到这里，就可以简单的实现 CORS 跨域请求了，上面的过滤器将会为所有请求的响应加上`Access-Control-Allow-*`首部，换言之就是允许来自任意源的请求来访问该服务器上的资源。而在实际开发中可以根据需要开放跨域请求权限以及控制响应头部等等。

#### （2）SpringMVC的@CrossOrigin注解

> springmvc给我们提供了更加简单的解决方案

- 在Controller 上使用 `@CrossOrigin` 注解就可以实现跨域，这个注解是一个类级别也是方法级别的注解：

```java
@CrossOrigin(maxAge = 3600)
@RestController 
@RequestMapping("goods")
public class GoodsController{
}
```

如果同时在 Controller 和方法上都有使用`@CrossOrigin` 注解，那么在具体某个方法上的 CORS 属性将是两个注解属性合并的结果，如果属性的设置发生冲突，那么Controller 上的主机属性将被覆盖。

我们也可以使用配置类进行全局的配置：

#### （3）SpringMVC的全局配置

```xml
<mvc:cors>
    <mvc:mapping path="/goods/**" allowed-methods="*"/>
</mvc:cors>
```

## 文件上传和下载

### 文件上传

**注：**MultipartResolver 默认不开启，需要手动开启。

文件上传对前端表单有如下要求：为了能上传文件，必须将表单的【method设置为POST】，并将enctype设置为【multipart/form-data】。只有在这样的情况下，浏览器才会把用户选择的文件以二进制数据发送给服务器。

**这里，我们对表单中的 enctype 属性做个详细的说明：**

- application/x-www-form-urlencoded：默认方式，只处理表单域中的 value 属性值，采用这种编码方式的表单会将表单域中的值处理成 URL 编码方式。
- multipart/form-data：这种编码方式会以二进制流的方式来处理表单数据，这种编码方式会把文件域指定文件的内容也封装到请求参数中，不会对字符编码。

```html
<form action="" enctype="multipart/form-data" method="post">
   <input type="file" name="file"/>
   <input type="submit">
</form>
```

一旦设置了enctype为multipart/form-data，浏览器即会采用二进制流的方式来处理表单数据，而对于文件上传的处理则涉及在服务器端解析原始的HTTP响应。

> 在2003年，Apache Software Foundation发布了开源的Commons FileUpload组件，其很快成为Servlet/JSP程序员上传文件的最佳选择。

1、我们同样需要导入这个jar包【commons-fileupload】，Maven会自动帮我们导入他的依赖包【commons-io】；

```xml
<!--文件上传-->
<dependency>
   <groupId>commons-fileupload</groupId>
   <artifactId>commons-fileupload</artifactId>
   <version>1.5</version>
</dependency>
```

2、配置bean：multipartResolver

【**注意！！！这个bena的id必须为：multipartResolver ， 否则上传文件会报400的错误！在这里栽过坑,教训！**】

```xml
<!--文件上传配置-->
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
   <!-- 请求的编码格式，必须和jSP的pageEncoding属性一致，以便正确读取表单的内容，默认为ISO-8859-1 -->
   <property name="defaultEncoding" value="utf-8"/>
   <!-- 上传文件大小上限，单位为字节（10485760=10M） -->
   <property name="maxUploadSize" value="10485760"/>
   <property name="maxInMemorySize" value="40960"/>
</bean>
```

CommonsMultipartFile 的常用方法：

- **String getOriginalFilename()：获取上传文件的原名**
- **InputStream getInputStream()：获取文件流**
- **void transferTo(File dest)：将上传文件保存到一个目录文件中**

我们去实际测试一下

3、编写前端页面

```html
<form action="/upload" enctype="multipart/form-data" method="post">
 <input type="file" name="file"/>
 <input type="submit" value="upload">
</form>
```

4、`Controller`

```java
@PostMapping("/upload")
@ResponseBody
public R upload(@RequestParam("file") CommonsMultipartFile file, HttpServletRequest request) throws Exception{
    //获取文件名 : file.getOriginalFilename();
    String uploadFileName = file.getOriginalFilename();
    System.out.println("上传文件名 : "+uploadFileName);

    //上传路径保存设置
    String path = "D:/upload";
    //如果路径不存在，创建一个
    File realPath = new File(path);
    if (!realPath.exists()){
        realPath.mkdir();
    }
    System.out.println("上传文件保存地址："+realPath);
    //就问香不香，就和你写读流一样
    file.transferTo(new File(path+"/"+uploadFileName));

    return R.success();
}
```

### 文件下载

- 第一种可以直接向response的输出流中写入对应的文件流
- 第二种可以使用 ResponseEntity<byte[]>来向前端返回文件

#### 1、传统方式

```java
@GetMapping("/download1")
@ResponseBody
public R download1(HttpServletResponse response){
    FileInputStream fileInputStream = null;
    ServletOutputStream outputStream = null;
    try {
        // 这个文件名是前端传给你的要下载的图片的id
        // 然后根据id去数据库查询出对应的文件的相关信息，包括url，文件名等
        String  fileName = "楠老师.jpg";

        //1、设置response 响应头，处理中文名字乱码问题
        response.reset(); //设置页面不缓存,清空buffer
        response.setCharacterEncoding("UTF-8"); //字符编码
        response.setContentType("multipart/form-data"); //二进制传输数据
        //设置响应头，就是当用户想把请求所得的内容存为一个文件的时候提供一个默认的文件名。
        //Content-Disposition属性有两种类型：inline 和 attachment 
        //inline ：将文件内容直接显示在页面 
        //attachment：弹出对话框让用户下载具体例子：
        response.setHeader("Content-Disposition",
                           "attachment;fileName="+ URLEncoder.encode(fileName, "UTF-8"));

		// 通过url获取文件
        File file = new File("D:/upload/"+fileName);
        fileInputStream = new FileInputStream(file);
        outputStream = response.getOutputStream();

        byte[] buffer = new byte[1024];
        int len;
        while ((len = fileInputStream.read(buffer)) != -1){
            outputStream.write(buffer,0,len);
            outputStream.flush();
        }

        return R.success();
    } catch (IOException e) {
        e.printStackTrace();
        return R.fail();
    }finally {
        if( fileInputStream != null ){
            try {
                fileInputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if( outputStream != null ){
            try {
                outputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### 2、使用ResponseEntity

```java
@GetMapping("/download2")
public ResponseEntity<byte[]> download2(){
    try {
        String fileName = "楠老师.jpg";
        byte[] bytes = FileUtils.readFileToByteArray(new File("D:/upload/"+fileName));
        HttpHeaders headers=new HttpHeaders();
        // Content-Disposition就是当用户想把请求所得的内容存为一个文件的时候提供一个默认的文件名。
        headers.set("Content-Disposition","attachment;filename="+ URLEncoder.encode(fileName, "UTF-8"));
        headers.set("charsetEncoding","utf-8");
        headers.set("content-type","multipart/form-data");
        ResponseEntity<byte[]> entity=new ResponseEntity<>(bytes,headers, HttpStatus.OK);
        return entity;
    } catch (IOException e) {
        e.printStackTrace();
        return null;
    }
}
```

## WebSocket(ws)

### 1、WebSocket 简介

WebSocket 协议提供了一种标准化方式，可通过单个 TCP 连接在客户端和服务器之间建立全双工、双向通信通道。它是与 HTTP 不同的 TCP 协议，但旨在通过 HTTP 工作，使用端口 80 和 443。

WebSocket 交互以 HTTP 请求开始，HTTP请求中包含`Upgrade: websocket `时，会切换到 WebSocket 协议。以下示例显示了这样的交互：

```yaml
GET /spring-websocket-portfolio/portfolio HTTP/1.1
Host: localhost:8080
Upgrade: websocket 
Connection: Upgrade 
Sec-WebSocket-Key: Uc9l9TMkWGbHFD2qnFHltg==
Sec-WebSocket-Protocol: v10.stomp, v11.stomp
Sec-WebSocket-Version: 13
Origin: http://localhost:8080
```

成功握手后，HTTP 升级请求底层的 TCP 套接字保持打开状态，客户端和服务器都可以继续发送和接收消息。

**何时使用 WebSocket**

如果消息量相对较低（例如监控网络故障），HTTP轮询可以提供有效的解决方案。低延迟、高频率和高容量的组合是使用 WebSocket 的最佳案例。

### 2、实战案例

Spring Framework 提供了一个 WebSocket API，您可以使用它来编写处理 WebSocket 消息的客户端和服务器端应用程序。

（1）引入依赖

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-websocket</artifactId>
    <version>5.2.18.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-messaging</artifactId>
    <version>5.2.18.RELEASE</version>
</dependency>  
```

（2）创建 WebSocket 服务器需要实现`WebSocketHandler`接口或者直接扩展`TextWebSocketHandler`或`BinaryWebSocketHandler`这两个类，使用起来相对简单一点。以下示例使用`TextWebSocketHandler`：

```java
public class MessageHandler extends TextWebSocketHandler {

    Logger log = LoggerFactory.getLogger(MessageHandler.class);

    //用来保存连接进来session
    private List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    /**
     * 关闭连接进入这个方法处理，将session从 list中删除
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("{} 连接已经关闭，现从list中删除 ,状态信息{}", session, status);
    }

    /**
     * 三次握手成功，进入这个方法处理，将session 加入list 中
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("用户{}连接成功.... ",session);
    }

    /**
     * 处理客户发送的信息，将客户发送的信息转给其他用户
     */
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        log.info("收到来自客户端的信息: {}",message.getPayload());
        session.sendMessage(new TextMessage("当前时间："+
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss")) +",收到来自客户端的信息!"));
        for(WebSocketSession wss : sessions)
            if(!wss.getId().equals(session.getId())){
                wss.sendMessage(message);
            }
    }
}
```

（3）有专用的 WebSocket Java 配置和 XML 命名空间支持，用于将前面的 WebSocket 处理程序映射到特定的 URL，如以下示例所示：

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer{
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MessageHandler(), "/message")
        .addInterceptors(new HttpSessionHandshakeInterceptor())
        .setAllowedOrigins("*"); //允许跨域访问
    }
}
```

以下示例显示了与前面示例等效的 XML 配置：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:websocket="http://www.springframework.org/schema/websocket"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/websocket
        https://www.springframework.org/schema/websocket/spring-websocket.xsd">

    <websocket:handlers>
        <websocket:mapping path="/message" handler="myHandler"/>
        <websocket:handshake-interceptors>
            <bean class="org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor"/>
        </websocket:handshake-interceptors>
    </websocket:handlers>

    <bean id="myHandler" class="com.ydlclass.MessageHandler"/>

</beans>
```

（4）使用原生js，用来访问websocket：

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>websocket调试页面</title>
</head>
<body>
<div style="float: left; padding: 20px">
  <strong>location:</strong> <br />
  <input type="text" id="serverUrl" size="35" value="" /> <br />
  <button onclick="connect()">connect</button>
  <button onclick="wsclose()">disConnect</button>
  <br /> <strong>message:</strong> <br /> <input id="txtMsg" type="text" size="50" />
  <br />
  <button onclick="sendEvent()">发送</button>
</div>

<div style="float: left; margin-left: 20px; padding-left: 20px; width: 350px; border-left: solid 1px #cccccc;"> <strong>消息记录</strong>
  <div style="border: solid 1px #999999;border-top-color: #CCCCCC;border-left-color: #CCCCCC; padding: 5px;width: 100%;height: 172px;overflow-y: scroll;" id="echo-log"></div>
  <button onclick="clearLog()" style="position: relative; top: 3px;">清除消息</button>
</div>

</div>
</body>
<!-- 下面是h5原生websocket js写法 -->
<script type="text/javascript">
  let output ;
  let websocket;
  function connect(){ //初始化连接
    output = document.getElementById("echo-log")
    let inputNode = document.getElementById("serverUrl");
    let wsUri = inputNode.value;
    try{
      websocket = new WebSocket(wsUri);
    }catch(ex){
      console.log(ex)
      alert("对不起websocket连接异常")
    }

    connecting();
    window.addEventListener("load", connecting, false);
  }


  function connecting()
  {
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
  }

  function sendEvent(){
    let msg = document.getElementById("txtMsg").value
    doSend(msg);
  }

  //连接上事件
  function onOpen(evt)
  {
    writeToScreen("CONNECTED");
    doSend("WebSocket 已经连接成功！");
  }

  //关闭事件
  function onClose(evt)
  {
    writeToScreen("连接已经断开！");
  }

  //后端推送事件
  function onMessage(evt)
  {
    writeToScreen('<span style="color: blue;">服务器: ' + evt.data+'</span>');
  }

  function onError(evt)
  {
    writeToScreen('<span style="color: red;">异常信息:</span> ' + evt.data);
  }

  function doSend(message)
  {
    writeToScreen("客户端A: " + message);
    websocket.send(message);
  }

  //清除div的内容
  function clearLog(){
    output.innerHTML = "";
  }

  //浏览器主动断开连接
  function wsclose(){
    websocket.close();
  }

  function writeToScreen(message)
  {
    let pre = document.createElement("p");
    pre.innerHTML = message;
    output.appendChild(pre);
  }
</script>
</html>
```

```
ws:127.0.0.1:8088/app/message
```



小知识：我们经常看到有很多地方使用sockjs完成websocket的建立，原因是一些浏览器中缺少对WebSocket的支持。SockJS是一个浏览器JavaScript库，它提供了一个连贯的、跨浏览器的Javascript API，它在浏览器和web服务器之间创建了一个低延迟、全双工、跨域通信通道。

##  

## 配置文件

web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!--配置一个ContextLoaderListener，他会在servlet容器启动时帮我们初始化spring容器-->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!--指定启动spring容器的配置文件-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:application.xml</param-value>
    </context-param>

    <!--注册DispatcherServlet，这是springmvc的核心-->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:application.xml</param-value>
        </init-param>
        <!--加载时先启动-->
        <load-on-startup>1</load-on-startup>
    </servlet>
    <!--/ 匹配所有的请求；（不包括.jsp）-->
    <!--/* 匹配所有的请求；（包括.jsp）-->
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>utf-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceResponseEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
        <init-param>
            <param-name>forceRequestEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

application.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    <!-- 自动扫包 -->
    <context:component-scan base-package="com.ydlclass"/>

    <!-- 处理映射器 -->
    <bean class="org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping"/>
    <!-- 处理器适配器 -->
    <bean class="org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter"/>
    <!-- 视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver"         id="internalResourceViewResolver">
        <!-- 前缀 -->
        <property name="prefix" value="/WEB-INF/page/" />
        <!-- 后缀 -->
        <property name="suffix" value=".jsp" />
        <property name="order" value="10"/>
    </bean>

    <!-- 让Spring MVC不处理静态资源，负责静态资源也会走我们的前端控制器、试图解析器 -->
    <mvc:default-servlet-handler />
    <!--  让springmvc自带的注解生效  -->
    <mvc:annotation-driven conversion-service="conversionService" validator="localValidator" >
        <mvc:message-converters>
            <bean id="fastjson" class="com.alibaba.fastjson2.support.spring.http.converter.FastJsonHttpMessageConverter"/>
        </mvc:message-converters>
    </mvc:annotation-driven>
    <!--String->Date转化器-->
    <bean id="conversionService" class="org.springframework.context.support.ConversionServiceFactoryBean">
        <property name="converters">
            <set>
                <bean id="stringToDateConverter" class="com.ydlclass.config.DateTypeConverter"/>
            </set>
        </property>
    </bean>
    <!--数据校验器-->
    <bean id="localValidator" class="org.springframework.validation.beanvalidation.LocalValidatorFactoryBean">
        <property name="providerClass" value="org.hibernate.validator.HibernateValidator"/>
    </bean>

<!--    <mvc:resources mapping="/js/**" location="/static/js/"/>-->
<!--    <mvc:resources mapping="/css/**" location="/static/css/"/>-->
<!--    <mvc:resources mapping="/img/**" location="/static/img/"/>-->

    <!--thymeleaf的视图解析器-->
    <bean id="templateResolver"
          class="org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver">
        <property name="prefix" value="/WEB-INF/templates/" />
        <property name="suffix" value=".html" />
        <property name="templateMode" value="HTML" />
        <property name="cacheable" value="true" />
        <property name="characterEncoding" value="UTF-8"/>
    </bean>
    <!--thymeleaf的模板引擎配置-->
    <bean id="templateEngine"
          class="org.thymeleaf.spring5.SpringTemplateEngine">
        <property name="templateResolver" ref="templateResolver" />
        <property name="enableSpringELCompiler" value="true" />
    </bean>
    <bean id="viewResolver" class="org.thymeleaf.spring5.view.ThymeleafViewResolver">
        <property name="order" value="1"/>
        <property name="characterEncoding" value="UTF-8"/>
        <property name="templateEngine" ref="templateEngine"/>
    </bean>

    <!--跳转页面配置，由于使用了Rest风格，页面跳转写在controller会很乱（需要额外写一个跳转controller）-->
    <mvc:view-controller path="/toUser" view-name="user"/>
    <mvc:view-controller path="/toUpload" view-name="upload"/>

    <!--跨域配置-->
    <mvc:cors>
        <!--/user/为前缀的资源，允许http://127.0.0.1:5500访问*所有方法（包括PUT、DELETE等复杂请求）-->
        <mvc:mapping path="/user/**" allowed-methods="*" allowed-origins="http://127.0.0.1:5500"/>
    </mvc:cors>

    <!--文件上传配置-->
    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <!-- 请求的编码格式，必须和jSP的pageEncoding属性一致，以便正确读取表单的内容，默认为ISO-8859-1 -->
        <property name="defaultEncoding" value="utf-8"/>
        <!-- 上传文件大小上限，单位为字节（10485760=10M） -->
        <property name="maxUploadSize" value="10485760"/>
        <property name="maxInMemorySize" value="40960"/>
    </bean>

</beans>
```


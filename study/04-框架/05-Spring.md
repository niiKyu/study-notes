## 容器启动过程

```java
// 1、准备刷新
prepareRefresh();
// 2、创建门面
beanFactory = new ConcurrentHashMap<>(8);
// 3、准备工作，装修门面
prepareBeanFactory(beanFactory);

try {
    // 4、beanFactory初始化完成，官方设置已完成，问用户是否需要扩展，给用户扩展的回调函数（空方法）
    postProcessBeanFactory(beanFactory);
    // 5、beanFactory基本好了，执行BeanFactoryPostProcessors
    invokeBeanFactoryPostProcessors(beanFactory);
    // 6、注册BeanPostProcessors
    registerBeanPostProcessors(beanFactory);
    // 7、完成实例化
    finishBeanFactoryInitialization(beanFactory);

} catch (Exception e) {
    e.printStackTrace();
}

// 7、完成实例化
private void finishBeanFactoryInitialization(Map<String, Object> beanFactory) {
    for (Map.Entry<String,String> entry : beanDefinitions.entrySet()) {
        String beanName = entry.getKey();
        String className = entry.getValue();

        // 1、创建
        Class<?> aClass = Class.forName(className);
        Constructor<?> constructor = aClass.getDeclaredConstructor();
        Object bean = constructor.newInstance();
        beanFactory.put(beanName,bean);
        // 2、依赖注入

        // Aware扩展点
        if (bean instanceof ApplicationContextAware){
            ((ApplicationContextAware) bean).setApplicationContext(this);
        }
        // BeanPostProcessor扩展点
        if (bean instanceof BeanPostProcessor){
            ((BeanPostProcessor) bean).beforeInitialization(bean);
        }
        // 3、init回调，用户扩展
        if (bean instanceof Init){
            ((Init) bean).init();
        }
        // BeanPostProcessor扩展点
        if (bean instanceof BeanPostProcessor){
            ((BeanPostProcessor) bean).afterInitialization(bean);
        }

    }
}
```

## 配置详解

### bean

```xml
<bean name="user" class="com.ydlclass.entity.User" scope="prototype" lazy-init="true" autowire="byType" init-method="init" destroy-method="destroy" primary="true">
    <!--使用构造器注入属性-->
    <constructor-arg name="username" value="lily"/>
    <constructor-arg name="password" value="123456"/>
    <!--使用setter注入属性-->
    <property name="username" value="lucy"/>
</bean>
```

| 属性           | 用途                                         | 注解替代       | 值                                         |
| -------------- | -------------------------------------------- | -------------- | ------------------------------------------ |
| scope          | 作用范围                                     | @Scope         | singleton（默认）、prototype（可创建多个） |
| lazy-init      | 懒加载，使用才会创建bean                     |                |                                            |
| autowire       | 自动装配bean的成员变量                       | @Autowire      |                                            |
| init-method    | 指定初始化回调函数                           | @PostConstruct |                                            |
| destroy-method | 指定销毁回调函数                             | @PreDestroy    |                                            |
| primary        | 需要自动装配，设置多个【候选者】中主要的bean | @Primary       |                                            |

注意：@PostConstruct和@PreDestroy需要引包`jakarta.annotation-api`并开启Spring注解

### 开启注解

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       https://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>
</beans>
```

### 获取beanName或context等内部bean

继承`ApplicationContextAware`或`BeanNameAware`

| 命名                             | 依赖注入                                                     |
| :------------------------------- | :----------------------------------------------------------- |
| `ApplicationContextAware`        | 将`ApplicationContext`注入bean当中                           |
| `ApplicationEventPublisherAware` | 将`ApplicationEventPublisherAware`注入bean当中               |
| `BeanClassLoaderAware`           | 将类加载器用于装入bean类                                     |
| `BeanFactoryAware`               | 将`BeanFactory`注入bean当中                                  |
| `BeanNameAware`                  | 将bean的名称注入bean中                                       |
| `ResourceLoaderAware`            | 配置了用于访问资源的加载器                                   |
| `ServletConfigAware`             | 当前的' ServletConfig '容器运行。 仅在web感知的Spring ' ApplicationContext '中有效。 |
| `ServletContextAware`            | 当前运行容器的“ServletContext”。 仅在web感知的Spring ' ApplicationContext '中有效。 |

### @Autowire

可以写在构造器、setter、成员变量（主要）上

当有多个【候选者】，与`@Primary`或`@Qualifier`配合使用

### @Resource

```java
@Resource(name="myMovieFinder") //（主要）
//等同于
@Autowire
@Qualifier("myMovieFinder") //设置bean的名字
```

### @Component

`@Repository`、`@Service`和`@Controller`

自动检测类和注册相应的bean，需要开启扫包

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="org.example"/>
</beans>
```

#### 配置扫包过滤器

| 过滤方式          | 示例表达式                   | 描述                                                         |
| :---------------- | :--------------------------- | :----------------------------------------------------------- |
| annotation (默认) | `org.example.SomeAnnotation` | 要在目标组件的类型级别上“存在”或“元注解存在”的注解。         |
| assignable        | `org.example.SomeClass`      | 指定要排除的bean的类                                         |
| aspectj           | `org.example..*Service+`     | 要被目标组件匹配的AspectJ类型表达式，后边会学习              |
| regex             | `org\.example\.Default\.*`   | 由目标组件的类名匹配的正则表达式                             |
| custom            | `org.example.MyTypeFilter`   | ' org.springframework.core.type的自定义实现，TypeFilter”接口。 |

> 下面的示例显示了忽略所有【@Repository】注解，而使用【stub】包下的类进行替换:

```java
 ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
```

```java
@Configuration
@ComponentScan(basePackages = "org.example"，
        includeFilters = @Filter(type = FilterType.REGEX， pattern = ".*Stub.*Repository")，
        excludeFilters = @Filter(Repository.class))
public class AppConfig {
    // ...
}
```

下面的例子显示了等效的XML:

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("spring.xml");
```

```xml
<context:component-scan base-package="org.example">
        <context:include-filter type="regex"
                expression=".*Stub.*Repository"/>
        <context:exclude-filter type="annotation"
                expression="org.springframework.stereotype.Repository"/>
</context:component-scan>
```

【小知识】：您还可以通过在注解上设置`useDefaultFilters=false` 或通过提供`use-default-filters="false" `作为`<component-scan/> `元素的属性来禁用默认过滤器。 

### @Import

```java
//1、@Import注解允许从另一个配置类加载【@Bean】定义
@Import(ConfigA.class)
//2、@Import注解允许从ImportSelector接口加载多个bean
@Import(ConfigSelector.class)
//这样做可以实现一种“以java为中心”的方法来配置容器，并将XML最小化。
@ImportResource("classpath:/com/acme/properties-config.xml")
```

【小知识】我们一样可以给该注解传入一个实现了ImportSelector接口的类，返回的字符串数组的Bean都会被加载到容器当中：

```java
public class ConfigSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        return new String[]{"com.ydlclass.A"，"com.ydlclass.B"};
    }
}
```

### 常用注解

```java
@Component

@Repository
@Service
@Controller

@Configuration + @Bean

@Autowire
@Resoucre
```

### 多环境@Profile

```java
@Configuration
@Profile("development")
public class StandaloneDataConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }
}
@Configuration
@Profile("production")
public class JndiDataConfig {
    @Bean(destroyMethod="")
    public DataSource dataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

> `@Profile`也可以在方法级别声明，只包含一个配置类的一个特定bean(例如，对于一个特定bean的替代变体)，如下面的示例所示:

```java
@Configuration
public class AppConfig {
    @Bean("dataSource")
    @Profile("development") 
    public DataSource standaloneDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }
    @Bean("dataSource")
    @Profile("production") 
    public DataSource jndiDataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

#### 激活

```java
// 创建容器
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
// 激活环境
context.getEnvironment().setActiveProfiles("development");
// 扫包
context.scan("com.ydlclass.datasource");
//  刷新
context.refresh();
// 使用
DataSource bean = context.getBean(DataSource.class);
logger.info("{}"，bean);
```

或使用JVM参数-Dspring.profiles.active=profile1

### 环境变量porperties（配置数据库用户名密码）

#### 添加环境变量

`@PropertySource`用于向Spring的【Environment】中添加【 PropertySource】。

```java
//将classpath下的app.properties中的属性添加到Spring环境变量中
@Configuration
@PropertySource("classpath:/com/myco/app.properties")
public class AppConfig {
```

等价xml

```xml
<context:property-placeholder location="classpath:/com/myco/app.properties"/>
```

#### 使用变量

```java
@Value("${}")
```

### 事件机制

#### 监听器

您可以使用【@EventListener】注解在托管bean的任何方法上注册一个事件侦听器。

```java
@EventListener
public void processBlockedListEvent(BlockedListEvent event) {
    // 监听BlockedListEvent事件，做动作
}
```

如果您的方法应该侦听多个事件，或者您想在不带参数的情况下定义它，也可以在注解本身上指定事件类型。 下面的例子展示了如何做到这一点:

```java
@EventListener({ContextStartedEvent.class， ContextRefreshedEvent.class})
public void handleContextStart() {
    // ...
}
```

#### 事件

##### spring提供的标准事件

| 事件                         | 说明                                                         |
| :--------------------------- | :----------------------------------------------------------- |
| `ContextRefreshedEvent`      | 在“ApplicationContext”被初始化或刷新时发布(例如，通过使用“ConfigurableApplicationContext”接口上的“refresh()”方法)。 这里，“初始化”意味着加载了所有bean，检测并激活了后处理器bean，预实例化了单例，并且“ApplicationContext”对象已经准备好使用了。 只要上下文还没有被关闭，一个刷新可以被触发多次，只要选择的' ApplicationContext '实际上支持这种“热”刷新。 例如，' XmlWebApplicationContext '支持热刷新，但' GenericApplicationContext '不支持。 |
| `ContextStartedEvent`        | 在' ConfigurableApplicationContext '接口上使用' start() '方法启动' ApplicationContext '时发布。 在这里，“started”意味着所有的“生命周期”bean都接收一个显式的开始信号。 通常，此信号用于在显式停止之后重新启动bean，但它也可用于启动尚未配置为自动启动的组件(例如，在初始化时尚未启动的组件)。 |
| `ContextStoppedEvent`        | 在' ConfigurableApplicationContext '接口上使用' stop() '方法停止' ApplicationContext '时发布。 这里，“stopped”意味着所有“Lifecycle”bean都接收一个显式的停止信号。 一个停止的上下文可以通过' start() '调用重新启动。 |
| `ContextClosedEvent`         | 在' ConfigurableApplicationContext '接口上的' close() '方法或通过JVM关闭钩子关闭' ApplicationContext '时发布。 这里，“closed”意味着将销毁所有单例bean。 一旦关闭上下文，它将到达其生命周期的结束，不能刷新或重新启动。 |
| `RequestHandledEvent`        | 一个特定于web的事件，告诉所有bean一个HTTP请求已经得到了服务。 此事件在请求完成后发布。 这个事件只适用于使用Spring ' DispatcherServlet '的web应用程序。 |
| `ServletRequestHandledEvent` | ' requestthandledevent '的子类，用于添加特定于servlet的上下文信息。 |

这些标准事件会在特定的时间发布，我们可以监听这些事件，并在事件发布时做我们想做的工作。

##### 自定义事件

```java
public class BlockedListEvent extends ApplicationEvent {
    public BlockedListEvent(Object source) {
        super(source);
    }
}
```

```java
//通过Aware发现机制获得Spring事件发布者
implements ApplicationEventPublisherAware
public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
    this.publisher = publisher;
}

public void sendEmail(String data) {
    //发布自定义事件
    publisher.publishEvent(new BlockedListEvent(data));
}
```

## Spring工具类（不重要）

### BeanWrapper

通过反射操作一个bean的属性。一般用于读写xml配置中的对象（spring的bean）

| 表达式                 | 释义                                                         |
| :--------------------- | :----------------------------------------------------------- |
| `name`                 | 指示属性“name”对应于“getName()”或“isName()”和“setName(..)”方法。 |
| `account.name`         | 指示属性' account '的嵌套属性' name '，该属性对应于(例如)' getAccount(). setname() '或' getAccount(). getname() '方法。 |
| `account[2]`           | 指示索引属性' account '的*third*元素。 索引属性的类型可以是' array '、' list '或其他自然有序的集合。 |
| `account[COMPANYNAME]` | 指示由“account”、“map”属性的“COMPANYNAME”键索引的映射条目的值。 |

```java
// 包装一下
BeanWrapper company = new BeanWrapperImpl(new Company());
// 通过反射设置name属性
company.setPropertyValue("name"， "Some Company Inc.");
company.setPropertyValue(value);

BeanWrapper jim = new BeanWrapperImpl(new Employee());
jim.setPropertyValue("name"， "Jim Stravinsky");
company.setPropertyValue("managingDirector"， jim.getWrappedInstance());
```

### PropertyEditor属性编辑器

Spring使用【PropertyEditor】的概念来实现【对象】和【字符串】之间的转换。

例如，【Date】可以用人类可读的方式表示（如"2007-14-09"）

Spring有许多内置的【PropertyEditor】实现：

| 分类                      | 释义                                                         |
| :------------------------ | :----------------------------------------------------------- |
| `ClassEditor`             | 将表示类的字符串解析为实际类，反之亦然。 当未找到类时，将抛出一个' IllegalArgumentException '。 默认情况下，由' BeanWrapperImpl '注册。 |
| `CustomBooleanEditor`     | 【布尔属性】的属性编辑器。完成字符串和布尔值的转化。 默认情况下，由' BeanWrapperImpl '注册。 |
| `CustomCollectionEditor`  | 集合的属性编辑器，将给定的描述集合的字符串转化为目标【集合类型】。 |
| `CustomDateEditor`        | 可自定义的属性编辑器，支持自定义【日期格式】。 默认未注册。 必须根据需要使用适当的格式进行用户注册。 |
| `ByteArrayPropertyEditor` | 字节数组的编辑器， 将字符串转换为对应的字节表示形式。 默认情况下由' BeanWrapperImpl '注册。 |
| `CustomNumberEditor`      | 可自定义任何【数字类】的属性编辑器，如“整数”、“长”、“Float”或“Double”。 默认情况下，由' BeanWrapperImpl '注册，但可以通过将其自定义实例注册为自定义编辑器来覆盖。 |
| `FileEditor`              | 将字符串解析为【java.io.file】的对象。 默认情况下，由' BeanWrapperImpl '注册。 |
| `LocaleEditor`            | 可以将字符串解析为' Locale '对象，反之亦然(字符串格式为' [language]*[country]*[variant] '，与' Locale '的' toString() '方法相同)。 也接受空格作为分隔符，作为下划线的替代。 默认情况下，由' BeanWrapperImpl '注册。 |
| `PatternEditor`           | 可以将字符串解析为' java.util.regex。 模式的对象，反之亦然。 |
| `PropertiesEditor`        | 可以转换字符串到' Properties '对象。 默认情况下，由' BeanWrapperImpl '注册。 |
| `StringTrimmerEditor`     | 修剪字符串的属性编辑器。 允许将空字符串转换为' null '值。 默认情况下未注册-必须是用户注册的。 |
| `URLEditor`               | 可以将URL的字符串表示形式解析为实际的' URL '对象。 默认情况下，由' BeanWrapperImpl '注册。 |

> 如果需要注册其他自定义的【propertyeEditors】，可以使用几种机制，其实本质是一样的。

- 第一种手动的方法（通常不方便也不推荐）是使用【ConfigurableBeanFactory】接口的【registerCustomEditor()】方法，这里您必须佣有一个【BeanFactory】引用，比如我们可以写一个【beanFactoryPostProccessor】。
- 另一种（稍微方便一点）机制是使用名为【CustomEditorConfigurer】的特殊beanFactoryPostProccessor，这是spring给我们提供的，下边的案例演示了这个方式。

标准【PropertyEditor】实例用于将表示为字符串的属性值转换为属性的实际复杂类型。 你可以使用【CustomEditorConfigurer】，一个beanFactoryPostProccessor，来方便地添加对附加的【PropertyEditor】实例的支持到【ApplicationContext】。

考虑下面的例子，它定义了一个名为【ExoticType】的用户类和另一个名为【DependsOnExoticType】的类，后者需要将【ExoticType】设置为属性:

```java
package example;

public class ExoticType {

    private String name;

    public ExoticType(String name) {
        this.name = name;
    }
}

public class DependsOnExoticType {

    private ExoticType type;

    public void setType(ExoticType type) {
        this.type = type;
    }
}
```

我们希望能够将type属性分配为字符串，【PropertyEditor】将其转换为实际的【ExoticType】实例。 下面的beanDifination展示了如何建立这种关系:

```xml
<bean id="sample" class="example.DependsOnExoticType">
    <!-- 这里没有使用rel，二十使用value，这个会当做字符串进行解析 -->
    <property name="type" value="aNameForExoticType"/>
</bean>
```

【PropertyEditor】实现类似如下:

```java
// converts string representation to ExoticType object
package example;

public class ExoticTypeEditor extends PropertyEditorSupport {
	// 容器发现需要一个对象的实例，而只是找到了一个字符串，就会根据type的类型匹配这个转化器
    // 这个转化器会进行构造
    public void setAsText(String text) {
        setValue(new ExoticType(text.toUpperCase()));
    }
}
```

最后，下面的例子展示了如何使用【CustomEditorConfigurer】向【ApplicationContext】注册新的【PropertyEditor】，然后它将能够在需要时使用它:

```java
public class CustomEditorConfigurer implements BeanFactoryPostProcessor, Ordered
```

这家伙是一个BeanFactoryPostProcessor，他会在创建好bean工厂后进行注册：

```java
@Override
public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
    if (this.propertyEditorRegistrars != null) {
        for (PropertyEditorRegistrar propertyEditorRegistrar : this.propertyEditorRegistrars) {
            beanFactory.addPropertyEditorRegistrar(propertyEditorRegistrar);
        }
    }
    if (this.customEditors != null) {
        this.customEditors.forEach(beanFactory::registerCustomEditor);
    }
}
```

需要我们写的仅仅是在xml中注册一下即可：

```xml
<bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
    <property name="customEditors">
        <map>
            <entry key="example.ExoticType" value="example.ExoticTypeEditor"/>
        </map>
    </property>
</bean>
```

> 我们还可以使用PropertyEditorRegistrar

下面的例子展示了如何创建自己的【propertyeditorregistry】实现:

```java
public final class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar {

    public void registerCustomEditors(PropertyEditorRegistry registry) {

        // it is expected that new PropertyEditor instances are created
        registry.registerCustomEditor(ExoticType.class， new ExoticTypeEditor());

        // you could register as many custom property editors as are required here...
    }
}
```

下一个例子展示了如何配置一个【CustomEditorConfigurer】，并将一个【CustomPropertyEditorRegistrar】的实例注入其中:

```xml
<bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
    <property name="propertyEditorRegistrars">
        <list>
            <ref bean="customPropertyEditorRegistrar"/>
        </list>
    </property>
</bean>

<bean id="customPropertyEditorRegistrar"
    class="com.ydlclass.CustomPropertyEditorRegistrar"/>
```

### Converter

Spring 3核心包提供了一个【通用类型转换系统】。 在Spring容器中，您可以使用此系统作为【PropertyEditor】的替代方案，将外部化bean属性值字符串转换为所需的属性类型。

#### 1、 Converter的API

实现类型转换逻辑很简单，如下面的接口定义所示:

```java
package org.springframework.core.convert.converter;

public interface Converter<S, T> {

    T convert(S source);
}
```

创建你自己的转换器，需要实现【转换器】接口，并使用泛型“S”作为你要转换的【原始类型】，“T”作为你要转换的【目标类型】。

`core.convert`中提供了几个转换器实现。 其中包括从字符串到数字和其他常见类型的转换器。 下面的例子显示了' StringToInteger '类，它是一个典型的' Converter '实现:

```java
package org.springframework.core.convert.support;

final class StringToInteger implements Converter<String,Integer> {

    public Integer convert(String source) {
        return Integer.valueOf(source);
    }
}
```

#### 2、 ConversionService的 API

【conversionservice】定义了一个用于在运行时执行类型转换逻辑的统一API：

```java
package org.springframework.core.convert;

public interface ConversionService {

    boolean canConvert(Class<?> sourceType， Class<?> targetType);

    <T> T convert(Object source， Class<T> targetType);

    boolean canConvert(TypeDescriptor sourceType， TypeDescriptor targetType);

    Object convert(Object source， TypeDescriptor sourceType， TypeDescriptor targetType);
}
```

大多数【ConversionService】实现也实现【ConverterRegistry】，它提供了一个用于注册转换器的API。

### DataBinder数据验证

从Spring 3开始，你就可以用一个【Validator】配置一个【DataBinder】实例。 一旦配置完成，您就可以通过调用【binder.validate() 】来调用【 Validator】。 任何验证' Errors '都会自动添加到绑定的' BindingResult '中。

下面的例子展示了如何通过编程方式使用DataBinder在绑定到目标对象后调用验证逻辑:

```java
// 绑定一个要验证的实例
DataBinder dataBinder = new DataBinder(new User(105,"22","22"));
// 绑定一个验证的规则
dataBinder.addValidators(new Validator() {
    @Override
    public boolean supports(Class<?> clazz) {
        return clazz == User.class;
    }

    @Override
    public void validate(Object target, Errors errors) {
        User user = (User)target;
        if (user.getId() > 100){
            errors.rejectValue("id","202","值太大了");
        }
    }
});
// 开始验证
dataBinder.validate();
// 获取验证的结果
BindingResult bindingResult = dataBinder.getBindingResult();
List<ObjectError> allErrors = bindingResult.getAllErrors();
for (ObjectError allError : allErrors) {
    System.out.println(allError);
}
```

## Spring表达式语言（SpEL）

````java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello World'"); 
String message = (String) exp.getValue();
````

```java
@Value("#{ 'Hello World'.concat('!') }")
@Value("#{ 'Hello World'.bytes.length }")
@Value("#{ systemProperties['user.region'] }")		//获取spring的Environment变量
@Value("#{ T(java.lang.Math).random() * 100.0 }")	//调用静态方法获取随机值
@Value("#{ numberGuess.randomNumber }")			//引用其他bean属性
@Value("#{ 6.0221415E+23 }")		//科学表达式
@Value("#{ 0x7FFFFFFF }")	//16进制
@Value("#{ true }")		//布尔值
@Value("#{ null }")		//null

@Value("#{ inventions[3] }")		//取数组
@Value("#{ {1，2，3，4} }")		//List
@Value("#{ {{'a'，'b'}，{'x'，'y'}} }")		//List
@Value("#{ {name:'Nikola'，dob:'10-July-1856'} }")		//Map
@Value("#{ new int[]{1，2，3} }")		//int[]

boolean trueValue = parser.parseExpression("2 == 2").getValue(Boolean.class);
boolean falseValue = parser.parseExpression("2 < -5.0").getValue(Boolean.class);
boolean trueValue = parser.parseExpression("'black' < 'block'").getValue(Boolean.class);

boolean falseValue = parser.parseExpression(
        "'xyz' instanceof T(Integer)").getValue(Boolean.class);
boolean trueValue = parser.parseExpression(
        "'5.00' matches '^-?\\d+(\\.\\d{2})?$'").getValue(Boolean.class);
boolean falseValue = parser.parseExpression(
        "'5.0067' matches '^-?\\d+(\\.\\d{2})?$'").getValue(Boolean.class);

Class dateClass = parser.parseExpression("T(java.util.Date)").getValue(Class.class);
Class stringClass = parser.parseExpression("T(String)").getValue(Class.class);
```

#### 变量

可以使用 `#variableName` 语法引用表达式中的变量。 变量是通过在`EvaluationContext`实现上使用`setVariable`方法设置的。

下面的例子展示了如何使用变量。

```java
Inventor tesla = new Inventor("Nikola Tesla","Serbian");

// 我们必须创建一个上下文，在上下文中定义变量
EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();
context.setVariable("newName","Mike Tesla");

parser.parseExpression("name = #newName").getValue(context,tesla);
System.out.println(tesla.getName())  // "Mike Tesla"
```

#### Bean 的引用

如果计算上下文已经配置了bean解析器，那么您可以使用`@`符号从表达式中查找bean。

下面的例子展示了如何做到这一点:

```java
// 定义一个容器
ApplicationContext ctx = new AnnotationConfigApplicationContext(A.class);
// 创建一个解析器
ExpressionParser parser = new SpelExpressionParser();
// 定义一个表达式上下文
StandardEvaluationContext context = new StandardEvaluationContext();
// 这个地方规定了我要从哪里查找bean，我们的具体实现是BeanFactoryResolver，代表了从容器中获取
context.setBeanResolver(new BeanFactoryResolver(ctx));
Object bean = parser.parseExpression("@messageListener").getValue(context);
```

要访问FactoryBean本身，应该在bean名称前加上' & '符号。 下面的例子展示了如何做到这一点:

```java
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new MyBeanResolver());

// This will end up calling resolve(context，"&foo") on MyBeanResolver during evaluation
Object bean = parser.parseExpression("&foo").getValue(context);
```

## Spring面向切面编程

> 让我们从定义一些核心的AOP概念和术语开始：

1. Aspect（切面）：一个关注点的模块化，这个关注点可能会横切多个对象。事务管理是J2EE应用中一个关于横切关注点的很好的例子。
2. Join point（连接点 ）：在程序执行过程中某个特定的点，比如某方法调用的时候或者处理异常的时候。
3. Advice（通知）：在切面的某个特定的连接点（Joinpoint）上执行的动作。通知有各种类型，其中包括“around”、“before”和“after”等通知。 通知的类型将在后面部分进行讨论。许多AOP框架，包括Spring，都是以拦截器做通知模型， 并维护一个以连接点为中心的拦截器链。
4. Pointcut（切入点 ）：匹配连接点（Joinpoint）的断言。通知和一个【切入点表】达式关联，并在满足这个切入点的连接点上运行。 【切入点表达式如何和连接点匹配】是AOP的核心：Spring缺省使用AspectJ切入点语法。
5. Introduction（引入）： Spring允许引入新的接口（以及一个对应的实现）到任何被代理的对象。例如，你可以使用一个引入来使bean实现 IsModified 接口，以便简化缓存机制。
6. Target object（目标对象）：被一个或者多个切面（aspect）所通知（advise）的对象。也有人把它叫做 被通知（advised） 对象。 既然Spring AOP是通过运行时代理实现的，这个对象永远是一个 被代理（proxied） 对象。
7. AOP代理 AOP proxy： 在Spring中，AOP代理可以是JDK动态代理或者CGLIB代理。
8. Weaving（织入）：把切面（aspect）连接到其它的应用程序类型或者对象上，并创建一个被通知（advised）的对象，这个过程叫织入。 这些可以在编译时（例如使用AspectJ编译器），类加载时和运行时完成。 Spring和其他纯Java AOP框架一样，在运行时完成织入。

> Spring AOP包括以下类型的通知:

- Before advice :在连接点之前运行的通知，但不能阻止执行流继续执行到连接点(除非它抛出异常)。
- After returning advice :在连接点正常完成后运行的通知(例如，如果方法返回而不引发异常)。
- After throwing advice:在方法通过抛出异常退出时运行的通知。
- After (finally) advice:不管连接点以何种方式退出(正常或异常返回)，都要运行的通知。
- Around advice:围绕连接点(如方法调用)的通知。 这是最有力的建议。 Around通知可以在方法调用前后执行自定义行为。 它还负责选择是继续到连接点，还是通过返回自己的返回值或抛出异常来简化被通知的方法执行。

### 使用

#### 1、纯注解

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

}
```


```java
// 声明一个切面，需要注册到容器
@Aspect
@Component
public class AspectTest {

    // 声明一个切入点表达式
    @Pointcut("execution(public * com.ydlclass.aop..register(..))")
    public void pointcut(){}

    // 引用上面的表达式
    @Before("pointcut()")
    // 在连接点之前运行的通知
    public void beforeAdvice(JoinPoint jp) throws InvocationTargetException, IllegalAccessException {
//        MethodSignature signature = (MethodSignature)jp.getSignature();
        // 能拿到方法、方法的注解
//        Method method = signature.getMethod();
        // 调用方法的过程
//        method.invoke(jp.getTarget(), jp.getArgs());
        System.out.println("beforeAdvice");
    }

    // 在连接点正常完成后运行的通知
    @AfterReturning("pointcut()")
    public void afterReturningAdvice(){
        System.out.println("afterReturningAdvice");
    }

    // finally中运行的通知
    @After("pointcut()")
    public void afterAdvice(){
        System.out.println("afterAdvice");
    }

    // 在方法通过抛出异常退出时运行的通知
    @AfterThrowing(value = "pointcut()", throwing = "ex")
    // 可以获取具体的异常
    public void afterThrowingAdvice(ArithmeticException ex){
        System.out.println("afterThrowingAdvice");
        System.out.println(ex.toString());
    }

    // 包括上面所有通知
    @Around("execution(public * com.ydlclass.aop..order(..))")
    public Object aroundAdvice(ProceedingJoinPoint pjp) throws Throwable {
        // 我们可以在前边做一些工作，比如启动计时器

        // 这里是真正的方法调用的地方
        Object retVal = pjp.proceed();
        // 我们可以在后边做一些工作，比如停止计时器，搜集方法的执行时间
        return retVal;
    }

    // 如果参数明确，就可以直接获取
    @Before("execution(* com.ydlclass.aop.service.impl.OrderService.*(..)) && args(money,..)")
    public void validateAccount(Integer money) {
        System.out.println("切入点获取money参数--------" + money);
    }

    
    // 将容器中的OrderService取出，实现给定的接口，再放回容器
    // 容器中没有注入IActivityService的子类，但使用引入Introduction之后，容器中的OrderService会实现IActivityService接口，从容器中拿到的IActivityService实际上是OrderService的代理
    @DeclareParents(value = "com.ydlclass.aop.service.impl.OrderService",defaultImpl = ActivityService.class)
    public static IActivityService activityService;
}
```

#### 2、XML

与上面纯注解等价

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd">

<!--    <aop:aspectj-autoproxy/>-->
    <bean id="aop" class="com.ydlclass.xml.aspect.AspectTest"/>
    <bean id="orderService" class="com.ydlclass.xml.service.impl.OrderService"/>
    <bean id="userService" class="com.ydlclass.xml.service.impl.UserService"/>

    <aop:config>
        <aop:aspect ref="aop">
            <aop:pointcut id="pointcut" expression="execution(public * com.ydlclass.xml..register(..))"/>
            <aop:before method="beforeAdvice" pointcut-ref="pointcut"/>
            <aop:after-returning method="afterReturningAdvice" pointcut-ref="pointcut"/>
            <aop:after method="afterAdvice" pointcut-ref="pointcut"/>
            <aop:after-throwing throwing="ex" method="afterThrowingAdvice" pointcut-ref="pointcut"/>
            <aop:around method="aroundAdvice" pointcut="execution(public * com.ydlclass.xml..order(..))"/>
            <aop:before method="validateAccount" pointcut="execution(* com.ydlclass.xml.service.impl.OrderService.*(..)) and args(money,..)"/>
            <aop:declare-parents types-matching="com.ydlclass.xml.service.impl.OrderService"
                                 implement-interface="com.ydlclass.xml.service.IActivityService"
                                 default-impl="com.ydlclass.xml.service.impl.ActivityService"/>
        </aop:aspect>
    </aop:config>
</beans>
```

### 切入点表达式

- `execution`: （常用）用于匹配方法执行的连接点，这是在使用Spring AOP时使用的主要切入点指示符。（匹配方法）

![image-20211206155835362](..\img\image-20211206155835362-973942fb.png)

- `within`: 用于匹配指定类型内的方法执行。（匹配整个类）

![image-20211206160019905](..\img\image-20211206160019905-eba06d20.png)

- `this`: 用于匹配当前【AOP代理对象】类型的执行方法；注意是AOP代理对象的类型匹配，这样就可能【包括引入接口】也进行类型匹配。（配置整个类）

![image-20211206160040279](..\img\image-20211206160040279-4d86c19f.png)

- `target`: 用于匹配当前目标对象类型的执行方法；注意是目标对象的类型匹配，这样就【不包括引入接口】也进行类型匹配。（配置整个类）

![image-20211206160056790](..\img\image-20211206160056790-0c9563ec.png)

- `args`: 限制匹配连接点(使用Spring AOP时的方法执行)，其中参数是给定类型的实例。 （参数类型匹配）

![image-20211206160112474](..\img\image-20211206160112474-06016645.png)

- `@target`: 用于匹配当前目标对象类型的执行方法，其中目标对象持有指定的注解 。（类上的注解）

![image-20211206160242492](..\img\image-20211206160242492-70637337.png)

- `@args`: 用于匹配当前执行的方法传入的参数持有指定注解的执行。（参数上的注解）

![image-20211206160309143](..\img\image-20211206160309143-8a1c0052.png)

- `@within`: 用于匹配所有持有指定注解类型内的方法。（类上的注解）

![image-20211206160256390](..\img\image-20211206160256390-ff41f6f4.png)

- `@annotation`: （常用）于匹配当前执行方法持有指定注解的方法。（方法上的注解）

![image-20211206160329137](..\img\image-20211206160329137-8f97bcea.png)

bean：使用“bean(Bean id或名字通配符)”匹配特定名称的Bean对象的执行方法；Spring ASP扩展的，在AspectJ中无相应概念。

![image-20211206160712945](..\img\image-20211206160712945-4010a6b1.png)

> 切入点表达式运算

可以使用' &&' || '和' ! '组合切入点表达式。 您还可以通过名称引用切入点表达式。 下面的例子展示了三个切入点表达式:

```java
@Pointcut("execution(public * *(..))")
private void anyPublicOperation() {} 

@Pointcut("within(com.xyz.myapp.trading..*)")
private void inTrading() {} 

@Pointcut("anyPublicOperation() && inTrading()")
private void tradingOperation() {} 
```

> 共享公共切入点定义

我们建议定义一个【CommonPointcut】切面来捕获通用的切入点表达式。

```java
package com.xyz.myapp;
@Aspect
public class CommonPointcuts {

    @Pointcut("within(com.xyz.myapp.web..*)")
    public void inWebLayer() {}

    @Pointcut("within(com.xyz.myapp.service..*)")
    public void inServiceLayer() {}

    @Pointcut("within(com.xyz.myapp.dao..*)")
    public void inDataAccessLayer() {}

    @Pointcut("execution(* com.xyz.myapp..service.*.*(..))")
    public void businessService() {}

    @Pointcut("execution(* com.xyz.myapp.dao.*.*(..))")
    public void dataAccessOperation() {}

}
```

您可以在任何需要切入点表达式的地方引用在这样一个切面中定义的切入点。

```java
@Before("com.xyz.myapp.CommonPointcuts.businessService()")
```

## 事务管理

Spring框架的声明式事务通过AOP代理进行实现，该代理使用适当的【TransactionManager】实现来驱动方法调用的事务。

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop"
    xmlns:tx="http://www.springframework.org/schema/tx"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/tx
        https://www.springframework.org/schema/tx/spring-tx.xsd
        http://www.springframework.org/schema/aop
        https://www.springframework.org/schema/aop/spring-aop.xsd">

  <!-- the transactional advice (what 'happens'; see the <aop:advisor/> bean below) -->
    <tx:advice id="txAdvice" transaction-manager="transactionManager">
        <!-- the transactional semantics... -->
        <tx:attributes>
            <!-- all methods starting with 'get' are read-only -->
            <tx:method name="get*" read-only="true"/>
            <!-- other methods use the default transaction settings (see below) -->
            <tx:method name="*"/>
        </tx:attributes>
    </tx:advice>

    <!-- ensure that the above transactional advice runs for any execution
        of an operation defined by the FooService interface -->
    <aop:config>
        <aop:pointcut id="point" expression="within(com.ydlclass.service..*)"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="point"/>
    </aop:config>

</beans>
```

1. Spring的事务默认只对【RuntimeException】及其子类和【Error】及其子类才会回滚，【IOException】和【SqlExcetion】不会回滚
2. 在事务中，不要去解决异常，否则Spring感知不到异常

您还可以准确地配置哪些“Exception”类型将事务标记为回滚。 

```xml
<tx:advice id="txAdvice" transaction-manager="txManager">
    <tx:attributes>
    <tx:method name="get*" read-only="true" rollback-for="NoProductInStockException"/>
    <tx:method name="*"/>
    </tx:attributes>
</tx:advice>
```

您还可以指定“无回滚规则”。 即使面对InstrumentNotFoundException`，也要提交相应的事务:

```xml
<tx:advice id="txAdvice">
    <tx:attributes>
    <tx:method name="updateStock" no-rollback-for="InstrumentNotFoundException"/>
    <tx:method name="*"/>
    </tx:attributes>
</tx:advice>
```

在以下配置的情况下，除了`InstrumentNotFoundException`之外的任何异常都会导致事务的回滚:

```xml
<tx:advice id="txAdvice">
    <tx:attributes>
    <tx:method name="*" rollback-for="Throwable" no-rollback-for="InstrumentNotFoundException"/>
    </tx:attributes>
</tx:advice>
```

默认的`<tx:advice/> `设置是:

- 传播行为是`REQUIRED.`。
- 隔离级别为 `DEFAULT.`
- 事务处于可读写状态。
- 事务超时默认为底层事务系统的默认超时，如果不支持超时，则为none。
- 任何`RuntimeException`触发回滚，而任何选中的`Exception`不会。

您可以更改这些默认设置。 下表总结了嵌套在`<tx:advice/>`和`<tx:attributes/>`标签中的`<tx:method/>`标签的各种属性:

| 属性              | Required? | 默认值     | 描述                                                         |
| :---------------- | :-------- | :--------- | :----------------------------------------------------------- |
| `name`            | Yes       |            | 要与事务属性相关联的方法名。 通配符(*)字符可用于将相同的事务属性设置与许多方法相关联(例如，' get* '、' handle* '、' on*Event '等等)。 |
| `propagation`     | No        | `REQUIRED` | 事务传播行为。                                               |
| `isolation`       | No        | `DEFAULT`  | 事务隔离级别。 仅适用于' REQUIRED '或' REQUIRES_NEW '的传播设置。 |
| `timeout`         | No        | -1         | 事务超时(秒)。 仅适用于传播' REQUIRED '或' REQUIRES_NEW '。  |
| `read-only`       | No        | false      | 读写事务与只读事务。 只适用于' REQUIRED '或' REQUIRES_NEW '。 |
| `rollback-for`    | No        |            | 触发回滚的“Exception”实例的逗号分隔列表。 例如,“com.foo.MyBusinessException, ServletException”。 |
| `no-rollback-for` | No        |            | 不触发回滚的“Exception”实例的逗号分隔列表。 例如,“com.foo.MyBusinessException, ServletException”。 |

### 使用注解 `@Transactional`

```java
@Configuration
//开启事务
@EnableTransactionManagement
public class AppConfig {
    @Bean	//需要数据源
    public DataSource dataSource(
            @Value("${druid.driverClassName}") String driverClassName,
            @Value("${druid.url}") String url,
            @Value("${druid.username}") String username,
            @Value("${druid.password}") String password
    ) {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName(driverClassName);
        dataSource.setUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }

    @Bean	//需要transactionManager
    public DataSourceTransactionManager transactionManager(DataSource dataSource){
        return new DataSourceTransactionManager(dataSource);
    }
}
```

##### `@Transactional`的设置

`@Transactional `注解是元数据，它指定接口、类或方法必须具有事务性语义(例如，“在调用此方法时启动一个全新的只读事务，暂停任何现有事务”)。 默认的“@Transactional”设置如下:

- 传播设置为 `PROPAGATION_REQUIRED.`
- 隔离级别为 `ISOLATION_DEFAULT.`
- 事务处于可读写状态。
- 事务超时默认为底层事务系统的默认超时，如果不支持超时，则为none。
- 任何`RuntimeException`触发回滚，而任何选中的`Exception`不会。

您可以更改这些默认设置。 下表总结了`@Transactional`注解的各种属性:

| 特质                     | 类型                                               | 描述                                                         |
| :----------------------- | :------------------------------------------------- | :----------------------------------------------------------- |
| `value`                  | `String`                                           | 指定要使用的事务管理器的可选限定符。                         |
| `propagation`            | `enum`: `Propagation`                              | 可选的传播环境。                                             |
| `isolation`              | `enum`: `Isolation`                                | 可选的隔离级别。 仅适用于`REQUIRED` 或 `REQUIRES_NEW`的传播值。 |
| `timeout`                | `int`（以秒为粒度）                                | 可选的事务超时。 仅适用于 `REQUIRED` 或 `REQUIRES_NEW`的传播值。 |
| `readOnly`               | `boolean`                                          | 读写事务与只读事务。 只适用于 `REQUIRED` 或 `REQUIRES_NEW`的值。 |
| `rollbackFor`            | `Class` 对象的数组，它必须派生自 `Throwable.`      | 必须导致回滚的异常类的可选数组。                             |
| `rollbackForClassName`   | 类名数组。 类必须派生自 `Throwable.`               | 必须导致回滚的异常类名称的可选数组。                         |
| `noRollbackFor`          | `Class` 对象的数组，它必须派生自`Throwable.`       | 不能导致回滚的异常类的可选数组。                             |
| `noRollbackForClassName` | `String`类名数组，它必须派生自 `Throwable.`        | 异常类名称的可选数组，该数组必须不会导致回滚。               |
| `label`                  | 数组`String`标签，用于向事务添加富有表现力的描述。 | 事务管理器可以评估标签，以将特定于实现的行为与实际事务关联起来。 |

### 事务传播

| 传播行为                  | 含义                                                         | 用途   |
| ------------------------- | ------------------------------------------------------------ | ------ |
| PROPAGATION_REQUIRED      | 表示当前方法必须运行在事务中。如果当前事务存在，方法将会在该事务中运行。否则，会启动一个新的事务 |        |
| PROPAGATION_SUPPORTS      | 表示当前方法不需要事务上下文，但是如果存在当前事务的话，那么该方法会在这个事务中运行 |        |
| PROPAGATION_MANDATORY     | 表示该方法必须在事务中运行，如果当前事务不存在，则会抛出一个异常 |        |
| PROPAGATION_REQUIRED_NEW  | 表示当前方法必须运行在它自己的事务中。一个新的事务将被启动。如果存在当前事务，在该方法执行期间，当前事务会被挂起。如果使用JTATransactionManager的话，则需要访问TransactionManager | 日志？ |
| PROPAGATION_NOT_SUPPORTED | 表示该方法不应该运行在事务中。如果存在当前事务，在该方法运行期间，当前事务将被挂起。如果使用JTATransactionManager的话，则需要访问TransactionManager | 日志   |
| PROPAGATION_NEVER         | 表示当前方法不应该运行在事务上下文中。如果当前正有一个事务在运行，则会抛出异常 |        |
| PROPAGATION_NESTED        | 表示如果当前已经存在一个事务，那么该方法将会在嵌套事务中运行。嵌套的事务可以独立于当前事务进行单独地提交或回滚。如果当前事务不存在，那么其行为与PROPAGATION_REQUIRED一样。注意各厂商对这种传播行为的支持是有所差异的。可以参考资源管理器的文档来确认它们是否支持嵌套事务 |        |

| 隔离级别                   | 含义                                                         |
| -------------------------- | ------------------------------------------------------------ |
| ISOLATION_DEFAULT          | 使用后端数据库默认的隔离级别                                 |
| ISOLATION_READ_UNCOMMITTED | 最低的隔离级别，允许读取尚未提交的数据变更，可能会导致脏读、幻读或不可重复读 |
| ISOLATION_READ_COMMITTED   | 允许读取并发事务已经提交的数据，可以阻止脏读，但是幻读或不可重复读仍有可能发生 |
| ISOLATION_REPEATABLE_READ  | 对同一字段的多次读取结果都是一致的，除非数据是被本身事务自己所修改，可以阻止脏读和不可重复读，但幻读仍有可能发生 |
| ISOLATION_SERIALIZABLE     | 最高的隔离级别，完全服从ACID的隔离级别，确保阻止脏读、不可重复读以及幻读，也是最慢的事务隔离级别，因为它通常是通过完全锁定事务相关的数据库表来实现的 |

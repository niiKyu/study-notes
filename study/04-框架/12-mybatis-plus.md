# Mybatis-plus

MyBatis-Plus（简称 MP）是一个 MyBatis 的超集，一切Mybatis的用法都可以使用

官网： https://mp.baomidou.com/

```xml
<!--springboot-->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.4</version>
</dependency>
```

## mapper

```java
/**
 * 使用mp定义Mapper，需要让Mapper接口继承 BaseMapper接口。
 */
public interface UserMapper extends BaseMapper<User> {
}
```

### 实体类上的注解

```java
/**
 * 实体类的属性名和数据库的字段名自动映射：
 *  1. 名称一样
 *  2. 数据库字段使用_分割，实体类属性名使用驼峰名称
 */

@TableName("tb_user")
@Data
public class User {


    //设置id生成策略:AUTO 数据库自增
    @TableId(type = IdType.AUTO)
    private Long id;
    //@TableField("user_name")
    private String userName;

    private String password;
    private String name;
    private Integer age;
    private String email;

    //不希望该值存入数据库
   // @TableField(exist = false)
   // private String info;

}
```

### 分页查询

PageConfig

```java
@Configuration
public class PageConfig {

    /**
     * 3.4.0之前的版本用这个
     * @return
     */
   /* @Bean
    public PaginationInterceptor paginationInterceptor(){
        return  new PaginationInterceptor();
    }*/

    /**
     * 3.4.0之后提供的拦截器的配置方式
     * @return
     */
   @Bean
   public MybatisPlusInterceptor mybatisPlusInterceptor(){
       MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
       mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor());
       return mybatisPlusInterceptor;
   }
}
```

使用

```java
int current = 1;//当前页码
int size = 5;//每页显示条数
IPage<User> page = new Page(current,size);
// 第二个参数可以传QueryWrapper，即下面的复杂条件查询
userMapper.selectPage(page,null);

List<User> records = page.getRecords();//当前页的数据
long pages = page.getPages();//总页数 2
long total = page.getTotal();//总记录数 4
```

### 复杂条件查询QueryWrapper

```text
eq( ) :  等于 =
ne( ) :  不等于 <>
gt( ) :  大于 >
ge( ) :  大于等于  >=
lt( ) :  小于 <
le( ) :  小于等于 <=
between ( ) :  BETWEEN 值1 AND 值2 
notBetween ( ) :  NOT BETWEEN 值1 AND 值2 
in( ) :  in
notIn( ) ：not in
    
or( ) ：让紧接着下一个方法用or连接

like( )
notLike( )
likeLeft( )
likeRight( )

orderBy( )
orderByAsc( )
orderByDesc( )
select( ) ：指定需要查询的字段
```

```java
 //1.创建查询条件构建器
QueryWrapper<User> wrapper = new QueryWrapper<>();
//2.设置条件
wrapper.eq("user_name","lisi")
        .lt("age",23)
        .in("name","李四","王五");
//select * from tb_user where user_name = ? and age < ? and name in (?,?)
List<User> users = userMapper.selectList(wrapper);
System.out.println(users);
```

update使用UpdateWrapper

```java
@Test
public void testWrapper9(){
    UpdateWrapper<User> wrapper = new UpdateWrapper<>();
    //条件
    wrapper.eq("user_name","lisi")
            .set("password","22222");
    //update tb_user set password = ? where user_name = ?
    userMapper.update(null,wrapper);
}
@Test
public void testWrapper10(){
    UpdateWrapper<User> wrapper = new UpdateWrapper<>();
	//条件
    wrapper.eq("user_name","lisi");
	//update tb_user set password = ?,age = ? where user_name = ?
    User user = new User();
    user.setPassword("3333");
    user.setAge(33);
    userMapper.update(user,wrapper);
}
```

## service

```java
public interface UserService extends IService<User> {
}
```

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
}
```

## 逆向工程-代码生成器

新建一个测试类来运行下面代码就可以直接生成

```xml
<!--mp 代码生成器-->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.4.1</version>
</dependency>

<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.32</version>
</dependency>
```

```java
import com.baomidou.mybatisplus.core.exceptions.MybatisPlusException;
import com.baomidou.mybatisplus.core.toolkit.StringPool;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.InjectionConfig;
import com.baomidou.mybatisplus.generator.config.*;
import com.baomidou.mybatisplus.generator.config.po.TableInfo;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class CodeGenerator {
    /**
     * <p>
     * 读取控制台内容
     * </p>
     */
    public static String scanner(String tip) {
        Scanner scanner = new Scanner(System.in);
        StringBuilder help = new StringBuilder();
        help.append("请输入" + tip + "：");
        System.out.println(help.toString());
        if (scanner.hasNext()) {
            String ipt = scanner.next();
            if (StringUtils.isNotBlank(ipt)) {
                return ipt;
            }
        }
        throw new MybatisPlusException("请输入正确的" + tip + "！");
    }

    public static void main(String[] args) {
        // 代码生成器
        AutoGenerator mpg = new AutoGenerator();

        // 全局配置
        GlobalConfig gc = new GlobalConfig();
        String projectPath = System.getProperty("user.dir");
        System.out.println(projectPath);
        gc.setOutputDir(projectPath + "/src/main/java");
        gc.setAuthor("ydl");
        gc.setOpen(false);
        // gc.setSwagger2(true); 实体属性 Swagger2 注解
        mpg.setGlobalConfig(gc);

        // 数据源配置
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setUrl("jdbc:mysql://localhost:3306/mp");
        // dsc.setSchemaName("public");
        dsc.setDriverName("com.mysql.jdbc.Driver");
        dsc.setUsername("root");
        dsc.setPassword("root");
        mpg.setDataSource(dsc);

        // 包配置
        PackageConfig pc = new PackageConfig();
        pc.setModuleName(scanner("模块名"));
        pc.setParent("com.ydl");
        mpg.setPackageInfo(pc);

        // 自定义配置
        InjectionConfig cfg = new InjectionConfig() {
            @Override
            public void initMap() {
                // to do nothing
            }
        };

        // 如果模板引擎是 freemarker
        String templatePath = "/templates/mapper.xml.ftl";
        // 如果模板引擎是 velocity
        // String templatePath = "/templates/mapper.xml.vm";

        // 自定义输出配置
        List<FileOutConfig> focList = new ArrayList<>();
        // 自定义配置会被优先输出
        focList.add(new FileOutConfig(templatePath) {
            @Override
            public String outputFile(TableInfo tableInfo) {
                // 自定义输出文件名 ， 如果你 Entity 设置了前后缀、此处注意 xml 的名称会跟着发生变化！！
                return projectPath + "/src/main/resources/mapper/" + pc.getModuleName()
                        + "/" + tableInfo.getEntityName() + "Mapper" + StringPool.DOT_XML;
            }
        });
        /*
        cfg.setFileCreate(new IFileCreate() {
            @Override
            public boolean isCreate(ConfigBuilder configBuilder, FileType fileType, String filePath) {
                // 判断自定义文件夹是否需要创建
                checkDir("调用默认方法创建的目录，自定义目录用");
                if (fileType == FileType.MAPPER) {
                    // 已经生成 mapper 文件判断存在，不想重新生成返回 false
                    return !new File(filePath).exists();
                }
                // 允许生成模板文件
                return true;
            }
        });
        */
        cfg.setFileOutConfigList(focList);
        mpg.setCfg(cfg);

        // 配置模板
        TemplateConfig templateConfig = new TemplateConfig();

        // 配置自定义输出模板
        //指定自定义模板路径，注意不要带上.ftl/.vm, 会根据使用的模板引擎自动识别
        // templateConfig.setEntity("templates/entity2.java");
        // templateConfig.setService();
        // templateConfig.setController();

        templateConfig.setXml(null);
        mpg.setTemplate(templateConfig);

        // 策略配置
        StrategyConfig strategy = new StrategyConfig();
        strategy.setNaming(NamingStrategy.underline_to_camel);
        strategy.setColumnNaming(NamingStrategy.underline_to_camel);
        //strategy.setSuperEntityClass("你自己的父类实体,没有就不用设置!");
        strategy.setEntityLombokModel(true);
        strategy.setRestControllerStyle(true);
        // 公共父类
        //strategy.setSuperControllerClass("你自己的父类控制器,没有就不用设置!");
        // 写于父类中的公共字段
        strategy.setSuperEntityColumns("id");
        strategy.setInclude(scanner("表名，多个英文逗号分割").split(","));
        strategy.setControllerMappingHyphenStyle(true);
        strategy.setTablePrefix(pc.getModuleName() + "_");
        mpg.setStrategy(strategy);
        mpg.setTemplateEngine(new FreemarkerTemplateEngine());
        mpg.execute();
    }
}
```


# SSM小项目

## 前端工程

1. github或gitee新建仓库

2. git clone到本地（cmd）

3. vue create xxx（cmd）
4. yarn add vue-router@4（vscode）
5. yarn add vuex@next
6. yarn add element-plus
7. yarn add axios

### vue.config.js

```js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  //关闭eslint校验
  lintOnSave: false,
  devServer: {
    port: 8080,
    proxy:  'http://localhost:8088'
  }
})
```

### main.js

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/style/common.css'

createApp(App)
.use(router)
.use(store)
.use(ElementPlus)
.mount('#app')
```

### @/api/index.js

```js
import axios from 'axios';
import store from '@/store'
import { ElMessage } from "element-plus";
const request = axios.create({
  baseURL: 'http://localhost:8080/admin/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  if (store.state.user.token) {
    //'Bearer '
    config.headers['Authorization'] = store.state.user.token // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  if (error.response.status === 401) {
    let message = error.response.data
    ElMessage.error(message)
    if (message === '登录过期') {
      store.commit('CLEAR_TOKEN')
    }
  }
  
  return Promise.reject(error);
});

export default request;
```

### @/router/index.js

```js
import { createWebHashHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import Login from '@/components/Login.vue'
import Main from '@/components/Main.vue'
import User from '@/components/system/user/User.vue'
import store from '@/store'
import { sessionStorage } from '@/util/storage'

const routes = [
    { path: '/', component: App },
    { name: 'login', path: '/login', component: Login },
    { name: 'main', path: '/main', component: Main, children: [
        { name: 'user', path: '/system/user', component: User}
    ]
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeEach((to, from) => {
    if(to.name === 'login') {
        return true
    }
    // 查看vuex中是否有token（是否登录）
    // 如果没有，就查看sessionStorage（vuex在页面刷新就会被销毁）
    if (!store.getters.isLogin) {
        let loginUser = sessionStorage.getObject('loginUser')
        // 如果登录了，就设置token到vuex中
        if (loginUser) {
            store.commit("SET_TOKEN", loginUser.token)
            store.commit("SET_USERNAME", loginUser.ydlUser.userName)
            store.commit("SET_NICKNAME", loginUser.ydlUser.nickName)
            store.dispatch("GET_INFO")
            .then(() => {})
            .catch(err => {
                console.log(err);
            })

        } else {
            // 如果sessionStorage也没有token，就路由到登录页面
            router.push({ name:'login' })
            return false
        }
    }
    
    return true
})

export default router
```

### @/store/index.js

```js
import { createStore } from 'vuex'
import user from '@/store/modules/user'

const store = createStore({

    state() {
        return {

        }
    },
    getters: {

    },
    modules: {
        user
    },
    mutations: {

    },
    actions: {

    }
})

export default store
```

### @/store/modules/user.js

```js
import { userLogin, userLogout, getUserInfo } from '@/api/user'
import { sessionStorage } from '@/util/storage'
import { ElMessage } from "element-plus";

const user = {
    state() {
        return {
            token: '',
            username: '',
            nickname: '',
            roles: [],
            perms: []
        }
    },
    getters: {
        isLogin(state) {
            return state.token !== '' && state.username !== ''
        }
    },
    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
        },
        SET_USERNAME(state, username) {
            state.username = username
        },
        SET_NICKNAME(state, nickname) {
            state.nickname = nickname
        },
        CLEAR_TOKEN(state) {
            state.token = ''
            state.username = ''
            state.nickname = ''
            sessionStorage.remove("loginUser")
            state.roles = [],
            state.perms = []
        },
        SET_ROLES(state, roles) {
            state.roles = roles
        },
        SET_PERMS(state, perms) {
            state.perms = perms
        }
    },
    actions: {
        USER_LOGIN({ commit }, data) {
            return new Promise((resolve, reject)=> {
                userLogin(data).then(res => {
                    commit("SET_TOKEN", res.data.token)
                    commit("SET_USERNAME", res.data.ydlUser.userName)
                    commit("SET_NICKNAME", res.data.ydlUser.nickName)
                    sessionStorage.putObject("loginUser", res.data)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        USER_LOGOUT({commit}) {
            userLogout().catch((err) => {
                console.log(err)
            })
            commit("CLEAR_TOKEN")
        },
        GET_INFO({ commit }) {
            return new Promise((resolve, reject) => {
                getUserInfo().then(res => {
                    commit("SET_ROLES", res.data.roles)
                    commit("SET_PERMS", res.data.perms)
                    resolve()
                }).catch((err) => { 
                    reject(err)
                })
            })
        }
    }
}

export default user
```

## 后端工程

git clone

idea 新建工程到此文件夹

### application.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc" xmlns:task="http://www.springframework.org/schema/task"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       https://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/mvc
       https://www.springframework.org/schema/mvc/spring-mvc.xsd http://www.springframework.org/schema/task http://www.springframework.org/schema/task/spring-task.xsd">
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
    <mvc:annotation-driven  validator="localValidator" >
        <mvc:message-converters>
            <bean id="fastjson" class="com.alibaba.fastjson2.support.spring.http.converter.FastJsonHttpMessageConverter"/>
        </mvc:message-converters>
    </mvc:annotation-driven>
    <!--数据校验器-->
    <bean id="localValidator" class="org.springframework.validation.beanvalidation.LocalValidatorFactoryBean">
        <property name="providerClass" value="org.hibernate.validator.HibernateValidator"/>
    </bean>

    <!--    <mvc:resources mapping="/js/**" location="/static/js/"/>-->
    <!--    <mvc:resources mapping="/css/**" location="/static/css/"/>-->
    <!--    <mvc:resources mapping="/img/**" location="/static/img/"/>-->



    <!--跳转页面配置，由于使用了Rest风格，页面跳转写在controller会很乱（需要额外写一个跳转controller）-->
<!--    <mvc:view-controller path="/toUser" view-name="user"/>-->
<!--    <mvc:view-controller path="/toUpload" view-name="upload"/>-->

    <!--跨域配置-->
    <mvc:cors>
        <!--/user/为前缀的资源，允许http://127.0.0.1:5500访问*所有方法（包括PUT、DELETE等复杂请求）-->
        <mvc:mapping path="/user/**" allowed-methods="*" allowed-origins="http://localhost:8080/"/>
        <mvc:mapping path="/**" allowed-methods="*" allowed-origins="*"/>
    </mvc:cors>

    <!--文件上传配置-->
<!--    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">-->
<!--        &lt;!&ndash; 请求的编码格式，必须和jSP的pageEncoding属性一致，以便正确读取表单的内容，默认为ISO-8859-1 &ndash;&gt;-->
<!--        <property name="defaultEncoding" value="utf-8"/>-->
<!--        &lt;!&ndash; 上传文件大小上限，单位为字节（10485760=10M） &ndash;&gt;-->
<!--        <property name="maxUploadSize" value="10485760"/>-->
<!--        <property name="maxInMemorySize" value="40960"/>-->
<!--    </bean>-->

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
            <mvc:exclude-mapping path="/ydlUser/getInfo"/>
            <mvc:exclude-mapping path="/login"/>
            <!--class属性就是我们自定义的拦截器-->
            <bean id="loginInterceptor" class="com.ydlclass.interceptor.LoginInterceptor"/>
        </mvc:interceptor>
        <mvc:interceptor>
            <mvc:mapping path="/**"/>
            <bean id="repeatInterceptor" class="com.ydlclass.interceptor.RepeatInterceptor" />
        </mvc:interceptor>
    </mvc:interceptors>
	
    <!--异步任务配置，executor配置@Async默认调用ydl-log线程池-->
    <task:annotation-driven executor="ydl-log"/>
    <task:executor id="ydl-log" pool-size="10-20" keep-alive="120" queue-capacity="100" rejection-policy="ABORT"/>
</beans>

```

### Constant

```java
public class Constants {
    /**
     * token的key前缀
     */
    public static final String TOKEN_PREFIX = "token:";

    /**
     * 获取token的header key
     */
    public static final String HTTP_HEADER_AUTHORIZATION = "Authorization";
    /**
     * token过期时间
     */
    public static final long TOKEN_TIME = 1800L;

    /**
     * 可访问角色的key前缀
     */
    public static final String ROLE_PREFIX = "role:";
    /**
     * 可访问权限的key前缀
     */
    public static final String PERM_PREFIX = "perm:";

    /**
     * 防止表单重复提交的key前缀
     */
    public static final String REPEAT_PREFIX = "repeat:";

}
```

### TokenUtil

```java
/**
 * spring环境下，直接从ThreadLocal中获取当前http请求
 **/
public class TokenUtil {

    public static HttpServletRequest getRequest(){
        return  ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
    }

    public static String getToken() {
        return getRequest().getHeader(Constants.HTTP_HEADER_AUTHORIZATION);
    }

    public static YdlLoginUser getLoginUserFromRedis(RedisTemplate redisTemplate) {
        // 1、获取token
        String token = getToken();
        // 如果获取不到，用户未登录
        if (token == null) {
            return null;
        }
        // 2、从redis中查询登录用户
        String pattern = Constants.TOKEN_PREFIX + "*" + token;
        Set<String> keys = redisTemplate.keys(pattern);
        // 查不到，用户未登录
        if (keys == null || keys.isEmpty()) {
            return null;
        }
        String key = keys.stream().findFirst().get();
        return redisTemplate.getObject(key, new TypeReference<>() {});
    }
    public static List<String> getRolesFromRedis(RedisTemplate redisTemplate) {
        // 1、获取token
        String token = getToken();
        // 如果获取不到，用户未登录
        if (token == null) {
            return null;
        }
        return redisTemplate.getObject(Constants.ROLE_PREFIX + token, new TypeReference<>() {});
    }
    public static List<String> getPermsFromRedis(RedisTemplate redisTemplate) {
        // 1、获取token
        String token = getToken();
        // 如果获取不到，用户未登录
        if (token == null) {
            return null;
        }
        return redisTemplate.getObject(Constants.PERM_PREFIX + token, new TypeReference<>() {});
    }


    /**
     * 存储登录用户，用户名作为前缀，token作为key，示例：token:{username}:{token}
     * @param username 用户名
     * @param token token
     * @param loginUser 登录用户
     */
    public static void saveLoginUserByUsernameAndToken(String username, String token, YdlLoginUser loginUser, RedisTemplate redisTemplate) {
        String prefix = Constants.TOKEN_PREFIX + username + ":";
        String key = prefix + token;
        redisTemplate.setObject(key,loginUser,Constants.TOKEN_TIME);
    }

}
```

### LogAspect操作日志

```java
/**
 * 操作日志切面
 * ydlOperLogService.insert(ydlOperLog);方法使用了@Async，不影响主线程
 **/
@Component
@Aspect
@Slf4j
public class LogAspect {

    @Resource
    RedisTemplate redisTemplate;

    @Resource
    YdlOperLogService ydlOperLogService;

    @AfterReturning("@annotation(log)")
    public void saveOperateLog(JoinPoint jp, Log log) {
        logHandler(jp, log, null);
    }
    @AfterThrowing(value = "@annotation(log)", throwing = "ex")
    public void saveOperateLog(JoinPoint jp, Log log, Exception ex) {
        logHandler(jp, log, ex);
    }

    public void logHandler(JoinPoint jp, Log operLog, Exception ex){
        HttpServletRequest request = TokenUtil.getRequest();

        YdlOperLog ydlOperLog = new YdlOperLog();
        ydlOperLog.setTitle(operLog.title());
        ydlOperLog.setBusinessType(operLog.businessType());
        if (ex != null) {
            ydlOperLog.setStatus(500);
            String errorMsg = ex.getMessage();
            ydlOperLog.setErrormsg(errorMsg.length() <= 1000 ? errorMsg : errorMsg.substring(0,1000));
        } else {
            ydlOperLog.setStatus(200);
        }
        YdlLoginUser loginUser = TokenUtil.getLoginUserFromRedis(redisTemplate);
        if (loginUser != null) {
            ydlOperLog.setOperName(loginUser.getYdlUser().getUserName());
            ydlOperLog.setOperIp(loginUser.getIpaddr());
        }

        String method = jp.getSignature().getName();
        ydlOperLog.setMethod(method);
        ydlOperLog.setRequestMethod(request.getMethod());
        ydlOperLog.setOperUrl(request.getRequestURI());
        ydlOperLog.setOpertime(new Date());

        log.info("[{}]访问了[{}]，执行了[{}]操作", ydlOperLog.getOperName(), ydlOperLog.getOperUrl(),ydlOperLog.getTitle());
        ydlOperLogService.insert(ydlOperLog);
    }

}
```

### LoginInterceptor登录拦截器

```java
@Slf4j
@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Resource
    RedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1、获取登录用户
        YdlLoginUser loginUser = TokenUtil.getLoginUserFromRedis(redisUtil);
        // 如果找不到，用户登录过期
        if (loginUser == null || TokenUtil.getRolesFromRedis(redisUtil) == null || TokenUtil.getPermsFromRedis(redisUtil) == null) throw new UserLoginExpireException();

        // 2、如果找到，说明当前用户正在使用系统，给该用户token续命
        String token = loginUser.getToken();
        redisUtil.expire(Constants.TOKEN_PREFIX + loginUser.getYdlUser().getUserName() + ":" + token, Constants.TOKEN_TIME);
        redisUtil.expire(Constants.ROLE_PREFIX + token, Constants.TOKEN_TIME);
        redisUtil.expire(Constants.PERM_PREFIX + token, Constants.TOKEN_TIME);
        return true;
    }
}
```

### RepeatInterceptor表单重复

```java
/**
 * 防止表单重复提交的拦截器
 * 感觉用aop也可以？可能拦截器优先级比aop高？
 **/
@Component
public class RepeatInterceptor implements HandlerInterceptor {

    @Resource
    private RedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            // 1、检测是否持有该注解，没有就放行，不做处理
            Repeat repeat = handlerMethod.getMethodAnnotation(Repeat.class);
            if (repeat == null) {
                return true;
            }

            // 2、从redis中检索，是否有同样的执行记录，如果有就拦截
            if (isRepeat(repeat)) {
                throw new RepeatOperateException(repeat.value());
            }
        }

        return true;
    }

    private boolean isRepeat(Repeat repeat) throws IOException {
        HttpServletRequest request = TokenUtil.getRequest();
        YdlLoginUser loginUser = TokenUtil.getLoginUserFromRedis(redisTemplate);
        String key = Constants.REPEAT_PREFIX + loginUser.getToken() + ":" + request.getRequestURI();
        String nowParams = JSONObject.toJSONString(request.getParameterMap());

        String oldParams = redisTemplate.get(key);
        // 最近没有执行过，存储本次操作
        if (!nowParams.equals(oldParams)) {
            redisTemplate.set(key, nowParams, repeat.value());

            return false;
        } else {
            // 最近执行过相同的操作
            return true;
        }
    }

}
```

### YdlUserServiceImpl登录方法

```java
@Override
public YdlLoginUser login(String userName, String password) {
    // 1、确保前端传入的数据安全（已通过校验）

    // 2、用username从数据库查询用户
    YdlUser ydlUser = ydlUserDao.queryByUsername(userName);
    // 3、如果查不到，用户不存在
    if (ydlUser == null) throw new UserNotFoundException(userName);
    // 4、如果能查到，判断密码是否正确，如果不正确，登入失败
    if (!password.equals(ydlUser.getPassword())) throw new PasswordIncorrectException(userName);
    // 5、如果密码正确，登入成功
    // 6、创建token，获取客户端信息
    String token = UUID.randomUUID().toString();
    HttpServletRequest request = TokenUtil.getRequest();
    UserAgent userAgent = new UserAgent(request.getHeader("User-Agent"));

    // 通过ip获取其所属的地址
    ResponseEntity<String> result = restTemplate.getForEntity("https://whois.pconline.com.cn/ipJson.jsp?ip="+request.getRemoteHost()+"&json=true", String.class);
    String body = result.getBody();
    Map<String,String> map = JSONObject.parseObject(body, new TypeReference<>() {});
    String location = map.get("addr")+map.get("pro")+map.get("city")+map.get("region");
    // 7、封装loginUser
    YdlLoginUser loginUser = YdlLoginUser.builder()
            .userId(ydlUser.getUserId())
            .token(token)
            .ydlUser(ydlUser)
            .loginTime(new Date())
            .ipaddr(request.getRemoteAddr())
            .os(userAgent.getOperatingSystem().getName())
            .browser(userAgent.getBrowser().getName())
            .loginLocation(location)
            .build();

    // 8、查询是否有其他客户端正在使用此账号，如果有就踢掉
    String pattern = Constants.TOKEN_PREFIX + userName + ":*";
    Set<String> keys = redisTemplate.keys(pattern);
    if (keys != null && !keys.isEmpty()) {
        keys.forEach(key -> {
            redisTemplate.remove(key);
        });
        log.info("检测到账号[{}]在其他设备使用，踢掉其他设备的登录", userName);
    }
    // 9、将loginUser保存到redis，{key: token:{userName}:{token}, value:{loginUser}}
    TokenUtil.saveLoginUserByUsernameAndToken(userName,token,loginUser,redisTemplate);
    return loginUser;
}
```


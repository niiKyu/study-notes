#### springsecurity 登陆流程

![img](..\img\1713933000648-c73d769f-23e5-4247-a783-a30ac49b0c05.webp)

所有的过滤器链

![img](..\img\1713933000722-813c64e2-a0e6-4120-ba73-0f8dac72dbf4.webp)

![PixPin_2025-03-24_11-22-48](..\img\PixPin_2025-03-24_11-22-48-1742786577184-9.png)

#### 思路

我们需要写controller接口（我们的接口需要加入白名单），在controller中调用prodivermanager auth方法，替换它的UserDetailsService和PasswordEncode，接着自己定义一个登录拦截器

1. 自定义登录接口
   * 调用prodivermanager auth方法
   * 登陆成功生成jwt
   * 存入redis
2. 自定义UserDetailsService实现类
   * 从数据库中获取系统用户

3. 自定义认证过滤器
   * 获取token
   * 从token中获取userid
   * 从redis中通过userid获取用户信息
   * 存SecurityContextHolder

​	

​	

​	

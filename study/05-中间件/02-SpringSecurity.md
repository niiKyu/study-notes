# SpringSecurity

不常用，一般采用自定义的方式

## 认证

### springsecurity 登陆流程

![img](..\img\1713933000648-c73d769f-23e5-4247-a783-a30ac49b0c05.webp)

所有的过滤器链

![PixPin_2025-03-27_15-26-01](..\img\PixPin_2025-03-27_15-26-01.png)

![PixPin_2025-03-24_11-22-48](..\img\PixPin_2025-03-24_11-22-48-1742786577184-9.png)

### 思路

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

### SecurityConfig

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Resource
    LoginFilter loginFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String[] allowedPaths = { "/login", "/register" };

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 前后端分离架构不需要csrf保护
                .csrf((csrf) -> csrf.disable())
                // 禁用默认登录页
                .formLogin((login) -> login.disable())
                // 禁用默认登出页
                .logout((logout) -> logout.disable())
                // 禁用basic明文验证
                .httpBasic((basic) -> basic.disable())
                // 前后端分离是无状态的，不需要session了，直接禁用
                .sessionManagement(configurer -> {
                    configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                // 注册登录过滤器，阻止非系统用户访问
                .addFilterBefore(loginFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(authorize -> authorize
                        // permitAll放行、anonymous未登录才能访问、authenticated登录才能访问
                        .requestMatchers(allowedPaths).anonymous()
                        // 除上面外的所有请求全部需要鉴权认证
                        .anyRequest().authenticated()
                );


        return http.build();


//        // 设置异常的EntryPoint，如果不设置，默认使用Http403ForbiddenEntryPoint
//        .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(invalidAuthenticationEntryPoint))


    }

    /**
     * 配置跨源访问(CORS)
     * @return
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setAllowedMethods(Collections.singletonList("*"));
        configuration.setAllowedOrigins(Collections.singletonList("*"));
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Controller

```java
@PostMapping("login")
public ResponseEntity<Map<String,Object>> login(@RequestBody SysUser sysUser){
    Map<String,Object> token = userService.login(sysUser.getUserName(), sysUser.getPassword());
    return ResponseEntity.ok(token);
}
```

### Service

```java
@Service
public class UserServiceImpl implements UserService {

    @Resource
    AuthenticationManager authenticationManager;
    @Resource
    RedisCache redisCache;

    public Map<String, Object> login(String username, String password) {
        // 1、认证
        Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        // 2、如果认证没通过，给出对应的提示
        if (Objects.isNull(authenticate)) {
            throw new PasswordIncorrectException(username);
        }
        // 3、如果认证通过，创建JWT token
        SysLoginUser sysLoginUser = (SysLoginUser) authenticate.getPrincipal();
        Long userId = sysLoginUser.getSysUser().getId();
        // 4、查询权限信息
        Map<String, List<String>> info = getInfo(userId);
        List<String> roles = info.get(ReturnDataKeyConstant.ROLES);
        List<String> perms = info.get(ReturnDataKeyConstant.PERMS);
        sysLoginUser.setRoles(roles);
        sysLoginUser.setPerms(perms);
        // 5、创建jwt，将用户id存入，让前端每次请求都带上jwt
        String jwt = JwtUtil.createJwt(new HashMap<>(){{
            put(JwtClaimsConstant.USER_ID,userId);
        }});

        // 6、登录用户存入redis
        RedisTokenUtil.saveLoginUser(userId,sysLoginUser,redisCache);

        // 7、返回token给前端
        Map<String, Object> data = new HashMap<>();
        data.put(ReturnDataKeyConstant.TOKEN,jwt);
        data.put(ReturnDataKeyConstant.ROLES, roles);
        data.put(ReturnDataKeyConstant.PERMS, perms);
        return data;
    }

    public void logout(){
        // 1、获取登录用户
        SysLoginUser loginUser = RedisTokenUtil.getLoginUser(redisCache);
        // 如果获取不到，登录已过期
        if (Objects.isNull(loginUser)) {
            throw new UserLoginExpireException();
        }
        // 2、删除redis的登录用户
        Long id = loginUser.getSysUser().getId();
        redisCache.deleteObject(RedisTokenConstant.TOKEN_PREFIX + id);
    }
    
    public Map<String, List<String>> getInfo(Long id){
        SysUser sysUser = userDao.getInfo(id);

        // 1、查询到权限后，处理成 方便操作 的形式
        List<SysRole> sysRoles = sysUser.getRoles();
        List<String> roles = sysRoles.stream().map(SysRole::getRoleKey).collect(Collectors.toList());
        List<String> perms = new ArrayList<>();
        sysRoles.forEach(sysRole -> {
            sysRole.getMenus().forEach(sysMenu -> {
                perms.add(sysMenu.getPerms());
            });
        });

        // 3、返回给前端
        Map<String,List<String>> data = new HashMap<>();
        data.put(ReturnDataKeyConstant.ROLES, roles);
        data.put(ReturnDataKeyConstant.PERMS, perms);
        return data;
    }
}
```

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Resource
    UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser sysUser = userMapper.selectByUserName(username);
        if (Objects.isNull(sysUser)) {
            throw new UserNotFoundException(username);
        }
        SysLoginUser sysLoginUser = new SysLoginUser(sysUser, new ArrayList<>());
        return sysLoginUser;
    }
}
```

### filter

```java
@Component
public class LoginFilter extends OncePerRequestFilter {
    @Resource
    RedisCache redisCache;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1、获取token
        String token = request.getHeader(RedisTokenConstant.HTTP_HEADER_AUTHORIZATION);
        if (token == null) {
            // 如果获取不到直接放行，不做认证
            filterChain.doFilter(request,response);
            return;
        }

        // 2、从redis获取登录用户
        SysLoginUser sysLoginUser = RedisTokenUtil.getLoginUser(redisCache, request);
        // 如果找不到，用户登录过期
        if (sysLoginUser == null /** || RedisTokenUtil.getRoles(redisCache) == null || RedisTokenUtil.getPerms(redisCache) == null **/) {
            throw new UserLoginExpireException();
        }

        // 3、如果找到，说明当前用户正在使用系统，给该用户token续命
        SysUser sysUser = sysLoginUser.getSysUser();
        Long userId = sysUser.getId();
        redisCache.expire(RedisTokenConstant.TOKEN_PREFIX + userId, RedisTokenConstant.TOKEN_TIME, TimeUnit.SECONDS);
//        redisCache.expire(RedisTokenConstant.ROLE_PREFIX + token, RedisTokenConstant.TOKEN_TIME);
//        redisCache.expire(RedisTokenConstant.PERM_PREFIX + token, RedisTokenConstant.TOKEN_TIME);

        // 4、存入SecurityContextHolder
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(null, null, sysLoginUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        // 5、放行
        filterChain.doFilter(request,response);
    }
}
```

## 授权

```java
@EnableMethodSecurity
```

然后就可以使用对应的注解。`@PreAuthorize`

```java
@PreAuthorize("hasRole('admin')")
//等同于，会加一个默认前缀ROLE_
@PreAuthorize("hasAuthority('ROLE_admin')")
//不常用，一般采用自定义的方式实现更复杂的功能
```

### 自定义权限校验

```java
@Component("ex")
public class LLSExpressionRoot {

    public boolean hasAuthority(String authority){
        //获取当前用户的权限
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        List<String> permissions = loginUser.getPermissions();
        //判断用户权限集合中是否存在authority
        return permissions.contains(authority);
    }
}
```

然后就可以在`@PreAuthorize`调用自己的权限校验，`@ex`表示名字为`ex`的`bean`

```java
@PreAuthorize("@ex.hasAuthority('dev:code:pull')")
```

## 自定义失败处理

由于springsecurity是在过滤器实现，并没有进入dispatchservlet，所以需要额外的配置

- 认证失败：它会封装AuthenticationException，然后调用**AuthenticationEntryPoint**的commence方法处理
- 授权失败：它会封装AccessDeniedException，然后调用**AccessDeniedHandler**的handle方法处理

```java
@Component
public class AuthenticationEntryPointImpl implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        //给前端ResponseResult 的json
        ResponseResult responseResult = new ResponseResult(HttpStatus.UNAUTHORIZED.value(), "登陆认证失败了，请重新登陆！");
        String json = JSON.toJSONString(responseResult);
        WebUtils.renderString(response,json);
    }
}
```

```java
@Component
public class AccessDeniedHandlerImpl implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        //给前端ResponseResult 的json
        ResponseResult responseResult = new ResponseResult(HttpStatus.FORBIDDEN.value(), "您权限不足！");
        String json = JSON.toJSONString(responseResult);
        WebUtils.renderString(response,json);
    }
}
```

```java
@Autowired
AuthenticationEntryPointImpl authenticationEntryPoint;
@Autowired
AccessDeniedHandlerImpl accessDeniedHandler;

//告诉security如何处理异常
http.exceptionHandling().authenticationEntryPoint(authenticationEntryPoint)
        .accessDeniedHandler(accessDeniedHandler);
```

## 默认配置使用的处理器（不重要）

默认的表单登录使用的认证成功、认证失败、注销成功处理器，如果使用自定义的认证过滤器（比如上面的jwt方案）就不需要了解

### 认证成功处理器

```java
@Component
public class LLSSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("认证成功了");
    }
}
```

### 认证失败处理器

```java
@Component
public class LLSFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        System.out.println("认证失败了");
    }
}
```

### 登出成功处理器

```java
@Component
public class LLSLogoutSuccessHandler implements LogoutSuccessHandler {
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("注销成功");
    }
}
```

```java
http.formLogin()
//                配置认证成功处理器
                .successHandler(successHandler)
//                配置认证失败处理器
                .failureHandler(failureHandler);

http.logout()
        //配置注销成功处理器
        .logoutSuccessHandler(logoutSuccessHandler);

http.authorizeRequests().anyRequest().authenticated();
```


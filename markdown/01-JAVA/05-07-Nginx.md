## 第一章 基础及安装

### 一、nginx功能介绍

Nginx是一款开源的，支持高性能、高并发的Web服务器和代理服务软件。它是由俄罗斯人IgorSysoev开发的，最初被应用在俄罗斯的大型网站www.rambler.ru上。后来作者将源代码以类BSD许可的形式开源出来供全球使用。因为它的稳定性、丰富的模板库、灵活的配置和低系统资源的消耗而闻名。

目前，市场上还有很多同类竞品，如大名鼎鼎的apache，Lighttpd。目前，Nginx的市场份额和域数量双双稳居世界第一，并以4.12亿的总数遥遥领先其他竞争对手。

### 二、nginx可以提供的服务

1. web服务
2. 负载均衡（反向代理）
3. web cache（web缓存）

### 三、nginx的优点

1. 比其他服务器响应更快
2. 高扩展，nginx的设计极具扩展性，他是由多个功能不同且耦合性极低的模块组成。
3. 单机支持并发极高，理论上支持10万的并发连接，nginx支持的并发连接和内存相关，超过10万也是可以的。
4. 低内存消耗，10000个非活跃的http keep-alive链接在nginx中仅仅消耗2.5M的内存。
5. 支持热部署，如不用停止服务就能重新加载配置文件。
6. 极具自由的BSD许可协议。我们不仅可以直接阅读nginx的源代码、还能用来修改升级。

### 四、nginx应有场合

1. 静态服务器。用来存放我们的静态资源，如图片、静态页面、js、css等。
2. 反向代理，负载均衡。日pv2000W以下，都可以直接用nginx做代理。
3. 缓存服务。

### 五、nginx实战

#### 1、下载nginx安装包

#### 2、安装依赖包

nginx安装依赖GCC、openssl-devel、pcre-devel和zlib-devel软件库，他们的作用如下：

- zlib库用于对HTTP包的内容做gzip格式的压缩，并指定对于某些类型（content-type）的HTTP响应使用gzip来进行压缩以减少网络传输量，则在编译时就必须把zlib编译进Nginx。

- Pcre全称（Perl Compatible Regular Expressions），Perl库，包括perl兼容的正则表达式库，如果我们在nginx中使用了正则表达式，那么在编译Nginx时就必须把PCRE库编译进Nginx。

- 如果服务器不只是要支持HTTP，还需要在更安全的SSL协议上传输HTTP，那么需要拥有OpenSSL。另外，如果我们想使用MD5、SHA1等散列函数，那么也需要安装它。可以这样安装：

  我们使用以下的命令进行安装：

  ```sh
  yum install gcc zlib-devel pcre pcre-devel openss1 openssl-devel -y
  ```

#### 3、编译安装

默认配置

```sh
tar -zvxf nginx-1.22.0.tar.gz
./configure
make
make install
```

```sh
./configure --prefix=/data/nginx --user=nginx --group=nginx--with-http_ss1_module --with-http_stub_status_module
# -M：不创建主目录	-S：不允许登录/sbin/nologin是一个有一个特殊的shell，不需要登陆
useradd nginx -M -s /sbin/nologin
make && make install
--with-http_ss1_module 安装该模块，该模块是nginx支持ssl协议，提供https服务。
--with-http_stub_status_module #是一个监视模块，可以查看目前的连接数等一些信息，因为是非核心模块，所以我们使用nginx -V默认是没有安装的
```

### 六、nginx配置文件

nginx配置文件主要分为四个部分：

```
main{ # （全局配置）
    http{ # 服务器配置
        upstream{} # （负载均衡服务器设置）
        server{ # （主机设置：主要用于指定主机和端口）
            location{} # （URL匹配的设置）
        }
    }
}
```

server继承自main，location继承自server，upstream即不会继承其他设置也不会被继承。

#### 1、main全局配置

nginx在运行时与具体业务功能无关的一些参数，比如工作进程数，运行的身份等。

```nginx
user ydlclass;
worker_processes 4;
worker_cpu_affinity 0001 0010 0100 1000;
error_log	/data/nginx/logs/error.log crit;
pid			/data/nginx/logs/nginx.pid;
worker_rlimit_nofile 65535;
```

- 指定nginx进程使用什么用户启动
- 指定启动多少进程来处理请求，一般情况下设置成CPU的核数，如果开启了ssl和gzip应该设置成与逻辑CPU数量一样甚至2倍，可以减少I/O操作。使用`grep ^processor /proc/cpuinfo | wc -l`查看CPU核数。
- 在高并发情况下，通过设置将CPU和具体的进程绑定来降低由于多核CPU切换造成的寄存器等现场重建带来的性能损耗。
- error_log是个主模块指令，用来定义全局错误日志文件。日志输出级别有debug、info、notice、warn、error、crit可供选择，其中，debug输出日志最为详细，而crit输出日志最少。
- 指定进程pid文件的位置

我们可以使用ps -ef | grep nginx查看master和worker的进程

#### 2、events模块

events模块主要是nginx和用户交互网络连接优化的配置内容，我们主要看一下两个配置：

```nginx
events{
    use epoll;
    worker_connections 65536;
}
```

- 是使用事件模块指令，用来指定Nginx的工作模式。Nginx支持的工作模式有select、poll、kqueue、epoll、rtsig和/dev/poll。其中select和poll都是标准的工作模式，kqueue和epoll是高效的工作模式，不同的是epoll用在Linux平台上，而kqueue用在BSD系统中。对于Linux系统，epoll工作模式是首选。在操作系统不支持这些高效模型时才使用select。
- 每一个worker进程能并发处理（发起）的最大连接数

#### 3、http服务器

```nginx
http{
    include			mime.types;
    default_type	application/octet-stream;
    #charset	gb231;
    sendfile	on;
    keepalive_timeout	60s;
}
```

- include是个主模块指令，实现对配置文件所包含的文件的设定，可以减少主配置文件的复杂度。该文件也在conf目录中。
- 这里设定默认类型为二进制流，也就是当文件类型未定义时使用这种方式。
- 指定客户端编码格式。
- 当Nginx是一个静态文件服务器的时候，开启SENDFILE配置项能大大提供Nginx的性能。当时当Nginx是作为一个反向代理来使用的时候，SENDFILE则没什么用。
- 指定每个TCP连接最多可以保持多长时间。Nginx的默认值是75秒，有些浏览器最多只保持60秒，所以可以设定为60秒。若将它设置为0，就禁止了keepalive连接。

## 第二章 实战

### 一、常用命令

```sh
nginx -V
./nginx
nginx -s stop/nginx -s quit
nginx -s reload
```

### 二、location配置详解

location通常用来匹配uri，其基本语法如下：

```nginx
location [=|~|~*|^~] /uri/ {}
```

1. =表示匹配uri时必须做到完全匹配，如

```nginx
location = / {}
```

2. ~表示匹配URI时是字母大小写敏感的。
3. ~*表示匹配URI时是忽略字母大小敏感的。
4. ^~表示匹配uri时只需满足前缀匹配即可

```nginx
# 所有/image/开头的uri会全部匹配
location ^~ /image/ {}
```

5. uri参数中是可以使用正则表达式的，如匹配以.gif .jpg和.jpeg结尾的uri，如下

```nginx
location ~* \.(gif|jpg|jpeg|png)$ {}
```

6. 以下方式可以匹配所以的uri

```nginx
location / {}
```

7. @指定一个命名的locaiton，一般用于内部重定义请求

```nginx
location @name {...}
```

#### 1、文件路径的定义

（1）以root方式设置资源路径

语法root path，默认root html，可以在http、server、location模块中配置。

```nginx
location /backend {
    root /data/www/backend
}
```

如果url为`/backend/index/test.html`则会返回/data/www/backend/backend/index/test.html文件。

（2）以alias方式设置资源路径

```nginx
location /backend {
    alias /data/www/backend
}
```

如果url为`/backend/index/test.html`则会返回/data/www/backend/index/test.html文件。

（3）访问首页

可以在http、server、location中配置

```nginx
index index.html index.htm index.php
```

（4）根据http返回码重定向页面

可以在http、server、location中配置

```nginx
error_page 404 /404.html
error_page 502 503 504 /50x.html
```

（5）try_files

可以配置在server、location模块

```nginx
try_files path1 path2 ... uri
```

nginx会尝试按照顺序访问每一个path，直到一个可访问的资源

```nginx
try_files /a/b.html $uri $uri/index.html $uri.html @other;
location @other {
	proxy_pass http://backend
}
```

#### 2、解决前端的路由问题

try_files在vue工程中有特殊作用

```nginx
# vue是单页面，如果这样配置，浏览器直接访问/about页面，是找不到页面的，他会去root下面找about
location / {
    root /data/www/ui
    index index.html
}
# 这样配置，浏览器直接访问/about页面就可以访问了
location / {
    root /data/www/ui
    try_files $uri $uri/ $uri/index.html $uri.html /index.html
}
```

#### 3、图片进行gzip压缩

![PixPin_2025-08-08_14-40-25](..\img\PixPin_2025-08-08_14-40-25.sIma7fcK.png)

```nginx
gzip on;
gzip_min_length 1k;
gzip_buffers 4 16k;
gzip_http_version 1.1;
gzip_comp_level 5;
gzip_types image/png;
gzip_vary on;
```

- 启动压缩，默认是关闭的。
- 压缩的最小文件，小于设置的文件不会压缩
- 指定Nginx服务需要向服务器申请的缓存空间的个数*大小，默认32 4k|16 8k
- 启动压缩功能时，协议的最小版本，默认HTTP/1.1
- 压缩比例由低到高从1到9，默认为1，设置的越高越消耗CPU资源，通常设置3~5之间，不超过5
- 指明仅对哪些类型的资源执行压缩操作，默认gzip_types text/html，不用写出来，否则出错。
- 设置在使用gzip功能时是否发送带有“Vary: Accept-Encoding”头域的响应头部。开启后的效果是在响应头添加Accept-Encoding: gzip

### 三、解决跨域问题

```nginx
location ^~ /api {
    rewrite ^/api(.*)$ $1 break;
    proxy_pass http://127.0.0.1:8080;
}
```

更简单的方式，但不如第一种灵活

```nginx
location ^~ /api {
    proxy_pass http://127.0.0.1:8080/;
}
```

location中的rewrite

1. break：url重写后，直接使用当前资源，完成本次请求，地址栏url不变
2. last：url重写后，马上发起一个新请求，再次进入server块，重试location匹配，超过10次匹配不到报500错误，地址栏url不变
3. redirect：返回302临时重定向，地址栏显示重定向后的url

### 四、为后端工程负载均衡

将来可能有大量的请求发送到后端工程，一台服务器没有办法集中处理，我们就需要把大量的请求分散到多台服务器上

#### 1、upstream

nginx的负载均衡功能依赖于ngx_http_upstream_module模块。upstream模块应该放于http{}标签内。

```nginx
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
    server 127.0.0.1:8080;
    server backup2.example.com:8080;
}
```

然后在location处使用如下写法：

```nginx
location / {
    proxy_pass http://backend;
}
```

nginx负载均衡的五种算法

（1）round robin 轮询 （默认）

按顺序分配，挂掉的服务器自动剔除

```nginx
upstream backend {
    server 192.168.0.1;
    server 192.168.0.2;
}
```

（2）weight轮询权重

weight的值越大分配到的访问概率越高，主要用于后端每台服务器性能不均衡的情况下，或在主从的情况下设置不同的权值，达到合理有效的地利用主机资源。

```nginx
upstream backend {
    server 192.168.0.1 weight=10;
    server 192.168.0.2 weight=10;
}
```

（3）ip_hash：每个请求按访问IP的哈希结果分配，使来自同一个IP的访客固定访问一台后端服务器，并且可以有效解决动态网页存在的session共享问题。

```nginx
upstream backend {
    ip_hash;
    server 192.168.0.1:88;
    server 192.168.0.2:80;
}
```

（4）url_hash：按访问的URL的哈希结果来分配请求，使每个URL定向到同一台后端服务器，可以进一步提高后端服务器缓存的效率。Nginx本身不支持url_hash，需要安装Nginx的hash软件包。

```nginx
upstream backend {
    server 192.168.0.1:88;	//使用hash语句时，不能在使用weight等其他参数
    server 192.168.0.2:80;
    hash $request_uri;
    hash_method crc32;	//使用hash算法
}
```

（5）fair算法：可以根据页面大小和加载时间长短智能地进行负载均衡，根据后端服务器的响应时间来分配请求，响应时间短的优先分配。Nginx本身不支持fair，要安装upstream_fair模块才能使用。

```nginx
upstream backend {
    server 192.168.0.1:88;
    server 192.168.0.2:80;
    fair;
}
```

### 五、其他工程的跨域问题

如本地浏览器访问服务器上的后端项目

```nginx
location ^~ /api/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Headers' 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range';
    add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS,PUT,DELETE,PATCH';
    proxy_pass http://ydlclass/;
}
```

### 六、nginx监控

```nginx
#设定查看Nginx状态的地址
location = /status {
    stub_status on;
}
```

访问

```sh
curl http://127.0.0.1/status
```

| 状态码             | 含义                                                         |
| :----------------- | :----------------------------------------------------------- |
| Active Connections | 当前连接数                                                   |
| accepts            | 总共处理了多少连接                                           |
| handled            | 成功创建多少握手                                             |
| requests           | 总共处理了多少请求                                           |
| Reading            | 正处于接受请求状态的连接数                                   |
| Writing            | 请求已经接受完成，且正处于处理请求或发送响应的过程中的连接数 |
| Waiting            | 开启keep-alive的情况下，这个值等于active - (reading + writing)，意思就是Nginx已处理完正在等候下一次请求指令的驻留连接 |

### 七、其他nginx配置

#### 1、访问控制allow/deny

Nginx的访问控制模块默认就会安装，而且写法也非常简单，可以分别有多个allow，deny，允许或禁止某个ip或ip段访问，依次满足任何一个规则就停止往下匹配。

```nginx
location /status {
    stub_status on;
    access_log off;
    allow 192.168.10.100;
    allow 172.29.73.0/24;
    deny all;
}
```

#### 2、列出目录autoindex

Nginx默认是不允许列出整个目录的。如需此功能，打开nginx.conf文件，在location，server或http段中加入如下参数：这个功能我们可以做一个资源下载站。

```nginx
location ^~ /file {
	root /data/www;
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
    charset utf-8,gbk;
}
```

1. `autoindex`：

   - ‌**作用**‌：启用或关闭目录索引。
   - ‌**语法**‌：`autoindex on | off;`
   - ‌**示例**‌：`autoindex on;`

2.`autoindex_exact_size`：

   - ‌**作用**‌：是否在 HTML 格式下显示文件的精确大小（字节数），或者自动转为 KB、MB、GB。
   - ‌**语法**‌：`autoindex_exact_size on | off;`
   - ‌**示例**‌：`autoindex_exact_size off;`

3.`autoindex_format`：

   - ‌**作用**‌：定义目录索引的输出格式。
   - ‌**语法**‌：`autoindex_format html | xml | json | jsonp;`
   - ‌**示例**‌：`autoindex_format json;`

4.`autoindex_localtime`：

   - ‌**作用**‌：在 HTML 格式下，是否显示本地时间。
   - ‌**语法**‌：`autoindex_localtime on | off;`
   - ‌**示例**‌：`autoindex_localtime on;`
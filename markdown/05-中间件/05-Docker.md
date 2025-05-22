# Docker

## 一、安装Docker

```sh
# 1.卸载旧的版本
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
 
# 如有需要，可以安装gcc
yum -y install gcc
 
# 以及gcc-c++
yum -y install gcc-c++
 
                  
# 2.需要的安装包
sudo yum install -y yum-utils
 
# 3.设置镜像仓库
sudo yum-config-manager \
    --add-repo \
    # 默认是国外的，不要使用
    https://download.docker.com/linux/centos/docker-ce.repo
    
    # 建议使用阿里云的镜像，十分快
 sudo yum-config-manager \
    --add-repo \
    http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
 
# 更新yum软件包索引（安装前的工作，非必须）
yum makecache fast
# yum makecache: error: argument timer: invalid choice: 'fast' (choose from 'timer')
# 安装报错了，yum makecache fast是centOS7的命令， 不使用8，可以直接使用
yum makecache # 或者
dnf makecache
 
 
# 4.安装docker docker-ce：社区版的，docker-ee：企业版的
sudo yum install docker-ce docker-ce-cli containerd.io
```

### 1.1 docker相关的命令

```sh
systemctl start docker # 启动docker
systemctl stop docker # 停止docker 
systemctl restart docker # 重启docker
systemctl status docker	# 查看docker启动状态
```

### 1.2配置镜像加速

参考阿里云的镜像加速文档：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors

```sh
1. 安装／升级Docker客户端
推荐安装1.10.0以上版本的Docker客户端，参考文档docker-ce

2. 配置镜像加速器
针对Docker客户端版本大于 1.10.0 的用户

您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://u66s0skm.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 二、安装es

### 2.1 创建网络

因为需要部署`kibana`容器，因此需要让es和kibana容器互联。
指令：

```h
docker network create es-net
```

### 2.2 拉取镜像

以安装Elasticsearch 8.6.0 版本为例

```sh
docker pull elasticsearch:8.6.0
```

### 2.3 创建挂载点目录

```sh
mkdir -p /usr/local/es/data /usr/local/es/config /usr/local/es/plugins
```

```sh
chmod 777  /usr/local/es/data
chmod 777  /usr/local/es/config
chmod 777  /usr/local/es/plugins
```

### 2.4 部署单点es，创建es容器

```sh
docker run -d \
--restart=always \
--name es \
--network es-net \
-p 9200:9200 \
-p 9300:9300 \
--privileged \
-v /usr/local/es/data:/usr/share/elasticsearch/data \
-v /usr/local/es/plugins:/usr/share/elasticsearch/plugins \
-e "discovery.type=single-node" \
-e "ES_JAVA_OPTS=-Xms128m -Xmx128m" \
elasticsearch:8.6.0
```

添加了配置文件夹的挂载

```sh
docker run -d \
--name es \
--network es-net \
-p 9200:9200 \
-p 9300:9300 \
--privileged \
-v es-data:/usr/share/elasticsearch/data \
-v es-config://usr/share/elasticsearch/config \
-v es-plugins:/usr/share/elasticsearch/plugins \
-e "discovery.type=single-node" \
-e "ES_JAVA_OPTS=-Xms128m -Xmx128m" \
elasticsearch:8.6.0
```

### 2.5 编写elasticsearch.yml

先进入es容器

```sh
docker exec -it es /bin/bash
```

跳转到config目录下

```sh
cd config
```

关闭 密码安全验证

```sh
echo 'xpack.security.enabled: false' >> elasticsearch.yml
```

### 2.6 重启es容器

```sh
docker restart es
```

### 2.7 测试Elasticsearch是否安装成功

访问虚拟机地址+端口号，前面配置Elasticsearch 的端口号为：9200
例如：`http://47.120.37.156:9200/`

## 三、安装Kibana

### 3.1 拉取镜像

以安装kibana 8.6.0 版本为例

指令：

```sh
docker pull kibana:8.6.0
```

```sh
[root@iZf8z89pv77t13an9qqmcrZ ~]# docker images
REPOSITORY      TAG       IMAGE ID       CREATED         SIZE
kibana          8.6.0     e903232de67c   16 months ago   718MB
elasticsearch   8.6.0     6053d49e4509   16 months ago   1.29GB
```

```sh
mkdir -p /usr/local/kibana/config /usr/local/kibana/data
```

### 3.2 启动容器

```sh
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:8.6.0
```

## 四、安装IK分词器

离线安装：

### 4.1，下载插件

下载地址https://github.com/infinilabs/analysis-ik/releases

### 4.2 解压

将我们刚刚下载的压缩包解压后改名为ik

### 4.3 上传到es容器的插件数据卷中

也就是 /usr/local/es/plugins

### 4.4 重启容器

```sh
docker restart es
```

### 4.5 查看日志

```sh
docker logs es
```

## 五、安装RabbitMQ

```sh
docker run \
 -e RABBITMQ_DEFAULT_USER=admin \
 -e RABBITMQ_DEFAULT_PASS=123456 \
 -v mq-plugins:/plugins \
 --name mq \
 --restart=always \
 --hostname mq1 \
 -p 15672:15672 \
 -p 5672:5672 \
 -d \
 rabbitmq:3.8-management
```

## 六、安装MySQL

### 6.1 拉取镜像

```sh
docker pull mysql:5.7
```

### 6.2 在 /usr 下创建 mysql/data 和 mysql/conf 两个目录

```sh
mkdir -p /usr/mysql/conf
mkdir -p /usr/mysql/data
```

### 6.3 运行mysql容器

```sh
docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -d -p 3306:3306 -v /usr/mysql/conf:/etc/mysql/conf.d -v /usr/mysql/data:/var/lib/mysql mysql:5.7
```

## 七、安装Nacos

### 1, 拉取nacos镜像

```sh
docker pull nacos/nacos-server
docker pull nacos/nacos-server:v2.3.0	指定版本
```

### 2、创建宿主机挂载目录

```sh
mkdir -p /usr/nacos/logs
mkdir -p /usr/nacos/conf
mkdir -p /usr/nacos/data
```

### 3、启动nacos 并复制文件到宿主机，关闭容器

```sh
# 启动nacos
docker run -p 8848:8848 --name nacos -d nacos/nacos-server

# 复制文件
docker cp nacos:/home/nacos/logs /usr/nacos
docker cp nacos:/home/nacos/conf /usr/nacos

# 关闭容器(容器id也可以)
docker rm -f nacos
```

### 4、mysql中创建nacos所需的表

mysql中新建一个库，名字可自定义，数据库初始化文件：[mysql-schema.sql](https://github.com/alibaba/nacos/blob/master/distribution/conf/mysql-schema.sql?spm=5238cd80.2ef5001f.0.0.3f613b7cADot40&file=mysql-schema.sql)

### 5、再次启动nacos

```sh
docker run -d --name nacos \
-p 8080:8080 \
-p 8848:8848 \
-p 9848:9848 \
-p 9849:9849 \
-e MODE=standalone \
-e SPRING_DATASOURCE_PLATFORM=mysql \
-e MYSQL_SERVICE_HOST=192.168.169.133 \
-e MYSQL_SERVICE_PORT=3306 \
-e MYSQL_SERVICE_USER=root \
-e MYSQL_SERVICE_PASSWORD=root \
-e MYSQL_SERVICE_DB_NAME=nacos \
-e NACOS_AUTH_IDENTITY_KEY=Q2lybm83NjA= \
-e NACOS_AUTH_IDENTITY_VALUE=Q2lybm83NjA= \
-e NACOS_AUTH_TOKEN=ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnpkV0lpT2lJeE1qTTBOVFkzT0Rrd0lpd2libUZ0WlNJNklrcHZhRzRnUkc5bElpd2lZV1J0YVc0aU9uUnlkV1VzSW1saGRDSTZNVFV4TmpJek9UQXlNbjAuS01VRnNJRFRuRm15RzNuTWlHTTZIOUZORlVST2Yzd2g3U21xSnAtUVYzMA== \
-e JVM_XMS=512m \
-e JVM_XMX=512m \
-e JVM_XMN=256m \
-e JVM_MS=128m \
-e JVM_MMS=256m \
--restart=always nacos/nacos-server \
nacos/nacos-server
```

Derby启动

`docker run -d --name nacos -p 8848:8848 -p 9848:9848 -p 9849:9849 --privileged=true -e JVM_XMS=8m -e JVM_XMX=8m -e MODE=standalone -v /usr/nacos/logs/:/home/nacos/logs -v /usr/nacos/conf/:/home/nacos/conf/ -v /usr/nacos/data/:/home/nacos/data/ --restart=always nacos/nacos-server`

mysql启动

`docker run -d -e JVM_XMS=128m -e JVM_XMX=128m -e JVM_XMN=128m -e MODE=standalone -e PREFER_HOST_MODE=hostname -e SPRING_DATASOURCE_PLATFORM=mysql -e MYSQL_SERVICE_HOST=192.168.169.133 -e MYSQL_SERVICE_PORT=3306 -e MYSQL_SERVICE_USER=root -e MYSQL_SERVICE_PASSWORD=root -e MYSQL_SERVICE_DB_NAME=nacos -e NACOS_AUTH_IDENTITY_KEY=Q2lybm83NjA= -e NACOS_AUTH_IDENTITY_VALUE=Q2lybm83NjA= -e NACOS_AUTH_TOKEN=ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnpkV0lpT2lJeE1qTTBOVFkzT0Rrd0lpd2libUZ0WlNJNklrcHZhRzRnUkc5bElpd2lZV1J0YVc0aU9uUnlkV1VzSW1saGRDSTZNVFV4TmpJek9UQXlNbjAuS01VRnNJRFRuRm15RzNuTWlHTTZIOUZORlVST2Yzd2g3U21xSnAtUVYzMA== -p 8848:8848 -p 9848:9848 -p 9849:9849 --name nacos --restart=always nacos/nacos-server`

注意事项
虚拟机需要在防火墙开放相关端口，或者关了防火墙，如果你是云服务器，开放安全组

输入地址：`http://ip:8080/index.html`

如果报错误：
https://blog.csdn.net/qq_17369545/article/details/135022129

## 八、安装Nginx

### 1.拉取镜像

```sh
docker pull nginx
```

### 2.查看镜像

```sh
docker images
```

### 3.运行镜像

```sh
docker run --name mn -d -p 80:80 nginx
```

### 挂载

创建配置文件夹

```sh
mkdir -p /opt/nginx
```

复制文件

```sh
docker cp mn:/usr/share/nginx/html /opt/nginx/
docker cp mn:/etc/nginx/nginx.conf /opt/nginx/
docker cp mn:/etc/nginx/conf.d /opt/nginx/
```

删除原有的Nginx容器

```sh
docker rm -f mn
```

创建容器

```sh
docker run --name nginx -d \
-p 80:80 -p 81:81 \
-v /opt/nginx/html:/usr/share/nginx/html \
-v /opt/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
-v /opt/nginx/conf.d:/etc/nginx/conf.d \
nginx
```

修改配置
![在这里插入图片描述](..\img\f7be2ade4bee48aeaa590c7e0fc6503b.png)

将端口改成81
![在这里插入图片描述](..\img\8273eb7d8cad4c9e9c0c5e9bed825b22.png)

## 九、安装Redis

### 1、拉取redis镜像

```sh
[root@iZf8z89pv77t13an9qqmcrZ ~]# docker pull redis
```

查看镜像

```sh
[root@iZf8z89pv77t13an9qqmcrZ ~]# docker images
REPOSITORY           TAG       IMAGE ID       CREATED       SIZE
nginx                latest    605c77e624dd   2 years ago   141MB
redis                latest    7614ae9453d1   2 years ago   113MB
mysql                latest    3218b38490ce   2 years ago   516MB
nacos/nacos-server   latest    bdf60dc2ada3   2 years ago   1.05GB
```

### 2、下载配置文件

https://redis.io/docs/latest/operate/oss_and_stack/management/config/

![在这里插入图片描述](..\img\3c7843c8c11f4eaf890acdbf7aca4525.png)

如果之前用linux下载方式安装了reids 也可以直接复制redis.conf配置文件

### 3、创建Docker容器
接下来就是要将redis 的配置文件进行挂载，以配置文件方式启动redis 容器。（挂载：即将宿主的文件和容器内部目录相关联，相互绑定，在宿主机内修改文件的话也随之修改容器内部文件）
1）、挂载 redis 的配置文件
2）、挂载 redis 的持久化文件（为了数据的持久化）。
本人的配置文件是放在
liunx 下redis.conf文件位置：/usr/redis/redis.conf
liunx 下redis的data文件位置 ： /usr/redis/data

创建容器
`docker run -p 6379:6379 --name redis -v /usr/redis/redis.conf:/etc/redis/redis.conf -v /usr/redis/data:/data -d redis redis-server /etc/redis/redis.conf --appendonly yes`

### 检查日志

```sh
docker logs redis
```

### 4、测试 Redis

1. 输入指令：**docker exec -it redis bash**，进入容器内。
2. 输入指令：**redis-cli**，运行 redis 客户端。
3. 输入指令：**ping**，显示 **PONG** 代表测试成功！

### 5、开放防火墙端口

```sh
firewall-cmd --zone=public --add-port=6379/tcp --permanent
firewall-cmd --reload
firewall-cmd --zone=public --list-ports # 查看开放的端口列表
```


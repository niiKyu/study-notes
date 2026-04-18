# FastDFS

## 安装FastDFS

```sh
docker pull delron/fastdfs
docker run -dti --network=host --name tracker -v /var/fdfs/tracker:/var/fdfs -v /etc/localtime:/etc/localtime delron/fastdfs tracker

docker run -dti  --network=host --name storage -e TRACKER_SERVER=192.168.169.133:22122 -v /var/fdfs/storage:/var/fdfs  -v /etc/localtime:/etc/localtime  delron/fastdfs storage

#################### 如果需要修改端口 ############################
# 进入容器
docker exec -it storage bash
# 进入目录
cd /etc/fdfs/
# 编辑文件
vi storage.conf # 修改http.server_port
# nginx监听端口需要跟上面一致
cd /usr/local/nginx/conf
vi nginx.conf
# 重启
docker stop storage
docker start storage
#################### ################## ############################
#################### 如果需要测试 ####################################
# 进入容器
docker exec -it storage bash
cd /var/fdfs
# 创建文件
echo hello 这是我的第一个测试文件，大家觉得不错关注下吧>a.txt
# 上传文件
/usr/bin/fdfs_upload_file /etc/fdfs/client.conf a.txt
# 访问 http://ip:8888/**.txt
#################### ################## ############################

firewall-cmd --zone=public --permanent --add-port=8888/tcp
firewall-cmd --zone=public --permanent --add-port=22122/tcp
firewall-cmd --zone=public --permanent --add-port=23000/tcp
systemctl restart firewalld

docker update --restart=always tracker
docker update --restart=always storage
```

## 使用

pom

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>net.oschina.zcx7878</groupId>
        <artifactId>fastdfs-client-java</artifactId>
        <version>1.27.0.0</version>
    </dependency>
</dependencies>
```

在resources文件夹下创建fasfDFS的配置文件**fdfs_client.conf**

```txt
connect_timeout = 60
network_timeout = 60
charset = UTF-8
http.tracker_http_port = 8080
tracker_server = 192.168.200.128:22122
```

connect_timeout：连接超时时间，单位为秒。
network_timeout：通信超时时间，单位为秒。发送或接收数据时。假设在超时时间后还不能发送或接收数据，则本次网络通信失败
charset： 字符集
http.tracker_http_port ：.tracker的http端口
tracker_server： tracker服务器IP和端口设置

yml

```yml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
server:
  port: 9008
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:6868/eureka
  instance:
    prefer-ip-address: true
feign:
  hystrix:
    enabled: true
```

max-file-size是单个文件大小，max-request-size是设置总上传的数据大小

### api

```java
import com.bjpowernode.fastdfs.FastDfsClient;
import com.bjpowernode.fastdfs.FastDfsClient1;
import org.csource.common.MyException;
import org.csource.common.NameValuePair;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
 
import java.io.IOException;
 
@SpringBootApplication
public class Application implements CommandLineRunner {
 
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
 
    @Override
    public void run(String... args) throws Exception {
        testDelete1();
    }
 
    /**
     * 测试文件上传
     *
     */
    public void testUpload() {
        FastDfsClient fastDfsClient = null;
        try {
            fastDfsClient = new FastDfsClient();
 
            //文件的相关属性，属性是自己来定义
            NameValuePair[] meta_list = new NameValuePair[3];
            meta_list[0] = new NameValuePair("ext = ", "jpg, ");
            meta_list[1] = new NameValuePair("size = ", "10KB, ");
            meta_list[2] = new NameValuePair("time = ", "20230224, ");
 
            //文件上传
            String path = fastDfsClient.uploadFile("d:/壁纸2023-01-13.jpg", "jpg", meta_list);
 
            System.out.println(path);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            fastDfsClient.closeClient();
        }
    }
 
    /**
     * 测试文件下载
     */
    public void testDownload() {
        FastDfsClient fastDfsClient = null;
        try {
            fastDfsClient = new FastDfsClient();
 
            //返回0表示成功，返回其他值都是失败，比如返回6， -9， 235 .... 都是失败的
            int down = fastDfsClient.downloadFile("group1", "M00/00/00/wKgegGP4XrOAD-uFAAkqTG59q_c014.jpg", "D:/aa.jpg");
 
            System.out.println("下载结果：" + down);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            //关闭资源
            fastDfsClient.closeClient();
        }
    }
 
    /**
     * 测试文件删除
     *
     */
    public void testDelete() {
        FastDfsClient fastDfsClient = null;
        try {
            fastDfsClient = new FastDfsClient();
 
            //返回0表示成功，返回其他值都是失败，比如返回6， -9， 235 .... 都是失败的
            int delete = fastDfsClient.deleteFile("group1", "M00/00/00/wKgegGP4XrOAD-uFAAkqTG59q_c014.jpg");
 
            System.out.println("删除结果：" + delete);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            //关闭资源
            fastDfsClient.closeClient();
        }
    }
 
    //-------------------------------------------
 
 
    /**
     * 测试文件上传
     *
     */
    public void testUpload1() {
        FastDfsClient1 fastDfsClient1 = null;
        try {
            fastDfsClient1 = new FastDfsClient1();
 
            //文件的相关属性，属性是自己来定义
            NameValuePair[] meta_list = new NameValuePair[3];
            meta_list[0] = new NameValuePair("ext = ", "jpg, ");
            meta_list[1] = new NameValuePair("size = ", "10KB, ");
            meta_list[2] = new NameValuePair("time = ", "20230224, ");
 
            //文件上传
            String path = fastDfsClient1.uploadFile("d:/壁纸2023-01-13.jpg", "jpg", meta_list);
 
            System.out.println(path);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            fastDfsClient1.closeClient();
        }
    }
 
    /**
     * 测试文件下载
     */
    public void testDownload1() {
        FastDfsClient1 fastDfsClient1 = null;
        try {
            fastDfsClient1 = new FastDfsClient1();
 
            //返回0表示成功，返回其他值都是失败，比如返回6， -9， 235 .... 都是失败的
            int down = fastDfsClient1.downloadFile("group1/M00/00/00/wKgegGP4ZOOANGuhAAkqTG59q_c632.jpg", "D:/aa.jpg");
 
            System.out.println("下载结果：" + down);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            //关闭资源
            fastDfsClient1.closeClient();
        }
    }
 
    /**
     * 测试文件删除
     *
     */
    public void testDelete1() {
        FastDfsClient1 fastDfsClient1 = null;
        try {
            fastDfsClient1 = new FastDfsClient1();
 
            //返回0表示成功，返回其他值都是失败，比如返回6， -9， 235 .... 都是失败的
            int delete = fastDfsClient1.deleteFile("group1/M00/00/00/wKgegGP4ZOOANGuhAAkqTG59q_c632.jpg");
 
            System.out.println("删除结果：" + delete);
        } catch (MyException | IOException e) { //jdk1.7就可以这么写
            e.printStackTrace();
        } finally {
            //关闭资源
            fastDfsClient1.closeClient();
        }
    }
}
```

### 封装

entity

```java
package icu.niikyu.secluxury.file.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FastDFSFile {
    //文件名字
    private String name;
    //文件内容
    private byte[] content;
    //文件扩展名
    private String ext;
    //文件MD5摘要值
    private String md5;
    //文件创建作者
    private String author;

    public FastDFSFile(String name, byte[] content, String ext) {
        super();
        this.name = name;
        this.content = content;
        this.ext = ext;
    }
}
```

util

```java
import icu.niikyu.secluxury.file.entity.FastDFSFile;
import org.csource.common.NameValuePair;
import org.csource.fastdfs.*;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

public class FastDFSClient {

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(FastDFSClient.class);

    /***
     * 初始化加载FastDFS的TrackerServer配置
     */
    static {
        try {
            String filePath = new ClassPathResource("fdfs_client.conf").getFile().getAbsolutePath();
            ClientGlobal.init(filePath);
        } catch (Exception e) {
            logger.error("FastDFS Client Init Fail!",e);
        }
    }

    /***
     * 文件上传
     * @param file
     * @return
     */
    public static String[] upload(FastDFSFile file) {
        //获取文件的作者
        NameValuePair[] meta_list = new NameValuePair[1];
        meta_list[0] = new NameValuePair("author", file.getAuthor());

        //接收返回数据
        String[] uploadResults = null;
        StorageClient storageClient=null;
        try {
            //创建StorageClient客户端对象
            storageClient = getTrackerClient();

            /***
             * 文件上传
             * 1)文件字节数组
             * 2)文件扩展名
             * 3)文件作者
             */
            uploadResults = storageClient.upload_file(file.getContent(), file.getExt(), meta_list);
        } catch (Exception e) {
            logger.error("Exception when uploadind the file:" + file.getName(), e);
        }

        if (uploadResults == null && storageClient!=null) {
            logger.error("upload file fail, error code:" + storageClient.getErrorCode());
        }
        //获取组名
        String groupName = uploadResults[0];
        //获取文件存储路径
        String remoteFileName = uploadResults[1];
        return uploadResults;
    }

    /***
     * 获取文件信息
     * @param groupName:组名
     * @param remoteFileName：文件存储完整名
     * @return
     */
    public static FileInfo getFile(String groupName, String remoteFileName) {
        try {
            StorageClient storageClient = getTrackerClient();
            return storageClient.get_file_info(groupName, remoteFileName);
        } catch (Exception e) {
            logger.error("Exception: Get File from Fast DFS failed", e);
        }
        return null;
    }

    /***
     * 文件下载
     * @param groupName
     * @param remoteFileName
     * @return
     */
    public static InputStream downFile(String groupName, String remoteFileName) {
        try {
            //创建StorageClient
            StorageClient storageClient = getTrackerClient();

            //下载文件
            byte[] fileByte = storageClient.download_file(groupName, remoteFileName);
            InputStream ins = new ByteArrayInputStream(fileByte);
            return ins;
        } catch (Exception e) {
            logger.error("Exception: Get File from Fast DFS failed", e);
        }
        return null;
    }

    /***
     * 文件删除
     * @param groupName
     * @param remoteFileName
     * @throws Exception
     */
    public static void deleteFile(String groupName, String remoteFileName)
            throws Exception {
        //创建StorageClient
        StorageClient storageClient = getTrackerClient();

        //删除文件
        int i = storageClient.delete_file(groupName, remoteFileName);
    }

    /***
     * 获取Storage组
     * @param groupName
     * @return
     * @throws IOException
     */
    public static StorageServer[] getStoreStorages(String groupName)
            throws IOException {
        //创建TrackerClient
        TrackerClient trackerClient = new TrackerClient();
        //获取TrackerServer
        TrackerServer trackerServer = trackerClient.getConnection();
        //获取Storage组
        return trackerClient.getStoreStorages(trackerServer, groupName);
    }

    /***
     * 获取Storage信息,IP和端口
     * @param groupName
     * @param remoteFileName
     * @return
     * @throws IOException
     */
    public static ServerInfo[] getFetchStorages(String groupName,
                                                String remoteFileName) throws IOException {
        TrackerClient trackerClient = new TrackerClient();
        TrackerServer trackerServer = trackerClient.getConnection();
        return trackerClient.getFetchStorages(trackerServer, groupName, remoteFileName);
    }

    /***
     * 获取Tracker服务地址
     * @return
     * @throws IOException
     */
    public static String getTrackerUrl() throws IOException {
        return "http://"+getTrackerServer().getInetSocketAddress().getHostString()+":"+ClientGlobal.getG_tracker_http_port()+"/";
    }

    /***
     * 获取Storage客户端
     * @return
     * @throws IOException
     */
    private static StorageClient getTrackerClient() throws IOException {
        TrackerServer trackerServer = getTrackerServer();
        StorageClient storageClient = new StorageClient(trackerServer, null);
        return  storageClient;
    }

    /***
     * 获取Tracker
     * @return
     * @throws IOException
     */
    private static TrackerServer getTrackerServer() throws IOException {
        TrackerClient trackerClient = new TrackerClient();
        TrackerServer trackerServer = trackerClient.getConnection();
        return  trackerServer;
    }
}
```


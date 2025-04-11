# RocketMQ

MQ产品介绍

1. ActiveMQjava语言实现，万级数据吞吐量，处理速度ms级，主从架构，**成熟度高**
2. RabbitMQ**erlang语言实现**，万级数据吞吐量，**处理速度us级**，主从架构，
3. RocketMQjava语言实现，**十万级**数据吞吐量，处理速度ms级，分布式架构，功能强大，扩展性强
4. kafkascala语言实现，**十万级**数据吞吐量，处理速度ms级，分布式架构，功能较少，应用于大数据较多

![img](..\img\1713934106091-fac3e577-8ae2-4789-921d-cade4b5ba4a5.webp)

window环境

[下载](https://www.apache.org/)后设置环境变量

```sh
#环境变量
ROCKETMQ_HOME
NAMESRV_ADDR localhost:9876
```

```sh
#启动
start mqbroker.cmd -n 127.0.0.1:9876 autoCreateTopicEnable=true
#测试生产者发送消息
tools.cmd  org.apache.rocketmq.example.quickstart.Producer
#测试消费者接收消息
tools.cmd org.apache.rocketmq.example.quickstart.Consumer
```

## 图形化界面

详情[RocketMQ Dashboard]([RocketMQ Dashboard | RocketMQ](https://rocketmq.apache.org/zh/docs/deploymentOperations/04Dashboard))

## Java中发送消息

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>5.0.7</version>
</dependency>
```


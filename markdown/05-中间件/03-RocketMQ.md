# RocketMQ

推荐学习的四个网站：

rocketmq官网一https://rocketmq.apache.org/

社区网站：https://rocketmq-learning.com

GitHub：https://github.com/apache/rocketmq-clients/blob/master/java/client/src/main/java/org/apache/rocketmq/client/java/example/ProducerNormalMessageExample.java

阿里云：https://www.aliyun.com/product/rocketmq

## 通信方式

同步RPC调用模型![同步调用](..\img\syncarchi-ebbd41e1afd6adf432792ee2d7a91748.png)

异步通信模型![异步调用](..\img\asyncarchi-e7ee18dd77aca472fb80bb2238d9528b.png)

**RPC是一种同步的通信方式**，即客户端调用远程服务时，需要等待服务端响应才能继续执行。RPC通常使用 HTTP、HTTPS、TCP等协议进行通信，可以实现高性能、高可用和高并发。RPC适用于需要大量数据传输、需要 保证数据一致性的场景，例如金融、电商等。 

**MQ是一种异步的通信方式**，即客户端将消息发送到MQ队列中，服务端可以从队列中获取消息进行处理。MQ适 用于需要异步处理、解耦、流量控制等场景，例如日志、监控、报警等。MQ适用于高吞吐量、低延迟、可扩展性 强的场景。

总结来说，RPC适用于需要同步调用的场景，而MQ适用于需要异步处理、解耦、流量控制的场景。在实际应用
中，需要根据业务需求和系统特点来选择合适的通信方式。

针对以上两种通信方式，我们分别列举几个列子：

**RPC同步通信场景：**

1. 在网银转账时，需要将收款人和付款人的账户信息进行验证，并进行转账操作。在这个场景中，网银系统可以
   提供转账API，客户端在调用转账API时，需要等待转账完成才能继续执行后续操作，这类似于RPC同步通信。
2. 在游戏中的组队系统中，需要将玩家加入到队伍中，并协调队伍成员之间的操作。在这个场景中，游戏系统提
   供了加入队伍的API，客户端在调用该API时需要等待加入队伍的结果，这类似于RPC同步通信。

**MQ异步通信场景：**

1. 在电商系统中，当用户下单后，系统需要将订单信息发送给物流系统进行配送。在这个场景中，电商系统可以
   将订单信息作为消息发布到MQ队列中，物流系统从MQ队列中订阅该消息并进行配送操作。由于配送操作是
   异步进行的，客户端不需要等待配送完成就可以继续执行后续操作，这类似于MQ异步通信。
2. 在社交系统中，当用户发布一条消息时，系统需要将该消息推送给其他用户。在这个场景中，社交系统可以将
   该消息作为消息发布到MQ队列中，其他用户从MQ队列中订阅该消息并进行查看操作。由于查看操作是异步
   进行的，客户端不需要等待消息推送完成就可以继续执行后续操作，这类似于MQ异步通信。

## 消息传输模型

点对点模型 ![点对点模型](..\img\p2pmode-fefdc2fbe4792e757e26befc0b3acbff.png)

点对点模型也叫队列模型，具有如下特点：

- 消费匿名：消息上下游沟通的唯一的身份就是队列，下游消费者从队列获取消息无法申明独立身份。
- 一对一通信：基于消费匿名特点，下游消费者即使有多个，但都没有自己独立的身份，因此共享队列中的消息，每一条消息都只会被唯一一个消费者处理。因此点对点模型只能实现一对一通信。

发布订阅模型 ![发布订阅模型](..\img\pubsub-042a4e5e5d76806943bd7dcfb730c5d5.png)

发布订阅模型具有如下特点：

- 消费独立：相比队列模型的匿名消费方式，发布订阅模型中消费方都会具备的身份，一般叫做订阅组（订阅关系），不同订阅组之间相互独立不会相互影响。
- 一对多通信：基于独立身份的设计，同一个主题内的消息可以被多个订阅组处理，每个订阅组都可以拿到全量消息。因此发布订阅模型可以实现一对多通信。

传输模型对比

点对点模型和发布订阅模型各有优势，点对点模型更为简单，而发布订阅模型的扩展性更高。 Apache RocketMQ 使用的传输模型为发布订阅模型，因此也具有发布订阅模型的特点。

## 消息

### 顺序消息

Apache RocketMQ 顺序消息的顺序关系通过消息组（MessageGroup）判定和识别

**如何保证消息的顺序性**

Apache RocketMQ 的消息的顺序性分为两部分，生产顺序性和消费顺序性。

- **生产顺序性** ：

  Apache RocketMQ 通过生产者和服务端的协议保障单个生产者串行地发送消息，并按序存储和持久化。

  如需保证消息生产的顺序性，则必须满足以下条件：

  - 单一生产者：消息生产的顺序性仅支持单一生产者，不同生产者分布在不同的系统，即使设置相同的消息组，不同生产者之间产生的消息也无法判定其先后顺序。
  - 串行发送：Apache RocketMQ 生产者客户端支持多线程安全访问，但如果生产者使用多线程并行发送，则不同线程间产生的消息将无法判定其先后顺序。

  满足以上条件的生产者，将顺序消息发送至 Apache RocketMQ 后，会保证设置了同一消息组的消息，按照发送顺序存储在同一队列中。服务端顺序存储逻辑如下：

  - 相同消息组的消息按照先后顺序被存储在同一个队列。
  - 不同消息组的消息可以混合在同一个队列中，且不保证连续。

  ![顺序存储逻辑](..\img\fifomessagegroup-aad0a1b7e64089075db956c0eca0cbf4.png)

- **消费顺序性** ：

  Apache RocketMQ 通过消费者和服务端的协议保障消息消费严格按照存储的先后顺序来处理。

  如需保证消息消费的顺序性，则必须满足以下条件：

  - 投递顺序

    Apache RocketMQ 通过客户端SDK和服务端通信协议保障消息按照服务端存储顺序投递，但业务方消费消息时需要严格按照接收---处理---应答的语义处理消息，避免因异步处理导致消息乱序。

    ::: info 备注

    消费者类型为PushConsumer时， Apache RocketMQ 保证消息按照存储顺序一条一条投递给消费者，若消费者类型为SimpleConsumer，则消费者有可能一次拉取多条消息。此时，消息消费的顺序性需要由业务方自行保证。消费者类型的具体信息，请参见[消费者分类](https://rocketmq.apache.org/zh/docs/featureBehavior/06consumertype)。
    :::

  - 有限重试

    Apache RocketMQ 顺序消息投递仅在重试次数限定范围内，即一条消息如果一直重试失败，超过最大重试次数后将不再重试，跳过这条消息消费，不会一直阻塞后续消息处理。

    对于需要严格保证消费顺序的场景，请务设置合理的重试次数，避免参数不合理导致消息乱序。

**总结**

单一生产者发送消息，且消息都属于同一个消息组（MessageGroup），所有的消息会被发送到同一个FIFO类型的Topic中的同一个队列；消费者处理同一个消息组内的消息时，会顺序串行消费。（同一个消费者组有多个消费者也会顺序串行消费）

### 事务消息

基于Apache RocketMQ实现的分布式事务消息功能，在普通消息基础上，支持二阶段的提交能力。将二阶段提交和本地事务绑定，实现全局提交结果的一致性。

1. 生产者将消息发送至Apache RocketMQ服务端。
2. Apache RocketMQ服务端将消息持久化成功之后，向生产者返回Ack确认消息已经发送成功，此时消息被标记为"暂不能投递"，这种状态下的消息即为半事务消息。
3. 生产者开始执行本地事务逻辑。
4. 生产者根据本地事务执行结果向服务端提交二次确认结果（Commit或是Rollback），服务端收到确认结果后处理逻辑如下：
   - 二次确认结果为Commit：服务端将半事务消息标记为可投递，并投递给消费者。
   - 二次确认结果为Rollback：服务端将回滚事务，不会将半事务消息投递给消费者。
5. 在断网或者是生产者应用重启的特殊情况下，若服务端未收到发送者提交的二次确认结果，或服务端收到的二次确认结果为Unknown未知状态，经过固定时间后，服务端将对消息生产者即生产者集群中任一生产者实例发起消息回查。 **说明** 服务端回查的间隔时间和最大回查次数，请参见[参数限制](https://rocketmq.apache.org/zh/docs/introduction/03limits)。
6. 生产者收到消息回查后，需要检查对应消息的本地事务执行的最终结果。
7. 生产者根据检查到的本地事务的最终状态再次提交二次确认，服务端仍按照步骤4对半事务消息进行处理。

**总结**

在一个本地事务中向RocketMQ服务端投递一个消息，服务端将消息持久化成功之后，返回Ack告诉生产者这个消息投递成功了，此时消息被标记为"暂不能投递"，这种状态下的消息即为半事务消息。接着继续执行本地事务，整个事务执行完毕向服务端提交二次确认结果，如果是Commit，将半事务消息标记为可投递，就可以投递给下一个系统了；如果是Rollback，这个半事务消息就不会投递了。如果中间出现断网等特殊情况，服务端收不到二次确认结果，经过固定时间后，服务端会主动的向生产者回查之前事务的结果，再次提交二次确认。我们需要编写回查的逻辑

## 环境搭建

RocketMQ针对不同场景给我们提供了几组样例配置

* 2m-2s-async
* 2m-2s-sync
* 2m-noslave

![PixPin_2025-04-13_21-48-27](..\img\PixPin_2025-04-13_21-48-27.png)

```sh
# 快速开始
## 启动NameServer
nohup sh bin/mqnamesrv &
tail -f nohup.out
## 启动NameServer
nohup sh bin/mqbroker -n localhost:9876 --enable-proxy &
tail -f nohup.out

# loacl方式集群（broker和proxy启动在一起）
## 2m-noslave 2master无slave
### 启动第一个Master，-n代表nameser，nameser也可以在配置文件中配置
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
noslave/broker-a.properties --enable-proxy &
### 启动第二个Master
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
noslave/broker-b.properties --enable-proxy &

## 2m-2s-async
### 启动第一个Master
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
2s-async/broker-a.properties --enable-proxy &
### 启动第二个Master
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
2s-async/broker-b.properties --enable-proxy &
### 启动第一个Slave
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
2s-async/broker-a-s.properties --enable-proxy &
### 启动第二个Slave
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
2s-async/broker-b-s.properties --enable-proxy &

# cluster集群模式（broker和proxy启动在不同的机器）
## 2m-noslave
### 启动第一个Master
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
noslave/broker-a.properties &
### 启动第二个Master
nohup sh bin/mqbroker -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' -c conf/2m-
noslave/broker-b.properties &
### 启动第一个Master的proxy
nohup sh bin/mqproxy -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' &
### 启动第二个Master的proxy
nohup sh bin/mqproxy -n
'192.168.169.129:9876;192,168.169.130:9876;192.168.169.131:9876' &
```

## Java中发送消息

[在Java中使用rocketmq](https://rocketmq.apache.org/zh/docs/quickStart/01quickstart/)

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>5.0.7</version>
</dependency>
```

### ProducerExample

```java
// 接入点地址，需要设置成Proxy的地址和端口列表，一般是xxx:8080;xxx:8081。
String endpoint = "192.168.169.130:8081";
// 消息发送的目标Topic名称，需要在服务端提前创建。
String topic = "ydlclass";
ClientServiceProvider provider = ClientServiceProvider.loadService();
ClientConfigurationBuilder builder = ClientConfiguration.newBuilder().setEndpoints(endpoint);
ClientConfiguration configuration = builder.build();
// 初始化Producer时需要设置通信配置以及预绑定的Topic。
Producer producer = provider.newProducerBuilder()
        .setTopics(topic)
        .setClientConfiguration(configuration)
        .build();
// 普通消息发送。
Message message = provider.newMessageBuilder()
        .setTopic(topic)
        // 设置消息索引键，可根据关键字精确查找某条消息。由生产者定义
        .setKeys("messageKey")
        // 设置消息Tag，用于消费端根据指定Tag过滤消息。由生产者定义
        .setTag("messageTag")
        // 消息体。
        .setBody("messageBody".getBytes())
        .build();
try {
    // 发送消息，需要关注发送结果，并捕获失败等异常。
    SendReceipt sendReceipt = producer.send(message);
    logger.info("Send message successfully, messageId={}", sendReceipt.getMessageId());
} catch (ClientException e) {
    logger.error("Failed to send message", e);
}
try {
    producer.close();
} catch (IOException e) {
    logger.error("Failed to close producer", e);
}
```

### ConsumerExample

```java
final ClientServiceProvider provider = ClientServiceProvider.loadService();
// 接入点地址，需要设置成Proxy的地址和端口列表，一般是xxx:8081;xxx:8081。
String endpoints = "192.168.169.130:8081";
ClientConfiguration clientConfiguration = ClientConfiguration.newBuilder()
        .setEndpoints(endpoints)
        .build();
// 订阅消息的过滤规则，表示订阅所有Tag的消息。
String tag = "*";
FilterExpression filterExpression = new FilterExpression(tag, FilterExpressionType.TAG);
// 为消费者指定所属的消费者分组，Group需要在服务端提前创建。
String consumerGroup = "YourConsumerGroup";
// 指定需要订阅哪个目标Topic，Topic需要提前创建。
String topic = "ydlclass";
// 初始化PushConsumer，需要绑定消费者分组ConsumerGroup、通信参数以及订阅关系。
PushConsumer pushConsumer = provider.newPushConsumerBuilder()
        .setClientConfiguration(clientConfiguration)
        // 设置消费者分组。
        .setConsumerGroup(consumerGroup)
        // 设置预绑定的订阅关系。
        .setSubscriptionExpressions(Collections.singletonMap(topic, filterExpression))
        // 设置消费监听器。
        .setMessageListener(messageView -> {
            // 处理消息并返回消费结果。
            System.out.println("Consume message successfully, messageId="+messageView.getMessageId() );
            return ConsumeResult.SUCCESS;
        })
        .build();
Thread.sleep(Long.MAX_VALUE);
// 如果不需要再使用 PushConsumer，可关闭该实例。
// pushConsumer.close();
```

### 顺序消息

```java
//以下示例表示：延迟时间为5秒之后的Unix时间戳。
Long deliverTimeStamp = System.currentTimeMillis() + 5000;
Message message = messageBuilder.setTopic("ydlclass_delay")     // 设置的Topic类型必须为Delay
        .setKeys("messageKey")
        .setTag("messageTag")
        .setDeliveryTimestamp(deliverTimeStamp)
        .setBody("messageBody".getBytes())
        .build();
```

### 事务消息

```java
final ClientServiceProvider provider = ClientServiceProvider.loadService();

String topic = "yourTransactionTopic";
// 服务端收不到二次确认之后，会进行回查二次确认结果，我们需要编写回查逻辑
TransactionChecker checker = messageView -> {
    logger.info("Receive transactional message check, message={}", messageView);
    // 返回Commit或Rollback
    return TransactionResolution.COMMIT;
};
final Producer producer = ProducerSingleton.getTransactionalInstance(checker, topic);
final Transaction transaction = producer.beginTransaction();
byte[] body = "This is a transaction message for Apache RocketMQ".getBytes(StandardCharsets.UTF_8);
String tag = "yourMessageTagA";
final Message message = provider.newMessageBuilder()
        .setTopic(topic)
        .setTag(tag)
        .setKeys("yourMessageKey-565ef26f5727")
        .setBody(body)
        .build();
try {
    final SendReceipt sendReceipt = producer.send(message, transaction);
    logger.info("Send transaction message successfully, messageId={}", sendReceipt.getMessageId());
} catch (Throwable t) {
    logger.error("Failed to send message", t);
    return;
}
// Commit the transaction.
transaction.commit();
// Or rollback the transaction.
// transaction.rollback();
// producer.close();
```

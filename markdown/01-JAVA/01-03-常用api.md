# 第七章 常用api

## 一、api是什么

生成javaDoc文档

![PixPin_2024-12-04_15-06-47](..\img\PixPin_2024-12-04_15-06-47.png)

为了防止乱码

```java
-encodingutf-8-charset utf-8
```

## 二、时间相关api

### 1、Date

### 2、Calendar

calendar的月份从0开始

### 3、TimeZone

### 4、ZoneId

### 5、SimpleDateFormat

## 三、jdk8的时间类

​	在JDK8之前，处理日期时间，我们用的都是上边几个类，所谓百足之虫死而不僵，即使上边几个类的方法大面积过时，同时还存在一些问题，比如`SimpleDateFormat`不是线程安全的，比如`Date`和`Calendar`获取到的月份是0到11，而不是现实生活中的1到12，我们还是能在绝大部分代码中看到他们的影子。

​	阿里巴巴规约中这样说，如果是jdk8的应用，可以使用Instant代替date，LocalDateTime代替Canlendar，DateTimeFormatter代替SimpleDateFormat。我们今天就从一下几个类讲讲新的时间类，主要是下面几个：

1. Instant
2. LocalDate
3. LocalTime
4. LocalDateTime
5. DateTimeFormatter

### 1、Instant

表示地球的时间

### 2、Duration

### 3、LocalDate

表示本地的日期

### 4、LocalTime

### 5、LocalDateTime

### 6、DateTimeFormatter

```java
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter dateTimeformatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
String format = now.format(dateTimeFormatter);
System.out.println(format);
```

### 7、类型相互转换

Instant -> Date

```java
Instant now = Instant.now();
Date.from(now);
```

Date -> Instant

```java
Date date = new Date();
Instant dateToInstant = date.toInstant();
```

Instant -> LocalDate

```java
Instant now = Instant.now();
LocalDateTime localDateTime = LocalDateTime.ofInstant(now, ZoneId.systemDefault())
```

Date -> Instant -> LocalDate

## 四、数学类

### 1、Math

### 2、BigDecimal

用于商业计算，浮点数有精度误差

### 3、Random

## 五、其他

### 1、StringBuffer和StringBuilder

​	StringBuffer是线程安全的，StringBuilder是线程不安全的。线程不安全，效率就高


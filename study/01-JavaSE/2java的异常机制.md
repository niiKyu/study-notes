# java的异常机制

![img](..\img\91814b7ec0ca4ed5b06a464bc5908735.png)

#### 自定义异常类型

`extends RuntimeException`

#### 异常链

处理异常的时候抛异常

```java
try{
    ...
} catch (UserErrorException e) {
    throw new PasswordErrorException(e);
}
```

#### try-catch关键字

```java
try {
    ...
} catch (...) {
    ...
} catch (...) {
    ...
} catch (...) {
    ...
} finally {
    
}
```

#### 面试题

```java
public static int test4O{
    //finally语句块中有return语句
    int i = 1;
    try{
        i++;
        System.out.println("try block，i="+i）;
        return i；
    }catch(Exception e){
    	i++;
        System.out.println("catch block i = "+i);
        return i;
    }finally{
        i++;
        System.out.println("finally block i = "+i);
        return i;
    }
}
```

运行结果：

```java
try block, i = 2
finally block i = 3
3
```

你会发现程序**最终会采用finally代码块中的return语句进行返回，而直接忽略try语句块中的return指令。**

#### 总结

* 对于异常的使用有一个不成文的约定：尽量在某个集中的位置进行统一处理，不要到处的使用try-catch，否则会使得代码结构混乱不堪。

* 按照我们程序员的惯性认知：当遇到return语句的时候，执行函数会立刻返回。但是，在Java语言中，如果存在finally就会有例外。除了return语句，try代码块中的break或continue语句也可能使控制权进入finally代码块。

* 请勿在try代码块中调用return、break或continue语句。万一无法避免，一定要确保finally的存在不会改变方法的返回值。

* 方法返回值有两种类型：值类型与对象引用。对于对象引用，要特别小心，如果在finally代码块中对返回的对象成员属性进行了修改，即使不在finally块中显式调用return语句，这个修改也会作用于返回值上。

  



我们已经学完了异常知识，最后再给大家几个忠告：

第一，尽量不要捕获类似Exception这样的通用异常，而是应该捕获特定异常。这是因为在日常的开发和合作中，我们读代码的机会往往超过写代码，软件工程是门协作的艺术，所以我们有义务让自己的代码能够直观地体现出尽量多的信息，而泛泛的Exception之类，恰恰隐藏了我们的目的。另外，我们也要保证程序不会捕获到我们不希望捕获的异常。比如，你可能更希望RuntimeException被扩散出来，而不是被捕获。



第二，不要生吞（swallow）异常。这是异常处理中要特别注意的事情，因为很可能会导致非常难以诊断的诡异情况。生吞异常，往往是基于假设这段代码可能不会发生，或者感觉忽略异常是无所谓的，但是千万不要在产品代码做这种假设！如果我们不把异常抛出来，程序可能在后续代码以不可控的方式结束。没人能够轻易判断究竟是哪里抛出了异常，以及是什么原因产生了异常。
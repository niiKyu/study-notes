# Java多线程

## 一、进程和线程

### 4、创建线程的方法

在java当中创建线程有三种基本方式：

#### （1） 继承Thread类重写run方法

> **步骤：**

- 定义类继承Thread;
- 重写Thread类中的run方法；（目的：将自定义代码存储在run方法，让线程运行）
- 调用线程的start方法：(该方法有两步：启动线程，调用run方法)

#### （2） 实现Runnable接口

> **步骤：**

- 创建任务： 创建类实现Runnable接口
- 使用Thread 为这个任务分配线程
- 调用线程的start方法

#### （3） 使用Lammbda表达式

用匿名内部类（2的另一种写法）

#### （4）有返回值的线程

```java
public class UseCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        Thread.sleep(3000);
        return 2;
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask<Integer> futureTask = new FutureTask<>(new UseCallable());
        new Thread(futureTask).start();
        Integer i = futureTask.get();
        System.out.println(i);
    }
}
```

`futureTask.get();`这是一个阻塞的方法，意思就是，这个方法会一直等，主线程会一直等待，这个线程执行完成之后并有了返回值，才会继续执行。

### 5、守护线程

 Java提供两种类型的线程：`用户线程`和`守护程序线程`。守护线程旨在为用户线程提供服务，并且仅在用户线程运行时才需要。

> 守护线程的使用

 守护线程对于后台支持任务非常有用，例如垃圾收集，释放未使用对象的内存以及从缓存中删除不需要的条目。大多数JVM线程都是守护线程。

> 创建守护线程

要将线程设置为守护线程，我们需要做的就是调用Thread.setDaemon（）。在这个例子中，我们将使用扩展Thread类的NewThread类：

```cpp
NewThread daemonThread = new NewThread();
daemonThread.setDaemon(true);
daemonThread.start();
```

### 6、 线程生命周期

我们在Thread类中发现了一个内部枚举类，这个State就可以表示一个线程的生命周期：

```java
public enum State {
        /**
         * Thread state for a thread which has not yet started.
         */
        NEW,

        /**
         * Thread state for a runnable thread.  A thread in the runnable
         * state is executing in the Java virtual machine but it may
         * be waiting for other resources from the operating system
         * such as processor.
         */
        RUNNABLE,

        BLOCKED,

        WAITING,

        TIMED_WAITING,

        TERMINATED;
    }
```

这个枚举类阐述了一个线程的生命周期中，总共有以下6种状态

| 状态              | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| 【NEW】           | 这个状态主要是线程未被Thread.start()调用前的状态。           |
| 【RUNNABLE】      | 线程正在JVM中被执行，等待来自操作系统(如处理器)的调度。      |
| 【BLOCKED】       | 阻塞，因为某些原因不能立即执行需要挂起等待。                 |
| 【WAITING】       | 无限期等待，由于线程调用了`Object.wait(0)`，`Thread.join(0)`和`LockSupport.park`其中的一个方法，线程处于等待状态，其中调用`wait`, `join`方法时未设置超时时间。 |
| 【TIMED_WAITING】 | 有限期等待， 线程等待一个指定的时间，比如线程调用了`Object.wait(long)`, `Thread.join(long)`,`LockSupport.parkNanos`, `LockSupport.parkUntil`方法之后，线程的状态就会变成TIMED_WAITING |
| 【TERMINATED】    | 终止的线程状态，线程已经完成执行。                           |

> 目前我们可以学习一下join方法，他是这么用的：

```java
public class Test {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i<10 ; i++) {
                ThreadUtils.sleep(10);
                System.out.println("这是线程1-----"+i);
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i<100 ; i++) {
                ThreadUtils.sleep(10);
                System.out.println("这是线程2-----"+i);
            }
        });

        t1.start();
        t2.start();

        try {
            t1.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("-------------------------------------------------");
    }
}
```

这个代码我们要分析【虚线出现的位置】，join方法的本意是阻塞主线程，直到t1线程和t2线程执行完毕后继续执行主线程

## 二、线程安全的讨论

### 3、JMM模型当中存在的问题

- 在执行程序时，为了提高性能，编译器和处理器常常会对指令做重排序。

#### （1）指令重排

 在指令重排中，有一个经典的as-if-serial语义，计算机会安装该语义对指令进行优化，其目的是不管怎么重排序（编译器和处理器为了提高并行度），（单线程）程序的执行结果不能被改变。为了遵守as-if-serial语义，编译器和处理器不会对存在数据依赖关系的操作做重排序，因为这种重排序会改变执行结果。但是，如果操作之间不存在数据依赖关系，这些操作依然可能被编译器和处理器重排序。

```java
int a = 1;
int b = 2;
int c = a+b;
```

#### （2）可见性

在多线程下，线程只读取高速缓存的值，不能感知主线程对内存的修改，这就是可见性的问题，使用`volatile`关键字可以解决这个问题

`volatile`能强制对改变量的读写直接在主存中操作，从而解决了不可见的问题。

写操作是，立刻强制刷在主存，并且将其他缓存区域的值设置为不可用

volatile 禁止指令重排 内存的可见性

> happens-before语义

 JMM用【happens-before】的概念来阐述操作之间的内存可见性。在JMM中，如果一个操作执行的结果需要对另一个操作可见，那么这两个操作之间必须要存在happens-before关系 。

 在Java 规范提案中为让大家理解内存可见性的这个概念，提出了happens-before的概念来阐述操作之间的内存可见性。对应Java程序员来说，理解happens-before是理解JMM的关键。JMM这么做的原因是：程序员对于这两个操作是否真的被重排序并不关心，程序员关心的是程序执行时的语义不能被改变（即执行结果不能被改变）。因此，happens-before关系本质上和as-if-serial语义是一回事。as-if-serial语义保证单线程内程序的执行结果不被改变，happens-before关系保证正确同步的多线程程序的执行结果不被改变。

#### （3）线程争抢

举一个例子证明一下，线程1和线程2分别对count累计10000次，合适的结果应该是20000才对：

```java
public class Test {
    private static int COUNT = 0;

    public static void adder(){
         COUNT++;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                adder();
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                adder();
            }
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("最后的结果是："+COUNT);
    }
}
```

最后我们发现每次的结果都不一样，都是10000以上的数字，这足以说明问题了，一个线程的结果对另一个线程不可见。

![image-20210831164339161](..\img\image-20210831164339161-3821ecf4.png)

解决线程争抢问题的最好的方案就是【加锁】，在方法上加上synchronized可以让线程排队执行内部的代码块，

### 4、线程安全的实现方法

#### （1）数据不可变

 在Java当中，一切不可变的对象（immutable）一定是线程安全的，无论是对象的方法实现还是方法的调用者，都不需要再进行任何线程安全保障的措施，比如final关键字修饰的基础数据类型，再比如说咱们的Java字符串儿。只要一个不可变的对象被正确的构建出来，那外部的可见状态永远都不会改变，永远都不会看到它在多个线程之中处于不一致的状态，带来的安全性是最直接最纯粹的。比如使用final修饰的基础数据类型（引用数据类型不可以）、比如java字符串，而一旦被创建就永远不能改变，其实谷歌的开发工具包（guava）中也给我们提供了一些不可变的一类（immutable），咱们以后的学习过程当中可能会接触到。

#### （2）互斥同步

 互斥同步是常见的一种并发正确性的保障手段，同步是指在多个线程并发访问共享数据时，保证共享数据在同一时刻只被一个线程使用，互斥是实现同步的一种手段，互斥是因、同步是果，互斥是方法，同步是目的。

 在Java中最基本的互斥同步手段，就是`synchronized`字段，除了synchronize的之外，我们还可以使用ReentrantLock等工具类实现。接下来我们就尝试学习Java中的锁。

#### （3）非阻塞同步

 互斥同步面临的主要问题是，进行线程阻塞和唤醒带来的性能开销，因此这种同步也被称为阻塞同步，从解决问题的方式上来看互斥同步是一种【悲观的并发策略】，其总是认为，只要不去做正确的同步措施，那就肯定会出现问题，无论共享的数据是否真的出现，都会进行加锁。这将会导致用户态到内核态的转化、维护锁计数器和检查是否被阻塞的线程需要被唤醒等等开销。

 随着硬件指令级的发展，我们已经有了另外的选择，基于【冲突检测的乐观并发策略】。通俗的说，就是不管有没有风险，先进行操作，如果没有其他线程征用共享数据，那就直接成功，如果共享数据确实被征用产生了冲突，那就再进行补偿策略，常见的补偿策略就是不断的重试，直到出现没有竞争的共享数据为止，这种乐观并发策略的实现，不再需要把线程阻塞挂起，因此同步操作也被称为非阻塞同步，这种措施的代码也常常被称之为【无锁编程】，也就是咱们说的自旋。我们用cas来实现这种非阻塞同步，cas会在接下来的授课当中详细给大家介绍，现在先不着急。

#### （4）无同步方案

 在我们这个工作当中，还经常遇到这样一种情况，多个线程需要共享数据，但是这些数据又可以在单独的线程当中计算，得出结果，而不被其他的线程所影响，如果能保证这一点，我们就可以把共享数据的可见范围限制在一个线程之内，这样就无需同步，也能够保证个个线程之间不出现数据征用的问题，说人话就是数据拿过来，我用我的，你用你的，从而保证线程安全，比如说咱们的ThreadLocal。

 ThreadLocal提供了线程内存储变量的能力，这些变量不同之处在于每一个线程读取的变量是对应的互相独立的。通过get和set方法就可以得到当前线程对应的值。

```java
public class Test {

    private static int number = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    System.out.println("t1----:" + number++);
                }
            }
        });
        Thread t2 = new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    System.out.println("t2----:" + number++);
                }
            }
        });
        t1.start();
        t2.start();

    }
}
```

使用ThreadLocal改造：

```java
public class Test {

    private final static ThreadLocal<Integer> number = new ThreadLocal<>();
    public static final int COUNT = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                number.set(COUNT);
                for (int i = 0; i < 1000; i++) {
                    number.set(number.get() + 1);
                    System.out.println("t1----:" + number.get());
                }
            }
        });
        Thread t2 = new Thread(new Runnable() {
            @Override
            public void run() {
                number.set(COUNT);
                for (int i = 0; i < 1000; i++) {
                    number.set(number.get() + 1);
                    System.out.println("t2----:" + number.get());
                }
            }
        });
        t1.start();
        t2.start();
    }
}
```

## 三、锁机制

上边的例子中，我们看到了synchronized的作用。

### 1、synchronized简介

 在多线程并发编程中 synchronized 一直是元老级角色，很多人都会称呼它为重量级锁。但是，随着 `Java SE 1.6` 对synchronized 进行了各种优化之后，有些情况下它就并不那么重，Java SE 1.6 中为了减少获得锁和释放锁带来的性能消耗而引入的偏向锁和轻量级锁。

synchronized 有三种方式来加锁，分别是

1. 修饰实例方法，作用于当前实例加锁，进入同步代码前要获得当前实例的锁
2. 静态方法，作用于当前类对象加锁，进入同步代码前要获得当前类对象的锁
3. 修饰代码块，指定加锁对象，对给定对象加锁，进入同步代码库前要获得给定对象的锁。

使用方法如下：

| 分类   | 具体分类       | 被锁对象             | 伪代码                                        |
| ------ | -------------- | -------------------- | --------------------------------------------- |
| 方法   | 实例方法       | 调用该方法的实例对象 | public synchronized void method()             |
| 方法   | 静态方法       | 类对象Class对象      | public static synchronized void method()      |
| 代码块 | this           | 调用该方法的实例对象 | synchronized(this)                            |
| 代码块 | 类对象         | 类对象               | synchronized(Demo.class)                      |
| 代码块 | 任意的实例对象 | 创建的任意对象       | Object lock= new Object(); synchronized(lock) |

### 2、synchronized原理分析

> 接下来我们从对象头信息中发现一些锁的信息

对象头主要包括两部分数据：Mark Word（标记字段）、Klass Pointer（类型指针）、数组类型还有一个int类型的数组长度。

我们今天要讲的就是其中的Mark Word

1. Mark Word记录了对象和锁有关的信息，当这个对象被synchronized关键字当成同步锁时，围绕这个锁的一系列操作都和Mark Word有关。
2. Mark Word在32位JVM中的长度是32bit，在64位JVM中长度是64bit。
3. Mark Word在不同的锁状态下存储的内容不同，在64位JVM中是这么存的：

![image-20210831172935098](..\img\image-20210831172935098-19ef96d2.png)

其中无锁和偏向锁的锁标志位都是01，只是在前面的1bit区分了这是无锁状态还是偏向锁状态。

JDK1.6以后的版本在处理同步锁时存在锁升级的概念，JVM对于同步锁的处理是从偏向锁开始的，随着竞争越来越激烈，处理方式从偏向锁升级到轻量级锁，最终升级到重量级锁。

> 锁升级中涉及的四把锁：

- 无锁：不加锁

- 偏向锁：不锁锁，只有一个线程争夺时，偏心某一个线程，这个线程来了不加锁。

- 轻量级锁：少量线程来了之后，先尝试自旋，不挂起线程。

  注：挂起线程和恢复线程的操作都需要转入内核态中完成这些操作，给系统的并发性带来很大的压力。在许多应用上共享数据的锁定状态，只会持续很短的一段时间，为了这段时间去挂起和恢复现场并不值得，我们就可以让后边请求的线程稍等一下，不要放弃处理器的执行时间，看看持有锁的线程是否很快就会释放，锁为了让线程等待，我们只需要让线程执行一个盲循环也就是我们说的自旋，这项技术就是所谓的【自旋锁】。

- 重量级锁：排队挂起线程

> JVM一般是这样使用锁和Mark Word的：

1，当没有被当成锁时，这就是一个普通的对象，Mark Word记录对象的HashCode，锁标志位是01，是否偏向锁那一位是0。

2，当对象被当做同步锁并有一个线程A抢到了锁时，锁标志位还是01，但是否偏向锁那一位改成1，前23bit记录抢到锁的线程id，表示进入偏向锁状态。

3，当线程A再次试图来获得锁时，JVM发现同步锁对象的标志位是01，是否偏向锁是1，也就是偏向状态，Mark Word中记录的线程id就是线程A自己的id，表示线程A已经获得了这个偏向锁，可以执行同步锁的代码。

4，当线程B试图获得这个锁时，JVM发现同步锁处于偏向状态，但是Mark Word中的线程id记录的不是B，那么线程B会先用CAS操作试图获得锁。如果抢锁成功，就把Mark Word里的线程id改为线程B的id，代表线程B获得了这个偏向锁，可以执行同步锁代码。如果抢锁失败，则继续执行步骤5。

5，偏向锁状态抢锁失败，代表当前锁有一定的竞争，偏向锁将升级为轻量级锁。JVM会在【当前线程】的线程栈中开辟一块单独的空间，里面保存指向对象锁Mark Word的指针，也叫所记录（lock record），同时在对象锁Mark Word中保存指向这片空间的指针。上述两个保存操作都是CAS操作，如果保存成功，代表线程抢到了同步锁，就把Mark Word中的锁标志位改成00，可以执行同步锁代码。如果保存失败，表示抢锁失败，竞争太激烈，继续执行步骤6。

6，轻量级锁抢锁失败，JVM会使用自旋锁，自旋锁不是一个锁状态，只是代表不断的重试，尝试抢锁。从JDK1.7开始，自旋锁默认启用，自旋次数由JVM决定。如果抢锁成功则执行同步锁代码，如果失败则继续执行步骤7，自旋默认10次。

7，自旋锁重试之后如果抢锁依然失败，同步锁会升级至重量级锁，锁标志位改为10。在这个状态下，未抢到锁的线程都会被阻塞排队。当后续线程尝试获取锁时，发现被占用的锁是重量级锁，则直接将自己挂起（而不是忙等）进入阻塞状态，等待将来被唤醒。就是所有的控制权都交给了操作系统，由操作系统来负责线程间的调度和线程的状态变更。而这样会出现频繁地对线程运行状态的切换，线程的挂起和唤醒，从而消耗大量的系统资源。

### 3、死锁

有多个事务持有对方需要的锁，同时需要对方持有的锁，这个时候会形成一个循环的等待，这个等待没有办法被正常结束，就会产生死锁

解决死锁问题的方法是：一种是用synchronized，一种是用Lock显式锁实现。

### 4、线程重入

synchronized是可重入锁。

### 5、wait和notify

> 方法总结：

1、Thread的两个静态方法：

sleep释放CPU资源，但不释放锁。

yield方法释放了CPU的执行权，但是依然保留了CPU的执行资格。这个方法不常用

2、线程实例的方法：

- join：是线程的方法，程序会阻塞在这里等着这个线程执行完毕，才接着向下执行。

3、Object的成员方法

- wait：释放CPU资源，同时释放锁。
- notify：唤醒等待中的线程。
- notifyAll：唤醒所有等待的线程。

### 6、线程的退出

（1）使用退出标志flag，使线程正常退出

```java
while (flag) {
    try {
        // 可能发生异常的操作
        System.out.println(getName() + "线程一直在运行。。。");
    } catch (Exception e) {
        System.out.println(e.getMessage());
        this.stopThread();
    }
}
this.flag = false;
```

（2）使用`interrupt()`方法中断线程（只有线程在`wait`和`sleep`才会捕获`InterruptedException`异常，执行终止线程的逻辑，在运行中不会捕获）

> 调用`interrupt()`方法会抛出`InterruptedException`异常，捕获后再做停止线程的逻辑即可。

> **如果线程处于类似`while(true)`运行的状态，`interrupt()`方法无法中断线程。**

### 7、LockSupport

`LockSupport`是一个线程阻塞工具类，所有的方法都是静态方法，可以让线程在任意位置阻塞，当然阻塞之后肯定得有唤醒的方法。

接下来我来看看`LockSupport`有哪些常用的方法。主要有两类方法：`park`和`unpark`。

```java
public static void park(Object blocker); // 暂停当前线程
public static void parkNanos(Object blocker, long nanos); // 暂停当前线程，不过有超时时间的限制
public static void parkUntil(Object blocker, long deadline); // 暂停当前线程，直到某个时间
public static void park(); // 无期限暂停当前线程
public static void parkNanos(long nanos); // 暂停当前线程，不过有超时时间的限制
public static void parkUntil(long deadline); // 暂停当前线程，直到某个时间
public static void unpark(Thread thread); // 恢复当前线程
public static Object getBlocker(Thread t);
```

小结：

1. `park和unpark`可以实现类似`wait和notify`的功能，但是并不和`wait和notify`交叉，也就是说`unpark`不会对`wait`起作用，`notify`也不会对`park`起作用。
2. `park和unpark`的使用不会出现死锁的情况
3. blocker的作用是看到阻塞对象的信息

### 8、Lock锁

Lock接口有几个重要方法：

```java
// 获取锁  
void lock()   

// 仅在调用时锁为空闲状态才获取该锁，可以响应中断  
boolean tryLock()   

// 如果锁在给定的等待时间内空闲，并且当前线程未被中断，则获取锁  
boolean tryLock(long time, TimeUnit unit)   

// 释放锁  
void unlock()  
```

> 获取锁，两种写法

```java
Lock lock = ...;
lock.lock();
try{
    //处理任务
}catch(Exception ex){

}finally{
    lock.unlock();   //释放锁
}
Lock lock = ...;
if(lock.tryLock()) {
     try{
         //处理任务
     }catch(Exception ex){

     }finally{
         lock.unlock();   //释放锁
     } 
}else {
    //如果不能获取锁，则直接做其他事情
}
```

> Lock的实现类 ReentrantLock

ReentrantLock，可重入锁。ReentrantLock是实现了Lock接口的类，并且ReentrantLock提供了更多的方法实现线程同步。下面通过一些实例学习如何使用 ReentrantLock。

用法上边已经讲了：

#### （1）ReentrantLock

可重入锁，之前使用synchronized的案例都可以使用ReentrantLock替代：

```java
public class Ticket implements Runnable{

    private static final ReentrantLock lock = new ReentrantLock();
    private static Integer COUNT = 100;

    String name;

    public Ticket(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        while (Ticket.COUNT > 0) {
            ThreadUtils.sleep(100);
            // 就在这里
            lock.lock();
            try { 
                System.out.println(name + "出票一张，还剩" + Ticket.COUNT-- + "张！");
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Thread one = new Thread(new Ticket("一号窗口"));
        Thread two = new Thread(new Ticket("一号窗口"));
        one.start();
        two.start();
        Thread.sleep(10000);
    }
}
```

synchronized和ReentrantLock的区别：

1、区别：

- Lock是一个接口，synchronized是Java中的关键字，synchronized是内置的语言实现；
- synchronized发生异常时，会自动释放线程占用的锁，故不会发生死锁现象。Lock发生异常，若没有主动释放，极有可能造成死锁，故需要在finally中调用unLock方法释放锁；
- Lock可以让等待锁的线程响应中断，使用synchronized只会让等待的线程一直等待下去，不能响应中断
- Lock可以提高多个线程进行读操作的效率

2、ReentrantLock以下功能是synchronized不具备的：

#### （2）ReadWriteLock

 对于一个应用而言，一般情况读操作是远远要多于写操作的，同时如果仅仅是读操作没有写操作的情况下数据又是线程安全的，读写锁给我们提供了一种锁，读的时候可以很多线程同时读，但是不能有线程写，写的时候是独占的，其他线程既不能写也不能读。在某些场景下能极大的提升效率。

```java
public class ReadAndWriteLockTest {
    public static ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    public static int COUNT = 1;

    public static void main(String[] args) {
        //同时读、写
        Runnable read = () -> {
            ReentrantReadWriteLock.ReadLock readLock = lock.readLock();
            readLock.lock();
            try{
                ThreadUtils.sleep(2000);
                System.out.println("我在读数据：" + COUNT);
            }finally {
                readLock.unlock();
            }
        };

        //同时读、写
        Runnable write = () -> {
            ReentrantReadWriteLock.WriteLock writeLock = lock.writeLock();
            writeLock.lock();
            try{
                ThreadUtils.sleep(2000);
                System.out.println("我在写数据：" + COUNT++);
            }finally {
                writeLock.unlock();
            }
        };

        for (int i = 0; i < 100; i++) {
            Random random = new Random();
            int flag = random.nextInt(100);
            if(flag > 20){
                new Thread(read,"read").start();
            }else{
                new Thread(write,"write").start();
            }
        }
    }
}
```

### 9、lock锁的原理cas和aqs

 本节我们从ReentrantLock的源码，一起解释这些并发编程工具的实现原理，其实很多场景下我们使用synchronized也可以，但是毕竟他不够灵活，是由c++实现的，只能作为关键字来使用，而Java给我们提供了并发编程包，由Doug Lea编写了大量的共性能的线程同步器，而底层的实现原理就是cas和aqs。最后补充一句，能用synchronized实现我们就用synchronized，这是关键字也是jdk团队优化的主要目标。

#### （1）并发编程的三大特性

> 原子性

 原子操作定义：原子操作可以是一个步骤，也可以是多个操作步骤，但是其顺序不可以被打乱，也不可以被切割而只执行其中的一部分（不可中断性）。将整个操作视为一个整体是原子性的核心特征。原子性不仅仅是多行代码，也可能是多条指令。

 存在竞争条件，线程不安全，需要转变原子操作才能安全。方式：上锁、循环CAS；上例只是针对一个变量的原子操作改进，我们也可以实现更大逻辑的原子操作。

> 可见性

我们已经深度的了解过

> 有序性

volatile：可以保证可见性和有序行

synchronized和Lock：可以保证原子性、可见性、有序性

#### （2）CAS

 CAS，compare and swap的缩写，中文翻译成比较并交换，我发现jdk11以后改成了compare and set。

 它的思路其实很简单，就是给一个元素赋值的时候，先看看内存里的那个值到底变没变，如果没变我就修改，变了我就不改了，其实这是一种无锁操作，不需要挂起线程，无锁的思路就是先尝试，如果失败了，进行补偿，也就是你可以继续尝试。这样在少量竞争的情况下能很大程度提升性能。

Java中的CAS是通过sun.misc.Unsafe类提供的。Unsafe中的CAS

```java
/**
*Object var1      你要修改哪个对象的成员变量
*long offset      这个值在这个对象中的偏移量
*Object expected  期望值
*Object x         实际值
*/
public final native boolean compareAndSwapObject(Object var1, long var2, Object var4, Object var5);
public final native boolean compareAndSwapInt(Object var1, long var2, int var4, int var5);
public final native boolean compareAndSwapLong(Object var1, long var2, long var4, long var6);
```

jdk11中改为了：

```java
@HotSpotIntrinsicCandidate
public final native boolean compareAndSetObject(Object o, long offset,
                                                Object expected,
                                                Object x);
```

CAS保证的是对一个对象写操作的无锁原子性，加syncronized的也具有原子性。

但是CAS还是有几个缺点：

1. ABA问题。当第一个线程执行CAS操作，尚未修改为新值之前，内存中的值已经被其他线程连续修改了两次，使得变量值经历 A -> B -> A的过程。绝大部分场景我们对ABA不敏感。解决方案：添加版本号作为标识，每次修改变量值时，对应增加版本号； 做CAS操作前需要校验版本号。JDK1.5之后，新增AtomicStampedReference类来处理这种情况。
2. 循环时间长开销大。如果有很多个线程并发，CAS自旋可能会长时间不成功，会增大CPU的执行开销。
3. 只能对一个变量进行原子操作。JDK1.5之后，新增AtomicReference类来处理这种情况，可以将多个变量放到一个对象中。

#### （3）AQS

抽象队列同步器，用来解决线程同步执行的问题。

AQS解决问题的思路如下：

![image-20210903135416383](..\img\image-20210903135416383-5ff599a1.png)

我们以`ReentrantLock`来分析其中的过程：

有一个sunc

```java
 abstract static class Sync extends AbstractQueuedSynchronizer
```

两个

```java
static final class FairSync extends Sync
static final class NonfairSync extends Sync
```

##### a、构造

我们发现不传值是非公平锁，传入`true`是公平锁，有啥区别咱们慢慢看：

```java
public ReentrantLock() {
        sync = new NonfairSync();
    }

public ReentrantLock(boolean fair) {
	sync = fair ? new FairSync() : new NonfairSync();
}
```

##### b、加锁

（获取锁）acquire就是获取的意思：

```java
// NonfairSync 非公平的加锁动作一上来就抢一下，这是非公平锁的第一次抢锁
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}

// FairSync 公平锁直接调用acquire(1)
final void lock() {
    acquire(1);
}
```

sync.acquire(1）方法：

```java
public final void acquire(int arg) {
    if (   !tryAcquire(arg) 
        &&
        acquireQueued(   addWaiter(Node.EXCLUSIVE), arg)  )
        selfInterrupt();
}
```

将if语句拆开了，会有以下三个步骤：

1. !tryAcquire(arg)
2. addWaiter(Node.EXCLUSIVE), arg)
3. acquireQueued( addWaiter(Node.EXCLUSIVE), arg)

首先，!tryAcquire(arg) 尝试获取锁，公平锁和非公平锁的差别就在这里：

> 非公平锁的获取锁方式

```java
protected final boolean tryAcquire(int acquires) {
    return nonfairTryAcquire(acquires);
}
        
        
        
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        // 直接设置状态，并将当前的锁持有者改成自己，第二次自旋获取，非公平锁有两次抢锁的机会
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

> 公平锁的获取锁方式

```java
protected final boolean tryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        // 先看看有没有排队的节点，再尝试获取锁
        if (!hasQueuedPredecessors() &&
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
}
```

公平锁 会看看有没有队列，有队列就排队，而非公平锁根本不管有无队列都直接抢锁。

##### c、入队

如果没有获得锁，就排队，addWaiter(Node.EXCLUSIVE) 添加一个节点到队列

```java
private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        if (pred != null) {
            node.prev = pred;
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node);
        return node;
    }
private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            // 插入了一个空节点，就是一个哨兵，因为每一个真实的线程节点都会坚挺前一个节点的状态
            if (t == null) { // Must initialize
                if (compareAndSetHead(new Node()))
                    tail = head;
            } else {
                node.prev = t;
                if (compareAndSetTail(t, node)) {
                    t.next = node;
                    return t;
                }
            }
        }
    }
```

##### d、阻塞

 入队完成之后再判断一次当前是否有可能获得锁，也就是前一个节点是head的话，前一个线程有可能已经释放了，再获取一次，如果获取成功，设置当前节点为头节点，整个获取过程完成。

```java
final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                // 不死心，进了队伍了，发现我是第二个，还要尝试获取一下
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                // 真正的挂起线程
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```

获取失败的话先将之前的节点等待状态设置为SIGNAL，如果之前的节点取消了就向前一直找。

```java
// 就是要将我的前一个节点的等待状态改为SIGNAL
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        int ws = pred.waitStatus;
        if (ws == Node.SIGNAL)
            /*
             * This node has already set status asking a release
             * to signal it, so it can safely park.
             * 前驱节点已经设置了SIGNAL，闹钟已经设好，现在我可以安心睡觉（阻塞）了。
             * 如果前驱变成了head，并且head的代表线程exclusiveOwnerThread释放了锁，
             * 就会来根据这个SIGNAL来唤醒自己 
             */
            return true;
        if (ws > 0) {
            /*
             * 发现传入的前驱的状态大于0，即CANCELLED。说明前驱节点已经因为超时或响应了中断，
             * 而取消了自己。所以需要跨越掉这些CANCELLED节点，直到找到一个<=0的节点  
             */
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else {
            /*
             * 进入这个分支，ws只能是0或PROPAGATE。
             * CAS设置ws为SIGNAL  
             */
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        return false;
    }
```

上一个条件完成之后，我就可以安心的阻塞了，然后一直等待直到被唤醒

```java
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

上面就是获取锁并等待的过程，总结起来就是：

当`lock()`执行的时候：

- 先快速获取锁，当前没有线程执行的时候直接获取锁
- 尝试获取锁，当没有线程执行或是当前线程占用锁，可以直接获取锁
- 将当前线程包装为node放入同步队列，设置为尾节点
- 前一个节点如果为头节点，再次尝试获取一次锁
- 将前一个有效节点设置为SIGNAL
- 然后阻塞直到被唤醒

##### e、释放锁

当ReentrantLock进行释放锁操作时，调用的是AQS的`release(1)`操作

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

 在`tryRelease(arg)`中会将锁释放一次，如果当前state是1，且当前线程是正在占用的线程，释放锁成功，返回true，否则因为是可重入锁，释放一次可能还在占用，应一直释放直到state为0为止

```java
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);
    Node s = node.next;
    // 如果没有下一个节点，或者下个节点的状态被取消了，就从尾节点开始找，找到最前面一个可用的节点
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    // 唤醒下一个节点
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

然后优先找下一个节点，如果取消了就从尾节点开始找，找到最前面一个可用的节点

## 四、JUC并发编程包

### 1、原子类

#### （1）认识 Atomic 原子类

 Java 的原子类都存放在并发包 `java.util.concurrent.atomic` 下。

#### （2） JUC 包中的原子类

> 基本类型

使用原子的方式更新基本类型

- AtomicInteger：整形原子类
- AtomicLong：长整型原子类
- AtomicBoolean：布尔型原子类

> 数组类型

使用原子的方式更新数组里的某个元素

- AtomicIntegerArray：整形数组原子类
- AtomicLongArray：长整形数组原子类
- AtomicReferenceArray：引用类型数组原子类

> 引用类型

- AtomicReference：引用类型原子类
- AtomicStampedReference：原子更新引用类型里的字段原子类
- AtomicMarkableReference ：原子更新带有标记位的引用类型

> 对象的属性修改类型**

- AtomicIntegerFieldUpdater：原子更新整形字段的更新器
- AtomicLongFieldUpdater：原子更新长整形字段的更新器
- AtomicStampedReference：原子更新带有版本号的引用类型。该类将整数值与引用关联起来，可用于解决原子的更新数据和数据的版本号，以及解决使用 CAS 进行原子更新时可能出现的 ABA 问题

#### （3）讲讲 `AtomicInteger` 的使用

打开`AtomicInteger`源码，我们发现该类常用方法有以下

```java
public final int get();  // 获取当前的值
public final int getAndSet(int newValue);  // 获取当前的值，并设置新的值
public final int getAndIncrement();  // 获取当前的值，并自增
public final int getAndDecrement();  // 获取当前的值，并自减
public final int getAndAdd(int delta);  // 获取当前的值，并加上预期的值
boolean compareAndSet(int expect, int update);  // 如果输入的数值等于预期值，则以原子方式将该值设置为输入值（update）
public final void lazySet(int newValue);  // 最终设置为 newValue,使用 lazySet 设置之后可能导致其他线程在之后的一小段时间内还是可以读到旧的值。
```

`AtomicInteger `类使用示例，我们开启1000个线程做加法，发现结果没问题，然而我们并没有直接使用锁

```java
public class Test {

    private static AtomicInteger ADDER = new AtomicInteger();

    public static void main(String[] args) throws InterruptedException {

        for (int i = 0; i < 1000; i++) {
            Thread thread = new Thread(() -> {
                ADDER.getAndIncrement();
            });
            thread.start();
            thread.join();
        }
        System.out.println(ADDER.get());
    }
}
```

#### （4）`AtomicInteger` 类原理

以 `AtomicInteger` 类为例，以下是部分源代码：

该类维护一个volatile修饰的int，保证了可见性和有序性：

```java
private volatile int value;
```

所有的方法都是使用`cas`保证了原子性，所以这几个类都是线程安全的：

```java
 public final int getAndIncrement() {
     return unsafe.getAndAddInt(this, valueOffset, 1);
 }
public final int getAndAddInt(Object var1, long var2, int var4) {
    int var5;
    do {
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var5 + var4));

    return var5;
}
```

我们发现原子类中的任何操作都没有上锁，是无锁操作。

### 2、线程池

为什么要使用线程池？

(1) 降低资源消耗。 通过重复利用已创建的线程降低线程创建和销毁造成的消耗。

(2) 提高响应速度。 当任务到达时，任务可以不需要等到线程创建就能立即执行。

(3) 提高线程的可管理性。 线程是稀缺资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配、调优和监控。

#### （1）jdk自带的四种线程池

Java通过Executors提供四种线程池，分别为：

1. `newCachedThreadPool`创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程。
2. `newFixedThreadPool` 创建一个定长线程池，可控制线程最大并发数，超出的线程会在队列中等待。
3. `newScheduledThreadPool` 创建一个定长线程池，支持定时及周期性任务执行。
4. `newSingleThreadExecutor` 创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序执行。

> 简单使用

```java
public class UseExecutors {
    public static void main(String[] args) {
        Runnable taskOne = () -> System.out.println(Thread.currentThread().getName()+":taskOne");
        // ExecutorService pools = Executors.newCachedThreadPool();
        // ExecutorService pools = Executors.newSingleThreadExecutor();
        // ExecutorService pools = Executors.newScheduledThreadPool(10);
        ExecutorService pools = Executors.newFixedThreadPool(10);
        for (int i = 0; i < 40; i++) {
            pools.submit(taskOne);
        }
    }
}
```

> **无论是哪一个都是调用ThreadPoolExecutor 构造方法：**

```java
public ThreadPoolExecutor
    (int corePoolSize,
     int maximumPoolSize,
     long keepAliveTime,
     TimeUnit unit,
     BlockingQueue<Runnable> workQueue,
     ThreadFactory threadFactory,
     RejectedExecutionHandler handler)
```

#### （2）参数的意义-重要

|                 |                                                              |
| --------------- | ------------------------------------------------------------ |
| corePoolSize    | 指定了线程池里的线程数量，核心线程池大小                     |
| maximumPoolSize | 指定了线程池里的最大线程数量                                 |
| keepAliveTime   | 当线程池线程数量大于corePoolSize时候，多出来的空闲线程，多长时间会被销毁 |
| unit            | 时间单位，TimeUnit                                           |
| workQueue       | 任务队列，用于存放提交但是尚未被执行的任务                   |
| threadFactory   | 线程工厂，用于创建线程，线程工厂就是给我们new线程的          |
| handler         | 所谓拒绝策略，是指将任务添加到线程池中时，线程池拒绝该任务所采取的相应策略 |

> 常见的工作队列我们有如下选择，这些都是阻塞队列，阻塞队列的意思是，当队列中没有值的时候，取值操作会阻塞，一直等队列中产生值。

- ArrayBlockingQueue：基于数组结构的有界阻塞队列，FIFO。
- LinkedBlockingQueue：基于链表结构的有界阻塞队列，FIFO。

> 线程池提供了四种拒绝策略：

- AbortPolicy：直接抛出异常，默认策略；
- CallerRunsPolicy：用调用者所在的线程来执行任务；
- DiscardOldestPolicy：丢弃阻塞队列中最靠前的任务，并执行当前任务；
- DiscardPolicy：直接丢弃任务；

#### （3）自定义线程池

 这里是针对JDK1.8版本，使用JDK自带的线程池会出现OOM问题，中小型公司一般很难遇到，在阿里巴巴开发文档上面有明确的标识：

![image-20210901173049882](..\img\image-20210901173049882-bed16e64.png)

 上边我们已经分析了线程池的几个参数，这几个参数核心线程数、最大线程数、活跃时间和单位根据服务器本身的性能和程序的特性设定，这个是个经验值，如果我们去设置可能效果不太好，但是起码这几个只是数字我们自定义的时候可以很简单的填入。但是线程工厂、决绝策略、阻塞队列又该怎么搞呢？

> 第一种办法，看看原生的自己搞一个线程工厂：

> 第二种：Google guava 工具类 提供的 `ThreadFactoryBuilder` 。

```text
ThreadFactory guavaThreadFactory = new ThreadFactoryBuilder().setNameFormat("retryClient-pool-").build();
```

> 第三种：Apache commons-lang3 提供的 `BasicThreadFactory`。

```java
ThreadFactory basicThreadFactory = new BasicThreadFactory.Builder()
		.namingPattern("basicThreadFactory-").build();
```

### 3、线程同步

这些类为JUC包，它们都起到线程同步作用

#### 1、CountDownLatch （倒计时器）

 这个类常常用于等待，等多个线程执行完毕，再让某个线程执行。

 CountDownLatch的典型用法就是：某一线程在开始运行前等待n个线程执行完毕。

使用方法如下：

1. 将 CountDownLatch 的计数器初始化为n ：new CountDownLatch(n)，

2. 每当一个任务线程执行完毕，就将计数器减1 countdownlatch.countDown()，当计数器的值变为0时，

   在CountDownLatch上 await() 的线程就会被唤醒。一个典型应用场景就是启动一个服务时，主线程需要等待多个组件加载完毕，之后再继续执行。

```java
public class CountDownLatchTest {

    public static void main(String[] args) throws InterruptedException {

        ExecutorService pool = Executors.newCachedThreadPool();
        CountDownLatch countDownLatch = new CountDownLatch(3);

        Runnable task1 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算山西分公司的账目");
            countDownLatch.countDown();
        };
        Runnable task2 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算北京分公司的账目");
            countDownLatch.countDown();
        };
        Runnable task3 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算上海分公司的账目");
            countDownLatch.countDown();
        };
        pool.submit(task1);
        pool.submit(task2);
        pool.submit(task3);
        countDownLatch.await();
        System.out.println("计算总账！");

    }
}
```

 CountDownLatch是一次性的，计数器的值只能在构造方法中初始化一次，之后没有任何机制再次对其设置值，当CountDownLatch使用完毕后，它不能再次被使用。

#### 2、CyclicBarrier(循环栅栏)

 CyclicBarrier 和 CountDownLatch 非常类似，它也可以实现线程间的技术等待，CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是，让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。

![img](..\img\20181218144511688.gif)

看 如下示意图，CyclicBarrier 和 CountDownLatch 是不是很像，只是 CyclicBarrier 可以有不止一个栅栏，因为它的栅栏（Barrier）可以重复使用（Cyclic）。

![image-20221110103700121](..\img\image-20221110103700121-8781526e.png)

```java
public class CyclicBarrierTest {

    public static void main(String[] args) throws InterruptedException {

        ExecutorService pool = Executors.newCachedThreadPool();
        // 计算总账的主线程
        Runnable main = () -> System.out.println("计算总账！");
        CyclicBarrier cyclicBarrier = new CyclicBarrier(3,main);

        Runnable task1 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算山西分公司的账目");
            try {
                cyclicBarrier.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (BrokenBarrierException e) {
                e.printStackTrace();
            }
        };
        Runnable task2 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算北京分公司的账目");
            try {
                cyclicBarrier.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (BrokenBarrierException e) {
                e.printStackTrace();
            }
        };
        Runnable task3 = () -> {
            ThreadUtils.sleep(new Random().nextInt(5000));
            System.out.println("计算上海分公司的账目");
            try {
                cyclicBarrier.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (BrokenBarrierException e) {
                e.printStackTrace();
            }
        };
        pool.submit(task1);
        pool.submit(task2);
        pool.submit(task3);
        
        // 重复利用
        ThreadUtils.sleep(5000);
        cyclicBarrier.reset();
        System.out.println("-------------reset-----------");
        pool.submit(task1);
        pool.submit(task2);
        pool.submit(task3);
    }
}
```

> CyclicBarrier与CountDownLatch的区别

 至此我们难免会将CyclicBarrier与CountDownLatch进行一番比较。这两个类都可以实现一组线程在到达某个条件之前进行等待，它们内部都有一个计数器，当计数器的值不断的减为0的时候所有阻塞的线程将会被唤醒。

 有区别的是CyclicBarrier的计数器由自己控制，而CountDownLatch的计数器则由使用者来控制，在CyclicBarrier中线程调用await方法不仅会将自己阻塞还会将计数器减1，而在CountDownLatch中线程调用await方法只是将自己阻塞而不会减少计数器的值。

 另外，CountDownLatch只能拦截一轮，而CyclicBarrier可以实现循环拦截。一般来说用CyclicBarrier可以实现CountDownLatch的功能，而反之则不能。总之，这两个类的异同点大致如此，至于何时使用CyclicBarrier，何时使用CountDownLatch，还需要读者自己去拿捏。

#### 3、Semaphore(信号量)

 `java.util.concurren`t包中有`Semaphore`的实现，可以设置参数，控制同时访问的个数。

 下面的Demo中申明了一个只有5个许可的Semaphore，而有20个线程要访问这个资源，通过acquire()和release()获取和释放访问许可。

```java
public class SemaphoreTest {

    public static void main(String[] args) throws InterruptedException {

        final Semaphore semaphore = new Semaphore(5);
        ExecutorService exec = Executors.newCachedThreadPool();
        for (int index = 0; index < 100; index++) {
            Runnable run = () -> {
                try {
                    // 获取许可
                    semaphore.acquire();
                    System.out.println("开进一辆车...");
                    Thread.sleep((long) (Math.random() * 5000));
                    // 访问完后，释放
                    semaphore.release();
                    System.out.println("离开一辆车...");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            };
            exec.execute(run);
        }
        exec.shutdown();
    }
}
```

最后的结果是开始五辆车全部进入，因为停车场是空的，后边就是出一辆进一辆了。
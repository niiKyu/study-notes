# JavaSE

## 一、面向对象之封装

方法和字符串放在方法区，只存一份

### 1、this关键字

* 记住一点：每一个方法都会默认传入一个变量叫this，它永远指向调用它的【当前实例】。

### 2、String

```Java
String s1 = "abc";				//指向方法区的常量
String s2 = new String("abc");	//new会去堆内存里分配空间，再指向方法区的常量
```

### 3、包装类和自动拆装箱

### 笔试题

地址一样？

```java
//Integer类做了缓存，-128 - 127不需要去堆内存分配空间
Interger n1 = 127;
Interger n2 = 127;
// n1 == n2 内存地址一致
Interger n1 = 128;
Interger n2 = 128;
//n1 != n2 内存地址不一致
```

## 二、面向对象之继承

### 1、祖先类Object

#### 1、hashcode

hash的用途：

1、密码的保存

实际的工程当中我们一般不存储明文密码，而是将密码使用hash算法计算成hash值进行保存。这样即使密码丢失也不会使密码完全曝光。

2、文件的校验，检查数据的一致性

#### 2、equals

【重要总结】：==和equals的区别

1、==可以比基础数据类型也可以比较引用数据类型，比较基础数据类型时比较的是具体的值，比较引用数据类型实际上比较的是内存地址。
2、equals是object的一个方法，默认的实现就是==。
3、我们可以重写equals方法，比如String就重写了equals方法，所以字符串调用equals比较的是每一个字符。

## 三、面向对象之多态

### 1、概述

多态的形成有3个条件

1、有继承

2、有重写

3、有父类引用指向子类对象

### 2、重载和重写

```java
public class Animal {
    public void eat(){
        System.out.println("animal is eating!");
    }
    public void eat(String food){
        System.out.println("aniaml is eating " + food);
    }
}
```

```java
public class Dog extends Animal {
    @Override
    public void eat(){
        System.out.println("dog is eating!");
    }
    
    @Override
    public void eat(String food){
        System.out.println("dog is eating " + food);
    }
    
    public static void main(String[] args) {
        Animal animal = new Dog();
        animal.eat("meat");
    }
}
```

这个案例里边有重载，也有重写，最终会选择Dog类的(String food)方法，

第一步是静态分派的过程，jvm从Animal类的多个重载方法中选择了`Animal::eat(String food)`这个方法，并且生成指令`invokevirtual Animal::eat(String food)`。

第二步是动态分派的过程，是根据运行时类型确定具体调用谁的`eat(String food)`方法，应为运行时类型是Dog所以最终的方法选择是`Dog::eat(String food)`。

这两个过程是相辅相成，不是有你没我的关系。



​	重载(overloding)和重写(overrideing)是java多态性的体现

​	多态只和方法有关和属性无关

### 3、抽象类和接口

**接口是多实现的，一个类可以实现多个接口**

* 继承类是 is-a 的关系，dog is an animal
* 实现接口是 can-do 的关系

### 4、设计模式

#### 1、原则

[设计模式简介 | 菜鸟教程](https://www.runoob.com/design-pattern/design-pattern-intro.html)

**1、开闭原则（Open Close Principle）**

​	开闭原则的意思是：**对扩展开放，对修改关闭**。在程序需要进行拓展的时候，不能去修改原有的代码，实现一个热插拔的效果。简言之，是为了使程序的扩展性好，易于维护和升级。想要达到这样的效果，我们需要使用接口和抽象类，后面的具体设计中我们会提到这点。

**2、里氏代换原则（Liskov Substitution Principle）**

​	里氏代换原则是面向对象设计的基本原则之一。 里氏代换原则中说，任何基类可以出现的地方，子类一定可以出现。LSP 是继承复用的基石，只有当派生类可以替换掉基类，且软件单位的功能不受到影响时，基类才能真正被复用，而派生类也能够在基类的基础上增加新的行为。里氏代换原则是对开闭原则的补充。实现开闭原则的关键步骤就是抽象化，而基类与子类的继承关系就是抽象化的具体实现，所以里氏代换原则是对实现抽象化的具体步骤的规范。

​	子类继承父类时，除添加新的方法完成新增功能外，尽量不要重写父类的方
法。

**3、依赖倒转原则（Dependence Inversion Principle）**

​	这个原则是开闭原则的基础，具体内容：针对接口编程，依赖于抽象而不依赖于具体。

1. 每个类尽量提供接口或抽象类，或者两者都具备。
2. 变量的声明类型尽量是接口或者是抽象类。
3. 任何类都不应该从具体类派生。
4. 使用继承时尽量遵循里氏替换原则。

**4、接口隔离原则（Interface Segregation Principle）**

​	这个原则的意思是：使用多个隔离的接口，比使用单个接口要好。它还有另外一个意思是：降低类之间的耦合度。由此可见，其实设计模式就是从大型软件架构出发、便于升级和维护的软件设计思想，它强调降低依赖，降低耦合。

**5、迪米特法则，又称最少知道原则（Demeter Principle）**

​	最少知道原则是指：一个实体应当尽量少地与其他实体之间发生相互作用，使得系统功能模块相对独立。

**6、合成复用原则（Composite Reuse Principle）**

​	合成复用原则是指：尽量使用合成/聚合的方式，而不是使用继承。

**7、单一原则**

​	一个类只做一件事

#### 2、设计模式的类型

##### 1、模板模式

[模板模式 | 菜鸟教程](https://www.runoob.com/design-pattern/template-pattern.html)

**意图**

在父类中定义了算法的骨架，并允许子类在不改变算法结构的前提下重定义算法的某些特定步骤。

**主要解决的问题**

- 解决在多个子类中重复实现相同的方法的问题，通过将通用方法抽象到父类中来避免代码重复。

##### 2、策略模式

[策略模式 | 菜鸟教程](https://www.runoob.com/design-pattern/strategy-pattern.html)

**意图**

将每个算法封装起来，使它们可以互换使用。

**主要解决的问题**

- 解决在多种相似算法存在时，使用条件语句（如if...else）导致的复杂性和难以维护的问题。

## 四、面向对象的其他知识

### 1、代码块

### 笔试题

执行顺序？

```java
public class Father {
    public Father(){
        System.out.println("这是父类的构造器！");
    }
    
    {
        System.out.println("这是父类的实例代码块！");
    }
    
    static {
        System.out.println("这是父类的静态代码块！");
    }
}
```

```java
public class Son extends Father {
    public Son(){
        System.out.println("这是子类的构造器！");
    }
    
    {
        System.out.println("这是子类的实例代码块！");
    }
    
    static {
        System.out.println("这是子类的静态代码块！");
    }
}
```

结果：记住

1. 这是父类的静态代码块！
2. 这是子类的静态代码块！
3. 这是父类的实例代码块！
4. 这是父类的构造器！
5. 这是子类的实例代码块！
6. 这是子类的构造器！

### 4、单例设计模式

#### （1）饿汉式

```java
public class Singleton{
    private static Singleton instance = new Singleton();
    private Singleton(){}
    public static Singleton getInstance(){
        return instance;
    }
}
```

#### （2）懒汉式

​	（先不急着实例化出对象，等要用的时候才给你创建出来。不着急，故又称为"懒汉模式“

```java
public class Singleton{
    private static Singleton instance;
    private Singleton(){}
    public static Singleton getInstance(){
        if(instance == null){
            instance = new Singleton();
        }
        return instance;
    }
}
```

这种懒汉式在多线程环境中是完全错误的，根本不能保证单例的状态，我们目前先不用理解。后边会详细介绍。

## 六、应知应会的JVM

### 1、语言特性

* 解释型：代码没有编译的过程，读一行执行一行，比如我们以后要学习的javascreipt。
* 编译型：运行之前需要将代码先编译成【机器指令】，再运行，比如c语言。

​	java具有跨平台性，可以在不同的环境中运行；java是解释型和编译型并存的语言，编译型体现在1、java有javac（前端编译器），可以将java源代码编译成字节码文件，2、java有JIT，在字节码运行的过程当中，可以将部分的热点代码直接编译成机器码运行；在运行整个字节码文件的时候，是以解释的方式在执行；java是强类型的静态类型语言

### 2、实例对象的内存分布

![PixPin_2024-12-03_13-55-43](..\img\PixPin_2024-12-03_13-55-43.png)

```java
Object o = new Object;
// 16
ObjectSizeCalculator.getObjectSize(o);
```

![PixPin_2024-12-03_13-57-46](..\img\PixPin_2024-12-03_13-57-46.png)

```java
Client client = new Client(new byte[12],12);
// 56
ObjectSizeCalculator.getObjectSize(client);
```

### 3、类的加载

jvm在第一次主动使用这个类的时候将这个类加载到内存

![PixPin_2024-12-03_15-42-59](..\img\PixPin_2024-12-03_15-42-59.png)

【总结：new一个对象过程中发生了什么？】

1. **确认类元信息是否存在。**当JVM接收到new指令时，首先在 metaspace内检查需要创建的类元信息是否存在。若不存在，那么在双亲委派模式下，使用当前类加载器以ClassLoader+包名+类名为Key进行查找对应的class文件。如果没有找到文件，则抛出ClassNotFoundException异常，如果找到，则进行类加载（加载-验证-准备-解析-初始化），并生成对应的Class类对象。
2. **分配对象内存。**首先计算对象占用空间大小，如果实例成员变量是引用变量，仅分配引用变量空间即可，即4个字节大小，接着在堆中划分一块内存给新对象。
3. **设定默认值。**成员变量值都需要设定为默认值，即各种不同形式的零值。
4. **设置对象头。**设置新对象的哈希码、GC信息、锁信息、对象所属的类元信息等。这个过程的具体设置方式取决于JVM实现。
5. **执行init方法。**初始化成员变量，执行实例化代码块，调用类的构造方法，并把堆内对象的首地址赋值给引用变量。

### 4、类加载器

​	类加载器就是一段代码【classloader】，他能通过一个类的"全限定名"来获取描述此类的二进制字节流，把字节码文件加载到方法区。然后在堆内（heap）创建一个java.lang.Class对象，Class对象封装了类在方法区内的数据结构，并且向开发者提供了访问方法区内的数据结构的接口。



jvm当中有以下几个类加载器，他们负责从不同的classpath下加载字节码文件，classpath就是存放字节码文件的文件目录。

* 【BootstrapClassloader】启动类加载器，主要加载的是JvM自身需要的类，这个类加载使用C++语言实现的，是虚拟机自身的一部分，它负责将<JAVA_HOME>/lib路径下的核心类库或-Xbootclasspath参数指定的路径下的jar包加载到内存中，如rt.jar，如果文件名不被虚拟机识别，即使把jar包丢到ib目录下也是没有作用的(出于安全考虑，Bootstrap启动类加载器只加载包名为java、javax、sun等开头的类)。
* 【ExtensionClassLoader】扩展类加载器由Java语言实现的，它负责加载<JAVA_HOME>/lib/ext目录下或者由系统变量-Djava.ext.dir指定位路径中的类库，开发者可以直接使用标准扩展类加载器。
* 【ApplicationClassLoader】系统应用类加载器，它负责加载系统类路径java-classpath或-Djava.class.path指定路径下的类库，也就是我们经常用到的classpath路径，开发者可以直接使用系统类加载器，一般情况下该类加载是程序中默认的类加载器，通过ClassLoader#getSystemClassLoader(方法可以获取到该类加载器，就是我们写的代码。



【双亲委派模型】
	如果一个类加载器收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器去完成，每一个层次的类加载器都是如此，因此所有的加载请求最终都应该传送到顶层的启动类加载器中，只有当父加载器反馈自己无法完成这个加载请求（它的搜索范围中没有找到所需的类）时，子加载器才会尝试自己去加载。

双亲委派有什么好处：
1、防止重复加载同一个.class。通过委托去向上面问一问，加载过了，就不用再加载一遍。保证数据安全。
2、保证核心.class不能被篡改。通过委托方式，不会去篡改核心.class，即使篡改也不会去加载，即使加载也不会是同一个.class对象了。不同的加载器加载同一个.class也不是同一个Class对象。这样保证了Class执行安全。
	其实我们可以通过重写loadClass和findClass方法来打破双亲委派，来根据我们自身的业务特性实现相应的类加载机制。但是我们我们目前的知识储备太少，等我们学完了框架在回过头来一起分析tomcat是如何打破双亲委派模型实现多个应用程序的环境隔离。

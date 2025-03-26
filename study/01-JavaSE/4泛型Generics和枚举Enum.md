## 知识点一：Java泛型Generics

### 2、泛型的定义

什么是泛型，

​	看表面的意思，泛型就是指广泛的、普通的类型。泛型能够帮助我们把【类型明确】的工作推迟到创建对象或调用方法的时候。意思就是：我定义类的时候不用管到底是什么类型，new这个对象或者调用这个对象的方法时才确定具体的类型。

#### （1）泛型类

泛型类也就是把泛型定义在类上，这样用户在使用类的时候才把类型给确定下来。

具体的方法就是使用<>加一个未知数，通常用 T K V 等大写字符表示，事实上只要是个单词就可以。

```java
public class SuperArray<T> {
}
```

#### （2）泛型方法

有时候只关心某个方法，那么使用泛型时可以不定义泛型类，而是只定义一个泛型方法，如下：

```java
    public <T> T show(T t) {
        System.out.println(t);
        return t;
    }
```

#### （3）继承关系

**泛型类在继承时，可以明确父类（泛型类）的参数类型，也可以不明确。**

```java
// 泛型类
public interface Comparator<T>{
    int compare(T o1, T o2);
}
```

##### （1）明确类型，子类存在的目的就是比较User对象

```java
public class UserAgeComparator implements Comparator<User> {
    @Override
    public int compare(User o1, User o2) {
        return o1.getAge() - o2.getAge();
    }
}
```

##### （2）不明确类型

子类不去明确类型，明确类型的工作留在创建对象的时候：

```java
public class UserAgeComparator<T> implements Comparator<T> {
    @Override
    public int compare(T o1, T o2) {
        return o1.equals(o2) ? 0 : 1;
    }
}
```

### 4、类型通配符

#### （1）无界

```java
public static void main(String[] args) {
    SuperArray<Dog> superArray = new SuperArray<>();
    superArray.add(new Dog());
    superArray.add(new Teddy());
    printSuperArray(superArray);
}

public static void printSuperArray(SuperArray<?> superArray){
    for (int i = 0;i<superArray.size();i++){
        System.out.println(superArray.get(i));
    }
}
```

#### （2）上界

我们可以使用`(SuperArray<? extends Dog> superArray)`的形式来约定传入参数的上界，意思就是泛型只能是Dog的或者Dog的子类。

```java
  public static void main(String[] args) {
        SuperArray<Animal> superArray = new SuperArray<>();
        superArray.add(new Dog());
        superArray.add(new Teddy());
        superArray.add(new Animal());
        printSuperArray(superArray);
    }
    
    public static void printSuperArray(SuperArray<? extends Dog> superArray){
        for (int i = 0;i<superArray.size();i++){
            System.out.println(superArray.get(i));
        }
    }
```

#### （3）下界

我们可以使用`(SuperArray<? super Dog> superArray)`的形式来约定传入参数的下界，意思就是泛型只能是Dog的或者Dog的超类。

```java
public static void main(String[] args) {
    SuperArray<Teddy> superArray = new SuperArray<>();
    superArray.add(new Teddy());
    printSuperArray(superArray);
}
public static void printSuperArray(SuperArray<? super Dog> superArray){
    for (int i = 0;i<superArray.size();i++){
        System.out.println(superArray.get(i));
    }
}
```

### 5、类型擦除（知道就好）

​	我们刚刚讲过，为了兼容性，使用原始类型（没有类型参数的泛型）是合法的，泛型被添加进来时，还存在大量不使用泛型的代码。保持所有这些代码合法并与使用泛型的新代码兼容被认为是关键的。将参数化类型的实例传递给设计用于原始类型的方法必须是合法的，反之亦然。

​	为了保持这种兼容性，Java的泛型其实是一种**伪泛型**，这是因为Java在编译期间，所有的泛型信息都会被擦掉，正确理解泛型概念的首要前提是理解类型擦除。Java的泛型基本上都是在编译器这个层次上实现的，在生成的字节码中是不包含泛型中的类型信息的，使用泛型的时候加上类型参数，在编译器编译的时候会去掉，这个过程称为**类型擦除**。

​	如在代码中定义`SuperArray<Object>`和`SuperArray<String>`等类型，在编译后都会变成`SuperArray`，JVM看到的只是`SuperArray`，而由泛型附加的类型信息对JVM是看不到的。Java编译器会在编译时尽可能的发现可能出错的地方，但是仍然无法在运行时刻出现完全避免类型转换异常的情况。

#### （3）类型擦除和多态的冲突

现在有这样一个泛型类：

```java
class Pair<T> {  
    private T value;  
    public T getValue() {  
        return value;  
    }  
    public void setValue(T value) {  
        this.value = value;  
    }  
}
```

然后我们想要一个子类继承它。

```java
package com.ydlclass;

import java.util.Date;

public class DatePair extends Pair<Date>{
    @Override
    public Date getValue() {
        return super.getValue();
    }

    @Override
    public void setValue(Date value) {
        super.setValue(value);
    }
}
```

 在这个子类中，我们设定父类的泛型类型为`Pair<Date>`，在子类中，我们重写了父类的两个方法，我们的原意是这样的：将父类的泛型类型限定为`Date`，那么父类里面的两个方法的参数都为`Date`类型。

 所以，我们在子类中重写这两个方法一点问题也没有，实际上，从他们的`@Override`标签中也可以看到，一点问题也没有，实际上是这样的吗？

分析：实际上，类型擦除后，父类的的泛型类型全部变为了原始类型`Object`，所以父类编译之后会变成下面的样子：

```java
class Pair {  
    private Object value;  
    public Object getValue() {  
        return value;  
    }  
    public void setValue(Object  value) {  
        this.value = value;  
    }  
}  
```

再看子类的两个重写的方法的类型：

```java
@Override  
public void setValue(Date value) {  
    super.setValue(value);  
}  
@Override  
public Date getValue() {  
    return super.getValue();  
}
```

 先来分析`setValue`方法，父类的类型是`Object`，而子类的类型是`Date`，参数类型不一样，这如果是在普通的继承关系中，根本就不会是重写，而是重载。

```java
{
  public java.util.Date getValue();
    descriptor: ()Ljava/util/Date;
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #2                  // Method com/ydlclass/Pair.getValue:()Ljava/lang/Object;
         4: checkcast     #3                  // class java/util/Date
         7: areturn
      LineNumberTable:
        line 8: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       8     0  this   Lcom/ydlclass/DatePair;

  public void setValue(java.util.Date);
    descriptor: (Ljava/util/Date;)V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: invokespecial #4                  // Method com/ydlclass/Pair.setValue:(Ljava/lang/Object;)V
         5: return
      LineNumberTable:
        line 13: 0
        line 14: 5
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       6     0  this   Lcom/ydlclass/DatePair;
            0       6     1 value   Ljava/util/Date;


  // 桥接方法，一会分析
  public void setValue(java.lang.Object);
    descriptor: (Ljava/lang/Object;)V
    flags: ACC_PUBLIC, ACC_BRIDGE, ACC_SYNTHETIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: checkcast     #3                  // class java/util/Date
         5: invokevirtual #5                  // Method setValue:(Ljava/util/Date;)V
         8: return
      LineNumberTable:
        line 5: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  this   Lcom/ydlclass/DatePair;

  public java.lang.Object getValue();
    descriptor: ()Ljava/lang/Object;
    flags: ACC_PUBLIC, ACC_BRIDGE, ACC_SYNTHETIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokevirtual #6                  // Method getValue:()Ljava/util/Date;
         4: areturn
      LineNumberTable:
        line 5: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/ydlclass/DatePair;
}
Signature: #29                          // Lcom/ydlclass/Pair<Ljava/util/Date;>;
SourceFile: "DatePair.java"
```

 从编译的结果来看，我们本意重写`setValue`和`getValue`方法的子类，竟然有4个方法，其实不用惊奇，最后的两个方法，就是编译器自己生成的【桥方法】，我们从字节码中看到两个标志【ACC_BRIDGE, ACC_SYNTHETIC】。可以看到桥方法的参数类型都是Object，也就是说，子类中真正覆盖父类两个方法的就是这两个我们看不到的桥方法。而在我们自己定义的`setvalue`和`getValue`方法上面的`@Override`只不过是假象。而桥方法的内部实现，就只是去调用我们自己重写的那两个方法。

 所以，**虚拟机巧妙的使用了桥方法，来解决了类型擦除和多态的冲突**。

 并且，还有一点也许会有疑问，子类中的桥方法`Object getValue()`和`Date getValue()`是同时存在的，可是如果是常规的两个方法，他们的方法签名是一样的，也就是说虚拟机根本不能分辨这两个方法。如果是我们自己编写Java代码，这样的代码是无法通过编译器的检查的，但是虚拟机却是允许这样做的，编译器为了实现泛型的多态允许自己做这个看起来“不合法”的事情，然后交给虚拟机去区别。

#### 总结

1、JVM会擦除泛型，所以会导致父类的泛型的方法传到子类中是Object类型的参数，

2、为了解决泛型擦除，当你给子类指定了类型后JVM会做一个方法桥接，用你重写的方法去找名字一样，

3、但是在JVM中参数类型为Object的方法

### 6、静态方法和静态类中的问题

 泛型类中的静态方法和静态变量不可以使用泛型类所声明的泛型类型参数

举例说明：

```java
public class Test2<T> {    
    public static T one;   //编译错误    
    public static T show(T one){ //编译错误    
        return null;    
    }    
}
```

 因为泛型类中的泛型参数的实例化是在定义对象的时候指定的，而静态变量和静态方法不需要使用对象来调用。对象都没有创建，如何确定这个泛型参数是何种类型，所以当然是错误的。

但是要注意区分下面的一种情况：

```java
public class Test2<T> {    

    public static <T> T show(T one){ //这是正确的    
        return null;    
    }    
}
```

因为这是一个泛型方法，在泛型方法中使用的T是自己在方法中定义的 T，而不是泛型类中的T。

## 知识点二：枚举 enum

### 1、基本Enum特性

- 枚举类的定义

```text
public enum SeasonEnum {
    SPRING,SUMMER,AUTUMN,WINTER;
}
```

不妨看看字节码文件：

`public final class SeasonEnum extends java.lang.Enum<SeasonEnum>`

```java
C:\Users\zn\IdeaProjects\untitled\out\production\untitled>javap -v SeasonEnum.class
Classfile /C:/Users/zn/IdeaProjects/untitled/out/production/untitled/SeasonEnum.class
  Last modified 2021-8-28; size 974 bytes
  MD5 checksum dc612af3d340c0984bbf18b7cffbf2e6
  Compiled from "SeasonEnum.java"
public final class SeasonEnum extends java.lang.Enum<SeasonEnum>
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_FINAL, ACC_SUPER, ACC_ENUM
{
// 静态常量
  public static final SeasonEnum SPRING;
    descriptor: LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC, ACC_FINAL, ACC_ENUM

  public static final SeasonEnum SUMMER;
    descriptor: LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC, ACC_FINAL, ACC_ENUM

  public static final SeasonEnum AUTUMN;
    descriptor: LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC, ACC_FINAL, ACC_ENUM

  public static final SeasonEnum WINTER;
    descriptor: LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC, ACC_FINAL, ACC_ENUM

  public static SeasonEnum[] values();
    descriptor: ()[LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=1, locals=0, args_size=0
         0: getstatic     #1                  // Field $VALUES:[LSeasonEnum;
         3: invokevirtual #2                  // Method "[LSeasonEnum;".clone:()Ljava/lang/Object;
         6: checkcast     #3                  // class "[LSeasonEnum;"
         9: areturn
      LineNumberTable:
        line 1: 0

  public static SeasonEnum valueOf(java.lang.String);
    descriptor: (Ljava/lang/String;)LSeasonEnum;
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: ldc           #4                  // class SeasonEnum
         2: aload_0
         3: invokestatic  #5                  // Method java/lang/Enum.valueOf:(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
         6: checkcast     #4                  // class SeasonEnum
         9: areturn
      LineNumberTable:
        line 1: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      10     0  name   Ljava/lang/String;

  static {};
    descriptor: ()V
    flags: ACC_STATIC
    Code:
      stack=4, locals=0, args_size=0
         0: new           #4                  // class SeasonEnum
         3: dup
         4: ldc           #7                  // String SPRING
         6: iconst_0
         7: invokespecial #8                  // Method "<init>":(Ljava/lang/String;I)V
        10: putstatic     #9                  // Field SPRING:LSeasonEnum;
        13: new           #4                  // class SeasonEnum
        16: dup
        17: ldc           #10                 // String SUMMER
        19: iconst_1
        20: invokespecial #8                  // Method "<init>":(Ljava/lang/String;I)V
        23: putstatic     #11                 // Field SUMMER:LSeasonEnum;
        26: new           #4                  // class SeasonEnum
        29: dup
        30: ldc           #12                 // String AUTUMN
        32: iconst_2
        33: invokespecial #8                  // Method "<init>":(Ljava/lang/String;I)V
        36: putstatic     #13                 // Field AUTUMN:LSeasonEnum;
        39: new           #4                  // class SeasonEnum
        42: dup
        43: ldc           #14                 // String WINTER
        45: iconst_3
        46: invokespecial #8                  // Method "<init>":(Ljava/lang/String;I)V
        49: putstatic     #15                 // Field WINTER:LSeasonEnum;
        52: iconst_4
        53: anewarray     #4                  // class SeasonEnum
        56: dup
        57: iconst_0
        58: getstatic     #9                  // Field SPRING:LSeasonEnum;
        61: aastore
        62: dup
        63: iconst_1
        64: getstatic     #11                 // Field SUMMER:LSeasonEnum;
        67: aastore
        68: dup
        69: iconst_2
        70: getstatic     #13                 // Field AUTUMN:LSeasonEnum;
        73: aastore
        74: dup
        75: iconst_3
        76: getstatic     #15                 // Field WINTER:LSeasonEnum;
        79: aastore
        80: putstatic     #1                  // Field $VALUES:[LSeasonEnum;
        83: return
      LineNumberTable:
        line 2: 0
        line 1: 52
}
Signature: #39                          // Ljava/lang/Enum<LSeasonEnum;>;
SourceFile: "SeasonEnum.java"
```

常用方法

| 方法                       | 说明                                   |
| -------------------------- | -------------------------------------- |
| values() 静态的自动生成的  | 可以遍历enum实例，其返回enum实例的数组 |
| ordinal() 父类的实例方法   | 返回每个实例在声明时的次序             |
| name() 父类的实例方法      | 返回enum实例声明时的名称               |
| getDeclaringClass()        | 返回其所属的enum类                     |
| valueOf() 静态的自动生成的 | 根据给定的名称返回相应的enum实例       |

### 3、Switch语句中的Enum

- 正确用法

```java
public static void main(String[] args) {
    SeasonEnum season = SeasonEnum.SPRING;
    switch (season){
        case SPRING:
            System.out.println("春天来了，又到了万物交配的季节！");
        case SUMMER:
            System.out.println("夏天来了，又可以穿大裤衩了！");
        case AUTUMN:
            System.out.println("秋天来了，又到了收获的季节！");
        case WINTER:
            System.out.println("冬天来了，又到了吃火锅的季节了！");
        default:
            System.out.println("也没有别的季节了。");
    }
}
```

- 常规情况下必须使用 enum 类型来修饰 enum 实例，但在 case 语句中不必如此，
- 意思就是 `case SPRING:` 不需要写成 `case SeasonEnum.SPRING:`。

### 4、Enum的静态导入

- static import 可以将 enum 实例的标识符带入当前类，无需再用enum类型来修饰 enum 实例

```text
import static com.ydlclass.SeasonEnum.*;

public class Test {

    public static void main(String[] args) {
        System.out.println(SPRING.name());
        System.out.println(SUMMER.name());
    }
}
```

### 5、枚举实现单例设计模式

目前我们的单例设计模式已经实现了三种了：

> 《Effective Java》
>
> 这种方法在功能上与公有域方法相近，但是它更加简洁，无偿提供了序列化机制，绝对防止多次实例化，即使是在面对复杂序列化或者反射攻击的时候。虽然这种方法还没有广泛采用，但是单元素的枚举类型已经成为实现 Singleton的最佳方法。—-《Effective Java 中文版 第二版》

```java
package com.ydlclass;

public class Singleton {

    private Singleton(){}

    public static Singleton getInstant(){
        return SingletonHolder.INSTANT.instant;
    }

   private enum SingletonHolder{
        INSTANT;
        private final Singleton instant;

        SingletonHolder(){
            instant = new Singleton();
        }

    }

    public static void main(String[] args) {
        System.out.println(Singleton.getInstant() == Singleton.getInstant());
    }

}
```

### 6、枚举的优势

阿里《Java开发手册》对枚举的相关规定如下，我们在使用时需要稍微注意一下。

> 【强制】所有的枚举类型字段必须要有注释，说明每个数据项的用途。
>
> 【参考】枚举类名带上 Enum 后缀，枚举成员名称需要全大写，单词间用下划线隔开。说明：枚举其实就是特殊的常量类，且构造方法被默认强制是私有。正例：枚举名字为 ProcessStatusEnum 的成员名称：SUCCESS / UNKNOWN_REASON。



枚举比较推荐使用 ==
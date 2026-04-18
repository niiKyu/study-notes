# 第13章 IO流

## 二、文件的操作

### 3、构造方法

| 构造器                           | 描述                                                   |
| -------------------------------- | ------------------------------------------------------ |
| File(String pathname)            | 通过将给定路径名字符串来创建一个新 File 实例           |
| File(String parent,String child) | 根据指定的父路径和文件路径创建一个新File对象实例       |
| File(File parent,String child)   | 根据指定的父路径对象和文件路径创建一个新的File对象实例 |

### 4、File类创建和删除功能

|         |                 |                                                              |
| ------- | --------------- | ------------------------------------------------------------ |
| boolean | createNewFile() | 指定路径不存在该文件时创建文件，返回true 否则false           |
| boolean | mkdir()         | 当指定的单击文件夹不存在时创建文件夹并返回true 否则false     |
| boolean | mkdirs()        | 当指定的多级文件夹在某一级文件夹不存在时，创建多级文件夹并返回true 否则false |
| boolean | delete()        | 删除文件或者删除单级文件夹                                   |

### 5、File类的判断功能

|         |               |                                    |
| ------- | ------------- | ---------------------------------- |
| boolean | exists()      | 判断指定路径的文件或文件夹是否为空 |
| boolean | isAbsolute()  | 判断当前路径是否是绝对路径         |
| boolean | isDirectory() | 判断当前的目录是否是一个文件夹     |
| boolean | isFile()      | 判断当前的目录是否是一个文件       |
| boolean | isHidden()    | 判断当前路径是否是一隐藏文件       |

### 6、File类的获取功能和修改名字功能

|         |                     |                                                      |
| ------- | ------------------- | ---------------------------------------------------- |
| File    | getAbsoluteFile()   | 获取文件的绝对路径，返回File对象                     |
| String  | getAbsolutePath()   | 获取文件的绝对路径，返回路径的字符串                 |
| String  | getParent()         | 获取当前路径的父级路径，以字符串形式返回该父级路径   |
| String  | getName()           | 获取文件或文件夹的名称                               |
| String  | getPath()           | 获取File对象中封装的路径                             |
| long    | lastModified()      | 以毫秒值返回最后修改时间                             |
| long    | length()            | 返回文件的字节数                                     |
| boolean | renameTo(File dest) | 将当前File对象所指向的路径修改为指定File所指向的路径 |

### 7、文件夹列表操作

| 返回值   | 方法                             | 描述                                                 |
| -------- | -------------------------------- | ---------------------------------------------------- |
| String   | list()                           | 得到这个文件夹下的所有文件，返回路径数组             |
| String[] | list(FilenameFilter filter)      | 通过过滤器过滤文件，过滤通过文件名过滤，返回路径数组 |
| File[]   | listFiles()                      | 得到这个文件夹下的所有文件，返回文件数组             |
| File[]   | listFiles(FileFilter filter)     | 通过过滤器过滤文件，过滤通过文件过滤，返回文件数组   |
| File[]   | listFiles(FilenameFilter filter) | 通过过滤器过滤文件，过滤通过文件名过滤，返回文件数组 |

## 三、 IO流的分类：

### 4、Java输入/输出流体系中常用的流的分类表

| 分类 | 字节输入流 |字节输出流|字符输入流|字符输出流|

|      分类      |      字节输入流      |      字节输出流       |   字符输入流    |   字符输出流    |
| :------------: | :------------------: | :-------------------: | :-------------: | :-------------: |
|    抽象基类    |     InputStream      |     OutputStream      |     Reader      |     Writer      |
|    访问文件    |   FileInputStream    |   FileOutputStream    |   FileReader    |   FileWriter    |
|    访问数组    | ByteArrayInputStream | ByteArrayOutputStream | CharArrayReader | CharArrayWriter |
|   访问字符串   |                      |                       |  StringReader   |  StringWriter   |
| 缓冲流（处理） | BufferedInputStream  | BufferedOutputStream  | BufferedReader  | BufferedWriter  |
|    操作对象    |  ObjectInputStream   |  ObjectOutputStream   |                 |                 |

## 四、流的案例

```java
// 读一个字节，返回的是值
int read = inputStream.read();
```

```java
//传入参数之后返回的是读取的长度
int len = inputStream.read(bytes);
```

### 1、拷贝

#### 原始版本

```java
InputStream inputStream = null;
OutputStream outputStream = null;
try {
    inputStream = new FileInputStream("D:\\Java\\code\\io\\img\\a\\1.mov");
    outputStream = new FileOutputStream("D:\\Java\\code\\io\\img\\b\\1.mov");

    byte[] buf = new byte[1024 * 1024];
    int len;

    long start = System.currentTimeMillis();

    while ((len = inputStream.read(buf)) != -1) {
        outputStream.write(buf, 0, len);
    }

    long end = System.currentTimeMillis();
    System.out.println(end - start);
} catch (FileNotFoundException e) {
    e.printStackTrace();
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (inputStream != null) {
        try {
            inputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    if (outputStream != null) {
        try {
            outputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 优化之后

jdk1.7之后，很多资源类的类都实现了AutoCloseable接口

实现了这个接口的类可以在try中定义资源，并会主动释放资源：

```java
// inputStream和outputStream实现了Closeable，Closeable继承自AutoCloseable
try (InputStream inputStream = new FileInputStream("D:\\Java\\code\\io\\img\\a\\1.mov");
     OutputStream outputStream = new FileOutputStream("D:\\Java\\code\\io\\img\\b\\1.mov")) {

    byte[] buf = new byte[1024 * 1024];
    int len;

    long start = System.currentTimeMillis();
    while ((len = inputStream.read(buf)) != -1) {
        outputStream.write(buf, 0, len);
    }
    long end = System.currentTimeMillis();
    System.out.println(end - start);
} catch (FileNotFoundException e) {
    e.printStackTrace();
} catch (IOException e) {
    e.printStackTrace();
}
```

### 2、字符流

#### （1）字符流读文件

```java
@Test
public void testReader() throws Exception{
    //怼了一个输入流到文件上
    Reader reader = new FileReader("D:\\Java\\code\\io\\img\\a\\1.txt");
    BufferedReader br = new BufferedReader(reader);
    String str;
    while ((str = br.readLine()) != null){
        System.out.println(str);
    }
    reader.close();
    br.close();
}
```

#### （2）向文件里写内容

```java
//这个用main方法测吧
public void testWriter() throws Exception{
    //怼了一个输入流到文件上
    Writer writer = new FileWriter("D:\\Java\\code\\io\\img\\a\\1.txt");
    BufferedWriter bw = new BufferedWriter(writer);
    Scanner scanner = new Scanner(System.in);

    while (true){
        System.out.print("请输入：");
        String words = scanner.next();
        bw.write(words);
        bw.flush();
    }
}
```

## 五、序列化和反序列化

序列化：为了实现两个程序交换数据，把对象内存模型变成字节存在磁盘

反序列化：把磁盘字节变回之前的内存模型

serialVersionUID：如果不自己定义的话,会根据jdk版本或代码生成，每次修改代码都会报错，阻止你序列化，所以要定义一个UID

什么情况下需要修改serialVersionUID呢：

- 如果只是修改了方法，反序列化不容影响，则无需修改版本号；
- 如果只是修改了静态变量，瞬态变量（transient修饰的变量），反序列化不受影响，无需修改版本号。

### 3、总结

1. 所有需要网络传输的对象都需要实现序列化接口。
2. 对象的类名、实例变量（包括基本类型，数组，对其他对象的引用）都会被序列化；方法、类变量、transient实例变量都不会被序列化。
3. 如果想让某个变量不被序列化，使用transient修饰。
4. 序列化对象的引用类型成员变量，也必须是可序列化的，否则，会报错。
5. 反序列化时必须有序列化对象的class文件。
6. 同一对象序列化多次，只有第一次序列化为二进制流，以后都只是保存序列化编号，不会重复序列化。
7. 建议所有可序列化的类加上serialVersionUID 版本号，方便项目升级。

Intellij idea用快捷键自动生成序列化id，类继承了Serializable接口之后，使用alt+enter快捷键自动创建序列化id

方法：进入setting→inspections→serialization issues→选择图中的选项。serializable class without ‘serialVersionUID’

![image-20210910161445055](..\img\image-20210910161445055-46ceb0e4.png)

### 4、深拷贝

（1）对象的引用改变:

```java
User user = new User(12, "zhagnsna");
User user1 = user;
```

（2）浅拷贝：实现clonable接口，重写clone方法。

```java
User user = new User(12, "zhagnsna");
User user1 = (User)user.clone();
```

（3）深拷贝：使用对象流先写入byte数组，再读出来。

```java
    User user = new User(12, "zhangsan");
    user.setDog(new Dog(2));

    // 将对象写到字节数组当中
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    ObjectOutputStream objectOutputStream = new ObjectOutputStream(outputStream);
    objectOutputStream.writeObject(user);
    // 获取字节数组
    byte[] bytes = outputStream.toByteArray();
    // 用输入流读出来
    ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
    ObjectInputStream objectInputStream = new ObjectInputStream(byteArrayInputStream);
    Object object = objectInputStream.readObject();
    User user1 = (User) object;

    user.setAge(44);
    user.getDog().setAge(11);
    System.out.println(user);
    System.out.println(user1);
```
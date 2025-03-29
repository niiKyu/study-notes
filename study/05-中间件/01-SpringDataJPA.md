# SpringDataJAP

## pom

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
## yml

```yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mytest
    type: com.alibaba.druid.pool.DruidDataSource
    username: root
    password: root
    driver-class-name: com.mysql.jdbc.Driver //驱动
  jpa:
    hibernate:
      ddl-auto: update //自动更新
    show-sql: true  //日志中显示sql语句
```
## entity

```java
@Entity
@Getter
@Setter
@Table(name = "person")
public class Person {

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "name", length = 20)
    private String name;

    @Column(name = "agee", length = 4)
    private int age;
}
```

## dao

```java
public interface PersonRepository extends JpaRepository<Person, Long> {
}
```

## sql

```java
Person findByName(String name);
```

带参查询:（1、根据参数位置2、根据Param注解）

```java
   /**
     * 查询根据参数位置
     * @param name
     * @return
     */
    @Query(value = "select * from person  where name = ?1",nativeQuery = true)
    Person findPersonByName(String Name);
 
    /**
     * 查询根据Param注解
     * @param name
     * @return
     */
    @Query(value = "select p from person p where p.uname = :name")
    Person findPersonByNameTwo(@Param("name") String name);
```

**注意:**

对于自定义sql的删改方法,在方法上还要添加`@Transactional/@Modifying`注解,如下所示:

```python
@Transactional
@Modifying
@Query(value = "delete from Account where id =?1",nativeQuery = true)
void delAccount(int id);
```

**Keyword Sample JPQL snippet**

1. And----findByLastnameAndFirstname----where x.lastname = ?1 and
2. Or----findByLastnameOrFirstname----where x.lastname = ?1 or x.firstname = ?2
3. Is,Equals----findByFirstnameIs,findByFirstnameEquals----where x.firstname = ?1
4. Between----findByStartDateBetween----where x.startDate between ?1 and ?2
5. LessThan----findByAgeLessThan----where x.age < ?1
6. LessThanEqual----findByAgeLessThanEqual----where x.age ⇐ ?1
7. GreaterThan----findByAgeGreaterThan----where x.age > ?1
8. GreaterThanEqual----findByAgeGreaterThanEqual----where x.age >= ?1
9. After----findByStartDateAfter----where x.startDate > ?1
10. Before----findByStartDateBefore----where x.startDate < ?1
11. IsNull----findByAgeIsNull----where x.age is null
12. IsNotNull,NotNull----findByAge(Is)NotNull----where x.age not null
13. Like----findByFirstnameLike----where x.firstname like ?1
14. NotLike----findByFirstnameNotLike----where x.firstname not like ?1
15. StartingWith----findByFirstnameStartingWith----where x.firstname like ?1 (parameter bound with appended %)
16. EndingWith----findByFirstnameEndingWith----where x.firstname like ?1 (parameter bound with prepended %)
17. Containing----findByFirstnameContaining----where x.firstname like ?1 (parameter bound wrapped in %)
18. OrderBy----findByAgeOrderByLastnameDesc----where x.age = ?1 order by x.lastname desc
19. Not----findByLastnameNot----where x.lastname <> ?1
20. In----findByAgeIn(Collection ages)----where x.age in ?1
21. NotIn----findByAgeNotIn(Collection age)----where x.age not in ?1
22. TRUE----findByActiveTrue()----where x.active = true
23. FALSE----findByActiveFalse()----where x.active = false
24. IgnoreCase----findByFirstnameIgnoreCase----where UPPER(x.firstame) = UPPER(?1)

## 分页

`countQuery`代表当前分页的总页数，如果不设置这个参数相信你的分页一定不顺利

如下所示:

```sql
@Query(nativeQuery = true,
value = "select id, name,age FROM people WHERE id=?! and name=?2 and age=?3,
countQuery = "select count(*) FROM people WHERE id=?! and name=?2 and age=?3")
public Page findAll(Integer id,String name,Integer age,Pageable pageable);
```

如果既要分组group by,还要分页countQuery就需要: `countQuery = "select count(*) FROM (select count(*) FROM people WHERE id=?! and name=?2 and age=?3 group by name) a"`最后的a为别名,随意命名

如果不用()包裹再count(),返回的就是分组后每一行的count(),所以就需要再进行一步count()计算,才是分页的总数

注意,返回的Page对象要添加泛型,去规定返回的数据类型,若是没有泛型,返回的就是数组而不是对象.

但是需要注意:new PageRequest会发现已经过时,替代的方法是不要new PageRequest，而是直接用 PageRequest.of这个方法 根据你的需求选择入参；

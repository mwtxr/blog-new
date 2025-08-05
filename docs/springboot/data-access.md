# Spring Boot 数据访问与JPA

## 🎯 数据访问技术栈选择

### 常见方案对比

| 技术 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **JPA/Hibernate** | 复杂业务逻辑 | 开发效率高，ORM映射强大 | 性能相对较低 |
| **MyBatis** | SQL复杂查询 | SQL灵活控制，性能好 | 需要手写SQL |
| **JdbcTemplate** | 简单查询 | 轻量级，性能好 | 需要手动映射 |
| **Spring Data JDBC** | 简单CRUD | 轻量，性能好 | 功能相对简单 |

## 🚀 Spring Data JPA快速上手

### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL驱动 -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- H2数据库（测试用） -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 配置数据源

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/springboot_demo?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
  
  jpa:
    hibernate:
      ddl-auto: update  # 开发环境使用update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        use_sql_comments: true
```

## 📋 实体类设计

### 基础实体类

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, length = 100)
    private String password;
    
    @Column(length = 50)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
    }
}

public enum UserStatus {
    ACTIVE, INACTIVE, SUSPENDED
}
```

### 关联关系示例

```java
@Entity
@Table(name = "posts")
@Data
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();
}

@Entity
@Table(name = "comments")
@Data
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;
}
```

## 🔍 Repository层设计

### 基础Repository

```java
package com.example.demo.repository;

import com.example.demo.entity.User;
import com.example.demo.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 根据用户名查找用户
    Optional<User> findByUsername(String username);
    
    // 根据邮箱查找用户
    Optional<User> findByEmail(String email);
    
    // 根据状态查找用户
    List<User> findByStatus(UserStatus status);
    
    // 根据用户名模糊查询，支持分页
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    
    // 自定义查询：查找创建时间在指定范围内的用户
    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    List<User> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    // 使用原生SQL查询
    @Query(value = "SELECT * FROM users WHERE status = :status ORDER BY created_at DESC", 
           nativeQuery = true)
    List<User> findActiveUsersNative(@Param("status") String status);
    
    // 统计用户数
    long countByStatus(UserStatus status);
    
    // 检查用户名是否存在
    boolean existsByUsername(String username);
    
    // 检查邮箱是否存在
    boolean existsByEmail(String email);
}
```

### 复杂查询示例

```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 根据作者查找文章
    List<Post> findByAuthor_Id(Long authorId);
    
    // 根据标题模糊查询
    List<Post> findByTitleContainingIgnoreCase(String title);
    
    // 根据标签查找文章
    @Query("SELECT p FROM Post p WHERE :tag MEMBER OF p.tags")
    List<Post> findByTag(@Param("tag") String tag);
    
    // 获取用户的文章数量
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :userId")
    long countByAuthorId(@Param("userId") Long userId);
    
    // 获取热门文章（评论数最多的前10篇）
    @Query("SELECT p FROM Post p LEFT JOIN p.comments c GROUP BY p ORDER BY COUNT(c) DESC")
    Page<Post> findPopularPosts(Pageable pageable);
    
    // 动态查询示例
    @Query("SELECT p FROM Post p WHERE " +
           "(:title IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:authorId IS NULL OR p.author.id = :authorId)")
    Page<Post> searchPosts(@Param("title") String title, 
                           @Param("authorId") Long authorId, 
                           Pageable pageable);
}
```

## 🏗️ Service层设计

### 基础Service接口

```java
package com.example.demo.service;

import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);
    UserResponse getUserById(Long id);
    UserResponse getUserByUsername(String username);
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

### Service实现类

```java
package com.example.demo.service.impl;

import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.UserStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserResponse createUser(UserCreateRequest request) {
        if (existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("用户名已存在");
        }
        if (existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("邮箱已存在");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // 实际应用中需要加密
        user.setFullName(request.getFullName());
        
        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::mapToUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }
    
    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) 
            && existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("邮箱已存在");
        }
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("用户不存在");
        }
        userRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
```

## 📋 DTO设计

### 请求DTO

```java
@Data
public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50字符之间")
    private String username;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在6-100字符之间")
    private String password;
    
    @Size(max = 50, message = "姓名长度不能超过50字符")
    private String fullName;
}

@Data
public class UserUpdateRequest {
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Size(max = 50, message = "姓名长度不能超过50字符")
    private String fullName;
}
```

### 响应DTO

```java
@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 🧪 测试配置

### 测试类示例

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void findByUsername_ShouldReturnUser_WhenUsernameExists() {
        // Given
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        userRepository.save(user);
        
        // When
        Optional<User> foundUser = userRepository.findByUsername("testuser");
        
        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }
    
    @Test
    void existsByUsername_ShouldReturnTrue_WhenUsernameExists() {
        // Given
        User user = new User();
        user.setUsername("existinguser");
        user.setEmail("existing@example.com");
        user.setPassword("password");
        userRepository.save(user);
        
        // When
        boolean exists = userRepository.existsByUsername("existinguser");
        
        // Then
        assertThat(exists).isTrue();
    }
}
```

## 🏁 最佳实践总结

1. **实体设计**：使用Lombok简化代码，合理设计关联关系
2. **Repository**：优先使用Spring Data JPA方法命名约定，复杂查询使用@Query
3. **Service层**：保持事务边界清晰，避免事务嵌套
4. **DTO模式**：使用DTO进行数据传输，避免直接暴露实体
5. **分页查询**：使用Spring Data的Pageable进行分页
6. **缓存策略**：合理使用JPA二级缓存和Spring Cache
7. **性能优化**：使用@Transactional(readOnly = true)优化只读查询
8. **测试覆盖**：编写Repository层和Service层的单元测试
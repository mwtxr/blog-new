# Spring Boot 快速入门

## 🎯 什么是Spring Boot？

Spring Boot是一个开源的Java框架，用于简化Spring应用的初始搭建和开发过程。它采用"约定优于配置"的理念，让开发者能够快速启动和运行Spring应用。

## 🚀 创建第一个Spring Boot项目

### 方式一：使用Spring Initializr

1. 访问 [start.spring.io](https://start.spring.io)
2. 选择：
   - Project: Maven Project
   - Language: Java
   - Spring Boot: 3.2.0 (最新稳定版)
   - Group: com.example
   - Artifact: demo
   - Java: 21
3. 添加依赖：
   - Spring Web
   - Spring Boot DevTools
   - Lombok

### 方式二：使用IDE创建

#### IntelliJ IDEA
1. File → New → Project
2. 选择 Spring Initializr
3. 填写项目信息
4. 选择依赖

## 📁 项目结构

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       └── model/
│   └── resources/
│       ├── application.properties
│       └── static/
└── test/
    └── java/
        └── com/example/demo/
```

## 🏗️ 创建第一个REST API

### 1. 创建主类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 2. 创建Controller

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello, Spring Boot!";
    }

    @GetMapping("/api/greeting")
    public Greeting greeting(@RequestParam(defaultValue = "World") String name) {
        return new Greeting("Hello, " + name + "!");
    }
}

record Greeting(String message) {}
```

### 3. 运行项目

```bash
# 使用Maven
./mvnw spring-boot:run

# 使用Gradle
./gradlew bootRun
```

访问：http://localhost:8080

## 🎯 常用配置

### application.properties

```properties
# 服务器端口
server.port=8080

# 应用名称
spring.application.name=demo-app

# 开发环境配置
spring.profiles.active=dev

# 日志级别
logging.level.com.example.demo=DEBUG
```

### application.yml（推荐）

```yaml
server:
  port: 8080

spring:
  application:
    name: demo-app
  profiles:
    active: dev

logging:
  level:
    com.example.demo: DEBUG
```

## 📊 添加数据库支持

### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
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
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 创建实体类

```java
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
}
```

### 创建Repository

```java
package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
```

## ✅ 测试API

使用curl或Postman测试：

```bash
# 添加用户
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com"}'

# 获取所有用户
curl http://localhost:8080/api/users
```

## 🎉 下一步

- 学习[项目结构与最佳实践](./project-structure.md)
- 了解[配置文件详解](./configuration.md)
- 掌握[数据访问与JPA](./data-access.md)
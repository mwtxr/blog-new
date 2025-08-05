# Spring Boot 配置文件详解

## 🎯 配置文件优先级

Spring Boot支持多种配置文件格式，优先级从高到低：

1. `application.properties` 或 `application.yml`
2. `application-{profile}.properties` 或 `.yml`
3. 命令行参数
4. 环境变量
5. 系统属性

## 📋 配置格式对比

### application.properties（传统格式）
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=123456
```

### application.yml（推荐格式）
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test
    username: root
    password: 123456
```

## 🔧 环境配置

### 多环境配置

创建不同环境的配置文件：

```
src/main/resources/
├── application.yml          # 默认配置
├── application-dev.yml      # 开发环境
├── application-test.yml     # 测试环境
└── application-prod.yml     # 生产环境
```

### 激活指定环境

**方式一：application.yml中指定**
```yaml
spring:
  profiles:
    active: dev
```

**方式二：命令行参数**
```bash
java -jar app.jar --spring.profiles.active=prod
```

**方式三：环境变量**
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar
```

## 📊 常用配置示例

### 服务器配置
```yaml
server:
  port: 8080
  servlet:
    context-path: /api
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain
```

### 数据源配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
```

### JPA/Hibernate配置
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # create, create-drop, validate, update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
```

### Redis配置
```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
```

### 日志配置
```yaml
logging:
  level:
    root: INFO
    com.example.demo: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
```

## 🔍 配置绑定

### @Value注解
```java
@RestController
public class ConfigController {
    
    @Value("${server.port}")
    private String serverPort;
    
    @Value("${app.description:默认值}")
    private String appDescription;
    
    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of(
            "serverPort", serverPort,
            "appDescription", appDescription
        );
    }
}
```

### @ConfigurationProperties（推荐）

**创建配置类：**
```java
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String name;
    private String description;
    private String version;
    private Database database;
    private Security security;
    
    @Data
    public static class Database {
        private String url;
        private String username;
        private String password;
    }
    
    @Data
    public static class Security {
        private boolean enabled;
        private String secret;
        private long tokenValidity;
    }
}
```

**配置文件：**
```yaml
app:
  name: My Application
  description: Spring Boot Demo Application
  version: 1.0.0
  database:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
  security:
    enabled: true
    secret: my-secret-key
    token-validity: 3600000  # 1小时
```

**使用配置类：**
```java
@RestController
@RequiredArgsConstructor
public class AppController {
    private final AppProperties properties;
    
    @GetMapping("/app-info")
    public AppProperties getAppInfo() {
        return properties;
    }
}
```

## 🚀 配置中心

### Spring Cloud Config

**添加依赖：**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**bootstrap.yml配置：**
```yaml
spring:
  application:
    name: my-application
  cloud:
    config:
      uri: http://config-server:8888
      profile: ${spring.profiles.active}
      label: main
```

## 📈 配置验证

### 使用@Validated验证配置
```java
@Component
@ConfigurationProperties(prefix = "app")
@Validated
@Data
public class AppProperties {
    
    @NotEmpty
    private String name;
    
    @Min(1)
    @Max(100)
    private int maxUsers;
    
    @Email
    private String adminEmail;
    
    @Valid
    private Database database;
    
    @Data
    public static class Database {
        @NotEmpty
        private String url;
        
        @NotEmpty
        private String username;
    }
}
```

## 🎨 配置提示

### 生成配置元数据

添加依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

这样在IDE中输入配置时会有智能提示。

## 🔐 安全配置

### 敏感信息处理

**使用环境变量：**
```yaml
spring:
  datasource:
    password: ${DB_PASSWORD}
```

**使用配置服务器：**
- Spring Cloud Config
- HashiCorp Vault
- Kubernetes ConfigMap/Secret

## 🏁 最佳实践总结

1. **使用YAML格式**：结构清晰，支持复杂配置
2. **按环境分离**：使用profile区分不同环境
3. **使用@ConfigurationProperties**：类型安全，支持验证
4. **外部化配置**：敏感信息使用环境变量或配置中心
5. **配置验证**：使用@Validated确保配置正确性
6. **文档化**：为自定义配置添加注释和元数据
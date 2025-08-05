# 开始使用

欢迎来到Spring Boot学习空间！这里为你提供完整的学习路径和实战指南。

## 📚 学习路径

### 新手入门
如果你是Spring Boot新手，建议按以下顺序学习：

1. [Spring Boot快速入门](/springboot/quick-start) - 创建第一个Spring Boot应用
2. [配置文件详解](/springboot/configuration) - 掌握Spring Boot配置管理
3. [数据访问与JPA](/springboot/data-access) - 学习数据库操作和JPA

### 实战项目
- 博客系统开发
- 用户权限管理
- RESTful API设计

## 🛠️ 环境准备

### 必要工具
- **JDK 21** 或更高版本
- **Maven 3.8+** 或 **Gradle 7+**
- **IDE**: IntelliJ IDEA 或 Eclipse
- **数据库**: MySQL 8.0+ 或 PostgreSQL

### 快速验证环境

```bash
# 检查Java版本
java -version

# 检查Maven版本
mvn -version

# 检查Gradle版本
gradle -version
```

## 🚀 创建第一个项目

### 使用Spring Initializr

1. 访问 [start.spring.io](https://start.spring.io)
2. 选择项目配置：
   - **Project**: Maven
   - **Language**: Java
   - **Spring Boot**: 3.2.0
   - **Java**: 21
3. 添加依赖：
   - Spring Web
   - Spring Data JPA
   - MySQL Driver
   - Lombok

### 项目结构预览

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       └── entity/
│   └── resources/
│       ├── application.yml
│       └── static/
└── test/
    └── java/
        └── com/example/demo/
```

## 📖 本地开发

### 启动项目

```bash
# 克隆项目
git clone https://github.com/mwtxr/blog-new.git

# 进入项目目录
cd blog

# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev
```

### 构建和部署

```bash
# 构建生产版本
npm run docs:build

# 本地预览
npm run docs:preview
```

## 🎯 下一步

完成环境准备后，建议从[Spring Boot快速入门](/springboot/quick-start)开始学习！
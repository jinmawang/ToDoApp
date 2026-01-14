# Java Spring Boot 后端项目结构说明

## 项目概述

这是一个使用 **Spring Boot 3.2** 构建的 Todo REST API，采用分层架构和依赖注入设计。

## 目录结构

```
backend-java/
├── src/
│   ├── main/
│   │   ├── java/com/todo/app/
│   │   │   ├── TodoBackendApplication.java        # 应用程序入口
│   │   │   │
│   │   │   ├── config/                            # 配置类
│   │   │   ���   ├── SecurityConfig.java            # Spring Security 配置
│   │   │   │   └── WebConfig.java                 # Web 配置（CORS）
│   │   │   │
│   │   │   ├── controller/                        # 控制器层（处理 HTTP 请求）
│   │   │   │   ├── AuthController.java            # 认证接口
│   │   │   │   ├── CategoryController.java        # 分类接口
│   │   │   │   ���── TodoController.java            # Todo 接口
│   │   │   │   └── HomeController.java            # 首页接口
│   │   │   │
│   │   │   ├── dto/                               # 数据传输对象
│   │   │   │   ├── LoginDTO.java                  # 登录请求 DTO
│   │   │   │   ├── RegisterDTO.java               # 注册请求 DTO
│   │   │   │   ├── TodoDTO.java                   # Todo DTO
│   │   │   │   ├── StatisticsDTO.java             # 统计 DTO
│   │   │   │   ├── TokenDTO.java                  # Token 响应 DTO
│   │   │   │   └── UserResponseDTO.java           # 用户响应 DTO
│   │   │   │
│   │   │   ├── entity/                            # 实体类（对应数据库表）
│   │   │   │   ├── User.java                      # 用户实体
│   │   │   │   ├── Todo.java                      # Todo 实体
│   │   │   │   ├── Category.java                  # 分类实体
│   │   │   │   └── SubTask.java                   # 子任务实体
│   │   │   │
│   │   │   ├── repository/                        # 数据访问层
│   │   │   │   ├── UserRepository.java            # 用户仓库
│   │   │   │   ├── TodoRepository.java            # Todo 仓库
│   │   │   │   └── CategoryRepository.java        # 分类仓库
│   │   │   │
│   │   │   ├── security/                          # 安全模块
│   │   │   │   ├── JwtUtil.java                   # JWT 工具类
│   │   │   │   ├── JwtAuthenticationFilter.java   # JWT 过滤器
│   │   │   │   └── SecurityUtils.java             # 安全工具类
│   │   │   │
│   │   │   └── service/                           # 业务逻辑层
│   │   │       ├─��� AuthService.java               # 认证服务
│   │   │       ├── TodoService.java               # Todo 服务
│   │   │       └── CategoryService.java           # 分类服务
│   │   │
│   │   └── resources/
│   │       ├── application.properties             # 应用配置
│   │       └── application-dev.properties         # 开发环境配置
│   │
│   └── test/                                      # 测试代码
│       └── java/com/todo/app/
│           └── TodoBackendApplicationTests.java   # 应用测试
│
└── pom.xml                                        # Maven 配置文件
```

## 核心概念详解

### 1. 分层架构（Layered Architecture）

Spring Boot 推荐的分层架构：

```
┌─────────────────────────────────────┐
│   Controller 层（控制器层）          │  ← 处理 HTTP 请求/响应
│   - 接收请求参数                     │
│   - 调用 Service 层                  │
│   - 返回响应数据                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Service 层（业务逻辑层）           │  ← 核心业务逻辑
│   - 业务规则处理                     │
│   - 调用 Repository 层               │
│   - 事务管理                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Repository 层（数据访问层）         │  ← 数据库操作
│   - CRUD 操作                       │
│   - 使用 Spring Data JPA            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Database（数据库）                │
└─────────────────────────────────────┘
```

**优点：**
- 职责清晰，易于维护
- 各层独立，便于测试
- 符合单一职责原则

### 2. 依赖注入（Dependency Injection，DI）

Spring 的核心特性，自动管理对象的创建和依赖关系。

**示例：**

```java
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // 构造函数注入（推荐）
    // Spring 自动注入依赖，无需手动创建对象
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }
}
```

**好处：**
- 松耦合：类之间通过接口交互
- 易测试：可以轻松 mock 依赖
- 自动管理：Spring 自动创建和销毁对象

### 3. JPA 实体（Entity）

JPA（Java Persistence API）是 ORM 框架，将 Java 对象映射到数据库表。

**实体示例：**

```java
@Entity          // 标记为 JPA 实体
@Table(name = "todos")  // 映射到 todos 表
public class Todo {

    @Id                    // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 自增
    private Long id;

    @Column(nullable = false)  // 非空
    private String title;

    @ManyToOne              // 多对一关系
    @JoinColumn(name = "user_id")  // 外键列
    private User user;

    @OneToMany(mappedBy = "todo")  // 一对多关系
    private List<SubTask> subtasks;

    // getters and setters...
}
```

**关系映射：**
- `@ManyToOne`：多对一（多个 Todo 属于一个 User）
- `@OneToMany`：一对多（一个 User 有多个 Todo）
- `@ManyToMany`：多对多（需要中间表）

### 4. Spring Data JPA Repository

数据访问接口，无需编写 SQL，只需定义接口方法。

**接口方法命名规则：**

```java
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 自动生成 SQL：SELECT * FROM todos WHERE user_id = ? AND is_completed = ?
    List<Todo> findByUserIdAndIsCompleted(Long userId, boolean isCompleted);

    // 自动生成 SQL：SELECT * FROM todos WHERE priority = ? ORDER BY created_at DESC
    List<Todo> findByPriorityOrderByCreatedAtDesc(String priority);

    // 自动生成 SQL：SELECT COUNT(*) FROM todos WHERE user_id = ?
    long countByUserId(Long userId);

    // 自定义查询（使用 @Query）
    @Query("SELECT t FROM Todo t WHERE t.title LIKE %:keyword%")
    List<Todo> searchByTitle(@Param("keyword") String keyword);
}
```

**常用方法：**
- `save()` - 保存或更新
- `findById()` - 根据 ID 查询
- `findAll()` - 查询所有
- `deleteById()` - 根据 ID 删除
- `count()` - 统计数量

### 5. JWT 认证流程

```
1. 用户登录
   ↓
2. AuthController.login()
   ↓
3. AuthService 验证密码
   ↓
4. JwtUtil.generateToken()
   ↓
5. 返回 JWT token 给前端
   ↓
6. 前端后续请求携带 token（Authorization: Bearer <token>）
   ↓
7. JwtAuthenticationFilter 拦截请求
   ↓
8. 验证 token 并提取用户 ID
   ↓
9. SecurityContextHolder.getContext().setAuthentication()
   ↓
10. 请求到达 Controller
   ↓
11. Controller 通过 SecurityUtils 获取当前用户 ID
```

### 6. 关键注解说明

| 注解 | 作用 | 使用位置 |
|------|------|----------|
| `@SpringBootApplication` | 标记为 Spring Boot 应用 | 应用入口类 |
| `@RestController` | 标记为 REST 控制器 | 控制器类 |
| `@RequestMapping` | 映射 HTTP 请求 | 类或方法 |
| `@GetMapping` | 映射 GET 请求 | 方法 |
| `@PostMapping` | 映射 POST 请求 | 方法 |
| `@PutMapping` | 映射 PUT 请求 | 方法 |
| `@DeleteMapping` | 映射 DELETE 请求 | 方法 |
| `@Service` | 标记为服务层组件 | 服务类 |
| `@Repository` | 标记为数据访问层组件 | 仓库接口 |
| `@Component` | 标记为 Spring 组件 | 任何类 |
| `@Autowired` | 自动注入依赖 | 字段/构造函数 |
| `@Entity` | 标记为 JPA 实体 | 实体类 |
| `@Table` | 指定数据库表名 | 实体类 |
| `@Column` | 映射数据库列 | 字段 |
| `@Id` | 标记主键 | 字段 |
| `@GeneratedValue` | 主键生成策略 | 主键字段 |
| `@RequestBody` | 绑定请求体到参数 | 方法参数 |
| `@PathVariable` | 绑定路径变量到参数 | 方法参数 |
| `@RequestParam` | 绑定请求参数到参数 | 方法参数 |
| `@Valid` | 触发参数验证 | 方法参数 |

### 7. 配置文件（application.properties）

```properties
# 服务器端口
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/todo_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=update  # 自动更新表结构
spring.jpa.show-sql=true              # 显示 SQL 语句
spring.jpa.properties.hibernate.format_sql=true  # 格式化 SQL

# JWT 配置
jwt.secret=your-secret-key-change-in-production
jwt.expiration=604800000  # 7天（毫秒）
```

## 学习建议

### 入门阶段（1-2 周）
1. 理解 Spring Boot 启动流程
2. 掌握依赖注入和 IoC 容器
3. 学习创建 REST API

### 进阶阶段（3-4 周）
1. 深入学习 Spring Data JPA
2. 理解 Spring Security 原理
3. 掌握 JWT 认证机制

### 实战阶段（5-6 周）
1. 实现完整的 CRUD 功能
2. 添加异常处理和验证
3. 编写单元测试和集成测试

### 扩展学习
1. Redis 缓存
2. 异步处理（@Async）
3. 消息队列（RabbitMQ/Kafka）
4. 微服务架构（Spring Cloud）

## 推荐资源

- **官方文档**：https://spring.io/guides
- **教程推荐**：
  - 尚硅谷 Spring Boot 教程（B站）
  - 黑马程序员 Spring Boot 教程
- **书籍**：
  - 《Spring Boot 实战》
  - 《深入理解 Spring Boot》

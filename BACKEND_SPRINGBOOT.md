# Todo Backend - Spring Boot (Java) 版本说明

## 📖 技术栈介绍

### Spring Boot 框架
- **语言**: Java 17+
- **框架**: Spring Boot 3.2.0
- **ORM**: Spring Data JPA (Hibernate)
- **数据库**: MySQL (MySQL Connector)
- **数据验证**: Jakarta Bean Validation
- **API 文档**: SpringDoc OpenAPI (Swagger)
- **构建工具**: Maven
- **端口**: 3002

### Spring Boot 优势
- 🏢 **���业级**: 成熟稳定的企业级开发框架
- 📦 **约定优于配置**: 减少配置，提高开发效率
- 🔧 **依赖注入**: 强大的 IoC 容器和依赖注入
- 🛡️ **安全性**: 内置安全框架和过滤器
- 📊 **生态系统**: 丰富的 Spring 家族组件
- 🚀 **生产就绪**: 监控、指标、健康检查开箱即用

## 🗂️ 项目结构

```
backend-java/
├── src/main/java/com/todo/app/
│   ├── entity/           # JPA 实体模型
│   │   ├── User.java
│   │   ├── Todo.java
│   │   ├── Category.java
│   │   └── SubTask.java
│   ├── repository/       # 数据访问层
│   │   ├── TodoRepository.java
│   │   ├── SubTaskRepository.java
│   │   └── CategoryRepository.java
│   ├── service/          # 业务逻辑层
│   │   ├── TodoService.java
│   │   └── CategoryService.java
│   ├── controller/       # 控制器层
│   │   ├── HomeController.java
│   │   ├── TodoController.java
│   │   └── CategoryController.java
│   ├── dto/              # 数据传输对象
│   │   ├── TodoDTO.java
│   │   ├── TodoUpdateDTO.java
│   │   ├── SubTaskDTO.java
│   │   ├── CategoryDTO.java
│   │   └── StatisticsDTO.java
│   ├── config/           # 配置类
│   │   └── WebConfig.java
│   └── TodoBackendApplication.java  # 应用入口
├── src/main/resources/
│   ├── application.yml  # 应用配置
│   └── ...
├── pom.xml              # Maven 依赖配置
└── ...
```

## 🔌 API 端点说明

### 基础端点
- `GET /` - 欢迎信息
- `GET /health` - 健康检查
- `GET /swagger-ui.html` - Swagger UI 交互式文档
- `GET /api-docs` - OpenAPI JSON 规范

### 任务管理 (Todo)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/todos` | 创建任务（支持同时创建子任务） |
| GET | `/todos` | 获取所有任务（支持搜索和过滤） |
| GET | `/todos/statistics` | 获取统计数据 |
| GET | `/todos/:id` | 获取单个任务详情 |
| PATCH | `/todos/:id` | 更新任务 |
| PATCH | `/todos/:id/toggle` | 切换任务完成状态 |
| DELETE | `/todos/:id` | 删除任务 |
| DELETE | `/todos/batch` | 批量删除任务 |
| PATCH | `/todos/batch/update` | 批量更新任务状态 |

### 子任务管理 (SubTask)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/todos/:todoId/subtasks` | 为任务创建子任务 |
| PATCH | `/todos/subtasks/:subtaskId/toggle` | 切换子任务完成状态 |
| DELETE | `/todos/subtasks/:subtaskId` | 删除子任务 |

### 分类管理 (Category)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/categories` | 创建分类 |
| GET | `/categories` | 获取所有分类 |
| GET | `/categories/:id` | 获取单个分类 |
| PATCH | `/categories/:id` | 更新分类 |
| DELETE | `/categories/:id` | 删除分类 |

## 🎯 核心功能实现

### 1. 分层架构
```
Controller 层 → 处理 HTTP 请求
     ↓
Service 层   → 业务逻辑处理
     ↓
Repository 层 → 数据库访问
     ↓
Database     → 数据持久化
```

### 2. JPA 实体示例

```java
@Entity
@Table(name = "todos")
@Data
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoryId")
    private Category category;

    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubTask> subtasks = new ArrayList<>();

    // Getters and Setters (Lombok @Data)
}
```

### 3. Repository 接口

```java
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT t FROM Todo t WHERE t.userId = :userId " +
           "AND (:search IS NULL OR t.title LIKE %:search%) " +
           "ORDER BY t.createdAt DESC")
    List<Todo> findAllWithFilters(
        @Param("userId") Long userId,
        @Param("search") String search
    );
}
```

### 4. Service 层

```java
@Service
@RequiredArgsConstructor  // Lombok 生成构造函数
public class TodoService {

    private final TodoRepository todoRepository;
    private final SubTaskRepository subTaskRepository;

    @Transactional  // 事务管理
    public Todo createTodo(TodoCreateDTO dto) {
        Todo todo = new Todo();
        // 设置属性...
        todo = todoRepository.save(todo);

        // 创建子任务
        if (dto.getSubtasks() != null) {
            for (SubTaskCreateDTO subTaskDto : dto.getSubtasks()) {
                // 创建并保存子任务
            }
        }

        return todo;
    }
}
```

### 5. Controller 层

```java
@RestController
@RequestMapping("/todos")
@RequiredArgsConstructor
@Tag(name = "Todos", description = "Todo management APIs")
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    @Operation(summary = "Create a new todo")
    public ResponseEntity<Todo> createTodo(@Valid @RequestBody TodoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(todoService.createTodo(dto));
    }

    @GetMapping
    @Operation(summary = "Get all todos with filters")
    public ResponseEntity<List<Todo>> getAllTodos(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String priority
    ) {
        return ResponseEntity.ok(
            todoService.getAllTodos(search, priority, null, null)
        );
    }
}
```

## 🚀 启动命令

### 使用 Maven
```bash
cd backend-java

# 开发模式（支持热重载）
mvn spring-boot:run

# 打包
mvn clean package

# 运行 JAR
java -jar target/todo-backend-1.0.0.jar
```

### 使用启动脚本
```bash
./start-backend.sh
# 选择选项 3 启动 Spring Boot 后端
```

## 📊 数据库配置

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/todo_db
    username: root
    password:
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update  # 自动更新表结构
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

server:
  port: 3002
```

## 🛠️ Maven 依赖说明

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- MySQL Connector -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>

    <!-- SpringDoc OpenAPI (Swagger) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
</dependencies>
```

## 🎨 Lombok 注解说明

```java
@Data                 // 自动生成 getter/setter/toString/equals/hashCode
@RequiredArgsConstructor // 生成 final 字段的构造函数
@Entity               // JPA 实体标记
@Table(name = "todos") // 指定表名
@Service              // Service 层标记
@RestController        // Controller + @ResponseBody
@RequestBody          // 绑定请求体到 DTO
@PathVariable         // 路径参数绑定
@RequestParam         # 查询参数绑定
@Valid                // 触发 Bean Validation
@Transactional        // 事务管理
```

## 📝 DTO 和验证

### 请求 DTO
```java
@Data
public class TodoCreateDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description = "";

    private Todo.Priority priority = Todo.Priority.MEDIUM;

    private LocalDate dueDate;

    private Long categoryId;

    private List<SubTaskCreateDTO> subtasks;
}
```

### 响应 DTO
```java
@Data
public class StatisticsDTO {
    private Integer total;
    private Integer completed;
    private Integer pending;
    private Integer completionRate;
    private Map<String, Integer> priorityStats;
    private Integer overdueCount;
}
```

## ✨ Spring Boot 特性展示

### 1. 依赖注入
```java
@Service
@RequiredArgsConstructor  // Lombok 自动生成构造函数注入
public class TodoService {
    private final TodoRepository todoRepository;
    // Spring 自动注入依赖
}
```

### 2. 事务管理
```java
@Transactional  // 自动管理事务边界
public Todo createTodo(TodoCreateDTO dto) {
    // 多个数据库操作
    // 自动提交或回滚
}
```

### 3. 异常处理
```java
@GetMapping("/{id}")
public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(todoService.getTodoById(id));
    } catch (EntityNotFoundException e) {
        return ResponseEntity.notFound().build();
    }
}
```

### 4. JPQL 查询
```java
@Query("SELECT t FROM Todo t LEFT JOIN FETCH t.category " +
       "LEFT JOIN FETCH t.subtasks s WHERE t.id = :id")
Todo findByIdWithRelations(@Param("id") Long id);
```

## 🔍 代码示例

### 创建带子任务的任务
```java
TodoCreateDTO dto = new TodoCreateDTO();
dto.setTitle("完成项目报告");
dto.setPriority(Todo.Priority.HIGH);
dto.setCategoryId(1L);

List<SubTaskCreateDTO> subtasks = new ArrayList<>();
subtasks.add(new SubTaskCreateDTO("收集数据"));
subtasks.add(new SubTaskCreateDTO("制作图表"));
dto.setSubtasks(subtasks);

todoService.createTodo(dto);
```

### 批量操作
```java
// 批量删除
todoService.batchDeleteTodos(Arrays.asList(1L, 2L, 3L));

// 批量更新
todoService.batchUpdateTodos(ids, true);  // 全部标记为完成
```

## 📊 性能优化

- 🔄 **连接池**: HikariCP 高性能连接池
- 📈 **懒加载**: FetchType.LAZY 减少初始查询
- 🎯 **查询优化**: JPQL JOIN FETCH 减少查询次数
- 💾 **二级缓存**: 支持 Redis 集成
- ⚡ **异步处理**: 支持 @Async 异步方法调用

## 🏗️ 企业级特性

### 1. Actuator 监控
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 2. 安全性
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 3. 缓存
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

## 🔗 相关文档

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Spring Data JPA 文档](https://spring.io/projects/spring-data-jpa)
- [SpringDoc OpenAPI 文档](https://springdoc.org/)
- [Lombok 文档](https://projectlombok.org/)
- [Maven 文档](https://maven.apache.org/)

## 💡 最佳实践

1. **使用 Lombok**: 减少样板代码，提高可读性
2. **分层架构**: 严格的 Controller → Service → Repository 分层
3. **异常处理**: 使用 @ControllerAdvice 统一异常处理
4. **DTO 模式**: 使用 DTO 隔离实体模型和 API 层
5. **事务管理**: 在 Service 层使用 @Transactional
6. **验证**: 使用 Bean Validation 验证输入
7. **API 文档**: 充分利用 Swagger/OpenAPI 注解

## 📈 扩展方向

- 🔐 **Spring Security**: 添加 JWT 认证
- 📧 **邮件发送**: Spring Mail 集成
- 📊 **缓存**: Redis 集成
- 📝 **日志**: Logback 配置
- 🧪 **测试**: JUnit 5 + Mockito
- 📦 **Docker**: 容器化部署

---

**版本**: 1.0.0
**最后更新**: 2026-01-09

# NestJS 后端项目结构说明

## 项目概述

这是一个使用 **NestJS 11** 构建的 Todo REST API，采用模块化架构和装饰器模式。

## 目录结构

```
backend/
├── src/
│   ├── main.ts                                  # 应用程序入口
│   ├── app.module.ts                            # 根模块
│   │
│   ├── auth/                                    # 认证模块
│   │   ├── auth.controller.ts                   # 认证控制器
│   │   ├── auth.service.ts                      # 认证服务
│   │   ├── auth.module.ts                       # 认证模块定义
│   │   ├── strategies/                          # Passport 策略
│   │   │   ├── local.strategy.ts                # 本地策略（用户名密码）
│   │   │   └── jwt.strategy.ts                  # JWT 策略
│   │   ├── guards/                              # 守卫
│   │   │   └── jwt-auth.guard.ts                # JWT 认证守卫
│   │   ├── decorators/                          # 自定义装饰器
│   │   │   ├── public.decorator.ts              # 公开路由装饰器
│   │   │   └── current-user.decorator.ts        # 当前用户装饰器
│   │   ├── dto/                                 # 数据传输对象
│   │   │   ├── login.dto.ts                     # 登录 DTO
│   │   │   └── register.dto.ts                  # 注册 DTO
│   │   └── interfaces/                          # 接口定义
│   │       └── jwt-payload.interface.ts         # JWT 载荷接口
│   │
│   ├── todo/                                    # Todo 模块
│   │   ├── todo.controller.ts                   # Todo 控制器
│   │   ├── todo.service.ts                      # Todo 服务
│   │   ├── todo.module.ts                       # Todo 模块定义
│   │   ├── entities/                            # 实体
│   │   │   ├── todo.entity.ts                   # Todo 实体
│   │   │   └── subtask.entity.ts                # 子任务实体
│   │   └── dto/                                 # DTO
│   │       ├── create-todo.dto.ts               # 创建 Todo DTO
│   │       └── update-todo.dto.ts               # 更新 Todo DTO
│   │
│   ├── category/                                # 分类模块
│   │   ├── category.controller.ts               # 分类控制器
│   │   ├── category.service.ts                  # 分类服务
│   │   ├── category.module.ts                   # 分类模块定义
│   │   ├── entities/
│   │   │   └── category.entity.ts               # 分类实体
│   │   └── dto/
│   │       ├── create-category.dto.ts           # 创建分类 DTO
│   │       └── update-category.dto.ts           # 更新分类 DTO
│   │
│   └── user/                                    # 用户模块
│       ├── entities/
│       │   └── user.entity.ts                   # 用户实体
│       └── (其他用户相关文件...)
│
├── test/                                        # 测试文件
│   ├── app.e2e-spec.ts                          # E2E 测试
│   └── jest.config.js                           # Jest 配置
│
├── .env                                         # 环境变量
├── nest-cli.json                                # Nest CLI 配置
├── tsconfig.json                                # TypeScript 配置
├── package.json                                 # 项目依赖
└── README.md
```

## 核心概念详解

### 1. 模块化架构（Modular Architecture）

NestJS 的核心是模块系统，每个功能都是一个独立的模块。

**模块结构：**

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Todo])],  // 导入其他模块
  controllers: [TodoController],                // 声明控制器
  providers: [TodoService],                     // 声明服务提供者
  exports: [TodoService],                       # 导出服务（供其他模块使用）
})
export class TodoModule {}
```

**模块依赖图：**

```
┌─────────────────────────────────────┐
│        AppModule（根模块）           │
│   - 导入 AuthModule                 │
│   - 导入 TodoModule                 │
│   - 导入 CategoryModule             │
└─────────────────────────────────────┘
           ↓        ↓         ↓
    ┌────────┐  ┌─────┐  ┌──────────┐
    │  Auth  │  │Todo │  │Category  │
    └────────┘  └─────┘  └──────────┘
```

### 2. 装饰器（Decorators）

NestJS 大量使用装饰器来声明元数据。

**常用装饰器：**

| 装饰器 | 作用 | 使用位置 |
|--------|------|----------|
| `@Controller()` | 标记为控制器类 | 类 |
| `@Get()` | 声明 GET 路由 | 方法 |
| `@Post()` | 声明 POST 路由 | 方法 |
| `@Put()` | 声明 PUT 路由 | 方法 |
| `@Delete()` | 声明 DELETE 路由 | 方法 |
| `@Param()` | 获取路由参数 | 方法参数 |
| `@Query()` | 获取查询参数 | 方法参数 |
| `@Body()` | 获取请求体 | 方法参数 |
| `@Req()` | 获取请求对象 | 方法参数 |
| `@Res()` | 获取响应对象 | 方法参数 |
| `@Injectable()` | 标记为可注入的服务 | 类 |
| `@Inject()` | 手动注入依赖 | 构造函数参数 |
| `@UseGuards()` | 使用守卫 | 类或方法 |
| `@SetMetadata()` | 设置元数据 | 类或方法 |

**装饰器示例：**

```typescript
@Controller('todos')  // 路由前缀：/todos
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()  // GET /todos
  findAll(@Query('search') search?: string) {
    return this.todoService.findAll(search);
  }

  @Get(':id')  // GET /todos/:id
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(+id);
  }

  @Post()  // POST /todos
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }
}
```

### 3. 依赖注入（Dependency Injection）

NestJS 使用 TypeScript 的装饰器和元数据实现依赖注入。

**示例：**

```typescript
@Injectable()  // 标记为可注入的服务
export class TodoService {
  constructor(
    @InjectRepository(Todo)  // 注入 TypeORM 仓库
    private todoRepository: Repository<Todo>,
  ) {}

  findAll() {
    return this.todoRepository.find();
  }
}

// 控制器中自动注入
@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}
  // NestJS 自动创建 TodoService 实例并注入
}
```

**提供者注册：**

```typescript
@Module({
  providers: [
    TodoService,  // 简写形式（等同于 { provide: TodoService, useClass: TodoService }）

    // 自定义提供者
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        return await createConnection();
      },
    },
  ],
})
export class TodoModule {}
```

### 4. 守卫（Guards）

守卫用于保护路由，决定请求是否可以继续。

**示例：**

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;  // 附加用户信息到请求
      return true;
    } catch {
      return false;
    }
  }
}

// 使用守卫
@Controller('todos')
@UseGuards(JwtAuthGuard)  # 保护整个控制器
export class TodoController {}

// 或单独保护某个路由
@Get('public')
@UseGuards(JwtAuthGuard)
findAll() {}
```

### 5. TypeORM 集成

TypeORM 是一个 ORM 框架，将 TypeScript 类映射到数据库表。

**实体定义：**

```typescript
@Entity('todos')  // 映射到 todos 表
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @ManyToOne(() => User, user => user.todos)
  user: User;

  @OneToMany(() => SubTask, subtask => subtask.todo, { cascade: true })
  subtasks: SubTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**关系映射：**
- `@ManyToOne`：多对一
- `@OneToMany`：一对多
- `@ManyToMany`：多对多
- `@OneToOne`：一对一

### 6. DTO 和验证

使用 class-validator 进行数据验证。

**DTO 示例：**

```typescript
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubTaskDto)
  subtasks?: CreateSubTaskDto[];
}

// 控制器中使用
@Post()
create(@Body() createTodoDto: CreateTodoDto) {
  return this.todoService.create(createTodoDto);
}
```

### 7. 中间件、拦截器和管道

**中间件（Middleware）：**

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}

// 应用中间件
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

**拦截器（Interceptor）：**

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
```

**管道（Pipe）：**

```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
```

### 8. Passport 策略

Passport 是认证中间件，NestJS 通过 PassportStrategy 集成。

**JWT 策略：**

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }
}
```

### 9. 异常过滤器

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 10. 配置管理

```typescript
// 使用 @nestjs/config
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}

// 使用配置
@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async login() {
    const secret = this.configService.get('JWT_SECRET');
    // ...
  }
}
```

## 学习建议

### 入门阶段（1-2 周）
1. 理解 NestJS 的模块化架构
2. 掌握装饰器的使用
3. 学习创建 REST API

### 进阶阶段（3-4 周）
1. 深入学习依赖注入
2. 理解守卫、拦截器、管道
3. 掌握 TypeORM 和数据库操作

### 实战阶段（5-6 周）
1. 实现完整的 CRUD 功能
2. 添加认证和授权
3. 编写单元测试和 E2E 测试

### 扩展学习
1. WebSockets 实时通信
2. 微服务架构
3. GraphQL API
4. 任务队列（Bull）

## 推荐资源

- **官方文档**：https://docs.nestjs.com
- **教程推荐**：
  - NestJS 官方课程
  - Traversy Media NestJS 教程
- **书籍**：
  - 《NestJS 快速上手》

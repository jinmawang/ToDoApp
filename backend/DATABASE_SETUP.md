# 数据库配置说明

## 重要提示

项目已从内存数组存储改为使用 TypeORM + MySQL 数据库存储。在启动项目前，您需要：

1. **安装并启动 MySQL 数据库**
2. **创建数据库**
3. **修改数据库连接配置**

---

## 步骤 1：安装 MySQL

### macOS

```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL 服务
brew services start mysql
```

### Windows

下载并安装 MySQL：https://dev.mysql.com/downloads/mysql/

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

## 步骤 2：创建数据库

登录 MySQL 并创建数据库：

```bash
# 登录 MySQL（首次登录可能没有密码，直接回车）
mysql -u root -p

# 在 MySQL 命令行中执行
CREATE DATABASE todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
exit;
```

---

## 步骤 3：修改数据库连接配置

打开 `backend/src/app.module.ts`，修改以下配置：

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',        // 数据库主机（通常是 localhost）
  port: 3306,              // MySQL 端口（默认 3306）
  username: 'root',        // 数据库用户名
  password: 'your_password', // ⚠️ 修改为您的 MySQL 密码
  database: 'todo_db',     // 数据库名称
  entities: [Todo],
  synchronize: true,       // ⚠️ 开发环境为 true，生产环境必须为 false
}),
```

### 推荐：使用环境变量（更安全）

1. 安装 `@nestjs/config`：

```bash
npm install @nestjs/config
```

2. 创建 `.env` 文件（在 `backend` 目录下）：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=todo_db
```

3. 修改 `app.module.ts`：

```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // 加载 .env 文件
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Todo],
      synchronize: process.env.NODE_ENV !== 'production', // 生产环境为 false
    }),
    TodoModule,
  ],
})
export class AppModule {}
```

---

## 步骤 4：启动项目

```bash
cd backend
npm run start:dev
```

如果配置正确，您会看到：

- TypeORM 自动创建 `todos` 表
- 服务在 `http://localhost:3000` 启动

---

## 验证数据库连接

### 方式 1：查看日志

启动时如果没有错误，说明连接成功。

### 方式 2：查看数据库

```bash
mysql -u root -p

USE todo_db;
SHOW TABLES;  # 应该能看到 todos 表
DESCRIBE todos;  # 查看表结构
```

---

## 常见问题

### 1. 连接被拒绝 (ECONNREFUSED)

- 检查 MySQL 服务是否启动
- 检查 `host` 和 `port` 是否正确

### 2. 认证失败 (Access denied)

- 检查 `username` 和 `password` 是否正确
- 确认 MySQL 用户有访问 `todo_db` 数据库的权限

### 3. 数据库不存在 (Unknown database)

- 确认已创建 `todo_db` 数据库
- 检查 `database` 配置是否正确

### 4. synchronize 警告

- **开发环境**：`synchronize: true` 可以自动创建/更新表结构
- **生产环境**：必须设置为 `false`，使用迁移（Migration）管理表结构

---

## 下一步

数据库配置完成后，您的 Todo 数据将：

- ✅ 持久化保存（服务重启后仍在）
- ✅ 支持并发操作
- ✅ 可以使用 SQL 查询

享受使用数据库的便利吧！🎉

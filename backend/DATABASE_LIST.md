# MySQL 数据库列表说明

## 当前数据库列表

您的 MySQL（3306端口）中共有 **5 个数据库**：

| 数据库名称           | 大小    | 用途说明                     |
| -------------------- | ------- | ---------------------------- |
| `information_schema` | 0.00 MB | 系统数据库（只读）           |
| `mysql`              | 2.61 MB | MySQL 系统数据库             |
| `performance_schema` | 0.00 MB | 性能监控数据库               |
| `sys`                | 0.02 MB | 系统数据库（视图和存储过程） |
| `todo_db`            | 0.02 MB | **您的项目数据库**           |

---

## 详细说明

### 1. `information_schema` - 信息模式数据库

**作用**：

- MySQL 的**元数据数据库**（只读）
- 存储所有数据库、表、列、索引等结构信息
- 用于查询数据库结构，不能直接修改

**包含内容**：

- 所有数据库的列表
- 所有表的结构信息
- 所有列的详细信息
- 索引、约束、权限等信息

**示例查询**：

```sql
-- 查看所有数据库
SELECT * FROM information_schema.SCHEMATA;

-- 查看所有表
SELECT * FROM information_schema.TABLES;

-- 查看 todos 表的结构
SELECT * FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'todo_db' AND TABLE_NAME = 'todos';
```

**⚠️ 注意**：这是系统数据库，不要删除或修改！

---

### 2. `mysql` - MySQL 系统数据库

**作用**：

- MySQL 的**核心系统数据库**
- 存储用户账户、权限、密码等信息
- 存储系统配置和日志

**包含内容**：

- `user` 表：所有 MySQL 用户账户
- `db` 表：数据库级别的权限
- `tables_priv` 表：表级别的权限
- `columns_priv` 表：列级别的权限
- 其他系统表

**示例查询**：

```sql
-- 查看所有用户
SELECT user, host FROM mysql.user;

-- 查看用户权限
SHOW GRANTS FOR 'root'@'localhost';
```

**⚠️ 注意**：这是系统数据库，不要随意修改！修改错误可能导致无法登录 MySQL。

---

### 3. `performance_schema` - 性能监控数据库

**作用**：

- MySQL 的**性能监控数据库**
- 收集服务器性能数据
- 用于性能分析和优化

**包含内容**：

- 查询执行统计
- 连接统计
- 锁等待信息
- 文件 I/O 统计
- 内存使用情况

**用途**：

- 分析慢查询
- 监控数据库性能
- 优化数据库配置

**⚠️ 注意**：这是系统数据库，通常不需要手动操作。

---

### 4. `sys` - 系统数据库

**作用**：

- MySQL 的**系统视图和存储过程数据库**
- 提供便捷的视图来查看系统信息
- 简化性能监控查询

**包含内容**：

- 各种系统视图（如 `schema_table_statistics`）
- 存储过程（如 `ps_setup_enable_instrument`）
- 函数

**用途**：

- 快速查看数据库统计信息
- 性能分析
- 系统诊断

**示例查询**：

```sql
-- 查看表统计信息
SELECT * FROM sys.schema_table_statistics
WHERE table_schema = 'todo_db';
```

**⚠️ 注意**：这是系统数据库，不要删除！

---

### 5. `todo_db` - 您的项目数据库 ⭐

**作用**：

- **您的 Todo List 项目的业务数据库**
- 存储所有 Todo 数据
- 这是您创建和使用的数据库

**包含内容**：

- `todos` 表：存储所有待办事项
  - `id`：主键，自增
  - `title`：Todo 标题
  - `isCompleted`：完成状态（0/1）

**数据示例**：

```sql
SELECT * FROM todos;
```

**当前数据**：

- 您通过前端创建的 Todo 数据都存储在这里
- 数据会持久化保存，服务重启后仍在

**✅ 这是您可以自由操作的数据库！**

---

## 总结

### 系统数据库（4个，不要删除）

1. **`information_schema`** - 元数据信息（只读）
2. **`mysql`** - 用户和权限管理
3. **`performance_schema`** - 性能监控
4. **`sys`** - 系统视图和存储过程

### 业务数据库（1个，您的项目）

5. **`todo_db`** - Todo List 项目数据库 ⭐

---

## 操作建议

### ✅ 可以操作

- `todo_db` - 您的项目数据库，可以自由增删改查

### ⚠️ 谨慎操作

- `mysql` - 如果需要修改用户权限，需要谨慎操作
- `sys` - 可以查询，但不要修改

### ❌ 不要操作

- `information_schema` - 只读，无法修改
- `performance_schema` - 系统自动管理

---

## 查看数据库详细信息

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 查看数据库大小
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
GROUP BY table_schema;

-- 查看 todo_db 中的所有表
USE todo_db;
SHOW TABLES;

-- 查看 todos 表结构
DESCRIBE todos;
```

---

## 注意事项

1. **系统数据库不要删除**：`information_schema`、`mysql`、`performance_schema`、`sys` 是 MySQL 必需的
2. **只操作业务数据库**：只对 `todo_db` 进行增删改查操作
3. **备份重要数据**：定期备份 `todo_db` 数据库
4. **权限管理**：如果需要创建新用户，使用 `mysql` 数据库

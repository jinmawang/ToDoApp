# Navicat Premium Lite 连接配置指南

## 安装完成 ✅

Navicat Premium Lite 已成功安装到您的 Mac。

---

## 连接 MySQL 数据库步骤

### 1. 打开 Navicat Premium Lite

- 在应用程序中找到 "Navicat Premium Lite"
- 或使用 Spotlight 搜索 "Navicat"

### 2. 创建新连接

1. 点击左上角的 **"连接"** 按钮
2. 选择 **"MySQL"**

### 3. 填写连接信息

根据您的项目配置，填写以下信息：

```
连接名：本地 MySQL（可以自定义）
主机名或 IP 地址：localhost
端口：3306
用户名：root
密码：（留空，因为您的 MySQL 没有设置密码）
```

**重要**：如果密码留空，确保取消勾选 "保存密码" 或直接留空即可。

### 4. 测试连接

1. 点击 **"测试连接"** 按钮
2. 如果显示 "连接成功"，说明配置正确

### 5. 选择数据库

1. 在连接配置中，点击 **"数据库"** 下拉框
2. 选择 **`todo_db`**（这是您的项目数据库）

### 6. 保存并连接

1. 点击 **"确定"** 保存连接配置
2. 双击连接名称，连接到数据库

---

## 连接信息总结

```
连接类型：MySQL
主机：localhost
端口：3306
用户名：root
密码：（空）
数据库：todo_db
```

---

## 使用 Navicat 查看数据

### 查看 todos 表

1. 连接成功后，在左侧展开连接
2. 展开 `todo_db` 数据库
3. 展开 "表"
4. 双击 `todos` 表，即可查看所有数据

### 编辑数据

- **直接编辑**：在表格视图中直接双击单元格修改数据
- **添加行**：点击工具栏的 "+" 按钮添加新行
- **删除行**：选中行，按 Delete 键或右键删除

### 执行 SQL

1. 点击工具栏的 **"查询"** 按钮（或按 `Cmd + Q`）
2. 在 SQL 编辑器中输入 SQL 语句，例如：
   ```sql
   SELECT * FROM todos WHERE isCompleted = 0;
   ```
3. 点击 **"运行"** 按钮（或按 `Cmd + R`）执行

---

## 常用操作

### 查看表结构

1. 右键点击 `todos` 表
2. 选择 **"设计表"**
3. 可以查看字段、类型、约束等信息

### 导出数据

1. 右键点击 `todos` 表
2. 选择 **"导出向导"**
3. 选择导出格式（CSV、Excel、SQL 等）

### 导入数据

1. 右键点击 `todos` 表
2. 选择 **"导入向导"**
3. 选择数据源文件导入

---

## 常见问题

### 1. 连接失败：Access denied

**原因**：密码错误或用户权限问题

**解决**：

- 确认密码是否正确（您的 MySQL 密码为空）
- 检查 MySQL 服务是否运行：`brew services list | grep mysql`

### 2. 连接失败：Can't connect to MySQL server

**原因**：MySQL 服务未启动

**解决**：

```bash
brew services start mysql
```

### 3. 找不到数据库

**原因**：数据库未创建

**解决**：

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todo_db;"
```

### 4. 表不存在

**原因**：TypeORM 的 `synchronize` 未启用或表未创建

**解决**：

- 确认 `backend/src/app.module.ts` 中 `synchronize: true`
- 重启后端服务，TypeORM 会自动创建表

---

## 提示

- Navicat Premium Lite 是免费版本，功能可能有限制
- 如果需要更多功能，可以考虑升级到付费版本
- 对于您的 Todo List 项目，Lite 版本完全够用

---

## 快速开始

1. 打开 Navicat Premium Lite
2. 创建 MySQL 连接（使用上面的配置信息）
3. 连接到 `todo_db` 数据库
4. 查看 `todos` 表的数据

现在您可以可视化地管理数据库了！🎉

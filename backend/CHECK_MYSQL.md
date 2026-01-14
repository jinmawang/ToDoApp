# 检查 MySQL 服务是否启动

## macOS 系统

### 方法 1：检查进程
```bash
ps aux | grep mysql | grep -v grep
```
如果看到 `mysqld` 进程，说明 MySQL 正在运行。

### 方法 2：检查端口
```bash
lsof -i :3306
```
如果看到 `mysqld` 监听 3306 端口，说明 MySQL 正在运行。

### 方法 3：使用 Homebrew（如果通过 Homebrew 安装）
```bash
brew services list | grep mysql
```
如果看到 `started` 状态，说明 MySQL 正在运行。

### 方法 4：尝试连接（最直接）
```bash
mysql -u root -p
```
如果能成功连接并提示输入密码，说明 MySQL 正在运行。

---

## Linux 系统

### 方法 1：检查服务状态
```bash
# Ubuntu/Debian
sudo systemctl status mysql

# CentOS/RHEL
sudo systemctl status mysqld
```

### 方法 2：检查进程
```bash
ps aux | grep mysql | grep -v grep
```

### 方法 3：检查端口
```bash
sudo netstat -tlnp | grep 3306
# 或
sudo ss -tlnp | grep 3306
```

---

## Windows 系统

### 方法 1：检查服务
1. 按 `Win + R`，输入 `services.msc`，回车
2. 查找 "MySQL" 服务
3. 查看状态是否为 "正在运行"

### 方法 2：使用命令行
```cmd
sc query MySQL
```
或
```cmd
net start | findstr MySQL
```

---

## 如果 MySQL 未启动，如何启动？

### macOS（Homebrew）
```bash
brew services start mysql
```

### macOS（手动安装）
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

### Linux（Ubuntu/Debian）
```bash
sudo systemctl start mysql
```

### Linux（CentOS/RHEL）
```bash
sudo systemctl start mysqld
```

### Windows
```cmd
net start MySQL
```
或在服务管理器中右键点击 MySQL 服务，选择"启动"。

---

## 如果 MySQL 未安装，如何安装？

### macOS
```bash
# 使用 Homebrew（推荐）
brew install mysql
brew services start mysql

# 或下载官方安装包
# https://dev.mysql.com/downloads/mysql/
```

### Linux（Ubuntu/Debian）
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql  # 设置开机自启
```

### Windows
1. 访问 https://dev.mysql.com/downloads/mysql/
2. 下载 Windows 安装程序
3. 运行安装程序，按提示完成安装

---

## 快速测试连接

最简单的方法就是尝试连接：

```bash
mysql -u root -p
```

如果提示输入密码，说明 MySQL 正在运行。
如果提示 "command not found"，说明 MySQL 未安装或不在 PATH 中。
如果提示 "Can't connect to MySQL server"，说明 MySQL 未启动。


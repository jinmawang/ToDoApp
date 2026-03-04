# Todo 应用腾讯云部署指南

> 本文档详细介绍如何将 Todo 应用（Vue 3 前端 + Spring Boot 后端）部署到腾讯云轻量应用服务器。适合前端开发者阅读，每个步骤都有详细解释。

## 目录

- [一、整体架构](#一整体架构)
- [二、准备工作](#二准备工作)
- [三、服务器初始化](#三服务器初始化)
- [四、上传代码到服务器](#四上传代码到服务器)
- [五、后端部署](#五后端部署)
- [六、前端部署](#六前端部署)
- [七、Nginx 配置](#七nginx-配置)
- [八、SSL 证书配置](#八ssl-证书配置)
- [九、数据库管理](#九数据库管理)
- [十、日常运维命令](#十日常运维命令)
- [十一、常见问题排查](#十一常见问题排查)

---

## 一、整体架构

### 1.1 架构图

```
用户浏览器
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    腾讯云服务器                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   Nginx (端口 80/443)             │   │
│  │  - 静态文件服务 (前端)                             │   │
│  │  - 反向代理 (后端 API)                            │   │
│  │  - SSL 终止 (HTTPS)                              │   │
│  └──────────────┬────────────────┬─────────────────┘   │
│                 │                │                      │
│    静态文件请求   │     API 请求    │                      │
│                 ▼                ▼                      │
│  ┌──────────────────┐  ┌─────────────────────────┐     │
│  │  前端静态文件      │  │  Docker 容器             │     │
│  │  /var/www/html   │  │  ┌───────────────────┐  │     │
│  │                  │  │  │ Spring Boot 后端   │  │     │
│  │  - index.html    │  │  │ (端口 3002)        │  │     │
│  │  - CSS/JS 文件    │  │  └─────────┬─────────┘  │     │
│  └──────────────────┘  │            │            │     │
│                        │  ┌─────────▼─────────┐  │     │
│                        │  │     MySQL 8.0     │  │     │
│                        │  │   (端口 3306)      │  │     │
│                        │  └───────────────────┘  │     │
│                        └─────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 1.2 为什么是这样的架构？

| 组件 | 作用 | 为什么需要 |
|------|------|-----------|
| **Nginx** | Web 服务器 + 反向代理 | 1. 高效处理静态文件（前端）<br>2. 将 API 请求转发给后端<br>3. 处理 HTTPS 加密 |
| **Docker** | 容器化运行环境 | 1. 隔离应用环境，不影响宿主机<br>2. 便于部署和迁移<br>3. 统一开发/生产环境 |
| **Spring Boot** | 后端服务 | 处理业务逻辑、数据库操作、用户认证 |
| **MySQL** | 数据库 | 持久化存储用户数据、Todo 数据 |

### 1.3 请求流程示例

```
1. 用户访问 https://tianma.chat
   └─→ Nginx 返回 index.html（前端页面）

2. 前端 JS 发起 API 请求 https://api.tianma.chat/api/todos
   └─→ Nginx 收到请求
       └─→ 反向代理到 http://127.0.0.1:3002/api/todos
           └─→ Spring Boot 处理请求
               └─→ 查询 MySQL 数据库
                   └─→ 返回 JSON 数据
```

---

## 二、准备工作

### 2.1 本地环境要求

```bash
# ---------- 在本地电脑执行 ----------
# 检查 Node.js（用于前端构建）
node -v  # 需要 v18+

# 检查 Git
git -v
```

### 2.2 购买腾讯云服务器

1. 访问 [腾讯云轻量应用服务器](https://cloud.tencent.com/product/lighthouse)
2. 选择配置：
   - **地域**：选择离用户近的（如上海、广州）
   - **镜像**：Ubuntu 22.04 LTS
   - **套餐**：2核4G 以上（Java 比较吃内存）
3. 记录服务器信息：
   - 公网 IP：`111.231.24.51`（示例）
   - 用户名：`ubuntu`
   - 密码：`你设置的密码`

### 2.3 域名准备（可选但推荐）

1. 购买域名（如 `tianma.chat`）
2. 添加 DNS 解析：
   ```
   A 记录：@     → 111.231.24.51（指向服务器IP）
   A 记录：api   → 111.231.24.51（API子域名）
   ```
3. 域名备案（国内服务器必须）

### 2.4 安全组配置

> **什么是安全组？** 相当于服务器的防火墙，控制哪些端口可以被外部访问。

在腾讯云控制台 → 轻量应用服务器 → 防火墙，开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH 远程连接 |
| 80 | TCP | HTTP 网站访问 |
| 443 | TCP | HTTPS 网站访问 |

**注意**：3002（后端）和 3306（数据库）端口**不要**对外开放，它们只在服务器内部使用。

---

## 三、服务器初始化

### 3.1 连接服务器

```bash
# ---------- 在本地电脑执行 ----------
# 从本地电脑连接服务器
ssh ubuntu@111.231.24.51

# 输入密码后进入服务器
```

> **SSH 是什么？** Secure Shell，一种加密的远程连接协议，让你可以在本地终端操作远程服务器。

### 3.2 安装 Docker

> **Docker 是什么？** 一种容器技术，可以把应用和它的依赖打包在一起，确保在任何环境都能一致运行。就像"集装箱"，把货物（应用）装进去，运到哪里都能用。

```bash
# ---------- 在服务器上执行（通过 SSH 连接后） ----------
# 更新软件包列表
sudo apt update

# 安装必要的依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 软件源
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER

# 重新登录使生效
exit
ssh ubuntu@111.231.24.51

# 验证安装
docker --version
docker compose version
```

### 3.3 安装 Nginx

> **Nginx 是什么？** 高性能的 Web 服务器，可以：
> 1. 直接返回静态文件（HTML/CSS/JS）
> 2. 作为反向代理，把请求转发给后端服务
> 3. 处理 HTTPS 加密

```bash
# ---------- 在服务器上执行 ----------
# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx  # 开机自启

# 验证
curl http://localhost
# 应该看到 "Welcome to nginx!" 页面
```

### 3.4 创建项目目录

```bash
# ---------- 在服务器上执行 ----------
# 创建项目目录
sudo mkdir -p /home/ubuntu/tianma/ToDoApp
sudo chown -R ubuntu:ubuntu /home/ubuntu/tianma

# 目录结构说明
/home/ubuntu/tianma/ToDoApp/
├── frontend/          # 前端源码
├── backend-java/      # 后端源码
└── docker/            # Docker 配置文件
    ├── docker-compose.yml
    ├── Dockerfile.backend
    └── .env           # 环境变量（密码等敏感信息）
```

---

## 四、上传代码到服务器

### 4.1 方法一：Git 克隆（推荐）

```bash
# 在服务器上执行
cd /home/ubuntu/tianma
git clone https://github.com/jinmawang/ToDoApp.git

# 如果是私有仓库，需要配置 Git 凭据
git config --global credential.helper store
```

### 4.2 方法二：SCP 上传

> **SCP 是什么？** Secure Copy，基于 SSH 的文件传输命令。

```bash
# 在本地电脑执行（不是服务器）
# 上传整个项目（首次部署时使用）
scp -r ~/Documents/hhCode/nestjs ubuntu@111.231.24.51:/home/ubuntu/tianma/ToDoApp

# 上传单个文件
scp /本地路径/文件名 ubuntu@111.231.24.51:/远程路径/
```

### 4.3 方法三：SFTP 工具

使用图形化工具如 FileZilla、Cyberduck：
1. 连接类型：SFTP
2. 主机：111.231.24.51
3. 用户名：ubuntu
4. 密码：你的密码
5. 端口：22

---

## 五、后端部署

### 5.1 理解 Docker Compose

> **Docker Compose 是什么？** 用于定义和运行多个 Docker 容器的工具。通过一个 YAML 文件描述所有服务，一条命令启动全部。

项目的 `docker/docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  # MySQL 数据库服务
  mysql:
    image: mysql:8.0                    # 使用官方 MySQL 8.0 镜像
    container_name: tianma-mysql        # 容器名称
    restart: unless-stopped             # 除非手动停止，否则自动重启
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}  # 从 .env 文件读取密码
      MYSQL_DATABASE: todo_db           # 自动创建的数据库名
    volumes:
      - mysql_data:/var/lib/mysql       # 数据持久化（容器删除数据不丢失）
    ports:
      - "127.0.0.1:3306:3306"          # 只允许本机访问，不对外暴露
    healthcheck:                        # 健康检查
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Spring Boot 后端服务
  backend:
    build:
      context: ..                       # 构建上下文（项目根目录）
      dockerfile: docker/Dockerfile.backend
    container_name: tianma-backend
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy      # 等 MySQL 健康后再启动
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/todo_db
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "127.0.0.1:3002:3002"          # 只允许本机访问

volumes:
  mysql_data:                           # 命名卷，数据持久化
```

#### 端口映射详解

> 初学者常见疑问：`"127.0.0.1:3306:3306"` 是什么意思？左边和右边的端口有什么区别？

**格式**：`主机IP:主机端口:容器端口`

```
┌─────────────────────────────────────────────────────────────────────┐
│                           腾讯云服务器                                │
│                                                                     │
│   外部网络 (用户浏览器)                                               │
│        │                                                            │
│        ✗ 无法访问 127.0.0.1:3306（被 127.0.0.1 限制了）               │
│        ✗ 无法访问 127.0.0.1:3002（被 127.0.0.1 限制了）               │
│                                                                     │
│   ─────────────────────────────────────────────────────────────     │
│                                                                     │
│   服务器本机 (127.0.0.1)                                             │
│        │                                                            │
│        ├─→ 3306 端口 ←──映射──→ MySQL 容器内的 3306                  │
│        │                                                            │
│        └─→ 3002 端口 ←──映射──→ Backend 容器内的 3002                │
│                                                                     │
│   ─────────────────────────────────────────────────────────────     │
│                                                                     │
│   ┌─────────────────────┐      ┌─────────────────────┐             │
│   │   MySQL 容器         │      │   Backend 容器       │             │
│   │                     │      │                     │             │
│   │  MySQL 进程监听      │      │  Java 进程监听       │             │
│   │  容器内 3306 端口    │      │  容器内 3002 端口    │             │
│   │  (容器端口-右边)     │      │  (容器端口-右边)     │             │
│   └─────────────────────┘      └─────────────────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**端口映射的意义**：

| 配置 | 含义 |
|------|------|
| `127.0.0.1` | 只绑定到本机回环地址，外部网络无法访问 |
| 左边的 `3306` | 服务器（宿主机）上的端口 |
| 右边的 `3306` | 容器内部的端口 |

**为什么需要端口映射？**

Docker 容器有自己独立的网络空间，容器内的端口默认外部访问不到：

```bash
# 没有端口映射时：
# 容器内 MySQL 监听 3306，但服务器上执行以下命令会失败
mysql -h 127.0.0.1 -P 3306  # ❌ 连接被拒绝

# 有了端口映射 "127.0.0.1:3306:3306" 后：
mysql -h 127.0.0.1 -P 3306  # ✅ 可以连接
```

**为什么用 127.0.0.1 而不是 0.0.0.0？**

| 绑定地址 | 效果 | 安全性 |
|---------|------|--------|
| `127.0.0.1:3306:3306` | 只有服务器本机能访问 | ✅ 安全，数据库不暴露到公网 |
| `0.0.0.0:3306:3306` | 任何人都能访问 | ❌ 危险，数据库暴露到公网 |
| `3306:3306` | 等同于 0.0.0.0 | ❌ 危险 |

**Nginx 如何访问后端？**

Nginx 运行在服务器上（不在容器内），它通过 `127.0.0.1:3002` 访问后端容器：

```nginx
location / {
    proxy_pass http://127.0.0.1:3002;  # 访问服务器的 3002 端口
    # 这个请求会被转发到 Backend 容器内的 3002 端口
}
```

### 5.2 理解 Dockerfile

> **Dockerfile 是什么？** 描述如何构建 Docker 镜像的脚本。就像"菜谱"，告诉 Docker 一步步怎么做。

`docker/Dockerfile.backend` 文件：

```dockerfile
# === 第一阶段：构建 ===
FROM maven:3.9-eclipse-temurin-17 AS builder
# 使用带有 Maven 和 JDK 17 的基础镜像

WORKDIR /app
# 设置工作目录

COPY backend-java/pom.xml .
# 先复制 pom.xml（Maven 配置文件）

RUN mvn dependency:go-offline -B
# 下载所有依赖（利用 Docker 缓存，依赖不变时不重复下载）

COPY backend-java/src ./src
# 复制源代码

RUN mvn clean package -DskipTests
# 编译打包，跳过测试（生成 .jar 文件）

# === 第二阶段：运行 ===
FROM eclipse-temurin:17-jre-alpine
# 使用更小的 JRE 镜像（只需运行，不需编译）

WORKDIR /app

# 创建非 root 用户（安全最佳实践）
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -D appuser

# 从构建阶段复制 jar 文件
COPY --from=builder /app/target/*.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3002

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **为什么用多阶段构建？**
> - 构建阶段需要 Maven + JDK（约 500MB）
> - 运行阶段只需要 JRE（约 100MB）
> - 最终镜像更小，启动更快

### 5.3 Docker 镜像到底包含什么？

> 这是初学者常见的疑问：Docker 打包时包含源代码还是编译后的文件？包含 node_modules 吗？包含运行环境吗？

#### 本项目的打包情况

**前端**：本项目前端**没有使用 Docker**
- 在本地执行 `npm run build` 生成 `dist/` 目录
- 直接上传 `dist/` 目录到服务器的 `/var/www/html/`
- Nginx 直接服务这些静态文件

**后端**：使用 Docker 多阶段构建

```
┌─────────────────────────────────────────────────────────────┐
│  第一阶段 (builder) - 临时容器，构建完就丢弃                    │
├─────────────────────────────────────────────────────────────┤
│  包含：                                                      │
│  ✓ Maven 构建工具 (约 300MB)                                 │
│  ✓ JDK 17 完整版 (约 400MB)                                  │
│  ✓ 源代码 (.java 文件)                                       │
│  ✓ pom.xml (依赖配置)                                        │
│  ✓ 下载的依赖库                                              │
│                                                             │
│  执行：mvn clean package → 生成 app.jar                      │
│  这个阶段约 700MB，但不会出现在最终镜像中                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ 只复制 app.jar（约 50MB）
┌─────────────────────────────────────────────────────────────┐
│  第二阶段 (runtime) - 最终镜像，实际部署运行的                   │
├─────────────────────────────────────────────────────────────┤
│  包含：                                                      │
│  ✓ JRE 17 Alpine (只有运行环境，约 100MB)                     │
│  ✓ app.jar (编译后的应用，内含所有依赖)                        │
│                                                             │
│  不包含：                                                    │
│  ✗ Maven (不需要，已经编译完了)                               │
│  ✗ JDK (不需要完整版，JRE 够用)                               │
│  ✗ 源代码 (不需要，已经编译成 class 文件打进 jar 了)            │
│  ✗ pom.xml (不需要，依赖已经打进 jar 了)                      │
│                                                             │
│  最终镜像大小：约 150-200MB                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 对比：如果是 Node.js 后端会包含什么？

```
┌─────────────────────────────────────────────────────────────┐
│  Node.js 后端的 Docker 镜像通常包含：                          │
├─────────────────────────────────────────────────────────────┤
│  ✓ Node.js 运行环境                                          │
│  ✓ 源代码 (.js/.ts 文件) 或编译后的 .js 文件                   │
│  ✓ node_modules (所有依赖包)                                 │
│  ✓ package.json                                             │
│                                                             │
│  注意：node_modules 通常很大（几百MB），所以 Node.js 镜像       │
│  一般比 Java 镜像大，除非用 esbuild/webpack 打包成单文件        │
└─────────────────────────────────────────────────────────────┘
```

#### 为什么 Java 的 jar 包能包含所有依赖？

Java 的 Spring Boot 使用 "Fat JAR"（胖 JAR）打包方式：
- 把所有依赖的 .jar 文件都打包进一个 .jar
- 运行时只需要 `java -jar app.jar`，不需要额外安装依赖
- 类似于前端 webpack 把所有 JS 打包成一个 bundle.js

```bash
# 查看 jar 包内容
jar tf app.jar

# 你会看到类似这样的结构：
# BOOT-INF/classes/        # 你的代码编译后的 .class 文件
# BOOT-INF/lib/            # 所有依赖的 jar 包
# META-INF/                 # 元信息
# org/springframework/boot/loader/  # Spring Boot 启动器
```

### 5.4 创建环境变量文件

```bash
# ---------- 在服务器上执行 ----------
cd /home/ubuntu/tianma/ToDoApp/docker

cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=你的数据库密码
JWT_SECRET=你的JWT密钥（随机字符串，至少32位）
EOF

# 设置权限（只有所有者可读）
chmod 600 .env
```

> **为什么用 .env 文件？**
> 1. 敏感信息不应该写在代码里
> 2. .env 文件不应该提交到 Git
> 3. 不同环境（开发/生产）可以用不同的 .env

### 5.5 构建并启动后端

```bash
# ---------- 在服务器上执行 ----------
cd /home/ubuntu/tianma/ToDoApp/docker

# 构建镜像（首次需要下载依赖，较慢）
sudo docker compose build backend

# 启动所有服务
sudo docker compose up -d

# 查看运行状态
sudo docker compose ps

# 查看日志
sudo docker compose logs -f backend
```

### 5.6 验证后端运行

```bash
# ---------- 在服务器上执行 ----------
# 检查健康状态
curl http://127.0.0.1:3002/actuator/health
# 应该返回：{"status":"UP"}

# 测试 API
curl http://127.0.0.1:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123456"}'
```

---

## 六、前端部署

### 6.1 理解前端构建

> **为什么前端需要构建？**
> - 开发时用 `.vue` 文件、TypeScript、SCSS 等
> - 浏览器只认识 `.html`、`.js`、`.css`
> - 构建过程：编译 + 压缩 + 优化

### 6.2 本地构建前端

```bash
# ---------- 在本地电脑执行 ----------
cd ~/Documents/hhCode/nestjs/frontend

# 安装依赖
npm install

# 检查/修改生产环境配置
cat .env.production
# 内容应该是：
# VITE_API_BASE_URL=https://api.tianma.chat/api

# 构建生产版本
npm run build

# 构建完成后，dist 目录包含所有静态文件
ls dist/
# index.html  assets/  favicon.ico  ...
```

### 6.3 上传构建产物到服务器

```bash
# ---------- 在本地电脑执行 ----------
scp -r dist/* ubuntu@111.231.24.51:/var/www/html/

# 或者先打包再上传
tar -czf dist.tar.gz dist/
scp dist.tar.gz ubuntu@111.231.24.51:/tmp/
```

```bash
# ---------- 在服务器上执行 ----------
sudo tar -xzf /tmp/dist.tar.gz -C /var/www/html/ --strip-components=1
```

### 6.4 设置文件权限

```bash
# ---------- 在服务器上执行 ----------
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

> **为什么设置 www-data？** 这是 Nginx 运行的用户，需要有读取文件的权限。

---

## 七、Nginx 配置

### 7.1 理解 Nginx 配置结构

```
/etc/nginx/
├── nginx.conf              # 主配置文件
├── sites-available/        # 可用的站点配置
│   ├── default
│   └── tianma.chat        # 我们的配置
├── sites-enabled/          # 已启用的站点（符号链接）
│   └── tianma.chat -> ../sites-available/tianma.chat
└── ssl/                    # SSL 证书目录
    ├── tianma.chat.pem
    └── tianma.chat.key
```

### 7.2 创建站点配置

```bash
# ---------- 在服务器上执行 ----------
sudo nano /etc/nginx/sites-available/tianma.chat
```

写入以下内容：

```nginx
# === 前端站点配置 ===
server {
    listen 80;                          # 监听 HTTP 80 端口
    listen 443 ssl;                     # 监听 HTTPS 443 端口
    server_name tianma.chat www.tianma.chat;  # 域名

    # SSL 证书配置（后面会讲如何获取）
    ssl_certificate /etc/nginx/ssl/tianma.chat.pem;
    ssl_certificate_key /etc/nginx/ssl/tianma.chat.key;

    # 网站根目录
    root /var/www/html;
    index index.html;

    # 前端路由处理（SPA 单页应用必需）
    location / {
        try_files $uri $uri/ /index.html;
        # 解释：
        # 1. 先尝试访问请求的文件 $uri
        # 2. 再尝试访问目录 $uri/
        # 3. 都不存在则返回 index.html（让前端路由处理）
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;                     # 缓存一年
        add_header Cache-Control "public, immutable";
    }
}

# === API 站点配置 ===
server {
    listen 80;
    listen 443 ssl;
    server_name api.tianma.chat;        # API 子域名

    ssl_certificate /etc/nginx/ssl/tianma.chat.pem;
    ssl_certificate_key /etc/nginx/ssl/tianma.chat.key;

    # 反向代理到后端服务
    location / {
        proxy_pass http://127.0.0.1:3002;  # 转发到 Spring Boot

        # 传递原始请求信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# === HTTP 重定向到 HTTPS ===
server {
    listen 80;
    server_name tianma.chat www.tianma.chat api.tianma.chat;
    return 301 https://$server_name$request_uri;
}
```

### 7.3 启用站点配置

```bash
# ---------- 在服务器上执行 ----------
# 创建符号链接启用站点
sudo ln -s /etc/nginx/sites-available/tianma.chat /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试配置语法
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx
```

### 7.4 理解反向代理

> **为什么叫"反向"代理，而不是"代理"？** 这涉及到代理的方向。

#### 正向代理 vs 反向代理

```
┌─────────────────────────────────────────────────────────────────┐
│                        正向代理 (Proxy)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   客户端知道要访问谁，但需要代理帮忙转发                            │
│                                                                 │
│   [你的电脑] ──→ [代理服务器] ──→ [Google/YouTube]               │
│                                                                 │
│   场景：翻墙、公司网络限制                                        │
│   特点：客户端主动配置代理，服务端不知道真实客户端是谁               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       反向代理 (Reverse Proxy)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   客户端不知道真实服务器是谁，以为代理就是服务器                     │
│                                                                 │
│   [用户浏览器] ──→ [Nginx] ──→ [Spring Boot :3002]              │
│                      ↑                                          │
│                用户以为这就是服务器                                │
│                                                                 │
│   场景：网站部署、负载均衡、隐藏后端                               │
│   特点：客户端不需要任何配置，不知道后端真实地址                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 简单对比

| | 正向代理 | 反向代理 |
|---|---|---|
| **代理谁** | 代理客户端 | 代理服务端 |
| **谁配置** | 客户端配置 | 服务端配置 |
| **隐藏谁** | 隐藏客户端 | 隐藏服务端 |
| **例子** | VPN、翻墙工具 | Nginx、CDN |

#### 本项目的反向代理

用户访问 `api.tianma.chat`，Nginx 把请求转发给 `127.0.0.1:3002`：
- 用户**不知道**后端跑在 3002 端口
- 用户**以为** Nginx 就是 API 服务器
- 所以叫"反向"——代理的是服务端，不是客户端

```
┌─────────────────────────────────────────────────────────────┐
│                      反向代理工作原理                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户请求                     Nginx                  后端    │
│  ────────►  api.tianma.chat  ───────►  127.0.0.1:3002     │
│                                                             │
│  1. 用户不知道后端的真实地址                                   │
│  2. 后端只接受来自 Nginx 的请求（更安全）                      │
│  3. 可以在 Nginx 层做负载均衡、缓存、限流                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 八、SSL 证书配置

### 8.1 为什么需要 HTTPS？

1. **数据加密**：防止密码等敏感信息被窃取
2. **身份验证**：证明网站是真实的
3. **SEO 加分**：搜索引擎优先 HTTPS 网站
4. **浏览器要求**：现代浏览器会标记 HTTP 为"不安全"

### 8.2 方法一：腾讯云免费证书

1. 登录腾讯云控制台 → SSL 证书
2. 申请免费证书（DV 型）
3. 填写域名：`tianma.chat` 和 `*.tianma.chat`
4. 按提示验证域名所有权
5. 下载证书（选择 Nginx 格式）
6. 上传到服务器：

```bash
# ---------- 在本地电脑执行 ----------
# 上传证书到服务器
scp tianma.chat.pem ubuntu@111.231.24.51:/tmp/
scp tianma.chat.key ubuntu@111.231.24.51:/tmp/
```

```bash
# ---------- 在服务器上执行 ----------
# 创建 SSL 目录
sudo mkdir -p /etc/nginx/ssl

# 移动证书到正确位置
sudo mv /tmp/tianma.chat.pem /etc/nginx/ssl/
sudo mv /tmp/tianma.chat.key /etc/nginx/ssl/

# 设置权限
sudo chmod 600 /etc/nginx/ssl/*
```

### 8.3 方法二：Let's Encrypt 免费证书

```bash
# ---------- 在服务器上执行 ----------
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动获取并配置证书
sudo certbot --nginx -d tianma.chat -d www.tianma.chat -d api.tianma.chat

# 测试自动续期
sudo certbot renew --dry-run
```

> Let's Encrypt 证书有效期 90 天，Certbot 会自动续期。

---

## 九、数据库管理

### 9.1 连接数据库

```bash
# ---------- 在服务器上执行 ----------
# 方法一：通过 Docker 进入 MySQL 容器
sudo docker exec -it tianma-mysql mysql -u root -p
# 输入密码（.env 中的 MYSQL_ROOT_PASSWORD）

# 方法二：在容器外使用 mysql 客户端
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### 9.2 常用 SQL 命令

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 使用 todo_db 数据库
USE todo_db;

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE users;
DESCRIBE todos;
DESCRIBE categories;

-- 查询数据
SELECT * FROM users;
SELECT * FROM todos WHERE user_id = 1;
SELECT * FROM categories;

-- 统计数据
SELECT COUNT(*) FROM todos;
SELECT COUNT(*) FROM users;

-- 查看特定用户的所有待办
SELECT t.*, c.name as category_name
FROM todos t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1;
```

### 9.3 数据备份与恢复

```bash
# ---------- 在服务器上执行 ----------
# 备份整个数据库
sudo docker exec tianma-mysql mysqldump -u root -p'你的密码' todo_db > backup_$(date +%Y%m%d).sql

# 恢复数据库
sudo docker exec -i tianma-mysql mysql -u root -p'你的密码' todo_db < backup_20260304.sql

# 定时备份（添加到 crontab）
crontab -e
# 添加：每天凌晨 3 点备份
0 3 * * * docker exec tianma-mysql mysqldump -u root -p'密码' todo_db > /home/ubuntu/backups/todo_db_$(date +\%Y\%m\%d).sql
```

### 9.4 数据持久化说明

Docker Compose 中配置了命名卷 `mysql_data`：

```yaml
volumes:
  - mysql_data:/var/lib/mysql
```

这意味着：
- 容器删除后，数据**不会丢失**
- 数据存储在 `/var/lib/docker/volumes/docker_mysql_data/_data/`
- 只有手动删除卷才会丢失数据：`docker volume rm docker_mysql_data`

---

## 十、日常运维命令

### 10.1 服务管理

```bash
# ---------- 在服务器上执行 ----------
# === Docker 服务 ===
# 查看运行中的容器
sudo docker compose ps

# 启动所有服务
sudo docker compose up -d

# 停止所有服务
sudo docker compose down

# 重启后端
sudo docker compose restart backend

# 重新构建并启动（代码更新后）
sudo docker compose up -d --build backend

# === Nginx ===
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx
```

### 10.2 日志查看

```bash
# ---------- 在服务器上执行 ----------
# 后端日志
sudo docker compose logs -f backend         # 实时跟踪
sudo docker compose logs --tail=100 backend # 最后100行

# Nginx 日志
sudo tail -f /var/log/nginx/access.log  # 访问日志
sudo tail -f /var/log/nginx/error.log   # 错误日志

# 系统日志
sudo journalctl -u nginx -f
```

### 10.3 代码更新流程

```bash
# ---------- 第 1-2 步：在本地电脑执行 ----------
# 1. 本地修改代码并测试

# 2. 推送到 GitHub
git add .
git commit -m "fix: 修复xxx问题"
git push
```

```bash
# ---------- 第 3-4 步：在服务器上执行 ----------
# 3. 服务器拉取代码
cd /home/ubuntu/tianma/ToDoApp
git pull

# 4. 重新构建后端
cd docker
sudo docker compose up -d --build backend
```

```bash
# ---------- 第 5 步：在本地电脑执行 ----------
# 5. 更新前端（本地构建后上传）
cd ~/Documents/hhCode/nestjs/frontend
npm run build
scp -r dist/* ubuntu@111.231.24.51:/var/www/html/
```

### 10.4 资源监控

```bash
# ---------- 在服务器上执行 ----------
# 查看服务器资源使用
htop                    # 交互式进程查看
df -h                   # 磁盘使用情况
free -h                 # 内存使用情况

# 查看 Docker 资源使用
docker stats            # 实时容器资源使用
docker system df        # Docker 磁盘使用

# 清理 Docker 无用资源
docker system prune -a  # 清理所有无用镜像、容器、网络
```

---

## 十一、常见问题排查

### 11.1 后端无法启动

```bash
# ---------- 在服务器上执行 ----------
# 查看日志
sudo docker compose logs backend

# 常见原因：
# 1. 数据库连接失败 - 检查 MySQL 是否启动
sudo docker compose ps mysql

# 2. 端口被占用
sudo lsof -i :3002

# 3. 内存不足
free -h
```

### 11.2 前端白屏

```bash
# ---------- 在服务器上执行 ----------
# 1. 检查文件是否存在
ls -la /var/www/html/

# 2. 检查 Nginx 配置
sudo nginx -t

# 3. 检查浏览器控制台错误
# 常见：API 地址配置错误，检查 .env.production

# 4. 清除浏览器缓存或 localStorage
```

### 11.3 API 404 错误

```bash
# ---------- 在服务器上执行 ----------
# 1. 确认后端运行中
curl http://127.0.0.1:3002/actuator/health

# 2. 检查 Nginx 反向代理配置
sudo cat /etc/nginx/sites-enabled/tianma.chat

# 3. 检查后端路由是否有 /api 前缀
# Controller 中 @RequestMapping("/api/todos")
```

### 11.4 CORS 跨域错误

```bash
# 1. 检查后端 CORS 配置
# SecurityConfig.java 中的 corsConfigurationSource()

# 2. 检查请求的 Origin 是否在允许列表中

# 3. Nginx 也可以添加 CORS 头
location / {
    add_header Access-Control-Allow-Origin *;
}
```

### 11.5 数据库连接拒绝

```bash
# ---------- 在服务器上执行 ----------
# 1. 检查 MySQL 容器状态
sudo docker compose ps mysql

# 2. 检查连接参数
# docker-compose.yml 中的环境变量

# 3. 检查密码是否正确
sudo docker exec tianma-mysql mysql -u root -p'密码' -e "SELECT 1"
```

---

## 附录：快速命令参考

```bash
# ---------- 在服务器上执行 ----------

# === 一键部署（首次） ===
cd /home/ubuntu/tianma/ToDoApp/docker
sudo docker compose up -d

# === 更新后端 ===
cd /home/ubuntu/tianma/ToDoApp
git pull
cd docker && sudo docker compose up -d --build backend

# === 查看状态 ===
sudo docker compose ps
sudo docker compose logs -f backend

# === 重启服务 ===
sudo docker compose restart backend
sudo systemctl reload nginx

# === 数据库操作 ===
sudo docker exec -it tianma-mysql mysql -u root -p
```

```bash
# ---------- 在本地电脑执行 ----------

# === 更新前端 ===
cd ~/Documents/hhCode/nestjs/frontend
npm run build
scp -r dist/* ubuntu@111.231.24.51:/var/www/html/
```

---

## 联系与反馈

如有问题，请检查：
1. 服务器安全组端口是否开放
2. 域名 DNS 是否正确解析
3. SSL 证书是否过期
4. Docker 容器是否正常运行

Happy Deploying! 🚀

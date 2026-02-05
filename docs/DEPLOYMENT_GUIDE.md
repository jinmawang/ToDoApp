# 前端开发者全栈部署完全指南

> 🎯 **目标读者**：前端开发者，不懂后端和运维，想要学习如何把项目部署到云服务器
> ⏱️ **预计时间**：首次部署 4-5 小时，熟练后 5 分钟
> 💰 **成本**：50-60 元/月（云服务器）

---

## 📚 目录

- [第 0 章：准备工作](#第-0-章准备工作)
- [第 1 章：服务器环境搭建](#第-1-章服务器环境搭建)
- [第 2 章：Docker 容器化](#第-2-章docker-容器化)
- [第 3 章：部署到服务器](#第-3-章部署到服务器)
- [第 4 章：Nginx 反向代理](#第-4-章nginx-反向代理)
- [第 5 章：运维实践](#第-5-章运维实践)
- [第 6 章：生产环境优化](#第-6-章生产环境优化)
- [附录：常见问题](#附录常见问题)

---

## 🌟 为什么要学习手动部署？

作为前端开发者，你可能习惯了 Vercel、Netlify 这样的一键部署平台。但学习手动部署能让你：

1. **真正理解前后端是如何协同工作的**
   - 前端的 API 请求是怎么到达后端的？
   - Nginx 反向代理和 Vite 的 proxy 有什么区别？
   - Docker 容器和 Node.js 进程有什么联系？

2. **掌握全栈开发的核心技能**
   - Docker 容器化（现代应用部署的标准）
   - Nginx 配置（前端性能优化的关键）
   - Linux 基础（服务器管理必备）

3. **为职业发展打基础**
   - 从前端工程师到全栈工程师的必经之路
   - 面试加分项
   - 独立完成个人项目

---

## 🎓 前置知识

### 你已经会的（前端基础）
- ✅ npm/yarn 包管理
- ✅ 基本的命令行操作（cd、ls、npm install）
- ✅ Git 版本控制

### 你将要学习的（运维知识）
- 🔥 Docker 容器化
- 🔥 Nginx 反向代理
- 🔥 Linux 基础命令
- 🔥 服务器管理

### 不用担心的
- ❌ 不需要学复杂的 Kubernetes
- ❌ 不需要学微服务架构
- ❌ 不需要学 Redis 集群、分库分表

---

## 第 0 章：准备工作

### 0.1 项目现状

**当前项目结构：**
```
nestjs/
├── backend-java/           # Java Spring Boot 后端
├── frontend/              # Vue 3 前端
├── backend/              # NestJS 后端（备选）
└── backend-python/       # Python FastAPI 后端（备选）
```

**本指南部署的内容：**
- ✅ Java Spring Boot 后端（端口 3002）
- ✅ Vue 3 前端
- ✅ MySQL 8.0 数据库

### 0.2 购买云服务器

#### 推荐平台对比

| 平台 | 配置 | 价格 | 优缺点 |
|-----|-----|------|--------|
| **阿里云轻量** | 2核2G<br>3M带宽<br>40GB SSD | ~60元/月 | ✅ 国内访问快<br>❌ 需要备案<br>✅ 有香港节点（无需备案） |
| **腾讯云轻量** | 2核2G<br>4M带宽<br>50GB SSD | ~50元/月 | ✅ 首年优惠<br>❌ 需要备案 |
| **Vultr** | 1核1G<br>1TB流量 | $6/月<br>(~42元) | ✅ 无需备案<br>✅ 东京/新加坡节点快<br>❌ 需要信用卡 |

#### 购买步骤（以阿里云为例）

1. **访问阿里云官网** → 登录/注册
2. **选择轻量应用服务器** → 立即购买
3. **选择配置**：
   - 地域：**香港**（无需备案）或国内（需要备案）
   - 镜像：**Ubuntu 22.04**
   - 套餐：2核2G
4. **设置密码**：一定要记住！
5. **支付购买**

#### 购买后你会得到

- 📍 **公网 IP**：如 `123.45.67.89`
- 🔑 **SSH 端口**：默认 22
- 👤 **用户名**：root
- 🔐 **密码**：你刚才设置的密码

### 0.3 连接到服务器

#### Mac/Linux 用户

打开终端，输入：
```bash
ssh root@你的服务器IP
# 例如：ssh root@123.45.67.89
```

输入密码后回车（注意：输入密码时不会显示任何字符）。

#### Windows 用户

**方法一：使用 MobaXterm**（推荐）

1. 下载并安装 [MobaXterm](https://mobaxterm.mobatek.net/download.html)
2. 点击 "Session" → "SSH"
3. 输入服务器 IP、用户名（root）、密码
4. 点击 "OK" 连接

**方法二：使用 PowerShell**

Windows 10+ 自带 SSH 客户端：
```powershell
ssh root@你的服务器IP
```

#### 连接成功的标志

你会看到类似这样的欢迎信息：
```
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-76-generic x86_64)
root@ubuntu:~#
```

恭喜！你已经连接到服务器了 🎉

---

## 第 1 章：服务器环境搭建

### 1.1 基础安全配置

**为什么要做这些？**
- 🔒 提高服务器安全性
- 🛡️ 防止被暴力破解
- 📦 更新系统漏洞补丁

#### 步骤 1：更新系统包

```bash
apt update && apt upgrade -y
```

**解释：**
- `apt`：Ubuntu 的包管理器，类似于前端的 `npm`
- `update`：更新软件包列表，类似于 `npm outdated`
- `upgrade`：升级已安装的软件包，类似于 `npm update`
- `-y`：自动回答 yes，类似于 `npm install -y`

**预计时间**：2-5 分钟

#### 步骤 2：创建非 root 用户（推荐）

```bash
# 创建名为 deploy 的用户
adduser deploy

# 按提示输入密码（至少8位）
# 其他信息可以直接回车跳过

# 把 deploy 加入 sudo 组（允许使用管理员权限）
usermod -aG sudo deploy

# 切换到 deploy 用户
su - deploy
```

**为什么要创建新用户？**
- root 用户权限太大，容易误操作
- 类比前端：就像不应该在 `node_modules` 里直接修改代码

#### 步骤 3：配置防火墙

```bash
# 允许 SSH 连接（端口 22）
sudo ufw allow 22

# 允许 HTTP 访问（端口 80）
sudo ufw allow 80

# 允许 HTTPS 访问（端口 443）
sudo ufw allow 443

# 启用防火墙
sudo ufw enable

# 查看防火墙状态
sudo ufw status
```

**解释：**
- `ufw`：Uncomplicated Firewall，Ubuntu 的防火墙工具
- 类比前端：就像 Webpack 的 `devServer.allowedHosts`，控制哪些请求可以进来

### 1.2 安装 Docker

**什么是 Docker？**
- 把你的应用和所有依赖打包成一个"盒子"（容器）
- 类比前端：就像 `npm pack` 把你的包打包成 `.tgz` 文件
- 好处：彻底解决"在我本地是好的"问题

#### 安装 Docker

```bash
# 下载 Docker 官方安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh

# 运行安装脚本
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker

# 设置 Docker 开机自启
sudo systemctl enable docker

# 让当前用户可以使用 docker 命令（不用每次都 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version
# 应该显示：Docker version 24.x.x

# 测试 Docker 是否正常工作
docker run hello-world
# 应该看到 "Hello from Docker!" 消息
```

**预计时间**：3-5 分钟

#### Docker 核心概念

| Docker 概念 | 前端类比 | 说明 |
|------------|---------|------|
| **镜像 (Image)** | npm 包 | 应用的"模板"，只读 |
| **容器 (Container)** | Node.js 进程 | 运行中的镜像实例 |
| **Dockerfile** | package.json | 定义如何构建镜像 |
| **Docker Hub** | npm Registry | 镜像仓库 |
| **docker-compose.yml** | package.json scripts | 定义多容器应用 |

### 1.3 安装 Docker Compose

**什么是 Docker Compose？**
- 同时管理多个容器（MySQL + Java 后端 + 前端）
- 类比前端：就像 `npm-run-all` 同时运行多个脚本

```bash
# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 验证安装
docker compose version
# 应该显示：Docker Compose version v2.x.x
```

### 1.4 安装 Nginx

**什么是 Nginx？**
- Web 服务器 + 反向代理
- 类比前端：
  - 托管前端静态文件 = `vite preview`
  - 反向代理 = `vite.config.js` 的 `server.proxy`

```bash
# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
sudo systemctl status nginx
# 应该显示 "active (running)"
```

**测试 Nginx**：
在浏览器访问 `http://你的服务器IP`，应该看到 "Welcome to nginx!" 页面。

### 1.5 安装 Git

```bash
sudo apt install git -y
git --version
```

---

## 第 2 章：Docker 容器化

### 2.1 理解项目结构

**当前状态：**
```
nestjs/
├── backend-java/
│   ├── src/
│   ├── pom.xml              # Maven 配置（类似 package.json）
│   └── ❌ Dockerfile         # 缺失！
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── ❌ Dockerfile         # 缺失！
│   └── ❌ nginx.conf         # 缺失！
└── ❌ docker-compose.yml     # 缺失！
```

**目标：**
创建 Dockerfile 和 docker-compose.yml，让项目可以在任何服务器上运行。

### 2.2 创建 Java 后端 Dockerfile

#### 在本地项目中操作

创建文件 `backend-java/Dockerfile`：

```dockerfile
# ========================================
# 第一阶段：构建阶段（体积大，包含完整 JDK 和 Maven）
# ========================================
FROM maven:3.9-eclipse-temurin-17 AS builder

# 设置工作目录
WORKDIR /app

# 先复制 pom.xml，利用 Docker 缓存机制
# 类比：先复制 package.json，再 npm install
COPY pom.xml .
RUN mvn dependency:go-offline

# 复制源代码并编译
COPY src ./src
RUN mvn clean package -DskipTests

# ========================================
# 第二阶段：运行阶段（体积小，只包含 JRE）
# ========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 从构建阶段复制编译好的 JAR 文件
COPY --from=builder /app/target/todo-backend-1.0.0.jar app.jar

# 暴露端口（文档作用，实际端口由 application.yml 决定）
EXPOSE 3002

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 理解 Dockerfile

**多阶段构建**：
- **第一阶段（builder）**：编译 Java 代码，生成 JAR 文件
  - 镜像体积：~800MB（包含 Maven 和 JDK）
  - 类比：`npm run build` 的过程
- **第二阶段**：只复制 JAR 文件，运行应用
  - 镜像体积：~150MB（只包含 JRE）
  - 类比：只复制 `dist/` 文件夹到生产环境

**为什么要多阶段构建？**
- 最终镜像不包含编译工具，体积小
- 类比：不会把 `node_modules` 和源代码都部署到生产环境

#### 创建 .dockerignore 文件

创建文件 `backend-java/.dockerignore`：

```
# 排除不需要打包进镜像的文件
target/
*.log
.git/
.idea/
.vscode/
*.md
```

**作用：**
- 减小 Docker 构建上下文大小，加快构建速度
- 类比：`.gitignore` 和 `.npmignore`

### 2.3 创建前端 Dockerfile

#### 创建文件 `frontend/Dockerfile`

```dockerfile
# ========================================
# 第一阶段：构建阶段
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（使用 npm ci 更快更可靠）
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本（生成 dist/ 目录）
RUN npm run build

# ========================================
# 第二阶段：Nginx 服务
# ========================================
FROM nginx:alpine

# 复制构建产物到 Nginx 的 HTML 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx（-g 'daemon off;' 让 Nginx 在前台运行）
CMD ["nginx", "-g", "daemon off;"]
```

#### 理解前端 Dockerfile

**为什么用 Nginx 而不是 Vite？**
- Vite 的 `vite preview` 只是预览工具，不是生产级 Web 服务器
- Nginx 性能更好，支持缓存、压缩、负载均衡
- 类比：开发环境用 webpack-dev-server，生产环境用 Nginx

#### 创建 frontend/.dockerignore

```
node_modules/
dist/
*.log
.git/
.vscode/
.env.local
```

### 2.4 创建前端 Nginx 配置

#### 创建文件 `frontend/nginx.conf`

```nginx
server {
    # 监听 80 端口
    listen 80;

    # 匹配所有域名/IP
    server_name _;

    # 前端静态文件根目录
    root /usr/share/nginx/html;
    index index.html;

    # ===================================
    # 1. Vue Router history 模式支持
    # ===================================
    location / {
        # 尝试访问文件，如果不存在则返回 index.html
        # 解决 Vue Router 刷新 404 问题
        try_files $uri $uri/ /index.html;
    }

    # ===================================
    # 2. API 反向代理
    # ===================================
    location /api {
        # 转发到后端容器（backend 是容器名）
        proxy_pass http://backend:3002;

        # 转发原始请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ===================================
    # 3. 静态资源缓存（性能优化）
    # ===================================
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        # 缓存 1 年
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ===================================
    # 4. index.html 不缓存（确保更新）
    # ===================================
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # ===================================
    # 5. Gzip 压缩（减小传输体积）
    # ===================================
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
```

#### 理解 Nginx 配置

**1. try_files 指令**
```nginx
try_files $uri $uri/ /index.html;
```
- 访问 `/about` 时，Nginx 会：
  1. 尝试找 `/about` 文件
  2. 尝试找 `/about/` 目录
  3. 都没有，返回 `/index.html`（Vue Router 接管）
- **类比**：Vite 的 `historyApiFallback` 配置

**2. proxy_pass 指令**
```nginx
location /api {
    proxy_pass http://backend:3002;
}
```
- 前端请求 `/api/todos` → Nginx 转发到 `http://backend:3002/api/todos`
- **类比**：Vite 的 `server.proxy` 配置
  ```js
  // vite.config.js
  export default {
    server: {
      proxy: {
        '/api': 'http://localhost:3002'
      }
    }
  }
  ```

**3. 缓存策略**
- JS/CSS 文件：缓存 1 年（Vite 的哈希文件名保证更新）
- index.html：不缓存（确保用户能看到最新版本）
- **类比**：Webpack 的 `contenthash`

### 2.5 修改前端 API 配置

#### 编辑文件 `frontend/src/config/api.ts`

**原始代码：**
```typescript
const API_PORT = import.meta.env.VITE_API_PORT || '3000'
export const API_BASE_URL = `http://localhost:${API_PORT}`
```

**修改为：**
```typescript
/**
 * API 配置
 *
 * 开发环境：直接访问 localhost:3002
 * 生产环境：使用相对路径 /api，由 Nginx 转发
 */
const API_BASE_URL = import.meta.env.PROD
  ? '/api'  // 生产环境：相对路径
  : import.meta.env.VITE_API_URL || 'http://localhost:3002'  // 开发环境

export { API_BASE_URL }

export const API_ENDPOINTS = {
  todos: `${API_BASE_URL}/todos`,
  categories: `${API_BASE_URL}/categories`,
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
  }
}
```

**解释：**
- `import.meta.env.PROD`：Vite 提供的环境变量，生产构建时为 `true`
- 生产环境使用 `/api`，Nginx 会把请求转发到后端容器
- 开发环境直接访问 `localhost:3002`

### 2.6 创建 Docker Compose 编排文件

#### 创建文件 `docker-compose.yml`（项目根目录）

```yaml
version: '3.8'

services:
  # ==================================
  # MySQL 数据库服务
  # ==================================
  mysql:
    image: mysql:8.0
    container_name: todo-mysql
    restart: always

    # 环境变量
    environment:
      MYSQL_ROOT_PASSWORD: Todo@2024SecurePassword  # 改成强密码！
      MYSQL_DATABASE: todo_db

    # 端口映射（主机端口:容器端口）
    ports:
      - "3306:3306"

    # 数据持久化（容器删除后数据不丢失）
    volumes:
      - mysql_data:/var/lib/mysql

    # 健康检查（确保 MySQL 启动完成）
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==================================
  # Java Spring Boot 后端服务
  # ==================================
  backend:
    build:
      context: ./backend-java
      dockerfile: Dockerfile

    container_name: todo-backend
    restart: always

    # 端口映射
    ports:
      - "3002:3002"

    # 环境变量（覆盖 application.yml 的配置）
    environment:
      # 数据库连接（mysql 是容器名，Docker 会自动解析）
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/todo_db?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: Todo@2024SecurePassword

      # JPA 配置
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      SPRING_JPA_SHOW_SQL: false

    # 依赖关系（等 MySQL 健康检查通过后再启动）
    depends_on:
      mysql:
        condition: service_healthy

  # ==================================
  # Vue 前端服务
  # ==================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile

    container_name: todo-frontend
    restart: always

    # 端口映射（8080 是临时端口，最终通过 Nginx 反向代理到 80）
    ports:
      - "8080:80"

    # 依赖关系（确保后端先启动）
    depends_on:
      - backend

# ==================================
# 数据卷（持久化存储）
# ==================================
volumes:
  mysql_data:
    # 命名卷，数据存储在 Docker 管理的位置
    # 类比：node_modules 的全局缓存
```

#### 理解 Docker Compose

**services 配置**：
- 类比：`package.json` 的 `scripts`
- 每个 service 是一个容器

**depends_on 配置**：
```yaml
depends_on:
  mysql:
    condition: service_healthy
```
- 确保启动顺序：MySQL → 后端 → 前端
- `condition: service_healthy`：等 MySQL 健康检查通过
- 类比：`concurrently` 的依赖顺序

**volumes 配置**：
```yaml
volumes:
  - mysql_data:/var/lib/mysql
```
- 持久化 MySQL 数据
- 容器删除后数据不丢失
- 类比：Git 的 `.gitignore` 外的文件会被保留

**容器间网络**：
```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/todo_db
```
- `mysql` 是容器名，Docker 自动解析为容器 IP
- 容器间通信不需要暴露端口到主机
- 类比：前端的 `localhost`

### 2.7 本地测试 Docker 配置

#### 在本地项目目录执行

```bash
# 构建镜像（首次会比较慢，5-10 分钟）
docker compose build

# 启动所有服务
docker compose up -d

# 查看运行状态
docker compose ps
```

**预期输出：**
```
NAME              IMAGE              STATUS         PORTS
todo-mysql        mysql:8.0          Up 2 minutes   0.0.0.0:3306->3306/tcp
todo-backend      nestjs-backend     Up 1 minute    0.0.0.0:3002->3002/tcp
todo-frontend     nestjs-frontend    Up 1 minute    0.0.0.0:8080->80/tcp
```

#### 测试后端

浏览器访问：`http://localhost:3002/swagger-ui.html`

应该能看到 Swagger API 文档。

#### 测试前端

浏览器访问：`http://localhost:8080`

应该能看到 Vue 前端页面。

#### 查看日志

```bash
# 查看所有日志
docker compose logs

# 查看后端日志（实时）
docker compose logs -f backend

# 查看前端日志
docker compose logs frontend
```

#### 停止服务

```bash
# 停止并删除容器
docker compose down

# 停止并删除容器和数据卷（慎用！会删除数据库数据）
docker compose down -v
```

### 2.8 提交代码到 GitHub

```bash
git add .
git commit -m "feat: add Docker configuration for deployment"
git push origin main
```

---

## 第 3 章：部署到服务器

### 3.1 上传代码到服务器

#### 方法一：Git 克隆（推荐）

**在服务器上执行：**

```bash
# 回到用户主目录
cd ~

# 克隆项目
git clone https://github.com/你的用户名/nestjs.git

# 进入项目目录
cd nestjs

# 查看文件结构
ls -la
```

#### 方法二：本地上传（如果仓库是私有的）

**在本地执行：**

```bash
# 压缩项目（排除 node_modules 和 .git）
tar -czf nestjs.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='target' \
  nestjs/

# 上传到服务器
scp nestjs.tar.gz root@你的服务器IP:/root/

# 在服务器上解压
ssh root@你的服务器IP
cd ~
tar -xzf nestjs.tar.gz
cd nestjs
```

### 3.2 构建和启动容器

```bash
# 确保在项目目录
cd ~/nestjs

# 构建所有镜像（首次会比较慢，10-15 分钟）
docker compose build

# 查看构建进度
# 可以在另一个终端窗口执行：docker compose logs -f

# 启动所有服务（后台运行）
docker compose up -d

# 查看运行状态
docker compose ps
```

**预期输出：**
```
NAME              IMAGE              STATUS         PORTS
todo-mysql        mysql:8.0          Up 2 minutes   0.0.0.0:3306->3306/tcp
todo-backend      nestjs-backend     Up 1 minute    0.0.0.0:3002->3002/tcp
todo-frontend     nestjs-frontend    Up 1 minute    0.0.0.0:8080->80/tcp
```

### 3.3 验证部署

#### 验证 MySQL

```bash
# 进入 MySQL 容器
docker exec -it todo-mysql mysql -uroot -p
# 输入密码：Todo@2024SecurePassword

# 查看数据库
SHOW DATABASES;
# 应该能看到 todo_db

# 查看表（如果后端已启动，会自动创建表）
USE todo_db;
SHOW TABLES;

# 退出
exit;
```

#### 验证后端

```bash
# 在服务器上测试
curl http://localhost:3002/swagger-ui.html

# 在本地浏览器测试（把 IP 换成你的服务器 IP）
# http://123.45.67.89:3002/swagger-ui.html
```

**如果无法访问，排查步骤：**

1. **检查容器是否运行**
   ```bash
   docker compose ps
   # STATUS 应该是 Up
   ```

2. **查看后端日志**
   ```bash
   docker compose logs backend
   # 查找错误信息，特别是数据库连接错误
   ```

3. **检查防火墙**
   ```bash
   sudo ufw status
   # 确保 3002 端口开放（或者先临时开放）
   sudo ufw allow 3002
   ```

#### 验证前端

浏览器访问：`http://你的服务器IP:8080`

应该能看到 Vue 前端页面。

### 3.4 常用 Docker 命令

```bash
# 查看所有容器
docker ps -a

# 查看镜像
docker images

# 查看日志（实时）
docker compose logs -f
docker compose logs -f backend  # 只看后端

# 重启某个服务
docker compose restart backend

# 停止所有服务
docker compose down

# 进入容器内部（排查问题）
docker exec -it todo-backend bash

# 查看容器资源占用
docker stats
```

---

## 第 4 章：Nginx 反向代理

### 4.1 为什么需要 Nginx 反向代理？

**当前状态：**
- 前端：`http://服务器IP:8080`
- 后端：`http://服务器IP:3002`

**问题：**
- 需要记住端口号
- 不支持 HTTPS
- 无法使用域名

**解决方案：**
用 Nginx 作为"前台"，统一处理所有请求：
- `http://服务器IP/` → 前端
- `http://服务器IP/api` → 后端
- `http://服务器IP/swagger-ui.html` → 后端 API 文档

### 4.2 创建 Nginx 配置文件

**在服务器上执行：**

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/todo-app
```

**粘贴以下内容**（按 Ctrl+O 保存，Ctrl+X 退出）：

```nginx
server {
    # 监听 80 端口（HTTP）
    listen 80;

    # 服务器名称（改成你的 IP 或域名）
    server_name 123.45.67.89;  # 改成你的服务器 IP
    # 或者：server_name todo.example.com;

    # ===================================
    # 1. 前端（根路径）
    # ===================================
    location / {
        # 转发到前端容器（8080 端口）
        proxy_pass http://localhost:8080;

        # 转发原始请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ===================================
    # 2. 后端 API（/api 路径）
    # ===================================
    location /api {
        # 转发到后端容器（3002 端口）
        proxy_pass http://localhost:3002;

        # 转发原始请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ===================================
    # 3. Swagger 文档（可选）
    # ===================================
    location /swagger-ui.html {
        proxy_pass http://localhost:3002/swagger-ui.html;
        proxy_set_header Host $host;
    }

    location /v3/api-docs {
        proxy_pass http://localhost:3002/v3/api-docs;
        proxy_set_header Host $host;
    }

    # ===================================
    # 4. 日志
    # ===================================
    access_log /var/log/nginx/todo-app.access.log;
    error_log /var/log/nginx/todo-app.error.log;
}
```

**关键配置解释：**

| 配置项 | 作用 | 前端类比 |
|-------|-----|---------|
| `location /` | 根路径转发到前端 | `devServer.proxy` |
| `location /api` | API 路径转发到后端 | `devServer.proxy['/api']` |
| `proxy_pass` | 转发到目标地址 | `target` |
| `proxy_set_header` | 转发原始请求头 | `changeOrigin: true` |

### 4.3 启用配置并重启 Nginx

```bash
# 创建软链接（启用配置）
sudo ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置是否正确
sudo nginx -t

# 应该显示：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
# 应该显示 "active (running)"
```

### 4.4 验证部署成功

**在浏览器访问：**

1. **前端首页**：`http://你的服务器IP`
   - 应该看到 Vue 前端页面

2. **后端 API 文档**：`http://你的服务器IP/swagger-ui.html`
   - 应该看到 Swagger 文档

3. **测试 API 调用**：
   - 在前端页面尝试登录/注册
   - 打开浏览器开发者工具 → Network
   - 应该看到请求 `/api/auth/login` 返回 200

**恭喜！你已经完成了完整的部署流程！** 🎉

---

## 第 5 章：运维实践

### 5.1 常用运维命令

#### Docker 命令

```bash
# ===== 查看服务状态 =====
docker compose ps                     # 查看容器状态
docker compose logs -f                # 查看所有日志（实时）
docker compose logs -f backend        # 查看后端日志
docker compose logs --tail 100 backend  # 查看最近 100 行日志

# ===== 重启服务 =====
docker compose restart backend        # 重启后端
docker compose restart frontend       # 重启前端
docker compose restart                # 重启所有服务

# ===== 停止服务 =====
docker compose stop                   # 停止所有容器
docker compose down                   # 停止并删除容器
docker compose down -v                # 停止并删除容器和数据卷（慎用！）

# ===== 更新代码后重新部署 =====
git pull                              # 拉取最新代码
docker compose build                  # 重新构建镜像
docker compose up -d                  # 启动服务

# ===== 进入容器内部 =====
docker exec -it todo-backend bash     # 进入后端容器
docker exec -it todo-mysql mysql -uroot -p  # 进入 MySQL

# ===== 查看资源占用 =====
docker stats                          # 查看所有容器的 CPU/内存占用
```

#### Nginx 命令

```bash
# ===== 测试配置 =====
sudo nginx -t                         # 测试配置文件语法

# ===== 重启 Nginx =====
sudo systemctl restart nginx          # 重启 Nginx
sudo systemctl reload nginx           # 重新加载配置（不中断服务）
sudo systemctl status nginx           # 查看运行状态

# ===== 查看日志 =====
sudo tail -f /var/log/nginx/access.log     # 访问日志（实时）
sudo tail -f /var/log/nginx/error.log      # 错误日志（实时）
sudo tail -f /var/log/nginx/todo-app.access.log  # 应用访问日志
```

#### 系统命令

```bash
# ===== 查看系统资源 =====
top                                   # 实时查看 CPU/内存占用（按 q 退出）
df -h                                 # 查看磁盘使用情况
free -h                               # 查看内存使用情况

# ===== 查看端口占用 =====
sudo netstat -tulpn | grep 80         # 查看 80 端口被谁占用
sudo netstat -tulpn | grep 3002       # 查看 3002 端口

# ===== 防火墙 =====
sudo ufw status                       # 查看防火墙状态
sudo ufw allow 80                     # 开放 80 端口
sudo ufw delete allow 3002            # 关闭 3002 端口
```

### 5.2 更新代码的完整流程

当你在本地修改了代码，想要部署到服务器：

```bash
# ===== 第 1 步：本地提交代码 =====
# 在本地执行
git add .
git commit -m "fix: update feature"
git push origin main

# ===== 第 2 步：服务器拉取代码 =====
# 在服务器执行
cd ~/nestjs
git pull

# ===== 第 3 步：重新构建和启动 =====
# 方法一：重新构建（代码有改动）
docker compose build
docker compose up -d

# 方法二：快速重启（只改了配置文件）
docker compose restart

# ===== 第 4 步：验证 =====
# 查看日志确认启动成功
docker compose logs -f backend

# 浏览器测试功能
```

**一行命令完成更新：**
```bash
cd ~/nestjs && git pull && docker compose up -d --build
```

### 5.3 排查问题的思路

#### 问题 1：后端无法连接数据库

**症状：**
```
docker compose logs backend
# 报错：Access denied for user 'root'@'...
```

**排查步骤：**

```bash
# 1. 检查 MySQL 容器是否运行
docker compose ps
# todo-mysql 应该是 Up 状态

# 2. 检查 MySQL 日志
docker compose logs mysql

# 3. 检查环境变量
docker compose config
# 查看 SPRING_DATASOURCE_PASSWORD 是否正确

# 4. 进入 MySQL 测试连接
docker exec -it todo-mysql mysql -uroot -p
# 输入密码，看能否登录

# 5. 检查数据库是否创建
SHOW DATABASES;
# 应该能看到 todo_db
```

**解决方案：**
- 确保 `docker-compose.yml` 中的密码一致
- 重启所有服务：`docker compose down && docker compose up -d`

#### 问题 2：前端无法访问后端 API

**症状：**
- 浏览器控制台报错：`Failed to fetch`
- 或显示 `CORS error`

**排查步骤：**

```bash
# 1. 检查后端是否启动
docker compose ps
curl http://localhost:3002/swagger-ui.html

# 2. 检查 Nginx 配置
sudo nginx -t
cat /etc/nginx/sites-available/todo-app

# 3. 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log

# 4. 测试 Nginx 转发
curl http://localhost/api/health  # 假设有健康检查接口
```

**解决方案：**
- 检查 `nginx.conf` 中的 `proxy_pass` 配置
- 确保前端容器的 `nginx.conf` 正确配置了 `/api` 转发
- 重启 Nginx：`sudo systemctl restart nginx`

#### 问题 3：前端刷新后 404

**症状：**
- 首页能访问，点击路由跳转正常
- 刷新页面后显示 404

**原因：**
- Vue Router 使用 history 模式
- Nginx 没有配置 `try_files`

**解决方案：**

检查前端容器内的 `nginx.conf`：
```bash
docker exec -it todo-frontend cat /etc/nginx/conf.d/default.conf
```

应该包含：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

如果没有，修改 `frontend/nginx.conf`，重新构建：
```bash
docker compose build frontend
docker compose up -d frontend
```

#### 问题 4：Docker 镜像构建失败

**症状：**
```
docker compose build
# 报错：ERROR [builder 3/5] RUN mvn dependency:go-offline
```

**排查步骤：**

```bash
# 1. 查看详细错误
docker compose build --no-cache

# 2. 检查 Dockerfile
cat backend-java/Dockerfile

# 3. 检查网络连接（Maven 需要下载依赖）
ping maven.aliyun.com

# 4. 使用国内镜像源
# 在 backend-java/Dockerfile 中添加：
# RUN mkdir -p /root/.m2 && echo '<settings>...</settings>' > /root/.m2/settings.xml
```

**解决方案：**
- 检查网络连接
- 使用国内 Maven 镜像源（阿里云）
- 增加 Docker 构建超时时间

### 5.4 数据库备份

#### 手动备份

```bash
# 备份数据库
docker exec todo-mysql mysqldump -uroot -p'Todo@2024SecurePassword' todo_db > backup_$(date +%Y%m%d).sql

# 查看备份文件
ls -lh backup_*.sql
```

#### 恢复数据库

```bash
# 恢复数据库
docker exec -i todo-mysql mysql -uroot -p'Todo@2024SecurePassword' todo_db < backup_20260205.sql
```

#### 自动备份脚本

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash

# 备份目录
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 日期格式
DATE=$(date +%Y%m%d_%H%M%S)

# 备份文件名
BACKUP_FILE="$BACKUP_DIR/todo_db_$DATE.sql"

# 执行备份
docker exec todo-mysql mysqldump -uroot -p'Todo@2024SecurePassword' todo_db > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**设置定时备份：**

```bash
# 添加可执行权限
chmod +x backup.sh

# 编辑定时任务
crontab -e

# 添加一行（每天凌晨 2 点备份）
0 2 * * * /root/backup.sh >> /root/backup.log 2>&1
```

---

## 第 6 章：生产环境优化

### 6.1 配置 HTTPS（免费 SSL 证书）

**为什么需要 HTTPS？**
- 🔒 加密传输，保护用户隐私
- 🚀 HTTP/2 支持，提升性能
- ✅ 浏览器不再显示"不安全"警告
- 📈 SEO 加分

#### 前置条件

1. 拥有一个域名（如 `todo.example.com`）
2. 域名已解析到服务器 IP

#### 安装 Certbot

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt install certbot python3-certbot-nginx -y
```

#### 获取 SSL 证书

```bash
# 自动配置 HTTPS
sudo certbot --nginx -d todo.example.com

# 按提示操作：
# 1. 输入邮箱（用于证书过期提醒）
# 2. 同意服务条款
# 3. 选择是否重定向 HTTP 到 HTTPS（推荐选择 2）
```

**完成后，Certbot 会自动：**
- 修改 Nginx 配置，添加 SSL 配置
- 重启 Nginx

#### 自动续期

Let's Encrypt 证书有效期 90 天，需要定期续期：

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 启用自动续期（系统已默认配置）
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 查看续期任务
sudo systemctl list-timers | grep certbot
```

#### 验证 HTTPS

浏览器访问：`https://todo.example.com`

应该能看到绿色的小锁图标🔒

### 6.2 性能优化

#### 启用 Gzip 压缩（Nginx）

编辑 `/etc/nginx/nginx.conf`：

```nginx
http {
    # ... 其他配置

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
}
```

重启 Nginx：
```bash
sudo systemctl reload nginx
```

#### 设置 Docker 日志大小限制

编辑 `docker-compose.yml`，为每个服务添加：

```yaml
services:
  backend:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"      # 单个日志文件最大 10MB
        max-file: "3"        # 保留 3 个日志文件
```

应用配置：
```bash
docker compose down
docker compose up -d
```

#### 数据库连接池优化

编辑 `backend-java/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10        # 最大连接数
      minimum-idle: 5              # 最小空闲连接数
      connection-timeout: 30000    # 连接超时 30 秒
      idle-timeout: 600000         # 空闲超时 10 分钟
```

### 6.3 安全加固

#### 1. 修改 SSH 端口（可选）

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改端口（例如改为 2222）
Port 2222

# 禁止 root 直接登录（推荐）
PermitRootLogin no

# 重启 SSH 服务
sudo systemctl restart ssh

# 更新防火墙
sudo ufw allow 2222
sudo ufw delete allow 22
```

**注意：**修改后记得用新端口连接：`ssh -p 2222 user@IP`

#### 2. 定期更新系统

```bash
# 每周执行一次
sudo apt update && sudo apt upgrade -y
```

#### 3. 设置 fail2ban（防暴力破解）

```bash
# 安装 fail2ban
sudo apt install fail2ban -y

# 启动服务
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 查看状态
sudo fail2ban-client status
```

#### 4. 数据库密码加强

修改 `docker-compose.yml`：
```yaml
environment:
  MYSQL_ROOT_PASSWORD: "$(openssl rand -base64 32)"  # 使用强随机密码
```

### 6.4 监控和日志

#### 查看系统资源占用

```bash
# 实时监控
htop  # 需要先安装：sudo apt install htop

# 磁盘使用情况
df -h

# 内存使用情况
free -h

# Docker 容器资源占用
docker stats
```

#### 集中查看日志

```bash
# 查看所有服务日志（最近 100 行）
docker compose logs --tail 100

# 查看错误日志
docker compose logs | grep -i error

# 查看特定时间段日志
docker compose logs --since 2h  # 最近 2 小时
docker compose logs --since 2024-02-05T10:00:00
```

---

## 附录：常见问题

### Q1: Docker 镜像构建很慢怎么办？

**原因：**网络问题，下载依赖慢

**解决方案：**

1. **使用国内镜像源**

   编辑 `/etc/docker/daemon.json`：
   ```json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://hub-mirror.c.163.com"
     ]
   }
   ```

   重启 Docker：
   ```bash
   sudo systemctl restart docker
   ```

2. **Maven 使用阿里云镜像**

   在 `backend-java/Dockerfile` 中添加：
   ```dockerfile
   RUN mkdir -p /root/.m2 && \
       echo '<settings><mirrors><mirror><id>aliyun</id><mirrorOf>*</mirrorOf><url>https://maven.aliyun.com/repository/public</url></mirror></mirrors></settings>' > /root/.m2/settings.xml
   ```

### Q2: 内存不足怎么办？

**症状：**
- 容器频繁重启
- `docker stats` 显示内存占用 > 80%

**解决方案：**

1. **限制 Java 堆内存**

   修改 `docker-compose.yml`：
   ```yaml
   backend:
     environment:
       JAVA_OPTS: "-Xmx512m -Xms256m"
   ```

2. **创建 Swap 交换空间**

   ```bash
   # 创建 2GB swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile

   # 永久生效
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

### Q3: 如何查看 Docker 容器内的文件？

```bash
# 列出容器内文件
docker exec todo-backend ls -la /app

# 查看容器内文件内容
docker exec todo-backend cat /app/application.yml

# 复制容器内文件到本地
docker cp todo-backend:/app/logs/app.log ./app.log
```

### Q4: 如何回滚到之前的版本？

```bash
# 查看 Git 提交历史
git log --oneline

# 回滚到指定版本
git checkout <commit-hash>

# 重新构建和部署
docker compose build
docker compose up -d
```

### Q5: 如何在多个服务器部署？

**方案一：手动部署**
- 在每个服务器重复本指南的步骤

**方案二：使用 Docker Swarm**
- 学习 Docker Swarm 进行多服务器编排

**方案三：使用 CI/CD**
- 使用 GitHub Actions 自动部署到多台服务器

### Q6: 如何更换域名？

```bash
# 1. 修改 Nginx 配置
sudo nano /etc/nginx/sites-available/todo-app
# 修改 server_name

# 2. 测试配置
sudo nginx -t

# 3. 重启 Nginx
sudo systemctl reload nginx

# 4. 如果启用了 HTTPS，重新申请证书
sudo certbot --nginx -d new-domain.com
```

---

## 🎉 总结

恭喜你完成了从前端到全栈的第一步！

### 你学会了什么

✅ **Docker 容器化**
- 理解镜像、容器、Dockerfile
- 多阶段构建优化镜像体积
- Docker Compose 编排多容器应用

✅ **Nginx 反向代理**
- 静态文件托管
- API 请求转发
- 解决 Vue Router history 模式 404 问题

✅ **Linux 服务器管理**
- SSH 远程连接
- 基础命令操作
- 防火墙配置
- 进程管理

✅ **运维实践**
- 查看日志排查问题
- 数据库备份
- 代码更新部署
- HTTPS 配置

### 下一步学习方向

1. **CI/CD 自动化部署**
   - GitHub Actions 自动构建和部署
   - Webhook 监听代码更新

2. **监控和告警**
   - Prometheus + Grafana 性能监控
   - 日志聚合分析

3. **高级 Docker 技巧**
   - 镜像优化
   - 多环境配置

4. **负载均衡和高可用**
   - Nginx 负载均衡
   - MySQL 主从复制

### 常用命令速查表

```bash
# Docker
docker compose ps                  # 查看容器状态
docker compose logs -f backend     # 查看日志
docker compose restart backend     # 重启服务
docker compose up -d --build       # 更新并重启

# Nginx
sudo nginx -t                      # 测试配置
sudo systemctl reload nginx        # 重新加载配置
sudo tail -f /var/log/nginx/error.log  # 查看错误日志

# 系统
df -h                              # 磁盘使用
free -h                            # 内存使用
top                                # CPU/内存占用
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看本文档的"常见问题"章节
2. 查看日志：`docker compose logs -f`
3. 搜索错误信息（Google / Stack Overflow）
4. 在项目 GitHub 提 Issue

祝你部署顺利！🚀

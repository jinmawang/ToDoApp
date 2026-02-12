# 腾讯云部署实施计划 (Tencent Cloud Deployment Plan)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Vue 3 前端和 Spring Boot 后端部署到腾讯云 Ubuntu 24 服务器，通过域名 tianma.chat 访问

**Architecture:**
- Nginx 作为反向代理，处理 HTTPS 和静态文件服务
- Spring Boot 后端运行在 Docker 容器中（端口 3002）
- MySQL 数据库运行在 Docker 容器中（端口 3306）
- 前端静态文件由 Nginx 直接服务
- 域名 tianma.chat 通过 Nginx 路由到前端和后端

**Tech Stack:** Docker, Docker Compose, Nginx, Let's Encrypt (HTTPS), MySQL 8, Spring Boot 3, Vue 3

---

## 前置条件 Prerequisites

- 腾讯云服务器已安装 Docker 和 Nginx
- 域名 tianma.chat 已购买
- 本地已安装 JDK 17+ 和 Maven（用于构建 Java 项目）
- 本地已安装 Node.js 18+（用于构建前端项目）

---

## Task 1: 域名解析配置 (DNS Configuration)

**Files:**
- 无本地文件修改，在腾讯云控制台操作

**Step 1: 登录腾讯云 DNS 控制台**

访问腾讯云 DNS 解析控制台：https://console.cloud.tencent.com/cns

**Step 2: 添加 A 记录**

添加以下 DNS 记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | [你的服务器公网IP] | 600 |
| www | A | [你的服务器公网IP] | 600 |
| api | A | [你的服务器公网IP] | 600 |

**Step 3: 验证 DNS 解析**

等待 DNS 生效后（通常 5-10 分钟），运行：

```bash
ping tianma.chat
ping www.tianma.chat
ping api.tianma.chat
```

Expected: 返回你的服务器 IP 地址

---

## Task 2: 创建 Docker 配置文件 (Create Docker Configuration)

**Files:**
- Create: `docker/Dockerfile.backend`
- Create: `docker/docker-compose.yml`
- Create: `docker/.env.production`

**Step 1: 创建 docker 目录**

```bash
mkdir -p docker
```

**Step 2: 创建后端 Dockerfile**

Create file: `docker/Dockerfile.backend`

```dockerfile
# 多阶段构建 - 构建阶段
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# 复制 pom.xml 并下载依赖（利用 Docker 缓存）
COPY backend-java/pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY backend-java/src ./src
RUN mvn clean package -DskipTests -B

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/target/*.jar app.jar

# 设置所有权
RUN chown -R appuser:appgroup /app

USER appuser

# 暴露端口
EXPOSE 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

**Step 3: 创建 docker-compose.yml**

Create file: `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: tianma-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: todo_db
      MYSQL_CHARACTER_SET_SERVER: utf8mb4
      MYSQL_COLLATION_SERVER: utf8mb4_unicode_ci
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "127.0.0.1:3306:3306"
    networks:
      - tianma-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # Spring Boot 后端
  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    container_name: tianma-backend
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/todo_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SERVER_PORT: 3002
    ports:
      - "127.0.0.1:3002:3002"
    networks:
      - tianma-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3002/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  tianma-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

**Step 4: 创建环境变量文件**

Create file: `docker/.env.production`

```bash
# MySQL 配置
MYSQL_ROOT_PASSWORD=your_secure_password_here_change_me

# JWT 配置
JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long

# 应用配置
APP_ENV=production
```

**Step 5: 创建数据库初始化脚本**

Create file: `docker/init.sql`

```sql
-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 确保数据库存在
CREATE DATABASE IF NOT EXISTS todo_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE todo_db;

-- 授予权限
GRANT ALL PRIVILEGES ON todo_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

**Step 6: 提交配置文件**

```bash
git add docker/
git commit -m "feat: add Docker configuration for production deployment"
```

---

## Task 3: 修改 Spring Boot 生产环境配置 (Update Spring Boot Production Config)

**Files:**
- Create: `backend-java/src/main/resources/application-prod.yml`
- Modify: `backend-java/pom.xml` (添加 actuator 依赖)

**Step 1: 创建生产环境配置文件**

Create file: `backend-java/src/main/resources/application-prod.yml`

```yaml
server:
  port: ${SERVER_PORT:3002}

spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/todo_db}
    username: ${SPRING_DATASOURCE_USERNAME:root}
    password: ${SPRING_DATASOURCE_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        dialect: org.hibernate.dialect.MySQLDialect

# JWT 配置
jwt:
  secret: ${JWT_SECRET:default-secret-key-change-in-production}
  expiration: 86400000

# Actuator 健康检查
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: never

# 日志配置
logging:
  level:
    root: INFO
    com.todo.app: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

**Step 2: 添加 Actuator 依赖到 pom.xml**

Modify file: `backend-java/pom.xml`

在 `<dependencies>` 中添加：

```xml
<!-- Spring Boot Actuator for health checks -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Step 3: 验证配置**

```bash
cd backend-java
mvn clean compile
```

Expected: BUILD SUCCESS

**Step 4: 提交更改**

```bash
git add backend-java/src/main/resources/application-prod.yml backend-java/pom.xml
git commit -m "feat: add production configuration for Spring Boot"
```

---

## Task 4: 配置前端生产环境 (Configure Frontend for Production)

**Files:**
- Create: `frontend/.env.production`
- Modify: `frontend/src/config/api.ts`

**Step 1: 创建前端生产环境配置**

Create file: `frontend/.env.production`

```bash
# 生产环境 API 配置
VITE_API_BASE_URL=https://api.tianma.chat
```

**Step 2: 修改 API 配置文件支持生产环境**

Modify file: `frontend/src/config/api.ts`

将文件内容改为：

```typescript
// API 配置
// 生产环境使用 VITE_API_BASE_URL，开发环境使用 VITE_API_PORT

const getApiBaseUrl = (): string => {
  // 生产环境：使用完整的 API URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 开发环境：使用端口号
  const port = import.meta.env.VITE_API_PORT || '3000';
  return `http://localhost:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

export default {
  baseURL: API_BASE_URL,
};
```

**Step 3: 测试本地构建**

```bash
cd frontend
npm run build
```

Expected: 构建成功，生成 `dist/` 目录

**Step 4: 提交更改**

```bash
git add frontend/.env.production frontend/src/config/api.ts
git commit -m "feat: add production environment configuration for frontend"
```

---

## Task 5: 创建 Nginx 配置 (Create Nginx Configuration)

**Files:**
- Create: `nginx/tianma.chat.conf`
- Create: `nginx/ssl-params.conf`

**Step 1: 创建 nginx 配置目录**

```bash
mkdir -p nginx
```

**Step 2: 创建主站 Nginx 配置**

Create file: `nginx/tianma.chat.conf`

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tianma.chat www.tianma.chat api.tianma.chat;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# 主站 HTTPS (前端)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tianma.chat www.tianma.chat;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/tianma.chat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tianma.chat/privkey.pem;

    # SSL 配置
    include /etc/nginx/snippets/ssl-params.conf;

    # 前端静态文件根目录
    root /var/www/tianma.chat;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    gzip_comp_level 6;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# API HTTPS (后端)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.tianma.chat;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/tianma.chat/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tianma.chat/privkey.pem;

    # SSL 配置
    include /etc/nginx/snippets/ssl-params.conf;

    # 反向代理到后端
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # CORS 预检请求处理
    location ~ ^/api {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://tianma.chat' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Step 3: 创建 SSL 参数配置**

Create file: `nginx/ssl-params.conf`

```nginx
# SSL 协议配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

# SSL 加密套件
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# SSL 会话配置
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# DH 参数 (需要在服务器上生成)
# ssl_dhparam /etc/nginx/dhparam.pem;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;
```

**Step 4: 提交配置**

```bash
git add nginx/
git commit -m "feat: add Nginx configuration for tianma.chat deployment"
```

---

## Task 6: 创建部署脚本 (Create Deployment Scripts)

**Files:**
- Create: `scripts/deploy.sh`
- Create: `scripts/setup-server.sh`
- Create: `scripts/ssl-setup.sh`

**Step 1: 创建 scripts 目录**

```bash
mkdir -p scripts
```

**Step 2: 创建服务器初始化脚本**

Create file: `scripts/setup-server.sh`

```bash
#!/bin/bash
set -e

echo "=== 天马云服务器初始化脚本 ==="
echo "适用于: Ubuntu 24 LTS"

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 更新系统
echo ">>> 更新系统包..."
apt update && apt upgrade -y

# 安装必要工具
echo ">>> 安装必要工具..."
apt install -y curl wget git vim ufw certbot python3-certbot-nginx

# 配置防火墙
echo ">>> 配置防火墙..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 创建应用目录
echo ">>> 创建应用目录..."
mkdir -p /var/www/tianma.chat
mkdir -p /var/www/certbot
mkdir -p /opt/tianma

# 设置权限
chown -R www-data:www-data /var/www/tianma.chat
chmod -R 755 /var/www/tianma.chat

# 创建 Nginx 配置目录
mkdir -p /etc/nginx/snippets

echo "=== 服务器初始化完成 ==="
echo "下一步: 运行 ssl-setup.sh 配置 SSL 证书"
```

**Step 3: 创建 SSL 证书配置脚本**

Create file: `scripts/ssl-setup.sh`

```bash
#!/bin/bash
set -e

DOMAIN="tianma.chat"
EMAIL="your-email@example.com"  # 修改为你的邮箱

echo "=== SSL 证书配置脚本 ==="

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 停止 Nginx（如果正在运行）
systemctl stop nginx || true

# 申请证书
echo ">>> 申请 Let's Encrypt SSL 证书..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# 复制 SSL 参数配置
echo ">>> 配置 SSL 参数..."
cp /opt/tianma/nginx/ssl-params.conf /etc/nginx/snippets/

# 生成 DH 参数（这可能需要几分钟）
echo ">>> 生成 DH 参数（这可能需要几分钟）..."
openssl dhparam -out /etc/nginx/dhparam.pem 2048

# 设置自动续期
echo ">>> 配置证书自动续期..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "=== SSL 证书配置完成 ==="
echo "证书位置: /etc/letsencrypt/live/$DOMAIN/"
```

**Step 4: 创建部署脚本**

Create file: `scripts/deploy.sh`

```bash
#!/bin/bash
set -e

echo "=== 天马应用部署脚本 ==="

# 配置变量
PROJECT_DIR="/opt/tianma"
FRONTEND_DIR="/var/www/tianma.chat"
NGINX_CONF="/etc/nginx/sites-available/tianma.chat"

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
echo ">>> 拉取最新代码..."
git pull origin main

# 构建前端
echo ">>> 构建前端..."
cd frontend
npm ci
npm run build

# 部署前端文件
echo ">>> 部署前端文件..."
rm -rf $FRONTEND_DIR/*
cp -r dist/* $FRONTEND_DIR/
chown -R www-data:www-data $FRONTEND_DIR

# 返回项目根目录
cd $PROJECT_DIR

# 更新 Nginx 配置
echo ">>> 更新 Nginx 配置..."
cp nginx/tianma.chat.conf $NGINX_CONF
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl reload nginx

# 构建并启动 Docker 容器
echo ">>> 构建并启动 Docker 容器..."
cd docker

# 如果存在旧容器，先停止
docker compose down || true

# 构建新镜像
docker compose build --no-cache

# 启动容器
docker compose up -d

# 等待服务启动
echo ">>> 等待服务启动..."
sleep 30

# 检查服务状态
echo ">>> 检查服务状态..."
docker compose ps
docker compose logs --tail=20 backend

# 健康检查
echo ">>> 执行健康检查..."
curl -f http://localhost:3002/actuator/health || echo "后端健康检查失败"

echo "=== 部署完成 ==="
echo "前端: https://tianma.chat"
echo "API: https://api.tianma.chat"
```

**Step 5: 设置脚本可执行权限**

```bash
chmod +x scripts/*.sh
```

**Step 6: 提交脚本**

```bash
git add scripts/
git commit -m "feat: add deployment scripts for Tencent Cloud"
```

---

## Task 7: 修改 Spring Boot CORS 配置 (Update CORS Configuration)

**Files:**
- Modify: `backend-java/src/main/java/com/todo/app/security/WebSecurityConfig.java`

**Step 1: 查看当前 CORS 配置**

检查 `backend-java/src/main/java/com/todo/app/security/WebSecurityConfig.java` 中的 CORS 配置

**Step 2: 更新 CORS 配置支持生产环境**

确保 CORS 配置允许来自 `https://tianma.chat` 的请求。

在 `WebSecurityConfig.java` 中添加或修改 CORS 配置：

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // 允许的来源
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",      // 本地开发
        "http://localhost:3000",      // 本地开发
        "https://tianma.chat",        // 生产环境
        "https://www.tianma.chat"     // 生产环境 www
    ));

    // 允许的方法
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    // 允许的请求头
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));

    // 允许携带凭证
    configuration.setAllowCredentials(true);

    // 预检请求缓存时间
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Step 3: 测试编译**

```bash
cd backend-java
mvn clean compile
```

Expected: BUILD SUCCESS

**Step 4: 提交更改**

```bash
git add backend-java/src/main/java/com/todo/app/security/WebSecurityConfig.java
git commit -m "feat: update CORS configuration for production deployment"
```

---

## Task 8: 服务器首次部署 (Initial Server Deployment)

**Files:**
- 无本地文件修改，在服务器上操作

**Step 1: SSH 连接到服务器**

```bash
ssh root@[你的服务器IP]
```

**Step 2: 运行服务器初始化脚本**

```bash
# 克隆项目到服务器
cd /opt
git clone https://github.com/[你的用户名]/nestjs.git tianma

# 进入项目目录
cd tianma

# 运行初始化脚本
chmod +x scripts/*.sh
./scripts/setup-server.sh
```

**Step 3: 配置 SSL 证书**

修改 `scripts/ssl-setup.sh` 中的邮箱地址，然后运行：

```bash
./scripts/ssl-setup.sh
```

**Step 4: 配置环境变量**

```bash
cd docker

# 复制并编辑环境变量文件
cp .env.production .env

# 编辑 .env 文件，设置安全的密码
vim .env
```

设置以下值：
```
MYSQL_ROOT_PASSWORD=你的安全MySQL密码
JWT_SECRET=你的JWT密钥至少32字符
```

**Step 5: 运行部署脚本**

```bash
cd /opt/tianma
./scripts/deploy.sh
```

Expected:
- 前端构建成功
- Docker 容器启动成功
- Nginx 配置测试通过
- 健康检查通过

**Step 6: 验证部署**

在浏览器中访问：
- https://tianma.chat - 应显示前端页面
- https://api.tianma.chat/actuator/health - 应返回 `{"status":"UP"}`

---

## Task 9: 配置 CI/CD (Optional - GitHub Actions)

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: 创建 GitHub Actions 工作流目录**

```bash
mkdir -p .github/workflows
```

**Step 2: 创建部署工作流**

Create file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Tencent Cloud

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/tianma
            ./scripts/deploy.sh
```

**Step 3: 在 GitHub 配置 Secrets**

在 GitHub 仓库设置中添加以下 Secrets：
- `SERVER_HOST`: 你的服务器 IP
- `SERVER_USER`: root 或部署用户
- `SERVER_SSH_KEY`: SSH 私钥

**Step 4: 提交工作流**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deployment workflow"
git push origin main
```

---

## Task 10: 日常运维命令 (Daily Operations)

**常用命令参考：**

```bash
# === 查看服务状态 ===
cd /opt/tianma/docker
docker compose ps
docker compose logs -f backend
docker compose logs -f mysql

# === 重启服务 ===
docker compose restart backend
docker compose restart mysql

# === 查看 Nginx 状态 ===
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log

# === 手动部署更新 ===
cd /opt/tianma
./scripts/deploy.sh

# === 数据库备份 ===
docker exec tianma-mysql mysqldump -uroot -p$MYSQL_ROOT_PASSWORD todo_db > backup_$(date +%Y%m%d).sql

# === 查看磁盘使用 ===
df -h
docker system df

# === 清理 Docker 缓存 ===
docker system prune -af

# === SSL 证书续期（手动） ===
certbot renew --dry-run
certbot renew

# === 查看证书有效期 ===
certbot certificates
```

---

## 部署清单 Checklist

- [ ] Task 1: DNS 解析配置完成
- [ ] Task 2: Docker 配置文件创建完成
- [ ] Task 3: Spring Boot 生产环境配置完成
- [ ] Task 4: 前端生产环境配置完成
- [ ] Task 5: Nginx 配置完成
- [ ] Task 6: 部署脚本创建完成
- [ ] Task 7: CORS 配置更新完成
- [ ] Task 8: 服务器首次部署完成
- [ ] Task 9: (可选) CI/CD 配置完成
- [ ] Task 10: 验证所有功能正常

---

## 故障排查 Troubleshooting

### 问题 1: 后端无法连接数据库

```bash
# 检查 MySQL 容器状态
docker compose logs mysql

# 检查网络连接
docker network ls
docker network inspect tianma-network
```

### 问题 2: Nginx 502 Bad Gateway

```bash
# 检查后端是否运行
docker compose ps
curl http://localhost:3002/actuator/health

# 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 问题 3: SSL 证书问题

```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew --force-renewal
```

### 问题 4: 前端 API 请求失败

1. 检查浏览器开发者工具 Network 标签
2. 确认 `VITE_API_BASE_URL` 配置正确
3. 检查 CORS 配置是否正确

---

## 安全建议

1. **修改默认密码**: 确保 MySQL 和 JWT 使用强密码
2. **定期更新**: 定期更新系统和 Docker 镜像
3. **备份数据**: 设置定时数据库备份任务
4. **监控告警**: 考虑添加服务监控（如 Prometheus + Grafana）
5. **日志管理**: 配置日志轮转，避免磁盘满
6. **防火墙**: 仅开放必要端口（80, 443, 22）

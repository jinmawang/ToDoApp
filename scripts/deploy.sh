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
cd "$PROJECT_DIR"

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

# 安全检查
if [ -z "$FRONTEND_DIR" ] || [ "$FRONTEND_DIR" = "/" ]; then
    echo "错误: FRONTEND_DIR 未设置或无效"
    exit 1
fi

rm -rf "$FRONTEND_DIR"/*
cp -r dist/* "$FRONTEND_DIR"/
chown -R www-data:www-data "$FRONTEND_DIR"

# 返回项目根目录
cd "$PROJECT_DIR"

# 更新 Nginx 配置
echo ">>> 更新 Nginx 配置..."
cp nginx/tianma.chat.conf "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

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

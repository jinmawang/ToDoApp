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

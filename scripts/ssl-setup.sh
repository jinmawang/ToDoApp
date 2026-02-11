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

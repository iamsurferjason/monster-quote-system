#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Agent C – Let's Encrypt SSL 初始化腳本
# 使用方式：bash scripts/init-letsencrypt.sh
# 執行前提：
#   1. 已設定 .env（DOMAIN、CERTBOT_EMAIL）
#   2. 網域 DNS 已指向此伺服器（Port 80 對外開放）
# ──────────────────────────────────────────────────────────────────────────────

set -e

# ── 載入 .env ─────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
    echo "❌ 找不到 .env，請先複製 .env.example 並填入設定"
    exit 1
fi
# 只讀取需要的變數（避免 source 整個 .env 造成問題）
DOMAIN=$(grep -E '^DOMAIN=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")
EMAIL=$(grep -E '^CERTBOT_EMAIL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$DOMAIN" ]; then
    echo "❌ .env 中未設定 DOMAIN"
    exit 1
fi
if [ -z "$EMAIL" ]; then
    echo "❌ .env 中未設定 CERTBOT_EMAIL"
    exit 1
fi

echo "========================================"
echo "  Monster Quote System – SSL 初始化"
echo "  Domain : $DOMAIN"
echo "  Email  : $EMAIL"
echo "========================================"

# ── Step 1：啟動 nginx（HTTP 模式）─────────────────────────────────────────────
echo ""
echo "▶ Step 1：啟動 nginx（HTTP 模式）..."
docker compose up -d nginx
sleep 3

# ── Step 2：申請 Let's Encrypt 憑證 ────────────────────────────────────────────
echo ""
echo "▶ Step 2：申請 Let's Encrypt 憑證..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "✅ 憑證申請成功"

# ── Step 3：切換到 HTTPS 設定 ───────────────────────────────────────────────────
echo ""
echo "▶ Step 3：切換到 HTTPS 設定..."

# 備份 HTTP-only 設定（不刪除，改為 .bak）
if [ -f nginx/conf.d/default.conf ]; then
    mv nginx/conf.d/default.conf nginx/conf.d/default.conf.bak
    echo "  → nginx/conf.d/default.conf 已備份為 default.conf.bak"
fi

# nginx 會自動從 templates/ 產生 ssl.conf
echo "  → HTTPS template 將在 nginx reload 後生效"

# ── Step 4：Reload nginx ────────────────────────────────────────────────────────
echo ""
echo "▶ Step 4：Reload nginx..."
docker compose up -d nginx
sleep 2
docker compose exec nginx nginx -s reload

echo ""
echo "========================================"
echo "✅ SSL 設定完成！"
echo ""
echo "  前端  → https://$DOMAIN"
echo "  API   → https://$DOMAIN/api"
echo ""
echo "建議更新 .env："
echo "  CORS_ORIGIN=https://$DOMAIN"
echo "  NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN/api"
echo "  （更新後需重新 build：docker compose up -d --build web api）"
echo "========================================"

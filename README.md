# Monster Quote System

報價管理系統，技術棧：

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js (standalone)
- **部署**: Docker Compose（NAS / Portainer）

## 功能

- 使用者管理（JWT 認證）
- 客戶管理
- 產品管理
- 報價單（含 PDF 匯出）
- 訂單管理
- 交易紀錄（Trade Phase 1）
- Dashboard 統計

## 作者

Jason Chen

---

## 部署指南（NAS / Portainer）

### 前置需求

- NAS 已安裝 Docker 與 Docker Compose
- 建議透過 Portainer Stacks 管理

### 步驟一：取得專案

```bash
# SSH 進入 NAS
ssh admin@YOUR_NAS_IP

# 建立目錄並 clone（或手動上傳）
mkdir -p /volume1/docker/monster-quote-system
cd /volume1/docker/monster-quote-system
git clone <repo-url> .
```

### 步驟二：建立 .env

```bash
cp .env.example .env
vi .env
```

必填欄位：

| 變數 | 說明 | 範例 |
|------|------|------|
| `POSTGRES_USER` | DB 帳號 | `admin` |
| `POSTGRES_PASSWORD` | DB 密碼（強密碼）| `Str0ng!Pass` |
| `POSTGRES_DB` | DB 名稱 | `monster_quote_db` |
| `POSTGRES_EXTERNAL_PORT` | NAS 對外 DB port | `5433` |
| `JWT_SECRET` | JWT 簽名金鑰（長隨機字串）| `...` |
| `CORS_ORIGIN` | 允許的前端網址 | `http://192.168.1.100:3001` |
| `API_PORT` | API 對外 port | `3000` |
| `WEB_PORT` | 前端對外 port | `3001` |
| `NEXT_PUBLIC_API_BASE_URL` | 瀏覽器存取 API 的網址 | `http://192.168.1.100:3000` |
| `DATABASE_URL` | Prisma CLI 用連線字串 | `postgresql://admin:pass@IP:5433/db?schema=public` |

### 步驟三：啟動服務

```bash
docker compose up -d --build
```

啟動順序：
1. `db` → PostgreSQL 啟動並健康
2. `migrate` → 自動執行 `prisma migrate deploy`
3. `api` → NestJS API 啟動
4. `web` → Next.js 前端啟動

### 步驟四：確認服務狀態

```bash
# 查看所有容器
docker compose ps

# 查看 API log
docker compose logs api --tail=50

# 健康檢查
curl http://localhost:3000/health
```

### Portainer Stacks 方式

1. Portainer → **Stacks** → **Add stack**
2. 選 **Upload** 上傳 `docker-compose.yml`
3. 在 **Environment variables** 填入所有 `.env` 變數
4. 點 **Deploy the stack**

### 連線位址

| 服務 | 網址 |
|------|------|
| 前端 | `http://YOUR_NAS_IP:3001` |
| API  | `http://YOUR_NAS_IP:3000` |
| API Health | `http://YOUR_NAS_IP:3000/health` |

### 更新部署

```bash
git pull
docker compose up -d --build
```

### 重置資料庫（謹慎！）

```bash
docker compose down -v          # 刪除 volume（資料會消失）
docker compose up -d --build    # 重新建立
```

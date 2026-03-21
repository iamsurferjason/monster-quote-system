#!/bin/sh
# ──────────────────────────────────────────────────────────────────────────────
# Agent D – PostgreSQL 自動備份腳本
# 執行環境：monster-db-backup 容器（postgres:16-alpine）
# 備份位置：/backups/（對應 host 的 backup-data volume）
# ──────────────────────────────────────────────────────────────────────────────

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

echo "${LOG_PREFIX} ▶ 開始備份資料庫: ${POSTGRES_DB}"
echo "${LOG_PREFIX}   主機: ${POSTGRES_HOST}:5432"
echo "${LOG_PREFIX}   備份檔: ${BACKUP_FILE}"
echo "${LOG_PREFIX}   保留天數: ${RETENTION_DAYS} 天"

# ── 確保備份目錄存在 ─────────────────────────────────────────────────────────
mkdir -p "${BACKUP_DIR}"

# ── 執行備份（pg_dump + gzip 壓縮）──────────────────────────────────────────
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${POSTGRES_HOST}" \
    -p 5432 \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --no-owner \
    --no-acl \
    --format=plain \
    | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "${LOG_PREFIX} ✅ 備份完成（大小：${BACKUP_SIZE}）"

# ── 清理過期備份 ─────────────────────────────────────────────────────────────
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} | wc -l | tr -d ' ')
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "${LOG_PREFIX} 🧹 已刪除 ${DELETED_COUNT} 個過期備份（>${RETENTION_DAYS} 天）"

# ── 顯示現有備份清單 ─────────────────────────────────────────────────────────
echo "${LOG_PREFIX} 📦 目前備份清單："
ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | awk '{print "    " $5 "  " $9}' || echo "    （無備份檔）"

echo "${LOG_PREFIX} ── 備份作業結束 ──"

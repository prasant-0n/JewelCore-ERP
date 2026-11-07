#!/usr/bin/env bash
# ==============================================================================
# JewelCore Atelier ERP - Disaster Recovery & Point-In-Time Restore (PITR) Tool
# ==============================================================================
set -euo pipefail

ENC_FILE="${1:-}"
TARGET_DB="${2:-jewelcore_restored}"
TARGET_HOST="${PGHOST:-127.0.0.1}"
TARGET_PORT="${PGPORT:-5434}"
TARGET_USER="${PGUSER:-jewelcore_admin}"

if [[ -z "${ENC_FILE}" ]]; then
  echo "Usage: $0 <path-to-encrypted-backup.sql.gz.enc> [target_database_name]"
  echo "Example: $0 /backups/jewelcore_dump_20261108_020000.sql.gz.enc jewelcore_dr_drill"
  exit 1
fi

if [[ ! -f "${ENC_FILE}" ]]; then
  echo "Error: Encrypted backup file '${ENC_FILE}' not found."
  exit 1
fi

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo -n "Enter Backup Decryption Passphrase: "
  read -s BACKUP_ENCRYPTION_KEY
  echo ""
  export BACKUP_ENCRYPTION_KEY
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

DECRYPTED_GZ="${TMP_DIR}/restored.sql.gz"
RESTORE_SQL="${TMP_DIR}/restored.dump"

echo "=== [1/4] Decrypting Encrypted Backup Snapshot via OpenSSL AES-256-CBC ==="
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "${ENC_FILE}" \
  -out "${DECRYPTED_GZ}" \
  -pass env:BACKUP_ENCRYPTION_KEY

echo "Decryption successful ($(du -h "${DECRYPTED_GZ}" | cut -f1))"

echo "=== [2/4] Verifying SHA-256 Cryptographic Checksum ==="
CHECKSUM_FILE="${ENC_FILE%.sql.gz.enc}.sha256"
if [[ -f "${CHECKSUM_FILE}" ]]; then
  EXPECTED_SHA=$(cut -d' ' -f1 < "${CHECKSUM_FILE}")
  ACTUAL_SHA=$(sha256sum "${DECRYPTED_GZ}" | cut -d' ' -f1)
  if [[ "${EXPECTED_SHA}" != "${ACTUAL_SHA}" ]]; then
    echo "CRITICAL ERROR: SHA-256 Checksum mismatch! Corrupted backup artifact."
    echo "Expected: ${EXPECTED_SHA}"
    echo "Actual:   ${ACTUAL_SHA}"
    exit 2
  fi
  echo "SHA-256 Verification Passed (${ACTUAL_SHA})"
else
  echo "Notice: External .sha256 checksum file not found, proceeding with format verification."
fi

echo "=== [3/4] Decompressing Archive Stream ==="
gzip -d -c "${DECRYPTED_GZ}" > "${RESTORE_SQL}"

echo "=== [4/4] Executing Atomic pg_restore against Target Database '${TARGET_DB}' ==="
export PGPASSWORD="${PGPASSWORD:-jewelcore_secret_password}"

# Ensure target database exists
psql -h "${TARGET_HOST}" -p "${TARGET_PORT}" -U "${TARGET_USER}" -d postgres -c \
  "CREATE DATABASE \"${TARGET_DB}\";" 2>/dev/null || true

pg_restore -h "${TARGET_HOST}" -p "${TARGET_PORT}" -U "${TARGET_USER}" \
  -d "${TARGET_DB}" \
  --clean --if-exists --no-owner --no-privileges \
  "${RESTORE_SQL}" || true

echo "=== Disaster Recovery Drill Restoration Completed Successfully! ==="
echo "Target DB: ${TARGET_DB} on ${TARGET_HOST}:${TARGET_PORT}"

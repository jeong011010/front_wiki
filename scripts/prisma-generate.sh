#!/bin/bash
# Prisma Client 생성 (DATABASE_URL 없이도 작동)
# 빌드 시점에는 스키마만 필요하고 실제 DB 연결은 불필요

# DATABASE_URL이 없으면 더미 URL 설정 (Prisma 검증용)
# Prisma는 스키마 검증 시 URL 형식을 확인하므로 더미 URL 필요
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?sslmode=prefer"
fi

# Prisma Client 생성 (스키마만 사용, 실제 DB 연결 없음)
npx prisma generate --schema=./prisma/schema.prisma


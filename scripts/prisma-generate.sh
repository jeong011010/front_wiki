#!/bin/bash
# Prisma Client 생성 (DATABASE_URL 없이도 작동)
# 빌드 시점에는 스키마만 필요하고 실제 DB 연결은 불필요

# DATABASE_URL이 없으면 더미 URL 설정 (Prisma 검증용)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
fi

# Prisma Client 생성
npx prisma generate


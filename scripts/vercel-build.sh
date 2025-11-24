#!/bin/bash
set -e

# Vercel 빌드 스크립트
# Prisma 마이그레이션은 실행하지 않고 Client만 생성

echo "🔧 Starting Vercel build..."

# Prisma Client 생성 (마이그레이션 없이)
echo "📦 Generating Prisma Client..."
bash scripts/prisma-generate.sh

# Next.js 빌드
echo "🏗️  Building Next.js application..."
next build

echo "✅ Build completed successfully"


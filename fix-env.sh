#!/bin/bash

# .env 파일의 DATABASE_URL 수정
# pgbouncer=true일 때는 포트를 6543으로 변경

if [ -f .env ]; then
  # pgbouncer=true이고 포트가 5432인 경우 6543으로 변경
  sed -i.bak 's/:5432\/postgres?pgbouncer=true/:6543\/postgres?pgbouncer=true/g' .env
  echo "✅ .env 파일의 DATABASE_URL 포트를 6543으로 변경했습니다."
  echo "변경 내용:"
  grep DATABASE_URL .env
else
  echo "❌ .env 파일을 찾을 수 없습니다."
fi


-- Supabase SQL Editor에서 실행할 SQL
-- 마이그레이션 히스토리에 수동으로 레코드 추가

INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
) VALUES (
  gen_random_uuid()::text,
  'manual_migration_20251130185549',
  NOW(),
  '20251130185549_add_card_tier_system_fields',
  NULL,
  NULL,
  NOW(),
  1
);


-- Add per-user locale preference (BCP 47 tag, e.g. "en", "pt-BR", "zh-CN").
-- Nullable with NULL meaning "no explicit preference" — the effective value
-- resolves to the Prisma-level default ("en") for new rows and to browser
-- detection for existing users until they choose a language.
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "locale" TEXT DEFAULT 'en';

-- Migration: add holidayModeUntil to user
-- Generated for SteadyStack production database
--
-- Holiday mode suspends ALL alerting (email, Slack, Discord, status-page
-- subscriber notifications) for the account until this timestamp. Checks keep
-- running and incidents keep being recorded â€” only notifications are paused.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "holidayModeUntil" TIMESTAMP(3);

COMMENT ON COLUMN "user"."holidayModeUntil"
  IS 'When set and in the future, all alert notifications for this account are suspended until this date/time';
-- Migration: add issuer column to account table
-- Generated for SteadyStack / PulseGuard database

ALTER TABLE "account"
  ADD COLUMN IF NOT EXISTS "issuer" TEXT;

COMMENT ON COLUMN "account"."issuer"
  IS 'Issuer identifier for OAuth / OIDC accounts';
-- Migration: add showInShowcase to StatusPage
-- Generated for SteadyStack production database

ALTER TABLE "StatusPage"
  ADD COLUMN IF NOT EXISTS "showInShowcase" BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN "StatusPage"."showInShowcase"
  IS 'When true, this public status page appears in the community showcase gallery';

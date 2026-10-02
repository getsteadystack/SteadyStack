-- Migration: add holidayModeUntil to user
-- Generated for SteadyStack production database
--
-- Holiday mode suspends ALL alerting (email, Slack, Discord, status-page
-- subscriber notifications) for the account until this timestamp. Checks keep
-- running and incidents keep being recorded — only notifications are paused.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "holidayModeUntil" TIMESTAMP(3);

COMMENT ON COLUMN "user"."holidayModeUntil"
  IS 'When set and in the future, all alert notifications for this account are suspended until this date/time';

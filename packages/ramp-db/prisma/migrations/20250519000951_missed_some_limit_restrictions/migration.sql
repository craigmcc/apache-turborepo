-- AlterTable
ALTER TABLE "limits" ADD COLUMN "restrictions_allowed_categories" TEXT;
ALTER TABLE "limits" ADD COLUMN "restrictions_auto_lock_date" TEXT;
ALTER TABLE "limits" ADD COLUMN "restrictions_blocked_categories" TEXT;
ALTER TABLE "limits" ADD COLUMN "restrictions_interval" TEXT;
ALTER TABLE "limits" ADD COLUMN "restrictions_next_interval_reset" TEXT;
ALTER TABLE "limits" ADD COLUMN "restrictions_start_of_interval" TEXT;

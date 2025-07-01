-- CreateTable
CREATE TABLE "vendors_credits_approvers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT,
    "isActive" TEXT,
    "lastReminderDate" TEXT,
    "sortOrder" INTEGER,
    "status" TEXT,
    "statusChangedDate" TEXT,
    "userId" TEXT NOT NULL,
    "vendorCreditId" TEXT NOT NULL,
    CONSTRAINT "vendors_credits_approvers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_approvers_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "vendors_credits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

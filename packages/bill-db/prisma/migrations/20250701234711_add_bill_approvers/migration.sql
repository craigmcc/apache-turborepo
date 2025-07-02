-- CreateTable
CREATE TABLE "bills_approvers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT,
    "isActive" BOOLEAN,
    "lastReminderDate" TEXT,
    "sortOrder" INTEGER,
    "status" TEXT,
    "statusChangedDate" TEXT,
    "billId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "bills_approvers_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bills_approvers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

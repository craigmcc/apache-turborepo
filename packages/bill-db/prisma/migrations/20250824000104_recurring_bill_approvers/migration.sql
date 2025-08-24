-- CreateTable
CREATE TABLE "recurring_bills_approvers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT,
    "isActive" BOOLEAN,
    "recurringBillId" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "userId" TEXT NOT NULL,
    "recurringBillLineItemId" TEXT,
    "replaceUserId" TEXT,
    CONSTRAINT "recurring_bills_approvers_recurringBillId_fkey" FOREIGN KEY ("recurringBillId") REFERENCES "recurring_bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recurring_bills_approvers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

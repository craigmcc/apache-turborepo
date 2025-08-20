-- CreateTable
CREATE TABLE "recurring_bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "archived" BOOLEAN,
    "createdTime" TEXT,
    "description" TEXT,
    "processingOptionsAutoPay" BOOLEAN,
    "paymentInformationBankAccountId" TEXT
);

-- CreateTable
CREATE TABLE "recurring_bills_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "description" TEXT,
    CONSTRAINT "recurring_bills_line_items_id_fkey" FOREIGN KEY ("id") REFERENCES "recurring_bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurring_bills_line_items_classifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "chartOfAccountId" TEXT,
    "departmentId" TEXT,
    "employeeId" TEXT,
    "itemId" TEXT,
    "jobId" TEXT,
    "locationId" TEXT,
    CONSTRAINT "recurring_bills_line_items_classifications_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recurring_bills_line_items_classifications_id_fkey" FOREIGN KEY ("id") REFERENCES "recurring_bills_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurring_bills_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daysInAdvance" INTEGER,
    "endDate" TEXT,
    "frequency" INTEGER,
    "period" TEXT,
    CONSTRAINT "recurring_bills_schedule_id_fkey" FOREIGN KEY ("id") REFERENCES "recurring_bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

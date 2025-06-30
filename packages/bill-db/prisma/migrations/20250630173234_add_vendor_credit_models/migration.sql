-- CreateTable
CREATE TABLE "vendors_credits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "appliedAmount" REAL,
    "archived" BOOLEAN,
    "createdDate" TEXT,
    "description" TEXT,
    "referenceNumber" TEXT,
    "vendorCreditStatus" TEXT,
    "applyToBankAccountId" TEXT,
    "applyToChartOfAccountId" TEXT,
    "vendorId" TEXT NOT NULL,
    CONSTRAINT "vendors_credits_applyToChartOfAccountId_fkey" FOREIGN KEY ("applyToChartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_credits_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "description" TEXT,
    "vendorCreditId" TEXT NOT NULL,
    CONSTRAINT "vendors_credits_line_items_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "vendors_credits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_credits_line_items_classifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "customerId" TEXT,
    "departmentId" TEXT,
    "employeeId" TEXT,
    "itemId" TEXT,
    "jobId" TEXT,
    "locationId" TEXT,
    "chartOfAccountId" TEXT,
    CONSTRAINT "vendors_credits_line_items_classifications_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_line_items_classifications_id_fkey" FOREIGN KEY ("id") REFERENCES "vendors_credits_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_credits_usage" (
    "vendorCreditId" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "paymentId" TEXT,
    "billId" TEXT,
    CONSTRAINT "vendors_credits_usage_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_usage_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "vendors_credits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "archived" BOOLEAN,
    "createdTime" TEXT,
    "creditAmount" REAL,
    "description" TEXT,
    "dueAmount" REAL,
    "dueDate" TEXT,
    "exchangeRate" REAL,
    "fundingAmount" REAL,
    "invoiceDate" TEXT,
    "invoiceNumber" TEXT,
    "paidAmount" REAL,
    "updatedTime" TEXT,
    "vendorName" TEXT,
    "payFromChartOfAccountId" TEXT,
    "vendorId" TEXT NOT NULL,
    CONSTRAINT "bills_payFromChartOfAccountId_fkey" FOREIGN KEY ("payFromChartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bills_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bills" ("amount", "archived", "createdTime", "creditAmount", "description", "dueAmount", "dueDate", "exchangeRate", "fundingAmount", "id", "invoiceDate", "invoiceNumber", "paidAmount", "payFromChartOfAccountId", "updatedTime", "vendorId", "vendorName") SELECT "amount", "archived", "createdTime", "creditAmount", "description", "dueAmount", "dueDate", "exchangeRate", "fundingAmount", "id", "invoiceDate", "invoiceNumber", "paidAmount", "payFromChartOfAccountId", "updatedTime", "vendorId", "vendorName" FROM "bills";
DROP TABLE "bills";
ALTER TABLE "new_bills" RENAME TO "bills";
CREATE TABLE "new_bills_classifications" (
    "billId" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "departmentId" TEXT,
    "itemId" TEXT,
    "locationId" TEXT,
    "chartOfAccountId" TEXT,
    CONSTRAINT "bills_classifications_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bills_classifications_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bills_classifications" ("accountingClassId", "billId", "chartOfAccountId", "departmentId", "itemId", "locationId") SELECT "accountingClassId", "billId", "chartOfAccountId", "departmentId", "itemId", "locationId" FROM "bills_classifications";
DROP TABLE "bills_classifications";
ALTER TABLE "new_bills_classifications" RENAME TO "bills_classifications";
CREATE TABLE "new_bills_line_items_classifications" (
    "billLineItemId" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "customerId" TEXT,
    "departmentId" TEXT,
    "employeeId" TEXT,
    "itemId" TEXT,
    "jobId" TEXT,
    "locationId" TEXT,
    "chartOfAccountId" TEXT,
    CONSTRAINT "bills_line_items_classifications_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bills_line_items_classifications_billLineItemId_fkey" FOREIGN KEY ("billLineItemId") REFERENCES "bills_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bills_line_items_classifications" ("accountingClassId", "billLineItemId", "chartOfAccountId", "customerId", "departmentId", "employeeId", "itemId", "jobId", "locationId") SELECT "accountingClassId", "billLineItemId", "chartOfAccountId", "customerId", "departmentId", "employeeId", "itemId", "jobId", "locationId" FROM "bills_line_items_classifications";
DROP TABLE "bills_line_items_classifications";
ALTER TABLE "new_bills_line_items_classifications" RENAME TO "bills_line_items_classifications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

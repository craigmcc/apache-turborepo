-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "archived" BOOLEAN,
    "balance_amount" REAL,
    "balance_lastUpdatedDate" TEXT,
    "billCurrency" TEXT,
    "createdTime" TEXT,
    "email" TEXT,
    "name" TEXT,
    "networkStatus" TEXT,
    "phone" TEXT,
    "recurringPayments" BOOLEAN,
    "rppsid" TEXT,
    "shortName" TEXT,
    "updatedTime" TEXT
);

-- CreateTable
CREATE TABLE "vendors_additional_info" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "combinePayment" BOOLEAN,
    "companyName" TEXT,
    "leadTimeInDays" INTEGER,
    "paymentTermId" TEXT,
    "taxId" TEXT,
    "taxIdType" TEXT,
    "track1099" BOOLEAN,
    CONSTRAINT "vendors_additional_info_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_address" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "state" TEXT,
    CONSTRAINT "vendors_address_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_autopay" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT,
    "createdBy" TEXT,
    "daysBeforeDueDate" INTEGER,
    "enabled" BOOLEAN,
    "maxAmount" REAL,
    CONSTRAINT "vendors_autopay_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_payment_information" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "lastPaymentDate" TEXT,
    "payBySubType" TEXT NOT NULL,
    "payByType" TEXT NOT NULL,
    "payeeName" TEXT,
    CONSTRAINT "vendors_payment_information_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vendors_virtual_card" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "alternatePayByType" TEXT,
    "declineDate" TEXT,
    "enrollDate" TEXT,
    "remitEmail" TEXT,
    "status" TEXT,
    CONSTRAINT "vendors_virtual_card_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

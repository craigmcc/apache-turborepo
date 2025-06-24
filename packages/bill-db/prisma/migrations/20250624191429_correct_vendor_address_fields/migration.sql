/*
  Warnings:

  - You are about to drop the column `address1` on the `vendors_address` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `vendors_address` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `vendors_address` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `vendors_address` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vendors_address" (
    "vendorId" TEXT NOT NULL PRIMARY KEY,
    "line1" TEXT,
    "line2" TEXT,
    "city" TEXT,
    "country" TEXT,
    "countryName" TEXT,
    "stateOrProvince" TEXT,
    "zipOrPostalCode" TEXT,
    CONSTRAINT "vendors_address_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_vendors_address" ("city", "country", "countryName", "vendorId") SELECT "city", "country", "countryName", "vendorId" FROM "vendors_address";
DROP TABLE "vendors_address";
ALTER TABLE "new_vendors_address" RENAME TO "vendors_address";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

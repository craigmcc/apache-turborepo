/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "archived" BOOLEAN,
    "createdTime" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "roleDescription" TEXT,
    "roleId" TEXT,
    "roleType" TEXT,
    "updatedTime" TEXT
);
INSERT INTO "new_users" ("archived", "createdTime", "email", "firstName", "id", "lastName", "updatedTime") SELECT "archived", "createdTime", "email", "firstName", "id", "lastName", "updatedTime" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

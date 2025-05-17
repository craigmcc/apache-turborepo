/*
  Warnings:

  - You are about to drop the column `company_id` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "employee_id" TEXT,
    "first_name" TEXT,
    "is_manager" BOOLEAN,
    "last_name" TEXT,
    "phone" TEXT,
    "entity_id" TEXT,
    "location_id" TEXT,
    "manager_id" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "department_id" TEXT,
    CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("department_id", "email", "employee_id", "entity_id", "first_name", "id", "is_manager", "last_name", "location_id", "manager_id", "phone", "role", "status") SELECT "department_id", "email", "employee_id", "entity_id", "first_name", "id", "is_manager", "last_name", "location_id", "manager_id", "phone", "role", "status" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "archived" BOOLEAN,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT
);

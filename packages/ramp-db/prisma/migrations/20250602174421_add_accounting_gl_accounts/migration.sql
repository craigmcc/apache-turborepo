-- CreateTable
CREATE TABLE "accounting_gl_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classification" TEXT,
    "code" TEXT,
    "created_at" TEXT,
    "gl_account_category_id" TEXT,
    "gl_account_category_name" TEXT,
    "gl_account_ramp_id" TEXT,
    "is_active" BOOLEAN,
    "name" TEXT NOT NULL,
    "updated_at" TEXT
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardholder_name" TEXT,
    "card_program_id" TEXT,
    "created_at" TEXT,
    "display_name" TEXT NOT NULL,
    "expiration" TEXT NOT NULL,
    "has_program_overrides" BOOLEAN NOT NULL,
    "is_physical" BOOLEAN,
    "last_four" TEXT NOT NULL,
    "state" TEXT,
    "entity_id" TEXT,
    "cardholder_id" TEXT NOT NULL,
    CONSTRAINT "cards_cardholder_id_fkey" FOREIGN KEY ("cardholder_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accounting_date" TEXT,
    "amount" JSONB,
    "card_present" BOOLEAN,
    "currency_code" TEXT,
    "memo" TEXT,
    "merchant_category_code" TEXT,
    "merchant_category_description" TEXT,
    "merchant_name" TEXT,
    "original_transaction_amount" JSONB,
    "settlement_date" TEXT,
    "sk_category_id" TEXT,
    "sk_category_name" TEXT,
    "sync_status" TEXT NOT NULL,
    "synced_at" TEXT,
    "entity_id" TEXT,
    "limit_id" TEXT,
    "merchant_id" TEXT,
    "spend_program_id" TEXT,
    "trip_id" TEXT,
    "trip_name" TEXT,
    "user_transaction_time" TEXT,
    "card_id" TEXT NOT NULL,
    CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "employee_id" TEXT,
    "first_name" TEXT,
    "is_manager" BOOLEAN,
    "last_name" TEXT,
    "phone" TEXT,
    "company_id" TEXT NOT NULL,
    "entity_id" TEXT,
    "location_id" TEXT,
    "manager_id" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "department_id" TEXT,
    CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

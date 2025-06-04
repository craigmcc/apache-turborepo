-- CreateTable
CREATE TABLE "transactions_accounting_field_selections" (
    "external_code" TEXT,
    "external_id" TEXT,
    "name" TEXT,
    "source_type" TEXT,
    "type" TEXT,
    "ramp_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,

    PRIMARY KEY ("transaction_id", "ramp_id"),
    CONSTRAINT "transactions_accounting_field_selections_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

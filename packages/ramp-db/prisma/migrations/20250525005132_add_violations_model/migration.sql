-- CreateTable
CREATE TABLE "violations" (
    "from_model" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_model" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,

    PRIMARY KEY ("from_model", "from_id", "to_model", "to_id")
);

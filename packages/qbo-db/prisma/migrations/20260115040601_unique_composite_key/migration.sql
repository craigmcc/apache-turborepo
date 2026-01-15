/*
  Warnings:

  - A unique constraint covering the columns `[journal_entry_id,id]` on the table `journal_entry_lines` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "journal_entry_lines_journal_entry_id_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "journal_entry_lines_journal_entry_id_id_key" ON "journal_entry_lines"("journal_entry_id", "id");

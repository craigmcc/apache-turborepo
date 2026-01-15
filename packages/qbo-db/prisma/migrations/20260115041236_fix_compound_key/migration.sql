-- RedefineIndex
DROP INDEX "journal_entry_lines_journal_entry_id_id_key";
CREATE UNIQUE INDEX "journal_entry_line_unique" ON "journal_entry_lines"("journal_entry_id", "id");

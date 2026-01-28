/**
 * Base page for Journal Entries.
 */

// External Imports ----------------------------------------------------------

import { dbQbo } from "@repo/qbo-db/dist";

// Internal Imports ----------------------------------------------------------

import { JournalEntriesTable } from "@/components/journalEntries/JournalEntriesTable";

// Public Objects ------------------------------------------------------------

export default async function JournalEntriesPage() {

  const allJournalEntries = await dbQbo.journalEntry.findMany({
    include: {
      lines: {
        include: {
          account: true,
        }
      }
    },
    orderBy: [
      { txnDate: "asc" },
    ],
  });

  return (
    <JournalEntriesTable
      allJournalEntries={allJournalEntries}
    />
  );

}

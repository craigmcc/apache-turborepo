/**
 * Base page for Journal Entry Lines.
 */

// External Imports ----------------------------------------------------------

import { dbQbo } from "@repo/qbo-db/dist";

// Internal Imports ----------------------------------------------------------

import { JournalLinesTable } from "@/components/journalLines/JournalLinesTable";
import { JournalEntryLinePlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export default async function JournalLinesPage() {

  const allJournalLines: JournalEntryLinePlus[] = await dbQbo.journalEntryLine.findMany({
    include: {
      account: true,
      journalEntry: true,
    },
    orderBy: [
      { account: { acctNum: "asc" } },
      { journalEntry: { txnDate: "asc" } },
    ],
  });

  return (
    <JournalLinesTable
      allJournalLines={allJournalLines}
    />
  );

}

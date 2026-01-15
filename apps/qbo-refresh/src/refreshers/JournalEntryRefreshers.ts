/**
 * Refresh Journal Entries from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchJournalEntries } from "@repo/qbo-api/JournalEntryActions";
import { QboJournalEntry, QboJournalEntryLineDetail } from "@repo/qbo-api/types/Finance";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { dbQbo, JournalEntry, JournalEntryLine, PostingType } from "@repo/qbo-db/*";
import { serverLogger as logger} from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function refreshJournalEntries(
  apiInfo: QboApiInfo,
): Promise<void> {

  // Fetch all journal entries from QBO API
  const journalEntries = await fetchAllJournalEntries(apiInfo);
  logger.info({
    context: "JournalEntryRefresher.refreshJournalEntries.fetched",
    totalJournalEntries: journalEntries.length,
  });
  let lineCount = 0;

  // Add the JournalEntry to the database
  for (const qboJournalEntry of journalEntries) {

    const journalEntry = createJournalEntry(qboJournalEntry);
    await dbQbo.journalEntry.upsert({
      where: {id: journalEntry.id},
      create: journalEntry,
      update: journalEntry,
    });

    // Add the JournalEntryLines to the database
    const lineDetails = qboJournalEntry.Line || [];
    for (const lineDetail of lineDetails) {
      const journalEntryLine = createJournalEntryLine(journalEntry.id, lineDetail);
      await dbQbo.journalEntryLine.upsert({
        where: {id: journalEntryLine.id},
        create: journalEntryLine,
        update: journalEntryLine,
      });
      lineCount++;

    }

  }

  logger.info({
    context: "JournalEntryRefresher.refreshJournalEntries.completed",
    totalJournalEntries: journalEntries.length,
    totalJournalEntryLines: lineCount,
  });

}

// Private Methods -----------------------------------------------------------

function createJournalEntry(qboJournalEntry: QboJournalEntry): JournalEntry {
  return {
    id: qboJournalEntry.Id || "", // should never be missing
    createTime: qboJournalEntry.MetaData?.CreateTime || null,
    domain: qboJournalEntry.domain || null,
    lastUpdatedTime: qboJournalEntry.MetaData?.LastUpdatedTime || null,
    privateNote: qboJournalEntry.PrivateNote || null,
    txnDate: qboJournalEntry.TxnDate || null,
    adjustment: qboJournalEntry.Adjustment || null,
  }
}

function createJournalEntryLine(journalEntryId: string, line: QboJournalEntryLineDetail): JournalEntryLine {
  let postingType: PostingType | null = null;
  if (line.PostingType) {
    if (line.PostingType === "Credit") {
      postingType = PostingType.Credit;
    } else if (line.PostingType === "Debit") {
      postingType = PostingType.Debit;
    }
  }
  return {
    id: line.Id || "", // should never be missing
    amount: line.Amount || 0,
    description: line.Description || null,
    accountId: line.AccountRef?.value || null,
    postingType: postingType,
    journalEntryId: journalEntryId,
  }
}

async function fetchAllJournalEntries(
  apiInfo: QboApiInfo,
): Promise<QboJournalEntry[]> {

  const allJournalEntries: QboJournalEntry[] = [];
  let startPosition = 1;
  const maxResults = 1000;

  while (true) {
    const fetched = await fetchJournalEntries(apiInfo, {
      startPosition,
      maxResults,
    });
    allJournalEntries.push(...fetched);
    if (fetched.length < maxResults) {
      break;
    }
    startPosition += fetched.length;
  }

  return allJournalEntries;

}

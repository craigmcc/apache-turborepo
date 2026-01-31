/**
 * Refresh Journal Entries from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchJournalEntries } from "@repo/qbo-api/JournalEntryFunctions";
import { QboJournalEntry, QboJournalEntryLineDetail } from "@repo/qbo-api/types/Finance";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { dbQbo, JournalEntry, JournalEntryLine } from "@repo/qbo-db/*";
import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function refreshJournalEntries(
  apiInfo: QboApiInfo,
): Promise<void> {

  const currentTime = new Date().toISOString();

  // Fetch all journal entries from QBO API
  const journalEntries = await fetchAllJournalEntries(apiInfo);
  logger.info({
    context: "JournalEntryRefresher.refreshJournalEntries.fetched",
    totalJournalEntries: journalEntries.length,
  });
  let accountsAdded = 0;
  let entrySkipped = 0;
  let lineCount = 0;
  let lineInvalidAccount = 0;
  let lineMissingAccount = 0;
  let lineSkipped = 0;

  // Add the JournalEntry to the database
  for (const qboJournalEntry of journalEntries) {

    const journalEntry = createJournalEntry(qboJournalEntry);
    if (journalEntry.txnDate && (journalEntry.txnDate < "2000-05-01")) {
      logger.trace({
        context: "JournalEntryRefresher.refreshJournalEntries.earlyTxnDate",
        journalEntryId: journalEntry.id,
        txnDate: journalEntry.txnDate,
      });
      entrySkipped++;
      continue;
    }
    await dbQbo.journalEntry.upsert({
      where: {id: journalEntry.id},
      create: journalEntry,
      update: journalEntry,
    });

    // Add the JournalEntryLines to the database
    const lineDetails = qboJournalEntry.Line || [];
    for (const lineDetail of lineDetails) {
      const journalEntryLine = createJournalEntryLine(journalEntry, lineDetail);
      if (lineDetail.DetailType !== "JournalEntryLineDetail") {
        if (lineDetail.DetailType !== "DescriptionOnly") {
          logger.warn({
            context: "JournalEntryRefresher.refreshJournalEntries.lineSkipped",
            journalEntryId: journalEntry.id,
            journalEntryLineId: journalEntryLine.id,
            lineDetail
          });
        }
        lineSkipped++;
        continue;
      }
      if (!journalEntryLine.accountId) {
        logger.warn({
          context: "JournalEntryRefresher.refreshJournalEntries.missingAccountId",
          journalEntryId: journalEntry.id,
          journalEntryLineId: journalEntryLine.id,
          qboJournalEntry,
        });
        lineMissingAccount++;
        continue;
      }
      const account = await dbQbo.account.findUnique({
        where: {id: journalEntryLine.accountId},
      });
      if (!account) {
        const added = await dbQbo.account.create({
          data: {
            id: journalEntryLine.accountId,
            createTime: currentTime,
            domain: "QBO",
            lastUpdatedTime: currentTime,
            accountSubType: "Unknown",
            accountType: "Unknown",
            acctNum: "????",
            active: false,
            description: "Added by JournalEntryRefresher",
            fullyQualifiedName: "Unknown Account FQN",
            name: lineDetail.JournalEntryLineDetail?.AccountRef?.name || "Unknown Account Name",
          }
        });
        accountsAdded++;
        logger.warn({
          context: "JournalEntryRefresher.refreshJournalEntries.accountAdded",
          journalEntryId: journalEntry.id,
          journalEntryLineId: journalEntryLine.id,
          qboJournalEntry,
          account: added,
        });
        lineInvalidAccount++;
//        continue;
      }
      await dbQbo.journalEntryLine.upsert({
        where: {
          journalEntryId_id: {
            journalEntryId: journalEntry.id,
            id: journalEntryLine.id,
          },
        },
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
    accountsAdded,
    entrySkipped,
    lineInvalidAccount,
    lineMissingAccount,
    lineSkipped,
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

function createJournalEntryLine(journalEntry: JournalEntry, line: QboJournalEntryLineDetail): JournalEntryLine {
  return {
    id: line.Id || "", // should never be missing
    amount: line.Amount || 0,
    description: line.Description || null,
    accountId: line.JournalEntryLineDetail?.AccountRef?.value || null,
    postingType: line.JournalEntryLineDetail?.PostingType || null,
    journalEntryId: journalEntry.id,
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

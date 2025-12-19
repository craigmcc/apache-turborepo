/**
 * Functions to return the entire contents of specific models
 * via the Ramp API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
import { fetchAccountingGLAccounts } from "@repo/ramp-api/AccountingGLAccountActions";
import { fetchCards } from "@repo/ramp-api/CardActions";
import { fetchDepartments } from "@repo/ramp-api/DepartmentActions";
import { fetchLimits } from "@repo/ramp-api/LimitActions";
import { fetchSpendPrograms } from "@repo/ramp-api/SpendProgramActions"
import { fetchTransactions } from "@repo/ramp-api/TransactionActions";
import { fetchUsers } from "@repo/ramp-api/UserActions";
import {
  dbRamp,
  AccountingGLAccount,
  Card,
  CardSpendingRestrictions,
  Department,
  Limit,
  LimitCard,
  LimitSpendingRestrictions,
  SpendProgram,
  Transaction,
  TransactionLineItem,
  User,
  Violation,
} from "@repo/ramp-db/index.js";
import {
  createAccountingGLAccount,
  createCard,
  createCardSpendingRestrictions,
  createDepartment,
  createLimit,
  createLimitCard,
  createLimitSpendingRestrictions,
  createLimitUser,
  createSpendProgram,
  createTransaction,
  createTransactionAccountingFieldSelection,
  createTransactionLineItem,
  createTransactionLineItemAccountingFieldSelection,
  createUser,
} from "./Creators"

// These are IDs that are in Ramp (so they get downloaded) but will replace
// bad references to cards or users that have been deleted.
const UNKNOWN_CARD_ID_REPLACEMENT = "3523fed1-69c6-497b-ab76-973349753801";
const UNKNOWN_USER_ID_REPLACEMENT = "01974b9c-a5b3-7445-a39e-cd0925288a50";

// Public Objects ------------------------------------------------------------

export type refreshAccessTokenResult = {
  access_token: string;
  scope: string;
}

export async function eraseViolations(): Promise<void> {
  console.log("Erasing violations...");
  await dbRamp.violation.deleteMany({});
}

export async function refreshAccessToken(): Promise<refreshAccessTokenResult> {
  console.log("Fetching access token...");
  const accessTokenResponse = await fetchAccessToken();
  if (accessTokenResponse.error) {
    throw accessTokenResponse.error;
  }
  return {
    access_token: accessTokenResponse.model!.access_token,
    scope: accessTokenResponse.model!.scope,
  };
}

export async function refreshAccountingGLAccounts(accessToken: string): Promise<void> {

  console.log("Fetching Accounting GL accounts...");
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchAccountingGLAccounts(
      accessToken,
      {
        is_active: true,
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampAccount of result.model!.data) {

      if (!rampAccount.code) {
        console.log(`Accounting GL Account ${rampAccount.id} has no code, skipping`);
        continue; // Skip accounts without a code
      }

      const account: AccountingGLAccount = createAccountingGLAccount(rampAccount);

      await dbRamp.accountingGLAccount.upsert({
        where: {id: account.id},
        update: account,
        create: account,
      });

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Accounting GL Accounts refreshed:", count);

}

export async function refreshCards(accessToken: string): Promise<void> {

  console.log("Fetching cards...");
  const userIds = await fetchUserIds(accessToken);
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchCards(
      accessToken,
      {
        is_activated: false,
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampCard of result.model!.data) {

      if (rampCard.cardholder_id && !userIds.has(rampCard.cardholder_id)) {
        console.log(`Card ${rampCard.id} replacing bad cardholder_id ${rampCard.cardholder_id}`);
        await recordViolation("Card", rampCard.id, "User", rampCard.cardholder_id);
        rampCard.cardholder_id = UNKNOWN_USER_ID_REPLACEMENT;
      }
      const card: Card = createCard(rampCard);

      await dbRamp.card.upsert({
        where: {id: card.id},
        update: card,
        create: card,
      });

      if (rampCard.spending_restrictions) {

        const cardSpendingRestrictions: CardSpendingRestrictions
          = createCardSpendingRestrictions(rampCard);

        await dbRamp.cardSpendingRestrictions.upsert({
          where: {card_id: cardSpendingRestrictions.card_id},
          update: cardSpendingRestrictions,
          create: cardSpendingRestrictions,
        });

      } else {

        await dbRamp.cardSpendingRestrictions.deleteMany({
          where: {card_id: card.id}

        });

      }

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Cards refreshed:", count);

}

export async function refreshDepartments(accessToken: string): Promise<void> {

  console.log("Fetching departments...");
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchDepartments(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampDepartment of result.model!.data) {

      const department: Department = createDepartment(rampDepartment);

      await dbRamp.department.upsert({
        where: {id: department.id},
        update: department,
        create: department,
      });

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Departments refreshed:", count);

}

export async function refreshLimits(accessToken: string): Promise<void> {

  console.log("Fetching limits...");
  const userIds = await fetchUserIds(accessToken);
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchLimits(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampLimit of result.model!.data) {

//      console.log("Processing Limit", JSON.stringify(rampLimit, null, 2));
      const limit: Limit = createLimit(rampLimit);

//      console.log("Upserting Limit", JSON.stringify(limit, null, 2));
      await dbRamp.limit.upsert({
        where: {id: limit.id},
        update: limit,
        create: limit,
      });

      await dbRamp.limitCard.deleteMany({
        where: {limit_id: limit.id}
      });

      if (rampLimit.cards) {

        for (const rampLimitCard of rampLimit.cards) {

//          console.log("Processing LimitCard", JSON.stringify(rampLimitCard, null, 2));
          const limitCard: LimitCard = createLimitCard(rampLimitCard, rampLimit);

//          console.log("Upserting LimitCard", JSON.stringify(limitCard, null, 2));
          await dbRamp.limitCard.upsert({
            where: {
              limit_id_card_id: {limit_id: rampLimit.id, card_id: rampLimitCard.card_id }
            },
            update: limitCard,
            create: limitCard,
          });
        }

      }

      await dbRamp.limitSpendingRestrictions.deleteMany({
        where: {limit_id: limit.id}
      });

      if (rampLimit.restrictions) {

//        console.log("Processing LimitSpendingRestrictions", JSON.stringify(rampLimit.restrictions, null, 2));
        const limitSpendingRestrictions: LimitSpendingRestrictions = createLimitSpendingRestrictions(rampLimit.restrictions, rampLimit);

//        console.log("Upserting LimitSpendingRestrictions", JSON.stringify(limitSpendingRestrictions, null, 2));
        await dbRamp.limitSpendingRestrictions.upsert({
          where: {limit_id: limitSpendingRestrictions.limit_id},
          update: limitSpendingRestrictions,
          create: limitSpendingRestrictions,
        });

      }

      await dbRamp.limitUser.deleteMany({
        where: {limit_id: limit.id}
      });

      if (rampLimit.users) {

        for (const rampLimitUser of rampLimit.users) {

          if (rampLimitUser.user_id && !userIds.has(rampLimitUser.user_id)) {
            console.log(`Limit ${rampLimit.id} replacing bad user_id ${rampLimitUser.user_id}`);
            await recordViolation("Limit", rampLimit.id, "User", rampLimitUser.user_id);
            rampLimitUser.user_id = UNKNOWN_USER_ID_REPLACEMENT;
          }

//          console.log("Processing LimitUser", JSON.stringify(rampLimitUser, null, 2));
          const limitUser = createLimitUser(rampLimitUser, rampLimit);

//            console.log("Upserting LimitUser", JSON.stringify(limitUser, null, 2));
          await dbRamp.limitUser.upsert({
            where: {
              limit_id_user_id: {
                limit_id: rampLimit.id,
                user_id: rampLimitUser.user_id
              }
            },
            update: limitUser,
            create: limitUser,
          });


        }

      }

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Limits refreshed:", count);

}

export async function refreshSpendPrograms(accessToken: string): Promise<void> {

  console.log("Fetching spend programs...");
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchSpendPrograms(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampSpendProgram of result.model!.data) {

      const spendProgram: SpendProgram = createSpendProgram(rampSpendProgram);

      await dbRamp.limit.upsert({
        where: {id: spendProgram.id},
        update: spendProgram,
        create: spendProgram,
      });

      count++;
    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Spend Programs refreshed:", count);

}

export async function refreshTransactions(accessToken: string): Promise<void> {

  console.log("Fetching transactions...");
  const cardIds = await fetchCardIds(accessToken);
//  const limitIds = await fetchLimitIds(accessToken);
  const userIds = await fetchUserIds(accessToken);
  let count = 0;
  let nextStart: string | null = "";

  while (nextStart !== null) {

    const result = await fetchTransactions(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }
    console.log(`Retrieved ${result.model!.data.length} transactions`);

    for (const rampTransaction of result.model!.data) {

      const transaction: Transaction = createTransaction(rampTransaction);
      if (transaction.card_id && !cardIds.has(transaction.card_id)) {
        console.log(`Transaction ${transaction.id}: replacing bad card_id ${transaction.card_id}`);
        await recordViolation("Transaction", transaction.id, "Card", transaction.card_id);
        transaction.card_id = UNKNOWN_CARD_ID_REPLACEMENT;
      }
      if (transaction.card_holder_user_id && !userIds.has(transaction.card_holder_user_id)) {
        console.log(`Transaction ${transaction.id}: replacing bad card_holder_user_id ${transaction.card_holder_user_id}`);
        await recordViolation("Transaction", transaction.id, "User", transaction.card_holder_user_id);
        transaction.card_holder_user_id = UNKNOWN_USER_ID_REPLACEMENT;
      }

      await dbRamp.transaction.upsert({
        where: {id: transaction.id},
        update: transaction,
        create: transaction,
      });

      await dbRamp.transactionAccountingFieldSelection.deleteMany({
        where: {transaction_id: transaction.id}
      });

      if (rampTransaction.accounting_field_selections) {

        for (const rampAccountingFieldSelection of rampTransaction.accounting_field_selections) {

          const accountingFieldSelection =
            createTransactionAccountingFieldSelection(rampAccountingFieldSelection, rampTransaction);

          await dbRamp.transactionAccountingFieldSelection.upsert({
            where: {
              transaction_id_ramp_id: {
                transaction_id: rampTransaction.id,
                ramp_id: accountingFieldSelection.ramp_id
              },
            },
            update: accountingFieldSelection,
            create: accountingFieldSelection,
          });

        }

      }

      await dbRamp.transactionLineItem.deleteMany({
        where: {transaction_id: transaction.id}
      });

      if (rampTransaction.line_items) {

        let index_line_item = 0;
        for (const rampTransactionLineItem of rampTransaction.line_items) {

          const transactionLineItem: TransactionLineItem =
            createTransactionLineItem(rampTransactionLineItem, rampTransaction, index_line_item);

          await dbRamp.transactionLineItem.upsert({
            where: {
              transaction_id_index_line_item: {
                transaction_id: transaction.id,
                index_line_item: index_line_item
              },
            },
            update: transactionLineItem,
            create: transactionLineItem,
          });

          await dbRamp.transactionLineItemAccountingFieldSelection.deleteMany({
            where: {
              transaction_id: transaction.id,
              index_line_item: index_line_item
            }
          });

          if (rampTransactionLineItem.accounting_field_selections) {

            for (const rampAccountingFieldSelection of rampTransactionLineItem.accounting_field_selections) {

              const accountingFieldSelection
                = createTransactionLineItemAccountingFieldSelection(
                rampAccountingFieldSelection,
                rampTransaction,
                index_line_item
              );

              await dbRamp.transactionLineItemAccountingFieldSelection.upsert({
                where: {
                  transaction_id_index_line_item_ramp_id: {
                    transaction_id: rampTransaction.id,
                    index_line_item: index_line_item,
                    ramp_id: accountingFieldSelection.ramp_id
                  }
                },
                update: accountingFieldSelection,
                create: accountingFieldSelection,
              });

            }

          }

          index_line_item++;

        }

      }

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Transactions refreshed:", count);

}


export async function refreshUsers(accessToken: string): Promise<void> {

  console.log("Fetching users...");
  let count = 0;
  let nextStart: string | null = "";

  // First pass: Insert all users without manager_id to avoid foreign key constraint violations
  while (nextStart !== null) {

    const result = await fetchUsers(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampUser of result.model!.data) {

      const user: User = createUser(rampUser);
      // Remove manager_id for first pass to avoid FK constraint issues
      const userWithoutManager = { ...user, manager_id: null };

      await dbRamp.user.upsert({
        where: {id: user.id},
        update: userWithoutManager,
        create: userWithoutManager,
      });

      count++;

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Users refreshed (first pass):", count);

  // Second pass: Update all users with their manager_id
  console.log("Updating user manager relationships...");
  let managerCount = 0;
  nextStart = "";

  while (nextStart !== null) {

    const result = await fetchUsers(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }

    for (const rampUser of result.model!.data) {

      if (rampUser.manager_id) {
        await dbRamp.user.update({
          where: {id: rampUser.id},
          data: {manager_id: rampUser.manager_id},
        });
        managerCount++;
      }

    }

    nextStart = extractNextPaginationId(result.model!.page?.next || null);

  }

  console.log("Manager relationships updated:", managerCount);

}

// Private Objects -----------------------------------------------------------

function extractNextPaginationId(nextPageUrl: string | null): string | null {
  if (!nextPageUrl) {
    return null;
  }
  const url = new URL(nextPageUrl);
  const params = new URLSearchParams(url.search);
  const nextStart = params.get("start");
  if (nextStart) {
    return nextStart;
  } else {
    throw new Error(`No 'start' parameter found in URL: ${nextPageUrl}`);
  }
}

async function fetchCardIds(accessToken: string): Promise<Set<string>> {

  const cardIds: Set<string> = new Set();
  let nextStart: string | null = "";

  while (nextStart !== null) {
    const result = await fetchCards(
      accessToken,
      {
        is_activated: false,
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }
    for (const rampCard of result.model!.data) {
      cardIds.add(rampCard.id);
    }
    nextStart = extractNextPaginationId(result.model!.page?.next || null);
  }

  return cardIds;

}

/*
async function fetchLimitIds(accessToken: string): Promise<Set<string>> {

  const limitIds: Set<string> = new Set();
  let nextStart: string | null = "";

  while (nextStart !== null) {
    const result = await fetchLimits(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }
    for (const rampLimit of result.model!.data) {
      limitIds.add(rampLimit.id);
    }
    nextStart = extractNextPaginationId(result.model!.page?.next || null);
  }

  return limitIds;
}
*/

async function fetchUserIds(accessToken: string): Promise<Set<string>> {

  const userIds: Set<string> = new Set();
  let nextStart: string | null = "";

  while (nextStart !== null) {
    const result = await fetchUsers(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    if (result.error) {
      throw result.error;
    }
    for (const rampUser of result.model!.data) {
      userIds.add(rampUser.id);
    }
    nextStart = extractNextPaginationId(result.model!.page?.next || null);
  }

  return userIds;

}

async function recordViolation(
  from_model: string,
  from_id: string,
  to_model: string,
  to_id: string,
): Promise<void> {

  const violation: Violation = {
    from_model: from_model,
    from_id: from_id,
    to_model: to_model,
    to_id: to_id,
  }

  await dbRamp.violation.create({
    data: violation,
  });

}


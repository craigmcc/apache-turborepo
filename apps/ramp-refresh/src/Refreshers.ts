/**
 * Functions to return the entire contents of specific models
 * via the Ramp API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
import { fetchCards } from "@repo/ramp-api/CardActions";
import { fetchDepartments } from "@repo/ramp-api/DepartmentActions";
import { fetchLimits } from "@repo/ramp-api/LimitActions";
import { fetchSpendPrograms } from "@repo/ramp-api/SpendProgramActions";
import { fetchTransactions } from "@repo/ramp-api/TransactionActions";
import { fetchUsers } from "@repo/ramp-api/UserActions";
import {
  dbRamp,
  Card,
  CardSpendingRestrictions,
  Department,
  Limit,
  LimitCard,
  LimitUser,
  SpendProgram,
  Transaction,
  User,
} from "@repo/ramp-db/client";

// Public Objects ------------------------------------------------------------

const BAD_USER_IDS = [
  "87b97b1c-3329-4b65-a402-397f2dbe7d61",
];

export type refreshAccessTokenResult = {
  access_token: string;
  scope: string;
}

export async function refreshAccessToken(): Promise<refreshAccessTokenResult> {
  console.log("Fetching access token...");
  console.log("Client ID: ", process.env.RAMP_PROD_API_CLIENT_ID);
  const accessTokenResponse = await fetchAccessToken();
  if (accessTokenResponse.error) {
    throw accessTokenResponse.error;
  }
  return {
    access_token: accessTokenResponse.model!.access_token,
    scope: accessTokenResponse.model!.scope,
  };
}

export async function refreshCards(accessToken: string): Promise<void> {

  console.log("Fetching cards...");
  let count = 0;
  let nextStart: string | null = "";
  while (nextStart !== null) {

    const result = await fetchCards(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
//    console.log("fetchCards result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampCard of result.model!.data) {
//      console.log("Processing Card", JSON.stringify(rampCard, null, 2));

      const card: Card = {
        id: rampCard.id,
        cardholder_name: rampCard.cardholder_name,
        card_program_id: rampCard.card_program_id,
        created_at: rampCard.created_at,
        display_name: rampCard.display_name,
        expiration: rampCard.expiration,
        has_program_overridden: rampCard.has_program_overridden,
        is_physical: rampCard.is_physical,
        last_four: rampCard.last_four,
        state: rampCard.state,
        entity_id: rampCard.entity_id,
        cardholder_id: rampCard.cardholder_id,
      }
      await dbRamp.card.upsert({
        where: {id: card.id},
        update: card,
        create: card,
      });
      // Any error thrown by Prisma will be forwarded back to the caller

      if (rampCard.spending_restrictions) {
        const cardSpendingRestrictions: CardSpendingRestrictions = {
          card_id: rampCard.id,
          amount: rampCard.spending_restrictions.amount || null,
          auto_lock_date: rampCard.spending_restrictions.auto_lock_date || null,
          blocked_categories: rampCard.spending_restrictions.blocked_categories?.join(",") || null,
          categories: rampCard.spending_restrictions.categories?.join(",") || null,
          interval: rampCard.spending_restrictions.interval || null,
          suspended: rampCard.spending_restrictions.suspended || null,
          transaction_amount_limit: rampCard.spending_restrictions.transaction_amount_limit || null,
        }
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
      // Any error thrown by Prisma will be forwarded back to the caller

      count++;
      nextStart = result.model!.page?.next || null;
    }

    console.log("Cards refreshed:", count);

  }

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
//    console.log("fetchDepartments result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampDepartment of result.model!.data) {
//      console.log(`Department ${rampDepartment.id}: ${rampDepartment.name}`);
      const department: Department = {
        // id: rampDepartment.id,
        // name: rampDepartment.name,
        ...rampDepartment
      }
      await dbRamp.department.upsert({
        where: {id: department.id},
        update: department,
        create: department,
      });
      // Any error thrown by Prisma will be forwarded back to the caller
      count++;
      nextStart = result.model!.page?.next || null;
    }

    console.log("Departments refreshed:", count);

  }

}

export async function refreshLimits(accessToken: string): Promise<void> {

  console.log("Fetching limits...");
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
//    console.log("fetchLimits result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampLimit of result.model!.data) {
//      console.log(`Limit ${rampLimit.id}: ${rampLimit.display_name}`);

      const limit: Limit = {
        id: rampLimit.id,
        balance_cleared_amt: rampLimit.balance?.cleared?.amount || null,
        balance_cleared_cc: rampLimit.balance?.cleared?.currency_code || null,
        balance_pending_amt: rampLimit.balance?.pending?.amount || null,
        balance_pending_cc: rampLimit.balance?.pending?.currency_code || null,
        balance_total_amt: rampLimit.balance?.total?.amount || null,
        balance_total_cc: rampLimit.balance?.total?.currency_code || null,
        created_at: rampLimit.created_at,
        display_name: rampLimit.display_name,
        entity_id: rampLimit.entity_id,
        has_program_overridden: rampLimit.has_program_overridden,
        is_shareable: rampLimit.is_shareable,
        permitted_primary_card_enabled: rampLimit.permitted_spend_types?.primary_card_enabled || null,
        permitted_reimbursements_enabled: rampLimit.permitted_spend_types?.reimbursements_enabled || null,
        restrictions_allowed_categories: rampLimit.restrictions?.allowed_categories?.join(",")  || null,
        restrictions_auto_lock_date: rampLimit.restrictions?.auto_lock_date || null,
        restrictions_blocked_categories: rampLimit.restrictions?.blocked_categories?.join(",") || null,
        restrictions_interval: rampLimit.restrictions?.interval || null,
        restrictions_limit_amt: rampLimit.restrictions?.limit?.amount || null,
        restrictions_limit_cc: rampLimit.restrictions?.limit?.currency_code || null,
        restrictions_next_interval_reset: rampLimit.restrictions?.next_interval_reset || null,
        restrictions_start_of_interval: rampLimit.restrictions?.start_of_interval || null,
        restrictions_temporary_limit_amt: rampLimit.restrictions?.temporary_limit?.amount || null,
        restrictions_temporary_limit_cc: rampLimit.restrictions?.temporary_limit?.currency_code || null,
        restrictions_transaction_amount_limit_amt: rampLimit.restrictions?.transaction_amount_limit?.amount || null,
        restrictions_transaction_amount_limit_cc: rampLimit.restrictions?.transaction_amount_limit?.currency_code || null,
        spend_program_id: rampLimit.spend_program_id,
        state: rampLimit.state,
        suspension_acting_user_id: rampLimit.suspension?.acting_user_id || null,
        suspension_inserted_at: rampLimit.suspension?.inserted_at || null,
        suspension_suspended_by_ramp: rampLimit?.suspension?.suspended_by_ramp || null,
      }
      await dbRamp.limit.upsert({
        where: {id: limit.id},
        update: limit,
        create: limit,
      });
      // Any error thrown by Prisma will be forwarded back to the caller

      if (rampLimit.cards) {
        for (const rampLimitCard of rampLimit.cards) {
          const limitCard: LimitCard = {
            expiration: rampLimitCard.expiration,
            is_ap_card: rampLimitCard.is_ap_card,
            last_four: rampLimitCard.last_four,
            via_new_product_or_service: rampLimitCard.via_new_product_or_service,
            card_id: rampLimitCard.card_id,
            limit_id: rampLimit.id,
          }
          await dbRamp.limitCard.upsert({
            where: {
              limit_id_card_id: {limit_id: rampLimit.id, card_id: rampLimitCard.card_id }
            },
            update: limitCard,
            create: limitCard,
          });
        }
      } else {
        await dbRamp.limitCard.deleteMany({
          where: {limit_id: limit.id}
        });
      }

      if (rampLimit.users) {
        for (const rampUserCard of rampLimit.users) {
          if (BAD_USER_IDS.includes(rampUserCard.user_id)) {
            console.log(`Limit ${rampLimit.id}: ${rampLimit.display_name!.padEnd(40)}: skipping bad user_id ${rampUserCard.user_id}`);
          } else {
            const limitUser: LimitUser = {
              limit_id: rampLimit.id,
              user_id: rampUserCard.user_id,
            }
            await dbRamp.limitUser.upsert({
              where: {
                limit_id_user_id: {limit_id: rampLimit.id, user_id: rampUserCard.user_id }
              },
              update: limitUser,
              create: limitUser,
            });
          }
        }
      } else {
        await dbRamp.limitUser.deleteMany({
          where: {limit_id: limit.id}
        });
      }

      count++;

    }

    nextStart = result.model!.page?.next || null;

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
//    console.log("fetchSpendPrograms result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampSpendProgram of result.model!.data) {
      console.log(`Limit ${rampSpendProgram.id}: ${rampSpendProgram.display_name}`);

      const spendProgram: SpendProgram = {
        id: rampSpendProgram.id,
        description: rampSpendProgram.description,
        display_name: rampSpendProgram.display_name,
        is_shareable: rampSpendProgram.is_shareable,
        issue_physical_card_if_needed: rampSpendProgram.issue_physical_card_if_needed,
        permitted_primary_card_enabled: rampSpendProgram.permitted_spend_types?.primary_card_enabled || null,
        permitted_reimbursements_enabled: rampSpendProgram.permitted_spend_types?.reimbursements_enabled || null,
        restrictions_allowed_categories: rampSpendProgram.restrictions?.allowed_categories?.join(",")  || null,
        restrictions_auto_lock_date: rampSpendProgram.restrictions?.auto_lock_date || null,
        restrictions_blocked_categories: rampSpendProgram.restrictions?.blocked_categories?.join(",") || null,
        restrictions_interval: rampSpendProgram.restrictions?.interval || null,
        restrictions_limit_amt: rampSpendProgram.restrictions?.limit?.amount || null,
        restrictions_limit_cc: rampSpendProgram.restrictions?.limit?.currency_code || null,
        restrictions_next_interval_reset: rampSpendProgram.restrictions?.next_interval_reset || null,
        restrictions_start_of_interval: rampSpendProgram.restrictions?.start_of_interval || null,
        restrictions_temporary_limit_amt: rampSpendProgram.restrictions?.temporary_limit?.amount || null,
        restrictions_temporary_limit_cc: rampSpendProgram.restrictions?.temporary_limit?.currency_code || null,
        restrictions_transaction_amount_limit_amt: rampSpendProgram.restrictions?.transaction_amount_limit?.amount || null,
        restrictions_transaction_amount_limit_cc: rampSpendProgram.restrictions?.transaction_amount_limit?.currency_code || null,
      }
      await dbRamp.limit.upsert({
        where: {id: spendProgram.id},
        update: spendProgram,
        create: spendProgram,
      });
      // Any error thrown by Prisma will be forwarded back to the caller

    }

    count++;
    nextStart = result.model!.page?.next || null;

  }

  console.log("Spend Programs refreshed:", count);

}

export async function refreshTransactions(accessToken: string): Promise<void> {

  console.log("Fetching transactions... not implemented yet");
  return;
/*
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

    for (const rampTransaction of result.model!.data) {
      if (count > 5) { // TODO
        break;
      }
      console.log(`Transaction ${count+1}:`,  `${JSON.stringify(rampTransaction, null, 2)}`);

      const transaction: Transaction = {
        id: rampTransaction.id,
        accounting_date: rampTransaction.accounting_date,
        amount_amt: rampTransaction.amount ? rampTransaction.amount * 100 : null,
        amount_cc: rampTransaction.currency_code,
        card_id: rampTransaction.card_id,
        card_holder_user_id: rampTransaction.card_holder?.user_id
          ? rampTransaction.card_holder.user_id
          : null,
        card_present: rampTransaction.card_present,
        currency_code: rampTransaction.currency_code, // TODO - redundant to amount_cc
        entity_id: rampTransaction.entity_id,
        limit_id: rampTransaction.limit_id,
        memo: rampTransaction.memo,
        merchant_category_code: rampTransaction.merchant_category_code,
        merchant_category_description: rampTransaction.merchant_category_code_description,
        merchant_id: rampTransaction.merchant_id,
        merchant_name: rampTransaction.merchant_name,
        original_transaction_amount_amt: rampTransaction.original_transaction_amount?.amount
          ? rampTransaction.original_transaction_amount.amount
          : null,
        original_transaction_amount_cc: rampTransaction.original_transaction_amount?.currency_code
          ? rampTransaction.original_transaction_amount.currency_code
          : null,
        settlement_date: rampTransaction.settlement_date,
        sk_category_id: rampTransaction.sk_category_id?.toString() || null, // TODO - type???
        sk_category_name: rampTransaction.sk_category_name,
        spend_program_id: rampTransaction.spend_program_id,
        state: rampTransaction.state,
        statement_id: rampTransaction.statement_id,
        sync_status: rampTransaction.sync_status || "NOT_SYNC_READY", // TODO
        synced_at: rampTransaction.synced_at,
        trip_id: rampTransaction.trip_id,
        trip_name: rampTransaction.trip_name,
        user_transaction_time: rampTransaction.user_transaction_time,
      }
      await dbRamp.transaction.upsert({
        where: {id: transaction.id},
        update: transaction,
        create: transaction,
      });
      // Any error thrown by Prisma will be forwarded back to the caller

    }

    count++;
    nextStart = result.model!.page?.next || null;

  }

  console.log("Transactions refreshed:", count);
*/

}


export async function refreshUsers(accessToken: string): Promise<void> {

  console.log("Fetching users...");
  let count = 0;
  let nextStart: string | null = "";
  while (nextStart !== null) {

    const result = await fetchUsers(
      accessToken,
      {
        page_size: 100,
        start: nextStart && nextStart.length > 0 ? nextStart : undefined
      }
    );
    //  console.log("fetchUsers result:", JSON.stringify(result, null, 2));
    if (result.error) {
      throw result.error;
    }

    for (const rampUser of result.model!.data) {
      //    console.log(`User ${rampUser.id}: ${rampUser.last_name}, ${rampUser.first_name}`);
      const user: User = {
        id: rampUser.id,
        email: rampUser.email,
        employee_id: rampUser.employee_id,
        first_name: rampUser.first_name,
        is_manager: rampUser.is_manager,
        last_name: rampUser.last_name,
        phone: rampUser.phone,
        entity_id: rampUser.entity_id,
        location_id: rampUser.location_id,
        manager_id: rampUser.manager_id,
        role: rampUser.role,
        status: rampUser.status,
        department_id: rampUser.department_id,
      }
      await dbRamp.user.upsert({
        where: {id: user.id},
        update: user,
        create: user,
      });
      // Any error thrown by Prisma will be forwarded back to the caller
      count++;
      nextStart = result.model!.page?.next || null;
    }

    console.log("Users refreshed:", count);

  }

}

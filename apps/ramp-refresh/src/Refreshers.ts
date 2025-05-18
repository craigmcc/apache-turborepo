/**
 * Functions to return the entire contents of specific models
 * via the Ramp API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import { fetchAccessToken } from "@repo/ramp-api/AuthActions";
import { fetchCards } from "@repo/ramp-api/CardActions";
import { fetchDepartments } from "@repo/ramp-api/DepartmentActions";
import { fetchUsers } from "@repo/ramp-api/UserActions";
import {
  dbRamp,
  Card,
  CardSpendingRestrictions,
  Department,
  User,
} from "@repo/ramp-db/client";

// Public Objects ------------------------------------------------------------

export async function refreshAccessToken(): Promise<string> {
  console.log("Fetching access token...");
  const accessTokenResponse = await fetchAccessToken();
  if (accessTokenResponse.error) {
    throw accessTokenResponse.error;
  }
  return accessTokenResponse.model!.access_token;
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

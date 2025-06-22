/**
 * Functions to return the entire contents of specific models
 * via the Bill API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {
  fetchSessionId,
  fetchUsers,
} from "@repo/bill-api/UserActions";
import {
  dbBill,
  User,
} from "@repo/bill-db/Models";
import {
  createUser,
} from "./Creators";

// Public Objects ------------------------------------------------------------

export async function refreshSessionId(): Promise<string> {
  console.log("Fetching session ID...");
  const sessionId = await fetchSessionId();
  console.log("Session ID fetched:", sessionId);
  return sessionId;
}

export async function refreshUsers(sessionId: string): Promise<void> {

  console.log("Fetching users...");
  let count = 0;
  let nextPage: string | null = "";

  while (nextPage !== null) {

    const result = await fetchUsers(sessionId,
      {
        max: 100,
        page: nextPage && nextPage.length > 0? nextPage : undefined,
      });

    for (const billUser of result.results) {

      const user: User = createUser(billUser);

      await dbBill.user.upsert({
        where: { id: user.id },
        create: user,
        update: user,
      });

      count++;

    }

    nextPage = result.nextPage || null;

  }

  console.log("Users refreshed:", count);

}

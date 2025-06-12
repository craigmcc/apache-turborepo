/**
 * Base page for limits.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { LimitsTable } from "@/components/limits/LimitsTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function LimitsPage() {

  const allLimits = await dbRamp.limit.findMany({
    include: {
      cards: {
        include: {
          card: true,
        }
      },
      spending_restrictions: true,
      users: {
        include: {
          user: true,
        }
      }
    },
    orderBy: {
      display_name: "asc",
    },
  });

  return (
    <LimitsTable allLimits={allLimits}/>
  );
}

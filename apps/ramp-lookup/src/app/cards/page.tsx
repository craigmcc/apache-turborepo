/**
 * Base page for cards.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { CardsTable } from "@/components/cards/CardsTable";
import { dbRamp } from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export default async function CardsPage() {

  const allCards = await dbRamp.card.findMany({
    include: {
      cardholder: true,
    },
    orderBy: [
      { cardholder: { last_name: "asc" } },
      { cardholder: { first_name: "asc" } },
      { display_name: "asc" },
    ],
  });

  return (
    <CardsTable allCards={allCards}/>
  );

}

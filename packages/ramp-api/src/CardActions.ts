"use server";

/**
 * Server Actions for Cards.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import type { RampResult, RampCard, RampCardsResponse } from "./Models.d.ts";

// Private Objects ------------------------------------------------------------

const RAMP_PROD_API_BASE_URL = process.env.RAMP_PROD_API_BASE_URL;

// Data Types ----------------------------------------------------------------

/**
 * Query parameters for fetchCards().
 */
export type FetchCardsParams = {
  // Filter by card program id
  card_program_id?: string;
  // Filter by display name
  display_name?: string;
  // Filter by entity id
  entity_id?: string;
  // Filter only for activated cards.  Defaults to true if not specified
  is_activated?: boolean;
  // Filter only for terminated cards.  Defaults to false if not specified
  is_terminated?: boolean;
  // Number of results to return on each page (2-100). [20]
  page_size?: number;
  // The ID of the last entry on the previous page, for pagination
  start?: string;
}

// Public Objects ------------------------------------------------------------

/**
 * Fetch a Card by ID.
 */
export async function fetchCard(
  // The access token to use for authentication
  accessToken: string,
  // The ID of the card to fetch
  cardId: string
) {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/cards/${cardId}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      error: { ...error, status: response.status },
    };
  } else {
    return {
      headers: response.headers,
      model: await response.json() as RampCard,
    }
  }

}

/**
 * Fetch all or selected cards from the Ramp API.
 */
export async function fetchCards(
  // The access token to use for authentication
  accessToken: string,
  // Optional query parameters
  params: FetchCardsParams = {}
): Promise<RampResult<RampCardsResponse>> {

  if (!RAMP_PROD_API_BASE_URL) {
    return {
      error: {
        error_code: "RAMP_PROD_API_BASE_URL_NOT_SET",
        message: "RAMP_PROD_API_BASE_URL is not set",
        status: 500
      }
    };
  }

  const url = new URL(`${RAMP_PROD_API_BASE_URL}/developer/v1/cards`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      error: { ...error, status: response.status },
      headers: response.headers,
    };
  } else {
    return {
      headers: response.headers,
      model: await response.json() as RampCardsResponse,
    }
  }

}

"use client";

/**
 * UI for refreshing the access token.
 */

// External Modules ----------------------------------------------------------

import { useEffect, useState } from "react";

// Internal Modules ----------------------------------------------------------

import { fetchAccessToken } from "@/actions/AuthActions";
import { useAccessTokenContext } from "@/contexts/AccessTokenContext";
import { RampResult, TokenResponse } from "@/types/Models";

// Private Objects ------------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function RefreshToken() {

  const { changeAccessToken } = useAccessTokenContext();
  const [result, setResult] = useState<RampResult<TokenResponse> | null>(null);

  useEffect(() => {

    const refreshAccessToken = async () => {
      const result = await fetchAccessToken();
      setResult(result);
      if (result.model) {
        changeAccessToken(result.model.access_token);
      }
    }

    refreshAccessToken();

  }, [changeAccessToken]);

  return (
    <div>
      {(!result) ? (
        <p className="bg-info">Refreshing access token...</p>
      ) : (
        (result && result.model) ? (
          <p className="bg-success">
            Access token was successfully refreshed.
            New access token will expire at {new Date(Date.now() + (result.model.expires_in * 1000)).toLocaleString()}.
          </p>
        ) : (
          <div className="bg-danger">
            <p>Error refreshing access token: {result.error?.message}</p>
            <pre>{JSON.stringify(result.error, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  );

}

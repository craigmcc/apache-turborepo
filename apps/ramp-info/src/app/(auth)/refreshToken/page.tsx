/**
 * Page for refreshing the access token.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { RefreshToken } from "@/components/auth/RefreshToken";
import Container from "react-bootstrap/Container";
import React from "react";

// Public Objects ------------------------------------------------------------

export default async function RefreshTokenPage() {
  return (
    <Container className="p-3">
      <Container className="p-2 mb-4 bg-light rounded-3">
        <h1 className="header">
          Refreshing your Access Token ...
        </h1>
      </Container>
      <RefreshToken/>
    </Container>
  )
}

/**
 * Page for listing users and optionally selecting one.
 */

// External Imports ----------------------------------------------------------

import Container from "react-bootstrap/Container";
import React from "react";

// Internal Imports ----------------------------------------------------------

import { SelectUser } from "@/components/users/SelectUser";

// Public Objects ------------------------------------------------------------

export default function SelectUserPage() {
  return (
    <Container className="p-3">
      <Container className="p-2 mb-4 bg-light rounded-3">
        <h1 className="header">
          Select User
        </h1>
      </Container>
      <SelectUser />
    </Container>
  );
}

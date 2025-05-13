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
    <Container className="p-3" fluid>
      <Container className="p-2 mb-4 bg-light rounded-3">
        <h1 className="header">Select User</h1>
        <p className="lead">
          Click on a User to select or deselect that person.
        </p>
      </Container>
      <SelectUser />
    </Container>
  );
}

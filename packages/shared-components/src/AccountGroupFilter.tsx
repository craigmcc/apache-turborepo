"use client";

/**
 * Filter component for selecting a particular account group.
 */

// External Imports ----------------------------------------------------------

import Form from "react-bootstrap/Form";

// Internal Imports ----------------------------------------------------------

import { ACCOUNT_GROUPS } from "@repo/shared-utils";

// Public Objects ------------------------------------------------------------

export type AccountGroupFilterProps = {
  // The currently selected account group
  accountGroupFilter: string;
  // Optional controlID for the filter [accountGroupFilter]
  controlId?: string,
  // Optional label for the filter [Filter by Account Group: ]
  label?: string,
  // Change the currently selected account group
  setAccountGroupFilter: (groupName: string) => void;
}

export function AccountGroupFilter({
  accountGroupFilter,
  controlId = "accountGroupFilter",
  label = "Filter by Account Group:",
  setAccountGroupFilter,
}: AccountGroupFilterProps) {

  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        onChange={(e) =>
          setAccountGroupFilter(e.target.value)}
        size="sm"
        value={accountGroupFilter}
      >
        {ACCOUNT_GROUPS.map((group) => (
          <option key={group.groupName} value={group.groupName}>
            {group.groupName}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}

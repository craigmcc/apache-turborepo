/**
 * Transaction List With Splits request and response.
 */

// External Imports ----------------------------------------------------------

import { Container } from "react-bootstrap";

// Internal Imports ----------------------------------------------------------

import { TransactionListWithSplits } from "@/components/reports/TransactionListWithSplits";

// Public Objects ------------------------------------------------------------

export default function TransactionListWithSplitsPage() {
  return (
    <Container fluid>
      <TransactionListWithSplits/>
    </Container>
  );
}

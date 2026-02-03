/**
 * Transaction List request and response.
 */

// External Imports ----------------------------------------------------------

import { Container } from "react-bootstrap";

// Internal Imports ----------------------------------------------------------

import { TransactionList } from "@/components/reports/TransactionList";

// Public Objects ------------------------------------------------------------

export default function TransactionListPage() {
  return (
    <Container fluid>
      <TransactionList/>
    </Container>
  );
}

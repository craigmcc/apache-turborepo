/**
 * Journal Report request and response.
 */

// External Imports ----------------------------------------------------------

import { Container } from "react-bootstrap";

// Internal Imports ----------------------------------------------------------

import { JournalReport } from "@/components/reports/JournalReport";

// Public Objects ------------------------------------------------------------

export default function JournalReportPage() {
  return (
    <Container fluid>
      <JournalReport/>
    </Container>
  );
}

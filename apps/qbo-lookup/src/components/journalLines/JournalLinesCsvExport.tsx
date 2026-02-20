"use client";

/**
 * Modal for exporting JournalLines to CSV.
 */

// External Imports ----------------------------------------------------------

import { CSVLink } from "react-csv";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { JournalEntryLinePlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type JournalLinesCsvExportProps = {
  // JournalEntryLines to export
  lines: JournalEntryLinePlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function JournalLinesCsvExport({ lines, hide, show }: JournalLinesCsvExportProps) {

  const [filename, setFilename] = useState<string>("QBO-JournalLines.csv");

  const data = [
    [ "Transaction Date", "Amount", "Description", "GL Account", "GL Name" ],
  ];

  for (const line of lines) {
    data.push([
      line.journalEntry?.txnDate || "n/a",
      line.amount ? String(line.amount.toFixed(2)) : "0",
      line.description || "n/a",
      line.account?.acctNum || "n/a",
      line.account?.name || "n/a",
    ]);
  }

  return (

    <Modal
      centered
      dialogClassName="modal-90w"
      onHide={hide}
      scrollable
      show={show}
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>JournalLines CSV Export</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>
            <Col className="text-center">
              <Form.Group controlId="baseFilename">
                <span>Export Filename:</span>
                <Form.Control
                  type="text"
                  value={filename}
                  onChange={(event) => setFilename(event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col className="text-center">
              <CSVLink
                className="bg-info"
                data={data}
                filename={filename}
                uFEFF={false}
              >
                <Button variant="info">
                  Export CSV
                </Button>
              </CSVLink>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>

  )

}

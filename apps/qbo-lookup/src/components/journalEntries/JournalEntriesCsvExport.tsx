"use client";

/**
 * Modal for exporting JournalEntries to CSV.
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

import { JournalEntryPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountsCsvExportProps = {
  // Accounts to export
  journalEntries: JournalEntryPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function JournalEntriesCsvExport({ journalEntries, hide, show }: AccountsCsvExportProps) {

  const [filename, setFilename] = useState<string>("QBO-JournalEntries.csv");

  const data = [
    [ "Id", "CreateTime", "Domain", "LastUpdatedTime", "PrivateNote", "TxnDate", "Adjustment" ]
  ];

  for (const journalEntry of journalEntries) {
    data.push([
      journalEntry.id,
      journalEntry.createTime?.toLocaleString() || "n/a",
      journalEntry.domain || "n/a",
      journalEntry.lastUpdatedTime?.toLocaleString() || "n/a",
      journalEntry.privateNote || "n/a",
      journalEntry.txnDate || "n/a",
      journalEntry.adjustment ? "Yes" : "No",
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
        <Modal.Title>JournalEntries CSV Export</Modal.Title>
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

"use client";

/**
 * Modal for exporting Accounts to CSV.
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

import { AccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountsCsvExportProps = {
  // Accounts to export
  accounts: AccountPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function AccountsCsvExport({ accounts, hide, show }: AccountsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-Accounts.csv");

  const data = [
    [ "GL Account", "Account Name", "Account Type", "Active", "#Bills" ],
  ];

  for (const account of accounts) {
    data.push([
      account.accountNumber || "n/a",
      account.name || "n/a",
      account.accountType || "n/a",
      account.isActive ? "Yes" : "No",
      account.billClassifications?.length.toString() || "0",
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
        <Modal.Title>Accounts CSV Export</Modal.Title>
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

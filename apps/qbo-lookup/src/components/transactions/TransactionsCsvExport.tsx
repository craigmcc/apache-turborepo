"use client";

/**
 * Modal for exporting Transactions to CSV.
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

import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionsCsvExportProps = {
  // Transactions to export
  transactions: TransactionPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function TransactionsCsvExport({ transactions, hide, show }: TransactionsCsvExportProps) {

  const [filename, setFilename] = useState<string>("QBO-Transactions.csv");

  const data = [
    [ "GL Account", "GL Name", "Date", "Document#", "Memo", "Name", "Amount" ],
  ];

  for (const transaction of transactions) {
    data.push([
      transaction.account?.acctNum || "n/a",
      transaction.account?.name || "n/a",
      transaction.date || "n/a",
      transaction.documentNumber || "n/a",
      transaction.memo || "n/a",
      transaction.name || "n/a",
      transaction.amount ? String(transaction.amount.toFixed(2)) : "0",
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
        <Modal.Title>Transactions CSV Export</Modal.Title>
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

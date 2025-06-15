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

import {
  formatAccountingDate,
  formatAmount,
  formatCardName, formatGlAccount,
  formatMerchantName,
  formatTransactionState,
  formatUserName,
} from "@/lib/Formatters";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionsCsvExportProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Transactions to export
  transactions: TransactionPlus[];
}

export function TransactionsCsvExport({ hide, show, transactions }: TransactionsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Ramp-Transactions.csv");

  const data = [
    [ "Accounting Date-Time", "User Name", "Card Name", "Original Amount",
      "Settled Amount", "Merchant", "GL Account", "State" ],
  ];
  for (const transaction of transactions) {
    data.push([
      formatAccountingDate(transaction),
      formatUserName(transaction.card_holder_user),
      formatCardName(transaction.card),
      formatAmount(transaction.original_transaction_amount_amt, transaction.original_transaction_amount_cc),
      formatAmount(transaction.amount_amt, transaction.amount_cc),
      formatMerchantName(transaction),
      formatGlAccount(transaction),
      formatTransactionState(transaction),
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

"use client";

/**
 * Modal for exporting Cards to CSV.
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
  formatCardInterval,
  formatCardName,
  formatCardState,
  formatDepartmentName,
  formatUserName
} from "@/lib/Formatters";
import { CardPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CardsCsvExportProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Cards to export
  cards: CardPlus[];
}

export function CardsCsvExport({ hide, show, cards }: CardsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Ramp-Cards.csv");

  const data = [
    [ "Department Name", "User Name", "Card Name", "Physical", "State",
      "Interval Limit", "Interval", "Transaction Limit", "Suspended" ],
  ];
  for (const card of cards) {
    data.push([
      formatDepartmentName(card.cardholder?.department),
      formatUserName(card.cardholder),
      formatCardName(card),
      card.is_physical ? "Yes" : "No",
      formatCardState(card),
      formatAmountFunky(card.spending_restrictions?.amount),
      formatCardInterval(card),
      formatAmountFunky(card.spending_restrictions?.transaction_amount_limit),
      card.spending_restrictions?.suspended ? "Yes" : "No",
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
        <Modal.Title>Cards CSV Export</Modal.Title>
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

// Private Objects -----------------------------------------------------------

/**
 * Format an amount as a string with two decimal places.  Funky for old API things.
 */
function formatAmountFunky(amount: number | null | undefined): string {
  if (!amount) return "n/a";
  return `$${amount.toFixed(2)}`;
}


"use client";

/**
 * Modal for exporting Limits to CSV.
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
  formatAmount,
  formatLimitInterval,
  formatLimitName,
  formatLimitState,
} from "@/lib/Formatters";
import { LimitPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type LimitsCsvExportProps = {
  // Function to close the modal
  hide: () => void;
  // Limits to export
  limits: LimitPlus[];
  // Current "show" state of the modal
  show: boolean;
}

export function LimitsCsvExport({ hide, limits, show }: LimitsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Ramp-Limits.csv");

  const data = [
    [ "Limit Name", "State", "Shareable", "Total Balance", "#Cards",
      "#Users", "Interval Limit", "Interval", "Transaction Limit" ],
  ];
  for (const limit of limits) {
    data.push([
      formatLimitName(limit),
      formatLimitState(limit),
      limit.is_shareable ? "Yes" : "No",
      formatAmount(limit.balance_total_amt, limit.balance_total_cc),
      limit.cards ? limit.cards.length.toString() : "0",
      limit.users ? limit.users.length.toString() : "0",
      formatAmount(limit.spending_restrictions?.limit_amt, limit.spending_restrictions?.limit_cc),
      formatLimitInterval(limit),
      formatAmount(limit.spending_restrictions?.transaction_amount_limit_amt, limit.spending_restrictions?.transaction_amount_limit_cc),
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
        <Modal.Title>Limits CSV Export</Modal.Title>
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

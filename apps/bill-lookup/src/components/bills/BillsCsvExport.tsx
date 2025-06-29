"use client";

/**
 * Modal for exporting Bills to CSV.
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

import { BillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillsCsvExportProps = {
  // Bills to export
  bills: BillPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function BillsCsvExport({ bills, hide, show }: BillsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-Bills.csv");

  const data = [
    [ "Bill Name", "Bill Email","Archived",
      "Account Type", "Pay By Type", "Pay By Subtype",
      "Balance Amount", "Balance Last Updated"],
  ];

  for (const bill of bills) {
    data.push([
      bill.id,
/*
      formatBillName(vendor),
      formatBillEmail(vendor),
      vendor.archived ? "Yes" : "No",
      vendor.accountType || "n/a",
      vendor.paymentInformation?.payByType || "n/a",
      vendor.paymentInformation?.payBySubType || "n/a",
      vendor.balance_amount ? vendor.balance_amount.toString() : "0.00",
      vendor.balance_lastUpdatedDate || "n/a",
*/
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
        <Modal.Title>Bills CSV Export</Modal.Title>
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

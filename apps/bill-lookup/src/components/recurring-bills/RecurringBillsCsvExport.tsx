"use client";

/**
 * Modal for exporting Recurring Bills to CSV.
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
  formatAccountNumberAndName,
  formatRecurringBillAmount,
  formatVendorName,
} from "@/lib/Formatters";
import { RecurringBillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type RecurringBillsCsvExportProps = {
  // Bills to export
  bills: RecurringBillPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function RecurringBillsCsvExport({ bills, hide, show }: RecurringBillsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-RecurringBills.csv");

  const data = [
    [ "Vendor Name", "End Date", "Ahead Days", "Period", "Amount",
      "GL Account", "Archived"],
  ];

  for (const bill of bills) {
    data.push([
      formatVendorName(bill.vendor),
      bill.schedule?.endDate || "",
      bill.schedule?.daysInAdvance?.toString() || "",
      bill.schedule?.period || "",
      formatRecurringBillAmount(bill) || "",
      formatAccountNumberAndName(bill.lineItems?.[0]?.classifications?.account) || "",
      bill.archived ? "Yes" : "No",
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
        <Modal.Title>Recurring Bills CSV Export</Modal.Title>
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

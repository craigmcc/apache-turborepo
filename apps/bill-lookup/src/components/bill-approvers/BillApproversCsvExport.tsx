"use client";

/**
 * Modal for exporting Bill Approvers to CSV.
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
  formatBillAmount,
  formatBillInvoiceDate,
  formatUserName,
  formatVendorName
} from "@/lib/Formatters";
import { BillApproverPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillApproversCsvExportProps = {
  // Bills to export
  billApprovers: BillApproverPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function BillApproversCsvExport({ billApprovers, hide, show }: BillApproversCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-BillApprovers.csv");

  const data = [
    [ "Vendor Name", "Invoice Date", "Invoice Amount", "GL Account",
      "Archived", "Approver Name", "Approval Status" ],
  ];

  for (const billApprover of billApprovers) {
    data.push([
      formatVendorName(billApprover.bill?.vendor),
      formatBillInvoiceDate(billApprover.bill),
      formatBillAmount(billApprover.bill),
      formatAccountNumberAndName(billApprover.bill?.classifications?.account),
      billApprover.bill?.archived ? "Yes" : "No",
      formatUserName(billApprover.user),
      billApprover?.status|| "n/a",
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
        <Modal.Title>Bill Approvers CSV Export</Modal.Title>
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

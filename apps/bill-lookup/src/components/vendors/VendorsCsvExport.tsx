"use client";

/**
 * Modal for exporting Users to CSV.
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
  formatVendorEmail,
  formatVendorName
} from "@/lib/Formatters";
import { VendorPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type VendorsCsvExportProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Vendors to export
  vendors: VendorPlus[];
}

export function VendorsCsvExport({ hide, show, vendors }: VendorsCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-Vendors.csv");

  const data = [
    [ "Vendor Name", "Vendor Email","Archived",
      "Account Type", "Pay By Type", "Pay By Subtype",
      "Balance Amount", "Balance Last Updated"],
  ];

  for (const vendor of vendors) {
    data.push([
      formatVendorName(vendor),
      formatVendorEmail(vendor),
      vendor.archived ? "Yes" : "No",
      vendor.accountType || "n/a",
      vendor.paymentInformation?.payByType || "n/a",
      vendor.paymentInformation?.payBySubType || "n/a",
      vendor.balance_amount ? vendor.balance_amount.toString() : "0.00",
      vendor.balance_lastUpdatedDate || "n/a",
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
        <Modal.Title>Users CSV Export</Modal.Title>
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

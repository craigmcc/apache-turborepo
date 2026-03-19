"use client";

/**
 * Modal for exporting Customers to CSV.
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

import { CustomerPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CustomersCsvExportProps = {
  // Customers to export
  customers: CustomerPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function CustomersCsvExport({ customers, hide, show }: CustomersCsvExportProps) {

  const [filename, setFilename] = useState<string>("QBO-Customers.csv");

  const data = [
    [ "Id", "CreateTime", "Domain", "LastUpdatedTime", "Active", "Currency",
      "Email", "Name",  ]
    ];

  for (const customer of customers) {
    data.push([
      customer.id,
      String(customer.createTime?.toLocaleString() || "n/a"),
      customer.domain || "n/a",
      String(customer.lastUpdatedTime?.toLocaleString() || "n/a"),
      customer.active? "Yes" : "No",
      customer.currency || "n/a",
      customer.email || "n/a",
      customer.name || "n/a",
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
        <Modal.Title>Customers CSV Export</Modal.Title>
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

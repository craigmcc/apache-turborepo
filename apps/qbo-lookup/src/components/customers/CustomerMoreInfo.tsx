"use client";

/**
 * Modal for displaying more information about a Customer.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { CustomerPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CustomerMoreInfoProps = {
  // Customer to display more information about (if any)
  customer: CustomerPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function CustomerMoreInfo({ customer, hide, show }: CustomerMoreInfoProps) {

  if (!customer) {
    return null; // If no customer is provided, do not render the modal
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
        <Modal.Title>Customer Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={12} className="me-3">
              <h5 className="bg-primary-subtle">Customer Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{customer.id}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{customer.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{customer.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{customer.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>active</td>
                  <td>{customer.active ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>currency</td>
                  <td>{customer.currency || "n/a"}</td>
                </tr>
                <tr>
                  <td>email</td>
                  <td>{customer.email || "n/a"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{customer.name || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

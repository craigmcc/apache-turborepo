"use client";

/**
 * Modal for displaying more information about an Account.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { AccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountMoreInfoProps = {
  // Account to display more information about (if any)
  account: AccountPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function AccountMoreInfo({ account, hide, show }: AccountMoreInfoProps) {

  if (!account) {
    return null; // If no account is provided, do not render the modal
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
        <Modal.Title>Account Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5}>
              <h5 className="bg-primary-subtle">Account Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{account.id}</td>
                </tr>
                <tr>
                  <td>accountNumber</td>
                  <td>{account.accountNumber}</td>
                </tr>
                <tr>
                  <td>accountType</td>
                  <td>{account.accountType}</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>{account.description}</td>
                </tr>
                <tr>
                  <td>isActive</td>
                  <td>{account.isActive ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{account.name}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={7}>
              <h5 className="bg-primary-subtle">Bills Information</h5>
              { account.billClassifications && account.billClassifications.length > 0 ? (
              <Table size="sm" bordered>
                <thead>
                <tr>
                  <th>id</th>
                  <th>vendorName</th>
                  <th>amount</th>
                  <th>dueDate</th>
                </tr>
                </thead>
                <tbody>
                {account.billClassifications.map((billClassification) => (
                  <tr key={billClassification.billId}>
                    <td>{billClassification.bill?.id || "n/a"}</td>
                    <td>{billClassification.bill?.vendorName || "n/a"}</td>
                    <td className="text-end">
                      {billClassification.bill?.amount?.toFixed(2) || "n/a"}
                    </td>
                    <td>{billClassification.bill?.dueDate ? new Date(billClassification.bill.dueDate).toLocaleDateString() : "n/a"}</td>
                  </tr>
                ))}
                </tbody>
              </Table>
              ) : (
                <p className="text-center">No bills available for this account.</p>
              )}
            </Col>

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

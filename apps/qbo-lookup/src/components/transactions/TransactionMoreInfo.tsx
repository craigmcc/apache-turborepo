"use client";

/**
 * Modal for displaying more information about a Transaction.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionMoreInfoProps = {
  // Transaction to display more information about (if any)
  transaction: TransactionPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function TransactionMoreInfo({ transaction, hide, show }: TransactionMoreInfoProps) {

  if (!transaction) {
    return null; // If no transaction is provided, do not render the modal
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
        <Modal.Title>Transaction Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Transaction Information 1</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{transaction.id}</td>
                </tr>
                <tr>
                  <td>date</td>
                  <td>{transaction.date || "n/a"}</td>
                </tr>
                <tr>
                  <td>documentNumber</td>
                  <td>{transaction.documentNumber || "n/a"}</td>
                </tr>
                <tr>
                  <td>memo</td>
                  <td>{transaction.memo || "n/a"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{transaction.name || "n/a"}</td>
                </tr>
                <tr>
                  <td>type</td>
                  <td>{transaction.type || "n/a"}</td>
                </tr>
                <tr>
                  <td>amount</td>
                  <td>{transaction.amount !== null ? transaction.amount.toFixed(2) : "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Account Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>accountId</td>
                  <td>{transaction.account?.id}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{transaction.account?.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{transaction.account?.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{transaction.account?.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>acctNum</td>
                  <td>{transaction.account?.acctNum || "n/a"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{transaction.account?.name || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountSubType</td>
                  <td>{transaction.account?.accountSubType || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountType</td>
                  <td>{transaction.account?.accountType || "n/a"}</td>
                </tr>
                <tr>
                  <td>active</td>
                  <td>{transaction.account?.active ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>classification</td>
                  <td>{transaction.account?.classification || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  )

}

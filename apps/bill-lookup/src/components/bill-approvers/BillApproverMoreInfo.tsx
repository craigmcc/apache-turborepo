"use client";

/**
 * Modal for displaying more information about a Bill Approver.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import {
  formatAccountNumberAndName,
  formatBillAmount,
  formatBillDueDate,
  formatBillExchangeRate,
  formatBillInvoiceDate,
  formatBillInvoiceNumber,
  formatBillPaidAmount,
  formatUserEmail,
  formatUserName,
  formatVendorName
} from "@/lib/Formatters";
import { BillApproverPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillApproverMoreInfoProps = {
  // Bill Approver to display more information about (if any)
  billApprover: BillApproverPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function BillApproverMoreInfo({ billApprover, hide, show }: BillApproverMoreInfoProps) {

  if (!billApprover) {
    return null; // If no bill approver is provided, do not render the modal
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
        <Modal.Title>Bill Approver Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row className="mb-3">

            <Col>
              <h5 className="bg-primary-subtle text-center">Bill Approver Information</h5>
              <Table bordered hover responsive>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{billApprover.id}</td>
                </tr>
                <tr>
                  <td>isActive</td>
                  <td>{billApprover.isActive ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>status</td>
                  <td>{billApprover.status}</td>
                </tr>
                <tr>
                  <td>billId</td>
                  <td>{billApprover.billId}</td>
                </tr>
                <tr>
                  <td>userId</td>
                  <td>{billApprover.userId}</td>
                </tr>
                </tbody>
              </Table>

            </Col>

            <Col>
              <h5 className="bg-primary-subtle text-center">User Information</h5>
              <Table bordered hover responsive>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{billApprover.user?.id || "n/a"}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{billApprover.user?.archived ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>email</td>
                  <td>{formatUserEmail(billApprover.user)}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{formatUserName(billApprover.user)}</td>
                </tr>
                <tr>
                  <td>roleType</td>
                  <td>{billApprover.user?.roleType || "n/a"}</td>
                </tr>
                </tbody>
              </Table>

            </Col>

          </Row>

          <Row>

            <Col>
              <h5 className="bg-primary-subtle text-center">Bill Information</h5>
              <Table bordered hover responsive>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{billApprover.bill?.id || "n/a"}</td>
                </tr>
                <tr>
                  <td>amount</td>
                  <td>{formatBillAmount(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{billApprover.bill?.archived ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>dueDate</td>
                  <td>{formatBillDueDate(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>exchangeRate</td>
                  <td>{formatBillExchangeRate(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>invoiceDate</td>
                  <td>{formatBillInvoiceDate(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>invoiceNumber</td>
                  <td>{formatBillInvoiceNumber(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>paidAmount</td>
                  <td>{formatBillPaidAmount(billApprover.bill)}</td>
                </tr>
                <tr>
                  <td>GL Account</td>
                  <td>{formatAccountNumberAndName(billApprover.bill?.classifications?.account)}</td>
                </tr>
                <tr>
                  <td>vendor.name</td>
                  <td>{formatVendorName(billApprover.bill?.vendor)}</td>
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

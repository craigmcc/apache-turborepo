"use client";

/**
 * Modal for displaying more information about a Bill.
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
  formatBillPaidAmount, formatUserName,
  formatVendorName
} from "@/lib/Formatters";
import { BillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type BillMoreInfoProps = {
  // Bill to display more information about (if any)
  bill: BillPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function BillMoreInfo({ bill, hide, show, }: BillMoreInfoProps) {

  if (!bill) {
    return null; // If no bill is provided, do not render the modal
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
        <Modal.Title>Bill Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5}>
              <h5 className="bg-primary-subtle text-center">Bill Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{bill.id}</td>
                </tr>
                <tr>
                  <td>amount</td>
                  <td>{formatBillAmount(bill)}</td>
                </tr>
                <tr>
                  <td>approvalStatus</td>
                  <td>{bill.approvalStatus || "n/a"}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{bill.archived ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>dueDate</td>
                  <td>{formatBillDueDate(bill)}</td>
                </tr>
                <tr>
                  <td>exchangeRate</td>
                  <td>{formatBillExchangeRate(bill)}</td>
                </tr>
                <tr>
                  <td>invoiceDate</td>
                  <td>{formatBillInvoiceDate(bill)}</td>
                </tr>
                <tr>
                  <td>invoiceNumber</td>
                  <td>{formatBillInvoiceNumber(bill)}</td>
                </tr>
                <tr>
                  <td>paidAmount</td>
                  <td>{formatBillPaidAmount(bill)}</td>
                </tr>
                <tr>
                  <td>paymentStatus</td>
                  <td>{bill.paymentStatus || "n/a"}</td>
                </tr>
                <tr>
                  <td>GL Account</td>
                  <td>{formatAccountNumberAndName(bill.classifications?.account)}</td>
                </tr>
                <tr>
                  <td>vendor.name</td>
                  <td>{formatVendorName(bill.vendor)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={7}>
              <h5 className="bg-primary-subtle text-center">Bill Classifications</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>accountingClassId</td>
                  <td>{bill.classifications?.accountingClassId || "n/a"}</td>
                </tr>
                <tr>
                  <td>chartOfAccountId</td>
                  <td>{bill.classifications?.chartOfAccountId || "n/a"}</td>
                </tr>
                <tr>
                  <td>departmentId</td>
                  <td>{bill.classifications?.departmentId || "n/a"}</td>
                </tr>
                <tr>
                  <td>itemId</td>
                  <td>{bill.classifications?.itemId || "n/a"}</td>
                </tr>
                <tr>
                  <td>locationId</td>
                  <td>{bill.classifications?.locationId || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row>

            <Col xs={12} md={12}>
              <h5 className="bg-primary-subtle text-center">Bill Approvers</h5>
              { bill.approvers && bill.approvers.length > 0 ? (
                <Table size="sm" bordered>
                  <tr>
                    <th>ID</th>
                    <th>Active</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th>User Name</th>
                  </tr>
                  <tbody>
                  {bill.approvers!.map(approver => (
                    <tr key={approver.id}>
                      <td>{approver.id}</td>
                      <td>{approver.isActive ? "Yes" : "No"}</td>
                      <td className="text-end">{approver.sortOrder || "n/a"}</td>
                      <td>{approver.status || "n/a"}</td>
                      <td>{formatUserName(approver.user)}</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No approvers available for this recurring bill.</p>
              )}
            </Col>

          </Row>

          <Row>

            <Col xs={12} md={12}>
              <h5 className="bg-primary-subtle text-center">Bill Line Items</h5>
              { bill.lineItems && bill.lineItems.length > 0 ? (
                <Table size="sm" bordered>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>GL Account</th>
                    <th className="text-end">Amount (Local)</th>
                  </tr>
                  <tbody>
                  {bill.lineItems!.map(lineItem => (
                    <tr key={lineItem.id}>
                      <td>{lineItem.id}</td>
                      <td>{lineItem.description || "n/a"}</td>
                      <td>{formatAccountNumberAndName(lineItem.classifications?.account)}</td>
                      <td className="text-end">{lineItem.amount?.toFixed(2) || "n/a"}</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No line items available for this bill.</p>
              )}
            </Col>

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

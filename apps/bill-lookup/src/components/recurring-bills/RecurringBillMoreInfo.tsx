"use client";

/**
 * Modal for displaying more information about a Recurring Bill.
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
  formatRecurringBillAmount,
  formatUserName,
  formatVendorName
} from "@/lib/Formatters";
import { RecurringBillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type RecurringBillMoreInfoProps = {
  // Bill to display more information about (if any)
  bill: RecurringBillPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function RecurringBillMoreInfo({ bill, hide, show, }: RecurringBillMoreInfoProps) {

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
        <Modal.Title>Recurring Bill Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5}>
              <h5 className="bg-primary-subtle text-center">Recurring Bill Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{bill.id}</td>
                </tr>
                <tr>
                  <td>amount</td>
                  <td>{formatRecurringBillAmount(bill) || "n/a"}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{bill.archived ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>createdTime</td>
                  <td>{bill.createdTime || "n/a"}</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>{bill.description || "n/a"}</td>
                </tr>
                <tr>
                  <td>processingOptionsAutoPay</td>
                  <td>{bill.processingOptionsAutoPay ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>updatedTime</td>
                  <td>{bill.updatedTime || "n/a"}</td>
                </tr>
                <tr>
                  <td>vendor.name</td>
                  <td>{formatVendorName(bill.vendor)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={7}>
              <h5 className="bg-primary-subtle text-center">Schedule</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>daysInAdvance</td>
                  <td>{bill.schedule?.daysInAdvance || "n/a"}</td>
                </tr>
                <tr>
                  <td>endDate</td>
                  <td>{bill.schedule?.endDate || "n/a"}</td>
                </tr>
                <tr>
                  <td>frequency</td>
                  <td>{bill.schedule?.frequency || "n/a"}</td>
                </tr>
                <tr>
                  <td>period</td>
                  <td>{bill.schedule?.period || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row>

            <Col xs={12} md={12}>
              <h5 className="bg-primary-subtle text-center">Approvers</h5>
              { bill.approvers && bill.approvers.length > 0 ? (
                <Table size="sm" bordered>
                  <tr>
                    <th>ID</th>
                    <th>Active</th>
                    <th>Sort Order</th>
                    <th>User Name</th>
                  </tr>
                  <tbody>
                  {bill.approvers!.map(approver => (
                    <tr key={approver.id}>
                      <td>{approver.id}</td>
                      <td>{approver.isActive ? "Yes" : "No"}</td>
                      <td className="text-end">{approver.sortOrder || "n/a"}</td>
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
              <h5 className="bg-primary-subtle text-center">Line Items</h5>
              { bill.lineItems && bill.lineItems.length > 0 ? (
                <Table size="sm" bordered>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>GL Account</th>
                  </tr>
                  <tbody>
                  {bill.lineItems!.map(lineItem => (
                    <tr key={lineItem.id}>
                      <td>{lineItem.id}</td>
                      <td className="text-end">{lineItem.amount?.toFixed(2) || "n/a"}</td>
                      <td>{lineItem.description || "n/a"}</td>
                      <td>{formatAccountNumberAndName(lineItem.classifications?.account)}</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No line items available for this recurring bill.</p>
              )}
            </Col>

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

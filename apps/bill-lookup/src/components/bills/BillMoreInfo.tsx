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

            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Bill Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{bill.id}</td>
                </tr>
{/*
                <tr>
                  <td>accountType</td>
                  <td>{vendor.accountType}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{vendor.archived}</td>
                </tr>
                <tr>
                  <td>balance_amount</td>
                  <td>{vendor.balance_amount}</td>
                </tr>
                <tr>
                  <td>email</td>
                  <td>{vendor.email}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{vendor.name}</td>
                </tr>
                <tr>
                  <td>networkStatus</td>
                  <td>{vendor.networkStatus}</td>
                </tr>
*/}
                </tbody>
              </Table>
            </Col>

{/*
            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Bill Address</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>line1</td>
                  <td>{vendor.address?.line1 || "n/a"}</td>
                </tr>
                <tr>
                  <td>line2</td>
                  <td>{vendor.address?.line2 || "n/a"}</td>
                </tr>
                <tr>
                  <td>city</td>
                  <td>{vendor.address?.city || "n/a"}</td>
                </tr>
                <tr>
                  <td>stateOrProvince</td>
                  <td>{vendor.address?.stateOrProvince || "n/a"}</td>
                </tr>
                <tr>
                  <td>country</td>
                  <td>{vendor.address?.country}</td>
                </tr>
                <tr>
                  <td>zipOrPostalCode</td>
                  <td>{vendor.address?.zipOrPostalCode}</td>
                </tr>
                <tr>
                  <td>countryName</td>
                  <td>{vendor.address?.countryName}</td>
                </tr>
                </tbody>
              </Table>
            </Col>
*/}

          </Row>

          <Row>

{/*
            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Additional Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>combinePayment</td>
                  <td>{vendor.additionalInfo?.combinePayment || "n/a"}</td>
                </tr>
                <tr>
                  <td>companyName</td>
                  <td>{vendor.additionalInfo?.companyName || "n/a"}</td>
                </tr>
                <tr>
                  <td>leadTimeInDays</td>
                  <td>{vendor.additionalInfo?.leadTimeInDays || "n/a"}</td>
                </tr>
                <tr>
                  <td>taxId</td>
                  <td>{vendor.additionalInfo?.taxId || "n/a"}</td>
                </tr>
                <tr>
                  <td>taxIdType</td>
                  <td>{vendor.additionalInfo?.taxIdType || "n/a"}</td>
                </tr>
                <tr>
                  <td>track1099</td>
                  <td>{vendor.additionalInfo?.track1099 || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>
*/}

{/*
            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Payment Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>email</td>
                  <td>{vendor.paymentInformation?.email || "n/a"}</td>
                </tr>
                <tr>
                  <td>payBySubType</td>
                  <td>{vendor.paymentInformation?.payBySubType || "n/a"}</td>
                </tr>
                <tr>
                  <td>payByType</td>
                  <td>{vendor.paymentInformation?.payByType || "n/a"}</td>
                </tr>
                <tr>
                  <td>payeeName</td>
                  <td>{vendor.paymentInformation?.payeeName || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>
*/}

          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

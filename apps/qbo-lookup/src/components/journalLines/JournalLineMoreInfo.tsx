"use client";

/**
 * Modal for displaying more information about a Journal Line.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { formatJournalEntryLineAmount } from "@/lib/Formatters";
import { JournalEntryLinePlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type JournalLineMoreInfoProps = {
  // JournalEntryLine to display more information about (if any)
  journalLine: JournalEntryLinePlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function JournalLineMoreInfo({ journalLine, hide, show }: JournalLineMoreInfoProps) {

  if (!journalLine) {
    return null; // If no journalLine is provided, do not render the modal
  }
  let amount = journalLine.amount;
  if (amount && journalLine.postingType === "Credit") {
    amount = -amount;
  }
  const account = journalLine.account;
  const journalEntry = journalLine.journalEntry;

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
        <Modal.Title>Journal Line Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Journal Line Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{journalLine.id}</td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td>{formatJournalEntryLineAmount(journalLine)}</td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>{journalLine.description || "n/a"}</td>
                </tr>
                <tr>
                  <td>PostingType</td>
                  <td>{journalLine.postingType || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Journal Entry Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{journalEntry?.id || "n/a"}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{journalEntry?.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{journalEntry?.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{journalEntry?.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>privateNote</td>
                  <td>{journalEntry?.privateNote || "n/a"}</td>
                </tr>
                <tr>
                  <td>txnDate</td>
                  <td>{journalEntry?.txnDate || "n/a"}</td>
                </tr>
                <tr>
                  <td>adjustment</td>
                  <td>{journalEntry?.adjustment || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Account Information 1</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{account?.id}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{account?.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{account?.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{account?.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>acctNum</td>
                  <td>{account?.acctNum || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountSubType</td>
                  <td>{account?.accountSubType || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountType</td>
                  <td>{account?.accountType || "n/a"}</td>
                </tr>
                <tr>
                  <td>active</td>
                  <td>{account?.active ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>classification</td>
                  <td>{account?.classification || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={5}>
              <h5 className="bg-primary-subtle">Account Information 2</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>currencyRefName</td>
                  <td>{account?.currencyRefName || "n/a"}</td>
                </tr>
                <tr>
                  <td>currencyRefValue</td>
                  <td>{account?.currencyRefValue || "n/a"}</td>
                </tr>
                <tr>
                  <td>currentBalance</td>
                  <td>{account?.currentBalance || "n/a"}</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>{account?.description || "n/a"}</td>
                </tr>
                <tr>
                  <td>fullyQualifiedName</td>
                  <td>{account?.fullyQualifiedName || "n/a"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{account?.name || "n/a"}</td>
                </tr>
                <tr>
                  <td>parentId</td>
                  <td>{account?.parentId || "n/a"}</td>
                </tr>
                <tr>
                  <td>subAccount</td>
                  <td>{account?.subAccount ? "Yes" : "No"}</td>
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

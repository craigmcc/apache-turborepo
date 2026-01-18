"use client";

/**
 * Modal for displaying more information about a Journal Entry.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { JournalEntryPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type JournalEntryMoreInfoProps = {
  // JournalEntry to display more information about (if any)
  journalEntry: JournalEntryPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function JournalEntryMoreInfo({ journalEntry, hide, show }: JournalEntryMoreInfoProps) {

  if (!journalEntry) {
    return null; // If no journalEntry is provided, do not render the modal
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
        <Modal.Title>JournalEntry Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">JournalEntry Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{journalEntry.id}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{journalEntry.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{journalEntry.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{journalEntry.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>privateNote</td>
                  <td>{journalEntry.privateNote || "n/a"}</td>
                </tr>
                <tr>
                  <td>txnDate</td>
                  <td>{journalEntry.txnDate || "n/a"}</td>
                </tr>
                <tr>
                  <td>adjustment</td>
                  <td>{journalEntry.adjustment || "n/a"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          {journalEntry.lines && journalEntry.lines.length > 0 && (
            <Row className="mt-4">
              <h5 className="bg-primary-subtle">Journal Entry Lines</h5>
              <Table size="sm" bordered>

                <thead>
                <tr>
                  <th>id</th>
                  <th>amount</th>
                  <th>description</th>
                  <th>accountId</th>
                  <th>postingType</th>
                  <th>accountNumber</th>
                  <th>accountName</th>
                  <th>active</th>
                </tr>
                </thead>

                <tbody>
                {journalEntry.lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.id}</td>
                    <td>{line.amount || "n/a"}</td>
                    <td>{line.description || "n/a"}</td>
                    <td>{line.accountId || "n/a"}</td>
                    <td>{line.postingType || "n/a"}</td>
                    <td>{line.account?.acctNum || "n/a"}</td>
                    <td>{line.account?.name || "n/a"}</td>
                    <td>{line.account?.active || "n/a"}</td>
                  </tr>
                ))}
                </tbody>

              </Table>
            </Row>
          )}

        </Container>
      </Modal.Body>
    </Modal>
  );

}

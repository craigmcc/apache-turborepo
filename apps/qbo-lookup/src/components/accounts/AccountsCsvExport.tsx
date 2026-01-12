"use client";

/**
 * Modal for exporting Accounts to CSV.
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

import { AccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountsCsvExportProps = {
  // Accounts to export
  accounts: AccountPlus[];
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function AccountsCsvExport({ accounts, hide, show }: AccountsCsvExportProps) {

  const [filename, setFilename] = useState<string>("QBO-Accounts.csv");

  const data = [
    [ "Id", "Domain", "SubType", "Type", "Account #", "Active", "Classification",
      "Currency Ref Name", "Currency Ref Value", "Current Balance", "Description",
      "Fully Qualified Name", "Name", "Parent Id", "SubAccount", "#Children" ],
  ];

  for (const account of accounts) {
    data.push([
      account.id,
      account.domain || "n/a",
      account.accountSubType || "n/a",
      account.accountType || "n/a",
      account.acctNum || "n/a",
      account.active? "Yes" : "No",
      account.classification || "n/a",
      account.currencyRefName || "n/a",
      account.currencyRefValue || "n/a",
      account.currentBalance?.toString() || "n/a",
      account.description || "n/a",
      account.fullyQualifiedName || "n/a",
      account.name || "n/a",
      account.parentId || "n/a",
      account.subAccount ? "Yes" : "No",
      account.childAccounts ? account.childAccounts.length.toString() : "0",
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
        <Modal.Title>Accounts CSV Export</Modal.Title>
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

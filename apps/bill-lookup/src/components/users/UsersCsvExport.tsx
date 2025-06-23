"use client";

/**
 * Modal for exporting Users to CSV.
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

import {
  formatUserEmail,
  formatUserName
} from "@/lib/Formatters";
import { UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UsersCsvExportProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Cards to export
  users: UserPlus[];
}

export function UsersCsvExport({ hide, show, users }: UsersCsvExportProps) {

  const [filename, setFilename] = useState<string>("Bill-Users.csv");

  const data = [
    [ "User Name", "User Email","Archived", "Role Type", "Role Description"],
  ];

  for (const user of users) {
    data.push([
      formatUserName(user),
      formatUserEmail(user),
      user.archived ? "Yes" : "No",
      user.roleType ? user.roleType : "n/a",
      user.roleDescription ? user.roleDescription : "n/a",
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
        <Modal.Title>Users CSV Export</Modal.Title>
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

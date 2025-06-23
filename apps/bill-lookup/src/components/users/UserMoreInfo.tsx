"use client";

/**
 * Modal for displaying more information about a User.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UserMoreInfoProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // User to display more information about (if any)
  user: UserPlus | null;
}

export function UserMoreInfo({ hide, show, user }: UserMoreInfoProps) {

  if (!user) {
    return null; // If no user is provided, do not render the modal
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
        <Modal.Title>User Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">User Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{user.id}</td>
                </tr>
                <tr>
                  <td>firstName</td>
                  <td>{user.firstName}</td>
                </tr>
                <tr>
                  <td>lastName</td>
                  <td>{user.lastName}</td>
                </tr>
                <tr>
                  <td>email</td>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <td>archived</td>
                  <td>{user.archived ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>roleId</td>
                  <td>{user.roleId}</td>
                </tr>
                <tr>
                  <td>roleType</td>
                  <td>{user.roleType}</td>
                </tr>
                <tr>
                  <td>roleDescription</td>
                  <td>{user.roleDescription}</td>
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

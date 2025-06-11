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

import { formatAmount } from "@/lib/Formatters";
import { UserPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type UserMoreInfoProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // User to display more information about
  user: UserPlus;
}

export function UserMoreInfo({ hide, show, user }: UserMoreInfoProps) {

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
                    <td>email</td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td>first_name</td>
                    <td>{user.first_name}</td>
                  </tr>
                  <tr>
                    <td>last_name</td>
                    <td>{user.last_name}</td>
                  </tr>
                  <tr>
                    <td>phone</td>
                    <td>{user.phone}</td>
                  </tr>
                  <tr>
                    <td>role</td>
                    <td>{user.role}</td>
                  </tr>
                  <tr>
                    <td>status</td>
                    <td>{user.status}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={6}>
              <h5 className="text-center bg-primary-subtle">Department Information</h5>
              {user.department ? (
                <Table size="sm" bordered>
                  <tbody>
                    <tr>
                      <td>id</td>
                      <td>{user.department.id}</td>
                    </tr>
                    <tr>
                      <td>name</td>
                      <td>{user.department.name}</td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <p>No department assigned.</p>
              )}
            </Col>

          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Cards Information</h5>
              {user.cards && user.cards.length > 0 ? (
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>display_name</th>
                      <th>expiration</th>
                      <th>last_four</th>
                      <th>state</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.cards.map(card => (
                      <tr key={card.id}>
                        <td>{card.id}</td>
                        <td>{card.display_name}</td>
                        <td>{card.expiration || "n/a"}</td>
                        <td>{card.last_four || "n/a"}</td>
                        <td>{card.state || "n/a"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No cards assigned.</p>
              )}
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Limit_Users Information</h5>
              {user.limit_users && user.limit_users.length > 0 ? (
                <Table size="sm" bordered>
                  <thead>
                  <tr>
                    <th>limit_id</th>
                    <th>limit.display_name</th>
                    <th>limit.state</th>
                    <th>limit.limit</th>
                    <th>limit.interval</th>
                  </tr>
                  </thead>
                  <tbody>
                  {user.limit_users.map(limit_user => (
                    <tr key={limit_user.limit_id}>
                      <td>{limit_user.limit_id}</td>
                      <td>{limit_user.limit?.display_name || "n/a"}</td>
                      <td>{limit_user.limit?.state || "n/a"}</td>
                      <td>{formatAmount(limit_user.limit?.spending_restrictions?.limit_amt, limit_user.limit?.spending_restrictions?.limit_cc)}</td>
                      <td>{limit_user.limit?.spending_restrictions?.interval}</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text_center">No limit_users assigned.</p>
              )}
            </Col>
          </Row>

        </Container>
      </Modal.Body>
    </Modal>
  );

}

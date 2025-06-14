"use client";

/**
 * Modal for displaying more information about a Limit.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { formatAmount, formatLimitName, formatLimitState, formatUserName } from "@/lib/Formatters";
import { LimitPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type LimitMoreInfoProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Limit to display more information about
  limit: LimitPlus;
};

export function LimitMoreInfo({ hide, show, limit }: LimitMoreInfoProps) {

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
        <Modal.Title>Limit Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Limit Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{limit.id}</td>
                </tr>
                <tr>
                  <td>balance_total</td>
                  <td>{formatAmount(limit.balance_total_amt, limit.balance_total_cc)}</td>
                </tr>
                <tr>
                  <td>display_name</td>
                  <td>{formatLimitName(limit)}</td>
                </tr>
                <tr>
                  <td>is_shareable</td>
                  <td>{limit.is_shareable ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>state</td>
                  <td>{formatLimitState(limit)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={6}>
              <h5 className="text-center bg-primary-subtle">Spending Restrictions</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>interval</td>
                  <td>{limit.spending_restrictions?.interval || "n/a"}</td>
                </tr>
                <tr>
                  <td>limit</td>
                  <td>{formatAmount(limit.spending_restrictions?.limit_amt, limit.spending_restrictions?.limit_cc)}</td>
                </tr>
                <tr>
                  <td>suspended</td>
                  <td>{limit.spending_restrictions?.suspended ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>transaction_limit</td>
                  <td>{formatAmount(limit.spending_restrictions?.transaction_amount_limit_amt, limit.spending_restrictions?.transaction_amount_limit_cc)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row className="mt-3">

            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Limit_Cards Information</h5>
              {limit.cards && limit.cards.length > 0 ? (
                <Table size="sm" bordered>
                  <thead>
                  <tr>
                    <th>card_id</th>
                    <th>card.last_four</th>
                    <th>card.display_name</th>
                    <th>card.state</th>
{/*
                    <th>limit.limit</th>
                    <th>limit.interval</th>
*/}
                  </tr>
                  </thead>
                  <tbody>
                  {limit.cards.map(limit_card => (
                    <tr key={limit_card.card_id}>
                      <td>{limit_card.card_id}</td>
                      <td>{limit_card.card?.last_four || "n/a"}</td>
                      <td>{limit_card.card?.display_name || "n/a"}</td>
                      <td>{limit_card.card?.state || "n/a"}</td>
{/*
                      <td>{formatAmount(limit_card.limit?.spending_restrictions?.limit_amt, limit_card.limit?.spending_restrictions?.limit_cc)}</td>
                      <td>{limit_card.limit?.spending_restrictions?.interval}</td>
*/}
                    </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text_center">No limit_cards assigned.</p>
              )}
            </Col>

          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Limit_Users Information</h5>
              {limit.users && limit.users.length > 0 ? (
                <Table size="sm" bordered>
                  <thead>
                  <tr>
                    <th>user_id</th>
                    <th>user.name</th>
                    <th>user.status</th>
                  </tr>
                  </thead>
                  <tbody>
                  {limit.users.map(limit_user => (
                    <tr key={limit_user.user_id}>
                      <td>{limit_user.user_id}</td>
                      <td>{formatUserName(limit_user.user)}</td>
                      <td>{limit_user.user?.status || "n/a"}</td>
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

"use client";

/**
 * Modal for displaying more information about a Card.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { formatAmount } from "@/lib/Formatters";
import { CardPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CardMoreInfoProps = {
  // Card to display more information about
  card: CardPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function CardMoreInfo({ card, hide, show }: CardMoreInfoProps) {

  if (!card) {
    return null;
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
        <Modal.Title>Card Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={6}>
              <h5 className="bg-primary-subtle">Card Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{card.id}</td>
                </tr>
                <tr>
                  <td>display_name</td>
                  <td>{card.display_name}</td>
                </tr>
                <tr>
                  <td>expiration</td>
                  <td>{card.expiration || "n/a"}</td>
                </tr>
                <tr>
                  <td>is_physical</td>
                  <td>{card.is_physical ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>state</td>
                  <td>{card.state || "n/a"}</td>
                </tr>
                <tr>
                  <td>last_four</td>
                  <td>{card.last_four}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={6}>
              <h5 className="text-center bg-primary-subtle">Spending Restrictions</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>amount</td>
                  <td>{formatAmountFunky(card.spending_restrictions?.amount)}</td>
                </tr>
                <tr>
                  <td>interval</td>
                  <td>{card.spending_restrictions?.interval || "n/a"}</td>
                </tr>
                <tr>
                  <td>suspended</td>
                  <td>{card.spending_restrictions?.suspended ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>transaction_amount</td>
                  <td>{formatAmountFunky(card.spending_restrictions?.transaction_amount_limit)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Limit_Users Information</h5>
              {card.limit_cards && card.limit_cards.length > 0 ? (
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
                  {card.limit_cards.map(limit_card => (
                    <tr key={limit_card.limit_id}>
                      <td>{limit_card.limit_id}</td>
                      <td>{limit_card.limit?.display_name || "n/a"}</td>
                      <td>{limit_card.limit?.state || "n/a"}</td>
                      <td>{formatAmount(limit_card.limit?.spending_restrictions?.limit_amt, limit_card.limit?.spending_restrictions?.limit_cc)}</td>
                      <td>{limit_card.limit?.spending_restrictions?.interval}</td>
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

// Private Objects -----------------------------------------------------------

/**
 * Format an amount as a string with two decimal places.  Funky for old API things.
 */
function formatAmountFunky(amount: number | null | undefined): string {
  if (!amount) return "n/a";
  return `$${amount.toFixed(2)}`;
}


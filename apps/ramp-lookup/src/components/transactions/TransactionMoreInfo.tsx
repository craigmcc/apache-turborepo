"use client";

/**
 * Modal for displaying more information about a Transaction.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import {
  formatAccountingDate,
  formatAmount,
  formatCardLastFour,
  formatCardName,
  formatCardState,
  formatGlAccount,
  formatMerchantName,
  formatTransactionState,
  formatUserName,
  formatUserStatus,
} from "@/lib/Formatters";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionMoreInfoProps = {
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
  // Transaction to display more information about (if any)
  transaction: TransactionPlus | null;
}


export function TransactionMoreInfo({ hide, show, transaction }: TransactionMoreInfoProps) {

  if (!transaction) {
    return null; // If no transaction is provided, do not render the modal
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
        <Modal.Title>Transaction Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={6}>
              <h5 className="text-center bg-primary-subtle">Transaction Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{transaction.id}</td>
                </tr>
                <tr>
                  <td>accounting_date</td>
                  <td>{formatAccountingDate(transaction)}</td>
                </tr>
                <tr>
                  <td>merchant_name</td>
                  <td>{formatMerchantName(transaction)}</td>
                </tr>
                <tr>
                  <td>original_amount</td>
                  <td>{formatAmount(transaction.original_transaction_amount_amt, transaction.original_transaction_amount_cc)}</td>
                </tr>
                <tr>
                  <td>settled_amount</td>
                  <td>{formatAmount(transaction.amount_amt, transaction.amount_cc)}</td>
                </tr>
                <tr>
                  <td>state</td>
                  <td>{formatTransactionState(transaction)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

            <Col xs={12} md={6}>
              <h5 className="text-center bg-primary-subtle">Card and User Information</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>card.id</td>
                  <td>{transaction.card?.id}</td>
                </tr>
                <tr>
                  <td>card.display_name</td>
                  <td>{formatCardName(transaction.card)}</td>
                </tr>
                <tr>
                  <td>card.state</td>
                  <td>{formatCardState(transaction.card)}</td>
                </tr>
                <tr>
                  <td>card.last_four</td>
                  <td>{formatCardLastFour(transaction.card)}</td>
                </tr>
                <tr>
                  <td>user.id</td>
                  <td>{transaction.card_holder_user_id}</td>
                </tr>
                <tr>
                  <td>user.name</td>
                  <td>{formatUserName(transaction.card_holder_user)}</td>
                </tr>
                <tr>
                  <td>user.status</td>
                  <td>{formatUserStatus(transaction.card_holder_user)}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          <Row className="mt-3">

            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Line Item Data</h5>
              {transaction.line_items && transaction.line_items.length > 0 ? (
                <Table size="sm" bordered>
                  <thead>
                  <tr>
                    <th>index</th>
                    <th>original_amount</th>
                    <th>settled_amount</th>
                    <th>GL Account/Name</th>
                  </tr>
                  </thead>
                  <tbody>
                  {transaction.line_items?.map((line_item, index) => (
                    <tr key={line_item.index_line_item}>
                      <td>{line_item.index_line_item}</td>
                      <td>{formatAmount(line_item.amount_amt, line_item.amount_cc)}</td>
                      <td>{formatAmount(line_item.converted_amount_amt, line_item.converted_amount_cc)}</td>
                      <td>{formatGlAccount(transaction, index)}</td>
                   </tr>
                  ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No line items available.</p>
              )}
            </Col>

          </Row>

{/*
          <Row className="mt-3">

            <Col xs={12}>
              <h5 className="text-center bg-primary-subtle">Raw Transaction Data</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>Raw JSON</td>
                  <td>
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(transaction, null, 2)}
                    </pre>
                  </td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>
*/}

        </Container>
      </Modal.Body>
    </Modal>

  );

}

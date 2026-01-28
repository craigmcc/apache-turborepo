"use client";

/**
 * Modal for displaying more information about an Account.
 */

// External Imports ----------------------------------------------------------

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Imports ----------------------------------------------------------

import { AccountPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type AccountMoreInfoProps = {
  // Account to display more information about (if any)
  account: AccountPlus | null;
  // Function to close the modal
  hide: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function AccountMoreInfo({ account, hide, show }: AccountMoreInfoProps) {

  if (!account) {
    return null; // If no account is provided, do not render the modal
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
        <Modal.Title>Account Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>

          <Row>

            <Col xs={12} md={5} className="me-3">
              <h5 className="bg-primary-subtle">Account Information 1</h5>
              <Table size="sm" bordered>
                <tbody>
                <tr>
                  <td>id</td>
                  <td>{account.id}</td>
                </tr>
                <tr>
                  <td>createTime</td>
                  <td>{account.createTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>domain</td>
                  <td>{account.domain || "n/a"}</td>
                </tr>
                <tr>
                  <td>lastUpdatedTime</td>
                  <td>{account.lastUpdatedTime?.toLocaleString() || "n/a"}</td>
                </tr>
                <tr>
                  <td>acctNum</td>
                  <td>{account.acctNum || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountSubType</td>
                  <td>{account.accountSubType || "n/a"}</td>
                </tr>
                <tr>
                  <td>accountType</td>
                  <td>{account.accountType || "n/a"}</td>
                </tr>
                <tr>
                  <td>active</td>
                  <td>{account.active ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>classification</td>
                  <td>{account.classification || "n/a"}</td>
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
                  <td>{account.currencyRefName || "n/a"}</td>
                </tr>
                <tr>
                  <td>currencyRefValue</td>
                  <td>{account.currencyRefValue || "n/a"}</td>
                </tr>
                <tr>
                  <td>currentBalance</td>
                  <td>{account.currentBalance || "n/a"}</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>{account.description || "n/a"}</td>
                </tr>
                <tr>
                  <td>fullyQualifiedName</td>
                  <td>{account.fullyQualifiedName || "n/a"}</td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>{account.name || "n/a"}</td>
                </tr>
                <tr>
                  <td>parentId</td>
                  <td>{account.parentId || "n/a"}</td>
                </tr>
                <tr>
                  <td>subAccount</td>
                  <td>{account.subAccount ? "Yes" : "No"}</td>
                </tr>
                </tbody>
              </Table>
            </Col>

          </Row>

          {account.parentAccount && (

            <Row className="mt-4">
              <h5 className="bg-primary-subtle">Parent Account</h5>
              <Table size="sm" bordered>

                <thead>
                <tr>
                  <th>id</th>
                  <th>acctNum</th>
                  <th>accountType</th>
                  <th>accountSubType</th>
                  <th>active</th>
                  <th>classification</th>
                  <th>fullyQualifiedName</th>
                  <th>name</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td>{account.parentAccount.id}</td>
                  <td>{account.parentAccount.acctNum || "n/a"}</td>
                  <td>{account.parentAccount.accountType || "n/a"}</td>
                  <td>{account.parentAccount.accountSubType || "n/a"}</td>
                  <td>{account.parentAccount.active ? "Yes" : "No"}</td>
                  <td>{account.parentAccount.classification || "n/a"}</td>
                  <td>{account.parentAccount.fullyQualifiedName || "n/a"}</td>
                  <td>{account.parentAccount.name || "n/a"}</td>
                </tr>
                </tbody>

              </Table>
            </Row>

          )}

          {account.childAccounts && account.childAccounts.length > 0 && (
            <Row className="mt-4">
              <h5 className="bg-primary-subtle">Child Accounts</h5>
              <Table size="sm" bordered>

                <thead>
                <tr>
                  <th>id</th>
                  <th>accountSubType</th>
                  <th>accountType</th>
                  <th>acctNum</th>
                  <th>active</th>
                  <th>classification</th>
                  <th>fullyQualifiedName</th>
                  <th>name</th>
                </tr>
                </thead>

                <tbody>
                {account.childAccounts.map((childAccount) => (
                  <tr key={childAccount.id}>
                    <td>{childAccount.id}</td>
                    <td>{childAccount.accountSubType || "n/a"}</td>
                    <td>{childAccount.accountType || "n/a"}</td>
                    <td>{childAccount.acctNum || "n/a"}</td>
                    <td>{childAccount.active !== null && childAccount.active !== undefined ? childAccount.active.toString() : "n/a"}</td>
                    <td>{childAccount.classification || "n/a"}</td>
                    <td>{childAccount.fullyQualifiedName || "n/a"}</td>
                    <td>{childAccount.name || "n/a"}</td>
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

"use client";

/**
 * Modal for exporting transactions to Excel spreadsheet.
 */

// External Imports ----------------------------------------------------------

import { utils, writeFileXLSX } from "@e965/xlsx";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { TransactionPlus } from "@/types/types";
import { trimEmptyRows } from "@repo/shared-utils";

// Public Objects ------------------------------------------------------------

export type TransactionsXslxExportProps = {
  // Transactions to export
  transactions: TransactionPlus[];
  // Function to close the modal
  hideAction: () => void;
  // Current "show" state of the modal
  show: boolean;
}

export function TransactionsXlsxExport({ transactions, hideAction, show }: TransactionsXslxExportProps) {

  const [filename, setFilename] = useState<string>("QBO-Transactions.xlsx");

  function exportXlsx() {

    // Pull out the columns we want, with user-friendly names for the header row.
    const rows: Row[] = transactions.map((transaction) => ({
      "GL Account": transaction.account?.acctNum || "",
      "GL Name": transaction.account?.name || "",
      "Date": transaction.date || "",
      "Document#": transaction.documentNumber || "",
      "Memo": transaction.memo || "",
      "Name": transaction.name || "",
      "Amount": transaction.amount ? Number(transaction.amount.toFixed(2)) : 0,
    }));

    // Build a worksheet from the rows, and set column widths for better readability.
    const worksheet = utils.json_to_sheet(rows);
    if (!worksheet["!cols"]) {
      worksheet["!cols"] = WIDTHS;
    }

//    alert("Before Trim(" + rows.length + "): " + JSON.stringify(worksheet));

    // Trim any trailing empty rows that some writers may add. Provide the number of data rows
    // we wrote so the helper can use header + dataRowCount as the expected range baseline.
    trimEmptyRows(worksheet, rows.length);

//    alert("After Trim (" + rows.length + "): " + JSON.stringify(worksheet));

    // json_to_sheet writes a header row at row 1, so data starts at row 2.
    const startRow = 2;

    // Make Memo (column E) and Name (column F) wrap text for long values.
    for (let i = 0; i < rows.length; i++) {
      const memoAddr = `E${startRow + i}`; // Memo column
      const nameAddr = `F${startRow + i}`; // Name column
      const memoCell = worksheet[memoAddr];
      const nameCell = worksheet[nameAddr];
      if (memoCell) {
        memoCell.s = memoCell.s || {};
        memoCell.s.alignment = {
          ...(memoCell.s.alignment || {}),
          wrapText: true,
        };
      }
      if (nameCell) {
        nameCell.s = nameCell.s || {};
        nameCell.s.alignment = {
          ...(nameCell.s.alignment || {}),
          wrapText: true,
        };
      }
    }

    // Ensure the Amount column always shows two decimal places.
    for (let i = 0; i < rows.length; i++) {
      const amountAddr = `G${startRow + i}`; // Amount column
      const cell = worksheet[amountAddr];
      if (cell && typeof cell.v === "number") {
        // Use a format that includes thousands separators and exactly two decimals
        cell.z = "#,##0.00";
      }
    }

//    alert("After Extra(" + rows.length + "): " + JSON.stringify(worksheet));

    // Add the worksheet to a new workbook and name the sheet "Transactions".
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Trigger the file download and close the modal.
    writeFileXLSX(workbook, filename, { compression: true });
    hideAction();

  }

  return (
    <Modal
      centered
      dialogClassName="modal-90w"
      onHide={hideAction}
      scrollable
      show={show}
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Export Transactions to Excel (XLSX)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
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
              <Button
                disabled={!filename}
                onClick={() => {exportXlsx()}}
                variant="primary"
              >
                Download XSLX
              </Button>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  )

}

// Private Objects -----------------------------------------------------------

type Row = {
  "GL Account": string,
  "GL Name": string,
  "Date": string,
  "Document#": string,
  "Memo": string,
  "Name": string,
  "Amount": number,
}

const WIDTHS = [
  { wch: 10 }, // GL Account
  { wch: 25 }, // GL Name
  { wch: 10 }, // Date
  { wch: 20 }, // Document#
  { wch: 30 }, // Memo
  { wch: 30 }, // Name
  { wch: 12 }, // Amount
];

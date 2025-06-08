"use client";

/**
 * Overview table for Transactions.
 */

// External Imports ----------------------------------------------------------

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { Timestamps } from "@repo/shared-utils/Timestamps";
import { TransactionPlus } from "@/types/types";
import { PaginationFooter } from "@/components/tables/PaginationFooter";
import {ArrowDownAZ, ArrowDownUp, ArrowUpAZ} from "lucide-react";

// Public Objects ------------------------------------------------------------

export type TransactionsTableProps = {
  // All Transactions to display in the table
  allTransactions: TransactionPlus[];
}

export function TransactionsTable({ allTransactions }: TransactionsTableProps) {
  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionPlus[]>(allTransactions);
  const [glAccountFilter, setGlAccountFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>(""); // YYYYMMDD
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "accounting_date", desc: false },
  ]);
  const [toDateFilter, setToDateFilter] = useState<string>(""); // YYYYMMDD
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    let matchingTransactions: TransactionPlus[] = allTransactions;

    if (cardNameFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const cardName = formatCardName(transaction);
        return cardName.toLowerCase().includes(cardNameFilter);
      });
    }

    if (fromDateFilter.length >= 8) {
      const fromDateCompare = fromDateFilter.substring(0, 8) + "-000000";
      matchingTransactions = matchingTransactions.filter(transaction => {
        const accountingDate = formatAccountingDate(transaction);
        if (accountingDate && (accountingDate !== "n/a")) {
          return accountingDate >= fromDateCompare;
        } else {
          return true;
        }
      });
    }

    if (glAccountFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const glAccount = formatGlAccount(transaction);
        return glAccount.toLowerCase().includes(glAccountFilter);
      });
    }

    if (merchantFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const merchantName = formatMerchantName(transaction);
        return merchantName.toLowerCase().includes(merchantFilter);
      });
    }

    if (toDateFilter.length >= 8) {
      const toDateCompare = toDateFilter.substring(0, 8) + "-235959";
      matchingTransactions = matchingTransactions.filter(transaction => {
        const accountingDate = formatAccountingDate(transaction);
        if (accountingDate && (accountingDate !== "n/a")) {
          return accountingDate <= toDateCompare;
        } else {
          return true;
        }
      });
    }

    if (userNameFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const userName = formatUserName(transaction);
        return userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredTransactions(matchingTransactions);

  }, [allTransactions, cardNameFilter, fromDateFilter, glAccountFilter, merchantFilter, toDateFilter, userNameFilter]);

  // Overall table instance
  const table = useReactTable({
    columns,
    data: filteredTransactions,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    onSortingChange: setSorting,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
  });
  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          Transactions Table
        </h1>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId={fromDateFilter}>
            <span>Filter by From Date:</span>
            <Form.Control
              type="text"
              placeholder="Enter YYYYMMDD"
              value={fromDateFilter}
              onChange={e => setFromDateFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={toDateFilter}>
            <span>Filter by To Date:</span>
            <Form.Control
              type="text"
              placeholder="Enter YYYYMMDD"
              value={toDateFilter}
              onChange={e => setToDateFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={userNameFilter}>
            <span>Filter by User Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={userNameFilter}
              onChange={e => setUserNameFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={cardNameFilter}>
            <span>Filter by Card Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={cardNameFilter}
              onChange={e => setCardNameFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={merchantFilter}>
            <span>Filter by Merchant Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={merchantFilter}
              onChange={e => setMerchantFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={glAccountFilter}>
            <span>Filter by GL Account or Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of GL account or name"
              value={glAccountFilter}
              onChange={e => setGlAccountFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
      </Row>

      <table className="table table-bordered table-striped">

        <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                { header.column.getCanSort() ? (
                    <>
                    <span
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: "pointer" }}
                    >
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUpAZ className="ms-2 text-info" size={24}/>
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDownAZ className="ms-2 text-info" size={24}/>
                      ) : (
                        <ArrowDownUp className="ms-2 text-info" size={24}/>
                      )}
                    </span>
                    </>
                  ) :
                  null
                }
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        </tbody>

        <tfoot>
        <tr>
          <th colSpan={table.getCenterLeafColumns().length}>
            <PaginationFooter table={table}/>
          </th>
        </tr>
        </tfoot>

      </table>

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

/**
 * Column definitions for the table.
 */
const columnHelper = createColumnHelper<TransactionPlus>();
const columns = [
  columnHelper.accessor(row => formatAccountingDate(row), {
    cell: info => {
      return <span>{formatAccountingDate(info.row.original)}</span>
    },
    enableSorting: true,
    header: () => <span>Accounting Date-Time</span>,
    id: "accounting_date",
  }),
  columnHelper.accessor(row => formatUserName(row), {
    cell: info => {
      return <span>{formatUserName(info.row.original)}</span>
    },
    enableSorting: true,
    header: () => <span>User Name</span>,
    id: "user_name",
  }),
  columnHelper.accessor(row => formatCardName(row), {
    cell: info => {
      return <span>{formatCardName(info.row.original)}</span>;
    },
    enableSorting: true,
    header: () => <span>Card Name</span>,
    id: "card_name",
  }),
  columnHelper.display({
    cell: info => {
      const amount =
        formatAmount(info.row.original.original_transaction_amount_amt,
          info.row.original.original_transaction_amount_cc);
      return <span>{amount}</span>;
    },
    header: () => <span>Original Amount</span>,
    id: "original_amount",
  }),
  columnHelper.display({
    cell: info => {
      const amount =
        formatAmount(info.row.original.amount_amt, info.row.original.amount_cc)
      return <span>{amount}</span>;
    },
    header: () => <span>Settled Amount</span>,
    id: "settled_amount",
  }),
  columnHelper.accessor(row => formatMerchantName(row), {
    cell: info => {
      return <span>{formatMerchantName(info.row.original)}</span>;
    },
    enableSorting: true,
    header: () => <span>Merchant</span>,
    id: "merchant_name",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{formatGlAccount(info.row.original)}</span>;
    },
    header: () => <span>GL Account</span>,
    id: "gl_account",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{info.row.original.state}</span>;
    },
    header: () => <span>State</span>,
    id: "state",
  }),
];

/**
 * Format the accounting date for a transaction.
 */
function formatAccountingDate(transaction: TransactionPlus): string {
  if (transaction.accounting_date) {
    const accountingDate = new Date(transaction.accounting_date!);
    return Timestamps.local(accountingDate);
  } else {
    return "n/a";
  }
}

/**
 * Format an amount as a string with a currency and two decimal places.
 */
function formatAmount(amt: number | null | undefined, cc: string | null | undefined): string {
  let formatted = cc ? `${cc} ` : "";
  if (amt) {
    formatted += `${(amt/100).toFixed(2)}`;
  } else {
    formatted += "n/a";
  }
  return formatted;
}

/**
 * Format the card name for a transaction.
 */
function formatCardName(transaction: TransactionPlus): string {
  return transaction.card ? transaction.card.display_name : "n/a";
}

/**
 * Format the GL Account Number and Name for a transaction.
 */
function formatGlAccount(transaction: TransactionPlus): string {
  // IMPLEMENTATION NOTES:
  //   * This assumes that the first accounting field selection is always the GL_ACCOUNT type.
  //   * It assumes that no other line items will be paid attention to.
  //   * With our current Ramp setup, the data matches these assumptions.
  const tliafs = transaction.line_item_accounting_field_selections;
  if (tliafs && (tliafs.length > 0) && (tliafs[0].category_info_type === "GL_ACCOUNT")) {
    return `${tliafs[0].external_code} - ${tliafs[0].name}`;
  } else {
    return "n/a";
  }
}

/**
 * Format the merchant name for a transaction.
 */
function formatMerchantName(transaction: TransactionPlus): string {
  return transaction.merchant_name || "n/a";
}

/**
 * Format the user name for a transaction.
 */
function formatUserName(transaction: TransactionPlus): string {
  if (transaction.card_holder_user) {
    return `${transaction.card_holder_user.last_name}, ${transaction.card_holder_user.first_name}`;
  } else {
    return "n/a";
  }
}

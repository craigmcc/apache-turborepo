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
  PaginationState,
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

// Public Objects ------------------------------------------------------------

export type TransactionsTableProps = {
  // All Transactions to display in the table
  allTransactions: TransactionPlus[];
}

export function TransactionsTable({ allTransactions }: TransactionsTableProps) {
  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionPlus[]>(allTransactions);
  const [fromDateFilter, setFromDateFilter] = useState<string>(""); // YYYYMMDD
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [toDateFilter, setToDateFilter] = useState<string>(""); // YYYYMMDD
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  useEffect(() => {

    let matchingTransactions: TransactionPlus[] = allTransactions;

    if (cardNameFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const cardName = transaction.card
          ? transaction.card.display_name
          : "Unknown Card";
        cardName.toLowerCase().includes(cardNameFilter);
      });
    }

    if (fromDateFilter.length >= 8) {
      const fromDateCompare = fromDateFilter.substring(0, 8) + "-000000";
      matchingTransactions = matchingTransactions.filter(transaction => {
        if (transaction.accounting_date) {
          const accountingDate = new Date(transaction.accounting_date!);
          const accountingLocal = Timestamps.local(accountingDate);
          return accountingLocal >= fromDateCompare;
        } else {
          return true;
        }
      });
    }

    if (toDateFilter.length >= 8) {
      const toDateCompare = toDateFilter.substring(0, 8) + "-235959";
      matchingTransactions = matchingTransactions.filter(transaction => {
        if (transaction.accounting_date) {
          const accountingDate = new Date(transaction.accounting_date!);
          const accountingLocal = Timestamps.local(accountingDate);
          return accountingLocal <= toDateCompare;
        } else {
          return true;
        }
      });
    }

    if (userNameFilter.length > 0) {
      matchingTransactions = matchingTransactions.filter(transaction => {
        const userName = transaction.card_holder_user
          ? `${transaction.card_holder_user.last_name}, ${transaction.card_holder_user.first_name}`
          : "Person, Unknown";
        userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredTransactions(matchingTransactions);

  }, [allTransactions, cardNameFilter, fromDateFilter, toDateFilter, userNameFilter]);

  // Column definitions
  const columnHelper = createColumnHelper<TransactionPlus>();
  const columns = [
    columnHelper.display({
      cell: info => {
        if (info.row.original.accounting_date) {
          const accountingDate = new Date(info.row.original.accounting_date!);
          const accountingLocal = Timestamps.local(accountingDate);
          return <span>{accountingLocal}</span>;
        } else {
          return <span>Unknown</span>;
        }
      },
      header: () => <span>Accounting Date</span>,
      id: "accounting_date",
    }),
    columnHelper.display({
      cell: info => {
        const userName = info.row.original.card_holder_user
          ? `${info.row.original.card_holder_user.last_name}, ${info.row.original.card_holder_user.first_name}`
          : "Person, Unknown";
        return <span>{userName}</span>;
      },
      header: () => <span>User Name</span>,
      id: "user_name",
    }),
    columnHelper.display({
      cell: info => {
        const cardName = info.row.original.card
          ? `${info.row.original.card.display_name}`
          : "Person, Unknown";
        return <span>{cardName}</span>;
      },
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
        const amount = formatAmount(info.row.original.amount_amt, info.row.original.amount_cc);
        return <span>{amount}</span>;
      },
      header: () => <span>Settled Amount</span>,
      id: "settled_amount",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.state}</span>;
      },
      header: () => <span>State</span>,
      id: "state",
    }),
  ];

  // Overall table instance
  const table = useReactTable({
    columns,
    data: filteredTransactions,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
    state: {
      pagination,
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
            <span>Filter by From Date</span>
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
            <span>Filter by To Date</span>
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
            <span>Filter by User Name</span>
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
            <span>Filter by Card Name</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={cardNameFilter}
              onChange={e => setCardNameFilter(e.target.value.toLowerCase())}
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
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr
            //            className={selectedUser?.id === row.original.id ? "table-primary" : ""}
            key={row.id}
          >
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
                //                onClick={() => handleSelectUser(cell.id, row.original)}
              >
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
 * Format an amount as a string with a currency and two decimal places.
 */
function formatAmount(amt: number | null | undefined, cc: string | null | undefined): string {
  let formatted = cc ? `${cc} ` : "";
  if (amt) {
    formatted += `${(amt/100).toFixed(2)}`;
  }
  return formatted;
}


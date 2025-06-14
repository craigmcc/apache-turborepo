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
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ, BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { PaginationFooter } from "@/components/tables/PaginationFooter";
import { TransactionMoreInfo } from "@/components/transactions/TransactionMoreInfo";
import {
  formatAccountingDate,
  formatAmount,
  formatCardName,
  formatGlAccount,
  formatMerchantName,
  formatUserName
} from "@/lib/Formatters";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionsTableProps = {
  // All Transactions to display in the table
  allTransactions: TransactionPlus[];
}

export function TransactionsTable({ allTransactions }: TransactionsTableProps) {

  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPlus>(placeholderTransaction);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionPlus[]>(allTransactions);
  const [glAccountFilter, setGlAccountFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>(""); // YYYYMMDD
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
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
        const cardName = formatCardName(transaction.card);
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
        const userName = formatUserName(transaction.card_holder_user);
        return userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredTransactions(matchingTransactions);

  }, [allTransactions, cardNameFilter, fromDateFilter, glAccountFilter, merchantFilter, toDateFilter, userNameFilter]);

  // Handle the "More Info" modal close
  function handleMoreInfoClose() {
    setCurrentTransaction(placeholderTransaction);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(transaction: TransactionPlus) {
    setCurrentTransaction(transaction);
    setShowMoreInfo(true);
  }

  // Column definitions for the Transactions table
  const columns = useMemo(() => [
    columnHelper.accessor(row => formatAccountingDate(row), {
      cell: info => {
        return <span>{formatAccountingDate(info.row.original)}</span>
      },
      enableSorting: true,
      header: () => <span>Accounting Date-Time</span>,
      id: "accounting_date",
    }),
    columnHelper.accessor(row => formatUserName(row.card_holder_user), {
      cell: info => {
        return <span>{formatUserName(info.row.original.card_holder_user)}</span>
      },
      enableSorting: true,
      header: () => <span>User Name</span>,
      id: "user_name",
    }),
    columnHelper.accessor(row => formatCardName(row.card), {
      cell: info => {
        return <span>{formatCardName(info.row.original.card)}</span>;
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
    columnHelper.display({
      cell: info => {
        return (
          <span>
          <BookUp
            onClick={() => handleMoreInfoOpen(info.row.original)}
            style={{ cursor: "context-menu" }}
          />
        </span>
        );
      },
      header: "Info",
      id: "moreInfo",
    }),
  ], []);

  // Overall table instance
  const table = useReactTable({
    columns,
    data: filteredTransactions,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
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
              onChange={e => setFromDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={fromDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={toDateFilter}>
            <span>Filter by To Date:</span>
            <Form.Control
              onChange={e => setToDateFilter(e.target.value.toLowerCase())}
              placeholder="Enter YYYYMMDD"
              type="text"
              value={toDateFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={userNameFilter}>
            <span>Filter by User Name:</span>
            <Form.Control
              onChange={e => setUserNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={userNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={cardNameFilter}>
            <span>Filter by Card Name:</span>
            <Form.Control
              onChange={e => setCardNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={cardNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={merchantFilter}>
            <span>Filter by Merchant Name:</span>
            <Form.Control
              onChange={e => setMerchantFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={merchantFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={glAccountFilter}>
            <span>Filter by GL Account or Name:</span>
            <Form.Control
              onChange={e => setGlAccountFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of GL account or name"
              type="text"
              value={glAccountFilter}
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

      <TransactionMoreInfo
        hide={handleMoreInfoClose}
        show={showMoreInfo}
        transaction={currentTransaction}/>

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Transactions table.
 */
const columnHelper = createColumnHelper<TransactionPlus>();

/**
 * Placeholder for the TransactionMoreInfo modal.
 * This is used to ensure the component always has a valid transaction to display.
 */

const placeholderTransaction: TransactionPlus = {
  // Scalar fields
  id: "",
  accounting_date: null,
  amount_amt: null,
  amount_cc: null,
  card_present: null,
  memo: null,
  merchant_category_code: null,
  merchant_category_description: null,
  merchant_name: null,
  original_transaction_amount_amt: null,
  original_transaction_amount_cc: null,
  settlement_date: null,
  sk_category_id: null,
  sk_category_name: null,
  state: null,
  sync_status: "SYNCED",
  synced_at: null,
  trip_name: null,
  user_transaction_time: null,
  // Potential relationships
  entity_id: null,
  limit_id: null,
  merchant_id: null,
  spend_program_id: null,
  statement_id: null,
  trip_id: null,
  // Actual relationships
  accounting_field_selections: [],
  card_holder_user_id: null,
  card_holder_user: null,
  card_id: null,
  card: null,
  line_items: [],
  line_item_accounting_field_selections: [],
}

"use client";

/**
 * Overview table for Transactions.
 */

// External Imports ----------------------------------------------------------

import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { DataTable } from "@/components/tables/DataTable";
import { TransactionMoreInfo } from "@/components/transactions/TransactionMoreInfo";
import { TransactionsCsvExport } from "@/components/transactions/TransactionsCsvExport";
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPlus | null>(null);
  const [glAccountFilter, setGlAccountFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>(""); // YYYYMMDD
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "accounting_date", desc: false },
  ]);
  const [toDateFilter, setToDateFilter] = useState<string>(""); // YYYYMMDD
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (cardNameFilter.length > 0) {
      filters.push({
        id: "card_name",
        value: cardNameFilter,
      });
    }

    if (fromDateFilter.length >= 8) {
      filters.push({
        id: "accounting_date",
        value: { operator: ">=", value: fromDateFilter.substring(0, 8) + "-000000" },
      });
    }

    if (glAccountFilter.length > 0) {
      filters.push({
        id: "gl_account",
        value: glAccountFilter,
      });
    }

    if (merchantFilter.length > 0) {
      filters.push({
        id: "merchant_name",
        value: merchantFilter,
      });
    }

    if (toDateFilter.length >= 8) {
      filters.push({
        id: "accounting_date",
        value: { operator: "<=", value: toDateFilter.substring(0, 8) + "-235959" },
      });
    }

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user_name",
        value: userNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [cardNameFilter, fromDateFilter, glAccountFilter, merchantFilter, toDateFilter, userNameFilter]);

  // Handle the "CSV Export" modal close
  function handleCsvExportClose() {
    setShowCsvExport(false);
  }

  // Handle the "CSV Export" modal open
  function handleCsvExportOpen() {
    setShowCsvExport(true);
  }

  // Handle the "More Info" modal close
  function handleMoreInfoClose() {
    setCurrentTransaction(null);
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
    data: allTransactions,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      pagination,
      sorting,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          <span className="me-5">Transactions Table</span>
          <Button
            className="bg-info"
            onClick={handleCsvExportOpen}
            size="lg"
          >
            Export CSV
          </Button>
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

      <DataTable
        showPagination={true}
        table={table}
      />

      <TransactionsCsvExport
        hide={handleCsvExportClose}
        show={showCsvExport}
        transactions={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

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

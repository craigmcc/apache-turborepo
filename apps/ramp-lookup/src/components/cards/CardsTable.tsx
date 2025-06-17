"use client";

/**
 * Overview table for Cards.
 */

// External Imports ----------------------------------------------------------

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {  BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { CardMoreInfo } from "@/components/cards/CardMoreInfo";
import { CardsCsvExport } from "@/components/cards/CardsCsvExport";
import { DataTable } from "@/components/tables/DataTable";
import {
  formatCardInterval,
  formatCardName,
  formatCardState,
  formatDepartmentName,
  formatUserName
} from "@/lib/Formatters";
import {CardPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CardsTableProps = {
  // All cards to display in the table
  allCards: CardPlus[];
}

export function CardsTable({ allCards }: CardsTableProps) {

  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentCard, setCurrentCard] = useState<CardPlus | null>(null);
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "user_name", desc: false },
  ]);
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Trigger filter changes when a filter value is updated
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (cardNameFilter.length > 0) {
      filters.push({
        id: "card_name",
        value: cardNameFilter,
      });
    }

    if (departmentNameFilter.length > 0) {
      filters.push({
        id: "department_name",
        value: departmentNameFilter,
      });
    }

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user_name",
        value: userNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [cardNameFilter, departmentNameFilter, userNameFilter]);

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
    setCurrentCard(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(card: CardPlus) {
    setCurrentCard(card);
    setShowMoreInfo(true);
  }

  // Column definitions for the Cards table
  const columns : ColumnDef<CardPlus>[] = useMemo(() => [
    {
      accessorFn: row => formatDepartmentName(row.cardholder?.department),
      cell: ({ row }) => {
        return <span>{formatDepartmentName(row.original.cardholder?.department)}</span>;
      },
      enableMultiSort: true,
      enableSorting: true,
      header: "Department Name",
      id: "department_name",
    },
    {
      accessorFn: row => formatUserName(row.cardholder),
      cell: ({ row }) => {
        return <span>{formatUserName(row.original.cardholder)}</span>;
      },
      enableMultiSort: true,
      enableSorting: true,
      header: "User Name",
      id: "user_name",
    },
    {
      accessorFn: row => formatCardName(row),
      cell: ({ row }) => {
        return <span>{formatCardName(row.original)}</span>;
      },
      enableMultiSort: true,
      enableSorting: true,
      header: "Card Name",
      id: "card_name",
    },
    {
      cell: ({ row }) => {
        return <span>{row.original.is_physical ? "Yes" : "No"}</span>;
      },
      header: "Physical?",
      id: "is_physical",
    },
    {
      accessorFn: row => row.state,
      cell: ({ row }) => {
        const state = row.original.state;
        if (!state) {
          return <span className="text-danger">n/a</span>;
        } else if (state === "ACTIVE") {
          return <span className="text-success">{formatCardState(row.original)}</span>;
        } else if (state === "CHIP_LOCKED") {
          return <span className="text-warning">{formatCardState(row.original)}</span>;
        } else if (state === "SUSPENDED") {
          return <span className="text-warning">{formatCardState(row.original)}</span>;
        } else if (state === "TERMINATED") {
          return <span className="text-danger">{formatCardState(row.original)}</span>;
        } else if (state === "UNACTIVATED") {
          return <span className="text-warning">{formatCardState(row.original)}</span>;
        }
      },
      header: "State",
      id: "state",
    },
    {
      cell: ({ row }) => {
        return <span>{formatAmountFunky(row.original.spending_restrictions?.amount)}</span>;
      },
      header: "Interval Limit",
      id: "amount",
    },
    {
      cell: ({ row }) => {
        return <span>{formatCardInterval(row.original)}</span>;
      },
      header: "Interval",
      id: "interval",
    },
    {
      cell: ({ row }) => {
        return <span>{formatAmountFunky(row.original.spending_restrictions?.transaction_amount_limit)}</span>;
      },
      header: "Transaction Limit",
      id: "transaction_amount_limit",
    },
    {
      cell: ({ row }) => {
        const suspended = row.original.spending_restrictions?.suspended;
        if (suspended) {
          return <span className="text-danger">Yes</span>;
        } else {
          return <span className="text-success">No</span>;
        }
      },
      header: "Suspended?",
      id: "suspended",
    },
    {
      cell: ({ row }) => {
        return (
          <span>
            <BookUp
              onClick={() => handleMoreInfoOpen(row.original)}
              style={{ cursor: "context-menu" }}
            />
          </span>
        );
      },
      header: "Info",
      id: "moreInfo",
    }
  ], []);

  // Overall table instance
  const table = useReactTable<CardPlus>({
    columns,
    data: allCards,
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
          <span className="me-5">Cards Table</span>
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
          <Form.Group controlId={departmentNameFilter}>
            <span>Filter by Department Name:</span>
            <Form.Control
              onChange={e => setDepartmentNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={departmentNameFilter}
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
      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <CardsCsvExport
        cards={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <CardMoreInfo
        card={currentCard}
        hide={handleMoreInfoClose}
        show={showMoreInfo}
      />

    </Container>
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

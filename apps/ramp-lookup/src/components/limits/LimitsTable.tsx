"use client";

/**
 * Overview table for Limits.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
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

import { LimitMoreInfo } from "@/components/limits/LimitMoreInfo";
import { LimitsCsvExport } from "@/components/limits/LimitsCsvExport";
import { formatAmount, formatLimitName } from "@/lib/Formatters";
import { LimitPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type LimitsTableProps = {
  // All limits to display in the table
  allLimits: LimitPlus[];
};

export function LimitsTable({ allLimits }: LimitsTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentLimit, setCurrentLimit] = useState<LimitPlus | null>(null);
  const [limitNameFilter, setLimitNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "limit_name", desc: false },
  ]);

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (limitNameFilter.length > 0) {
      filters.push({
        id: "limit_name",
        value: limitNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [limitNameFilter]);

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
//    console.log("Closing More Info modal for limit:", formatLimitName(currentLimit));
    setCurrentLimit(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(limit: LimitPlus) {
//    console.log("Showing More Info for limit:", formatLimitName(limit));
    setCurrentLimit(limit);
    setShowMoreInfo(true);
  }

  // Column definitions for the Limits table
  const columns = useMemo(() =>   [
    columnHelper.accessor(row => formatLimitName(row), {
      header: "Limit Name",
      id: "limit_name",
    }),
    columnHelper.display({
      cell: info => {
        const state = info.row.original.state;
        if (state === "ACTIVE") {
          return <span className="text-success">Active</span>;
        } else if (state === "SUSPENDED") {
          return <span className="text-warning">Suspended</span>;
        } else if (state === "TERMINATED") {
          return <span className="text-danger">Terminated</span>;
        } else {
          return <span>Unknown</span>;
        }
      },
      header: "State",
      id: "state",
    }),
    columnHelper.display({
      cell: info => {
        const is_shareable = info.row.original.is_shareable;
        if (is_shareable) {
          return <span className="text-success">Yes</span>;
        } else if (!is_shareable) {
          return <span className="text-info">No</span>;
        } else {
          return <span>Unknown</span>;
        }
      },
      header: "Shareable",
      id: "shareable",
    }),
    columnHelper.display({
      cell: info => {
        const balance_total = formatAmount(info.row.original.balance_total_amt, info.row.original.balance_total_cc);
        return <span>{balance_total}</span>
      },
      header: "Total Balance",
      id: "balance_total",
    }),
    columnHelper.display({
      cell: info => info.row.original.cards?.length || 0,
      header: "#Cards",
      id: "cardsCount",
    }),
    columnHelper.display({
      cell: info => info.row.original.users?.length || 0,
      header: "#Users",
      id: "usersCount",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatAmount(info.row.original.spending_restrictions?.limit_amt, info.row.original.spending_restrictions?.limit_cc)}</span>;
      },
      header: "Interval Limit",
      id: "amount",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.spending_restrictions?.interval}</span>;
      },
      header: "Interval",
      id: "interval",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatAmount(info.row.original.spending_restrictions?.transaction_amount_limit_amt, info.row.original.spending_restrictions?.transaction_amount_limit_cc)}</span>;
      },
      header: "Transaction Limit",
      id: "transaction_amount_limit",
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

  // Create the table instance
  const table = useReactTable({
    columns,
    data: allLimits,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
          <span className="me-5">Limits Table</span>
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
        <Col className="text-center">
          <Form.Group controlId={limitNameFilter}>
            <span>Filter by Limit Name:</span>
            <Form.Control
              onChange={e => setLimitNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={limitNameFilter}
            />
          </Form.Group>
          <TextFieldFilter
            controlId="limitNameFilter"
            label="Filter by Limit Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setLimitNameFilter}
            textFieldFilter={limitNameFilter}
          />
        </Col>
      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <LimitsCsvExport
        hide={handleCsvExportClose}
        limits={table.getSortedRowModel().flatRows.map(row => row.original)}
        show={showCsvExport}
      />

      <LimitMoreInfo
        hide={handleMoreInfoClose}
        limit={currentLimit}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Limits table.
 */
const columnHelper = createColumnHelper<LimitPlus>();

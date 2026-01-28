"use client";

/**
 * Overview table for JournalEntries.
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
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { JournalEntryPlus } from "@/types/types";
import { JournalEntriesCsvExport } from "@/components/journalEntries/JournalEntriesCsvExport";
import { JournalEntryMoreInfo } from "@/components/journalEntries/JournalEntryMoreInfo";
import { formatBoolean, formatString }  from "@/lib/Formatters";

// Public Objects ------------------------------------------------------------

export type JournalEntriesTableProps = {
  // All JournalEntries to display in the table
  allJournalEntries: JournalEntryPlus[];
};

export function JournalEntriesTable({ allJournalEntries }: JournalEntriesTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState<JournalEntryPlus | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    {id: "txnDate", desc: false},
  ]);
  const [txnDateFilter, setTxnDateFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (txnDateFilter.length > 0) {
      filters.push({
        id: "txnDate",
        value: txnDateFilter,
      });
    }

    setColumnFilters(filters);

  }, [txnDateFilter]);

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
    setCurrentJournalEntry(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(journalEntry: JournalEntryPlus) {
    setCurrentJournalEntry(journalEntry);
    setShowMoreInfo(true);
  }

  // Column definitions for the JournalEntries table
  const columns = useMemo(() => [

    columnHelper.accessor(row => row.createTime?.toLocaleDateString() || "n/a", {
      header: "Create Time",
      id: "createTime",
    }),

    columnHelper.accessor(row => row.lastUpdatedTime?.toLocaleDateString() || "n/a", {
      header: "Last Updated Time",
      id: "lastUpdatedTime",
    }),

    columnHelper.accessor(row => formatString(row.privateNote, 40), {
      header: "Private Note",
      id: "privateNote",
    }),

    columnHelper.accessor(row => row.txnDate || "n/a", {
      header: "Transaction Date",
      id: "txnDate",
    }),

    columnHelper.accessor(row => formatBoolean(row.adjustment), {
      header: "Adjustment",
      id: "accountSubType",
    }),

    columnHelper.display({
      header: "#Lines",
      cell: info => {
        return info.row.original.lines?.length || 0;
      },
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

  const table = useReactTable({
    data: allJournalEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <span className="me-5">JournalEntries Table</span>
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
          <TextFieldFilter
            controlId="txnDateFilter"
            label="Filter by Transaction Date:"
            placeholder="YYYY-MM-DD"
            setTextFieldFilter={setTxnDateFilter}
            textFieldFilter={txnDateFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <JournalEntriesCsvExport
        journalEntries={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <JournalEntryMoreInfo
        hide={handleMoreInfoClose}
        journalEntry={currentJournalEntry}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

const columnHelper = createColumnHelper<JournalEntryPlus>();

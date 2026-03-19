"use client";

/**
 * Overview table for Customers.
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
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { CustomerPlus } from "@/types/types";
import Button from "react-bootstrap/Button";
import { CustomersCsvExport } from "@/components/customers/CustomersCsvExport";
import { CustomerMoreInfo } from "@/components/customers/CustomerMoreInfo";

// Public Objects ------------------------------------------------------------

export type CustomersTableProps = {
  // All Customers to display in the table
  allCustomers: CustomerPlus[];
};

export function CustomersTable({ allCustomers }: CustomersTableProps) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerPlus | null>(null);
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    {id: "name", desc: false},
  ]);

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (emailFilter.length > 0) {
      filters.push({
        id: "email",
        value: emailFilter,
      });
    }

    if (nameFilter.length > 0) {
      filters.push({
        id: "name",
        value: nameFilter,
      });
    }

    setColumnFilters(filters);

  }, [emailFilter, nameFilter]);

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
    setCurrentCustomer(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(account: CustomerPlus) {
    setCurrentCustomer(account);
    setShowMoreInfo(true);
  }

  // Column definitions for the Customers table
  const columns = useMemo(() => [

    columnHelper.accessor(row => row.name, {
      header: "Customer Name",
      id: "name",
    }),

    columnHelper.accessor(row => row.email, {
      header: "Customer Email",
      id: "email",
    }),

    columnHelper.display({
      cell: info => {
        const active = info.row.original.active;
        if (active) {
          return <span className="text-success">Yes</span>;
        } else {
          return <span className="text-warning">No</span>;
        }
      },
      header: "Active",
      id: "active",
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
    data: allCustomers,
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
          <span className="me-5">Customers Table</span>
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
            controlId="nameFilter"
            label="Filter by Customer Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setNameFilter}
            textFieldFilter={nameFilter}
          />
        </Col>

        <Col>
          <TextFieldFilter
            controlId="nameFilter"
            label="Filter by Customer Email:"
            placeholder="Enter part of email"
            setTextFieldFilter={setEmailFilter}
            textFieldFilter={emailFilter}
          />
        </Col>

      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <CustomersCsvExport
        customers={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <CustomerMoreInfo
        customer={currentCustomer}
        hide={handleMoreInfoClose}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

const columnHelper = createColumnHelper<CustomerPlus>();

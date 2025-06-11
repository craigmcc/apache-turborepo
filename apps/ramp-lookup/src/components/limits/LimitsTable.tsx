"use client";

/**
 * Overview table for Limits.
 */

// External Imports ----------------------------------------------------------

import {
//  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { PaginationFooter } from "@/components/tables/PaginationFooter";
import { formatAmount, formatLimitName } from "@/lib/Formatters";
import { LimitPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type LimitsTableProps = {
  // All limits to display in the table
  allLimits: LimitPlus[];
};

export function LimitsTable({ allLimits }: LimitsTableProps) {

  const [filteredLimits, setFilteredLimits] = useState<LimitPlus[]>(allLimits);
  const [limitNameFilter, setLimitNameFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "limit_name", desc: false },
  ]);

  // Apply selection filters whenever they change
    useEffect(() => {

      let matchingLimits: LimitPlus[] = allLimits;

      if (limitNameFilter.length > 0) {
        matchingLimits = matchingLimits.filter(limit => {
          const limitName = formatLimitName(limit);
          return limitName.toLowerCase().includes(limitNameFilter);
        });
      }

      setFilteredLimits(matchingLimits);

    }, [allLimits, filteredLimits, limitNameFilter]);

  // Column definitions for the Limits table
  const columns = useMemo(() =>   [
    columnHelper.accessor(row => formatLimitName(row), {
      cell: info => {
        return <span>{formatLimitName(info.row.original)}</span>
      },
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
  ], []);

  // Create the table instance
  const table = useReactTable({
    columns,
    data: filteredLimits,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          Limits Table
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
 * Helper for creating columns in the Limits table.
 */
const columnHelper = createColumnHelper<LimitPlus>();

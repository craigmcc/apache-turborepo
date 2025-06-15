"use client";

/**
 * Generic data table component, using TanStack Table.
 */

// External Modules ----------------------------------------------------------

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react";
import React, { useState } from "react";

// Internal Modules ----------------------------------------------------------

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";

// Public Objects ------------------------------------------------------------

interface DataTableProps<TData, TValue> {
  // Columns to display
  columns: ColumnDef<TData, TValue>[];
  // Data to display
  data: TData[];
  // Initial pagination state (if not present, no pagination)
  paginationState?: PaginationState;
  // Initial sorting state (if not present, no sorting)
  sortingState?: SortingState;
}

export function DataTable<TData, TValue>({
                                           columns,
                                           data,
                                           paginationState,
                                           sortingState,
                                         }: DataTableProps<TData, TValue>) {

  const [pagination, setPagination] = useState<PaginationState>(
    paginationState ? paginationState :
      {
        pageIndex: 0,
        pageSize: 10,
      });
  const [sorting, setSorting] = useState<SortingState>(
    sortingState ? sortingState : []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: paginationState ? setPagination : undefined,
    onSortingChange: setSorting,
    state: {
      pagination: paginationState ? pagination : undefined,
      sorting,
    },
  });
  const pageCount = table.getPageCount();

  return (
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

      { paginationState ? (
        <tfoot>
        <tr>
          <th colSpan={table.getCenterLeafColumns().length}>
            <div className="text-center">
              <OverlayTrigger overlay={<Tooltip>First Page</Tooltip>} placement="top">
                <Button
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.firstPage()}
                  variant="info"
                >
                  {'<<'}
                </Button>
              </OverlayTrigger>
              <span>&nbsp;</span>
              <OverlayTrigger overlay={<Tooltip>Previous Page</Tooltip>} placement="top">
                <Button
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  variant="info"
                >
                  {'<'}
                </Button>
              </OverlayTrigger>
              <span>&nbsp;</span>
              <OverlayTrigger overlay={<Tooltip>Next Page</Tooltip>} placement="top">
                <Button
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  variant="info"
                >
                  {'>'}
                </Button>
              </OverlayTrigger>
              <span>&nbsp;</span>
              <OverlayTrigger overlay={<Tooltip>Last Page</Tooltip>} placement="top">
                <Button
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.lastPage()}
                  variant="info"
                >
                  {'>>'}
                </Button>
              </OverlayTrigger>
              <span className="p-1">
        Page {table.getState().pagination.pageIndex + 1} of{" "}{pageCount > 0 ? pageCount : `1`}
                {" "}| Total of {table.getRowCount().toLocaleString()} Rows
      </span>
            </div>
          </th>
        </tr>
        </tfoot>
      ) : null }

    </table>

  );

}

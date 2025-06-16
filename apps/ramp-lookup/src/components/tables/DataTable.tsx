"use client";

/**
 * Generic data table rendering component, using TanStack Table.
 */

// External Modules ----------------------------------------------------------

import {
  flexRender,
  Table,
} from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react";

// Internal Modules ----------------------------------------------------------

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";

// Public Objects ------------------------------------------------------------

interface DataTableProps<TData> {
  // Show pagination controls
  showPagination?: boolean;
  // The Tanstack Table we are displaying
  table: Table<TData>,
}

export function DataTable<TData>({ showPagination, table }: DataTableProps<TData>) {

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

      { showPagination ? (
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
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {pageCount > 0 ? pageCount : `1`}{" "}| Total of{" "}
                {table.getRowCount().toLocaleString()} Rows
              </span>
            </div>
          </th>
        </tr>
        </tfoot>
      ) : null }

    </table>

  );

}

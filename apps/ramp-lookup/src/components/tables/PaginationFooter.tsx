/**
 * Shared table footer for pagination in TanStack tables.
 */

// External Modules ----------------------------------------------------------

import { Table } from "@tanstack/react-table";
import React from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

type PaginationFooterProps<TData> = {
  table: Table<TData>,
}

export function PaginationFooter({ table }: PaginationFooterProps<any>) {

  const pageCount = table.getPageCount();

  return (
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
      <OverlayTrigger overlay={<Tooltip>Previosu Page</Tooltip>} placement="top">
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
  );

}

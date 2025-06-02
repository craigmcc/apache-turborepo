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
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { /*useEffect,*/ useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { LimitPlus } from "@/types/types";
import { PaginationFooter } from "@/components/tables/PaginationFooter";

// Public Objects ------------------------------------------------------------

export type LimitsTableProps = {
  // All limits to display in the table
  allLimits: LimitPlus[];
};

export function LimitsTable({ allLimits }: LimitsTableProps) {

//  const [filteredLimits, setFilteredLimits] = useState<LimitPlus[]>(allLimits);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Whenever the limits change, update the filtered list
  /*
    useEffect(() => {
      setFilteredLimits(allLimits);
    }, [allLimits]);
  */

  /**
   * Format an amount as a string with a currency and two decimal places.
   */
  function formatAmount(amt: number | null | undefined, cc: string | null | undefined): string {
    let formatted = cc ? `${cc} ` : "";
    if (amt) {
      formatted += `${(amt/100).toFixed(2)}`;
    }
    return formatted;
  }

  // Create column helper for defining table columns
  const columnHelper = createColumnHelper<LimitPlus>();

  // Define the table columns
  const columns = [
    columnHelper.display({
      cell: info => {
        const display_name = info.row.original.display_name;
        return <span>{display_name}</span>
      },
      header: "Display Name",
      id: "display_name",
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
      id: "state",
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
        const amt = info.row.original.spending_restrictions?.limit_amt;
        const cc = info.row.original.spending_restrictions?.limit_cc;
        return <span>{formatAmount(amt,cc)}</span>;
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
        const amt = info.row.original.spending_restrictions?.transaction_amount_limit_amt;
        const cc = info.row.original.spending_restrictions?.transaction_amount_limit_cc;
        return <span>{formatAmount(amt,cc)}</span>;
      },
      header: "Transaction Limit",
      id: "transaction_amount_limit",
    }),
  ];

  // Create the table instance
  const table = useReactTable({
    data: allLimits,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {pagination},
    onPaginationChange: setPagination,
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
          TODO: Click handlers.
        </Col>
      </Row>

      <table className="table table-bordered table-striped">

        <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr
//            className={selectedUser?.id === row.original.id ? "table-primary" : ""}
            key={row.id}
          >
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
//                onClick={() => handleSelectUser(cell.id, row.original)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        </tbody>

        <tfoot>
        <tr>
          <th colSpan={table.getCenterLeafColumns().length}>
            <div className="divider"/>
          </th>
        </tr>
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

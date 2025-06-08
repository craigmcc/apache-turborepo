"use client";

/**
 * Overview table for Cards.
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
import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { PaginationFooter } from "@/components/tables/PaginationFooter";
import { CardPlus, DepartmentPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CardsTableProps = {
  // All cards to display in the table
  allCards: CardPlus[];
  allDepartments: DepartmentPlus[];
}

export function CardsTable({ allCards, allDepartments }: CardsTableProps) {

  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [filteredCards, setFilteredCards] = useState<CardPlus[]>(allCards);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Save the departments for name formatting
  departments = allDepartments;

  // Apply selection filters whenever they change
  useEffect(() => {

    let matchingCards: CardPlus[] = allCards;

    if (cardNameFilter.length > 0) {
      matchingCards = matchingCards.filter(card => {
        const cardName = formatCardName(card);
        return cardName.toLowerCase().includes(cardNameFilter);
      });
    }

    if (departmentNameFilter.length > 0) {
      matchingCards = matchingCards.filter(card => {
        const departmentName = formatDepartmentName(card);
        return departmentName.toLowerCase().includes(departmentNameFilter);
      });
    }

    if (userNameFilter.length > 0) {
      matchingCards = matchingCards.filter(card => {
        const userName = formatUserName(card);
        return userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredCards(matchingCards);

  }, [allCards, cardNameFilter, departmentNameFilter, userNameFilter]);

  // Overall table instance
  const table = useReactTable<CardPlus>({
    columns,
    data: filteredCards,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>

      <Row>
        <h1 className="header text-center">
          Cards Table
        </h1>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId={departmentNameFilter}>
            <span>Filter by Department Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={departmentNameFilter}
              onChange={e => setDepartmentNameFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={userNameFilter}>
            <span>Filter by User Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={userNameFilter}
              onChange={e => setUserNameFilter(e.target.value.toLowerCase())}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={cardNameFilter}>
            <span>Filter by Card Name:</span>
            <Form.Control
              type="text"
              placeholder="Enter part of a name to filter"
              value={cardNameFilter}
              onChange={e => setCardNameFilter(e.target.value.toLowerCase())}
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
  )

}

// Private Objects -----------------------------------------------------------

/**
 * Column definitions for the table.
 */
const columnHelper = createColumnHelper<CardPlus>();
const columns = [
  columnHelper.accessor("cardholder.department_id", {
    cell: info => {
      return <span>{formatDepartmentName(info.row.original)}</span>;
    },
    header: "Department Name",
  }),
  columnHelper.accessor("cardholder_name", {
    cell: info => {
      return <span>{formatUserName(info.row.original)}</span>;
    },
    header: "User Name",
  }),
  columnHelper.accessor("display_name", {
    cell: info => {
      return <span>{formatCardName(info.row.original)}</span>;
    },
    header: "Card Name",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{info.row.original.is_physical ? "Yes" : "No"}</span>;
    },
    header: "Physical?",
    id: "is_physical",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{formatState(info.row.original)}</span>;
    },
    header: "State",
    id: "state",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{formatAmount(info.row.original.spending_restrictions?.amount)}</span>;
    },
    header: "Interval Limit",
    id: "amount",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{formatInterval(info.row.original)}</span>;
    },
    header: "Interval",
    id: "interval",
  }),
  columnHelper.display({
    cell: info => {
      return <span>{formatAmount(info.row.original.spending_restrictions?.transaction_amount_limit)}</span>;
    },
    header: "Transaction Limit",
    id: "transaction_amount_limit",
  }),
  columnHelper.display({
    cell: info => {
      const suspended = info.row.original.spending_restrictions?.suspended;
      if (suspended) {
        return <span className="text-danger">Yes</span>;
      } else {
        return <span className="text-success">No</span>;
      }
    },
    header: "Suspended?",
    id: "suspended",
  }),
];

// Private Objects -----------------------------------------------------------

/**
 * Save the department list for name formatting.
 */
let departments: DepartmentPlus[] = [];

/**
 * Format an amount as a string with two decimal places.
 */
function formatAmount(amount: number | null | undefined): string {
  if (!amount) return "n/a";
  return `$${amount.toFixed(2)}`;
}

/**
 * Format the card name for a card.
 */
function formatCardName(card: CardPlus): string {
  return card.display_name || "n/a";
}

/**
 * Format the department name for a card.
 */
function formatDepartmentName(card: CardPlus): string {
  if (!card.cardholder?.department_id) return "n/a";
  const department = departments.find(department => department.id === card.cardholder?.department_id);
  return department?.name || "n/a";
}

/**
 * Format the interval for a card.
 */
function formatInterval(card: CardPlus): string {
  return card.spending_restrictions?.interval || "n/a";
}

/**
 * Format the state for a card.
 */
function formatState(card: CardPlus): string {
  return card.state || "n/a";
}

/**
 * Format the user name for a card.
 */
function formatUserName(card: CardPlus): string {
  if (card.cardholder) {
    return `${card.cardholder.last_name}, ${card.cardholder.first_name}`;
  } else {
    return "n/a";
  }
}

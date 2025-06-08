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
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { useSelectedCardContext } from "@/contexts/SelectedCardContext";
import { useSelectedUserContext } from "@/contexts/SelectedUserContext";
import { CardPlus } from "@/types/types";
import { PaginationFooter } from "@/components/tables/PaginationFooter";

// Public Objects ------------------------------------------------------------

export type CardsTableProps = {
  // All cards to display in the table
  allCards: CardPlus[];
}

export function CardsTable({ allCards }: CardsTableProps) {

  const [filteredCards, setFilteredCards] = useState<CardPlus[]>(allCards);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { selectedCard, changeSelectedCard } = useSelectedCardContext();
  const { selectedUser, changeSelectedUser } = useSelectedUserContext();

  useEffect(() => {
    // Whenever the selected user changes, filter the cards
    if (selectedUser) {
      const matchingCards = allCards.filter(card => card.cardholder?.id === selectedUser.id);
      setFilteredCards(matchingCards);
    } else {
      setFilteredCards(allCards);
    }
  }, [selectedUser, allCards]);

  // Format an amount as a string with a currency symbol and two decimal places
  function formatAmount(amount: number | null | undefined): string {
    if (!amount) return "n/a";
    return `$${amount.toFixed(2)}`;
  }

  function handleSelectCard(cellId: string, card: CardPlus) {
    if (cellId.endsWith("_name")) {
      if (card.id === selectedCard?.id) {
  //      console.log("Deselecting card", card.display_name);
        changeSelectedCard(null);
        changeSelectedUser(null);
      } else {
  //      console.log("Selecting card", card.display_name);
        changeSelectedCard(card);
        changeSelectedUser(card.cardholder || null);
      }
    }
    // If the user is selected, also update the selected user
    if (card.cardholder) {
      changeSelectedUser(card.cardholder);
    } else {
      changeSelectedUser(null);
    }
  }

  // Column definitions
  const columnHelper = createColumnHelper<CardPlus>();
  const columns = [
    columnHelper.display({
      cell: info => {
        const user_name = `${info.row.original.cardholder?.last_name}, ${info.row.original.cardholder?.first_name}`;
        return <span>{user_name}</span>
      },
      header: "User Name",
      id: "user_name",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{info.row.original.display_name}</span>;
      },
      header: "Card Name",
      id: "card_name",
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
        return <span>{info.row.original.state}</span>;
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
        return <span>{info.row.original.spending_restrictions?.interval}</span>;
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
        <Col className="text-center">
          <span>Selected User:&nbsp;</span>
          {selectedUser ? (
            <span>{selectedUser.last_name}, {selectedUser.first_name}</span>
          ) : (
            <span>None</span>
          )}
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
            className={selectedCard?.id === row.original.id ? "table-primary" : ""}
            key={row.id}
          >
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
                onClick={() => handleSelectCard(cell.id, row.original)}
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
            <PaginationFooter table={table}/>
          </th>
        </tr>
        </tfoot>

      </table>

    </Container>
  )

}

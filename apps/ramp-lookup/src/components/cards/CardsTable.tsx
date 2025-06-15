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
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp, BookUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { CardMoreInfo } from "@/components/cards/CardMoreInfo";
import { CardsCsvExport } from "@/components/cards/CardsCsvExport";
import { PaginationFooter } from "@/components/tables/PaginationFooter";
import {
  formatCardInterval,
  formatCardName,
  formatCardState,
  formatDepartmentName,
  formatUserName
} from "@/lib/Formatters";
import {CardPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type CardsTableProps = {
  // All cards to display in the table
  allCards: CardPlus[];
}

export function CardsTable({ allCards }: CardsTableProps) {

  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [currentCard, setCurrentCard] = useState<CardPlus>(placeholderCard);
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [filteredCards, setFilteredCards] = useState<CardPlus[]>(allCards);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "user_name", desc: false },
  ]);
  const [userNameFilter, setUserNameFilter] = useState<string>("");

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
        const departmentName = formatDepartmentName(card.cardholder?.department);
        return departmentName.toLowerCase().includes(departmentNameFilter);
      });
    }

    if (userNameFilter.length > 0) {
      matchingCards = matchingCards.filter(card => {
        const userName = formatUserName(card.cardholder);
        return userName.toLowerCase().includes(userNameFilter);
      });
    }

    setFilteredCards(matchingCards);

  }, [allCards, cardNameFilter, departmentNameFilter, userNameFilter]);

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
//    console.log("Closing More Info modal for card:", formatCardName(currentCard));
    setCurrentCard(placeholderCard);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(card: CardPlus) {
//    console.log("Showing More Info for card:", formatCardName(card));
    setCurrentCard(card);
    setShowMoreInfo(true);
  }

  // Column definitions for the Cards table
  const columns = useMemo(() => [
    columnHelper.accessor(row => formatDepartmentName(row.cardholder?.department), {
      cell: info => {
        return <span>{formatDepartmentName(info.row.original.cardholder?.department)}</span>;
      },
      enableSorting: true,
      header: "Department Name",
      id: "department_name",
    }),
    columnHelper.accessor(row => formatUserName(row.cardholder), {
      cell: info => {
        return <span>{formatUserName(info.row.original.cardholder)}</span>;
      },
      enableSorting: true,
      header: "User Name",
      id: "user_name",
    }),
    columnHelper.accessor(row => formatCardName(row), {
      cell: info => {
        return <span>{formatCardName(info.row.original)}</span>;
      },
      enableSorting: true,
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
        return <span>{formatCardState(info.row.original)}</span>;
      },
      header: "State",
      id: "state",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatAmountFunky(info.row.original.spending_restrictions?.amount)}</span>;
      },
      header: "Interval Limit",
      id: "amount",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatCardInterval(info.row.original)}</span>;
      },
      header: "Interval",
      id: "interval",
    }),
    columnHelper.display({
      cell: info => {
        return <span>{formatAmountFunky(info.row.original.spending_restrictions?.transaction_amount_limit)}</span>;
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

  // Overall table instance
  const table = useReactTable<CardPlus>({
    columns,
    data: filteredCards,
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
          <span className="me-5">Cards Table</span>
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
          <Form.Group controlId={departmentNameFilter}>
            <span>Filter by Department Name:</span>
            <Form.Control
              onChange={e => setDepartmentNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={departmentNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={userNameFilter}>
            <span>Filter by User Name:</span>
            <Form.Control
              onChange={e => setUserNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={userNameFilter}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={cardNameFilter}>
            <span>Filter by Card Name:</span>
            <Form.Control
              onChange={e => setCardNameFilter(e.target.value.toLowerCase())}
              placeholder="Enter part of a name to filter"
              type="text"
              value={cardNameFilter}
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

      <CardsCsvExport
        cards={table.getSortedRowModel().flatRows.map(row => row.original)}
        hide={handleCsvExportClose}
        show={showCsvExport}
      />

      <CardMoreInfo
        card={currentCard}
        hide={handleMoreInfoClose}
        show={showMoreInfo}
      />

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Cards table.
 */
const columnHelper = createColumnHelper<CardPlus>();


/**
 * Format an amount as a string with two decimal places.  Funky for old API things.
 */
function formatAmountFunky(amount: number | null | undefined): string {
  if (!amount) return "n/a";
  return `$${amount.toFixed(2)}`;
}

/**
 * Placeholder for the CardMoreInfo component.
 */
const placeholderCard: CardPlus = {
  // Scalar fields
  id: "",
  cardholder_name: null,
  card_program_id: null,
  created_at: null,
  display_name: "",
  expiration: "",
  has_program_overridden: false,
  is_physical: false,
  last_four: "",
  state: null,
  // Potential relationships
  entity_id: null,
  // Actual relationships
  cardholder_id: null,
  cardholder: null,
  limit_cards: null,
  spending_restrictions: null,
}

"use client";

/**
 * Overview table for Transactions.
 */

// External Imports ----------------------------------------------------------

import { DataTable } from "@repo/shared-components/DataTable";
import { AccountGroupFilter } from "@repo/shared-components/AccountGroupFilter";
import { TextFieldFilter } from "@repo/shared-components/TextFieldFilter";
import { isAccountInGroup } from "@repo/shared-utils/AccountGroups";
import {
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
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
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

import { TransactionMoreInfo } from "@/components/transactions/TransactionMoreInfo";
import { TransactionsCsvExport } from "@/components/transactions/TransactionsCsvExport";
import {
  formatAccountingDate,
  formatAmount,
  formatCardLastFour,
  formatCardName,
  formatDepartmentName,
  formatGlAccount,
  formatMerchantName,
  formatUserName
} from "@/lib/Formatters";
import { TransactionPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

export type TransactionsTableProps = {
  // All Transactions to display in the table
  allTransactions: TransactionPlus[];
}

export function TransactionsTable({ allTransactions }: TransactionsTableProps) {

  const [accountGroupFilter, setAccountGroupFilter] = useState<string>("All");
  const [cardNameFilter, setCardNameFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionPlus | null>(null);
  const [departmentNameFilter, setDepartmentNameFilter] = useState<string>("");
  const [glAccountFilter, setGlAccountFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>(""); // YYYYMMDD
  const [merchantFilter, setMerchantFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showCsvExport, setShowCsvExport] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "accounting_date", desc: false },
  ]);
  const [toDateFilter, setToDateFilter] = useState<string>(""); // YYYYMMDD
  const [userNameFilter, setUserNameFilter] = useState<string>("");

  // Apply selection filters whenever they change
  useEffect(() => {

    const filters: ColumnFiltersState = [];

    if (accountGroupFilter !== "All") {
      filters.push({
        id: "account_group",
        value: accountGroupFilter,
      });
    }

    const accountingDateFilter = fromDateFilter + "|" + toDateFilter;
    if (accountingDateFilter.length > 1) {
      filters.push({
        id: "accounting_date",
        value: accountingDateFilter,
      });
    }

    if (cardNameFilter.length > 0) {
      filters.push({
        id: "card_name",
        value: cardNameFilter,
      });
    }

    if (departmentNameFilter.length > 0) {
      filters.push({
        id: "department_name",
        value: departmentNameFilter,
      });
    }

    if (glAccountFilter.length > 0) {
      filters.push({
        id: "gl_account",
        value: glAccountFilter,
      });
    }

    if (merchantFilter.length > 0) {
      filters.push({
        id: "merchant_name",
        value: merchantFilter,
      });
    }

    if (userNameFilter.length > 0) {
      filters.push({
        id: "user_name",
        value: userNameFilter,
      });
    }

    setColumnFilters(filters);

  }, [accountGroupFilter, cardNameFilter, departmentNameFilter, fromDateFilter,
      glAccountFilter, merchantFilter, toDateFilter, userNameFilter]);

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
    setCurrentTransaction(null);
    setShowMoreInfo(false);
  }

  // Handle the "More Info" modal open
  function handleMoreInfoOpen(transaction: TransactionPlus) {
    setCurrentTransaction(transaction);
    setShowMoreInfo(true);
  }

  // Column definitions for the Transactions table
  const columns = useMemo(() => [
    columnHelper.accessor(row => formatAccountingDate(row), {
      enableSorting: true,
      filterFn: dateRangeFilterFn,
      header: () => <span>Trans. Date-Time</span>,
      id: "accounting_date",
    }),
    columnHelper.accessor(row => formatDepartmentName(row.card_holder_user?.department), {
      cell: info => {
        return <span>{formatDepartmentName(info.row.original.card_holder_user?.department)}</span>
      },
      enableSorting: true,
      header: () => <span>Department Name</span>,
      id: "department_name",
    }),
    columnHelper.accessor(row => formatUserName(row.card_holder_user), {
      cell: info => {
        return <span>{formatUserName(info.row.original.card_holder_user)}</span>
      },
      enableSorting: true,
      header: () => <span>User Name</span>,
      id: "user_name",
    }),
    columnHelper.accessor(row => formatCardName(row.card), {
      cell: info => {
        return <span>{formatCardName(info.row.original.card)}</span>;
      },
      enableSorting: true,
      header: () => <span>Card Name</span>,
      id: "card_name",
    }),
    columnHelper.accessor(row => formatCardLastFour(row.card), {
      cell: info => {
        return <span>{formatCardLastFour(info.row.original.card)}</span>;
      },
      enableSorting: false,
      header: () => <span>Last 4</span>,
      id: "last_four",
    }),
    columnHelper.display({
      cell: info => {
        const amount =
          formatAmount(info.row.original.original_transaction_amount_amt,
            info.row.original.original_transaction_amount_cc);
        return <span>{amount}</span>;
      },
      header: () => <span>Original Amount</span>,
      id: "original_amount",
    }),
    columnHelper.display({
      cell: info => {
        const amount =
          formatAmount(info.row.original.amount_amt, info.row.original.amount_cc)
        return <span>{amount}</span>;
      },
      header: () => <span>Settled Amount</span>,
      id: "settled_amount",
    }),
    columnHelper.accessor(row => formatMerchantName(row), {
      cell: info => {
        return <span>{formatMerchantName(info.row.original)}</span>;
      },
      enableSorting: true,
      header: () => <span>Merchant</span>,
      id: "merchant_name",
    }),
    columnHelper.accessor(row => formatGlAccount(row), {
      cell: info => {
        return <span>{formatGlAccount(info.row.original)}</span>;
      },
      enableSorting: false,
      header: () => <span>GL Account</span>,
      id: "gl_account",
    }),
    columnHelper.accessor(row => row.id, {
      enableSorting: false,
      filterFn: accountGroupFilterFn,
      header: () => <span>Account Group</span>,
      id: "account_group",
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
  const table = useReactTable({
    columns,
    data: allTransactions,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility:
        {
          account_group: false,
        },
    },
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
          <span className="me-5">Transactions Table</span>
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
            controlId="fromDateFilter"
            label="Filter by From Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setFromDateFilter}
            textFieldFilter={fromDateFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="toDateFilter"
            label="Filter by To Date:"
            placeholder="Enter YYYYMMDD"
            setTextFieldFilter={setToDateFilter}
            textFieldFilter={toDateFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="departmentNameFilter"
            label="Filter by Dept. Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setDepartmentNameFilter}
            textFieldFilter={departmentNameFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="userNameFilter"
            label="Filter by User Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setUserNameFilter}
            textFieldFilter={userNameFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="cardNameFilter"
            label="Filter by Card Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setCardNameFilter}
            textFieldFilter={cardNameFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="merchantFilter"
            label="Filter by Merchant Name:"
            placeholder="Enter part of name"
            setTextFieldFilter={setMerchantFilter}
            textFieldFilter={merchantFilter}
          />
        </Col>
        <Col>
          <TextFieldFilter
            controlId="glAccountFilter"
            label="Filter by GL Acct/Name:"
            placeholder="Enter part of account or name"
            setTextFieldFilter={setGlAccountFilter}
            textFieldFilter={glAccountFilter}
          />
        </Col>
        <Col>
          <AccountGroupFilter
            accountGroupFilter={accountGroupFilter}
            setAccountGroupFilter={setAccountGroupFilter}
          />
        </Col>
      </Row>

      <DataTable
        showPagination={true}
        table={table}
      />

      <TransactionsCsvExport
        hide={handleCsvExportClose}
        show={showCsvExport}
        transactions={table.getSortedRowModel().flatRows.map(row => row.original)}
      />

      <TransactionMoreInfo
        hide={handleMoreInfoClose}
        show={showMoreInfo}
        transaction={currentTransaction}/>

    </Container>
  );

}

// Private Objects -----------------------------------------------------------

/**
 * Helper for creating columns in the Transactions table.
 */
const columnHelper = createColumnHelper<TransactionPlus>();

/**
 * Account group filter function for the Transactions table.  The filter "value"
 * should be the name of an account group, such as "ComDev" or "Marketing", that must
 * be matched by the current row.
 */
const accountGroupFilterFn: FilterFn<TransactionPlus> = (row, columnId, value) => {
  if (!value || (value === "All")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const tliafs = row.original.line_item_accounting_field_selections
    if (tliafs && (tliafs.length > 0) && (tliafs[0].category_info_type === "GL_ACCOUNT")) {
      return isAccountInGroup(tliafs[0].external_code?.substring(0, 4), value);
    } else {
      return false;
    }
  }
}

/**
 * Date range filter function for the Transactions table.  The filter "value"
 * should be a string in the format "YYYYMMDD|YYYYMMDD", where the first date is
 * the "from" date and the second date is the "to" date.
 */
const dateRangeFilterFn: FilterFn<TransactionPlus> = (row, columnId, value) => {
  if (!value || (value === "")) {
    return true; // If no value is provided, do not filter out any rows
  } else {
    const cellValue = String(row.getValue(columnId));
    let [fromDate, toDate] = value.split("|");
    if (fromDate.length >= 8) {
      fromDate = fromDate.substring(0, 8) + "-000000"; // Start of the day
      if (cellValue < fromDate) {
        return false; // Cell value is before the "from" date
      }
    }
    if (toDate.length >= 8) {
      toDate = toDate.substring(0, 8) + "-235959"; // End of the day
      if (cellValue > toDate) {
        return false; // Cell value is after the "to" date
      }
    }
    return true;
   }
};

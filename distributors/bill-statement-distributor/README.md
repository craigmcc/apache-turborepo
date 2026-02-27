# Bill.com Statement Distributor

Automated distribution of Bill.com accounts payable statements to account group contacts via email.

## Overview

This tool generates CSV statements for each account group based on bills with invoice dates in a specified date range. It queries the bill-db database, filters bills by account group using GL account classifications, and emails the statements to account group contacts. All account groups receive an email each month; account groups with no bills receive a no-activity notice (no attachment).

**Prerequisite:** Run [bill-refresh](../../README.md#25-populate-the-local-database-with-bill-content) before distributing.

## Quick Start

See [distributors/README.md Quickstart](../README.md#quick-start).

## Bill.com CSV Format

Generated statements include these columns:

1. Invoice Date
2. Vendor Name
3. Invoice Number
4. Due Date
5. Amount (USD)
6. Paid Amount (USD)
7. Approval Status
8. Approver
9. Payment Status
10. GL Account
11. GL Account Name

**Filename format:** `Bill-{account_group}-{from_date}-{to_date}.csv`

## Full Documentation

For installation, configuration, usage, troubleshooting, and security, see [distributors/README.md](../README.md).

## License

Apache License 2.0

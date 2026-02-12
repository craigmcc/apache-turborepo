# Bill.com Statement Distributor

Automated distribution of Bill.com accounts payable statements to account group contacts via email.

## Overview

This tool generates CSV statements for each account group based on bills with invoice dates in a specified date range. It queries the bill-db database, filters bills by account group using GL account classifications, and emails the statements to account group contacts. All account groups receive an email each month; account groups with no bills receive a no-activity notice (no attachment).

**Prerequisite:** Run [bill-refresh](../../README.md#25-populate-the-local-database-with-bill-content) before distributing. See [distributors/README.md](../README.md) for full documentation.

## Quick Start

```bash
cd distributors/bill-statement-distributor
./setup.sh
cp config.example.json config.json
# Edit config.json with SMTP and database settings

python3 bill_statement_distributor.py --config config.json --list-account-groups
python3 bill_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30
python3 bill_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30 --send-emails
```

## Bill.com CSV Format

Generated statements include these columns:

1. Invoice Date
2. Vendor Name
3. Invoice Number
4. Due Date
5. Amount (USD)
6. Paid Amount (USD)
7. Payment Status
8. Approval Status
9. GL Account
10. GL Account Name

**Filename format:** `Bill-{account_group}-{from_date}-{to_date}.csv`

## Bill-Specific Troubleshooting

### Empty Statements (0 bills, receives no-activity email)

**Possible causes:**
- No bills with invoice dates in the specified range for that account group
- Bills are not classified with GL accounts in the account group's ranges
- Bills exist but are not classified (missing `bills_classifications` records)

**Solution:** Run [bill-refresh](../../README.md#25-populate-the-local-database-with-bill-content) to populate the database. Verify bills exist and are properly classified with GL accounts in the account group's `groupRanges`.

## Full Documentation

For installation, configuration, usage, troubleshooting, and security, see [distributors/README.md](../README.md).

## License

Apache License 2.0

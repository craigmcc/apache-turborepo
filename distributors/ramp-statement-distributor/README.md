# Ramp Statement Distributor

A Python tool for the Apache Software Foundation Treasury that generates and distributes Ramp credit card activity statements to account groups via email.

## Overview

This tool loads account groups from `AccountGroups.json`, queries the Ramp database for transactions, generates CSV statements per account group, and emails them to account group contacts. All account groups receive an email each month; account groups with no transactions receive a no-activity notice (no attachment).

**Prerequisite:** Run [ramp-refresh](../../README.md#28-populate-the-local-database-with-ramp-content) before distributing. See [distributors/README.md](../README.md) for full documentation.

## Quick Start

```bash
cd distributors/ramp-statement-distributor
./setup.sh
cp config.example.json config.json
# Edit config.json with SMTP and database settings

python ramp_statement_distributor.py --config config.json --list-account-groups
python ramp_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30
python ramp_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30 --send-emails
```

## Ramp CSV Format

Generated statements include these columns:

- Accounting Date-Time
- User Name
- Card Name
- Last 4
- Original Amount
- Settled Amount
- Merchant
- GL Account
- State

**Filename format:** `Ramp-{account_group}-{from_date}-{to_date}.csv`

## Ramp-Specific Troubleshooting

### Account Group Not Found / Empty CSV

- Account group names and GL ranges are loaded from `packages/shared-utils/src/AccountGroups.json`
- Verify `groupName` values match Ramp's account groups
- Use the ramp-lookup web interface to see available account groups
- Ensure the database is up to date by running [ramp-refresh](../../README.md#28-populate-the-local-database-with-ramp-content)

## Full Documentation

For installation, configuration, usage, troubleshooting, and security, see [distributors/README.md](../README.md).

## License

Apache License 2.0

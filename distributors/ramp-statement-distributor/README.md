# Ramp Statement Distributor

A Python tool for the Apache Software Foundation Treasury that generates and distributes Ramp credit card activity statements to account groups via email.

## Overview

This tool loads account groups from `AccountGroups.json`, queries the Ramp database for transactions, generates CSV statements per account group, and emails them to account group contacts. All account groups receive an email each month; account groups with no transactions receive a no-activity notice (no attachment).

**Prerequisite:** Run [ramp-refresh](../../README.md#28-populate-the-local-database-with-ramp-content) before distributing.

## Quick Start

See [distributors/README.md Quickstart](../README.md#quick-start).

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

## Full Documentation

For installation, configuration, usage, troubleshooting, and security, see [distributors/README.md](../README.md).

## License

Apache License 2.0

# Statement Distributors

Automated distribution of financial statements to department contacts via email.

## Overview

This directory contains statement distributor tools that generate and email financial statements to Apache departments. All distributors share common utilities and follow the same architecture.

## Python Version

All distributors use **Python 3.14.0** as defined in the `.python-version` file at this level. This ensures consistency across all distributor tools.

When using pyenv, it will automatically detect and use this version when you're in any subdirectory.

## Available Distributors

### 1. Ramp Statement Distributor
- **Purpose:** Distributes Ramp credit card transaction statements
- **Database:** `packages/ramp-db/ramp-db.db`
- **Directory:** `ramp-statement-distributor/`

### 2. Bill.com Statement Distributor
- **Purpose:** Distributes Bill.com accounts payable statements
- **Database:** `packages/bill-db/bill-db.db`
- **Directory:** `bill-statement-distributor/`

## Shared Utilities

All distributors leverage the `shared/` package, which provides:

- **Email sending** - SMTP with attachments
- **Logging** - Console and rotating file logging
- **Department management** - Loading and filtering from AccountGroups.json
- **Account filtering** - GL account range checking
- **Date utilities** - Parsing and range calculation
- **Formatters** - Amount and date formatting
- **Statistics** - Tracking and summary reports

## Quick Start

```bash
# Install Python 3.14.0 (if needed)
pyenv install 3.14.0

# Navigate to a distributor
cd ramp-statement-distributor  # or bill-statement-distributor

# Run setup
./setup.sh

# List available departments
python3 *_statement_distributor.py --config config.json --list-departments

# Generate statements (dry-run)
python3 *_statement_distributor.py --config config.json \
  --from-date 2024-01-01 --to-date 2024-01-31

# Send statements (production)
python3 *_statement_distributor.py --config config.json \
  --from-date 2024-01-01 --to-date 2024-01-31 \
  --send-emails
```

## Common Features

All distributors support:

- **Monthly emails to all departments** - Every department receives an email each month; departments with no activity receive a no-activity notice (no CSV attachment)
- **Dry-run mode** - Test without sending emails (default)
- **Department filtering** - Process specific departments
- **Date ranges** - Flexible date range selection (defaults to previous month)
- **Summary reports** - Execution summaries emailed to treasurer
- **Robust logging** - Console and rotating file logs
- **Consistent CLI** - Same command-line interface across all tools

## Architecture

```
distributors/
├── .python-version              # Python 3.14.0 (shared)
├── shared/                      # Shared utilities package
│   ├── email_sender.py
│   ├── logging_config.py
│   ├── department_manager.py
│   ├── account_groups.py
│   ├── date_utils.py
│   ├── formatters.py
│   └── statistics.py
├── ramp-statement-distributor/
│   └── ramp_statement_distributor.py
└── bill-statement-distributor/
    └── bill_statement_distributor.py
```

## Adding New Distributors

To create a new distributor:

1. Create a new directory in `distributors/`
2. Implement the distributor script (reuse `shared/` utilities)
3. Add `config.example.json`, `requirements.txt`, and `setup.sh`
4. Document in a README.md

Expected code savings: ~400 lines by reusing shared utilities.

## Configuration

Each distributor has its own `config.json` with:
- Database path
- Output directory
- SMTP settings
- Email templates (including no-activity templates for departments with no data)
- Logging preferences

See individual distributor READMEs for details.

## Support

For questions or issues:
- Email: treasurer@apache.org
- Check individual distributor logs in their `logs/` directory
- Review implementation details in `IMPLEMENTATION_SUMMARY.md`

## License

Apache License 2.0

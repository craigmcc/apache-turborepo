# Statement Distributors

Automated distribution of financial statements to department contacts via email.

## Overview

This directory contains statement distributor tools that generate and email financial statements to Apache departments. All distributors share common utilities and follow the same architecture.

## Prerequisites

- [pyenv](https://github.com/pyenv/pyenv) - Python version management
- Python 3.14+ (version defined at `distributors/.python-version`)
- Access to the local databases (populated by bill-refresh and ramp-refresh)
- Access to `packages/shared-utils/src/AccountGroups.json` (department definitions)
- SMTP server credentials for sending emails

## Python Version

All distributors use **Python 3.14.0** as defined in the `.python-version` file at this level. This ensures consistency across all distributor tools.

When using pyenv, it will automatically detect and use this version when you're in any subdirectory.

## Available Distributors

### 1. Ramp Statement Distributor
- **Purpose:** Distributes Ramp credit card transaction statements
- **Directory:** [ramp-statement-distributor/](ramp-statement-distributor/README.md)

### 2. Bill.com Statement Distributor
- **Purpose:** Distributes Bill.com accounts payable statements
- **Directory:** [bill-statement-distributor/](bill-statement-distributor/README.md)

See per-distributor READMEs for data-specific details (CSV column format, distributor-specific troubleshooting).

## Before Running: Refresh Databases

**Important:** The statement distributors read from local SQLite databases. Before distributing monthly statements, you must refresh these databases so they contain the latest data from Bill.com and Ramp.

- **For Ramp statements:** Run [ramp-refresh](../README.md#28-populate-the-local-database-with-ramp-content)
- **For Bill.com statements:** Run [bill-refresh](../README.md#25-populate-the-local-database-with-bill-content)

**Recommended monthly workflow:** Run both refreshers first, then run the statement distributors.

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

Ensure you have run the relevant refresh application(s) first (see above).

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

## Installation

### Quick Setup (Recommended)

Run the automated setup script from the distributor directory:

```bash
cd ramp-statement-distributor  # or bill-statement-distributor
./setup.sh
cp config.example.json config.json
# Edit config.json with your settings
```

The setup script will check for pyenv, install Python 3.14.0 if needed, create a virtual environment, and install dependencies.

### Manual Setup

1. Install [pyenv](https://github.com/pyenv/pyenv) and add to your shell configuration
2. Install Python 3.14.0: `pyenv install 3.14.0`
3. Navigate to the distributor and create virtual environment: `python -m venv .venv`
4. Activate: `source .venv/bin/activate` (macOS/Linux)
5. Install dependencies: `pip install -r requirements.txt`
6. Copy and edit config: `cp config.example.json config.json`

## Configuration

Each distributor uses a `config.json` file. Copy from `config.example.json` and customize.

### Configuration Options

| Option | Description | Notes |
|--------|-------------|-------|
| `database_path` | Path to SQLite database | Set in each package's .env; override here if needed |
| `output_dir` | Where CSV statements are saved | Ramp: `./ramp_statements`, Bill: `./bill_statements` |
| `logging.log_dir` | Log file directory | Default: `./logs` |
| `logging.log_file` | Log file name | Per-distributor name |
| `logging.retention_days` | Days to keep logs | Ramp: 30, Bill: 90 |
| `logging.log_level` | DEBUG, INFO, WARNING, ERROR | Default: INFO |
| `summary_report.enabled` | Send summary to treasurer | Default: true |
| `summary_report.recipient` | Summary email recipient | Default: treasurer@apache.org |
| `smtp.*` | SMTP host, port, TLS, credentials | Required for sending |
| `email_template.subject` | Email subject (with attachment) | Placeholders: `{department}`, `{from_date}`, `{to_date}` |
| `email_template.body` | Email body (with attachment) | Same placeholders |
| `email_template.no_activity_subject` | Subject when no activity | Used when department has no data |
| `email_template.no_activity_body` | Body when no activity | No attachment sent |

**SMTP Password:** Provide via `SMTP_PASSWORD` environment variable (recommended) or in config.json.

## Department Configuration

Departments are loaded from `packages/shared-utils/src/AccountGroups.json`. Each department must have:

- `groupName`: Department name
- `groupType`: Set to "Departmental"
- `groupEmail`: Email address for statement distribution
- `groupRanges`: GL account ranges, e.g. `[{"start": "6400", "end": "6499"}]`

Only departments with `groupEmail` receive statements. Departments without email are skipped with a warning.

## Usage

### Command-Line Options

| Option | Description |
|--------|-------------|
| `--config PATH` | Configuration file (default: config.json) |
| `--from-date YYYY-MM-DD` | Start date (default: first day of previous month) |
| `--to-date YYYY-MM-DD` | End date (default: last day of previous month) |
| `--departments LIST` | Comma-separated departments (case-insensitive) |
| `--list-departments` | List departments and exit |
| `--send-emails` | Actually send emails (default: dry-run) |

### Examples

```bash
# List departments
python3 *_statement_distributor.py --config config.json --list-departments

# Dry-run for specific date range (no emails sent)
python3 *_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30

# Single department
python3 *_statement_distributor.py --config config.json --departments Infrastructure

# Production: send emails
python3 *_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30 --send-emails
```

**Note:** Always run in dry-run mode first to verify output before sending emails.

## Email Behavior

### Dry-Run Mode (Default)

- Statements are generated and saved
- Log messages indicate what emails would be sent
- No actual emails are sent
- No summary report is sent

### Production Mode (`--send-emails`)

- Statements are generated and saved
- Emails sent to all department contacts: with CSV attachment when there is activity, or without attachment (no-activity notice) when there is none
- Summary report sent to treasurer (if enabled)
- All actions are logged

### Departments with No Activity

All departments receive an email each month. When a department has no data in the date range, an email is sent without attachment stating that no activity occurred, using `no_activity_subject` and `no_activity_body` from config.

## Automation

To run monthly via cron, add a job (e.g. `crontab -e`):

```cron
# Run on the 1st of each month at 9:00 AM
0 9 1 * * cd /path/to/distributors/ramp-statement-distributor && source .venv/bin/activate && python ramp_statement_distributor.py --send-emails >> /var/log/ramp-statement-distributor.log 2>&1
```

Use `--send-emails` for the cron job to actually send emails. Activate the virtual environment before running.

## Output

- **CSV Files:** Saved in `output_dir` with format `{Ramp|Bill}-{department}-{from_date}-{to_date}.csv`
- **Logs:** Console and rotating file; location in `config.logging.log_dir`
- **Summary Report:** Email to treasurer (when not in dry-run) with processing statistics

## Troubleshooting

### Database Not Found

**Solution:** Ensure the database exists. Run the relevant [bill-refresh](../README.md#25-populate-the-local-database-with-bill-content) or [ramp-refresh](../README.md#28-populate-the-local-database-with-ramp-content) first. Check `database_path` in config.json.

### No Departments Found

**Solution:** Verify `AccountGroups.json` exists at `packages/shared-utils/src/AccountGroups.json` and contains departments with `groupEmail` fields. Check `groupType` is "Departmental".

### SMTP Authentication Failed

**Solution:** Verify SMTP credentials in config.json. Use `SMTP_PASSWORD` environment variable for sensitive passwords. Check firewall allows outbound SMTP.

### Empty or Missing Data

**Solution:** Run the refresh application to populate the database. Verify the date range has data. Check that records are properly classified with GL accounts in the department's ranges. See per-distributor READMEs for data-specific troubleshooting.

## Security Considerations

1. **Credentials:** Use `SMTP_PASSWORD` environment variable instead of storing the password in config.json
2. **File Permissions:** Restrict access to config.json, database files, and output directories (`chmod 600 config.json`, `chmod 700 statements/`)
3. **TLS:** Always use `use_tls: true` for SMTP connections

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

## Support

For questions or issues:
- Email: treasurer@apache.org
- Check individual distributor logs in their `logs/` directory
- Review implementation details in `IMPLEMENTATION_SUMMARY.md`

## License

Apache License 2.0

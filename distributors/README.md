# Statement Distributors

Automated distribution of financial statements to account group contacts via email.

## Overview

This directory contains statement distributor tools that generate and email financial statements to Apache account groups. All distributors share common utilities and follow the same architecture.

## Prerequisites

**Important:** The statement distributors read from local SQLite databases. Before distributing monthly statements, you must refresh these databases so they contain the latest data from Bill.com and Ramp.

- **For Ramp statements:** Run [ramp-refresh](../README.md#28-populate-the-local-database-with-ramp-content)
- **For Bill.com statements:** Run [bill-refresh](../README.md#25-populate-the-local-database-with-bill-content)

Then...

- [pyenv](https://github.com/pyenv/pyenv) - Python version management
- Python 3.14+ (version defined at `distributors/.python-version`)
- Access to the local databases (populated by bill-refresh and ramp-refresh)
- Access to `packages/shared-utils/src/AccountGroups.json` (account group definitions)
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

## Shared Utilities

All distributors leverage the `shared/` package, which provides:

- **Email sending** - SMTP with attachments
- **Logging** - Console and rotating file logging
- **Account group management** - Loading and filtering from AccountGroups.json
- **Account filtering** - GL account range checking
- **Date utilities** - Parsing and range calculation
- **Formatters** - Amount and date formatting
- **Statistics** - Tracking and summary reports

## Installation

Run the automated setup script from the distributor directory:

```bash
cd ramp-statement-distributor  # or bill-statement-distributor
./setup.sh
cp config.example.json config.json
# Edit config.json with your settings
```

The setup script will check for pyenv, install Python 3.14.0 if needed, create a virtual environment, and install dependencies.

## Quick Start

Ensure you have run the relevant refresh application(s) first (see above).

```bash
# Install Python 3.14.0 (if needed)
pyenv install 3.14.0

# Navigate to a distributor
cd ramp-statement-distributor  # or bill-statement-distributor

# Run setup
./setup.sh

# Print CLI options
python3 *_statement_distributor.py

# List available account groups
python3 *_statement_distributor.py --config config.json --list-account-groups

# Generate statements (dry-run)
python3 *_statement_distributor.py --config config.json \
  --from-date 2024-01-01 --to-date 2024-01-31

# Send statements (production)
python3 *_statement_distributor.py --config config.json \
  --from-date 2024-01-01 --to-date 2024-01-31 \
  --send-emails
```

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
| `email_template.subject` | Email subject (with attachment) | Placeholders: `{account_group}`, `{from_date}`, `{to_date}` |
| `email_template.body` | Email body (with attachment) | Same placeholders |
| `email_template.no_activity_subject` | Subject when no activity | Used when account group has no data |
| `email_template.no_activity_body` | Body when no activity | No attachment sent |

**SMTP Password:** Provide via `SMTP_PASSWORD` environment variable (recommended) or in config.json.

## Account Group Configuration

Account groups are loaded from `packages/shared-utils/src/AccountGroups.json`. Each account group must have:

- `groupName`: Account group name
- `groupType`: Set to "Departmental"
- `groupEmail`: Email address for statement distribution
- `groupRanges`: GL account ranges, e.g. `[{"start": "6400", "end": "6499"}]`

Only account groups with `groupEmail` receive statements. Account groups without email are skipped with a warning.

## Email Behavior

### Dry-Run Mode (Default)

- Statements are generated and saved
- Log messages indicate what emails would be sent
- No actual emails are sent
- No summary report is sent

### Production Mode (`--send-emails`)

- Statements are generated and saved
- Emails sent to all account group contacts: with CSV attachment when there is activity, or without attachment (no-activity notice) when there is none
- Every email to account group contacts (with or without attachment) is BCC'd to the treasurer, using the same address as `summary_report.recipient`, so the treasurer receives a copy of all account-group emails
- Summary report sent to treasurer (if enabled)
- All actions are logged

### Account Groups with No Activity

All account groups receive an email each month. When an account group has no data in the date range, an email is sent without attachment stating that no activity occurred, using `no_activity_subject` and `no_activity_body` from config.

## Output

- **CSV Files:** Saved in `output_dir` with format `{Ramp|Bill}-{account_group}-{from_date}-{to_date}.csv`
- **Logs:** Console and rotating file; location in `config.logging.log_dir`
- **Summary Report:** Email to treasurer (when not in dry-run) with processing statistics

## Troubleshooting

### Database Not Found

**Solution:** Ensure the database exists. Run the relevant [bill-refresh](../README.md#25-populate-the-local-database-with-bill-content) or [ramp-refresh](../README.md#28-populate-the-local-database-with-ramp-content) first. Check `database_path` in config.json.

### No Account Groups Found

**Solution:** Verify `AccountGroups.json` exists at `packages/shared-utils/src/AccountGroups.json` and contains account groups with `groupEmail` fields. Check `groupType` is "Departmental".

### SMTP Authentication Failed

**Solution:** Verify SMTP credentials in config.json. Use `SMTP_PASSWORD` environment variable for sensitive passwords. Check firewall allows outbound SMTP.

### Empty or Missing Data

**Solution:** Run the refresh application to populate the database. Verify the date range has data. Check that records are properly classified with GL accounts in the account group's ranges. See per-distributor READMEs for data-specific troubleshooting.

## Security Considerations

1. **Credentials:** Use `SMTP_PASSWORD` environment variable instead of storing the password in config.json
2. **File Permissions:** Restrict access to config.json, database files, and output directories (`chmod 600 config.json`, `chmod 700 statements/`)
3. **TLS:** Always use `use_tls: true` for SMTP connections

## Common Features

All distributors support:

- **Emails to all account groups** - Every account group should receive a email each month; account groups with no activity receive a no-activity notice (no CSV attachment)
- **Dry-run mode** - Test without sending emails (default)
- **Account group filtering** - Process specific account groups
- **Date ranges** - Flexible date range selection (defaults to previous month)
- **Summary reports** - Execution summaries emailed to treasurer
- **Robust logging** - Console and rotating file logs
- **Consistent CLI** - Same command-line interface across all tools

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

## License

Apache License 2.0

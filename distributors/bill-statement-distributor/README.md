# Bill.com Statement Distributor

Automated distribution of Bill.com accounts payable statements to department contacts via email.

## Overview

The Bill.com Statement Distributor generates CSV statements for each department based on bills with invoice dates in a specified date range. It queries the local bill-db SQLite database, filters bills by department using GL account classifications, and emails the statements to designated department contacts.

## Features

- **Automated Statement Generation**: Query bills from the bill-db database and generate CSV statements
- **Department Filtering**: Uses GL account ranges from `AccountGroups.json` to filter bills by department
- **Email Distribution**: Sends statements via SMTP with CSV attachments
- **Dry-Run Mode**: Test statement generation without sending emails (default behavior)
- **Date Range Flexibility**: Generate statements for any date range or default to previous month
- **Selective Processing**: Process all departments or filter to specific departments
- **Summary Reports**: Sends execution summary to treasurer after distribution
- **Robust Logging**: Console and rotating file logs with configurable retention

## Requirements

- Python 3.14 or higher (version managed at `/distributors/.python-version`)
- Access to `packages/bill-db/bill-db.db` (Bill.com database)
- Access to `packages/shared-utils/src/AccountGroups.json` (department definitions)
- SMTP server credentials for sending emails

## Installation

1. Navigate to the bill-statement-distributor directory:
   ```bash
   cd distributors/bill-statement-distributor
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Configure your settings in `config.json` (created from `config.example.json`):
   - SMTP server settings
   - Database path (if different from default)
   - Email template
   - Logging preferences

## Configuration

The `config.json` file contains all configuration settings:

```json
{
  "database_path": "../../packages/bill-db/bill-db.db",
  "output_dir": "./bill_statements",
  "logging": {
    "log_dir": "./logs",
    "log_file": "bill_statement_distributor.log",
    "retention_days": 90,
    "log_level": "INFO"
  },
  "summary_report": {
    "enabled": true,
    "recipient": "treasurer@apache.org"
  },
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "use_tls": true,
    "from_address": "treasurer@apache.org",
    "username": "treasurer@apache.org",
    "password": "your-password-or-use-SMTP_PASSWORD-env-var"
  },
  "email_template": {
    "subject": "Bill.com Statement - {department} - {from_date} to {to_date}",
    "body": "Dear {department} Team,\n\nPlease find attached...",
    "no_activity_subject": "Bill.com Statement - {department} - {from_date} to {to_date} (No Activity)",
    "no_activity_body": "Dear {department} Team,\n\nThis is to confirm that no Bill.com activity occurred..."
  }
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `database_path` | Path to bill-db.db SQLite database | `../../packages/bill-db/bill-db.db` |
| `output_dir` | Directory where CSV statements are saved | `./bill_statements` |
| `logging.log_dir` | Directory for log files | `./logs` |
| `logging.log_file` | Log file name | `bill_statement_distributor.log` |
| `logging.retention_days` | Days to retain log files | 90 |
| `logging.log_level` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` |
| `summary_report.enabled` | Send summary report after distribution | `true` |
| `summary_report.recipient` | Email recipient for summary report | `treasurer@apache.org` |
| `smtp.*` | SMTP server settings for email delivery | - |
| `email_template.subject` | Subject for emails with statement attachment | - |
| `email_template.body` | Body for emails with statement attachment | - |
| `email_template.no_activity_subject` | Subject for emails when no bills in date range | Derived from subject + "(No Activity)" |
| `email_template.no_activity_body` | Body for no-activity emails (no attachment) | Fallback message |

**Note:** The SMTP password can be provided in `config.json` or via the `SMTP_PASSWORD` environment variable (environment variable takes precedence if both are set).

## Usage

### List Available Departments

View all departments with configured email addresses:

```bash
python3 bill_statement_distributor.py --config config.json --list-departments
```

### Generate Statements (Dry-Run)

Test statement generation without sending emails (default behavior):

```bash
# Default: previous month
python3 bill_statement_distributor.py --config config.json

# Specific date range
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30

# Single department
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30 \
  --departments Infrastructure

# Multiple departments
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30 \
  --departments "Infrastructure,Marketing,Fundraising"
```

### Send Statements (Production)

Actually send emails by adding the `--send-emails` flag:

```bash
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30 \
  --send-emails
```

**Important:** Always run in dry-run mode first to verify the output before sending emails.

## Command-Line Options

| Option | Description |
|--------|-------------|
| `--config PATH` | Path to configuration file (default: `config.json`) |
| `--from-date YYYY-MM-DD` | Start date for statements (default: first day of previous month) |
| `--to-date YYYY-MM-DD` | End date for statements (default: last day of previous month) |
| `--departments LIST` | Comma-separated list of departments to process (case-insensitive) |
| `--list-departments` | List all available departments and exit |
| `--send-emails` | Actually send emails (default is dry-run mode) |

## Statement Format

Generated CSV statements include the following columns:

1. **Invoice Date** - Date of the invoice (YYYY-MM-DD)
2. **Vendor Name** - Name of the vendor/payee
3. **Invoice Number** - Invoice number from Bill.com
4. **Due Date** - Payment due date
5. **Amount (USD)** - Total invoice amount in USD
6. **Paid Amount (USD)** - Amount paid so far
7. **Payment Status** - PAID, UNPAID, PARTIALLY_PAID, or SCHEDULED
8. **Approval Status** - APPROVED, ASSIGNED, UNASSIGNED, or DENIED
9. **GL Account** - General ledger account number
10. **GL Account Name** - Description of the GL account

### Filename Format

Statements are saved with the following pattern:
```
Bill-{department}-{from_date}-{to_date}.csv
```

Example: `Bill-Infrastructure-2024-11-01-2024-11-30.csv`

## Department Filtering

Departments are loaded from `packages/shared-utils/src/AccountGroups.json`. Only departments meeting these criteria are included:

- `groupType` is "Departmental"
- `groupEmail` field is present and not empty
- Group name is not "All" or "Other"

Bills are assigned to departments based on their GL account classification. Each department has configured `groupRanges` that define which GL account numbers belong to that department.

**Example:** If the Infrastructure department has ranges `[{"start": "6400", "end": "6499"}]`, then any bill classified to GL account 6450 would be included in the Infrastructure statement.

## Email Behavior

### Dry-Run Mode (Default)

When running without `--send-emails`:
- Statements are generated and saved to the output directory
- Log messages indicate what emails would be sent
- No actual emails are sent
- No summary report is sent

### Production Mode (`--send-emails`)

When running with `--send-emails`:
- Statements are generated and saved (for departments with activity)
- Emails are sent to all department contacts: with CSV attachment when there is activity, or without attachment (no-activity notice) when there is none
- Summary report is sent to treasurer (if enabled in config)
- All actions are logged

### Departments with No Activity

All departments receive an email each month. When a department has no bills in the date range:
- No CSV file is generated
- An email is sent without attachment stating that no activity occurred
- Uses the `no_activity_subject` and `no_activity_body` templates from config
- Logged as "Sent (no activity)" in the summary report

## Logging

Logs are written to both the console and a rotating log file:

- **Console**: Real-time output to stdout
- **File**: Rotating daily logs with configurable retention
- **Location**: Specified in `config.logging.log_dir`
- **Retention**: Old logs are automatically deleted after `retention_days`

Example log output:
```
2024-11-15 10:30:00 - __main__ - INFO - Starting Bill.com statement distribution process
2024-11-15 10:30:00 - __main__ - INFO - Running in DRY RUN mode - emails will not be sent
2024-11-15 10:30:00 - __main__ - INFO - Processing statements for 2024-11-01 to 2024-11-30
2024-11-15 10:30:01 - __main__ - INFO - Processing department: Infrastructure
2024-11-15 10:30:01 - __main__ - INFO - Generated statement with 45 bills: ./bill_statements/Bill-Infrastructure-2024-11-01-2024-11-30.csv
2024-11-15 10:30:01 - __main__ - INFO - [DRY RUN] Would send email to infrastructure@apache.org with attachment Bill-Infrastructure-2024-11-01-2024-11-30.csv
```

## Troubleshooting

### Database Not Found

**Error:** `Database file not found: ../../packages/bill-db/bill-db.db`

**Solution:** Ensure the bill-db database exists and the `database_path` in `config.json` is correct.

### No Departments Found

**Error:** `No departments configured with email addresses`

**Solution:** Verify that `AccountGroups.json` exists at `../../packages/shared-utils/src/AccountGroups.json` and contains departments with `groupEmail` fields.

### SMTP Authentication Failed

**Error:** `Failed to send email: [SMTP Auth Error]`

**Solution:** 
- Verify SMTP credentials in `config.json`
- Use the `SMTP_PASSWORD` environment variable for sensitive passwords
- Check that your SMTP server allows connections from your IP

### Empty Statements

**Issue:** Some departments show 0 bills (they will receive a no-activity email)

**Possible Causes:**
- No bills with invoice dates in the specified range for that department
- Bills are not classified with GL accounts in the department's ranges
- Bills exist but are not classified (missing `bills_classifications` records)

**Solution:** Check the bill-db database to verify bills exist and are properly classified.

## Comparison with Ramp Statement Distributor

| Feature | Bill.com | Ramp |
|---------|----------|------|
| **Data Source** | `bill-db.db` (bills table) | `ramp-db.db` (transactions table) |
| **Date Field** | `invoiceDate` | `accounting_date` |
| **GL Classification** | `bills_classifications` → `chartOfAccountId` | `transactions_line_items_accounting_field_selections` |
| **CSV Columns** | Vendor, Invoice #, Due Date, Amount, Paid, Status | User, Card, Merchant, Amount, GL Account |
| **Default Retention** | 90 days | 30 days |
| **Shared Code** | Uses `distributors/shared` utilities | Uses `distributors/shared` utilities |

Both distributors share common functionality through the `distributors/shared` package, including email sending, logging, department management, and formatting utilities.

## Architecture

The Bill.com Statement Distributor follows the same architecture as the Ramp Statement Distributor:

```
bill-statement-distributor/
├── bill_statement_distributor.py  # Main script (~450 lines)
├── config.json                     # Configuration (not in repo)
├── config.example.json             # Configuration template
├── requirements.txt                # Dependencies (stdlib only)
├── setup.sh                        # Setup script
├── .python-version                 # Removed - using /distributors/.python-version
└── README.md                       # This file

Shared utilities (reused from ../shared/):
- email_sender.py       # SMTP email with attachments
- logging_config.py     # Logging setup
- department_manager.py # Department loading/filtering
- account_groups.py     # GL account range checking
- date_utils.py         # Date parsing and formatting
- formatters.py         # Amount and date formatting
- statistics.py         # Statistics tracking
```

## Development

### Testing

Always test in dry-run mode first:

```bash
# Test with a single department
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30 \
  --departments Infrastructure

# Verify the generated CSV
cat bill_statements/Bill-Infrastructure-2024-11-01-2024-11-30.csv

# If output looks good, send emails
python3 bill_statement_distributor.py --config config.json \
  --from-date 2024-11-01 --to-date 2024-11-30 \
  --departments Infrastructure \
  --send-emails
```

### Adding New Shared Utilities

To add functionality that could be reused by other distributors:

1. Add the utility to `distributors/shared/`
2. Import and use it in `bill_statement_distributor.py`
3. Update the ramp-statement-distributor to use the same utility
4. Document the shared utility in this README

## License

Apache License 2.0 - See the Apache Software Foundation for details.

## Support

For questions or issues:
- Email: treasurer@apache.org
- Review logs in `./logs/bill_statement_distributor.log`
- Check the bill-db database for data issues

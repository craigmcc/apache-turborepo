# Ramp Statement Distributor

A Python tool for the Apache Software Foundation Treasury that automates the process of generating and distributing Ramp credit card activity statements to departments.

## Overview

This tool:
1. Loads department list from the shared `AccountGroups.json` configuration
2. Queries the ramp database directly to generate credit card statements for each department
3. Saves the statements as CSV files locally
4. Distributes the statements via email to the appropriate department contacts

## Prerequisites

- [pyenv](https://github.com/pyenv/pyenv) - Python version management
- Python 3.14+ (managed via pyenv - version defined at `/distributors/.python-version`)
- Access to the ramp database file at `packages/ramp-db/ramp-db.db`
- Access to an SMTP server for sending emails

## Installation

### Quick Setup (Recommended)

Run the automated setup script:

```bash
cd distributors/ramp-statement-distributor
./setup.sh
```

This script will:
- Check for pyenv installation
- Install Python 3.14.0 if needed (version managed at `/distributors/.python-version`)
- Create a virtual environment
- Install all dependencies

### Manual Setup

If you prefer to set up manually:

#### 1. Install pyenv (if not already installed)

On macOS:
```bash
brew install pyenv
```

On Linux:
```bash
curl https://pyenv.run | bash
```

Add pyenv to your shell configuration (e.g., `~/.bashrc` or `~/.zshrc`):
```bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

### 2. Install Python 3.14 and set up the environment

```bash
cd distributors/ramp-statement-distributor

# Install Python 3.14 (pyenv will use ../.python-version file)
pyenv install 3.14.0

# Verify the correct Python version is active
python --version  # Should show Python 3.14.0
```

### 3. Create and activate a virtual environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
# .venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Create your configuration file

```bash
cp config.example.json config.json
```

### 6. Edit configuration

Edit `config.json` with your specific settings (see Configuration section below).

## Configuration

The `config.json` file contains all the settings for the tool:

### Database Settings

- `database_path`: Path to the ramp-db.db SQLite database (default: `../../packages/ramp-db/ramp-db.db`)

### Output Settings

- `output_dir`: Directory where CSV statements will be saved (default: `./ramp_statements`)

### Logging Settings

The tool supports both console and file-based logging with automatic daily rotation.

Configure logging in `config.json`:

```json
{
  "logging": {
    "log_dir": "./logs",
    "log_file": "ramp_statement_distributor.log",
    "retention_days": 30,
    "log_level": "INFO"
  }
}
```

**Settings:**
- `log_dir`: Directory where log files are stored (default: `./logs`)
- `log_file`: Name of the current log file (default: `ramp_statement_distributor.log`)
- `retention_days`: Number of days to keep old logs (default: 30)
- `log_level`: One of DEBUG, INFO, WARNING, ERROR (default: INFO)

**Log Files:**
- **Current log**: `logs/ramp_statement_distributor.log` - Contains all log messages from the current and previous runs until midnight rotation
- **Rotated logs**: `logs/ramp_statement_distributor.log.YYYY-MM-DD` - Previous days' logs are automatically renamed with a date suffix
- **Rotation**: Daily at midnight
- **Retention**: Automatically deletes logs older than configured days (default: 30)

**Log Output:**

Logs are written to both:
1. **Console (stdout)**: For immediate feedback and monitoring
2. **Log file**: For persistence and historical review

Example log entry:
```
2026-01-07 22:30:15,123 - __main__ - INFO - Processing department: Infrastructure
```

### Department Configuration

Departments are automatically loaded from `packages/shared-utils/src/AccountGroups.json`. 
Each department must have:
- `groupName`: The department name
- `groupType`: Set to "Departmental"
- `groupEmail`: Email address for statement distribution

Only departments with a `groupEmail` field will receive statements. Departments without 
email addresses will be skipped with a warning in the logs.

To add email addresses, edit `AccountGroups.json` and add the `groupEmail` field:

```json
{
  "groupName": "Infrastructure",
  "groupType": "Departmental",
  "groupEmail": "infrastructure@apache.org",
  "groupRanges": [
    { "start": "6400", "end": "6499" }
  ]
}
```

### SMTP Settings

Configure your email server settings:

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "use_tls": true,
  "from_address": "treasurer@apache.org",
  "username": "treasurer@apache.org",
  "password": "your-smtp-password-here"
}
```

**Environment Variable Support**: The SMTP password can be provided via the `SMTP_PASSWORD` environment variable instead of storing it in the config file. This is the recommended approach for production deployments:

```bash
export SMTP_PASSWORD="your-smtp-password-here"
python ramp_statement_distributor.py
```

The tool checks for the password in this order:
1. `smtp.password` in `config.json`
2. `SMTP_PASSWORD` environment variable (fallback)

If using the environment variable, you can omit the `password` field from config.json or leave it empty.

### Email Template

Customize the email subject and body for both standard statements and no-activity notices:

```json
{
  "subject": "Ramp Credit Card Activity - {department} - {from_date} to {to_date}",
  "body": "Dear {department} Team,\n\n...",
  "no_activity_subject": "Ramp Credit Card Activity - {department} - {from_date} to {to_date} (No Activity)",
  "no_activity_body": "Dear {department} Team,\n\nThis is to confirm that no Ramp credit card activity occurred..."
}
```

Available placeholders:
- `{department}`: Department name
- `{from_date}`: Start date (YYYY-MM-DD)
- `{to_date}`: End date (YYYY-MM-DD)

**Behavior:** All departments receive an email each month. Departments with transactions get the standard email with CSV attachment. Departments with no transactions get `no_activity_subject` and `no_activity_body` (no attachment). If `no_activity_subject` or `no_activity_body` is missing, fallback text is used.

**Note:** The `{month}` placeholder has been removed. Use `{from_date}` and `{to_date}` for explicit date ranges that work with any time period (monthly, multi-month, or ad-hoc ranges).

### Summary Report

The tool automatically sends a summary report after each execution (except in dry-run mode):

```json
{
  "summary_report": {
    "enabled": true,
    "recipient": "treasurer@apache.org"
  }
}
```

- `enabled`: Whether to send summary reports (default: `true`)
- `recipient`: Email address to receive summary reports (default: `treasurer@apache.org`)

The summary report includes:
- Date range processed
- Total departments processed
- Count of successes and failures
- List of departments processed
- List of any failures

**Note:** Summary reports are not sent in dry-run mode.

## Usage

**Note:** Always activate the virtual environment before running the tool:
```bash
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows
```

When you're done, deactivate the virtual environment:
```bash
deactivate
```

### Getting Help

Running without arguments displays the help message:

```bash
python ramp_statement_distributor.py
```

### Basic Usage (Previous Month)

By default, the tool processes the previous month's data in **dry-run mode** (emails are not sent):

```bash
python ramp_statement_distributor.py --from-date 2024-12-01 --to-date 2024-12-31
```

To use a custom configuration file:

```bash
python ramp_statement_distributor.py --config /path/to/custom-config.json --from-date 2024-12-01 --to-date 2024-12-31
```

### Specify a Date Range

To process a specific date range:

```bash
# Single month
python ramp_statement_distributor.py --from-date 2024-11-01 --to-date 2024-11-30

# Multiple months (quarterly)
python ramp_statement_distributor.py --from-date 2024-10-01 --to-date 2024-12-31

# Full year
python ramp_statement_distributor.py --from-date 2024-01-01 --to-date 2024-12-31

# Custom date range (mid-month to mid-month)
python ramp_statement_distributor.py --from-date 2024-10-15 --to-date 2024-12-15
```

**Output:**
- All transactions within the date range are included in a single CSV file per department
- Format: `Ramp-Infrastructure-2024-10-01-2024-12-31.csv`
- One email per department

### Filter by Department

To process only specific departments instead of all departments:

```bash
# Single department
python ramp_statement_distributor.py --departments Infrastructure

# Multiple departments (comma-separated)
python ramp_statement_distributor.py --departments Infrastructure,Marketing,Security
```

**Notes:**
- Department names are case-insensitive
- Invalid department names show a warning but don't stop execution
- If no valid departments are found, the tool exits with an error
- Can be combined with date filters and dry-run mode

### List Available Departments

To see all available departments that can be used with the `--departments` filter:

```bash
python ramp_statement_distributor.py --list-departments
```

This will display all departments that have email addresses configured and exit without processing any statements.

**Example output:**
```
Available departments (10):
  Board
  Brand
  Conferences
  Fundraising
  Infrastructure
  Marketing
  Security
  TAC
  Tooling
  Treasury
```

**Note:** This command exits immediately after displaying the list, regardless of other arguments provided.

### Default Behavior (Dry Run)

By default, the tool runs in dry-run mode: statements are generated but emails are **not** sent. This is a safety feature to prevent accidental emails.

```bash
# Dry-run: generates CSVs but doesn't send emails
python ramp_statement_distributor.py --from-date 2024-11-01 --to-date 2024-11-30
```

### Sending Emails

To actually send emails, you must explicitly use the `--send-emails` flag:

```bash
# Actually send emails
python ramp_statement_distributor.py --from-date 2024-11-01 --to-date 2024-11-30 --send-emails
```

### Full Options

Filter departments with date range (dry-run):
```bash
python ramp_statement_distributor.py --departments Infrastructure,Security --from-date 2024-11-01 --to-date 2024-11-30
```

Filter departments with full year and send emails:
```bash
python ramp_statement_distributor.py --departments Marketing --from-date 2024-01-01 --to-date 2024-12-31 --send-emails
```

## Automation with Cron

To run this tool automatically on the first day of each month:

1. Make the script executable:

```bash
chmod +x ramp_statement_distributor.py
```

2. Add a cron job (run `crontab -e`):

```cron
# Run on the 1st of each month at 9:00 AM
0 9 1 * * cd /path/to/distributors/ramp-statement-distributor && source .venv/bin/activate && python ramp_statement_distributor.py --send-emails >> /var/log/ramp-statement-distributor.log 2>&1
```

**Note:** The `--send-emails` flag is required for the cron job to actually send emails.

**Note:** The cron job activates the virtual environment before running the script to ensure all dependencies are available.

## Output

The tool creates:

1. **CSV Files**: Saved in the `output_dir` directory with the format:
   ```
   Ramp-{account_group}-{from_date}-{to_date}.csv
   ```
   
   Examples:
   - `Ramp-Infrastructure-2024-10-01-2024-10-31.csv`
   - `Ramp-Infrastructure-2024-01-01-2024-12-31.csv`

2. **Logs**: Detailed logging to stdout showing:
   - Statement generation progress for each department
   - Email sending status
   - Summary of successes and failures

3. **Summary Report**: A summary email sent to the configured recipient (default: treasurer@apache.org) showing:
   - Processing statistics
   - Success/failure counts
   - List of departments processed

## Error Handling

The tool includes robust error handling:

- Database query failures are logged, and the process continues with the next department
- Email sending failures are logged, and the process continues
- Final summary shows the count of successful and failed operations
- Exit code 0 indicates all departments processed successfully
- Exit code 1 indicates one or more failures occurred

## Troubleshooting

### Database Connection Issues

If you see errors connecting to the database:

1. Verify the database file exists at the specified path
2. Ensure the database is up to date by running `ramp-refresh`
3. Check file permissions allow read access
4. Use absolute path if relative path isn't working

### Email Sending Issues

If emails fail to send:

1. Verify your SMTP credentials are correct
2. Check firewall settings allow outbound SMTP connections
3. Test without `--send-emails` to ensure statement generation works independently

### Account Group Not Found

If you receive empty CSV files or errors:

1. Department names are loaded from `packages/shared-utils/src/AccountGroups.json`
2. Verify the `groupName` values match exactly with what Ramp expects
3. Use the `ramp-lookup` web interface to see available account groups
4. Check the date range has data for that account group

### No Departments Loaded

If the tool says "No departments configured with email addresses":

1. Check that departments in `packages/shared-utils/src/AccountGroups.json` have a `groupEmail` field
2. Verify `groupType` is set to "Departmental"
3. Check logs for warnings about missing email addresses
4. At least one department must have a `groupEmail` configured

## Security Considerations

1. **Credentials**: Use the `SMTP_PASSWORD` environment variable instead of storing the password in config.json. This prevents credentials from being committed to version control.
2. **File Permissions**: Restrict access to `config.json`, the database file, and the `statements` directory:
   ```bash
   chmod 600 config.json
   chmod 600 ../../packages/ramp-db/ramp-db.db
   chmod 700 statements/
   ```
3. **TLS**: Always use `use_tls: true` for SMTP connections


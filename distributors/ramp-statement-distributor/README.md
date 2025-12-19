# Statement Distributor

A Python tool for the Apache Software Foundation Treasury that automates the monthly process of generating and distributing credit card activity statements to departments.

## Overview

This tool:
1. Loads department list from the shared `AccountGroups.json` configuration
2. Calls the `ramp-lookup` API to download monthly credit card statements for each department
3. Saves the statements as CSV files locally
4. Distributes the statements via email to the appropriate department contacts

## Prerequisites

- [pyenv](https://github.com/pyenv/pyenv) - Python version management
- Python 3.11+ (managed via pyenv)
- The `ramp-lookup` service running (default: `http://localhost:3000`)
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
- Install Python 3.11.0 if needed
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

### 2. Install Python 3.11 and set up the environment

```bash
cd distributors/ramp-statement-distributor

# Install Python 3.11 (pyenv will use .python-version file)
pyenv install 3.11.0

# Verify the correct Python version is active
python --version  # Should show Python 3.11.0
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

### API Settings

- `api_base_url`: URL of the ramp-lookup service (default: `http://localhost:3000`)
- `output_dir`: Directory where CSV statements will be saved (default: `./statements`)

### Department Emails

The tool automatically loads departments from `packages/shared-utils/src/AccountGroups.json`. You only need to provide email mappings in the `department_emails` object:

```json
{
  "department_emails": {
    "Board": "board@apache.org",
    "Infrastructure": "infrastructure@apache.org",
    "Marketing": "marketing@apache.org"
  }
}
```

- Keys must match the `groupName` values from `AccountGroups.json`
- Only departments of type "Departmental" are processed (excludes "All", "Other", and ledger accounts)
- Departments without an email mapping will be skipped with a warning

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

**Security Note**: For production use, consider using environment variables for sensitive credentials instead of storing them in the config file:

```python
# Example: Reading password from environment
import os
password = os.environ.get('SMTP_PASSWORD')
```

### Email Template

Customize the email subject and body:

```json
{
  "subject": "Monthly Credit Card Statement - {department} - {month}",
  "body": "Dear {department} Team,\n\n..."
}
```

Available placeholders:
- `{department}`: Department name
- `{month}`: Month in "January 2024" format
- `{from_date}`: Start date (YYYY-MM-DD)
- `{to_date}`: End date (YYYY-MM-DD)

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

### Basic Usage (Previous Month)

By default, the tool processes the previous month's data:

```bash
python ramp_statement_distributor.py --config config.json
```

### Specify a Specific Month

To process a specific month:

```bash
python ramp_statement_distributor.py --config config.json --month 2024-11
```

### Custom AccountGroups.json Location

By default, the tool looks for `AccountGroups.json` at `../../packages/shared-utils/src/AccountGroups.json`. To use a different location:

```bash
python ramp_statement_distributor.py --config config.json --account-groups /path/to/AccountGroups.json
```

### Dry Run Mode

Test the tool without sending emails (statements will still be downloaded):

```bash
python ramp_statement_distributor.py --config config.json --dry-run
```

### Full Options

```bash
python ramp_statement_distributor.py --config config.json --month 2024-11 --dry-run
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
0 9 1 * * cd /path/to/distributors/ramp-statement-distributor && source .venv/bin/activate && python ramp_statement_distributor.py --config config.json >> /var/log/ramp-statement-distributor.log 2>&1
```

**Note:** The cron job activates the virtual environment before running the script to ensure all dependencies are available.

## Output

The tool creates:

1. **CSV Files**: Saved in the `output_dir` directory with the format:
   ```
   Ramp-{account_group}-{from_date}-{to_date}.csv
   ```

2. **Logs**: Detailed logging to stdout showing:
   - Download progress for each department
   - Email sending status
   - Summary of successes and failures

## Error Handling

The tool includes robust error handling:

- API connection failures are logged, and the process continues with the next department
- Email sending failures are logged, and the process continues
- Final summary shows the count of successful and failed operations
- Exit code 0 indicates all departments processed successfully
- Exit code 1 indicates one or more failures occurred

## Troubleshooting

### API Connection Issues

If you see errors connecting to the API:

1. Ensure the `ramp-lookup` service is running:
   ```bash
   cd apps/ramp-lookup
   pnpm run dev
   ```

2. Verify the `api_base_url` in your config matches the service URL

### Email Sending Issues

If emails fail to send:

1. Verify your SMTP credentials are correct
2. Check firewall settings allow outbound SMTP connections
3. Test with `--dry-run` to ensure statement downloads work independently

### Account Group Not Found

If you receive empty CSV files or errors:

1. Department names are loaded from `packages/shared-utils/src/AccountGroups.json`
2. Verify the `groupName` values match exactly with what Ramp expects
3. Use the `ramp-lookup` web interface to see available account groups
4. Check the date range has data for that account group

### No Departments Loaded

If the tool says "No departments configured with email addresses":

1. Ensure your `config.json` has a `department_emails` section
2. Keys in `department_emails` must match `groupName` values from `AccountGroups.json` exactly (case-sensitive)
3. At least one department must have an email configured

## Security Considerations

1. **Credentials**: Store sensitive credentials (SMTP password, API keys) in environment variables or a secure secrets manager
2. **File Permissions**: Restrict access to `config.json` and the `statements` directory:
   ```bash
   chmod 600 config.json
   chmod 700 statements/
   ```
3. **HTTPS**: In production, use HTTPS for the `api_base_url`
4. **TLS**: Always use `use_tls: true` for SMTP connections


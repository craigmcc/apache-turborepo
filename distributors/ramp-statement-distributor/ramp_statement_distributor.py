#!/usr/bin/env python3
"""
Apache Treasury - Monthly Credit Card Statement Distributor

This script generates monthly credit card activity statements for each department
by querying the ramp-db SQLite database directly and distributes them via email.

Usage:
    python ramp_statement_distributor.py --config config.json
    python ramp_statement_distributor.py --config config.json --month 2024-11
    python ramp_statement_distributor.py --config config.json --from-month 2024-01 --to-month 2024-12
    python ramp_statement_distributor.py --config config.json --departments Infrastructure,Marketing
    python ramp_statement_distributor.py --config config.json --list-departments
    python ramp_statement_distributor.py --config config.json --dry-run
"""

import argparse
import csv
import json
import logging
import logging.handlers
import os
import smtplib
import sqlite3
import sys
from datetime import datetime, timedelta
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def setup_logging(config_path: str) -> logging.Logger:
    """
    Set up logging with both console and rotating file handlers.
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        Configured logger instance
    """
    # Load config to get logging settings
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    log_config = config.get('logging', {})
    log_dir = Path(log_config.get('log_dir', './logs'))
    log_file = log_config.get('log_file', 'ramp_statement_distributor.log')
    retention_days = log_config.get('retention_days', 30)
    log_level = log_config.get('log_level', 'INFO')
    
    # Create log directory
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / log_file
    
    # Configure root logger
    logger = logging.getLogger(__name__)
    logger.setLevel(getattr(logging, log_level))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Rotating file handler (daily rotation at midnight)
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path,
        when='midnight',
        interval=1,
        backupCount=retention_days,
        encoding='utf-8'
    )
    file_handler.setLevel(getattr(logging, log_level))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    logger.info(f"Logging configured: console + file ({log_path})")
    logger.info(f"Log retention: {retention_days} days")
    
    return logger


# Global logger (will be initialized in main())
logger = None


class StatementDistributor:
    """Handles generation and distribution of monthly credit card statements."""

    def __init__(
        self,
        config_path: str
    ):
        """
        Initialize the distributor with configuration.

        Args:
            config_path: Path to the JSON configuration file
        """
        self.config = self._load_config(config_path)
        self.smtp_config = self.config.get('smtp', {})
        self.email_template = self.config.get('email_template', {})
        self.output_dir = Path(self.config.get('output_dir', './statements'))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Set database path from config
        database_path = self.config.get('database_path')
        if database_path:
            self.database_path = Path(database_path)
        else:
            # Default to standard location
            script_dir = Path(__file__).parent
            self.database_path = script_dir / '../../packages/ramp-db/ramp-db.db'
        
        # Verify database exists
        if not self.database_path.exists():
            logger.error(f"Database file not found: {self.database_path}")
            sys.exit(1)
        
        # Set account groups path to standard location
        script_dir = Path(__file__).parent
        self.account_groups_path = script_dir / '../../packages/shared-utils/src/AccountGroups.json'
        
        # Load departments from AccountGroups.json
        self.departments = self._load_departments(self.account_groups_path)
        
        # Summary report configuration
        self.summary_config = self.config.get('summary_report', {
            'enabled': True,
            'recipient': 'treasurer@apache.org'
        })
        
        # Initialize statistics tracking
        self.stats = {
            'total_departments': 0,
            'successful': 0,
            'failed': 0,
            'departments_processed': [],
            'departments_failed': [],
            'from_date': None,
            'to_date': None
        }

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in configuration file: {e}")
            sys.exit(1)

    def _load_departments(
        self,
        account_groups_path: Path
    ) -> List[Dict]:
        """
        Load departments from AccountGroups.json including email addresses.

        Args:
            account_groups_path: Path to the AccountGroups.json file

        Returns:
            List of department dictionaries with name, account_group, and email
        """
        try:
            with open(account_groups_path, 'r') as f:
                account_groups = json.load(f)
        except FileNotFoundError:
            logger.error(f"AccountGroups.json not found: {account_groups_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in AccountGroups.json: {e}")
            sys.exit(1)

        departments = []
        excluded_groups = {'All', 'Other'}  # Groups to exclude
        
        for group in account_groups:
            group_name = group.get('groupName')
            group_type = group.get('groupType')
            group_email = group.get('groupEmail')
            
            # Only include Departmental type groups with email, excluding special ones
            if group_type == 'Departmental' and group_name not in excluded_groups and group_email:
                departments.append({
                    'name': group_name,
                    'account_group': group_name,
                    'email': group_email
                })
        
        if not departments:
            logger.error(
                "No departments configured with email addresses. "
                "Check that departments in AccountGroups.json have 'groupEmail' field."
            )
            sys.exit(1)
        
        logger.info(f"Loaded {len(departments)} departments from AccountGroups.json")
        return departments

    def _filter_departments(self, department_filter: Optional[str]) -> List[Dict]:
        """
        Filter departments based on user-specified filter.
        
        Args:
            department_filter: Comma-separated list of department names (case-insensitive)
            
        Returns:
            Filtered list of departments
        """
        if not department_filter:
            # No filter specified, return all departments
            return self.departments
        
        # Parse the comma-separated list
        requested_depts = [dept.strip() for dept in department_filter.split(',')]
        
        # Create case-insensitive lookup
        dept_lookup = {dept['name'].lower(): dept for dept in self.departments}
        
        filtered = []
        for requested in requested_depts:
            requested_lower = requested.lower()
            
            if requested_lower in dept_lookup:
                filtered.append(dept_lookup[requested_lower])
                logger.info(f"Department filter: including '{dept_lookup[requested_lower]['name']}'")
            else:
                # Show available departments for helpful error message
                available = ', '.join([d['name'] for d in self.departments])
                logger.warning(
                    f"Department '{requested}' not found or has no email configured. "
                    f"Available departments: {available}"
                )
        
        if not filtered:
            logger.error(
                "No valid departments matched the filter. "
                "Please check department names and ensure they have email addresses configured."
            )
            sys.exit(1)
        
        logger.info(f"Filtering to {len(filtered)} department(s) out of {len(self.departments)} total")
        return filtered

    def list_departments(self) -> None:
        """
        List all available departments and exit.
        
        Displays department names in alphabetical order with count.
        """
        if not self.departments:
            print("No departments found with configured email addresses.")
            print("Check that departments in AccountGroups.json have 'groupEmail' field.")
            sys.exit(1)
        
        # Sort departments alphabetically by name
        sorted_depts = sorted(self.departments, key=lambda d: d['name'])
        
        print(f"Available departments ({len(sorted_depts)}):")
        for dept in sorted_depts:
            print(f"  {dept['name']}")
        
        sys.exit(0)

    def _parse_month(self, month_str: str) -> datetime:
        """
        Parse a month string in YYYY-MM format.

        Args:
            month_str: Month in YYYY-MM format

        Returns:
            datetime object set to the first day of the month
        """
        try:
            year, month_num = map(int, month_str.split('-'))
            return datetime(year, month_num, 1)
        except ValueError:
            logger.error(f"Invalid month format: {month_str}. Use YYYY-MM")
            sys.exit(1)

    def _get_month_range(
        self,
        from_month: Optional[str] = None,
        to_month: Optional[str] = None
    ) -> List[tuple[str, str]]:
        """
        Generate a list of (from_date, to_date) tuples for each month in the range.

        Args:
            from_month: Start month in YYYY-MM format (inclusive)
            to_month: End month in YYYY-MM format (inclusive)

        Returns:
            List of tuples, each containing (from_date, to_date) in YYYY-MM-DD format
        """
        # Determine start month
        if from_month:
            start_date = self._parse_month(from_month)
        else:
            # Default to previous month
            today = datetime.now()
            start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)

        # Determine end month
        if to_month:
            end_date = self._parse_month(to_month)
        else:
            # Default to same as start month
            end_date = start_date

        # Validate that from_month is not after to_month
        if start_date > end_date:
            logger.error(
                f"Invalid month range: from_month ({from_month}) is after to_month ({to_month})"
            )
            sys.exit(1)

        # Generate list of months
        month_ranges = []
        current = start_date

        while current <= end_date:
            # Calculate last day of current month
            next_month = current.replace(day=28) + timedelta(days=4)
            last_day = next_month - timedelta(days=next_month.day)

            from_date = current.strftime('%Y-%m-%d')
            to_date = last_day.strftime('%Y-%m-%d')

            month_ranges.append((from_date, to_date))

            # Move to next month
            current = next_month.replace(day=1)

        return month_ranges

    def _load_account_group_ranges(self, account_group: str) -> List[Dict[str, str]]:
        """Load account code ranges for a specific account group."""
        with open(self.account_groups_path, 'r') as f:
            account_groups = json.load(f)
        
        for group in account_groups:
            if group.get('groupName') == account_group:
                return group.get('groupRanges', [])
        return []

    def _is_account_in_group(self, gl_account: str, account_group: str) -> bool:
        """Check if GL account code falls within account group ranges."""
        if not gl_account:
            return False
        
        ranges = self._load_account_group_ranges(account_group)
        for range_obj in ranges:
            start = range_obj.get('start', '')
            end = range_obj.get('end', '')
            if start <= gl_account <= end:
                return True
        return False

    def _format_accounting_date(self, date_str: Optional[str]) -> str:
        """Format accounting date for display."""
        if not date_str:
            return ''
        # Convert ISO format to readable format
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except:
            return date_str

    def _format_amount(self, amount_cents: Optional[int], currency: Optional[str]) -> str:
        """Format amount in cents to dollar string."""
        if amount_cents is None:
            return '$0.00'
        dollars = amount_cents / 100.0
        return f"${dollars:,.2f}"

    def query_transactions(
        self,
        account_group: str,
        from_date: str,
        to_date: str
    ) -> List[Dict]:
        """
        Query transactions directly from the database.
        
        Args:
            account_group: The department/account group name
            from_date: Start date in YYYY-MM-DD format
            to_date: End date in YYYY-MM-DD format
            
        Returns:
            List of transaction dictionaries
        """
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        # Query with joins to get related data
        # Note: GL accounts are stored in line item accounting field selections, not transaction-level selections
        query = """
        SELECT 
            t.accounting_date,
            u.first_name || ' ' || u.last_name as user_name,
            c.display_name as card_name,
            c.last_four,
            t.original_transaction_amount_amt,
            t.original_transaction_amount_cc,
            t.amount_amt,
            t.amount_cc,
            t.merchant_name,
            t.state,
            tliafs.external_code as gl_account
        FROM transactions t
        LEFT JOIN cards c ON t.card_id = c.id
        LEFT JOIN users u ON t.card_holder_user_id = u.id
        LEFT JOIN transactions_line_items tli ON t.id = tli.transaction_id
        LEFT JOIN transactions_line_items_accounting_field_selections tliafs 
            ON t.id = tliafs.transaction_id 
            AND tli.index_line_item = tliafs.index_line_item
            AND tliafs.category_info_type = 'GL_ACCOUNT'
        WHERE t.accounting_date >= ? AND t.accounting_date <= ?
        ORDER BY tliafs.external_code, t.accounting_date
        """
        
        from_datetime = from_date + "T00:00:00.000Z"
        to_datetime = to_date + "T23:59:59.999Z"
        
        cursor.execute(query, (from_datetime, to_datetime))
        rows = cursor.fetchall()
        conn.close()
        
        # Filter by account group
        filtered_rows = [
            dict(row) for row in rows 
            if self._is_account_in_group(row['gl_account'] or '', account_group)
        ]
        
        return filtered_rows

    def generate_csv_from_transactions(
        self,
        transactions: List[Dict],
        output_path: Path
    ) -> None:
        """Generate CSV file from transaction data."""
        with open(output_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write header
            writer.writerow([
                "Accounting Date-Time", "User Name", "Card Name", "Last 4",
                "Original Amount", "Settled Amount", "Merchant", "GL Account", "State"
            ])
            
            # Write data rows
            for t in transactions:
                writer.writerow([
                    self._format_accounting_date(t['accounting_date']),
                    t['user_name'] or '',
                    t['card_name'] or '',
                    t['last_four'] or '',
                    self._format_amount(t['original_transaction_amount_amt'], t['original_transaction_amount_cc']),
                    self._format_amount(t['amount_amt'], t['amount_cc']),
                    t['merchant_name'] or '',
                    t['gl_account'] or '',
                    t['state'] or ''
                ])

    def generate_statement(
        self,
        account_group: str,
        from_date: str,
        to_date: str
    ) -> Optional[Path]:
        """
        Generate a credit card statement from the database.

        Args:
            account_group: The department/account group name
            from_date: Start date in YYYY-MM-DD format
            to_date: End date in YYYY-MM-DD format

        Returns:
            Path to the generated CSV file, or None if generation failed
        """
        logger.info(
            f"Generating statement for {account_group} "
            f"from {from_date} to {to_date}"
        )

        try:
            # Query transactions from database
            transactions = self.query_transactions(account_group, from_date, to_date)

            # Generate CSV file
            filename = f"Ramp-{account_group}-{from_date}-{to_date}.csv"
            file_path = self.output_dir / filename

            self.generate_csv_from_transactions(transactions, file_path)

            logger.info(f"Generated statement with {len(transactions)} transactions: {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Failed to generate statement for {account_group}: {e}")
            return None

    def generate_summary_report(self) -> str:
        """
        Generate a summary report of the execution.
        
        Returns:
            str: Summary report text
        """
        total = self.stats['total_departments']
        successful = self.stats['successful']
        failed = self.stats['failed']
        from_date = self.stats['from_date']
        to_date = self.stats['to_date']
        
        report = []
        report.append("Ramp Statement Distributor - Execution Summary")
        report.append("=" * 50)
        report.append("")
        report.append(f"Date Range: {from_date} to {to_date}")
        report.append(f"Total Departments: {total}")
        report.append(f"Successful: {successful}")
        report.append(f"Failed: {failed}")
        report.append("")
        
        if self.stats['departments_processed']:
            report.append("Departments Processed Successfully:")
            for dept in self.stats['departments_processed']:
                report.append(f"  - {dept}")
            report.append("")
        
        if self.stats['departments_failed']:
            report.append("Departments Failed:")
            for dept in self.stats['departments_failed']:
                report.append(f"  - {dept}")
            report.append("")
        
        if failed > 0:
            report.append("Status: COMPLETED WITH ERRORS")
        else:
            report.append("Status: COMPLETED SUCCESSFULLY")
        
        return "\n".join(report)

    def send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        attachment_path: Optional[Path] = None,
        dry_run: bool = False
    ) -> bool:
        """
        Send an email with optional attachment.

        Args:
            recipient: Email address of the recipient
            subject: Email subject
            body: Email body text
            attachment_path: Optional path to the CSV file to attach
            dry_run: If True, don't actually send the email

        Returns:
            True if email was sent successfully, False otherwise
        """
        if dry_run:
            attachment_msg = f"with attachment {attachment_path.name}" if attachment_path else "without attachment"
            logger.info(
                f"[DRY RUN] Would send email to {recipient} {attachment_msg}"
            )
            return True

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config.get('from_address')
            msg['To'] = recipient
            msg['Subject'] = subject

            # Add body
            msg.attach(MIMEText(body, 'plain'))

            # Add attachment if provided
            if attachment_path:
                with open(attachment_path, 'rb') as f:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(f.read())

                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename={attachment_path.name}'
                )
                msg.attach(part)

            # Send email
            smtp_host = self.smtp_config.get('host', 'localhost')
            smtp_port = self.smtp_config.get('port', 587)
            use_tls = self.smtp_config.get('use_tls', True)
            username = self.smtp_config.get('username')
            password = self.smtp_config.get('password')

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                if use_tls:
                    server.starttls()
                if username and password:
                    server.login(username, password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {recipient}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            return False

    def process_department(
        self,
        department: Dict,
        from_date: str,
        to_date: str,
        dry_run: bool = False
    ) -> bool:
        """
        Process a single department: download statement and send email.

        Args:
            department: Department configuration dictionary
            from_date: Start date for the statement
            to_date: End date for the statement
            dry_run: If True, don't send actual emails

        Returns:
            True if processing was successful, False otherwise
        """
        account_group = department.get('account_group')
        email = department.get('email')
        name = department.get('name', account_group)

        if not account_group or not email:
            logger.error(
                f"Invalid department configuration: {department}"
            )
            return False

        logger.info(f"Processing department: {name}")
        
        # Track date range for summary (first department sets the range)
        if self.stats['from_date'] is None:
            self.stats['from_date'] = from_date
            self.stats['to_date'] = to_date

        # Generate statement
        statement_path = self.generate_statement(
            account_group,
            from_date,
            to_date
        )

        if not statement_path:
            self.stats['failed'] += 1
            self.stats['departments_failed'].append(name)
            return False

        # Prepare email
        subject = self.email_template.get('subject', '').format(
            department=name,
            from_date=from_date,
            to_date=to_date
        )

        body = self.email_template.get('body', '').format(
            department=name,
            from_date=from_date,
            to_date=to_date
        )

        # Send email
        success = self.send_email(
            email,
            subject,
            body,
            statement_path,
            dry_run
        )
        
        # Track results
        if success:
            self.stats['successful'] += 1
            self.stats['departments_processed'].append(name)
        else:
            self.stats['failed'] += 1
            self.stats['departments_failed'].append(name)

        return success

    def process_department_merged(
        self,
        department: Dict,
        month_ranges: List[Tuple[str, str]],
        overall_from_date: str,
        overall_to_date: str,
        dry_run: bool = False
    ) -> bool:
        """
        Process a department with merged transactions across multiple months.

        Args:
            department: Department configuration dictionary
            month_ranges: List of (from_date, to_date) tuples for each month
            overall_from_date: Overall start date for the merged statement
            overall_to_date: Overall end date for the merged statement
            dry_run: If True, don't send actual emails

        Returns:
            True if processing was successful, False otherwise
        """
        account_group = department.get('account_group')
        email = department.get('email')
        name = department.get('name', account_group)

        if not account_group or not email:
            logger.error(
                f"Invalid department configuration: {department}"
            )
            return False

        logger.info(f"Processing department (merged): {name}")
        
        # Track date range for summary (first department sets the range)
        if self.stats['from_date'] is None:
            self.stats['from_date'] = overall_from_date
            self.stats['to_date'] = overall_to_date

        # Collect transactions from all months
        all_transactions = []
        for from_date, to_date in month_ranges:
            logger.info(f"  Querying transactions for {name} from {from_date} to {to_date}")
            transactions = self.query_transactions(account_group, from_date, to_date)
            all_transactions.extend(transactions)
            logger.info(f"  Found {len(transactions)} transactions for this period")

        # Sort transactions by GL account, then date (matching API behavior)
        all_transactions.sort(key=lambda t: (t.get('gl_account', ''), t.get('accounting_date', '')))

        # Generate single merged CSV
        filename = f"Ramp-{name}-{overall_from_date}-{overall_to_date}.csv"
        statement_path = self.output_dir / filename

        self.generate_csv_from_transactions(all_transactions, statement_path)
        logger.info(f"Generated merged statement with {len(all_transactions)} transactions: {statement_path}")

        # Prepare email
        subject = self.email_template.get('subject', '').format(
            department=name,
            from_date=overall_from_date,
            to_date=overall_to_date
        )

        body = self.email_template.get('body', '').format(
            department=name,
            from_date=overall_from_date,
            to_date=overall_to_date
        )

        # Send email
        success = self.send_email(
            email,
            subject,
            body,
            statement_path,
            dry_run
        )
        
        # Track results
        if success:
            self.stats['successful'] += 1
            self.stats['departments_processed'].append(name)
        else:
            self.stats['failed'] += 1
            self.stats['departments_failed'].append(name)

        return success

    def send_summary_report(self) -> bool:
        """
        Send summary report email to configured recipient.
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.summary_config.get('enabled', True):
            logger.info("Summary report is disabled in configuration")
            return True
        
        recipient = self.summary_config.get('recipient', 'treasurer@apache.org')
        
        if not recipient:
            logger.warning("No recipient configured for summary report")
            return False
        
        subject = f"Ramp Statement Distribution Summary - {self.stats['from_date']} to {self.stats['to_date']}"
        body = self.generate_summary_report()
        
        logger.info(f"Sending summary report to {recipient}")
        
        try:
            success = self.send_email(recipient, subject, body)
            if success:
                logger.info(f"Summary report sent successfully to {recipient}")
            else:
                logger.error(f"Failed to send summary report to {recipient}")
            return success
        except Exception as e:
            logger.error(f"Error sending summary report: {e}")
            return False

    def run(
        self,
        from_month: Optional[str] = None,
        to_month: Optional[str] = None,
        dry_run: bool = False,
        department_filter: Optional[str] = None
    ) -> int:
        """
        Run the statement generation and distribution process.

        Args:
            from_month: Optional start month in YYYY-MM format
            to_month: Optional end month in YYYY-MM format
            dry_run: If True, download statements but don't send emails
            department_filter: Optional comma-separated list of departments to process

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("Starting statement distribution process")

        if dry_run:
            logger.info("Running in DRY RUN mode - emails will not be sent")

        # Filter departments if specified
        departments_to_process = self._filter_departments(department_filter)

        # Get month ranges
        month_ranges = self._get_month_range(from_month, to_month)

        if len(month_ranges) == 1:
            logger.info(
                f"Processing statements for {month_ranges[0][0]} to {month_ranges[0][1]}"
            )
        else:
            logger.info(
                f"Processing statements for {len(month_ranges)} months (MERGED): "
                f"{month_ranges[0][0]} to {month_ranges[-1][1]}"
            )

        # Initialize statistics
        if len(month_ranges) == 1:
            self.stats['total_departments'] = len(departments_to_process) * len(month_ranges)
        else:
            # In merge mode, one file per department regardless of month count
            self.stats['total_departments'] = len(departments_to_process)

        # Process departments based on mode
        if len(month_ranges) == 1:
            # Single month - use existing logic
            for from_date, to_date in month_ranges:
                logger.info(f"Processing month: {from_date} to {to_date}")

                for department in departments_to_process:
                    self.process_department(
                        department,
                        from_date,
                        to_date,
                        dry_run
                    )
        else:
            # Multi-month range - merge all months per department
            overall_from_date = month_ranges[0][0]
            overall_to_date = month_ranges[-1][1]
            logger.info(f"Merging {len(month_ranges)} months into single file per department")

            for department in departments_to_process:
                self.process_department_merged(
                    department,
                    month_ranges,
                    overall_from_date,
                    overall_to_date,
                    dry_run
                )

        # Log summary
        logger.info(
            f"Processing complete. "
            f"Successful: {self.stats['successful']}, "
            f"Failed: {self.stats['failed']}"
        )

        # Send summary report (skip in dry-run mode)
        if not dry_run:
            self.send_summary_report()
        else:
            logger.info("Skipping summary report in dry-run mode")

        return 0 if self.stats['failed'] == 0 else 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Generate and distribute monthly credit card statements'
    )
    parser.add_argument(
        '--config',
        required=True,
        help='Path to configuration JSON file'
    )
    parser.add_argument(
        '--departments',
        help='Comma-separated list of departments to process (case-insensitive). If not specified, all departments are processed.'
    )
    parser.add_argument(
        '--list-departments',
        action='store_true',
        help='List all available departments and exit'
    )

    # Month specification options
    month_group = parser.add_mutually_exclusive_group()
    month_group.add_argument(
        '--month',
        help='Single month to process in YYYY-MM format (default: previous month)'
    )
    month_group.add_argument(
        '--from-month',
        dest='from_month',
        help='Start month for range in YYYY-MM format (use with --to-month)'
    )
    
    parser.add_argument(
        '--to-month',
        dest='to_month',
        help='End month for range in YYYY-MM format (use with --from-month)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Download statements but do not send emails'
    )

    args = parser.parse_args()

    # Set up logging FIRST (before any log messages)
    global logger
    logger = setup_logging(args.config)

    # Create distributor to load departments
    distributor = StatementDistributor(args.config)

    # Handle --list-departments (takes precedence, exits immediately)
    if args.list_departments:
        distributor.list_departments()

    # Handle month arguments
    if args.month:
        # Single month specified
        from_month = args.month
        to_month = args.month
    elif args.from_month:
        # Range specified
        from_month = args.from_month
        to_month = args.to_month if args.to_month else args.from_month
    elif args.to_month:
        # Only to_month specified (error)
        parser.error("--to-month requires --from-month")
        sys.exit(1)
    else:
        # No month specified, use default
        from_month = None
        to_month = None

    exit_code = distributor.run(from_month, to_month, args.dry_run, args.departments)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()


#!/usr/bin/env python3
"""
Apache Treasury - Bill.com Statement Distributor

This script generates accounts payable statements for each account group
by querying the bill-db SQLite database directly and distributes them via email.

Usage:
    python bill_statement_distributor.py --config config.json
    python bill_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30
    python bill_statement_distributor.py --config config.json --from-date 2024-01-01 --to-date 2024-12-31
    python bill_statement_distributor.py --config config.json --account-groups Infrastructure,Marketing
    python bill_statement_distributor.py --config config.json --list-account-groups
    python bill_statement_distributor.py --config config.json --dry-run
"""

import argparse
import csv
import json
import os
import sqlite3
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Import shared utilities
sys.path.insert(0, str(Path(__file__).parent.parent))
from shared.logging_config import setup_logging
from shared.email_sender import send_email
from shared.account_group_manager import load_account_groups, filter_account_groups, list_account_groups
from shared.account_groups import is_account_in_group
from shared.date_utils import get_date_range
from shared.formatters import format_amount
from shared.statistics import StatisticsTracker, generate_summary_report


# Global logger (will be initialized in main())
logger = None


class BillStatementDistributor:
    """Handles generation and distribution of monthly Bill.com statements."""

    def __init__(self, config_path: str):
        """
        Initialize the distributor with configuration.

        Args:
            config_path: Path to the JSON configuration file
        """
        self.config = self._load_config(config_path)
        self.smtp_config = self.config.get('smtp', {})
        self.email_template = self.config.get('email_template', {})
        self.output_dir = Path(self.config.get('output_dir', './bill_statements'))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Set database path from config
        database_path = self.config.get('database_path')
        if database_path:
            self.database_path = Path(database_path)
        else:
            # Default to standard location
            script_dir = Path(__file__).parent
            self.database_path = script_dir / '../../packages/bill-db/bill-db.db'
        
        # Verify database exists
        if not self.database_path.exists():
            logger.error(f"Database file not found: {self.database_path}")
            sys.exit(1)
        
        # Set account groups path to standard location
        script_dir = Path(__file__).parent
        self.account_groups_path = script_dir / '../../packages/shared-utils/src/AccountGroups.json'
        
        # Load account groups from AccountGroups.json using shared utility
        self.account_groups = load_account_groups(self.account_groups_path)
        logger.info(f"Loaded {len(self.account_groups)} account groups from AccountGroups.json")
        
        # Summary report configuration
        self.summary_config = self.config.get('summary_report', {
            'enabled': True,
            'recipient': 'treasurer@apache.org'
        })
        
        # Initialize statistics tracking using shared utility
        self.stats_tracker = StatisticsTracker()

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

    def _format_date(self, date_str: Optional[str]) -> str:
        """
        Format date for display.
        
        Args:
            date_str: Date string (YYYY-MM-DD format expected from SQLite)
            
        Returns:
            Formatted date string or empty string if None
        """
        if not date_str:
            return ''
        # SQLite dates are typically YYYY-MM-DD format, which is already readable
        return date_str

    def query_bills(
        self,
        account_group: str,
        from_date: str,
        to_date: str
    ) -> List[Dict]:
        """
        Query bills directly from the database.
        
        Args:
            account_group: The account group name
            from_date: Start date in YYYY-MM-DD format
            to_date: End date in YYYY-MM-DD format
            
        Returns:
            List of bill dictionaries
        """
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        # Query with joins to get related data
        # Note: GL accounts are stored in bills_classifications, linked via chartOfAccountId
        # Bills have vendorName stored directly, so vendor join is optional
        query = """
        SELECT 
            b.invoiceDate,
            COALESCE(v.name, b.vendorName) as vendor_name,
            b.invoiceNumber,
            b.dueDate,
            b.amount,
            b.paidAmount,
            b.paymentStatus,
            b.approvalStatus,
            a.accountNumber as gl_account,
            a.name as gl_account_name
        FROM bills b
        LEFT JOIN vendors v ON b.vendorId = v.id
        LEFT JOIN bills_classifications bc ON b.id = bc.billId
        LEFT JOIN accounts a ON bc.chartOfAccountId = a.id
        WHERE b.invoiceDate >= ? AND b.invoiceDate <= ?
        ORDER BY a.accountNumber, b.invoiceDate
        """
        
        cursor.execute(query, (from_date, to_date))
        rows = cursor.fetchall()
        conn.close()
        
        # Filter by account group using shared utility
        # Note: Some bills may not have classifications, so we skip those without GL accounts
        filtered_rows = [
            dict(row) for row in rows 
            if row['gl_account'] and is_account_in_group(
                row['gl_account'],
                account_group,
                self.account_groups_path
            )
        ]
        
        return filtered_rows

    def _format_currency_amount(self, amount: Optional[float]) -> str:
        """
        Format currency amount to dollar string.
        
        Args:
            amount: Amount as float (e.g., 123.45 for $123.45)
            
        Returns:
            Formatted amount string like "$1,234.56"
        """
        if amount is None:
            return '$0.00'
        return f"${amount:,.2f}"

    def generate_csv_from_bills(
        self,
        bills: List[Dict],
        output_path: Path
    ) -> None:
        """
        Generate CSV file from bill data.
        
        Args:
            bills: List of bill dictionaries from database query
            output_path: Path where CSV should be written
        """
        with open(output_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write header
            writer.writerow([
                "Invoice Date",
                "Vendor Name",
                "Invoice Number",
                "Due Date",
                "Amount (USD)",
                "Paid Amount (USD)",
                "Payment Status",
                "Approval Status",
                "GL Account",
                "GL Account Name"
            ])
            
            # Write data rows
            for bill in bills:
                writer.writerow([
                    self._format_date(bill['invoiceDate']),
                    bill['vendor_name'] or '',
                    bill['invoiceNumber'] or '',
                    self._format_date(bill['dueDate']),
                    self._format_currency_amount(bill['amount']),
                    self._format_currency_amount(bill['paidAmount']),
                    bill['paymentStatus'] or '',
                    bill['approvalStatus'] or '',
                    bill['gl_account'] or '',
                    bill['gl_account_name'] or ''
                ])

    def generate_statement(
        self,
        account_group: str,
        from_date: str,
        to_date: str
    ) -> Optional[Path]:
        """
        Generate a Bill.com statement from the database.

        Args:
            account_group: The account group name
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
            # Query bills from database
            bills = self.query_bills(account_group, from_date, to_date)

            # Generate CSV file
            filename = f"Bill-{account_group}-{from_date}-{to_date}.csv"
            file_path = self.output_dir / filename

            self.generate_csv_from_bills(bills, file_path)

            logger.info(f"Generated statement with {len(bills)} bills: {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Failed to generate statement for {account_group}: {e}")
            return None

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
        
        stats = self.stats_tracker.get_stats()
        subject = f"Bill.com Statement Distribution Summary - {stats['from_date']} to {stats['to_date']}"
        body = generate_summary_report(stats, "Bill.com Statement Distributor")
        
        logger.info(f"Sending summary report to {recipient}")
        
        try:
            success = send_email(
                self.smtp_config,
                recipient,
                subject,
                body,
                logger=logger
            )
            if success:
                logger.info(f"Summary report sent successfully to {recipient}")
            else:
                logger.error(f"Failed to send summary report to {recipient}")
            return success
        except Exception as e:
            logger.error(f"Error sending summary report: {e}")
            return False

    def process_account_group(
        self,
        ag: Dict,
        from_date: str,
        to_date: str,
        send_emails: bool = False
    ) -> bool:
        """
        Process a single account group: generate statement and send email.

        Args:
            ag: Account group configuration dictionary
            from_date: Start date for the statement
            to_date: End date for the statement
            send_emails: If True, actually send emails; if False (default), dry-run mode

        Returns:
            True if processing was successful, False otherwise
        """
        account_group = ag.get('account_group')
        email = ag.get('email')
        name = ag.get('name', account_group or 'Unknown')

        if not account_group or not email:
            logger.error(f"Invalid account group configuration: {ag}")
            self.stats_tracker.record_failure(
                name,
                "Invalid account group configuration (missing account_group or email)"
            )
            return False

        logger.info(f"Processing account group: {name}")

        # Query bills first to check if any exist
        bills = self.query_bills(account_group, from_date, to_date)
        
        # Send no-activity email when account group has no bills
        if len(bills) == 0:
            logger.info(f"Sending no-activity email to {name}: no bills found for date range")
            no_activity_subject = self.email_template.get(
                'no_activity_subject',
                self.email_template.get('subject', '') + ' (No Activity)'
            ).format(account_group=name, from_date=from_date, to_date=to_date)
            no_activity_body = self.email_template.get(
                'no_activity_body',
                "Dear {account_group} Team,\n\nNo Bill.com activity occurred for your account group during {from_date} to {to_date}.\n\nIf you have questions, contact treasurer@apache.org.\n\nBest regards,\nApache Software Foundation Treasury"
            ).format(account_group=name, from_date=from_date, to_date=to_date)
            success = send_email(
                self.smtp_config,
                email,
                no_activity_subject,
                no_activity_body,
                attachment_path=None,
                dry_run=not send_emails,
                logger=logger
            )
            if success:
                self.stats_tracker.record_sent_no_activity(name)
            else:
                self.stats_tracker.record_failure(
                    name,
                    "Failed to send no-activity email (see logs for details)"
                )
            return success

        # Generate statement
        statement_path = self.generate_statement(
            account_group,
            from_date,
            to_date
        )

        if not statement_path:
            self.stats_tracker.record_failure(
                name,
                "Failed to generate statement (see logs for details)"
            )
            return False

        # Prepare email
        subject = self.email_template.get('subject', '').format(
            account_group=name,
            from_date=from_date,
            to_date=to_date
        )

        body = self.email_template.get('body', '').format(
            account_group=name,
            from_date=from_date,
            to_date=to_date
        )

        # Send email using shared utility (dry_run is inverse of send_emails)
        success = send_email(
            self.smtp_config,
            email,
            subject,
            body,
            statement_path,
            dry_run=not send_emails,
            logger=logger
        )
        
        # Track results
        if success:
            self.stats_tracker.record_success(name)
        else:
            self.stats_tracker.record_failure(
                name,
                "Failed to send email (see logs for details)"
            )

        return success

    def run(
        self,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        send_emails: bool = False,
        account_group_filter: Optional[str] = None
    ) -> int:
        """
        Run the statement generation and distribution process.

        Args:
            from_date: Optional start date in YYYY-MM-DD format
            to_date: Optional end date in YYYY-MM-DD format
            send_emails: If True, actually send emails; if False (default), dry-run mode
            account_group_filter: Optional comma-separated list of account groups to process

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("Starting Bill.com statement distribution process")

        if not send_emails:
            logger.info("Running in DRY RUN mode - emails will not be sent (use --send-emails to send)")

        # Filter account groups if specified using shared utility
        account_groups_to_process = filter_account_groups(self.account_groups, account_group_filter)
        if account_group_filter:
            logger.info(f"Filtering to {len(account_groups_to_process)} account group(s) out of {len(self.account_groups)} total")

        # Get date range using shared utility
        from_date_str, to_date_str = get_date_range(from_date, to_date)

        logger.info(f"Processing statements for {from_date_str} to {to_date_str}")

        # Initialize statistics
        self.stats_tracker.set_total_account_groups(len(account_groups_to_process))
        self.stats_tracker.set_date_range(from_date_str, to_date_str)

        # Process each account group
        for ag in account_groups_to_process:
            self.process_account_group(
                ag,
                from_date_str,
                to_date_str,
                send_emails
            )

        # Log summary
        stats = self.stats_tracker.get_stats()
        logger.info(
            f"Processing complete. "
            f"Successful: {stats['successful']}, "
            f"Sent (no activity): {stats.get('no_activity', 0)}, "
            f"Failed: {stats['failed']}"
        )

        # Send summary report (skip in dry-run mode)
        if send_emails:
            self.send_summary_report()
        else:
            logger.info("Skipping summary report in dry-run mode")

        return 0 if stats['failed'] == 0 else 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Generate and distribute Bill.com statements for specified date ranges'
    )
    parser.add_argument(
        '--config',
        default='config.json',
        help='Path to configuration JSON file (default: config.json)'
    )
    parser.add_argument(
        '--account-groups',
        dest='account_groups',
        help='Comma-separated list of account groups to process (case-insensitive). If not specified, all account groups are processed.'
    )
    parser.add_argument(
        '--list-account-groups',
        action='store_true',
        dest='list_account_groups',
        help='List all available account groups and exit'
    )

    # Date specification options
    parser.add_argument(
        '--from-date',
        dest='from_date',
        help='Start date in YYYY-MM-DD format (default: first day of previous month)'
    )
    parser.add_argument(
        '--to-date',
        dest='to_date',
        help='End date in YYYY-MM-DD format (default: last day of previous month)'
    )
    parser.add_argument(
        '--send-emails',
        action='store_true',
        dest='send_emails',
        help='Actually send emails (default: dry-run mode, emails are not sent)'
    )

    # Print help if no arguments provided
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    # Verify config file exists before proceeding
    if not os.path.exists(args.config):
        print(f"Error: Configuration file not found: {args.config}", file=sys.stderr)
        sys.exit(1)

    # Set up logging FIRST (before any log messages) using shared utility
    global logger
    logger = setup_logging(args.config, __name__)

    # Create distributor to load account groups
    distributor = BillStatementDistributor(args.config)

    # Handle --list-account-groups (takes precedence, exits immediately)
    if args.list_account_groups:
        list_account_groups(distributor.account_groups)

    # Validate date arguments
    if args.to_date and not args.from_date:
        parser.error("--to-date requires --from-date")
        sys.exit(1)

    exit_code = distributor.run(args.from_date, args.to_date, args.send_emails, args.account_groups)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()

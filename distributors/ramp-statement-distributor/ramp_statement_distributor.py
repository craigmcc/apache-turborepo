#!/usr/bin/env python3
"""
Apache Treasury - Credit Card Statement Distributor

This script generates credit card activity statements for each department
by querying the ramp-db SQLite database directly and distributes them via email.

Usage:
    python ramp_statement_distributor.py --config config.json
    python ramp_statement_distributor.py --config config.json --from-date 2024-11-01 --to-date 2024-11-30
    python ramp_statement_distributor.py --config config.json --from-date 2024-01-01 --to-date 2024-12-31
    python ramp_statement_distributor.py --config config.json --departments Infrastructure,Marketing
    python ramp_statement_distributor.py --config config.json --list-departments
    python ramp_statement_distributor.py --config config.json --dry-run
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
from shared.department_manager import load_departments, filter_departments, list_departments
from shared.account_groups import is_account_in_group
from shared.date_utils import get_date_range
from shared.formatters import format_accounting_date, format_amount
from shared.statistics import StatisticsTracker, generate_summary_report


# Global logger (will be initialized in main())
logger = None


class StatementDistributor:
    """Handles generation and distribution of monthly credit card statements."""

    def __init__(self, config_path: str):
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
        
        # Load departments from AccountGroups.json using shared utility
        self.departments = load_departments(self.account_groups_path)
        logger.info(f"Loaded {len(self.departments)} departments from AccountGroups.json")
        
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
        
        # Filter by account group using shared utility
        filtered_rows = [
            dict(row) for row in rows 
            if is_account_in_group(row['gl_account'] or '', account_group, self.account_groups_path)
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
            
            # Write data rows using shared formatters
            for t in transactions:
                writer.writerow([
                    format_accounting_date(t['accounting_date']),
                    t['user_name'] or '',
                    t['card_name'] or '',
                    t['last_four'] or '',
                    format_amount(t['original_transaction_amount_amt'], t['original_transaction_amount_cc']),
                    format_amount(t['amount_amt'], t['amount_cc']),
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
        subject = f"Ramp Statement Distribution Summary - {stats['from_date']} to {stats['to_date']}"
        body = generate_summary_report(stats, "Ramp Statement Distributor")
        
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

    def process_department(
        self,
        department: Dict,
        from_date: str,
        to_date: str,
        send_emails: bool = False
    ) -> bool:
        """
        Process a single department: download statement and send email.

        Args:
            department: Department configuration dictionary
            from_date: Start date for the statement
            to_date: End date for the statement
            send_emails: If True, actually send emails; if False (default), dry-run mode

        Returns:
            True if processing was successful, False otherwise
        """
        account_group = department.get('account_group')
        email = department.get('email')
        name = department.get('name', account_group or 'Unknown')

        if not account_group or not email:
            logger.error(f"Invalid department configuration: {department}")
            self.stats_tracker.record_failure(
                name,
                "Invalid department configuration (missing account_group or email)"
            )
            return False

        logger.info(f"Processing department: {name}")

        # Query transactions first to check if any exist
        transactions = self.query_transactions(account_group, from_date, to_date)
        
        # Send no-activity email when department has no transactions
        if len(transactions) == 0:
            logger.info(f"Sending no-activity email to {name}: no transactions found for date range")
            no_activity_subject = self.email_template.get(
                'no_activity_subject',
                self.email_template.get('subject', '') + ' (No Activity)'
            ).format(department=name, from_date=from_date, to_date=to_date)
            no_activity_body = self.email_template.get(
                'no_activity_body',
                "Dear {department} Team,\n\nNo Ramp credit card activity occurred for your department during {from_date} to {to_date}.\n\nIf you have questions, contact treasurer@apache.org.\n\nBest regards,\nApache Software Foundation Treasury"
            ).format(department=name, from_date=from_date, to_date=to_date)
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
            department=name,
            from_date=from_date,
            to_date=to_date
        )

        body = self.email_template.get('body', '').format(
            department=name,
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
        department_filter: Optional[str] = None
    ) -> int:
        """
        Run the statement generation and distribution process.

        Args:
            from_date: Optional start date in YYYY-MM-DD format
            to_date: Optional end date in YYYY-MM-DD format
            send_emails: If True, actually send emails; if False (default), dry-run mode
            department_filter: Optional comma-separated list of departments to process

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("Starting statement distribution process")

        if not send_emails:
            logger.info("Running in DRY RUN mode - emails will not be sent (use --send-emails to send)")

        # Filter departments if specified using shared utility
        departments_to_process = filter_departments(self.departments, department_filter)
        if department_filter:
            logger.info(f"Filtering to {len(departments_to_process)} department(s) out of {len(self.departments)} total")

        # Get date range using shared utility
        from_date_str, to_date_str = get_date_range(from_date, to_date)

        logger.info(f"Processing statements for {from_date_str} to {to_date_str}")

        # Initialize statistics
        self.stats_tracker.set_total_departments(len(departments_to_process))
        self.stats_tracker.set_date_range(from_date_str, to_date_str)

        # Process each department
        for department in departments_to_process:
            self.process_department(
                department,
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
        description='Generate and distribute credit card statements for specified date ranges'
    )
    parser.add_argument(
        '--config',
        default='config.json',
        help='Path to configuration JSON file (default: config.json)'
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

    # Create distributor to load departments
    distributor = StatementDistributor(args.config)

    # Handle --list-departments (takes precedence, exits immediately)
    if args.list_departments:
        list_departments(distributor.departments)

    # Validate date arguments
    if args.to_date and not args.from_date:
        parser.error("--to-date requires --from-date")
        sys.exit(1)

    exit_code = distributor.run(args.from_date, args.to_date, args.send_emails, args.departments)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()

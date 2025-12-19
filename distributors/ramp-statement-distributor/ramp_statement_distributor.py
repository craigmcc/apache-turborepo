#!/usr/bin/env python3
"""
Apache Treasury - Monthly Credit Card Statement Distributor

This script generates monthly credit card activity statements for each department
by calling the ramp-lookup API and distributes them via email.

Usage:
    python ramp_statement_distributor.py --config config.json
    python ramp_statement_distributor.py --config config.json --month 2024-11
    python ramp_statement_distributor.py --config config.json --from-month 2024-01 --to-month 2024-12
    python ramp_statement_distributor.py --config config.json --dry-run
"""

import argparse
import json
import logging
import os
import smtplib
import sys
from datetime import datetime, timedelta
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urljoin

import requests


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class StatementDistributor:
    """Handles generation and distribution of monthly credit card statements."""

    def __init__(self, config_path: str, account_groups_path: Optional[str] = None):
        """
        Initialize the distributor with configuration.

        Args:
            config_path: Path to the JSON configuration file
            account_groups_path: Path to AccountGroups.json (optional, defaults to shared-utils)
        """
        self.config = self._load_config(config_path)
        self.api_base_url = self.config.get('api_base_url', 'http://localhost:3000')
        self.smtp_config = self.config.get('smtp', {})
        self.email_template = self.config.get('email_template', {})
        self.output_dir = Path(self.config.get('output_dir', './statements'))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load departments from AccountGroups.json
        if account_groups_path is None:
            # Default to shared-utils location
            script_dir = Path(__file__).parent
            account_groups_path = script_dir / '../../packages/shared-utils/src/AccountGroups.json'
        
        self.departments = self._load_departments(
            account_groups_path,
            self.config.get('department_emails', {})
        )

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
        account_groups_path: Path,
        email_mapping: Dict[str, str]
    ) -> List[Dict]:
        """
        Load departments from AccountGroups.json and map to email addresses.

        Args:
            account_groups_path: Path to the AccountGroups.json file
            email_mapping: Dictionary mapping groupName to email address

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
            
            # Only include Departmental type groups, excluding special ones
            if group_type == 'Departmental' and group_name not in excluded_groups:
                email = email_mapping.get(group_name)
                
                if email:
                    departments.append({
                        'name': group_name,
                        'account_group': group_name,
                        'email': email
                    })
                else:
                    logger.warning(
                        f"No email configured for department: {group_name}. "
                        f"Skipping."
                    )
        
        if not departments:
            logger.error(
                "No departments configured with email addresses. "
                "Check your config.json department_emails section."
            )
            sys.exit(1)
        
        logger.info(f"Loaded {len(departments)} departments from AccountGroups.json")
        return departments

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

    def download_statement(
        self,
        account_group: str,
        from_date: str,
        to_date: str
    ) -> Optional[Path]:
        """
        Download a credit card statement from the API.

        Args:
            account_group: The department/account group name
            from_date: Start date in YYYY-MM-DD format
            to_date: End date in YYYY-MM-DD format

        Returns:
            Path to the downloaded CSV file, or None if download failed
        """
        # Construct the API URL using the URL class to avoid string concatenation
        api_url = urljoin(self.api_base_url, '/api/transactions.csv')
        
        params = {
            'accountGroup': account_group,
            'fromDate': from_date,
            'toDate': to_date
        }

        logger.info(
            f"Downloading statement for {account_group} "
            f"from {from_date} to {to_date}"
        )

        try:
            response = requests.get(api_url, params=params, timeout=30)
            response.raise_for_status()

            # Save the CSV file
            filename = f"Ramp-{account_group}-{from_date}-{to_date}.csv"
            file_path = self.output_dir / filename

            with open(file_path, 'wb') as f:
                f.write(response.content)

            logger.info(f"Saved statement to {file_path}")
            return file_path

        except requests.exceptions.RequestException as e:
            logger.error(
                f"Failed to download statement for {account_group}: {e}"
            )
            return None

    def send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        attachment_path: Path,
        dry_run: bool = False
    ) -> bool:
        """
        Send an email with the statement attached.

        Args:
            recipient: Email address of the recipient
            subject: Email subject
            body: Email body text
            attachment_path: Path to the CSV file to attach
            dry_run: If True, don't actually send the email

        Returns:
            True if email was sent successfully, False otherwise
        """
        if dry_run:
            logger.info(
                f"[DRY RUN] Would send email to {recipient} "
                f"with attachment {attachment_path.name}"
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

            # Add attachment
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

        # Download statement
        statement_path = self.download_statement(
            account_group,
            from_date,
            to_date
        )

        if not statement_path:
            return False

        # Prepare email
        subject = self.email_template.get('subject', '').format(
            department=name,
            month=datetime.strptime(from_date, '%Y-%m-%d').strftime('%B %Y')
        )

        body = self.email_template.get('body', '').format(
            department=name,
            month=datetime.strptime(from_date, '%Y-%m-%d').strftime('%B %Y'),
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

        return success

    def run(
        self,
        from_month: Optional[str] = None,
        to_month: Optional[str] = None,
        dry_run: bool = False
    ) -> int:
        """
        Run the statement generation and distribution process.

        Args:
            from_month: Optional start month in YYYY-MM format
            to_month: Optional end month in YYYY-MM format
            dry_run: If True, download statements but don't send emails

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("Starting statement distribution process")

        if dry_run:
            logger.info("Running in DRY RUN mode - emails will not be sent")

        # Get month ranges
        month_ranges = self._get_month_range(from_month, to_month)

        if len(month_ranges) == 1:
            logger.info(
                f"Processing statements for {month_ranges[0][0]} to {month_ranges[0][1]}"
            )
        else:
            logger.info(
                f"Processing statements for {len(month_ranges)} months: "
                f"{month_ranges[0][0]} to {month_ranges[-1][1]}"
            )

        # Process each month and department
        all_results = []
        for from_date, to_date in month_ranges:
            logger.info(f"Processing month: {from_date} to {to_date}")

            for department in self.departments:
                success = self.process_department(
                    department,
                    from_date,
                    to_date,
                    dry_run
                )
                all_results.append(success)

        # Summary
        total = len(all_results)
        successful = sum(all_results)
        failed = total - successful

        logger.info(
            f"Process completed: {successful}/{total} successful, "
            f"{failed} failed"
        )

        return 0 if failed == 0 else 1


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
        '--account-groups',
        help='Path to AccountGroups.json (default: ../../packages/shared-utils/src/AccountGroups.json)'
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

    distributor = StatementDistributor(args.config, args.account_groups)
    exit_code = distributor.run(from_month, to_month, args.dry_run)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()


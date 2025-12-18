#!/usr/bin/env python3
"""
Apache Treasury - Monthly Credit Card Statement Distributor

This script generates monthly credit card activity statements for each department
by calling the ramp-lookup API and distributes them via email.

Usage:
    python ramp_statement_distributor.py --config config.json
    python ramp_statement_distributor.py --config config.json --month 2024-11
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

    def _get_date_range(self, month: Optional[str] = None) -> tuple[str, str]:
        """
        Calculate the date range for the statement.

        Args:
            month: Optional month in YYYY-MM format. If None, uses previous month.

        Returns:
            Tuple of (from_date, to_date) in YYYY-MM-DD format
        """
        if month:
            try:
                year, month_num = map(int, month.split('-'))
                first_day = datetime(year, month_num, 1)
            except ValueError:
                logger.error(f"Invalid month format: {month}. Use YYYY-MM")
                sys.exit(1)
        else:
            # Default to previous month
            today = datetime.now()
            first_day = (today.replace(day=1) - timedelta(days=1)).replace(day=1)

        # Calculate last day of the month
        next_month = first_day.replace(day=28) + timedelta(days=4)
        last_day = next_month - timedelta(days=next_month.day)

        from_date = first_day.strftime('%Y-%m-%d')
        to_date = last_day.strftime('%Y-%m-%d')

        return from_date, to_date

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

    def run(self, month: Optional[str] = None, dry_run: bool = False) -> int:
        """
        Run the statement generation and distribution process.

        Args:
            month: Optional month in YYYY-MM format
            dry_run: If True, download statements but don't send emails

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        logger.info("Starting statement distribution process")

        if dry_run:
            logger.info("Running in DRY RUN mode - emails will not be sent")

        # Get date range
        from_date, to_date = self._get_date_range(month)
        logger.info(f"Processing statements for {from_date} to {to_date}")

        # Process each department
        results = []
        for department in self.departments:
            success = self.process_department(
                department,
                from_date,
                to_date,
                dry_run
            )
            results.append(success)

        # Summary
        total = len(results)
        successful = sum(results)
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
    parser.add_argument(
        '--month',
        help='Month to process in YYYY-MM format (default: previous month)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Download statements but do not send emails'
    )

    args = parser.parse_args()

    distributor = StatementDistributor(args.config, args.account_groups)
    exit_code = distributor.run(args.month, args.dry_run)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()


"""
Email sending utilities with SMTP support.

Provides SMTP email functionality with attachment support for sending
statement CSVs to account group contacts.
"""

import logging
import os
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Dict, List, Optional, Union


def send_email(
    smtp_config: Dict,
    recipient: str,
    subject: str,
    body: str,
    attachment_path: Optional[Path] = None,
    dry_run: bool = False,
    logger: Optional[logging.Logger] = None,
    bcc: Optional[Union[str, List[str]]] = None
) -> bool:
    """
    Send an email with optional attachment via SMTP.
    
    Args:
        smtp_config: Dictionary with SMTP configuration:
            - host: SMTP server hostname
            - port: SMTP server port
            - use_tls: Whether to use TLS (boolean)
            - from_address: Sender email address
            - username: SMTP username (optional)
            - password: SMTP password (optional, can use SMTP_PASSWORD env var)
        recipient: Email address of the recipient
        subject: Email subject
        body: Email body text (plain text)
        attachment_path: Optional path to file to attach
        dry_run: If True, don't actually send the email (default: False)
        logger: Optional logger instance for logging
        bcc: Optional email address or list of addresses to BCC
        
    Returns:
        True if email was sent successfully (or dry run), False otherwise
    """
    if logger is None:
        logger = logging.getLogger(__name__)
    
    if dry_run:
        attachment_msg = f"with attachment {attachment_path.name}" if attachment_path else "without attachment"
        bcc_msg = f" and BCC {', '.join(bcc if isinstance(bcc, list) else [bcc])}" if bcc else ""
        logger.info(
            f"[DRY RUN] Would send email to {recipient} {attachment_msg}{bcc_msg}"
        )
        return True
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_config.get('from_address')
        msg['To'] = recipient
        msg['Subject'] = subject
        if bcc:
            bcc_list = [bcc] if isinstance(bcc, str) else bcc
            msg['Bcc'] = ', '.join(bcc_list)
        
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
        smtp_host = smtp_config.get('host', 'localhost')
        smtp_port = smtp_config.get('port', 587)
        use_tls = smtp_config.get('use_tls', True)
        username = smtp_config.get('username')
        # Support SMTP_PASSWORD environment variable as fallback
        password = smtp_config.get('password') or os.environ.get('SMTP_PASSWORD')
        
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

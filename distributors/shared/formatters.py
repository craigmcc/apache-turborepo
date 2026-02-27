"""
Formatting utilities for statement data.

Provides consistent formatting for amounts and dates across all distributors.
"""

from datetime import datetime
from typing import Optional


def format_accounting_date(date_str: Optional[str]) -> str:
    """
    Format accounting date for display.
    
    Converts ISO format timestamps to readable YYYY-MM-DD HH:MM:SS format.
    
    Args:
        date_str: Date string in ISO format (e.g., "2024-11-01T00:00:00.000Z")
        
    Returns:
        Formatted date string in YYYY-MM-DD HH:MM:SS format, or empty string if None
    """
    if not date_str:
        return ''
    # Convert ISO format to readable format
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return date_str


def format_amount(amount_cents: Optional[int], currency: Optional[str] = None) -> str:
    """
    Format amount in cents to dollar string with thousand separators.
    
    Args:
        amount_cents: Amount in cents (e.g., 12345 for $123.45)
        currency: Optional currency code (currently unused, for future extension)
        
    Returns:
        Formatted amount string like "$1,234.56"
    """
    if amount_cents is None:
        return '$0.00'
    dollars = amount_cents / 100.0
    return f"${dollars:,.2f}"

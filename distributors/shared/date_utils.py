"""
Date parsing and range calculation utilities.

Provides consistent date handling across all distributors.
"""

import sys
from datetime import datetime, timedelta
from typing import Optional, Tuple


def parse_date(date_str: str) -> datetime:
    """
    Parse a date string in YYYY-MM-DD format.
    
    Args:
        date_str: Date in YYYY-MM-DD format
        
    Returns:
        datetime object for the specified date
        
    Raises:
        SystemExit: If date format is invalid
    """
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        print(f"Error: Invalid date format: {date_str}. Use YYYY-MM-DD", file=sys.stderr)
        sys.exit(1)


def get_date_range(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
) -> Tuple[str, str]:
    """
    Get the date range for statement generation.
    
    If no dates are specified, defaults to the previous calendar month.
    If only from_date is specified, to_date defaults to the last day of that month.
    
    Args:
        from_date: Start date in YYYY-MM-DD format (optional)
        to_date: End date in YYYY-MM-DD format (optional)
        
    Returns:
        Tuple of (from_date, to_date) in YYYY-MM-DD format
        
    Raises:
        SystemExit: If date range is invalid
    """
    # Determine start date
    if from_date:
        start_date = parse_date(from_date)
    else:
        # Default to first day of previous month
        today = datetime.now()
        start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    
    # Determine end date
    if to_date:
        end_date = parse_date(to_date)
    else:
        # Default to last day of the month containing start_date
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)
    
    # Validate that from_date is not after to_date
    if start_date > end_date:
        print(
            f"Error: Invalid date range: from_date ({from_date}) is after to_date ({to_date})",
            file=sys.stderr
        )
        sys.exit(1)
    
    return (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

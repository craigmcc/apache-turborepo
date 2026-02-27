"""
GL account group filtering utilities.

Provides functionality to check if GL account numbers fall within
configured account group ranges from AccountGroups.json.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict


def load_account_group_ranges(account_groups_path: Path, account_group: str) -> List[Dict[str, str]]:
    """
    Load account code ranges for a specific account group.
    
    Args:
        account_groups_path: Path to AccountGroups.json file
        account_group: Name of the account group (account group name)
        
    Returns:
        List of range dictionaries with 'start' and 'end' keys
    """
    try:
        with open(account_groups_path, 'r') as f:
            account_groups = json.load(f)
    except FileNotFoundError:
        print(f"Error: AccountGroups.json not found: {account_groups_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in AccountGroups.json: {e}", file=sys.stderr)
        sys.exit(1)
    
    for group in account_groups:
        if group.get('groupName') == account_group:
            return group.get('groupRanges', [])
    return []


def is_account_in_group(gl_account: str, account_group: str, account_groups_path: Path) -> bool:
    """
    Check if GL account code falls within account group ranges.
    
    Uses string-based comparison to check if the GL account number
    falls within any of the configured ranges for the account group.
    
    Args:
        gl_account: GL account number as string (e.g., "6450")
        account_group: Name of the account group (account group name)
        account_groups_path: Path to AccountGroups.json file
        
    Returns:
        True if account is in group's ranges, False otherwise
    """
    if not gl_account:
        return False
    
    ranges = load_account_group_ranges(account_groups_path, account_group)
    for range_obj in ranges:
        start = range_obj.get('start', '')
        end = range_obj.get('end', '')
        if start <= gl_account <= end:
            return True
    return False

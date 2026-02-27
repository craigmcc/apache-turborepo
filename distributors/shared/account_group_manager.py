"""
Account group loading and filtering utilities.

Manages loading account groups from AccountGroups.json and filtering
based on user-specified criteria.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Optional


def load_account_groups(account_groups_path: Path) -> List[Dict]:
    """
    Load account groups from AccountGroups.json including email addresses.
    
    Only includes account groups with:
    - groupType: "Departmental"
    - groupEmail field present
    - Not in excluded groups (All, Other)
    
    Args:
        account_groups_path: Path to the AccountGroups.json file
        
    Returns:
        List of account group dictionaries with name, account_group, and email
        
    Raises:
        SystemExit: If file not found, invalid JSON, or no account groups configured
    """
    try:
        with open(account_groups_path, 'r') as f:
            account_groups_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: AccountGroups.json not found: {account_groups_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in AccountGroups.json: {e}", file=sys.stderr)
        sys.exit(1)
    
    result = []
    excluded_groups = {'All', 'Other'}  # Groups to exclude
    
    for group in account_groups_data:
        group_name = group.get('groupName')
        group_type = group.get('groupType')
        group_email = group.get('groupEmail')
        
        # Only include Departmental type groups with email, excluding special ones
        if group_type == 'Departmental' and group_name not in excluded_groups and group_email:
            result.append({
                'name': group_name,
                'account_group': group_name,
                'email': group_email
            })
    
    if not result:
        print(
            "Error: No account groups configured with email addresses. "
            "Check that account groups in AccountGroups.json have 'groupEmail' field.",
            file=sys.stderr
        )
        sys.exit(1)
    
    return result


def filter_account_groups(all_account_groups: List[Dict], account_group_filter: Optional[str]) -> List[Dict]:
    """
    Filter account groups based on user-specified filter.
    
    Args:
        all_account_groups: Complete list of account groups
        account_group_filter: Comma-separated list of account group names (case-insensitive)
        
    Returns:
        Filtered list of account groups
        
    Raises:
        SystemExit: If no valid account groups match the filter
    """
    if not account_group_filter:
        # No filter specified, return all account groups
        return all_account_groups
    
    # Parse the comma-separated list
    requested = [ag.strip() for ag in account_group_filter.split(',')]
    
    # Create case-insensitive lookup
    ag_lookup = {ag['name'].lower(): ag for ag in all_account_groups}
    
    filtered = []
    for req in requested:
        req_lower = req.lower()
        
        if req_lower in ag_lookup:
            filtered.append(ag_lookup[req_lower])
        else:
            # Show available account groups for helpful error message
            available = ', '.join([ag['name'] for ag in all_account_groups])
            print(
                f"Warning: Account group '{req}' not found or has no email configured. "
                f"Available account groups: {available}",
                file=sys.stderr
            )
    
    if not filtered:
        print(
            "Error: No valid account groups matched the filter. "
            "Please check account group names and ensure they have email addresses configured.",
            file=sys.stderr
        )
        sys.exit(1)
    
    return filtered


def list_account_groups(all_account_groups: List[Dict]) -> None:
    """
    List all available account groups and exit.
    
    Displays account group names in alphabetical order with count.
    
    Args:
        all_account_groups: Complete list of account groups
        
    Raises:
        SystemExit: Always exits after printing
    """
    if not all_account_groups:
        print("No account groups found with configured email addresses.")
        print("Check that account groups in AccountGroups.json have 'groupEmail' field.")
        sys.exit(1)
    
    # Sort account groups alphabetically by name
    sorted_ags = sorted(all_account_groups, key=lambda ag: ag['name'])
    
    print(f"Available account groups ({len(sorted_ags)}):")
    for ag in sorted_ags:
        print(f"  {ag['name']}")
    
    sys.exit(0)

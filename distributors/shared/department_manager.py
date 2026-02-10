"""
Department loading and filtering utilities.

Manages loading departments from AccountGroups.json and filtering
based on user-specified criteria.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Optional


def load_departments(account_groups_path: Path) -> List[Dict]:
    """
    Load departments from AccountGroups.json including email addresses.
    
    Only includes departments with:
    - groupType: "Departmental"
    - groupEmail field present
    - Not in excluded groups (All, Other)
    
    Args:
        account_groups_path: Path to the AccountGroups.json file
        
    Returns:
        List of department dictionaries with name, account_group, and email
        
    Raises:
        SystemExit: If file not found, invalid JSON, or no departments configured
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
        print(
            "Error: No departments configured with email addresses. "
            "Check that departments in AccountGroups.json have 'groupEmail' field.",
            file=sys.stderr
        )
        sys.exit(1)
    
    return departments


def filter_departments(all_departments: List[Dict], department_filter: Optional[str]) -> List[Dict]:
    """
    Filter departments based on user-specified filter.
    
    Args:
        all_departments: Complete list of departments
        department_filter: Comma-separated list of department names (case-insensitive)
        
    Returns:
        Filtered list of departments
        
    Raises:
        SystemExit: If no valid departments match the filter
    """
    if not department_filter:
        # No filter specified, return all departments
        return all_departments
    
    # Parse the comma-separated list
    requested_depts = [dept.strip() for dept in department_filter.split(',')]
    
    # Create case-insensitive lookup
    dept_lookup = {dept['name'].lower(): dept for dept in all_departments}
    
    filtered = []
    for requested in requested_depts:
        requested_lower = requested.lower()
        
        if requested_lower in dept_lookup:
            filtered.append(dept_lookup[requested_lower])
        else:
            # Show available departments for helpful error message
            available = ', '.join([d['name'] for d in all_departments])
            print(
                f"Warning: Department '{requested}' not found or has no email configured. "
                f"Available departments: {available}",
                file=sys.stderr
            )
    
    if not filtered:
        print(
            "Error: No valid departments matched the filter. "
            "Please check department names and ensure they have email addresses configured.",
            file=sys.stderr
        )
        sys.exit(1)
    
    return filtered


def list_departments(all_departments: List[Dict]) -> None:
    """
    List all available departments and exit.
    
    Displays department names in alphabetical order with count.
    
    Args:
        all_departments: Complete list of departments
        
    Raises:
        SystemExit: Always exits after printing
    """
    if not all_departments:
        print("No departments found with configured email addresses.")
        print("Check that departments in AccountGroups.json have 'groupEmail' field.")
        sys.exit(1)
    
    # Sort departments alphabetically by name
    sorted_depts = sorted(all_departments, key=lambda d: d['name'])
    
    print(f"Available departments ({len(sorted_depts)}):")
    for dept in sorted_depts:
        print(f"  {dept['name']}")
    
    sys.exit(0)

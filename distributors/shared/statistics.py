"""
Statistics tracking and summary report generation.

Provides utilities to track processing statistics and generate
summary reports for statement distribution runs.
"""

from typing import Dict, List, Tuple, Optional


class StatisticsTracker:
    """Track statistics for statement distribution process."""
    
    def __init__(self):
        """Initialize statistics tracker with zero counts."""
        self.stats = {
            'total_account_groups': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'no_activity': 0,
            'account_groups_processed': [],
            'account_groups_failed': [],  # Contains (name, reason) tuples
            'account_groups_skipped': [],
            'account_groups_no_activity': [],
            'from_date': None,
            'to_date': None
        }
    
    def set_date_range(self, from_date: str, to_date: str) -> None:
        """Set the date range for this run."""
        self.stats['from_date'] = from_date
        self.stats['to_date'] = to_date
    
    def set_total_account_groups(self, count: int) -> None:
        """Set the total number of account groups to process."""
        self.stats['total_account_groups'] = count
    
    def record_success(self, account_group_name: str) -> None:
        """Record a successful account group processing."""
        self.stats['successful'] += 1
        self.stats['account_groups_processed'].append(account_group_name)
    
    def record_failure(self, account_group_name: str, reason: str) -> None:
        """Record a failed account group processing."""
        self.stats['failed'] += 1
        self.stats['account_groups_failed'].append((account_group_name, reason))
    
    def record_skipped(self, account_group_name: str) -> None:
        """Record a skipped account group (no data)."""
        self.stats['skipped'] += 1
        self.stats['account_groups_skipped'].append(account_group_name)

    def record_sent_no_activity(self, account_group_name: str) -> None:
        """Record an account group that received no-activity email (no CSV attachment)."""
        self.stats['no_activity'] += 1
        self.stats['account_groups_no_activity'].append(account_group_name)
    
    def get_stats(self) -> Dict:
        """Get the current statistics dictionary."""
        return self.stats


def generate_summary_report(stats: Dict, title: str = "Statement Distributor") -> str:
    """
    Generate a summary report of the execution.
    
    Args:
        stats: Statistics dictionary with execution results
        title: Title for the report (e.g., "Ramp Statement Distributor")
        
    Returns:
        Formatted summary report text
    """
    total = stats['total_account_groups']
    successful = stats['successful']
    failed = stats['failed']
    skipped = stats.get('skipped', 0)
    no_activity = stats.get('no_activity', 0)
    from_date = stats['from_date']
    to_date = stats['to_date']
    
    report = []
    report.append(f"{title} - Execution Summary")
    report.append("=" * 50)
    report.append("")
    report.append(f"Date Range: {from_date} to {to_date}")
    report.append(f"Total Account Groups: {total}")
    report.append(f"Successful: {successful}")
    report.append(f"Sent (no activity): {no_activity}")
    if skipped > 0:
        report.append(f"Skipped (no transactions): {skipped}")
    report.append(f"Failed: {failed}")
    report.append("")
    
    if stats['account_groups_processed']:
        report.append("Account Groups Processed Successfully:")
        for ag in stats['account_groups_processed']:
            report.append(f"  - {ag}")
        report.append("")
    
    if stats.get('account_groups_no_activity'):
        report.append("Account Groups Sent (No Activity):")
        for ag in stats['account_groups_no_activity']:
            report.append(f"  - {ag}")
        report.append("")
    
    if stats.get('account_groups_skipped'):
        report.append("Account Groups Skipped (no transactions):")
        for ag in stats['account_groups_skipped']:
            report.append(f"  - {ag}")
        report.append("")
    
    if stats['account_groups_failed']:
        report.append("Account Groups Failed:")
        for ag, reason in stats['account_groups_failed']:
            report.append(f"  - {ag}: {reason}")
        report.append("")
    
    if failed > 0:
        report.append("Status: COMPLETED WITH ERRORS")
    else:
        report.append("Status: COMPLETED SUCCESSFULLY")
    
    return "\n".join(report)

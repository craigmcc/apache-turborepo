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
            'total_departments': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'departments_processed': [],
            'departments_failed': [],  # Contains (name, reason) tuples
            'departments_skipped': [],
            'from_date': None,
            'to_date': None
        }
    
    def set_date_range(self, from_date: str, to_date: str) -> None:
        """Set the date range for this run."""
        self.stats['from_date'] = from_date
        self.stats['to_date'] = to_date
    
    def set_total_departments(self, count: int) -> None:
        """Set the total number of departments to process."""
        self.stats['total_departments'] = count
    
    def record_success(self, department_name: str) -> None:
        """Record a successful department processing."""
        self.stats['successful'] += 1
        self.stats['departments_processed'].append(department_name)
    
    def record_failure(self, department_name: str, reason: str) -> None:
        """Record a failed department processing."""
        self.stats['failed'] += 1
        self.stats['departments_failed'].append((department_name, reason))
    
    def record_skipped(self, department_name: str) -> None:
        """Record a skipped department (no data)."""
        self.stats['skipped'] += 1
        self.stats['departments_skipped'].append(department_name)
    
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
    total = stats['total_departments']
    successful = stats['successful']
    failed = stats['failed']
    skipped = stats['skipped']
    from_date = stats['from_date']
    to_date = stats['to_date']
    
    report = []
    report.append(f"{title} - Execution Summary")
    report.append("=" * 50)
    report.append("")
    report.append(f"Date Range: {from_date} to {to_date}")
    report.append(f"Total Departments: {total}")
    report.append(f"Successful: {successful}")
    report.append(f"Skipped (no transactions): {skipped}")
    report.append(f"Failed: {failed}")
    report.append("")
    
    if stats['departments_processed']:
        report.append("Departments Processed Successfully:")
        for dept in stats['departments_processed']:
            report.append(f"  - {dept}")
        report.append("")
    
    if stats['departments_skipped']:
        report.append("Departments Skipped (no transactions):")
        for dept in stats['departments_skipped']:
            report.append(f"  - {dept}")
        report.append("")
    
    if stats['departments_failed']:
        report.append("Departments Failed:")
        for dept, reason in stats['departments_failed']:
            report.append(f"  - {dept}: {reason}")
        report.append("")
    
    if failed > 0:
        report.append("Status: COMPLETED WITH ERRORS")
    else:
        report.append("Status: COMPLETED SUCCESSFULLY")
    
    return "\n".join(report)

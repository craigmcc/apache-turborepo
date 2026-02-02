/**
 * Journal Report request and response.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import { JournalReportRequest } from "@/components/journalReport/JournalReportRequest";

// Public Objects ------------------------------------------------------------

export default function JournalReportPage() {
  return (
    <div className="p-4">
      <JournalReportRequest/>
    </div>
  );
}

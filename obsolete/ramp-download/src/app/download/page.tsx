"use server"

/**
 * Download page for the Ramp Download application.
 */

// External Imports ----------------------------------------------------------

import Container from 'react-bootstrap/Container';

// Internal Imports ----------------------------------------------------------

import { main } from "@/lib/index";

// Public Objects ------------------------------------------------------------

export default async function DownloadPage() {

  // No "await" so the displayed text will be rendered while the download is in progress.
  main();

  return (
    <>
      <Container className="p-2 mb-4 bg-light rounded-3" fluid>
        <h1 className="header text-center">
          Download progress will be in the server console log.
        </h1>
      </Container>
    </>
  );
};

"use client";

/**
 * Root page for the Ramp Download application.
 */

// External Imports ----------------------------------------------------------

import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export default function HomePage() {

  const router = useRouter();

  return (
    <>
      <Container className="p-2 mb-4 bg-light rounded-3" fluid>
        <h1 className="header text-center">
          Welcome To The Ramp Download Application
        </h1>
      </Container>
      <p className="lead text-center">
        <span>Click the following button to initiate the download:&nbsp;</span>
        <Button
          onClick={() => router.push("/download")}
          variant="primary"
        >
          Download
        </Button>
      </p>
      </>
  );
};

/**
 * Root page for the Ramp Lookup application.
 */

// External Imports ----------------------------------------------------------

import React from 'react';
import Container from 'react-bootstrap/Container';

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export default function RootPage() {
  return (
    <Container className="p-3">
      <Container className="p-2 mb-4 bg-light rounded-3">
        <h1 className="header">
          Welcome To The Ramp Lookup Application
        </h1>
      </Container>
      <p className="lead">
        Click one of the tabs above to retrieve the corresponding information.
      </p>
    </Container>
  );
};

/**
 * Root page for this application.
 */

// External Imports ----------------------------------------------------------

import React from 'react';
import Container from 'react-bootstrap/Container';

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export default function RootPage() {
  return (
    <Container className="p-3">
      <Container className="p-5 mb-4 bg-light rounded-3">
        <h1 className="header">
          Welcome To The Ramp Information Application
        </h1>
        <p className="lead">
          Click one of the drop-down links above to retrieve the corresponding information.
        </p>
      </Container>
    </Container>
  );
};

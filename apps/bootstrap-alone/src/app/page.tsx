/**
 * Root page for the Bootstrap Alone application.
 */

// External Imports ----------------------------------------------------------

import Container from 'react-bootstrap/Container';

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Container className="p-2 mb-4 bg-light rounded-3" fluid>
        <h1 className="header text-center">
          Welcome To Bootstrap Alone
        </h1>
      </Container>
      <p className="lead text-center">
        This is a standalone application showcasing Bootstrap components with Next.js.
      </p>
      </>
  );
};

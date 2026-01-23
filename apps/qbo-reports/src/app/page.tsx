/**
 * Root page for the QBO Reports application.
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
          Welcome To The QBO Reports Application
        </h1>
      </Container>
      <p className="lead text-center">
        Click one of the tabs above to retrieve the corresponding information.
      </p>
      </>
  );
};

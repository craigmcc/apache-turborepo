/**
 * Base page for cards.
 */

// External Imports ----------------------------------------------------------

import Container from "react-bootstrap/Container";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export default function CardsPage() {
  return (
    <Container className="p-2 mb-4 bg-light rounded-3" fluid>
      <h1 className="header text-center">
        Cards Page
      </h1>
    </Container>
  );
}

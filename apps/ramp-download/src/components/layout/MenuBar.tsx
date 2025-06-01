"use client";

/**
 * MenuBar component for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import { Images } from "lucide-react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {

  return (
    <Container className="bg-info-subtle" fluid>
      <Row className="my-2">
        <Col className="mt-1">
            <Images className="pe-2" size={38}/>
            RAMP Download
        </Col>
      </Row>
    </Container>
  );
}

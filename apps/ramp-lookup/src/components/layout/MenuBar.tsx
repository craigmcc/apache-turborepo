"use client";

/**
 * MenuBar component for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import { Images } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {

  const [key, setKey] = useState<string | null>(null);

  return (
    <Container className="bg-light" fluid>
      <Row className="my-2">
        <Col className="mt-1">
          <Link href="/">
            <Images className="pe-2" size={38}/>
            RAMP Lookup
          </Link>
        </Col>
        <Col className="w-100">
          <Tabs
            activeKey={key ? key : undefined}
            fill
            id="ramp-lookup-tabs"
            onSelect={(k) => setKey(k)}
          >
            <Tab
              eventKey="Departments"
              title="Departments"
            >
              TODO - redirect to departments page
            </Tab>
            <Tab
              eventKey="Users"
              title="Users"
            >
              TODO - redirect to users page
            </Tab>
            <Tab
              eventKey="Cards"
              title="Cards"
            >
              TODO - redirect to cards page
            </Tab>
            </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

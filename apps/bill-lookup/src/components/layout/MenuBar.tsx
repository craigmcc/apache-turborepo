"use client";

/**
 * MenuBar component for the BILL Lookup application.
 */

// External Imports ----------------------------------------------------------

import { Images } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {

  const [key, setKey] = useState<string>("Home");

  const router = useRouter();

  function handleSelect(eventKey: string | null) {
    const actualKey = eventKey ? eventKey : "Home";
    setKey(actualKey);
    const path = KEY_PAGE_MAPPINGS.get(actualKey) || "/";
    router.push(path);
  }

  return (
    <Container className="bg-info-subtle" fluid>
      <Row className="my-2">
        <Col className="mt-1">
            <Images className="pe-2" size={38}/>
            BILL Lookup
        </Col>
        <Col className="w-200">
          <Tabs
            activeKey={key ? key : undefined}
            fill
            id="bill-lookup-tabs"
            onSelect={(k) => handleSelect(k)}
          >
            <Tab
              eventKey="Home"
              title="Home"
            />
            <Tab
              eventKey="Users"
              title="Users"
            />
            <Tab
              eventKey="Vendor"
              title="Vendors"
            />
            <Tab
              eventKey="Bills"
              title="Bills"
            />
            <Tab
              eventKey="Bill-Approvers"
              title="Approvers"
            />
            <Tab
              eventKey="Recurring-Bills"
              title="Recurring Bills"
            />
            <Tab
              eventKey="Accounts"
              title="Accounts"
            />
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const KEY_PAGE_MAPPINGS: Map<string, string> = new Map([
  ["Home", "/"],
  [ "Accounts", "/accounts"],
  [ "Bills", "/bills"],
  [ "Bill-Approvers", "/bill-approvers"],
  [ "Recurring-Bills", "/recurring-bills"],
  ["Users", "/users"],
  ["Vendor", "/vendors"],
]);

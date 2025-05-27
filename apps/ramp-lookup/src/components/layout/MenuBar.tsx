"use client";

/**
 * MenuBar component for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

//import { useLocalStorage } from "@uidotdev/usehooks";
import { Images } from "lucide-react";
import { useRouter } from "next/navigation";
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

//  const [key, setKey] = useLocalStorage<string>(LOCAL_STORAGE_KEY, "Home");
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
            RAMP Lookup
        </Col>
        <Col className="w-100">
          <Tabs
            activeKey={key ? key : undefined}
            fill
            id="ramp-lookup-tabs"
            onSelect={(k) => handleSelect(k)}
          >
            <Tab
              eventKey="Home"
              title="Home"
            />
            <Tab
              eventKey="Departments"
              title="Departments"
            />
            <Tab
              eventKey="Users"
              title="Users"
            />
            <Tab
              eventKey="Cards"
              title="Cards"
            />
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const LOCAL_STORAGE_KEY = "ramp-lookup.SelectedTab";

const KEY_PAGE_MAPPINGS: Map<string, string> = new Map([
  ["Home", "/"],
  ["Cards", "/cards"],
  ["Departments", "/departments"],
  ["Users", "/users"],
]);


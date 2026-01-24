"use client";

/**
 * MenuBar component for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import { Images, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Row,
  Tab,
  Tabs
} from "react-bootstrap";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

const THEME_STORAGE_KEY = "bootstrap-alone-theme";

export function MenuBar() {

  const [key, setKey] = useState<string>("Home");
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem(THEME_STORAGE_KEY) || "light"
      : "light"
  );

  useEffect(() => {
    // Save and apply the theme when it changes
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const router = useRouter();

  function handleSelect(eventKey: string | null) {
    const actualKey = eventKey ? eventKey : "Home";
    setKey(actualKey);
    const path = KEY_PAGE_MAPPINGS.get(actualKey) || "/";
    router.push(path);
  }

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <Container className="bg-info-subtle" fluid>
      <Row className="my-2" xs={2}>
        <Col className="mt-1">
          <Images className="pe-2" size={38}/>
          Bootstrap Alone
        </Col>
        <Col xs={5} >
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
              eventKey="Buttons"
              title="Buttons"
            />
          </Tabs>
        </Col>
        <Col className="d-flex justify-content-end" xs={1}>
          {theme === "light" ? (
            <Button onClick={toggleTheme} variant="outline-dark">
              <Sun size={24}/>
            </Button>
          ) : (
            <Button onClick={toggleTheme} variant="outline-light">
              <Moon size={24}/>
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const KEY_PAGE_MAPPINGS: Map<string, string> = new Map([
  ["Home", "/"],
  ["Buttons", "/buttons"],
]);

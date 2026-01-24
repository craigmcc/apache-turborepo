"use client";

/**
 * MenuBar component for the Bootstrap Alone application.
 */

// External Imports ----------------------------------------------------------

import { Images, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

const THEME_STORAGE_KEY = "bootstrap-alone-theme";

export function MenuBar() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem(THEME_STORAGE_KEY) || "light"
      : "light"
  );

  useEffect(() => {
    // Indicate that we are running on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Save and apply the theme when it changes
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <Navbar bg="info-subtle" expand="lg" className="px-3">
      <Navbar.Brand href="/">
        <Images className="pe-2" size={38}/>
        Bootstrap Alone
      </Navbar.Brand>
      <Nav className="mx-auto" defaultActiveKey="/" variant="pills">
        <Nav.Item>
          <Nav.Link href="/">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-buttons" href="/buttons">Buttons</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-forms" href="/forms">Forms</Nav.Link>
        </Nav.Item>
      </Nav>
      {theme === "light" ? (
        <Button onClick={toggleTheme} variant="outline-dark">
          <Sun size={24}/>
        </Button>
      ) : (
        <Button onClick={toggleTheme} variant="outline-light">
          <Moon size={24}/>
        </Button>
      )}
    </Navbar>
  );
}

"use client";

/**
 * Menu bar for the Bootstrap Alone application.
 */

// External Modules ----------------------------------------------------------

import { Images, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {
  const [activeKey, setActiveKey] = useState<string>(() =>
    typeof window !== "undefined" ? mapPathToKey(window.location.pathname) : "home"
  );
  const [isClient, setIsClient] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem(THEME_STORAGE_KEY) || "light"
      : "light"
  );

  // Indicate that we are now running on the client (avoids SSR/hydration issues).
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update activeKey once after client mount so the client reflects the real pathname.
  useEffect(() => {
    if (isClient) {
      setActiveKey(mapPathToKey(window.location.pathname));
    }
  }, [isClient]);

  // Apply theme to localStorage and document body attribute.
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  // Keep active key in sync with browser history (back/forward)
  useEffect(() => {
    const onPop = () => {
      setActiveKey(mapPathToKey(window.location.pathname));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Handle theme toggle button click.
  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <Navbar expand="lg" className="bg-body-tertiary px-1 d-flex align-items-center w-100">
      <Navbar.Brand href="/">
        <Images className="pe-2" size={38} />
        Bootstrap Alone
      </Navbar.Brand>

      {/* center the Nav in a flex-grow container so it's visually centered */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <div {...({ suppressHydrationWarning: true } as any)}
        className="flex-grow-1 d-flex justify-content-center"
      >
        <Nav
          className="justify-content-center"
          variant="pills"
          {...(isClient
            ? {
                activeKey: activeKey,
                onSelect: (k: unknown) => {
                  if (typeof k === "string") setActiveKey(k);
                },
              }
            : // use the same initial key used on the server so SSR/hydration don't mismatch
              { defaultActiveKey: activeKey })}
        >
          <Nav.Link as={Link} eventKey="home" href="/">
            Home
          </Nav.Link>
          <Nav.Link as={Link} eventKey="link-buttons" href="/buttons">
            Buttons
          </Nav.Link>
          <Nav.Link as={Link} eventKey="link-forms" href="/forms">
            Forms
          </Nav.Link>
          <Nav.Link as={Link} eventKey="link-inputs" href="/inputs">
            Inputs
          </Nav.Link>
        </Nav>
      </div>

      {/* theme toggle stays at the far right */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <div {...({ suppressHydrationWarning: true } as any)} className="ms-2">
        {isClient ? (
          theme === "light" ? (
            <Button onClick={toggleTheme} variant="outline-dark">
              <Sun size={24} />
            </Button>
          ) : (
            <Button onClick={toggleTheme} variant="outline-light">
              <Moon size={24} />
            </Button>
          )
        ) : (
          <Button onClick={toggleTheme} variant="outline-dark" aria-hidden>
            <Sun size={24} />
          </Button>
        )}
      </div>
    </Navbar>
  );
}

// Private Objects -----------------------------------------------------------

const THEME_STORAGE_KEY = "bootstrap-alone-theme";

// Return the active key for the given pathname.
function mapPathToKey(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/buttons")) return "link-buttons";
  if (pathname.startsWith("/forms")) return "link-forms";
  if (pathname.startsWith("/inputs")) return "link-inputs";
  return "home";
}


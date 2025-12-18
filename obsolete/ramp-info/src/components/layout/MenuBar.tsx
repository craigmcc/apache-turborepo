"use client";

/**
 * Navigation menu bar for the application.
 */

// External Modules ----------------------------------------------------------

import { Images } from "lucide-react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">
          <Images className="pe-2" size={38}/>
          Ramp Information
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Ramp Lookups" id="basic-nav-dropdown">
              <NavDropdown.Item href="/refreshToken">Refresh Access Token</NavDropdown.Item>
              <NavDropdown.Item href="/selectUser">Select User</NavDropdown.Item>
              <NavDropdown.Divider/>
              <NavDropdown.Item href="/second">Second</NavDropdown.Item>
              <NavDropdown.Item href="/third">Third</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

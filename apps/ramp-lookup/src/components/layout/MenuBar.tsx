"use client";

/**
 * MenuBar component for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import { Images } from "lucide-react";

// Internal Imports ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function MenuBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <Images className="pe-2" size={38} />
          RAMP Lookup
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
}

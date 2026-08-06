"use client";

import { useEffect } from "react";

/**
 * Registers the Material Web custom elements on pages that are otherwise
 * server-rendered. The md-* tags stream down as plain unknown elements and
 * upgrade once this import lands, so the page is readable before hydration.
 */
export default function MaterialLoader() {
  useEffect(() => {
    import("./material");
  }, []);
  return null;
}

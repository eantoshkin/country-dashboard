"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page status-page">
      <main id="main-content" className="status-card">
        <p className="dashboard-eyebrow md-typescale-label-medium">Error</p>
        <h1>Something went wrong.</h1>
        <p className="md-typescale-body-medium">
          The page failed to render. This is usually temporary — trying again
          often fixes it.
        </p>
        <nav className="status-links" aria-label="Recovery options">
          <button type="button" className="status-retry" onClick={reset}>
            Try again
          </button>
          <Link href="/">Back to the dashboard</Link>
        </nav>
      </main>
    </div>
  );
}

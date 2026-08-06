import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page status-page">
      <main id="main-content" className="status-card">
        <p className="dashboard-eyebrow md-typescale-label-medium">404</p>
        <h1>This page isn&apos;t on the ledger.</h1>
        <p className="md-typescale-body-medium">
          The address may have changed, or it never existed. Everything the
          dashboard publishes is reachable from the two pages below.
        </p>
        <nav className="status-links" aria-label="Site pages">
          <Link href="/">Dashboard &amp; world ranking</Link>
          <Link href="/co">Colombia · laws &amp; votes</Link>
        </nav>
      </main>
    </div>
  );
}

import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="result-page">
      <div className="result-card">
        <SearchX size={56} />
        <span className="eyebrow muted-eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page may have moved, or the requested resource may no longer be available.</p>
        <div className="result-actions" style={{ marginTop: "24px" }}>
          <Link href="/" className="button button-primary">
            Go home
          </Link>
          <Link href="/services" className="button button-secondary">
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}

import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: "520px", width: "100%", background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "40px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
        <SearchX size={56} style={{ color: "var(--magenta-500)", margin: "0 auto 16px auto" }} />
        <span className="eyebrow muted-eyebrow">404 Error</span>
        <h1 style={{ fontSize: "26px", margin: "8px 0 12px 0" }}>Page not found</h1>
        <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "24px" }}>
          The university program or destination page you are looking for may have moved or is no longer available.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/" className="button button-primary">
            nextED Home
          </Link>
          <Link href="/services" className="button button-secondary">
            Explore Study Programs
          </Link>
        </div>
      </div>
    </section>
  );
}

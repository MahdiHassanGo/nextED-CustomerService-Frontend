"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="result-page">
      <div className="result-card">
        <AlertTriangle className="warning-icon" size={56} />
        <span className="eyebrow muted-eyebrow">Application error</span>
        <h1>Something went wrong</h1>
        <p>The request could not be completed. No sensitive details have been exposed.</p>
        <div className="result-actions" style={{ marginTop: "24px" }}>
          <button type="button" className="button button-primary" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}

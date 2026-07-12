export function Loading({ label = "Loading" }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="spinner" /><span>{label}…</span></div>;
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return <div className="card-grid">{Array.from({ length: count }).map((_, index) => <div className="skeleton-card" key={index}><div className="skeleton-line wide" /><div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-block" /></div>)}</div>;
}

import { Wrench } from "lucide-react";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="FixItNow home">
      <span className="brand-mark"><Wrench size={20} strokeWidth={2.4} /></span>
      {!compact && <span>FixIt<span>Now</span></span>}
    </Link>
  );
}

import { Sparkles } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="brand" aria-label="nextED home">
      <span className="brand-mark" aria-hidden="true">
        <Sparkles size={18} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="brand-text">
          next<span>ED</span>
        </span>
      )}
    </Link>
  );
}

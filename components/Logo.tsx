import { Wrench } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="brand" aria-label="FixItNow home">
      <span className="brand-mark" aria-hidden="true">
        <Wrench size={20} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span>
          FixIt<span>Now</span>
        </span>
      )}
    </Link>
  );
}

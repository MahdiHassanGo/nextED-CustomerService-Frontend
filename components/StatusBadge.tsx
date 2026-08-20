import { humanize, statusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status as never);
  return (
    <span className={`status-badge status-${tone}`} title={`Status: ${humanize(status)}`}>
      {humanize(status)}
    </span>
  );
}

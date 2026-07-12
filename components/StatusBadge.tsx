import { humanize, statusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${statusTone(status as never)}`}>{humanize(status)}</span>;
}

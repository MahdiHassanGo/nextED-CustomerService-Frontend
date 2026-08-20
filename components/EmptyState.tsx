import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        {icon || <Inbox size={28} />}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: "18px" }}>{action}</div>}
    </div>
  );
}

import { ReactNode } from "react";
import { Card } from "@frontend/components/ui/card";
import { cn } from "@frontend/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  trend?: string;
  className?: string;
};

export function StatCard({ label, value, hint, icon, trend, className }: StatCardProps) {
  return (
    <Card hover className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
          {trend ? <p className="mt-2 text-xs font-medium text-secondary">{trend}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

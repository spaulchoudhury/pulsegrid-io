import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Webhook } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts · Pulsegrid" }] }),
  component: AlertsPage,
});

const severityStyles: Record<"critical" | "warning" | "info", string> = {
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  info: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function AlertsPage() {
  const { tenant } = useApp();
  const [ackIds, setAckIds] = useState<Set<string>>(new Set());

  const list = tenant.alerts.map((a) => ackIds.has(a.id) ? { ...a, ack: true } : a);
  const critical = list.filter((a) => a.severity === "critical" && !a.ack).length;
  const warning = list.filter((a) => a.severity === "warning" && !a.ack).length;
  const acked = list.filter((a) => a.ack).length;

  return (
    <AppLayout
      title={`Alerts — ${tenant.name}`}
      subtitle="Threshold, trend, and ML-detected anomalies across the fleet"
      actions={
        <Button size="sm" onClick={() => toast.success("Webhook configuration opened")}>
          <Webhook className="size-3.5 mr-1.5" />Configure webhook
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: "Critical", value: critical, tone: "text-red-600" },
          { label: "Warning", value: warning, tone: "text-amber-600" },
          { label: "Acknowledged", value: acked, tone: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className={`text-2xl font-semibold mt-1 ${s.tone}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Alert stream</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className={`size-8 rounded-md grid place-items-center border ${severityStyles[a.severity]}`}>
                  {a.ack ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.message}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${severityStyles[a.severity]}`}>{a.severity}</Badge>
                    {a.ack && <Badge variant="secondary" className="text-[10px]">ack</Badge>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {a.id} · {a.assetName} ({a.assetId}) · Rule: <span className="text-slate-700 dark:text-slate-300">{a.rule}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">{a.ts}</div>
                  {!a.ack && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs mt-1"
                      onClick={() => {
                        setAckIds((s) => new Set(s).add(a.id));
                        toast.success(`Alert ${a.id} acknowledged`);
                      }}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No alerts for {tenant.name}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

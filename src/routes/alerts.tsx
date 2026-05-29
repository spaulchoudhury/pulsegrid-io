import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, BellOff, Check, ChevronDown, ChevronUp, History, ShieldCheck, Webhook, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { tenant, can, log, audit } = useApp();
  const navigate = useNavigate();
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [ackIds, setAckIds] = useState<Set<string>>(new Set());
  const [woMap, setWoMap] = useState<Record<string, string>>({});
  const [assigneeMap, setAssigneeMap] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (hash) setExpanded(hash);
  }, [hash]);

  const list = tenant.alerts.map((a) => ({
    ...a,
    ack: a.ack || ackIds.has(a.id),
    workOrderId: woMap[a.id] ?? a.workOrderId,
    assignee: assigneeMap[a.id] ?? a.assignee,
  }));
  const critical = list.filter((a) => a.severity === "critical" && !a.ack).length;
  const warning = list.filter((a) => a.severity === "warning" && !a.ack).length;
  const acked = list.filter((a) => a.ack).length;

  const ack = (id: string) => {
    setAckIds((s) => new Set(s).add(id));
    log("Acknowledged alert", id);
    toast.success(`Alert ${id} acknowledged`, { description: "Audit-logged · GDPR traceable" });
  };
  const createWO = (id: string) => {
    const wo = `WO-${4800 + Math.floor(Math.random() * 200)}`;
    setWoMap((m) => ({ ...m, [id]: wo }));
    log("Created work order", `${wo} ← ${id}`);
    toast.success(`${wo} created in Maximo CMMS`, { description: `Assigned to ${assigneeMap[id] ?? "Daniel Park"} · Due in 14 days` });
  };
  const snooze = (id: string) => {
    log("Snoozed alert", `${id} · 24h`);
    toast.info(`Alert ${id} snoozed for 24h`);
  };

  return (
    <AppLayout
      title={`Alerts — ${tenant.name}`}
      subtitle="Threshold, trend, and ML-detected anomalies across the fleet"
      actions={
        <Button size="sm" onClick={() => navigate({ to: "/api" })}>
          <Webhook className="size-3.5 mr-1.5" />Configure webhook
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
            {list.map((a) => {
              const open = expanded === a.id || expanded === `#${a.id}`;
              return (
                <div key={a.id} id={a.id}>
                  <button
                    onClick={() => setExpanded(open ? null : a.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <div className={`size-8 rounded-md grid place-items-center border ${severityStyles[a.severity]}`}>
                      {a.ack ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{a.message}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${severityStyles[a.severity]}`}>{a.severity}</Badge>
                        {a.ack && <Badge variant="secondary" className="text-[10px]">ack</Badge>}
                        {a.workOrderId && <Badge className="text-[10px] bg-sky-600">{a.workOrderId}</Badge>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {a.id} · {a.assetName} ({a.assetId}) · Rule: <span className="text-slate-700 dark:text-slate-300">{a.rule}</span>
                        {a.assignee && <> · Assigned to <span className="text-slate-700 dark:text-slate-300">{a.assignee}</span></>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">{a.ts}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 inline-flex items-center gap-0.5">
                        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />} details
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 -mt-1 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid md:grid-cols-3 gap-4 pt-3">
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Fault type · ML confidence</div>
                            <div className="text-sm font-medium">{a.faultType} <span className="text-slate-500 font-normal">· {(a.confidence * 100).toFixed(0)}%</span></div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended action</div>
                            <div className="text-sm">{a.recommendedAction}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Assignment</div>
                            <Select
                              value={a.assignee ?? "unassigned"}
                              onValueChange={(v) => {
                                setAssigneeMap((m) => ({ ...m, [a.id]: v }));
                                log("Reassigned alert", `${a.id} → ${v}`);
                                toast.success(`Reassigned to ${v}`);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs w-60"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {tenant.users.map((u) => (
                                  <SelectItem key={u.email} value={u.name}>{u.name} · {u.role}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => createWO(a.id)} disabled={!can("create:workorder")}>
                              <Wrench className="size-3.5 mr-1.5" />Create work order
                            </Button>
                            {!a.ack && (
                              <Button size="sm" variant="outline" onClick={() => ack(a.id)} disabled={!can("ack:alerts")}>
                                <Check className="size-3.5 mr-1.5" />Acknowledge
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => snooze(a.id)}>
                              <BellOff className="size-3.5 mr-1.5" />Snooze 24h
                            </Button>
                          </div>
                          <div className="rounded-md border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-900">
                            <div className="text-[10px] uppercase tracking-wider text-emerald-600 flex items-center gap-1 mb-1">
                              <ShieldCheck className="size-3" /> Audit trail (GDPR)
                            </div>
                            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                              {audit.filter((e) => e.target.includes(a.id)).slice(0, 3).map((e) => (
                                <li key={e.id}>{e.ts} · {e.actor} · {e.action}</li>
                              ))}
                              {audit.filter((e) => e.target.includes(a.id)).length === 0 && (
                                <li className="text-slate-400">No events yet · all future actions are logged</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {list.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No alerts for {tenant.name}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertAnalytics />
    </AppLayout>
  );
}

function AlertAnalytics() {
  const { tenant, audit } = useApp();
  const a = tenant.alertAnalytics;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <Card className="md:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Alert analytics — last 30 days</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Mean time to ack" value={`${a.mttaHours} h`} />
            <Metric label="Alert → work order" value={`${a.conversionPct}%`} />
            <Metric label="Top fault type" value={a.topFault} sub={`${a.topFaultPct}%`} />
            <Metric label="False-positive rate" value={`${a.falsePositivePct}%`} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><History className="size-4" /> Audit log</CardTitle></CardHeader>
        <CardContent className="p-0 max-h-56 overflow-auto">
          <ul className="text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
            {audit.slice(0, 8).map((e) => (
              <li key={e.id} className="px-4 py-2">
                <div className="font-medium">{e.action}</div>
                <div className="text-slate-500">{e.actor} · {e.target} · {e.ts}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

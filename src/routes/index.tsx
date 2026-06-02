import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { fleetUptimeFor, vibrationTrendForAsset } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Label as RLabel,
} from "recharts";
import { AlertTriangle as AlertIcon, TrendingUp } from "lucide-react";
import { ArrowUpRight, Cpu, Download, Radio, ShieldCheck, UserCog, Zap } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseGrid · Condition Monitoring Overview" },
      { name: "description", content: "Multi-tenant condition monitoring SaaS prototype dashboard." },
    ],
  }),
  component: Overview,
});

const COLORS = { healthy: "#10b981", warning: "#f59e0b", critical: "#ef4444" } as const;

function Kpi({ label, value, delta, icon: Icon, tone = "default" }: {
  label: string; value: string; delta?: string; icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "danger" | "good";
}) {
  const toneClass = {
    default: "text-slate-900 dark:text-slate-100",
    good: "text-emerald-600",
    warn: "text-amber-600",
    danger: "text-red-600",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{label}</span>
          <Icon className="size-4 text-slate-400" />
        </div>
        <div className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
        {delta && <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><ArrowUpRight className="size-3" />{delta}</div>}
      </CardContent>
    </Card>
  );
}

function NewRuleDialog() {
  const { tenant, can, log } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Bearing RMS critical");
  const [assetId, setAssetId] = useState<string>(tenant.assets[0]?.id ?? "");
  const [metric, setMetric] = useState("rms");
  const [op, setOp] = useState(">");
  const [value, setValue] = useState("5.0");
  const [severity, setSeverity] = useState("critical");
  const allowed = can("edit:thresholds");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!allowed} title={allowed ? "" : "Your role cannot edit thresholds"}>
          New monitoring rule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New monitoring rule — {tenant.name}</DialogTitle>
          <DialogDescription>Threshold or trend rule. Triggers create alerts, webhooks, and (optionally) CMMS work orders.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 grid gap-1.5">
            <Label className="text-xs">Rule name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Scope: Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="*">All assets in tenant</SelectItem>
                {tenant.assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.id} · {a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rms">Vibration RMS (mm/s)</SelectItem>
                <SelectItem value="temp">Temperature (°C)</SelectItem>
                <SelectItem value="trend">RMS trend (% / 24h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Operator</Label>
            <Select value={op} onValueChange={setOp}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value=">">{">"}</SelectItem>
                <SelectItem value=">=">{">="}</SelectItem>
                <SelectItem value="<">{"<"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Threshold</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8" />
          </div>
          <div className="col-span-2 grid gap-1.5">
            <Label className="text-xs">Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpen(false);
              log("Created monitoring rule", `${name} · ${metric} ${op} ${value}`);
              toast.success("Monitoring rule created", { description: `${name} · ${assetId === "*" ? "all assets" : assetId} · ${severity}` });
            }}
          >Create rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Overview() {
  const { tenant, persona, can } = useApp();
  const navigate = useNavigate();
  const [chartAssetId, setChartAssetId] = useState<string>(tenant.assets[0]?.id ?? "");
  const chartAsset = useMemo(
    () => tenant.assets.find((a) => a.id === chartAssetId) ?? tenant.assets[0],
    [chartAssetId, tenant]
  );
  const trend = vibrationTrendForAsset(tenant.id, chartAsset);
  const uptime = fleetUptimeFor(tenant.id);
  const critical = tenant.assets.filter((a) => a.health === "critical").length;
  const openAlerts = tenant.alerts.filter((a) => !a.ack).length;

  return (
    <AppLayout
      title={`${tenant.name} — Fleet Overview`}
      subtitle={`${tenant.industry} · Real-time vibration & thermal condition across all monitored assets`}
      actions={
        <>
          <Badge variant="outline" className="hidden md:inline-flex text-[10px] gap-1">
            <UserCog className="size-3" /> Viewing as {persona.role}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export started", { description: "CSV will be emailed shortly" })} disabled={!can("view:reports")}>
            <Download className="size-3.5 mr-1.5" />Export
          </Button>
          <NewRuleDialog />
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Monitored assets" value={tenant.assets.length.toLocaleString()} delta={`${critical} critical · ${tenant.assets.filter(a=>a.health==="warning").length} warning`} icon={Cpu} />
        <Kpi label="Sensors streaming" value={tenant.sensorCount.toLocaleString()} delta="99.4% online" icon={Radio} tone="good" />
        <Kpi label="Open alerts" value={String(openAlerts)} delta={`${critical} critical`} icon={Zap} tone="warn" />
        <Kpi label="SLA uptime (30d)" value={tenant.sla} delta="GDPR · SOC 2 ready" icon={ShieldCheck} tone="good" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-sm">Vibration RMS — {chartAsset.id} {chartAsset.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={chartAssetId} onValueChange={setChartAssetId}>
                  <SelectTrigger className="h-7 text-xs w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tenant.assets.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        {a.id} · {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-slate-500">48h · mm/s</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {(() => {
              const peak = trend.reduce((m: number, d: { rms: number }, i: number) => (d.rms > trend[m].rms ? i : m), 0);
              const trendShift = Math.max(0, peak - 8);
              const alertIdx = Math.max(0, peak - 3);
              const peakPoint = trend[peak];
              const isCritical = chartAsset.health === "critical";
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ left: -5, right: 40, top: 24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#64748b" }} interval={5} label={{ value: "Time (hh:mm, last 48h)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 10]} label={{ value: "RMS (mm/s)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8", offset: 15 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    {/* Healthy band */}
                    <ReferenceArea y1={0} y2={3.5} fill="#10b981" fillOpacity={0.05} />
                    <ReferenceLine y={3.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warning 3.5", fontSize: 9, fill: "#f59e0b", position: "right" }} />
                    <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical 5.0 mm/s", fontSize: 10, fill: "#ef4444", position: "right" }} />
                    <Area type="monotone" dataKey="rms" stroke="#6366f1" strokeWidth={2} fill="url(#g)" />
                    {isCritical && (
                      <>
                        <ReferenceLine x={trend[trendShift]?.t} stroke="#0ea5e9" strokeDasharray="2 2" label={{ value: "↑ Trend shift", fontSize: 9, fill: "#0ea5e9", position: "top" }} />
                        <ReferenceLine x={trend[alertIdx]?.t} stroke="#f59e0b" label={{ value: "⚠ Alert triggered", fontSize: 9, fill: "#f59e0b", position: "top" }} />
                        <ReferenceDot x={peakPoint.t} y={peakPoint.rms} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2}>
                          <RLabel value={`BPFO · ${peakPoint.rms} mm/s`} fontSize={10} fill="#ef4444" position="top" offset={10} />
                        </ReferenceDot>
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              );
            })()}
            {chartAsset.health === "critical" && (
              <div className="mt-1 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertIcon className="size-3" /> ML caught the trend ~6h before it crossed critical — RUL 9–14 days.
              </div>
            )}
            {chartAsset.health === "warning" && (
              <div className="mt-1 text-[11px] text-amber-600 flex items-center gap-1.5">
                <TrendingUp className="size-3" /> Trend rising — inspect within next planned stop.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fleet health distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tenant.healthDistribution} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {tenant.healthDistribution.map((d) => (
                    <Cell key={d.key} fill={COLORS[d.key as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 -mt-4 text-[11px]">
              {tenant.healthDistribution.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: COLORS[d.key as keyof typeof COLORS] }} />
                  {d.name} · {d.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top alerts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenant.alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <span className={`size-2 rounded-full ${
                    a.severity === "critical" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-500" : "bg-slate-400"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.message}</div>
                    <div className="text-[11px] text-slate-500">{a.assetName} · {a.rule}</div>
                  </div>
                  <span className="text-[11px] text-slate-500">{a.ts}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => navigate({ to: "/alerts", hash: a.id })}
                  >
                    Triage
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fleet uptime (14d)</CardTitle></CardHeader>
          <CardContent className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uptime} margin={{ left: -10, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[97, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="uptime" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Critical & warning assets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Asset</th>
                <th className="text-left px-4 py-2 font-medium">Site</th>
                <th className="text-left px-4 py-2 font-medium">RMS</th>
                <th className="text-left px-4 py-2 font-medium">Temp</th>
                <th className="text-left px-4 py-2 font-medium">Health</th>
                <th className="text-left px-4 py-2 font-medium">Last sync</th>
              </tr>
            </thead>
            <tbody>
              {tenant.assets.filter((a) => a.health !== "healthy").map((a) => (
                <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-[11px] text-slate-500">{a.id} · {a.type}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{a.site}</td>
                  <td className="px-4 py-2 tabular-nums">{a.vibrationRms} <span className="text-slate-400 text-xs">mm/s</span></td>
                  <td className="px-4 py-2 tabular-nums">{a.tempC}°C</td>
                  <td className="px-4 py-2"><HealthBadge h={a.health} score={a.healthScore} /></td>
                  <td className="px-4 py-2 text-slate-500 text-xs">{a.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

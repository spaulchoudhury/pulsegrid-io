import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { alerts, assets, fleetUptime, healthDistribution, vibrationTrend } from "@/lib/mock-data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Cpu, Download, Radio, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulsegrid · Condition Monitoring Overview" },
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
    default: "text-slate-900",
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

function Overview() {
  const critical = assets.filter((a) => a.health === "critical").length;
  return (
    <AppLayout
      title="Fleet Overview"
      subtitle="Real-time vibration & thermal condition across all monitored assets"
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" />Export</Button>
          <Button size="sm">New monitoring rule</Button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Monitored assets" value="211" delta="+6 this week" icon={Cpu} />
        <Kpi label="Sensors streaming" value="1,248" delta="99.4% online" icon={Radio} tone="good" />
        <Kpi label="Open alerts" value="12" delta={`${critical} critical`} icon={Zap} tone="warn" />
        <Kpi label="SLA uptime (30d)" value="99.94%" delta="GDPR · SOC 2 ready" icon={ShieldCheck} tone="good" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Vibration RMS — PMP-014 Cooling Pump</CardTitle>
              <span className="text-[11px] text-slate-500">last 48h · mm/s</span>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vibrationTrend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#64748b" }} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 10]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Alarm 5.0", fontSize: 10, fill: "#ef4444", position: "right" }} />
                <Area type="monotone" dataKey="rms" stroke="#6366f1" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fleet health distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthDistribution} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {healthDistribution.map((d) => (
                    <Cell key={d.key} fill={COLORS[d.key as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 -mt-4 text-[11px]">
              {healthDistribution.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: COLORS[d.key as keyof typeof COLORS] }} />
                  {d.name} · {d.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full ${
                      a.severity === "critical" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-500" : "bg-slate-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.message}</div>
                    <div className="text-[11px] text-slate-500">{a.assetName} · {a.rule}</div>
                  </div>
                  <span className="text-[11px] text-slate-500">{a.ts}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Triage</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fleet uptime (14d)</CardTitle>
          </CardHeader>
          <CardContent className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetUptime} margin={{ left: -10, right: 0, top: 8, bottom: 0 }}>
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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Critical & warning assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
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
              {assets.filter((a) => a.health !== "healthy").map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-[11px] text-slate-500">{a.id} · {a.type}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{a.site}</td>
                  <td className="px-4 py-2 tabular-nums">{a.vibrationRms} <span className="text-slate-400 text-xs">mm/s</span></td>
                  <td className="px-4 py-2 tabular-nums">{a.tempC}°C</td>
                  <td className="px-4 py-2"><HealthBadge h={a.health} /></td>
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

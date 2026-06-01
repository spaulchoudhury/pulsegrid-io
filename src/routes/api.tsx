import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, BookOpen, Copy, KeyRound, Plug, Webhook, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/api")({
  head: () => ({ meta: [{ title: "API & Integrations · PulseGrid" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ focus: (s.focus as string) || "" }),
  component: ApiPage,
});


const endpoints = [
  { m: "POST", p: "/v1/ingest/vibration", d: "Stream raw or aggregated vibration samples from gateways.", docs: "https://docs.pulsegrid.io/ingest" },
  { m: "GET", p: "/v1/assets/{id}/health", d: "Current health score, RMS, kurtosis, last anomaly score.", docs: "https://docs.pulsegrid.io/assets" },
  { m: "GET", p: "/v1/alerts", d: "List active and historical alerts with filters.", docs: "https://docs.pulsegrid.io/alerts" },
  { m: "POST", p: "/v1/rules", d: "Create threshold or trend-based monitoring rules.", docs: "https://docs.pulsegrid.io/rules" },
  { m: "POST", p: "/v1/webhooks", d: "Register webhook for alert.created, asset.health.changed.", docs: "https://docs.pulsegrid.io/webhooks" },
];

function ApiPage() {
  const { tenant, can, log } = useApp();
  const { focus } = Route.useSearch();
  const m = tenant.apiMetrics;
  const [errorOpen, setErrorOpen] = useState(false);
  const [latencyOpen, setLatencyOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [callsOpen, setCallsOpen] = useState(false);

  useEffect(() => {
    if (focus === "errors") setErrorOpen(true);
  }, [focus]);

  const failingEndpoints = [
    { p: "POST /v1/ingest/vibration", code: 502, count: 18, lastSeen: "12s ago", cause: "Upstream gateway timeout" },
    { p: "POST /v1/ingest/vibration", code: 429, count: 7, lastSeen: "1m ago", cause: "Rate limit burst from edge gateway" },
    { p: "GET /v1/alerts", code: 500, count: 2, lastSeen: "3m ago", cause: "Transient query timeout" },
  ];


  const sample = `curl -X POST https://api.pulsegrid.io/v1/ingest/vibration \\
  -H "Authorization: Bearer $PULSEGRID_API_KEY" \\
  -H "X-Tenant-Id: ${tenant.id}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "asset_id": "${tenant.assets[0]?.id ?? "ASSET-001"}",
    "sensor_id": "${tenant.assets[0]?.id ?? "ASSET-001"}-A1",
    "ts": "2026-05-27T10:14:22Z",
    "axis": "radial",
    "rms_mm_s": ${tenant.assets[0]?.vibrationRms ?? 2.4},
    "peak_mm_s": 14.3,
    "spectrum": [/* 1024 FFT bins */]
  }'`;

  return (
    <AppLayout
      title={`API & Integrations — ${tenant.name}`}
      subtitle="API-first ingestion, querying, and event delivery for your IT ecosystem"
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <a href="https://docs.pulsegrid.io" target="_blank" rel="noreferrer"><BookOpen className="size-3.5 mr-1.5" />Full API docs</a>
          </Button>
          <Button
            size="sm"
            onClick={() => { log("Generated API key", "Production"); toast.success("New API key generated", { description: `pg_live_${tenant.id}_${Math.random().toString(36).slice(2, 6)}…` }); }}
            disabled={!can("manage:apikeys")}
            title={can("manage:apikeys") ? "" : "Your role cannot manage API keys"}
          >
            <KeyRound className="size-3.5 mr-1.5" />New API key
          </Button>
        </>
      }
    >
      {/* API metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 flex items-center gap-1"><Activity className="size-3" /> Calls today</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{m.callsToday.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">of {m.rateLimit.toLocaleString()} / day</div>
          <Progress value={m.rateUsedPct} className="h-1.5 mt-2" />
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500">Rate limit used</div>
          <div className="text-2xl font-semibold mt-1">{m.rateUsedPct}%</div>
          <div className="text-[11px] text-slate-500">{tenant.plan} tier</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500">p95 latency</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{m.p95LatencyMs} ms</div>
          <div className="text-[11px] text-slate-500">ingest → ack</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500">Error rate</div>
          <div className={`text-2xl font-semibold mt-1 tabular-nums ${m.errorRatePct > 1 ? "text-amber-600" : "text-emerald-600"}`}>{m.errorRatePct}%</div>
          <div className="text-[11px] text-slate-500">{m.webhookDeliveries.toLocaleString()} webhook deliveries</div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">REST endpoints</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {endpoints.map((e) => (
                  <tr key={e.p} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <td className="px-4 py-2.5 w-20">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          e.m === "POST" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {e.m}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs">{e.p}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{e.d}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-[11px]">
                        <a href={e.docs} target="_blank" rel="noreferrer">
                          <BookOpen className="size-3 mr-1" />View docs
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">API keys</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tenant.apiKeys.map((k) => (
              <div key={k.label} className="p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{k.label}</span>
                  <Badge variant="secondary" className="text-[10px]">{k.scope}</Badge>
                </div>
                <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="truncate">{k.mask}</span>
                  <button onClick={() => { navigator.clipboard?.writeText(k.mask); toast.success("API key copied"); }}>
                    <Copy className="size-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ingest sample</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-slate-100 text-[11px] rounded-md p-4 overflow-auto font-mono leading-relaxed">{sample}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Plug className="size-4" /> Integrations & Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Webhook className="size-4 text-slate-500" />
              <div className="text-xs flex-1">
                <div className="font-medium">Outbound webhook</div>
                <div className="text-[10px] text-slate-500">Fires on alert.created · asset.health.changed</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Webhook endpoint saved")}>Configure</Button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenant.integrations.map((i) => (
                <div key={i.name} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-[11px] text-slate-500">{i.desc}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-[10px] ${i.status === "Connected" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900" : ""}`}
                    onClick={() => {
                      log(i.status === "Connected" ? "Opened integration" : "Connected integration", i.name);
                      toast.success(i.status === "Connected" ? `${i.name} settings opened` : `${i.name} connection started`);
                    }}
                  >
                    {i.status === "Connected" ? "Connected" : "Connect now"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

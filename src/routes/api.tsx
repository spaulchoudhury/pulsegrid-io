import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { failingEndpointsFor } from "@/lib/mock-data";
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

  const failingEndpoints = failingEndpointsFor(tenant);


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
      {/* API metrics — clickable for drill-down */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`cursor-pointer transition hover:shadow-md hover:border-slate-300 ${focus === "errors" ? "" : ""}`} onClick={() => setCallsOpen(true)}>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 flex items-center gap-1"><Activity className="size-3" /> Calls today</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{m.callsToday.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">of {m.rateLimit.toLocaleString()} / day</div>
            <Progress value={m.rateUsedPct} className="h-1.5 mt-2" />
            <div className="text-[10px] text-indigo-600 mt-1.5">Click for traffic breakdown →</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition hover:shadow-md hover:border-slate-300" onClick={() => setRateOpen(true)}>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Rate limit used</div>
            <div className="text-2xl font-semibold mt-1">{m.rateUsedPct}%</div>
            <div className="text-[11px] text-slate-500">{tenant.plan} tier</div>
            <div className="text-[10px] text-indigo-600 mt-1.5">Click to upgrade limits →</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition hover:shadow-md hover:border-slate-300" onClick={() => setLatencyOpen(true)}>
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">p95 latency</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{m.p95LatencyMs} ms</div>
            <div className="text-[11px] text-slate-500">ingest → ack</div>
            <div className="text-[10px] text-indigo-600 mt-1.5">Click for latency breakdown →</div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition hover:shadow-md ${m.errorRatePct > 1 ? "border-amber-300 bg-amber-50/40 dark:bg-amber-950/20" : "hover:border-slate-300"} ${focus === "errors" ? "ring-2 ring-amber-400" : ""}`}
          onClick={() => setErrorOpen(true)}
        >
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 flex items-center gap-1">Error rate {m.errorRatePct > 1 && <AlertTriangle className="size-3 text-amber-600" />}</div>
            <div className={`text-2xl font-semibold mt-1 tabular-nums ${m.errorRatePct > 1 ? "text-amber-600" : "text-emerald-600"}`}>{m.errorRatePct}%</div>
            <div className="text-[11px] text-slate-500">{m.webhookDeliveries.toLocaleString()} webhook deliveries</div>
            <div className="text-[10px] text-indigo-600 mt-1.5">{m.errorRatePct > 1 ? "Click to triage errors →" : "Click for error log →"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error triage dialog */}
      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-600" /> API integration errors — last 15 min</DialogTitle>
            <DialogDescription>
              Current error rate <strong>{m.errorRatePct}%</strong> across {tenant.name}'s ingestion endpoints. Triage failing endpoints below.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md divide-y divide-slate-100 dark:divide-slate-800">
            {failingEndpoints.map((e, i) => (
              <div key={i} className="p-3 flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={`text-[10px] font-mono ${e.code >= 500 ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{e.code}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono">{e.p}</div>
                  <div className="text-[11px] text-slate-500">{e.cause} · {e.count} occurrences · last {e.lastSeen}</div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { log("Retried failed endpoint", e.p); toast.success(`Retry queued for ${e.p}`); }}>
                  <RefreshCw className="size-3 mr-1" />Retry
                </Button>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-500">
            Recommended: rotate the affected ingestion key, scale gateway worker pool, or raise a ticket with PulseGrid support.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setErrorOpen(false)}>Close</Button>
            <Button size="sm" onClick={() => { log("Opened support ticket", "API errors"); toast.success("Support ticket #PG-8821 opened"); setErrorOpen(false); }}>Open support ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={callsOpen} onOpenChange={setCallsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traffic breakdown · today</DialogTitle>
            <DialogDescription>{m.callsToday.toLocaleString()} calls so far across {tenant.name}.</DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>POST /v1/ingest/vibration</span><span className="font-mono">{Math.round(m.callsToday * 0.78).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>GET /v1/assets/*/health</span><span className="font-mono">{Math.round(m.callsToday * 0.12).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>GET /v1/alerts</span><span className="font-mono">{Math.round(m.callsToday * 0.07).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Other</span><span className="font-mono">{Math.round(m.callsToday * 0.03).toLocaleString()}</span></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate limits — {tenant.plan} tier</DialogTitle>
            <DialogDescription>Used {m.rateUsedPct}% of {m.rateLimit.toLocaleString()} daily calls.</DialogDescription>
          </DialogHeader>
          <Progress value={m.rateUsedPct} className="h-2" />
          <div className="text-xs text-slate-500">Upgrade to Enterprise for 5M calls/day + dedicated throughput.</div>
          <DialogFooter><Button size="sm" onClick={() => { toast.success("Upgrade request sent to billing"); setRateOpen(false); }}>Request upgrade</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={latencyOpen} onOpenChange={setLatencyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>p95 latency breakdown</DialogTitle>
            <DialogDescription>End-to-end ingest → ack across the last hour.</DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Edge gateway → API</span><span className="font-mono">{Math.round(m.p95LatencyMs * 0.35)} ms</span></div>
            <div className="flex justify-between"><span>API validation + auth</span><span className="font-mono">{Math.round(m.p95LatencyMs * 0.15)} ms</span></div>
            <div className="flex justify-between"><span>Stream → time-series store</span><span className="font-mono">{Math.round(m.p95LatencyMs * 0.30)} ms</span></div>
            <div className="flex justify-between"><span>ML scoring + ack</span><span className="font-mono">{Math.round(m.p95LatencyMs * 0.20)} ms</span></div>
          </div>
        </DialogContent>
      </Dialog>


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

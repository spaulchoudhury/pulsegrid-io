import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, KeyRound, Plug } from "lucide-react";

export const Route = createFileRoute("/api")({
  head: () => ({ meta: [{ title: "API & Integrations · Pulsegrid" }] }),
  component: ApiPage,
});

const endpoints = [
  { m: "POST", p: "/v1/ingest/vibration", d: "Stream raw or aggregated vibration samples from gateways." },
  { m: "GET", p: "/v1/assets/{id}/health", d: "Current health score, RMS, kurtosis, last anomaly score." },
  { m: "GET", p: "/v1/alerts", d: "List active and historical alerts with filters." },
  { m: "POST", p: "/v1/rules", d: "Create threshold or trend-based monitoring rules." },
  { m: "POST", p: "/v1/webhooks", d: "Register webhook for alert.created, asset.health.changed." },
];

const integrations = [
  { name: "SAP PM", status: "Connected", desc: "Work-order creation on critical alerts" },
  { name: "Maximo CMMS", status: "Connected", desc: "Bi-directional asset sync" },
  { name: "Slack", status: "Connected", desc: "#reliability channel notifications" },
  { name: "Microsoft Teams", status: "Available", desc: "Alert cards & approvals" },
  { name: "PowerBI", status: "Available", desc: "Live dataset for BI dashboards" },
];

const sample = `curl -X POST https://api.pulsegrid.io/v1/ingest/vibration \\
  -H "Authorization: Bearer $PULSEGRID_API_KEY" \\
  -H "X-Tenant-Id: acme" \\
  -H "Content-Type: application/json" \\
  -d '{
    "asset_id": "PMP-014",
    "sensor_id": "PMP-014-A1",
    "ts": "2026-05-27T10:14:22Z",
    "axis": "radial",
    "rms_mm_s": 7.82,
    "peak_mm_s": 14.3,
    "spectrum": [/* 1024 FFT bins */]
  }'`;

function ApiPage() {
  return (
    <AppLayout
      title="API & Integrations"
      subtitle="API-first ingestion, querying, and event delivery for your IT ecosystem"
      actions={<Button size="sm"><KeyRound className="size-3.5 mr-1.5" />New API key</Button>}
    >
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">REST endpoints</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {endpoints.map((e) => (
                  <tr key={e.p} className="border-b border-slate-50 last:border-0">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">API keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Production</span>
                <Badge variant="secondary" className="text-[10px]">read · write</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-slate-600">
                <span className="truncate">pg_live_acme_••••••••••a91f</span>
                <Copy className="size-3 cursor-pointer hover:text-slate-900" />
              </div>
            </div>
            <div className="p-3 rounded-md border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Ingestion (gateway)</span>
                <Badge variant="secondary" className="text-[10px]">ingest only</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-slate-600">
                <span className="truncate">pg_ing_acme_••••••••••7c20</span>
                <Copy className="size-3 cursor-pointer hover:text-slate-900" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ingest sample</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-slate-100 text-[11px] rounded-md p-4 overflow-auto font-mono leading-relaxed">
{sample}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Plug className="size-4" /> Integrations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {integrations.map((i) => (
                <div key={i.name} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-[11px] text-slate-500">{i.desc}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      i.status === "Connected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                    }`}
                  >
                    {i.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

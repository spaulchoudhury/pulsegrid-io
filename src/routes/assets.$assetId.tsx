import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { assets, vibrationTrend } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { ArrowLeft, BrainCircuit, Wrench, Radio } from "lucide-react";

export const Route = createFileRoute("/assets/$assetId")({
  loader: ({ params }) => {
    const asset = assets.find((a) => a.id === params.assetId);
    if (!asset) throw notFound();
    return { asset };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.asset.name ?? "Asset"} · Pulsegrid` }],
  }),
  notFoundComponent: () => (
    <AppLayout title="Asset not found"><p className="text-sm text-slate-500">No asset matches that ID.</p></AppLayout>
  ),
  component: AssetDetail,
});

// Mocked FFT spectrum bins
const spectrum = Array.from({ length: 32 }, (_, i) => ({
  hz: `${(i + 1) * 25}`,
  amp: +(Math.max(0.1, Math.sin(i / 3) * 0.6 + (i === 12 || i === 13 ? 1.8 : 0) + Math.random() * 0.2)).toFixed(2),
}));

function AssetDetail() {
  const { asset } = Route.useLoaderData();

  return (
    <AppLayout
      title={asset.name}
      subtitle={`${asset.id} · ${asset.type} · ${asset.site}`}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/assets"><ArrowLeft className="size-3.5 mr-1.5" />All assets</Link></Button>
          <Button size="sm"><Wrench className="size-3.5 mr-1.5" />Create work order</Button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Health</div><div className="mt-2"><HealthBadge h={asset.health} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Vibration RMS</div><div className="text-2xl font-semibold mt-1 tabular-nums">{asset.vibrationRms} <span className="text-xs text-slate-400">mm/s</span></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Temperature</div><div className="text-2xl font-semibold mt-1 tabular-nums">{asset.tempC}°C</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Last sensor sync</div><div className="text-2xl font-semibold mt-1">{asset.lastSync}</div></CardContent></Card>
      </div>

      <Card className="mt-4 border-violet-200 bg-violet-50/40">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-violet-700" />
            <CardTitle className="text-sm text-violet-900">Predictive insight</CardTitle>
            <Badge className="ml-auto bg-violet-600 text-white text-[10px]">ML · confidence 0.87</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            Bearing outer-race defect frequency (BPFO ≈ 312 Hz) is emerging in the spectrum.
            Trend suggests <span className="font-semibold">remaining useful life of 9–14 days</span> at current load.
          </p>
          <p className="text-xs text-slate-600">
            Recommended action: schedule bearing replacement within the next planned shutdown window. Reduce load by 15% in the meantime.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vibration RMS — 48h trend</CardTitle></CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vibrationTrend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#64748b" }} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 10]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="rms" stroke="#ef4444" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">FFT spectrum (latest)</CardTitle></CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spectrum} margin={{ left: -10, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hz" tick={{ fontSize: 9, fill: "#64748b" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="amp" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-emerald-600" />
            <CardTitle className="text-sm">Live ingest stream</CardTitle>
            <Badge variant="secondary" className="ml-auto text-[10px]">POST /v1/ingest/vibration</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs font-mono">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr><th className="text-left px-4 py-2">ts</th><th className="text-left px-4 py-2">sensor</th><th className="text-left px-4 py-2">axis</th><th className="text-left px-4 py-2">rms</th><th className="text-left px-4 py-2">peak</th></tr>
            </thead>
            <tbody>
              {[
                ["10:14:22", "PMP-014-A1", "radial", "7.82", "14.3"],
                ["10:14:21", "PMP-014-A1", "axial", "3.41", "6.1"],
                ["10:14:20", "PMP-014-A2", "radial", "7.68", "13.9"],
                ["10:14:19", "PMP-014-A1", "radial", "7.74", "14.0"],
                ["10:14:18", "PMP-014-A2", "axial", "3.22", "5.8"],
              ].map((r, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  {r.map((c, j) => <td key={j} className="px-4 py-1.5 text-slate-700">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

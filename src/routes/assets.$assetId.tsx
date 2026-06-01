import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { vibrationTrendForAsset, fftSpectrumForAsset } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Label as RLabel, Legend } from "recharts";
import { ArrowLeft, BrainCircuit, Wrench, Radio } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assets/$assetId")({
  head: ({ params }) => ({ meta: [{ title: `${params.assetId} · PulseGrid` }] }),
  notFoundComponent: () => (
    <AppLayout title="Asset not found"><p className="text-sm text-slate-500">No asset matches that ID for this tenant.</p></AppLayout>
  ),
  component: AssetDetail,
});

function scoreColor(s: number) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 50) return "text-amber-600";
  return "text-red-600";
}

function AssetDetail() {
  const { assetId } = Route.useParams();
  const { tenant } = useApp();
  const asset = tenant.assets.find((a) => a.id === assetId);

  if (!asset) {
    return (
      <AppLayout title="Asset not in this tenant" subtitle={`${assetId} is not part of ${tenant.name}`}>
        <Card><CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
          This asset belongs to a different tenant. Switch tenant or return to the assets list.
          <div className="mt-4"><Button asChild size="sm"><Link to="/assets"><ArrowLeft className="size-3.5 mr-1.5" />Back to assets</Link></Button></div>
        </CardContent></Card>
      </AppLayout>
    );
  }

  const trend = vibrationTrendForAsset(tenant.id, asset);
  const otherTrends = tenant.assets.filter((a) => a.id !== asset.id).map((a) => vibrationTrendForAsset(tenant.id, a));
  const merged = trend.map((d, i) => {
    const fleetAvg = otherTrends.length
      ? +(otherTrends.reduce((s, t) => s + (t[i]?.rms ?? 0), 0) / otherTrends.length).toFixed(2)
      : 0;
    return { t: d.t, rms: d.rms, fleet: fleetAvg };
  });
  const peakIdx = merged.reduce((m, d, i) => (d.rms > merged[m].rms ? i : m), 0);
  const peakValue = merged[peakIdx].rms;
  const fleetAvgOverall = +(merged.reduce((s, d) => s + d.fleet, 0) / merged.length).toFixed(2);
  const assetAvg = +(merged.reduce((s, d) => s + d.rms, 0) / merged.length).toFixed(2);
  const deltaPct = fleetAvgOverall > 0 ? Math.round(((assetAvg - fleetAvgOverall) / fleetAvgOverall) * 100) : 0;
  const trendDeltaPct = Math.round(((merged[merged.length - 1].rms - merged[0].rms) / Math.max(0.1, merged[0].rms)) * 100);

  const { bins: spectrum, peakHz, peakAmp } = fftSpectrumForAsset(asset);

  const rul = asset.health === "critical" ? "9–14 days" : asset.health === "warning" ? "30–45 days" : "> 180 days";
  const confidence = asset.health === "critical" ? 0.87 : asset.health === "warning" ? 0.72 : 0.58;
  const faultLabel = asset.health === "critical"
    ? `Bearing outer-race defect (BPFO @ ${peakHz} Hz) emerging`
    : asset.health === "warning"
      ? `Early-stage anomaly — energy concentrating near ${peakHz} Hz`
      : `Operating within learned baseline (dominant ${peakHz} Hz is design-normal)`;

  return (
    <AppLayout
      title={asset.name}
      subtitle={`${asset.id} · ${asset.type} · ${asset.site} · ${tenant.name}`}
      actions={
        <>
          <Button asChild variant="outline" size="sm"><Link to="/assets"><ArrowLeft className="size-3.5 mr-1.5" />All assets</Link></Button>
          <Button size="sm" onClick={() => toast.success(`Work order WO-${Math.floor(Math.random() * 9000 + 1000)} created`, { description: `${asset.name} · routed to maintenance queue` })}>
            <Wrench className="size-3.5 mr-1.5" />Create work order
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500">Health</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-semibold tabular-nums ${scoreColor(asset.healthScore)}`}>{asset.healthScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-1.5"><HealthBadge h={asset.health} /></div>
        </CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Vibration RMS</div><div className="text-2xl font-semibold mt-1 tabular-nums">{asset.vibrationRms} <span className="text-xs text-slate-400">mm/s</span></div><div className="text-[11px] text-slate-500 mt-1">48h peak: {peakValue} mm/s</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Temperature</div><div className="text-2xl font-semibold mt-1 tabular-nums">{asset.tempC}°C</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Last sensor sync</div><div className="text-2xl font-semibold mt-1">{asset.lastSync}</div></CardContent></Card>
      </div>

      <Card className="mt-4 border-violet-200 bg-violet-50/40 dark:bg-violet-950/30 dark:border-violet-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-violet-700 dark:text-violet-300" />
            <CardTitle className="text-sm text-violet-900 dark:text-violet-200">Predictive insight</CardTitle>
            <Badge className="ml-auto bg-violet-600 text-white text-[10px]">ML · confidence {confidence.toFixed(2)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <p>
            {faultLabel}. Current RMS <span className="font-semibold">{asset.vibrationRms} mm/s</span> ({trendDeltaPct >= 0 ? "+" : ""}{trendDeltaPct}% over 48h, {deltaPct >= 0 ? "+" : ""}{deltaPct}% vs fleet). Estimated <span className="font-semibold">remaining useful life: {rul}</span>.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Recommended action: {asset.health === "healthy" ? "continue monitoring." : asset.health === "warning" ? "schedule inspection within the next planned shutdown window." : "stage replacement parts and schedule shutdown within RUL window."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-sm">Vibration RMS — {asset.id} vs fleet average · 48h</CardTitle>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> {asset.id} ({asset.health})</span>
                <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-slate-400" /> Fleet avg</span>
                <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> Threshold</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged} margin={{ left: 0, right: 40, top: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#64748b" }} interval={5} label={{ value: "Time (hh:mm)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax + 1))]} label={{ value: "RMS (mm/s)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Critical 5.0", fontSize: 9, fill: "#f59e0b", position: "right" }} />
                <Line type="monotone" dataKey="fleet" name="Fleet avg" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rms" name={asset.id} stroke="#ef4444" strokeWidth={2.2} dot={false} />
                {asset.health !== "healthy" && (
                  <ReferenceDot x={merged[peakIdx].t} y={merged[peakIdx].rms} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2}>
                    <RLabel value={`${asset.health === "critical" ? "BPFO" : "peak"} · ${merged[peakIdx].rms}`} fontSize={10} fill="#ef4444" position="top" offset={10} />
                  </ReferenceDot>
                )}
              </LineChart>
            </ResponsiveContainer>
            <div className={`mt-1 text-[11px] ${deltaPct > 30 ? "text-red-600" : deltaPct > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {asset.id} is {deltaPct >= 0 ? `${deltaPct}% above` : `${Math.abs(deltaPct)}% below`} fleet average ({assetAvg} vs {fleetAvgOverall} mm/s) — {deltaPct > 30 ? "investigate immediately." : deltaPct > 0 ? "monitor closely." : "within expected band."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">FFT spectrum — frequency vs amplitude</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spectrum} margin={{ left: 0, right: 8, top: 20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hz" tick={{ fontSize: 9, fill: "#64748b" }} interval={3} label={{ value: "Frequency (Hz)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Amplitude (mm/s²)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v} mm/s²`, "Amplitude"]} labelFormatter={(l) => `${l} Hz`} />
                <Bar dataKey="amp" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <ReferenceLine x={peakHz} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `${asset.health === "critical" ? "BPFO" : "dominant"} ${peakHz}Hz · ${peakAmp}`, fontSize: 9, fill: "#ef4444", position: "top" }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 text-[11px] text-slate-500">
              Dominant peak at {peakHz} Hz {asset.health === "critical" ? "matches BPFO for this bearing geometry — outer-race defect." : asset.health === "warning" ? "is rising above baseline — early bearing wear suspected." : "is the asset's design-normal running frequency."}
            </div>
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
            <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr><th className="text-left px-4 py-2">ts</th><th className="text-left px-4 py-2">sensor</th><th className="text-left px-4 py-2">axis</th><th className="text-left px-4 py-2">rms</th><th className="text-left px-4 py-2">peak</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, i) => {
                const base = asset.vibrationRms;
                const rms = (base + (Math.sin(i + asset.id.length) * 0.2)).toFixed(2);
                const pk = (base * 1.8 + i * 0.1).toFixed(1);
                return [
                  `10:14:${22 - i}`,
                  `${asset.id}-A${(i % 2) + 1}`,
                  i % 2 === 0 ? "radial" : "axial",
                  rms,
                  pk,
                ];
              }).map((r, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                  {r.map((c, j) => <td key={j} className="px-4 py-1.5 text-slate-700 dark:text-slate-300">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { assets } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets · Pulsegrid" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  return (
    <AppLayout
      title="Assets"
      subtitle="All monitored equipment across sites and lines"
      actions={
        <>
          <Button variant="outline" size="sm"><Filter className="size-3.5 mr-1.5" />Filter</Button>
          <Button size="sm"><Plus className="size-3.5 mr-1.5" />Add asset</Button>
        </>
      }
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Input placeholder="Search by name, ID, type…" className="h-8 max-w-sm text-sm" />
            <div className="ml-auto text-xs text-slate-500">{assets.length} assets · 1,248 sensors</div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Asset</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Site</th>
                <th className="text-left px-3 py-2 font-medium">Vibration RMS</th>
                <th className="text-left px-3 py-2 font-medium">Temperature</th>
                <th className="text-left px-3 py-2 font-medium">Health</th>
                <th className="text-left px-3 py-2 font-medium">Last sync</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-3 py-2.5">
                    <Link to="/assets/$assetId" params={{ assetId: a.id }} className="font-medium hover:underline">{a.name}</Link>
                    <div className="text-[11px] text-slate-500">{a.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{a.type}</td>
                  <td className="px-3 py-2.5 text-slate-600">{a.site}</td>
                  <td className="px-3 py-2.5 tabular-nums">{a.vibrationRms} <span className="text-slate-400 text-xs">mm/s</span></td>
                  <td className="px-3 py-2.5 tabular-nums">{a.tempC}°C</td>
                  <td className="px-3 py-2.5"><HealthBadge h={a.health} /></td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">{a.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

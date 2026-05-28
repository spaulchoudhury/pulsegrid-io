import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/assets/")({
  head: () => ({ meta: [{ title: "Assets · Pulsegrid" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  const { tenant, search } = useApp();
  const [local, setLocal] = useState("");
  const q = (search || local).trim().toLowerCase();
  const rows = q
    ? tenant.assets.filter((a) =>
        [a.name, a.id, a.type, a.site].some((f) => f.toLowerCase().includes(q))
      )
    : tenant.assets;

  return (
    <AppLayout
      title="Assets"
      subtitle={`${tenant.name} — all monitored equipment across sites and lines`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Filter panel coming soon")}>
            <Filter className="size-3.5 mr-1.5" />Filter
          </Button>
          <Button size="sm" onClick={() => toast.success("Asset onboarding wizard launched")}>
            <Plus className="size-3.5 mr-1.5" />Add asset
          </Button>
        </>
      }
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search by name, ID, type…"
              className="h-8 max-w-sm text-sm"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
            <div className="ml-auto text-xs text-slate-500">
              {rows.length} of {tenant.assets.length} assets · {tenant.sensorCount.toLocaleString()} sensors
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800">
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
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2.5">
                    <Link to="/assets/$assetId" params={{ assetId: a.id }} className="font-medium hover:underline">
                      {a.name}
                    </Link>
                    <div className="text-[11px] text-slate-500">{a.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{a.type}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{a.site}</td>
                  <td className="px-3 py-2.5 tabular-nums">{a.vibrationRms} <span className="text-slate-400 text-xs">mm/s</span></td>
                  <td className="px-3 py-2.5 tabular-nums">{a.tempC}°C</td>
                  <td className="px-3 py-2.5"><HealthBadge h={a.health} /></td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">{a.lastSync}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">No assets match "{q}"</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

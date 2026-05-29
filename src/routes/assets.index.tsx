import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, HealthBadge } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/assets/")({
  head: () => ({ meta: [{ title: "Assets · Pulsegrid" }] }),
  component: AssetsPage,
});

type SortKey = "name" | "type" | "site" | "vibrationRms" | "tempC" | "healthScore" | "lastSync";

function AssetsPage() {
  const { tenant, search, can } = useApp();
  const [local, setLocal] = useState("");
  const [site, setSite] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [health, setHealth] = useState<string>("all");
  const [groupBys, setGroupBys] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("healthScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sites = useMemo(() => Array.from(new Set(tenant.assets.map((a) => a.site))), [tenant]);
  const types = useMemo(() => Array.from(new Set(tenant.assets.map((a) => a.type))), [tenant]);

  const q = (search || local).trim().toLowerCase();
  const rows = useMemo(() => {
    let r = tenant.assets.slice();
    if (q) r = r.filter((a) => [a.name, a.id, a.type, a.site].some((f) => f.toLowerCase().includes(q)));
    if (site !== "all") r = r.filter((a) => a.site === site);
    if (type !== "all") r = r.filter((a) => a.type === type);
    if (health !== "all") r = r.filter((a) => a.health === health);
    r.sort((a, b) => {
      const av = a[sortBy] as string | number;
      const bv = b[sortBy] as string | number;
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [tenant.assets, q, site, type, health, sortBy, sortDir]);

  const grouped = useMemo(() => {
    if (groupBys.length === 0) return null;
    const map = new Map<string, typeof rows>();
    for (const r of rows) {
      const key = groupBys.map((g) => (r as any)[g]).join(" · ");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [rows, groupBys]);

  const toggleSort = (k: SortKey) => {
    if (sortBy === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(k); setSortDir("asc"); }
  };
  const toggleGroup = (k: string) => {
    setGroupBys((g) => g.includes(k) ? g.filter((x) => x !== k) : [...g, k]);
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="text-left px-3 py-2 font-medium cursor-pointer select-none whitespace-nowrap"
      onClick={(e) => { if (e.shiftKey) toggleGroup(k); else toggleSort(k); }}
      title="Click to sort · Shift+Click to group"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortBy === k && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
        {groupBys.includes(k) && <Badge variant="secondary" className="ml-1 text-[9px]">grp</Badge>}
      </span>
    </th>
  );

  return (
    <AppLayout
      title="Assets"
      subtitle={`${tenant.name} — ${tenant.assets.length} monitored assets across ${sites.length} site(s) · ${tenant.sensorCount.toLocaleString()} sensors`}
      actions={
        <Button size="sm" onClick={() => toast.success("Asset onboarding wizard launched")} disabled={!can("manage:apikeys") && !can("edit:thresholds")}>
          <Plus className="size-3.5 mr-1.5" />Add asset
        </Button>
      }
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Input
              placeholder="Search by name, ID, type…"
              className="h-8 max-w-xs text-sm"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue placeholder="Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {sites.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="Health" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any health</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-slate-500">
              {rows.length} of {tenant.assets.length} · Shift+click headers to group
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <Th k="name" label="Asset" />
                <Th k="type" label="Type" />
                <Th k="site" label="Site" />
                <Th k="vibrationRms" label="RMS" />
                <Th k="tempC" label="Temp" />
                <Th k="healthScore" label="Health · score" />
                <Th k="lastSync" label="Last sync" />
              </tr>
            </thead>
            <tbody>
              {grouped ? grouped.map(([k, items]) => (
                <tbody key={`g-${k}`}>
                  <tr className="bg-slate-50 dark:bg-slate-800/60">
                    <td colSpan={7} className="px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {k} <span className="text-slate-400">· {items.length}</span>
                    </td>
                  </tr>
                  {items.map((a) => <Row key={a.id} a={a} />)}
                </tbody>
              )) : rows.map((a) => <Row key={a.id} a={a} />)}
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">No assets match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Row({ a }: { a: any }) {
  return (
    <tr className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
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
      <td className="px-3 py-2.5"><HealthBadge h={a.health} score={a.healthScore} /></td>
      <td className="px-3 py-2.5 text-slate-500 text-xs">{a.lastSync}</td>
    </tr>
  );
}

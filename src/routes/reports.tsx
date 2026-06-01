import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarClock, Download, Eye, FileText, Plus, Share2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TenantData } from "@/lib/mock-data";


export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · PulseGrid" }] }),
  component: ReportsPage,
});

interface ScheduledReport {
  id: string;
  name: string;
  cadence: "Weekly" | "Monthly" | "Custom";
  recipients: string;
  next: string;
}

const TEMPLATES = [
  { id: "asset-health", name: "Asset Health Summary", desc: "Fleet-wide RMS, temperature, health-score distribution for the period." },
  { id: "alert-activity", name: "Alert Activity Log", desc: "Every alert raised, acknowledged, and converted to a work order. GDPR audit-trail format.", audit: true },
  { id: "mtbf-mttr", name: "MTBF / MTTR Analysis", desc: "Per-asset mean-time-between-failures and mean-time-to-repair, with trendlines." },
  { id: "sensor-uptime", name: "Sensor Uptime Report", desc: "Gateway and sensor availability, dropout events, and reconnect MTTR." },
];

function ReportsPage() {
  const { tenant, log } = useApp();
  const [tab, setTab] = useState<"Weekly" | "Monthly" | "Custom">("Weekly");

  const [reports, setReports] = useState<ScheduledReport[]>([
    { id: "r-001", name: "Fleet Health Summary", cadence: "Weekly", recipients: `plant-manager@${tenant.subdomain}.com`, next: "Monday 08:00" },
    { id: "r-002", name: "Maintenance Actions Report", cadence: "Monthly", recipients: `reliability@${tenant.subdomain}.com`, next: "Jul 1" },
    { id: "r-003", name: "Critical Alerts Digest", cadence: "Custom", recipients: `ops-leads@${tenant.subdomain}.com`, next: "Daily 06:00 (Mon–Fri)" },
  ]);

  const filtered = reports.filter((r) => r.cadence === tab);

  return (
    <AppLayout
      title={`Reports — ${tenant.name}`}
      subtitle="Scheduled and ad-hoc reports for plant managers, reliability teams, and auditors"
      actions={
        <Button
          size="sm"
          onClick={() => {
            const id = `r-${Date.now()}`;
            setReports((r) => [...r, { id, name: `New ${tab.toLowerCase()} report`, cadence: tab, recipients: tenant.primaryUser.email, next: tab === "Weekly" ? "Next Monday 08:00" : "Next month" }]);
            log("Created scheduled report", `${tab} report`);
            toast.success("New report scheduled");
          }}
        >
          <Plus className="size-3.5 mr-1.5" />New report
        </Button>
      }
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm">Scheduled reports</CardTitle>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="Weekly" className="text-xs">Weekly</TabsTrigger>
                <TabsTrigger value="Monthly" className="text-xs">Monthly</TabsTrigger>
                <TabsTrigger value="Custom" className="text-xs">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} />
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="size-9 rounded-md bg-slate-100 dark:bg-slate-800 grid place-items-center">
                  <FileText className="size-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.name} <span className="text-[11px] text-slate-500 font-normal">({r.cadence})</span></div>
                  <div className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                    <CalendarClock className="size-3" /> Recipients: {r.recipients} · Next: {r.next}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.success(`Editing ${r.name}`)}>Edit</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { log("Downloaded report", r.name); toast.success(`${r.name} · PDF generated`); }}>
                  <Download className="size-3 mr-1" />PDF
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { navigator.clipboard?.writeText(`https://${tenant.subdomain}.pulsegrid.io/reports/${r.id}`); toast.success("Share link copied"); }}>
                  <Share2 className="size-3 mr-1" />Share link
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No {tab.toLowerCase()} reports yet — click <strong>New report</strong> to schedule one.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Report templates</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-start gap-3 border-b last:border-0 md:border-b border-slate-100 dark:border-slate-800">
                <FileText className="size-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {t.name}
                    {t.audit && (
                      <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50">
                        <ShieldCheck className="size-3 mr-1" />GDPR audit trail
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { log("Generated report", t.name); toast.success(`Generating ${t.name}…`); }}>Generate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

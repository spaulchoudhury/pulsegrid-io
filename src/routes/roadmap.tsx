import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Zap, BrainCircuit, Smartphone, Globe2, Check } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap · Pulsegrid" }] }),
  component: RoadmapPage,
});

const phases = [
  {
    p: "Phase 1", q: "Now · Q2-Q3 2026", status: "Shipping", progress: 80,
    icon: Activity, title: "Vibration-based monitoring",
    unlocks: "Reliability teams catch bearing & misalignment faults weeks before failure — cutting unplanned downtime on day one.",
    items: ["Real-time RMS, peak, kurtosis ingestion", "Threshold + trend alerting", "Multi-tenant dashboard & RBAC", "REST ingest & query APIs"],
  },
  {
    p: "Phase 2", q: "Q4 2026", status: "In design", progress: 35,
    icon: Zap, title: "Current-based monitoring (MCSA)",
    unlocks: "Detect electrical-side faults (rotor bars, stator) without bolting on more sensors — using current already measured at the drive.",
    items: ["Motor current signature analysis", "Rotor bar / stator fault detection", "Cross-modal correlation with vibration", "Unified asset health score"],
  },
  {
    p: "Phase 3", q: "H1 2027", status: "Research", progress: 15,
    icon: BrainCircuit, title: "Predictive AI/ML models",
    unlocks: "Move from \"something looks wrong\" to \"this bearing fails in 12 days, here is the recommended action\" — actionable RUL estimates.",
    items: ["Per-asset anomaly baselines (autoencoder)", "Remaining-useful-life (RUL) estimates", "Failure-mode classification", "Recommended maintenance actions"],
  },
  {
    p: "Phase 4", q: "H2 2027", status: "Planned", progress: 5,
    icon: Smartphone, title: "Mobile, self-service & ecosystem",
    unlocks: "Field engineers triage from a phone; analysts build reports without IT; partners plug into the platform via marketplace.",
    items: ["iOS / Android technician app", "Self-service analytics & report builder", "Marketplace integrations (SAP, IBM Maximo, Oracle)", "Partner SDK"],
  },
  {
    p: "Phase 5", q: "2028", status: "Vision", progress: 0,
    icon: Globe2, title: "Global multi-region scale",
    unlocks: "Global industrial operators get region-local data, customer-managed keys, and 99.99% SLA — unblocking the largest enterprise deals.",
    items: ["Active-active multi-region deployment", "Customer-managed encryption keys", "Edge pre-processing at gateway", "99.99% SLA tier"],
  },
];

function RoadmapPage() {
  return (
    <AppLayout title="Product Roadmap" subtitle="Evolution from vibration to multi-modal, AI-driven condition intelligence">
      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-4">
          {phases.map((ph) => {
            const Icon = ph.icon;
            return (
              <Card key={ph.p} className="ml-12 relative">
                <div className="absolute -left-[34px] top-5 size-9 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 grid place-items-center">
                  <Icon className="size-4 text-slate-700 dark:text-slate-300" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{ph.p}</Badge>
                    <CardTitle className="text-sm">{ph.title}</CardTitle>
                    <span className="text-[11px] text-slate-500">{ph.q}</span>
                    <Badge
                      variant="outline"
                      className={`ml-auto text-[10px] ${
                        ph.status === "Shipping" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        ph.status === "In design" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        ph.status === "Research" ? "bg-violet-50 text-violet-700 border-violet-200" : ""
                      }`}
                    >{ph.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={ph.progress} className="h-1.5 flex-1" />
                    <span className="text-[11px] text-slate-500 tabular-nums w-12 text-right">{ph.progress}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-2 mb-3">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-300">What it unlocks for customers</div>
                    <div className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{ph.unlocks}</div>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ph.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Check className="size-3.5 text-emerald-600 mt-0.5 shrink-0" /> {it}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

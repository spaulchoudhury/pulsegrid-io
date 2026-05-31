import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Billing & Usage · PulseGrid" }] }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Pilot", price: "€0", per: "60-day evaluation", cta: "Start pilot", assets: 25, apiCallsMo: 100_000,
    blurb: "For a single line or pump skid. Prove value before procurement.",
    features: ["Up to 25 assets", "Vibration monitoring", "Email alerts", "Community support"],
    highlight: false,
  },
  {
    name: "Growth", price: "€18", per: "asset / month", cta: "Talk to sales", assets: 500, apiCallsMo: 9_000_000,
    blurb: "Single-site teams scaling reliability programs.",
    features: ["Up to 500 assets", "Vibration + current (Phase 2)", "Webhooks · Slack · Teams", "SAP PM / Maximo integration", "99.9% SLA"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", per: "annual contract", cta: "Contact us", assets: 99999, apiCallsMo: 100_000_000,
    blurb: "Multi-site, multi-region industrial operators.",
    features: ["Unlimited assets & tenants", "Predictive AI/ML models", "SSO · SAML · MFA enforced", "EU data residency · CMK encryption", "99.95% SLA · 24×7 support", "Dedicated CSM"],
    highlight: false,
  },
];

const compareRows: { feature: string; pilot: boolean | string; growth: boolean | string; enterprise: boolean | string }[] = [
  { feature: "Vibration monitoring (RMS, peak, FFT)", pilot: true, growth: true, enterprise: true },
  { feature: "Threshold & trend alerts", pilot: true, growth: true, enterprise: true },
  { feature: "Current-based monitoring (MCSA)", pilot: false, growth: true, enterprise: true },
  { feature: "Predictive AI/ML & RUL estimates", pilot: false, growth: false, enterprise: true },
  { feature: "CMMS integration (SAP, Maximo)", pilot: false, growth: true, enterprise: true },
  { feature: "Webhooks · Slack · Teams", pilot: "Email only", growth: true, enterprise: true },
  { feature: "SSO · SAML · MFA enforcement", pilot: false, growth: "SSO", enterprise: true },
  { feature: "EU data residency · CMK encryption", pilot: false, growth: "EU only", enterprise: true },
  { feature: "SLA", pilot: "Best effort", growth: "99.9%", enterprise: "99.95%" },
  { feature: "Support", pilot: "Community", growth: "Business hours", enterprise: "24×7 + CSM" },
];

const motion = [
  { stage: "Pilot (60 days)", time: "Week 1-8", detail: "10–25 assets, white-glove sensor onboarding, success metric agreed up-front." },
  { stage: "Land (single site)", time: "Month 3-6", detail: "Growth tier rollout. Integrate with site CMMS. Train reliability team." },
  { stage: "Expand (multi-site)", time: "Month 6-12", detail: "Enterprise contract. Multi-tenant org structure, regional dashboards." },
  { stage: "Embed (ecosystem)", time: "Year 2+", detail: "APIs feed BI, RPA, and partner predictive services. Renewal becomes default." },
];

function PricingPage() {
  const { tenant } = useApp();
  const tier = tiers.find((t) => t.name === tenant.plan) ?? tiers[0];
  const assetPct = Math.min(100, Math.round((tenant.assets.length / tier.assets) * 100));
  const callsPctOfMo = Math.min(100, Math.round((tenant.apiMetrics.callsToday * 30 / tier.apiCallsMo) * 100));

  // ROI calculator
  const [assets, setAssets] = useState<number>(tenant.assets.length);
  const [downtimeHr, setDowntimeHr] = useState<number>(7500);
  const [hoursAvoided, setHoursAvoided] = useState<number>(24);
  const savings = useMemo(() => Math.round(assets * downtimeHr * (hoursAvoided / 1000) * 1), [assets, downtimeHr, hoursAvoided]);
  const license = assets * 18 * 12;
  const roi = license > 0 ? Math.round(((savings - license) / license) * 100) : 0;

  return (
    <AppLayout
      title="Billing & Usage"
      subtitle="Subscription tier, live usage, plan comparison and ROI — built for IT Admin and Procurement"
    >
      {/* Current plan & usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Current plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold">{tenant.plan}</div>
              <Badge variant="secondary" className="text-[10px]">{tenant.region}</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">tenant_{tenant.id} · SLA {tenant.sla}</p>
            <Button size="sm" className="mt-3 w-full" onClick={() => toast.success("Upgrade request sent")}>Request upgrade</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Asset count vs tier limit</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">{tenant.assets.length} <span className="text-sm text-slate-500 font-normal">/ {tier.assets === 99999 ? "∞" : tier.assets}</span></div>
            <Progress value={assetPct} className="h-1.5 mt-2" />
            <p className="text-[11px] text-slate-500 mt-1">{assetPct}% utilised</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">API calls (projected / month)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">{(tenant.apiMetrics.callsToday * 30).toLocaleString()} <span className="text-sm text-slate-500 font-normal">/ {tier.apiCallsMo.toLocaleString()}</span></div>
            <Progress value={callsPctOfMo} className="h-1.5 mt-2" />
            <p className="text-[11px] text-slate-500 mt-1">{callsPctOfMo}% of monthly cap</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {tiers.map((t) => (
          <Card key={t.name} className={t.highlight ? "border-slate-900 ring-1 ring-slate-900 dark:border-slate-100 dark:ring-slate-100" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.name}</CardTitle>
                {t.highlight && <Badge className="text-[10px]">Most popular</Badge>}
              </div>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-3xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-xs text-slate-500 mb-1">/ {t.per}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.blurb}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="size-3.5 text-emerald-600 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button size="sm" variant={t.highlight ? "default" : "outline"} className="w-full" onClick={() => toast.success(`${t.cta} — request received`, { description: `${t.name} tier` })}>{t.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison */}
      <Card className="mt-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Feature comparison</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b">
              <tr>
                <th className="text-left px-4 py-2">Capability</th>
                <th className="px-3 py-2">Pilot</th>
                <th className="px-3 py-2 bg-slate-50 dark:bg-slate-800">Growth</th>
                <th className="px-3 py-2">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.feature} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{r.feature}</td>
                  <Cell v={r.pilot} />
                  <Cell v={r.growth} highlight />
                  <Cell v={r.enterprise} />
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Adoption motion + ROI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Adoption motion & timeline</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {motion.map((m, i) => (
                <li key={m.stage} className="flex gap-3">
                  <div className="size-6 shrink-0 rounded-full bg-slate-900 text-white grid place-items-center text-[11px] font-medium dark:bg-slate-100 dark:text-slate-900">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{m.stage}</div>
                      <Badge variant="outline" className="text-[10px]">{m.time}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">{m.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">ROI calculator</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Assets monitored</Label>
                <Input type="number" value={assets} onChange={(e) => setAssets(+e.target.value || 0)} className="h-8" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Downtime cost €/hr</Label>
                <Input type="number" value={downtimeHr} onChange={(e) => setDowntimeHr(+e.target.value || 0)} className="h-8" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Hours avoided / asset / yr</Label>
                <Input type="number" value={hoursAvoided} onChange={(e) => setHoursAvoided(+e.target.value || 0)} className="h-8" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Stat label="Estimated savings / yr" value={`€${savings.toLocaleString()}`} tone="good" />
              <Stat label="Growth license / yr" value={`€${license.toLocaleString()}`} />
              <Stat label="ROI" value={`${roi}%`} tone={roi > 0 ? "good" : "warn"} />
            </div>
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200">
              <strong>Proof point:</strong> Average customer saves €180K / year in downtime reduction within the first 12 months.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Cell({ v, highlight }: { v: boolean | string; highlight?: boolean }) {
  const base = `px-3 py-2.5 text-center text-xs ${highlight ? "bg-slate-50/60 dark:bg-slate-800/60" : ""}`;
  if (v === true) return <td className={base}><Check className="size-4 text-emerald-600 inline" /></td>;
  if (v === false) return <td className={base}><X className="size-4 text-slate-300 inline" /></td>;
  return <td className={base + " text-slate-700 dark:text-slate-300"}>{v}</td>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  const tc = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900 dark:text-slate-100";
  return (
    <div>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${tc}`}>{value}</div>
    </div>
  );
}

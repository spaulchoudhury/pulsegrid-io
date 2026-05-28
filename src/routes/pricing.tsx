import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing & GTM · Pulsegrid" }] }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Pilot", price: "€0", per: "60-day evaluation", cta: "Start pilot",
    blurb: "For a single line or pump skid. Prove value before procurement.",
    features: ["Up to 25 assets", "Vibration monitoring", "Email alerts", "Community support"],
    highlight: false,
  },
  {
    name: "Growth", price: "€18", per: "asset / month", cta: "Talk to sales",
    blurb: "Single-site teams scaling reliability programs.",
    features: ["Up to 500 assets", "Vibration + current (Phase 2)", "Webhooks · Slack · Teams", "SAP PM / Maximo integration", "99.9% SLA"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", per: "annual contract", cta: "Contact us",
    blurb: "Multi-site, multi-region industrial operators.",
    features: ["Unlimited assets & tenants", "Predictive AI/ML models", "SSO · SAML · MFA enforced", "EU data residency · CMK encryption", "99.95% SLA · 24×7 support", "Dedicated CSM"],
    highlight: false,
  },
];

const buyers = [
  { role: "Plant Manager", win: "Downtime ↓, OEE ↑, cost-per-asset visibility" },
  { role: "Head of Operations", win: "Fleet-wide reliability KPIs across sites" },
  { role: "Procurement / IT", win: "SSO, GDPR posture, predictable subscription" },
  { role: "Reliability Engineer (user)", win: "Catch bearing faults weeks earlier" },
];

const motion = [
  { stage: "1. Pilot (60 days)", detail: "10–25 assets, white-glove sensor onboarding, success metric agreed up-front." },
  { stage: "2. Land (single site)", detail: "Growth tier rollout. Integrate with site CMMS. Train reliability team." },
  { stage: "3. Expand (multi-site)", detail: "Enterprise contract. Multi-tenant org structure, regional dashboards." },
  { stage: "4. Embed (ecosystem)", detail: "APIs feed BI, RPA, and partner predictive services. Renewal becomes default." },
];

function PricingPage() {
  return (
    <AppLayout title="Pricing & Go-to-Market" subtitle="Subscription tiers, target buyers, and the land-and-expand motion">
      <div className="grid grid-cols-3 gap-4">
        {tiers.map((t) => (
          <Card key={t.name} className={t.highlight ? "border-slate-900 ring-1 ring-slate-900" : ""}>
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
              <Button size="sm" variant={t.highlight ? "default" : "outline"} className="w-full" onClick={() => toast.success(`${t.cta} — request received`, { description: `${t.name} tier · we'll follow up shortly` })}>{t.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Buyer & user map</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {buyers.map((b) => (
                  <tr key={b.role} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 font-medium w-1/3">{b.role}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{b.win}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Adoption motion</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {motion.map((m, i) => (
                <li key={m.stage} className="flex gap-3">
                  <div className="size-6 shrink-0 rounded-full bg-slate-900 text-white grid place-items-center text-[11px] font-medium">{i + 1}</div>
                  <div>
                    <div className="text-sm font-medium">{m.stage}</div>
                    <div className="text-xs text-slate-500">{m.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

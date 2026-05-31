import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, tenants, personas } from "@/lib/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Wrench, Eye, UserCog, Building2, ArrowRight, Sparkles } from "lucide-react";
import logoLight from "@/assets/pulsegrid-logo-light.png";
import logoDark from "@/assets/pulsegrid-logo-dark.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · PulseGrid" }] }),
  component: LoginPage,
});

const personaCards = [
  { key: "reliability", icon: ShieldCheck, blurb: "Fleet-wide health, KPIs, ROI. Acknowledge alerts, set thresholds.", color: "from-indigo-500 to-violet-600" },
  { key: "engineer", icon: Wrench, blurb: "Triage alerts, create work orders, drill into FFT spectra & RUL.", color: "from-sky-500 to-cyan-600" },
  { key: "admin", icon: UserCog, blurb: "Manage users, API keys, integrations, encryption & SSO.", color: "from-emerald-500 to-teal-600" },
  { key: "viewer", icon: Eye, blurb: "Read-only access to assets, alerts and reports.", color: "from-slate-500 to-slate-700" },
];

function LoginPage() {
  const { signIn, theme } = useApp();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string>("acme");
  const [selected, setSelected] = useState<string>("reliability");
  const tenant = tenants.find((t) => t.id === tenantId) ?? tenants[0];

  const enter = (key: string) => {
    signIn(key, tenantId);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-900 grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.6),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.6),transparent_50%)]" />
        <div className="relative">
          <img src={logoDark} alt="PulseGrid" className="h-10 mb-10" />
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Predict Today.<br />
            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">Prevent Tomorrow.</span>
          </h1>
          <p className="text-slate-300 mt-4 max-w-md text-sm leading-relaxed">
            AI-powered condition intelligence for industrial reliability. Multi-tenant. API-first. GDPR-compliant.
          </p>

          <div className="mt-10 space-y-4 max-w-md">
            {[
              ["Real-time monitoring", "Vibration, temperature & more streamed in < 1s."],
              ["Predictive insights", "ML models forecast remaining useful life."],
              ["Work order automation", "Dispatch to SAP / Maximo in one click."],
              ["Enterprise security", "Multi-tenant isolation, RBAC, CMK encryption."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <div className="size-6 rounded-md bg-violet-500/20 border border-violet-400/30 grid place-items-center mt-0.5">
                  <Sparkles className="size-3 text-violet-300" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-slate-400">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-500">
          From reactive breakdowns to predictive reliability. <span className="text-slate-300">pulsegrid.io</span>
        </div>
      </div>

      {/* Right: persona picker */}
      <div className="flex flex-col p-6 sm:p-10 lg:p-14 justify-center">
        <div className="lg:hidden mb-6">
          <img src={theme === "dark" ? logoDark : logoLight} alt="PulseGrid" className="h-9" />
        </div>

        <div className="max-w-xl w-full mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wider mb-2">
            <Activity className="size-3" /> Demo sign-in
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Choose your persona</h2>
          <p className="text-sm text-slate-500 mt-1">
            Each persona has its own role, permissions and workspace view. Switch any time from the avatar menu.
          </p>

          {/* Tenant selector */}
          <Card className="mt-6">
            <CardContent className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Building2 className="size-3" /> Workspace
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTenantId(t.id)}
                    className={`text-left px-3 py-2 rounded-md border text-xs transition ${
                      tenantId === t.id
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-[10px] text-slate-500">{t.plan} · {t.region}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personas */}
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {personaCards.map((p) => {
              const idx = ["reliability", "engineer", "admin", "viewer"].indexOf(p.key);
              const user = tenant.users[idx] ?? tenant.users[0];
              const base = personas[p.key];
              const Icon = p.icon;
              const active = selected === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelected(p.key)}
                  onDoubleClick={() => enter(p.key)}
                  className={`text-left rounded-lg border p-4 transition ${
                    active
                      ? "border-violet-500 ring-2 ring-violet-200 dark:ring-violet-900 bg-white dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-md bg-gradient-to-br ${p.color} grid place-items-center text-white`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{base.role}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.name} · {user.email}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{p.blurb}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {base.permissions.allow.slice(0, 3).map((perm) => (
                      <Badge key={perm} variant="outline" className="text-[9px] font-normal">{perm}</Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-5 h-11 text-sm"
            onClick={() => enter(selected)}
            style={{ background: "linear-gradient(135deg,#4f46e5,#a855f7)" }}
          >
            Enter PulseGrid as {personas[selected].role}
            <ArrowRight className="size-4 ml-2" />
          </Button>
          <p className="text-[10px] text-slate-500 text-center mt-3">
            Demo workspace · no password required · sign out anytime from the avatar menu
          </p>
        </div>
      </div>
    </div>
  );
}

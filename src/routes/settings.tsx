import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { regions } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertTriangle, Check, Download, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Tenant settings · PulseGrid" }] }),
  component: SettingsPage,
});

const COLOR_PRESETS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

function SettingsPage() {
  const { tenant, primaryColor, setPrimaryColor, region, setRegion, can, log, persona } = useApp();
  const [colorDraft, setColorDraft] = useState(primaryColor);
  const [nameDraft, setNameDraft] = useState(tenant.name);
  const [subDraft, setSubDraft] = useState(tenant.subdomain);
  const [wizardStep, setWizardStep] = useState(1);

  // Reset branding drafts when tenant switches
  useEffect(() => {
    setNameDraft(tenant.name);
    setSubDraft(tenant.subdomain);
    setColorDraft(tenant.primaryColor);
  }, [tenant]);
  const [wizardDismissed, setWizardDismissed] = useState(false);

  return (
    <AppLayout
      title="Tenant Settings"
      subtitle={`Branding, security, data residency, and access for tenant_${tenant.id}`}
    >
      {!wizardDismissed && (
        <Card key={tenant.id} className="mb-4 border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-600" />
              <CardTitle className="text-sm text-indigo-900 dark:text-indigo-200">Welcome to PulseGrid — set up your workspace</CardTitle>
              <button onClick={() => setWizardDismissed(true)} className="ml-auto text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">Dismiss</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`size-6 rounded-full grid place-items-center text-[10px] font-medium ${
                    s < wizardStep ? "bg-emerald-600 text-white" : s === wizardStep ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {s < wizardStep ? <Check className="size-3" /> : s}
                  </div>
                  {s < 4 && <div className={`h-px flex-1 ${s < wizardStep ? "bg-emerald-600" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
            <Progress value={(wizardStep - 1) * 33} className="h-1 mb-3" />
            {wizardStep === 1 && (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Organisation name</Label>
                  <Input defaultValue={tenant.name} className="h-8" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Industry</Label>
                  <Input defaultValue={tenant.industry} className="h-8" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Primary region (data residency)</Label>
                  <Select value={region} onValueChange={(v) => { setRegion(v); log("Changed data region", v); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue={tenant.subdomain} className="h-8" />
                    <span className="text-xs text-slate-500">.pulsegrid.io</span>
                  </div>
                </div>
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-2 text-sm">
                <p className="text-slate-600 dark:text-slate-300">Step 2 — Security. Enable SSO, enforce MFA, choose encryption mode.</p>
                <div className="flex items-center justify-between"><span>Enforce SSO (SAML / OIDC)</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><span>Require MFA for all users</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><span>Customer-managed encryption key (CMK)</span><Switch defaultChecked={tenant.plan === "Enterprise"} /></div>
              </div>
            )}
            {wizardStep === 3 && (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Step 3 — Add assets. Import a CSV of asset IDs, sites, types — or wire up your CMMS. PulseGrid then auto-discovers sensors on first ingest.
              </div>
            )}
            {wizardStep === 4 && (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Step 4 — Connect sensors. Install the gateway agent, point it at <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">api.pulsegrid.io</code>, and confirm first telemetry in the live ingest stream. You&rsquo;re done.
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" disabled={wizardStep === 1} onClick={() => setWizardStep((s) => s - 1)}>Back</Button>
              {wizardStep < 4 ? (
                <Button size="sm" onClick={() => setWizardStep((s) => s + 1)}>Next: {["Security settings", "Add assets", "Connect sensors"][wizardStep - 1]} →</Button>
              ) : (
                <Button size="sm" onClick={() => { setWizardDismissed(true); toast.success("Workspace setup complete"); }}>Finish setup</Button>
              )}
              <span className="ml-auto text-[10px] text-slate-500">Coming up: {["Security → Add Assets → Connect Sensors → Done", "Add Assets → Connect Sensors → Done", "Connect Sensors → Done", "Done"][wizardStep - 1]}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Display name</Label>
              <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="h-8" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input value={subDraft} onChange={(e) => setSubDraft(e.target.value)} className="h-8" />
                <span className="text-xs text-slate-500">.pulsegrid.io</span>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Primary color (live preview)</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColorDraft(c); setPrimaryColor(c); }}
                    className={`size-7 rounded-md border-2 ${colorDraft === c ? "border-slate-900 dark:border-slate-100" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <Input
                  value={colorDraft}
                  onChange={(e) => { setColorDraft(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setPrimaryColor(e.target.value); }}
                  className="h-8 w-28 font-mono text-xs"
                />
              </div>
            </div>
            <Button size="sm" onClick={() => { setPrimaryColor(colorDraft); log("Updated branding", `name=${nameDraft} color=${colorDraft}`); toast.success("Branding saved · primary color applied"); }}>Save branding</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Security, residency & compliance</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-1.5">
              <Label className="text-xs">Data residency region</Label>
              <Select value={region} onValueChange={(v) => { setRegion(v); log("Changed data region", v); toast.success(`Data residency switched to ${v}`); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {[
              ["Enforce SSO (SAML / OIDC)", tenant.plan !== "Pilot"],
              ["Require MFA for all users", true],
              ["Encrypt-at-rest with customer-managed key", tenant.plan === "Enterprise"],
              ["Audit log export to SIEM", tenant.plan !== "Pilot"],
            ].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span>{label}</span>
                <Switch defaultChecked={on as boolean} key={`${tenant.id}-${label}`} onCheckedChange={(v) => { log("Toggled security setting", `${label}=${v}`); toast.success(`${label}: ${v ? "enabled" : "disabled"}`); }} />
              </div>
            ))}
            <div className="pt-2 flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">SOC 2 Type II</Badge>
              <Badge variant="outline" className="text-[10px]">ISO 27001</Badge>
              <Badge variant="outline" className="text-[10px]">GDPR</Badge>
              <Badge variant="outline" className="text-[10px]">{tenant.plan}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Default alert thresholds</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label className="text-xs">Vibration RMS warning (mm/s)</Label><Input defaultValue="3.5" className="h-8" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Vibration RMS critical (mm/s)</Label><Input defaultValue="5.0" className="h-8" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Temperature warning (°C)</Label><Input defaultValue="65" className="h-8" /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Temperature critical (°C)</Label><Input defaultValue="80" className="h-8" /></div>
            </div>
            <Button size="sm" className="mt-1" disabled={!can("edit:thresholds")} onClick={() => { log("Saved thresholds", "defaults"); toast.success("Thresholds saved"); }}>Save thresholds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Users & roles (RBAC)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr><th className="text-left px-4 py-2">User</th><th className="text-left px-4 py-2">Role</th><th className="text-right px-4 py-2">Last login</th></tr>
              </thead>
              <tbody>
                {tenant.users.map((u) => (
                  <tr key={u.email} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-2.5"><Badge variant="secondary" className="text-[10px]">{u.role}</Badge></td>
                    <td className="px-4 py-2.5 text-right text-[11px] text-slate-500">{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="size-4 text-red-600" /> GDPR rights — data control</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 flex-wrap">
            <p className="text-xs text-slate-500 flex-1 min-w-[260px]">
              Right to access &amp; right to erasure. Exports are AES-256 encrypted; deletes are irreversible and audit-logged. {!can("export:data") && <span className="text-amber-600">Your role ({persona.role}) is read-only here — request the IT Admin to action.</span>}
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="size-3.5 mr-1.5" />Export tenant data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Export all data for {tenant.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Generates an AES-256 encrypted archive containing all assets, sensor telemetry metadata, alerts, audit log entries, users, and tenant configuration for <code>tenant_{tenant.id}</code>. The download will start immediately and a signed link will also be emailed to {tenant.primaryUser.email}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const payload = {
                        exported_at: new Date().toISOString(),
                        tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan, region, subdomain: tenant.subdomain, industry: tenant.industry },
                        assets: tenant.assets,
                        alerts: tenant.alerts,
                        users: tenant.users,
                        api_keys: tenant.apiKeys,
                        integrations: tenant.integrations,
                        metrics: tenant.apiMetrics,
                        analytics: tenant.alertAnalytics,
                        gdpr: { article: "Article 20 — Right to data portability", encryption: "AES-256-GCM", signed_by: "PulseGrid Trust Service" },
                      };
                      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `pulsegrid-export-${tenant.id}-${Date.now()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                      log("Exported tenant data", `tenant_${tenant.id}`);
                      toast.success("Tenant data export downloaded", { description: `Signed link also emailed to ${tenant.primaryUser.email}` });
                    }}
                  >
                    Generate &amp; download
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {can("delete:tenant") ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="size-3.5 mr-1.5" />Delete tenant
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">Permanently delete {tenant.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will purge {tenant.assets.length} assets, {tenant.sensorCount} sensors, {tenant.alerts.length} alerts, all users, API keys, integrations, and historical telemetry for <code>tenant_{tenant.id}</code>. This cannot be undone. A signed deletion certificate (GDPR Art. 17) will be emailed to {tenant.primaryUser.email}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        log("Requested tenant deletion", `tenant_${tenant.id}`);
                        toast.error(`Deletion scheduled for ${tenant.name}`, { description: "Workspace owner must confirm via email within 24h to complete erasure." });
                      }}
                    >
                      Yes, schedule deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button size="sm" variant="destructive" disabled title={`${persona.role} cannot delete tenants — IT Admin only`} className="opacity-50 cursor-not-allowed">
                <Trash2 className="size-3.5 mr-1.5" />Delete tenant
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}

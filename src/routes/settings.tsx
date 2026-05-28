import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Tenant settings · Pulsegrid" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { tenant } = useApp();

  return (
    <AppLayout
      title="Tenant Settings"
      subtitle={`Branding, security, data residency, and access for tenant_${tenant.id}`}
    >
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Display name</Label>
              <Input defaultValue={tenant.name} key={`${tenant.id}-name`} className="h-8" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input defaultValue={tenant.subdomain} key={`${tenant.id}-sub`} className="h-8" />
                <span className="text-xs text-slate-500">.pulsegrid.io</span>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Primary color</Label>
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-md border bg-indigo-600" />
                <Input defaultValue="#4f46e5" className="h-8 w-32 font-mono text-xs" />
              </div>
            </div>
            <Button size="sm" onClick={() => toast.success("Branding saved")}>Save branding</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Security & compliance</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Enforce SSO (SAML / OIDC)", tenant.plan !== "Pilot"],
              ["Require MFA for all users", true],
              [`Data residency: ${tenant.region}`, true],
              ["Encrypt-at-rest with customer-managed key", tenant.plan === "Enterprise"],
              ["Audit log export to SIEM", tenant.plan !== "Pilot"],
            ].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span>{label}</span>
                <Switch defaultChecked={on as boolean} key={`${tenant.id}-${label}`} onCheckedChange={(v) => toast.success(`${label}: ${v ? "enabled" : "disabled"}`)} />
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
              <div className="grid gap-1.5">
                <Label className="text-xs">Vibration RMS warning (mm/s)</Label>
                <Input defaultValue="3.5" className="h-8" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Vibration RMS critical (mm/s)</Label>
                <Input defaultValue="5.0" className="h-8" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Temperature warning (°C)</Label>
                <Input defaultValue="65" className="h-8" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Temperature critical (°C)</Label>
                <Input defaultValue="80" className="h-8" />
              </div>
            </div>
            <Button size="sm" className="mt-1" onClick={() => toast.success("Thresholds saved")}>Save thresholds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Users & roles (RBAC)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {tenant.users.map((u) => (
                  <tr key={u.email} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

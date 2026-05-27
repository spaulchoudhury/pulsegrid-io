import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Cable,
  Gauge,
  Settings,
  Building2,
  ChevronDown,
  Search,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { tenants } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const nav = [
  { to: "/", label: "Overview", icon: Gauge },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/api", label: "API & Integrations", icon: Cable },
  { to: "/settings", label: "Tenant Settings", icon: Settings },
];

export function AppLayout({ children, title, subtitle, actions }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [tenant, setTenant] = useState(tenants[0]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-slate-200">
          <div className="size-7 rounded-md bg-slate-900 text-white grid place-items-center">
            <Activity className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Pulsegrid</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Condition Monitoring</div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="m-3 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-left">
            <Building2 className="size-4 text-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{tenant.name}</div>
              <div className="text-[10px] text-slate-500">{tenant.plan} · tenant_{tenant.id}</div>
            </div>
            <ChevronDown className="size-3.5 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Switch tenant</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenants.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setTenant(t)}>
                <Building2 className="size-3.5 mr-2" /> {t.name}
                <Badge variant="secondary" className="ml-auto text-[10px]">{t.plan}</Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="px-2 py-1 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 ${
                  active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>Region</span>
            <span className="text-slate-700">eu-west-1</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>API</span>
            <span className="text-emerald-600">● operational</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center gap-3 px-6">
          <div className="relative w-72">
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search assets, alerts, sites…" className="h-8 pl-8 text-sm" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative size-8 grid place-items-center rounded-md hover:bg-slate-100">
              <Bell className="size-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
            </button>
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center text-xs font-medium">MR</div>
          </div>
        </header>

        <div className="px-6 pt-6 pb-3 flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </div>

        <main className="px-6 pb-10 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function HealthBadge({ h }: { h: "healthy" | "warning" | "critical" }) {
  const map = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium capitalize ${map[h]}`}>
      <span className={`size-1.5 rounded-full ${h === "healthy" ? "bg-emerald-500" : h === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
      {h}
    </span>
  );
}

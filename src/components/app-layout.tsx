import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  Map,
  Tag,
  Bell,
  Sun,
  Moon,
  Cpu,
  Webhook,
  Check,
  FileText,
  ShieldCheck,
  Lock,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { tenants, personas } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoLight from "@/assets/pulsegrid-logo-light.png";
import logoDark from "@/assets/pulsegrid-logo-dark.png";

const nav = [
  { to: "/", label: "Overview", icon: Gauge },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/api", label: "API & Integrations", icon: Cable },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/pricing", label: "Billing & Usage", icon: Tag },
  { to: "/settings", label: "Tenant Settings", icon: Settings },
] as const;

const PERSONA_KEYS = ["reliability", "engineer", "admin", "viewer"] as const;

export function AppLayout({ children, title, subtitle, actions }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { tenant, setTenantId, theme, toggleTheme, search, setSearch, notifications, markAllRead, markRead, persona, setPersonaKey, personaKey, primaryColor, region, signedIn, signOut } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  // Soft auth gate — first visit lands on /login
  useEffect(() => {
    if (!signedIn && pathname !== "/login") {
      navigate({ to: "/login" });
    }
  }, [signedIn, pathname, navigate]);

  const unread = notifications.filter((n) => !n.read).length;

  const q = search.trim().toLowerCase();
  const assetMatches = q
    ? tenant.assets.filter(
        (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.site.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];
  const alertMatches = q
    ? tenant.alerts.filter((a) => a.message.toLowerCase().includes(q) || a.assetName.toLowerCase().includes(q)).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="h-14 px-3 flex items-center border-b border-slate-200 dark:border-slate-800">
          <img src={theme === "dark" ? logoDark : logoLight} alt="PulseGrid" className="h-8 w-auto" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="m-3 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-left">
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
              <DropdownMenuItem
                key={t.id}
                onClick={() => {
                  setTenantId(t.id);
                  toast.success(`Switched to ${t.name}`, { description: `tenant_${t.id} · ${t.region}` });
                }}
              >
                <Building2 className="size-3.5 mr-2" /> {t.name}
                <Badge variant="secondary" className="ml-auto text-[10px]">{t.plan}</Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="px-2 py-1 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to || (n.to === "/assets" && pathname.startsWith("/assets/"));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 ${
                  active
                    ? "text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                <Icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Tenant isolation footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-600">
            <Lock className="size-3" /> Tenant boundary
          </div>
          <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">
            {tenant.name}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            tenant_{tenant.id} · {region} · {tenant.plan}
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <span>API</span>
            <span className={tenant.apiStatus === "operational" ? "text-emerald-600" : "text-amber-600"}>
              ● {tenant.apiStatus}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600">
            <ShieldCheck className="size-3" /> Isolated · CMK encrypted · GDPR
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 px-6">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-72">
                <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search assets, alerts, sites…"
                  className="h-8 pl-8 text-sm"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            {q && (
              <PopoverContent align="start" className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                {assetMatches.length === 0 && alertMatches.length === 0 && (
                  <div className="px-3 py-4 text-xs text-slate-500 text-center">No matches in {tenant.name}</div>
                )}
                {assetMatches.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 border-b">Assets</div>
                    {assetMatches.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                          navigate({ to: "/assets/$assetId", params: { assetId: a.id } });
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Cpu className="size-3.5 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{a.name}</div>
                          <div className="text-[10px] text-slate-500">{a.id} · {a.site}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {alertMatches.length > 0 && (
                  <div className="border-t">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 border-b">Alerts</div>
                    {alertMatches.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                          navigate({ to: "/alerts", hash: a.id });
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{a.message}</div>
                          <div className="text-[10px] text-slate-500">{a.assetName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            )}
          </Popover>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="size-8 grid place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "light" ? <Moon className="size-4 text-slate-600" /> : <Sun className="size-4 text-slate-300" />}
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="relative size-8 grid place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications">
                  <Bell className="size-4 text-slate-600 dark:text-slate-300" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold grid place-items-center">
                      {unread}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="text-sm font-semibold">Notifications · {tenant.name}</div>
                  <button
                    onClick={() => {
                      markAllRead();
                      toast.success("All notifications marked as read");
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1"
                  >
                    <Check className="size-3" /> Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = n.kind === "api" ? Webhook : n.kind === "asset" ? Cpu : AlertTriangle;
                      const sev =
                        n.severity === "critical"
                          ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900"
                          : n.severity === "warning"
                            ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900"
                            : "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
                      return (
                        <button
                          key={n.id}
                          onClick={() => {
                            markRead(n.id);
                            if (n.assetId) {
                              navigate({ to: "/assets/$assetId", params: { assetId: n.assetId } });
                            } else if (n.alertId) {
                              navigate({ to: "/alerts", hash: n.alertId });
                            } else if (n.href?.startsWith("/api")) {
                              navigate({ to: "/api", search: { focus: "errors" } });
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 ${!n.read ? "bg-slate-50/60 dark:bg-slate-800/40" : ""}`}
                        >
                          <div className={`size-7 rounded-md border grid place-items-center ${sev}`}>
                            <Icon className="size-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{n.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">{n.detail}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 whitespace-nowrap">{n.ts}</div>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="border-t p-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate({ to: "/alerts" })}>
                    View all alerts
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="size-8 rounded-full text-white grid place-items-center text-xs font-medium ring-2 ring-white dark:ring-slate-900"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, #a855f7)` }}
                  aria-label="Account"
                  title={`Logged in as ${persona.name} (${persona.role}) · ${tenant.name}`}
                >
                  {persona.initials}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3 text-sm">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div
                    className="size-9 rounded-full text-white grid place-items-center text-xs font-medium"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #a855f7)` }}
                  >
                    {persona.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{persona.name}</div>
                    <div className="text-[11px] text-slate-500">{persona.role} · {tenant.name}</div>
                  </div>
                </div>
                <div className="py-2 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-600 mt-1">Can</div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                    {persona.permissions.allow.slice(0, 4).map((p) => <li key={p}>• {p}</li>)}
                  </ul>
                  {persona.permissions.deny.length > 0 && (
                    <>
                      <div className="text-[10px] uppercase tracking-wider text-red-600 mt-2">Cannot</div>
                      <ul className="text-[11px] text-slate-500 space-y-0.5">
                        {persona.permissions.deny.slice(0, 3).map((p) => <li key={p}>• {p}</li>)}
                      </ul>
                    </>
                  )}
                </div>
                <div className="pt-2 border-t">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Switch persona (demo)</div>
                  <div className="grid grid-cols-2 gap-1">
                    {PERSONA_KEYS.map((k, idx) => {
                      const p = personas[k];
                      const u = tenant.users[idx] ?? tenant.users[0];
                      return (
                        <button
                          key={k}
                          onClick={() => {
                            setPersonaKey(k);
                            toast.success(`Now viewing as ${u.role}`, { description: `${u.name} · ${tenant.name}` });
                          }}
                          className={`text-[11px] px-2 py-1 rounded border text-left ${
                            personaKey === k
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                          title={`${u.name} · ${u.role}`}
                        >
                          <div className="truncate font-medium">{p.role}</div>
                          <div className="text-[9px] opacity-70 truncate">{u.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      signOut();
                      navigate({ to: "/login" });
                    }}
                  >
                    <LogOut className="size-3.5 mr-1.5" /> Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="px-6 pt-6 pb-3 flex items-start gap-4 flex-wrap">
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

export function HealthBadge({ h, score }: { h: "healthy" | "warning" | "critical"; score?: number }) {
  const map = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:border-red-900 dark:text-red-300",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium capitalize ${map[h]}`}>
      <span className={`size-1.5 rounded-full ${h === "healthy" ? "bg-emerald-500" : h === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
      {h}{typeof score === "number" ? ` · ${score}` : ""}
    </span>
  );
}

export function RequirePerm({ perm, children, fallback }: { perm: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { can } = useApp();
  if (!can(perm)) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

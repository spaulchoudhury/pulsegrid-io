import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTenant, personas as basePersonas, tenants, type PersonaProfile, type TenantData } from "./mock-data";

export interface Notification {
  id: string;
  kind: "alert" | "asset" | "api";
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  ts: string;
  read: boolean;
  href?: string;
  assetId?: string;
  alertId?: string;
}

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
  tenantId: string;
  action: string;
  target: string;
}

interface AppCtx {
  tenant: TenantData;
  setTenantId: (id: string) => void;
  region: string;
  setRegion: (r: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  notifications: Notification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  persona: PersonaProfile;
  setPersonaKey: (k: string) => void;
  personaKey: string;
  can: (perm: string) => boolean;
  audit: AuditEvent[];
  log: (action: string, target: string) => void;
  signedIn: boolean;
  signIn: (personaKey: string, tenantId?: string) => void;
  signOut: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

// Personas keyed by index: 0=reliability, 1=engineer, 2=admin, 3=viewer
const PERSONA_INDEX: Record<string, number> = { reliability: 0, engineer: 1, admin: 2, viewer: 3 };

function personaForTenant(tenant: TenantData, key: string): PersonaProfile {
  const base = basePersonas[key] ?? basePersonas.reliability;
  const idx = PERSONA_INDEX[key] ?? 0;
  const user = tenant.users[idx] ?? tenant.users[0];
  if (!user) return base;
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return { ...base, name: user.name, initials, role: user.role };
}

function buildNotifications(t: TenantData): Notification[] {
  const out: Notification[] = t.alerts.slice(0, 4).map((a) => ({
    id: `n-${t.id}-${a.id}`,
    kind: "alert",
    severity: a.severity,
    title: a.message,
    detail: `${a.assetName} · ${a.rule}`,
    ts: a.ts,
    read: a.ack,
    href: "/alerts",
    alertId: a.id,
  }));
  const critical = t.assets.find((a) => a.health === "critical");
  if (critical) {
    out.unshift({
      id: `n-${t.id}-asset-${critical.id}`,
      kind: "asset",
      severity: "critical",
      title: `${critical.name} marked CRITICAL`,
      detail: `${critical.id} · ${critical.site}`,
      ts: "just now",
      read: false,
      href: "/assets/$assetId",
      assetId: critical.id,
    });
  }
  if (t.apiStatus === "degraded") {
    out.unshift({
      id: `n-${t.id}-api-degraded`,
      kind: "api",
      severity: "warning",
      title: "API integration error",
      detail: "Gateway → /v1/ingest returning 502 (3/min)",
      ts: "4m ago",
      read: false,
      href: "/api?focus=errors",
    });
  }
  return out;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string>("acme");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [search, setSearch] = useState("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [personaKey, setPersonaKey] = useState<string>("reliability");
  const [primaryColor, setPrimaryColorState] = useState<string>("#4f46e5");
  const [region, setRegion] = useState<string>("eu-west-1");
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [audit, setAudit] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--brand", primaryColor);
  }, [primaryColor]);

  const tenant = useMemo(() => getTenant(tenantId), [tenantId]);

  useEffect(() => {
    setPrimaryColorState(tenant.primaryColor);
    setRegion(tenant.region);
  }, [tenant]);

  const persona = useMemo(() => personaForTenant(tenant, personaKey), [tenant, personaKey]);

  // Seed audit log per tenant for realism (reset on tenant change)
  useEffect(() => {
    const u = tenant.users;
    setAudit([
      { id: `seed-1-${tenant.id}`, ts: "2m ago", actor: u[1]?.name ?? u[0].name, tenantId: tenant.id, action: "Acknowledged alert", target: tenant.alerts[0]?.id ?? "—" },
      { id: `seed-2-${tenant.id}`, ts: "18m ago", actor: u[0].name, tenantId: tenant.id, action: "Created work order", target: `WO-4799 ← ${tenant.alerts[2]?.id ?? "—"}` },
      { id: `seed-3-${tenant.id}`, ts: "1h ago", actor: u[2]?.name ?? u[0].name, tenantId: tenant.id, action: "Rotated API key", target: "Production" },
    ]);
  }, [tenant]);

  const baseNotifs = useMemo(() => buildNotifications(tenant), [tenant]);
  const notifications = useMemo(
    () => baseNotifs.map((n) => (readIds.has(n.id) ? { ...n, read: true } : n)),
    [baseNotifs, readIds]
  );

  const setTenantId = useCallback((id: string) => {
    setTenantIdState(id);
    setReadIds(new Set());
    setSearch("");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(baseNotifs.map((n) => n.id)));
  }, [baseNotifs]);
  const markRead = useCallback((id: string) => {
    setReadIds((s) => new Set(s).add(id));
  }, []);

  const can = useCallback(
    (perm: string) => persona.permissions.allow.includes(perm) && !persona.permissions.deny.includes(perm),
    [persona]
  );

  const log = useCallback((action: string, target: string) => {
    setAudit((a) => [
      { id: `ev-${Date.now()}`, ts: "just now", actor: persona.name, tenantId: tenant.id, action, target },
      ...a,
    ].slice(0, 25));
  }, [persona.name, tenant.id]);

  const setPrimaryColor = useCallback((c: string) => setPrimaryColorState(c), []);

  const signIn = useCallback((key: string, tId?: string) => {
    setPersonaKey(key);
    if (tId) setTenantIdState(tId);
    setSignedIn(true);
  }, []);
  const signOut = useCallback(() => {
    setSignedIn(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        tenant, setTenantId,
        region, setRegion,
        theme, toggleTheme,
        primaryColor, setPrimaryColor,
        search, setSearch,
        notifications, markAllRead, markRead,
        persona, setPersonaKey, personaKey,
        can,
        audit, log,
        signedIn, signIn, signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

export { tenants, basePersonas as personas };

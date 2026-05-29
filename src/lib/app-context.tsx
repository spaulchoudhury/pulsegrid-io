import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTenant, personas, tenants, type PersonaProfile, type TenantData } from "./mock-data";

export interface Notification {
  id: string;
  kind: "alert" | "asset" | "api";
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  ts: string;
  read: boolean;
}

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
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
  persona: PersonaProfile;
  setPersonaKey: (k: string) => void;
  personaKey: string;
  can: (perm: string) => boolean;
  audit: AuditEvent[];
  log: (action: string, target: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

function buildNotifications(t: TenantData): Notification[] {
  const out: Notification[] = t.alerts.slice(0, 4).map((a) => ({
    id: `n-${a.id}`,
    kind: "alert",
    severity: a.severity,
    title: a.message,
    detail: `${a.assetName} · ${a.rule}`,
    ts: a.ts,
    read: a.ack,
  }));
  const critical = t.assets.find((a) => a.health === "critical");
  if (critical) {
    out.unshift({
      id: `n-asset-${critical.id}`,
      kind: "asset",
      severity: "critical",
      title: `${critical.name} marked CRITICAL`,
      detail: `${critical.id} · ${critical.site}`,
      ts: "just now",
      read: false,
    });
  }
  if (t.apiStatus === "degraded") {
    out.unshift({
      id: "n-api-degraded",
      kind: "api",
      severity: "warning",
      title: "API integration error",
      detail: "Gateway → /v1/ingest returning 502 (3/min)",
      ts: "4m ago",
      read: false,
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
  const [audit, setAudit] = useState<AuditEvent[]>([
    { id: "ev-001", ts: "2m ago", actor: "Daniel Park", action: "Acknowledged alert", target: "A-2041" },
    { id: "ev-002", ts: "18m ago", actor: "Maria Rossi", action: "Created work order", target: "WO-4799 ← A-2035" },
    { id: "ev-003", ts: "1h ago", actor: "Anjali Verma", action: "Rotated API key", target: "Production" },
  ]);

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

  // Sync brand color & region when tenant changes
  useEffect(() => {
    setPrimaryColorState(tenant.primaryColor);
    setRegion(tenant.region);
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

  const persona = personas[personaKey] ?? personas.reliability;
  const can = useCallback(
    (perm: string) => persona.permissions.allow.includes(perm) && !persona.permissions.deny.includes(perm),
    [persona]
  );

  const log = useCallback((action: string, target: string) => {
    setAudit((a) => [
      { id: `ev-${Date.now()}`, ts: "just now", actor: persona.name, action, target },
      ...a,
    ].slice(0, 25));
  }, [persona.name]);

  const setPrimaryColor = useCallback((c: string) => setPrimaryColorState(c), []);

  return (
    <Ctx.Provider
      value={{
        tenant, setTenantId,
        region, setRegion,
        theme, toggleTheme,
        primaryColor, setPrimaryColor,
        search, setSearch,
        notifications, markAllRead,
        persona, setPersonaKey, personaKey,
        can,
        audit, log,
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

export { tenants, personas };

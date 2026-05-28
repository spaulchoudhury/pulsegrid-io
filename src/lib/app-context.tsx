import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTenant, tenants, type TenantData } from "./mock-data";

export interface Notification {
  id: string;
  kind: "alert" | "asset" | "api";
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  ts: string;
  read: boolean;
}

interface AppCtx {
  tenant: TenantData;
  setTenantId: (id: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  search: string;
  setSearch: (s: string) => void;
  notifications: Notification[];
  markAllRead: () => void;
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const tenant = useMemo(() => getTenant(tenantId), [tenantId]);

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

  return (
    <Ctx.Provider
      value={{ tenant, setTenantId, theme, toggleTheme, search, setSearch, notifications, markAllRead }}
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

export { tenants };

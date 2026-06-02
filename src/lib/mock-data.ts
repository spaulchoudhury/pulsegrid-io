export type Health = "healthy" | "warning" | "critical";

export interface Asset {
  id: string;
  name: string;
  site: string;
  type: string;
  health: Health;
  healthScore: number; // 0-100
  vibrationRms: number;
  tempC: number;
  lastSync: string;
}

export interface AlertItem {
  id: string;
  assetId: string;
  assetName: string;
  severity: "info" | "warning" | "critical";
  rule: string;
  message: string;
  ts: string;
  ack: boolean;
  faultType: string;
  confidence: number;
  recommendedAction: string;
  assignee: string | null;
  workOrderId?: string;
}

export interface TenantUser {
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  permissions: string[];
}

export interface TenantData {
  id: string;
  name: string;
  plan: string;
  region: string;
  apiStatus: "operational" | "degraded";
  initials: string;
  primaryUser: { name: string; email: string };
  subdomain: string;
  industry: string;
  primaryColor: string; // hex
  assets: Asset[];
  alerts: AlertItem[];
  sensorCount: number;
  fleetCount: number;
  sla: string;
  healthDistribution: { name: string; value: number; key: string }[];
  apiKeys: { label: string; mask: string; scope: string }[];
  integrations: { name: string; status: "Connected" | "Available"; desc: string }[];
  users: TenantUser[];
  apiMetrics: {
    callsToday: number;
    rateLimit: number;
    rateUsedPct: number;
    p95LatencyMs: number;
    errorRatePct: number;
    webhookDeliveries: number;
  };
  alertAnalytics: {
    mttaHours: number;
    conversionPct: number;
    topFault: string;
    topFaultPct: number;
    falsePositivePct: number;
  };
}

export interface PersonaProfile {
  name: string;
  initials: string;
  role: string;
  permissions: { allow: string[]; deny: string[] };
}

export const personas: Record<string, PersonaProfile> = {
  reliability: {
    name: "Maria Rossi",
    initials: "MR",
    role: "Reliability Manager",
    permissions: {
      allow: ["view:assets", "view:alerts", "ack:alerts", "create:workorder", "edit:thresholds", "view:api", "view:reports"],
      deny: ["manage:users", "manage:apikeys", "delete:tenant"],
    },
  },
  engineer: {
    name: "Daniel Park",
    initials: "DP",
    role: "Maintenance Engineer",
    permissions: {
      allow: ["view:assets", "ack:alerts", "create:workorder", "view:reports"],
      deny: ["edit:thresholds", "manage:users", "manage:apikeys"],
    },
  },
  admin: {
    name: "Anjali Verma",
    initials: "AV",
    role: "IT Admin",
    permissions: {
      allow: ["view:assets", "view:alerts", "manage:users", "manage:apikeys", "edit:thresholds", "view:reports", "delete:tenant", "export:data"],
      deny: [],
    },
  },
  viewer: {
    name: "Sven Olsen",
    initials: "SO",
    role: "Viewer",
    permissions: {
      allow: ["view:assets", "view:alerts", "view:reports"],
      deny: ["ack:alerts", "create:workorder", "edit:thresholds", "manage:users", "manage:apikeys"],
    },
  },
};

function scoreFor(h: Health): number {
  return h === "healthy" ? 88 + Math.floor(Math.random() * 8) : h === "warning" ? 55 + Math.floor(Math.random() * 12) : 22 + Math.floor(Math.random() * 18);
}
// Deterministic scores so server/client match
function detScore(h: Health, seed: string): number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const r = Math.abs(Math.sin(s) * 1000) % 1;
  if (h === "healthy") return 85 + Math.floor(r * 12);
  if (h === "warning") return 50 + Math.floor(r * 20);
  return 18 + Math.floor(r * 22);
}

function asset(id: string, name: string, site: string, type: string, health: Health, vib: number, temp: number, sync: string): Asset {
  return { id, name, site, type, health, healthScore: detScore(health, id), vibrationRms: vib, tempC: temp, lastSync: sync };
}

export const tenants: TenantData[] = [
  {
    id: "acme",
    name: "Acme Manufacturing",
    plan: "Enterprise",
    region: "eu-west-1",
    apiStatus: "operational",
    initials: "MR",
    primaryUser: { name: "Maria Rossi", email: "maria@acme.com" },
    subdomain: "acme",
    industry: "Discrete manufacturing",
    primaryColor: "#4f46e5",
    sensorCount: 1248,
    fleetCount: 6,
    sla: "99.94%",
    assets: [
      asset("PMP-014", "Cooling Pump 14", "Plant A · Utilities", "Centrifugal Pump", "critical", 7.8, 78, "12s ago"),
      asset("MTR-208", "Conveyor Motor 208", "Plant A · Line 3", "Induction Motor", "warning", 4.6, 64, "8s ago"),
      asset("FAN-031", "Exhaust Fan 31", "Plant B · HVAC", "Axial Fan", "healthy", 1.9, 41, "5s ago"),
      asset("CMP-002", "Air Compressor 02", "Plant A · Utilities", "Screw Compressor", "healthy", 2.4, 55, "11s ago"),
      asset("GBX-117", "Gearbox 117", "Plant B · Line 1", "Helical Gearbox", "warning", 5.1, 69, "9s ago"),
      asset("PMP-009", "Feed Pump 09", "Plant C · Boiler", "Centrifugal Pump", "healthy", 2.1, 48, "6s ago"),
    ],
    alerts: [
      { id: "A-2041", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "critical", rule: "RMS > 7.0 mm/s for 10m", message: "Bearing defect frequency detected (BPFO).", ts: "2m ago", ack: false, faultType: "BPFO · Outer-race bearing defect", confidence: 0.87, recommendedAction: "Schedule bearing replacement within 14 days. Stage spare 6308-2RS. Notify Maintenance Engineer.", assignee: "Daniel Park" },
      { id: "A-2039", assetId: "MTR-208", assetName: "Conveyor Motor 208", severity: "warning", rule: "RMS trending +18% / 24h", message: "Vibration trend rising — schedule inspection.", ts: "27m ago", ack: false, faultType: "Trend deviation · misalignment suspected", confidence: 0.74, recommendedAction: "Laser-align motor-conveyor coupling at next planned stop (≤ 30 days).", assignee: "Daniel Park" },
      { id: "A-2035", assetId: "GBX-117", assetName: "Gearbox 117", severity: "warning", rule: "Temp > 65°C", message: "Sustained high temperature on output shaft.", ts: "1h ago", ack: true, faultType: "Thermal · oil degradation risk", confidence: 0.69, recommendedAction: "Sample gearbox oil and check cooling fan within 7 days.", assignee: "Maria Rossi", workOrderId: "WO-4799" },
      { id: "A-2028", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "info", rule: "Calibration", message: "Sensor PMP-014-A1 calibrated.", ts: "6h ago", ack: true, faultType: "Maintenance · calibration", confidence: 1.0, recommendedAction: "No action — informational.", assignee: null },
    ],
    healthDistribution: [
      { name: "Healthy", value: 3, key: "healthy" },
      { name: "Warning", value: 2, key: "warning" },
      { name: "Critical", value: 1, key: "critical" },
    ],
    apiKeys: [
      { label: "Production", mask: "pg_live_acme_••••••••••a91f", scope: "read · write" },
      { label: "Ingestion (gateway)", mask: "pg_ing_acme_••••••••••7c20", scope: "ingest only" },
    ],
    integrations: [
      { name: "SAP PM", status: "Connected", desc: "Work-order creation on critical alerts" },
      { name: "Maximo CMMS", status: "Connected", desc: "Bi-directional asset sync" },
      { name: "Slack", status: "Connected", desc: "#reliability channel notifications" },
      { name: "Microsoft Teams", status: "Available", desc: "Alert cards & approvals" },
      { name: "PowerBI", status: "Available", desc: "Live dataset for BI dashboards" },
    ],
    users: [
      { name: "Maria Rossi", email: "maria@acme.com", role: "Reliability Manager", lastLogin: "2h ago", permissions: personas.reliability.permissions.allow },
      { name: "Daniel Park", email: "daniel@acme.com", role: "Maintenance Engineer", lastLogin: "18m ago", permissions: personas.engineer.permissions.allow },
      { name: "Anjali Verma", email: "anjali@acme.com", role: "IT Admin", lastLogin: "Yesterday 17:42", permissions: personas.admin.permissions.allow },
      { name: "Sven Olsen", email: "sven@acme.com", role: "Viewer", lastLogin: "3d ago", permissions: personas.viewer.permissions.allow },
    ],
    apiMetrics: { callsToday: 412840, rateLimit: 600000, rateUsedPct: 68, p95LatencyMs: 142, errorRatePct: 0.12, webhookDeliveries: 1284 },
    alertAnalytics: { mttaHours: 4.2, conversionPct: 68, topFault: "Bearing defects", topFaultPct: 42, falsePositivePct: 3.1 },
  },
  {
    id: "nordwind",
    name: "Nordwind Energy",
    plan: "Growth",
    region: "eu-north-1",
    apiStatus: "operational",
    initials: "LJ",
    primaryUser: { name: "Lars Johansen", email: "lars@nordwind.io" },
    subdomain: "nordwind",
    industry: "Wind energy operator",
    primaryColor: "#0ea5e9",
    sensorCount: 642,
    fleetCount: 5,
    sla: "99.91%",
    assets: [
      asset("WTG-021", "Turbine Gearbox 21", "Skagen Park · Row 2", "Wind Turbine Gearbox", "critical", 8.4, 81, "9s ago"),
      asset("WTG-018", "Turbine Main Bearing 18", "Skagen Park · Row 1", "Main Bearing", "warning", 4.9, 62, "11s ago"),
      asset("GEN-007", "Generator 07", "Esbjerg Park · A", "PMSG Generator", "healthy", 1.6, 45, "4s ago"),
      asset("PIT-044", "Pitch Drive 44", "Skagen Park · Row 3", "Pitch Actuator", "healthy", 2.0, 38, "7s ago"),
      asset("YAW-012", "Yaw Motor 12", "Esbjerg Park · B", "Yaw Drive", "warning", 4.2, 58, "10s ago"),
    ],
    alerts: [
      { id: "N-3120", assetId: "WTG-021", assetName: "Turbine Gearbox 21", severity: "critical", rule: "RMS > 7.5 mm/s for 15m", message: "Planetary stage tooth-mesh fault emerging.", ts: "5m ago", ack: false, faultType: "Gear-mesh frequency anomaly", confidence: 0.91, recommendedAction: "Dispatch climbing team within 72h. De-rate turbine to 60% pending inspection.", assignee: "Mette Sørensen" },
      { id: "N-3118", assetId: "WTG-018", assetName: "Turbine Main Bearing 18", severity: "warning", rule: "Temp > 60°C", message: "Main bearing temperature drifting upward.", ts: "42m ago", ack: false, faultType: "Thermal drift · lubrication", confidence: 0.66, recommendedAction: "Re-grease bearing at next scheduled service (≤ 21 days).", assignee: "Peter Holm" },
      { id: "N-3110", assetId: "YAW-012", assetName: "Yaw Motor 12", severity: "warning", rule: "Cycle count anomaly", message: "Excess yaw cycles last 6h — wind shear suspected.", ts: "3h ago", ack: true, faultType: "Operational · wind shear", confidence: 0.55, recommendedAction: "Cross-check met-mast data. No mechanical action required.", assignee: "Lars Johansen", workOrderId: "WO-3308" },
    ],
    healthDistribution: [
      { name: "Healthy", value: 2, key: "healthy" },
      { name: "Warning", value: 2, key: "warning" },
      { name: "Critical", value: 1, key: "critical" },
    ],
    apiKeys: [
      { label: "Production", mask: "pg_live_nrdw_••••••••••b22d", scope: "read · write" },
      { label: "SCADA bridge", mask: "pg_scd_nrdw_••••••••••f10a", scope: "ingest only" },
    ],
    integrations: [
      { name: "OSIsoft PI", status: "Connected", desc: "Streaming historian tag bridge" },
      { name: "Maximo CMMS", status: "Connected", desc: "Turbine work orders" },
      { name: "Slack", status: "Available", desc: "Ops channel notifications" },
      { name: "Microsoft Teams", status: "Connected", desc: "Field engineer approvals" },
      { name: "PowerBI", status: "Connected", desc: "Park performance dashboards" },
    ],
    users: [
      { name: "Lars Johansen", email: "lars@nordwind.io", role: "Reliability Manager", lastLogin: "1h ago", permissions: personas.reliability.permissions.allow },
      { name: "Mette Sørensen", email: "mette@nordwind.io", role: "SCADA Engineer", lastLogin: "Just now", permissions: personas.engineer.permissions.allow },
      { name: "Peter Holm", email: "peter@nordwind.io", role: "Field Technician", lastLogin: "5h ago", permissions: personas.engineer.permissions.allow },
    ],
    apiMetrics: { callsToday: 188320, rateLimit: 300000, rateUsedPct: 62, p95LatencyMs: 168, errorRatePct: 0.21, webhookDeliveries: 612 },
    alertAnalytics: { mttaHours: 3.6, conversionPct: 74, topFault: "Gear-mesh anomalies", topFaultPct: 38, falsePositivePct: 2.4 },
  },
  {
    id: "transrail",
    name: "TransRail Logistics",
    plan: "Pilot",
    region: "eu-central-1",
    apiStatus: "degraded",
    initials: "SK",
    primaryUser: { name: "Sophia Klein", email: "sophia@transrail.eu" },
    subdomain: "transrail",
    industry: "Rail freight",
    primaryColor: "#f59e0b",
    sensorCount: 184,
    fleetCount: 4,
    sla: "99.80%",
    assets: [
      asset("LOC-104", "Locomotive 104 Traction Motor", "Munich Depot", "Traction Motor", "warning", 4.3, 67, "14s ago"),
      asset("BGE-022", "Bogie 22 Axle Bearing", "Hamburg Depot", "Axle Bearing", "healthy", 2.2, 49, "8s ago"),
      asset("CMP-031", "Air Brake Compressor 31", "Munich Depot", "Reciprocating Compressor", "healthy", 2.6, 53, "10s ago"),
      asset("HVC-009", "HVAC Blower 09", "Berlin Depot", "Centrifugal Blower", "healthy", 1.8, 36, "5s ago"),
    ],
    alerts: [
      { id: "T-1042", assetId: "LOC-104", assetName: "Locomotive 104 Traction Motor", severity: "warning", rule: "RMS trending +22% / 7d", message: "Traction motor vibration rising — inspect at next service.", ts: "14m ago", ack: false, faultType: "Trend deviation · armature wear", confidence: 0.71, recommendedAction: "Inspect commutator and brushes at next depot stop (≤ 14 days).", assignee: "Jonas Weber" },
      { id: "T-1039", assetId: "LOC-104", assetName: "Locomotive 104 Traction Motor", severity: "info", rule: "Gateway sync", message: "Edge gateway reconnected after WAN flap.", ts: "2h ago", ack: true, faultType: "Connectivity", confidence: 1.0, recommendedAction: "No action — informational.", assignee: null },
    ],
    healthDistribution: [
      { name: "Healthy", value: 3, key: "healthy" },
      { name: "Warning", value: 1, key: "warning" },
      { name: "Critical", value: 0, key: "critical" },
    ],
    apiKeys: [
      { label: "Pilot key", mask: "pg_pilot_trnr_••••••••••e44c", scope: "read · write" },
    ],
    integrations: [
      { name: "SAP PM", status: "Available", desc: "Work-order creation on critical alerts" },
      { name: "Slack", status: "Connected", desc: "#rail-ops notifications" },
      { name: "PowerBI", status: "Available", desc: "Fleet BI dashboards" },
    ],
    users: [
      { name: "Sophia Klein", email: "sophia@transrail.eu", role: "Reliability Lead", lastLogin: "30m ago", permissions: personas.reliability.permissions.allow },
      { name: "Jonas Weber", email: "jonas@transrail.eu", role: "Depot Engineer", lastLogin: "4h ago", permissions: personas.engineer.permissions.allow },
    ],
    apiMetrics: { callsToday: 28140, rateLimit: 100000, rateUsedPct: 28, p95LatencyMs: 312, errorRatePct: 1.8, webhookDeliveries: 84 },
    alertAnalytics: { mttaHours: 6.1, conversionPct: 52, topFault: "Trend deviations", topFaultPct: 51, falsePositivePct: 4.8 },
  },
];

export const regions = [
  { id: "eu-west-1", label: "EU West (Ireland)" },
  { id: "eu-north-1", label: "EU North (Stockholm)" },
  { id: "eu-central-1", label: "EU Central (Frankfurt)" },
  { id: "us-east-1", label: "US East (Virginia)" },
  { id: "ap-south-1", label: "AP South (Mumbai)" },
];

export const getTenant = (id: string) => tenants.find((t) => t.id === id) ?? tenants[0];

// Per-tenant seeded trend; deterministic (legacy flat shape)
export function vibrationTrendFor(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const rand = (i: number) => {
    const x = Math.sin(s + i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: 48 }, (_, i) => {
    const base = 2 + Math.sin(i / 4 + (s % 7)) * 0.6;
    const spike = i > 36 ? (i - 36) * 0.45 : 0;
    return {
      t: `${String(i).padStart(2, "0")}:00`,
      rms: +(base + spike + rand(i) * 0.3).toFixed(2),
      threshold: 5,
    };
  });
}

// Asset-aware trend — converges to asset.vibrationRms at most recent timestamp
export function vibrationTrendForAsset(tenantSeed: string, asset: Asset) {
  const seed = `${tenantSeed}-${asset.id}`;
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const rand = (i: number) => {
    const x = Math.sin(s + i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const peak = asset.vibrationRms;
  const baselineFactor = asset.health === "healthy" ? 0.9 : asset.health === "warning" ? 0.5 : 0.32;
  const baseline = Math.max(0.6, peak * baselineFactor);
  const exp = asset.health === "critical" ? 2.4 : asset.health === "warning" ? 1.6 : 1;
  return Array.from({ length: 48 }, (_, i) => {
    const noise = (rand(i) - 0.5) * 0.22;
    const tFrac = i / 47;
    const trend = asset.health === "healthy"
      ? baseline + Math.sin(i / 5) * 0.18
      : baseline + (peak - baseline) * Math.pow(tFrac, exp);
    return {
      t: `${String(i).padStart(2, "0")}:00`,
      rms: +Math.max(0.2, trend + noise).toFixed(2),
      threshold: 5,
    };
  });
}

// Asset-specific FFT — peak frequency and amplitude vary per asset
export function fftSpectrumForAsset(asset: Asset) {
  let s = 0;
  for (let i = 0; i < asset.id.length; i++) s += asset.id.charCodeAt(i);
  const peakBin = 5 + (s % 22); // bin 5..26 → 150..675 Hz
  const peakHz = (peakBin + 1) * 25;
  const peakAmp = +(asset.vibrationRms * 0.28 + 0.35).toFixed(2);
  const bins = Array.from({ length: 32 }, (_, i) => {
    const x = Math.sin(s * 0.31 + i * 1.7) * 43758.5453;
    const r = x - Math.floor(x);
    const noise = 0.05 + r * 0.22;
    const harmonic = Math.exp(-Math.pow(i - peakBin, 2) / 1.4) * peakAmp;
    const sideband = (i === peakBin - 2 || i === peakBin + 2) ? peakAmp * 0.32 : 0;
    return { hz: (i + 1) * 25, amp: +(noise + harmonic + sideband).toFixed(2) };
  });
  return { peakHz, peakBin, peakAmp, bins };
}

export function fleetUptimeFor(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  return Array.from({ length: 14 }, (_, i) => {
    const x = Math.sin(s + i * 7.13) * 43758.5453;
    const r = x - Math.floor(x);
    return { day: `D${i + 1}`, uptime: +(98 + r * 1.8).toFixed(2) };
  });
}

// expose unused helper to keep tree-shaker happy
export { scoreFor };

// Tenant-specific failing endpoints for API error triage dialog
export function failingEndpointsFor(t: TenantData) {
  const ingest = t.assets[0]?.id ?? "ASSET-001";
  if (t.id === "acme") {
    return [
      { p: "POST /v1/ingest/vibration", code: 502, count: 14, lastSeen: "22s ago", cause: `Upstream gateway timeout (Plant A · ${ingest})` },
      { p: "POST /v1/rules", code: 422, count: 4, lastSeen: "2m ago", cause: "Schema validation — unknown metric 'kurt_x'" },
      { p: "GET /v1/assets/{id}/health", code: 500, count: 1, lastSeen: "8m ago", cause: "Transient query timeout on time-series store" },
    ];
  }
  if (t.id === "nordwind") {
    return [
      { p: "POST /v1/ingest/vibration", code: 502, count: 18, lastSeen: "12s ago", cause: `SCADA bridge → API gateway timeout (Skagen Row 2 · ${ingest})` },
      { p: "POST /v1/ingest/vibration", code: 429, count: 7, lastSeen: "1m ago", cause: "Rate limit burst — Esbjerg park backfill" },
      { p: "GET /v1/alerts", code: 500, count: 2, lastSeen: "3m ago", cause: "Transient query timeout" },
    ];
  }
  // transrail (degraded)
  return [
    { p: "POST /v1/ingest/vibration", code: 504, count: 42, lastSeen: "9s ago", cause: `Edge gateway WAN flap — Munich Depot (${ingest})` },
    { p: "POST /v1/ingest/vibration", code: 429, count: 23, lastSeen: "38s ago", cause: "Pilot tier rate cap reached (100k / day)" },
    { p: "GET /v1/assets/{id}/health", code: 503, count: 6, lastSeen: "2m ago", cause: "Backpressure from time-series writer" },
    { p: "POST /v1/webhooks", code: 401, count: 3, lastSeen: "5m ago", cause: "Signature mismatch — rotated key not redeployed" },
  ];
}

// Seed historical audit events per tenant (multi-day history, not just 1d)
export function seedAuditFor(t: TenantData) {
  const u = t.users;
  const pick = (i: number) => u[i % u.length]?.name ?? u[0].name;
  return [
    { ts: "2m ago",      action: "Acknowledged alert",    target: t.alerts[0]?.id ?? "—", actor: pick(1) },
    { ts: "18m ago",     action: "Created work order",    target: `WO-4799 ← ${t.alerts[1]?.id ?? "—"}`, actor: pick(0) },
    { ts: "1h ago",      action: "Rotated API key",       target: "Production", actor: pick(2) },
    { ts: "3h ago",      action: "Updated threshold",     target: "Vibration RMS critical 5.0 → 4.8", actor: pick(0) },
    { ts: "6h ago",      action: "Snoozed alert",         target: `${t.alerts[2]?.id ?? "—"} · 24h`, actor: pick(1) },
    { ts: "Yesterday",   action: "Invited user",          target: `${u[u.length - 1]?.email ?? "—"} · ${u[u.length - 1]?.role ?? "Viewer"}`, actor: pick(2) },
    { ts: "Yesterday",   action: "Toggled security setting", target: "Require MFA for all users=true", actor: pick(2) },
    { ts: "2d ago",      action: "Exported tenant data",  target: `tenant_${t.id} · GDPR Art. 20`, actor: pick(2) },
    { ts: "3d ago",      action: "Connected integration", target: t.integrations[0]?.name ?? "Slack", actor: pick(0) },
    { ts: "4d ago",      action: "Created monitoring rule", target: "Temp > 65°C · all assets", actor: pick(0) },
    { ts: "6d ago",      action: "Reassigned alert",      target: `${t.alerts[0]?.id ?? "—"} → ${pick(1)}`, actor: pick(0) },
    { ts: "8d ago",      action: "Closed work order",     target: "WO-4781 (bearing replaced)", actor: pick(1) },
    { ts: "12d ago",     action: "Changed data region",   target: t.region, actor: pick(2) },
    { ts: "21d ago",     action: "Updated branding",      target: `name=${t.name}`, actor: pick(2) },
    { ts: "30d ago",     action: "Tenant provisioned",    target: `tenant_${t.id} · ${t.plan}`, actor: "PulseGrid Trust Service" },
  ];
}


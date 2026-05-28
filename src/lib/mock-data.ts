export type Health = "healthy" | "warning" | "critical";

export interface Asset {
  id: string;
  name: string;
  site: string;
  type: string;
  health: Health;
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
  assets: Asset[];
  alerts: AlertItem[];
  sensorCount: number;
  fleetCount: number;
  sla: string;
  healthDistribution: { name: string; value: number; key: string }[];
  apiKeys: { label: string; mask: string; scope: string }[];
  integrations: { name: string; status: "Connected" | "Available"; desc: string }[];
  users: { name: string; email: string; role: string }[];
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
    sensorCount: 1248,
    fleetCount: 211,
    sla: "99.94%",
    assets: [
      { id: "PMP-014", name: "Cooling Pump 14", site: "Plant A · Utilities", type: "Centrifugal Pump", health: "critical", vibrationRms: 7.8, tempC: 78, lastSync: "12s ago" },
      { id: "MTR-208", name: "Conveyor Motor 208", site: "Plant A · Line 3", type: "Induction Motor", health: "warning", vibrationRms: 4.6, tempC: 64, lastSync: "8s ago" },
      { id: "FAN-031", name: "Exhaust Fan 31", site: "Plant B · HVAC", type: "Axial Fan", health: "healthy", vibrationRms: 1.9, tempC: 41, lastSync: "5s ago" },
      { id: "CMP-002", name: "Air Compressor 02", site: "Plant A · Utilities", type: "Screw Compressor", health: "healthy", vibrationRms: 2.4, tempC: 55, lastSync: "11s ago" },
      { id: "GBX-117", name: "Gearbox 117", site: "Plant B · Line 1", type: "Helical Gearbox", health: "warning", vibrationRms: 5.1, tempC: 69, lastSync: "9s ago" },
      { id: "PMP-009", name: "Feed Pump 09", site: "Plant C · Boiler", type: "Centrifugal Pump", health: "healthy", vibrationRms: 2.1, tempC: 48, lastSync: "6s ago" },
    ],
    alerts: [
      { id: "A-2041", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "critical", rule: "RMS > 7.0 mm/s for 10m", message: "Bearing defect frequency detected (BPFO).", ts: "2m ago", ack: false },
      { id: "A-2039", assetId: "MTR-208", assetName: "Conveyor Motor 208", severity: "warning", rule: "RMS trending +18% / 24h", message: "Vibration trend rising — schedule inspection.", ts: "27m ago", ack: false },
      { id: "A-2035", assetId: "GBX-117", assetName: "Gearbox 117", severity: "warning", rule: "Temp > 65°C", message: "Sustained high temperature on output shaft.", ts: "1h ago", ack: true },
      { id: "A-2028", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "info", rule: "Calibration", message: "Sensor PMP-014-A1 calibrated.", ts: "6h ago", ack: true },
    ],
    healthDistribution: [
      { name: "Healthy", value: 184, key: "healthy" },
      { name: "Warning", value: 23, key: "warning" },
      { name: "Critical", value: 4, key: "critical" },
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
      { name: "Maria Rossi", email: "maria@acme.com", role: "Reliability Manager" },
      { name: "Daniel Park", email: "daniel@acme.com", role: "Maintenance Engineer" },
      { name: "Anjali Verma", email: "anjali@acme.com", role: "IT Admin" },
      { name: "Sven Olsen", email: "sven@acme.com", role: "Viewer" },
    ],
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
    sensorCount: 642,
    fleetCount: 96,
    sla: "99.91%",
    assets: [
      { id: "WTG-021", name: "Turbine Gearbox 21", site: "Skagen Park · Row 2", type: "Wind Turbine Gearbox", health: "critical", vibrationRms: 8.4, tempC: 81, lastSync: "9s ago" },
      { id: "WTG-018", name: "Turbine Main Bearing 18", site: "Skagen Park · Row 1", type: "Main Bearing", health: "warning", vibrationRms: 4.9, tempC: 62, lastSync: "11s ago" },
      { id: "GEN-007", name: "Generator 07", site: "Esbjerg Park · A", type: "PMSG Generator", health: "healthy", vibrationRms: 1.6, tempC: 45, lastSync: "4s ago" },
      { id: "PIT-044", name: "Pitch Drive 44", site: "Skagen Park · Row 3", type: "Pitch Actuator", health: "healthy", vibrationRms: 2.0, tempC: 38, lastSync: "7s ago" },
      { id: "YAW-012", name: "Yaw Motor 12", site: "Esbjerg Park · B", type: "Yaw Drive", health: "warning", vibrationRms: 4.2, tempC: 58, lastSync: "10s ago" },
    ],
    alerts: [
      { id: "N-3120", assetId: "WTG-021", assetName: "Turbine Gearbox 21", severity: "critical", rule: "RMS > 7.5 mm/s for 15m", message: "Planetary stage tooth-mesh fault emerging.", ts: "5m ago", ack: false },
      { id: "N-3118", assetId: "WTG-018", assetName: "Turbine Main Bearing 18", severity: "warning", rule: "Temp > 60°C", message: "Main bearing temperature drifting upward.", ts: "42m ago", ack: false },
      { id: "N-3110", assetId: "YAW-012", assetName: "Yaw Motor 12", severity: "warning", rule: "Cycle count anomaly", message: "Excess yaw cycles last 6h — wind shear suspected.", ts: "3h ago", ack: true },
    ],
    healthDistribution: [
      { name: "Healthy", value: 78, key: "healthy" },
      { name: "Warning", value: 14, key: "warning" },
      { name: "Critical", value: 4, key: "critical" },
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
      { name: "Lars Johansen", email: "lars@nordwind.io", role: "Reliability Manager" },
      { name: "Mette Sørensen", email: "mette@nordwind.io", role: "SCADA Engineer" },
      { name: "Peter Holm", email: "peter@nordwind.io", role: "Field Technician" },
    ],
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
    sensorCount: 184,
    fleetCount: 32,
    sla: "99.80%",
    assets: [
      { id: "LOC-104", name: "Locomotive 104 Traction Motor", site: "Munich Depot", type: "Traction Motor", health: "warning", vibrationRms: 4.3, tempC: 67, lastSync: "14s ago" },
      { id: "BGE-022", name: "Bogie 22 Axle Bearing", site: "Hamburg Depot", type: "Axle Bearing", health: "healthy", vibrationRms: 2.2, tempC: 49, lastSync: "8s ago" },
      { id: "CMP-031", name: "Air Brake Compressor 31", site: "Munich Depot", type: "Reciprocating Compressor", health: "healthy", vibrationRms: 2.6, tempC: 53, lastSync: "10s ago" },
      { id: "HVC-009", name: "HVAC Blower 09", site: "Berlin Depot", type: "Centrifugal Blower", health: "healthy", vibrationRms: 1.8, tempC: 36, lastSync: "5s ago" },
    ],
    alerts: [
      { id: "T-1042", assetId: "LOC-104", assetName: "Locomotive 104 Traction Motor", severity: "warning", rule: "RMS trending +22% / 7d", message: "Traction motor vibration rising — inspect at next service.", ts: "14m ago", ack: false },
      { id: "T-1039", assetId: "LOC-104", assetName: "Locomotive 104 Traction Motor", severity: "info", rule: "Gateway sync", message: "Edge gateway reconnected after WAN flap.", ts: "2h ago", ack: true },
    ],
    healthDistribution: [
      { name: "Healthy", value: 28, key: "healthy" },
      { name: "Warning", value: 3, key: "warning" },
      { name: "Critical", value: 1, key: "critical" },
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
      { name: "Sophia Klein", email: "sophia@transrail.eu", role: "Reliability Lead" },
      { name: "Jonas Weber", email: "jonas@transrail.eu", role: "Depot Engineer" },
    ],
  },
];

export const getTenant = (id: string) => tenants.find((t) => t.id === id) ?? tenants[0];

// Per-tenant seeded trend; deterministic
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

export function fleetUptimeFor(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  return Array.from({ length: 14 }, (_, i) => {
    const x = Math.sin(s + i * 7.13) * 43758.5453;
    const r = x - Math.floor(x);
    return { day: `D${i + 1}`, uptime: +(98 + r * 1.8).toFixed(2) };
  });
}

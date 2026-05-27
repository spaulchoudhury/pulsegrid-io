export type Health = "healthy" | "warning" | "critical";

export interface Asset {
  id: string;
  name: string;
  site: string;
  type: string;
  health: Health;
  vibrationRms: number; // mm/s
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

export const tenants = [
  { id: "acme", name: "Acme Manufacturing", plan: "Enterprise" },
  { id: "nordwind", name: "Nordwind Energy", plan: "Growth" },
  { id: "transrail", name: "TransRail Logistics", plan: "Pilot" },
];

export const assets: Asset[] = [
  { id: "PMP-014", name: "Cooling Pump 14", site: "Plant A · Utilities", type: "Centrifugal Pump", health: "critical", vibrationRms: 7.8, tempC: 78, lastSync: "12s ago" },
  { id: "MTR-208", name: "Conveyor Motor 208", site: "Plant A · Line 3", type: "Induction Motor", health: "warning", vibrationRms: 4.6, tempC: 64, lastSync: "8s ago" },
  { id: "FAN-031", name: "Exhaust Fan 31", site: "Plant B · HVAC", type: "Axial Fan", health: "healthy", vibrationRms: 1.9, tempC: 41, lastSync: "5s ago" },
  { id: "CMP-002", name: "Air Compressor 02", site: "Plant A · Utilities", type: "Screw Compressor", health: "healthy", vibrationRms: 2.4, tempC: 55, lastSync: "11s ago" },
  { id: "GBX-117", name: "Gearbox 117", site: "Plant B · Line 1", type: "Helical Gearbox", health: "warning", vibrationRms: 5.1, tempC: 69, lastSync: "9s ago" },
  { id: "PMP-009", name: "Feed Pump 09", site: "Plant C · Boiler", type: "Centrifugal Pump", health: "healthy", vibrationRms: 2.1, tempC: 48, lastSync: "6s ago" },
];

export const alerts: AlertItem[] = [
  { id: "A-2041", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "critical", rule: "RMS > 7.0 mm/s for 10m", message: "Bearing defect frequency detected (BPFO).", ts: "2m ago", ack: false },
  { id: "A-2039", assetId: "MTR-208", assetName: "Conveyor Motor 208", severity: "warning", rule: "RMS trending +18% / 24h", message: "Vibration trend rising — schedule inspection.", ts: "27m ago", ack: false },
  { id: "A-2035", assetId: "GBX-117", assetName: "Gearbox 117", severity: "warning", rule: "Temp > 65°C", message: "Sustained high temperature on output shaft.", ts: "1h ago", ack: true },
  { id: "A-2028", assetId: "PMP-014", assetName: "Cooling Pump 14", severity: "info", rule: "Calibration", message: "Sensor PMP-014-A1 calibrated.", ts: "6h ago", ack: true },
];

// 48 hourly samples for a trend chart
export const vibrationTrend = Array.from({ length: 48 }, (_, i) => {
  const base = 2 + Math.sin(i / 4) * 0.6;
  const spike = i > 36 ? (i - 36) * 0.45 : 0;
  return {
    t: `${String(i).padStart(2, "0")}:00`,
    rms: +(base + spike + Math.random() * 0.3).toFixed(2),
    threshold: 5,
  };
});

export const healthDistribution = [
  { name: "Healthy", value: 184, key: "healthy" },
  { name: "Warning", value: 23, key: "warning" },
  { name: "Critical", value: 4, key: "critical" },
];

export const fleetUptime = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  uptime: +(98 + Math.random() * 1.8).toFixed(2),
}));

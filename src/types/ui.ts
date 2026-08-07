export type ModuleId = 
  | 'overview'
  | 'platform-library'
  | 'vehicle-definition'
  | 'simulation'
  | 'optimization'
  | 'digital-twin'
  | 'energy-flow'
  | 'constraints'
  | 'hardware-in-loop'
  | 'diagnostics'
  | 'reports'
  | 'hal-integration'
  | 'knowledge-hub'
  | 'validation'
  | 'references'
  | 'trade-studies'
  | 'mission-analysis';

export type DigitalTwinViewMode = 
  | 'DEFAULT'
  | 'WIREFRAME'
  | 'THERMAL'
  | 'EXPLODED'
  | 'POWER_FLOW';

export interface SystemMetrics {
  latencyMs: number;
  telemetryRateHz: number;
  cpuUtilPct: number;
  gpuUtilPct: number;
  memoryUtilPct: number;
  vramUtilPct: number;
  activeSockets: number;
}

export interface NavigationItem {
  id: ModuleId;
  label: string;
  iconName: string;
  badge?: string;
  description: string;
}

// Utilities for exporting reports in PDF (Print), CSV, and JSON formats

import { AircraftPlatform, MissionProfile, TelemetryFrame } from '../../types/telemetry';
import { SimulationResult, OptimizationResult } from '../../store/useGarunStore';

export interface ParetoPointExport {
  id: number | string;
  enduranceHours?: number;
  enduranceHr?: number;
  maxTakeoffWeightKg?: number;
  weightKg?: number;
  fuelBurnKg?: number;
  sfcKgKwh?: number;
  batteryWeightKg?: number;
  gasEngineWeightKg?: number;
  hybridSplitRatio?: number;
  score?: number;
  isParetoOptimal?: boolean;
  paretoOptimal?: boolean;
}

export interface TelemetryNodeExport {
  id: string;
  name: string;
  type: string;
  powerKw: number;
  voltageV: number;
  currentA: number;
  temperatureC: number;
  efficiencyPct: number;
  status: string;
}

export interface ReportExportData {
  reportId: string;
  title: string;
  reportType: 'TECHNICAL' | 'MISSION_SUMMARY' | 'OPTIMIZATION';
  timestamp: string;
  classification: string;
  author: string;
  aircraft: AircraftPlatform & { tailNumber?: string };
  mission: MissionProfile & { climbAltM?: number; cruiseAltM?: number; cruiseSpeedKts?: number; targetEnduranceMin?: number };
  simulation: (SimulationResult & { totalRangeKm?: number; takeoffWeightKg?: number; averageSfcGkwh?: number; co2EmissionsKg?: number }) | null;
  optimization: (OptimizationResult & { paretoPoints?: ParetoPointExport[] }) | null;
  telemetry: { nodes?: TelemetryNodeExport[] } & Partial<TelemetryFrame>;
  engineerNotes?: string;
  includedSections: string[];
}

/**
 * Trigger CSV download containing tabular report data
 */
export function exportReportToCsv(data: ReportExportData) {
  let csvContent = `HAL AEROSPACE DEFENSE R&D - REPORT EXPORT\n`;
  csvContent += `Report ID,${data.reportId}\n`;
  csvContent += `Title,"${data.title}"\n`;
  csvContent += `Type,${data.reportType}\n`;
  csvContent += `Generated,${data.timestamp}\n`;
  csvContent += `Classification,${data.classification}\n`;
  csvContent += `Aircraft Platform,"${data.aircraft?.name || 'N/A'}" (${data.aircraft?.tailNumber || ''})\n`;
  csvContent += `Mission Profile,"${data.mission?.name || 'N/A'}"\n\n`;

  if (data.reportType === 'OPTIMIZATION' && data.optimization?.paretoPoints) {
    csvContent += `PARETO FRONTIER CANDIDATE POINTS\n`;
    csvContent += `Point ID,Endurance (hrs),MTOW (kg),Fuel Burn (kg),Battery Weight (kg),Engine Weight (kg),Hybrid Ratio,Score,Pareto Optimal\n`;
    data.optimization.paretoPoints.forEach((pt: ParetoPointExport) => {
      csvContent += `${pt.id},${pt.enduranceHours},${pt.maxTakeoffWeightKg},${pt.fuelBurnKg},${pt.batteryWeightKg},${pt.gasEngineWeightKg},${pt.hybridSplitRatio},${pt.score},${pt.isParetoOptimal}\n`;
    });
    csvContent += `\n`;
  }

  if (data.reportType === 'MISSION_SUMMARY' && data.mission) {
    csvContent += `MISSION PROFILE SPECIFICATIONS\n`;
    csvContent += `Phase,Altitude (m),Speed (kts),Duration (min),Power Split (Gas/Elec %)\n`;
    csvContent += `Climb,${data.mission.climbAltM || 6500},140,25,50 / 50\n`;
    csvContent += `Cruise,${data.mission.cruiseAltM || 6500},${data.mission.cruiseSpeedKts || 165},${data.mission.targetEnduranceMin || 360},65 / 35\n`;
    csvContent += `Loiter,${data.mission.cruiseAltM || 6500},120,120,40 / 60\n`;
    csvContent += `Descent,0,130,20,10 / 90\n\n`;
  }

  if (data.telemetry?.nodes) {
    csvContent += `PROPULSION CHAIN COMPONENT METRICS\n`;
    csvContent += `Node ID,Component Name,Type,Power (kW),Voltage (V),Current (A),Temp (°C),Efficiency (%),Status\n`;
    data.telemetry.nodes.forEach((node: TelemetryNodeExport) => {
      csvContent += `${node.id},"${node.name}",${node.type},${node.powerKw},${node.voltageV},${node.currentA},${node.temperatureC},${node.efficiencyPct},${node.status}\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HAL_${data.reportType}_${data.reportId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger JSON download containing structured report dataset
 */
export function exportReportToJson(data: ReportExportData) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HAL_${data.reportType}_${data.reportId}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger Print dialog formatted for clean PDF generation
 */
export function exportReportToPdf() {
  window.print();
}

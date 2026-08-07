import { useMemo } from 'react';
import { useGarunStore } from '../../store/useGarunStore';

export type CameraPreset = 'ISO' | 'TOP' | 'SIDE' | 'ENGINE_XRAY' | 'BATTERY_XRAY';

export interface SelectedComponentInfo {
  id: string;
  title: string;
  category: 'PROPULSION' | 'GENERATION' | 'STORAGE' | 'ELECTRONICS';
  powerKw: number;
  voltageV?: number;
  currentA?: number;
  rpm?: number;
  tempC: number;
  efficiencyPct: number;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  description: string;
}

export function useSubsystemHighlight(selectedCompId: string) {
  const activeTelemetryFrame = useGarunStore((state) => state.activeTelemetryFrame);

  const componentCatalog: Record<string, SelectedComponentInfo> = useMemo(
    () => ({
      turboshaft: {
        id: 'turboshaft',
        title: 'Turboshaft Gas Engine Core',
        category: 'PROPULSION',
        powerKw: activeTelemetryFrame?.engine?.powerKw || 110,
        rpm: activeTelemetryFrame?.engine?.rpm || 5450,
        tempC: activeTelemetryFrame?.engine?.egtCelsius || 720,
        efficiencyPct: 38.5,
        status: 'NOMINAL',
        description: 'Single-spool turboshaft core providing primary mechanical torque to the high-speed generator.'
      },
      generator: {
        id: 'generator',
        title: 'High-Speed Permanent Magnet Generator',
        category: 'GENERATION',
        powerKw: 58.1,
        voltageV: 620,
        currentA: 93.7,
        rpm: 12000,
        tempC: 62,
        efficiencyPct: 96.4,
        status: 'NOMINAL',
        description: 'Directly coupled high-frequency generator converting mechanical shaft power into 620V DC bus power.'
      },
      power_bus: {
        id: 'power_bus',
        title: 'High-Voltage DC Power Matrix & Inverter',
        category: 'ELECTRONICS',
        powerKw: 95.0,
        voltageV: 620,
        currentA: 153.2,
        tempC: 41,
        efficiencyPct: 97.8,
        status: 'NOMINAL',
        description: 'Solid-state SiC inverter and bus routing power dynamically between generator, battery, and motor.'
      },
      battery: {
        id: 'battery',
        title: 'Li-ion NMC Battery Pack',
        category: 'STORAGE',
        powerKw: activeTelemetryFrame?.battery?.dischargeKw || 40.0,
        voltageV: activeTelemetryFrame?.battery?.packVoltageV || 620.4,
        currentA: activeTelemetryFrame?.battery?.currentDrawA || 64.5,
        tempC: activeTelemetryFrame?.battery?.cellTempAvgC || 38.2,
        efficiencyPct: 96.0,
        status: (activeTelemetryFrame?.battery?.status || 'NOMINAL') as 'NOMINAL' | 'WARNING' | 'CRITICAL',
        description: 'Pack-level 200 Wh/kg Li-ion NMC battery array providing boost power during climb and loiter.'
      },
      motor: {
        id: 'motor',
        title: 'Electric Traction Motor',
        category: 'PROPULSION',
        powerKw: 88.0,
        voltageV: 600,
        currentA: 146.6,
        rpm: 2400,
        tempC: 58,
        efficiencyPct: 95.8,
        status: 'NOMINAL',
        description: 'High torque density brushless electric motor driving contra-rotating propeller assembly.'
      }
    }),
    [activeTelemetryFrame]
  );

  const activeComp = componentCatalog[selectedCompId] || componentCatalog['turboshaft'];

  return {
    componentCatalog,
    activeComp
  };
}

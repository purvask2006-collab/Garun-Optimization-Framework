export type AnalysisModuleId =
  | 'overview'
  | 'flight-timeline'
  | 'aerodynamics'
  | 'propulsion'
  | 'fuel'
  | 'battery'
  | 'hybrid-power'
  | 'energy'
  | 'endurance-range'
  | 'environment'
  | 'thermal'
  | 'stability'
  | 'mission-efficiency'
  | 'anomalies'
  | 'live-analysis'
  | 'prediction'
  | 'what-if'
  | 'optimization'
  | 'recommendations'
  | 'methodology'
  | 'data-quality'
  | 'generate-report';

export interface AnalysisNavItem {
  id: AnalysisModuleId;
  number: number;
  label: string;
  category: 'CORE' | 'POWER' | 'INTELLIGENCE' | 'ENGINEERING';
  iconName: string;
  badge?: string;
  status: 'READY' | 'LIVE' | 'STANDBY' | 'CALCULATING';
  description: string;
}

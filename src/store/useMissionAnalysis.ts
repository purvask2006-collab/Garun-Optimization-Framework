import { create } from 'zustand';
import { analyzeMissionDataset, generateSampleMissionTelemetry, MissionAnalysisResult, RawTelemetryFrame } from '../analysis';

export interface MissionAnalysisStoreState {
  datasetName: string;
  rawTelemetry: RawTelemetryFrame[];
  analysisResult: MissionAnalysisResult;
  isAnalyzing: boolean;
  loadCustomDataset: (name: string, frames: RawTelemetryFrame[]) => void;
  reanalyze: () => void;
  resetToDefaultSample: () => void;
}

// Pre-compute initial default sample analysis
const initialRawData = generateSampleMissionTelemetry(60);
const initialResult = analyzeMissionDataset(initialRawData, 'GARUN-MALE-UAV-TELEMETRY-STREAM');

export const useMissionAnalysisStore = create<MissionAnalysisStoreState>((set, get) => ({
  datasetName: 'GARUN-MALE-UAV-TELEMETRY-STREAM',
  rawTelemetry: initialRawData,
  analysisResult: initialResult,
  isAnalyzing: false,

  loadCustomDataset: (name, frames) => {
    set({ isAnalyzing: true, datasetName: name, rawTelemetry: frames });
    const result = analyzeMissionDataset(frames, name);
    set({ analysisResult: result, isAnalyzing: false });
  },

  reanalyze: () => {
    const { rawTelemetry, datasetName } = get();
    set({ isAnalyzing: true });
    const result = analyzeMissionDataset(rawTelemetry, datasetName);
    set({ analysisResult: result, isAnalyzing: false });
  },

  resetToDefaultSample: () => {
    const defaultData = generateSampleMissionTelemetry(60);
    set({ isAnalyzing: true, datasetName: 'GARUN-MALE-UAV-TELEMETRY-STREAM', rawTelemetry: defaultData });
    const result = analyzeMissionDataset(defaultData, 'GARUN-MALE-UAV-TELEMETRY-STREAM');
    set({ analysisResult: result, isAnalyzing: false });
  },
}));

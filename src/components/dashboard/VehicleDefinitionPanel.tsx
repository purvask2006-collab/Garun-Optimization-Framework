import React, { useState } from 'react';
import {
  Scale,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Zap,
  Fuel,
  Feather,
  Box,
  HelpCircle,
  BarChart2,
  Layers,
  Wind
} from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { FormulaPanel } from '../common/FormulaPanel';
import { useGarunStore } from '../../store/useGarunStore';
import { computeDetailedWeightBudget } from '../../physics/garunPhysics';
import { AerodynamicsPanel } from './AerodynamicsPanel';
import {
  COMP_MTOW_KG,
  COMP_PAYLOAD_KG,
  DESIGN_WING_AREA_M2,
  DESIGN_ASPECT_RATIO,
} from '../../physics/garunSpec';

export const VehicleDefinitionPanel: React.FC = () => {
  const {
    vehicleInputs,
    updateVehicleInputs,
    simulationParams,
    updateSimulationParams,
  } = useGarunStore();

  const [activeTab, setActiveTab] = useState<'WEIGHT' | 'AERO'>('WEIGHT');
  const engineKw = simulationParams.engineKw ?? 60;
  const motorKw = simulationParams.motorKw ?? 55;
  const batteryKwh = simulationParams.batteryCapacityKwh ?? 22;
  const [showAssumptionsModal, setShowAssumptionsModal] = useState<boolean>(false);

  // Compute live weight budget using physics model
  const budget = computeDetailedWeightBudget({
    mtowKg: vehicleInputs.mtow_kg,
    payloadKg: vehicleInputs.payload_kg,
    batteryKwh: batteryKwh,
    engineKw: engineKw,
    motorKw: motorKw,
    generatorKw: engineKw,
  });

  if (activeTab === 'AERO') {
    return (
      <div className="h-full flex flex-col space-y-2">
        <div className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded border border-[#1A2740] flex-shrink-0">
          <button
            onClick={() => setActiveTab('WEIGHT')}
            className="flex-1 py-1 px-2 text-[10px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase text-[#8A9BBE] hover:text-white hover:bg-[#172236]"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>MASS BUDGET</span>
          </button>
          <button
            onClick={() => setActiveTab('AERO')}
            className="flex-1 py-1 px-2 text-[10px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>AERODYNAMIC POLAR</span>
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <AerodynamicsPanel />
        </div>
      </div>
    );
  }

  const handleMtowChange = (val: number) => {
    updateVehicleInputs({ mtow_kg: val });
  };

  const handlePayloadChange = (val: number) => {
    updateVehicleInputs({ payload_kg: val });
    updateSimulationParams({ payloadKg: val });
  };

  const handleWingAreaChange = (val: number) => {
    updateVehicleInputs({ wing_area_m2: val });
  };

  const handleAspectRatioChange = (val: number) => {
    updateVehicleInputs({ aspect_ratio: val });
  };

  const handleBatteryChange = (val: number) => {
    updateSimulationParams({ batteryCapacityKwh: val });
  };

  const handleEngineChange = (val: number) => {
    updateSimulationParams({ engineKw: val });
  };

  const handleMotorChange = (val: number) => {
    updateSimulationParams({ motorKw: val });
  };

  // Stacked bar items calculation
  const totalBar = Math.max(1, budget.totalMassKg);
  const items = [
    { label: 'Structural', val: budget.structuralMassKg, color: '#3B82F6', pct: (budget.structuralMassKg / totalBar) * 100 },
    { label: 'Engine', val: budget.engineMassKg, color: '#EF4444', pct: (budget.engineMassKg / totalBar) * 100 },
    { label: 'Generator', val: budget.generatorMassKg, color: '#F59E0B', pct: (budget.generatorMassKg / totalBar) * 100 },
    { label: 'Motor', val: budget.motorMassKg, color: '#10B981', pct: (budget.motorMassKg / totalBar) * 100 },
    { label: 'Power Elec', val: budget.powerElectronicsMassKg, color: '#8B5CF6', pct: (budget.powerElectronicsMassKg / totalBar) * 100 },
    { label: 'Avionics', val: budget.avionicsMassKg, color: '#6366F1', pct: (budget.avionicsMassKg / totalBar) * 100 },
    { label: 'Battery', val: budget.batteryMassKg, color: '#06B6D4', pct: (budget.batteryMassKg / totalBar) * 100 },
    { label: 'Payload', val: budget.payloadKg, color: '#EC4899', pct: (budget.payloadKg / totalBar) * 100 },
    { label: 'Fuel', val: Math.max(0, budget.fuelMassKg), color: '#10B981', pct: (Math.max(0, budget.fuelMassKg) / totalBar) * 100 },
  ];

  return (
    <div className="h-full flex flex-col space-y-2">
      <div className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded border border-[#1A2740] flex-shrink-0">
        <button
          onClick={() => setActiveTab('WEIGHT')}
          className="flex-1 py-1 px-2 text-[10px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase bg-[#00A8FF] text-[#0A0F1E] font-bold shadow-sm"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>MASS BUDGET</span>
        </button>
        <button
          onClick={() => setActiveTab('AERO')}
          className="flex-1 py-1 px-2 text-[10px] font-mono-data rounded flex items-center justify-center space-x-1 uppercase text-[#8A9BBE] hover:text-white hover:bg-[#172236]"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>AERODYNAMIC POLAR</span>
        </button>
      </div>

      <CornerReticle className="flex-1 min-h-0 flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7] overflow-y-auto">
        {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#00A8FF]" />
            <h2 className="text-xs font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
              VEHICLE DEFINITION & WEIGHT BUDGET
            </h2>
          </div>
          <button
            onClick={() => setShowAssumptionsModal(!showAssumptionsModal)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#172236] border border-[#1A2740] text-[10px] font-mono-data text-[#00A8FF] hover:bg-[#1A2740] transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>ASSUMPTIONS</span>
          </button>
        </div>

        {/* Validation Badges */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* MTOW Check */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded flex flex-col items-center justify-center">
            <div className="text-[9px] text-[#8A9BBE] font-mono-data uppercase mb-0.5 flex items-center space-x-1">
              <span>MTOW Check</span>
              <FormulaPanel
                label="MTOW Mass Breakdown"
                value={vehicleInputs.mtow_kg}
                unit="kg"
                symbolicFormula="MTOW = OEW + Fuel + Battery + Payload&#10;OEW = Structure + Engine + Generator + Motor + PowerElec + Avionics"
                variableDefs={[
                  { symbol: 'OEW', name: 'Operational Empty Weight', value: (budget.structuralMassKg + budget.engineMassKg + budget.generatorMassKg + budget.motorMassKg + budget.powerElectronicsMassKg + budget.avionicsMassKg).toFixed(1), unit: 'kg' },
                  { symbol: 'Structure', name: 'Carbon Composite Airframe', value: budget.structuralMassKg.toFixed(1), unit: 'kg' },
                  { symbol: 'Engine', name: '60kW Turboshaft Core', value: budget.engineMassKg.toFixed(1), unit: 'kg' },
                  { symbol: 'Battery', name: `${simulationParams.batteryCapacityKwh}kWh Li-Ion Pack`, value: budget.batteryMassKg.toFixed(1), unit: 'kg' },
                  { symbol: 'Payload', name: 'EO/IR + SAR Suite', value: budget.payloadKg.toFixed(1), unit: 'kg' },
                  { symbol: 'Fuel', name: 'Jet-A1 Fuel Capacity', value: budget.fuelMassKg.toFixed(1), unit: 'kg' }
                ]}
                substitutedFormula={`MTOW = ${(budget.structuralMassKg + budget.engineMassKg + budget.generatorMassKg + budget.motorMassKg + budget.powerElectronicsMassKg + budget.avionicsMassKg).toFixed(1)} (OEW) + ${budget.batteryMassKg.toFixed(1)} (Batt) + ${budget.payloadKg.toFixed(1)} (Payload) + ${budget.fuelMassKg.toFixed(1)} (Fuel) = ${budget.totalMassKg.toFixed(1)} kg`}
                resultWithUnit={`${vehicleInputs.mtow_kg} kg (Max 1000 kg Limit)`}
                source="HAL GARUN Competition Weight Budget Matrix. Composite structure mass estimation."
                confidence="COMPETITION_GIVEN"
              />
            </div>
            <div className="flex items-center space-x-1">
              {budget.mtowValidation === 'PASS' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#FF4D4D]" />
              )}
              <span
                className={`text-xs font-bold font-mono-data ${
                  budget.mtowValidation === 'PASS' ? 'text-[#00E87A]' : 'text-[#FF4D4D]'
                }`}
              >
                {budget.mtowValidation} ({vehicleInputs.mtow_kg}kg)
              </span>
            </div>
            <div className="text-[8px] text-[#8A9BBE] mt-0.5">≤ {COMP_MTOW_KG} kg limit</div>
          </div>

          {/* Payload Check */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded flex flex-col items-center justify-center">
            <div className="text-[9px] text-[#8A9BBE] font-mono-data uppercase mb-0.5">Payload Check</div>
            <div className="flex items-center space-x-1">
              {budget.payloadValidation === 'PASS' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#FF4D4D]" />
              )}
              <span
                className={`text-xs font-bold font-mono-data ${
                  budget.payloadValidation === 'PASS' ? 'text-[#00E87A]' : 'text-[#FF4D4D]'
                }`}
              >
                {budget.payloadValidation} ({vehicleInputs.payload_kg}kg)
              </span>
            </div>
            <div className="text-[8px] text-[#8A9BBE] mt-0.5">≥ {COMP_PAYLOAD_KG} kg required</div>
          </div>

          {/* Fuel Check */}
          <div className="bg-[#111A2E] border border-[#1A2740] p-2 rounded flex flex-col items-center justify-center">
            <div className="text-[9px] text-[#8A9BBE] font-mono-data uppercase mb-0.5">Fuel Reserve</div>
            <div className="flex items-center space-x-1">
              {budget.fuelValidation === 'PASS' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A]" />
              ) : budget.fuelValidation === 'WARNING' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#FF4D4D]" />
              )}
              <span
                className={`text-xs font-bold font-mono-data ${
                  budget.fuelValidation === 'PASS'
                    ? 'text-[#00E87A]'
                    : budget.fuelValidation === 'WARNING'
                    ? 'text-[#FFB800]'
                    : 'text-[#FF4D4D]'
                }`}
              >
                {budget.fuelValidation} ({budget.fuelMassKg.toFixed(1)}kg)
              </span>
            </div>
            <div className="text-[8px] text-[#8A9BBE] mt-0.5">Min 80 kg target</div>
          </div>
        </div>

        {/* Sliders and Inputs Section */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded space-y-2.5 mb-3">
          <div className="text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider flex items-center justify-between border-b border-[#1A2740] pb-1">
            <div className="flex items-center space-x-1">
              <Sliders className="w-3 h-3" />
              <span>AIRCRAFT DESIGN INPUTS</span>
            </div>
            <span className="text-[9px] text-[#8A9BBE]">LIVE CALCULATION</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* MTOW Input */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#8A9BBE] font-mono-data">
                <span className="flex items-center space-x-1">
                  <span>MTOW Target</span>
                  <span
                    title={`Competition specification max MTOW = ${COMP_MTOW_KG} kg`}
                    className="bg-[#00A8FF]/20 text-[#00A8FF] px-1 rounded text-[8px] cursor-help"
                  >
                    COMP
                  </span>
                </span>
                <span className="text-[#E8EDF7] font-bold">{vehicleInputs.mtow_kg} kg</span>
              </div>
              <input
                type="number"
                value={vehicleInputs.mtow_kg}
                onChange={(e) => handleMtowChange(Number(e.target.value))}
                className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-2 py-0.5 text-xs text-[#E8EDF7] font-mono-data mt-0.5 focus:border-[#00A8FF] outline-none"
              />
            </div>

            {/* Payload Input */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#8A9BBE] font-mono-data">
                <span className="flex items-center space-x-1">
                  <span>Payload</span>
                  <span
                    title={`Competition specification min payload = ${COMP_PAYLOAD_KG} kg`}
                    className="bg-[#00A8FF]/20 text-[#00A8FF] px-1 rounded text-[8px] cursor-help"
                  >
                    COMP
                  </span>
                </span>
                <span className="text-[#E8EDF7] font-bold">{vehicleInputs.payload_kg} kg</span>
              </div>
              <input
                type="number"
                value={vehicleInputs.payload_kg}
                onChange={(e) => handlePayloadChange(Number(e.target.value))}
                className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-2 py-0.5 text-xs text-[#E8EDF7] font-mono-data mt-0.5 focus:border-[#00A8FF] outline-none"
              />
            </div>

            {/* Wing Area */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#8A9BBE] font-mono-data">
                <span className="flex items-center space-x-1">
                  <span>Wing Area</span>
                  <span className="bg-[#FFB800]/20 text-[#FFB800] px-1 rounded text-[8px]">
                    ASSUMPTION
                  </span>
                </span>
                <span className="text-[#E8EDF7] font-bold">{vehicleInputs.wing_area_m2} m²</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={vehicleInputs.wing_area_m2}
                onChange={(e) => handleWingAreaChange(Number(e.target.value))}
                className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-2 py-0.5 text-xs text-[#E8EDF7] font-mono-data mt-0.5 focus:border-[#00A8FF] outline-none"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#8A9BBE] font-mono-data">
                <span className="flex items-center space-x-1">
                  <span>Aspect Ratio</span>
                  <span className="bg-[#FFB800]/20 text-[#FFB800] px-1 rounded text-[8px]">
                    ASSUMPTION
                  </span>
                </span>
                <span className="text-[#E8EDF7] font-bold">{vehicleInputs.aspect_ratio}</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={vehicleInputs.aspect_ratio}
                onChange={(e) => handleAspectRatioChange(Number(e.target.value))}
                className="w-full bg-[#0A0F1E] border border-[#1A2740] rounded px-2 py-0.5 text-xs text-[#E8EDF7] font-mono-data mt-0.5 focus:border-[#00A8FF] outline-none"
              />
            </div>
          </div>

          {/* Sizing Sliders */}
          <div className="space-y-2 pt-1 border-t border-[#1A2740]">
            {/* Battery Energy Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono-data text-[#8A9BBE] mb-0.5">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-[#06B6D4]" />
                  <span>Battery Energy (5–40 kWh)</span>
                </span>
                <span className="text-[#06B6D4] font-bold">{batteryKwh} kWh → {budget.batteryMassKg.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={batteryKwh}
                onChange={(e) => handleBatteryChange(Number(e.target.value))}
                className="w-full accent-[#06B6D4] h-1.5 bg-[#172236] rounded cursor-pointer"
              />
            </div>

            {/* Engine Power Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono-data text-[#8A9BBE] mb-0.5">
                <span className="flex items-center space-x-1">
                  <Fuel className="w-3 h-3 text-[#EF4444]" />
                  <span>Engine Rating (40–90 kW)</span>
                </span>
                <span className="text-[#EF4444] font-bold">{engineKw} kW → {(budget.engineMassKg + budget.generatorMassKg).toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="2"
                value={engineKw}
                onChange={(e) => handleEngineChange(Number(e.target.value))}
                className="w-full accent-[#EF4444] h-1.5 bg-[#172236] rounded cursor-pointer"
              />
            </div>

            {/* Motor Power Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono-data text-[#8A9BBE] mb-0.5">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-[#10B981]" />
                  <span>Motor Rating (30–80 kW)</span>
                </span>
                <span className="text-[#10B981] font-bold">{motorKw} kW → {(budget.motorMassKg + budget.powerElectronicsMassKg).toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="2"
                value={motorKw}
                onChange={(e) => handleMotorChange(Number(e.target.value))}
                className="w-full accent-[#10B981] h-1.5 bg-[#172236] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Stacked Bar Breakdown Chart */}
        <div className="bg-[#111A2E] border border-[#1A2740] p-2.5 rounded mb-3">
          <div className="flex items-center justify-between text-[10px] font-mono-data text-[#00A8FF] font-bold uppercase tracking-wider mb-2">
            <div className="flex items-center space-x-1">
              <BarChart2 className="w-3 h-3" />
              <span>MASS BREAKDOWN WATERFALL / STACKED BAR</span>
            </div>
            <span className="text-[#E8EDF7] font-bold">{budget.totalMassKg.toFixed(1)} kg</span>
          </div>

          {/* Stacked bar graphic */}
          <div className="w-full h-5 bg-[#0A0F1E] rounded overflow-hidden flex p-0.5 space-x-0.5 border border-[#1A2740]">
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${Math.max(1, item.pct)}%`, backgroundColor: item.color }}
                title={`${item.label}: ${item.val.toFixed(1)} kg (${item.pct.toFixed(1)}%)`}
                className="h-full rounded-sm transition-all duration-300 relative group cursor-pointer"
              />
            ))}
          </div>

          {/* Stacked Legend Grid */}
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2 text-[9px] font-mono-data">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#0A0F1E]/60 px-1.5 py-0.5 rounded border border-[#1A2740]/40">
                <div className="flex items-center space-x-1 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#8A9BBE] truncate">{item.label}</span>
                </div>
                <span className="text-[#E8EDF7] font-semibold ml-1">{item.val.toFixed(1)}kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Weight Breakdown Table */}
        <div className="bg-[#111A2E] border border-[#1A2740] rounded overflow-hidden">
          <div className="px-2.5 py-1.5 bg-[#172236] border-b border-[#1A2740] text-[10px] font-mono-data text-[#00F5E4] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>LIVE COMPUTED MASS BREAKDOWN</span>
            <span>MASS (KG)</span>
          </div>

          <div className="p-2 space-y-1 text-[10px] font-mono-data">
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Structural Mass (30% MTOW)</span>
              <span className="text-[#E8EDF7]">{budget.structuralMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Engine Mass (2.0 kg/kW × {engineKw}kW)</span>
              <span className="text-[#E8EDF7]">{budget.engineMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Generator Mass (1.5 kg/kW × {engineKw}kW)</span>
              <span className="text-[#E8EDF7]">{budget.generatorMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Motor Mass (1.0 kg/kW × {motorKw}kW)</span>
              <span className="text-[#E8EDF7]">{budget.motorMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Power Electronics Mass (0.5 kg/kW × {motorKw}kW)</span>
              <span className="text-[#E8EDF7]">{budget.powerElectronicsMassKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Avionics & Sensor Suite (Fixed)</span>
              <span className="text-[#E8EDF7]">{budget.avionicsMassKg.toFixed(1)} kg</span>
            </div>

            {/* OEW Subtotal */}
            <div className="flex justify-between py-1 px-1 bg-[#1A2740]/60 rounded font-bold text-[#00A8FF]">
              <span>OPERATING EMPTY WEIGHT (OEW SUBTOTAL)</span>
              <span>{budget.oewSubtotalKg.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Payload (User Input)</span>
              <span className="text-[#E8EDF7]">{budget.payloadKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#8A9BBE] border-b border-[#1A2740]/30">
              <span>Battery Mass ({batteryKwh} kWh @ 200 Wh/kg)</span>
              <span className="text-[#E8EDF7]">{budget.batteryMassKg.toFixed(1)} kg</span>
            </div>

            {/* Fuel mass free variable */}
            <div className="flex justify-between py-1 px-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded font-bold text-[#10B981]">
              <span>FUEL MASS (FREE VARIABLE = MTOW - OEW - Payload - Battery)</span>
              <span>{budget.fuelMassKg.toFixed(1)} kg</span>
            </div>

            {/* TOTAL MTOW */}
            <div className="flex justify-between py-1.5 px-1.5 bg-[#00A8FF]/20 border border-[#00A8FF]/40 rounded font-bold text-white text-xs mt-1">
              <span>TOTAL (CLOSED MASS BUDGET = MTOW)</span>
              <span>{budget.totalMassKg.toFixed(1)} kg</span>
            </div>

            {/* Margin */}
            <div className="flex justify-between py-0.5 px-1 text-[9px] text-[#8A9BBE]">
              <span>Competition Margin (Max 1000 kg - MTOW Target)</span>
              <span className={budget.mtowMarginKg >= 0 ? 'text-[#00E87A] font-bold' : 'text-[#FF4D4D] font-bold'}>
                {budget.mtowMarginKg.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions Modal / Drawer */}
      {showAssumptionsModal && (
        <div className="mt-3 p-2 bg-[#0A0F1E] border border-[#00A8FF]/40 rounded text-[9px] font-mono-data space-y-1">
          <div className="text-[#00A8FF] font-bold uppercase border-b border-[#1A2740] pb-1 flex justify-between items-center">
            <span>ENGINEERING MASS ESTIMATION ASSUMPTIONS</span>
            <button
              onClick={() => setShowAssumptionsModal(false)}
              className="text-[#8A9BBE] hover:text-white"
            >
              ✕
            </button>
          </div>
          {Object.entries(budget.assumptions).map(([key, desc]) => (
            <div key={key} className="flex justify-between text-[#8A9BBE]">
              <span className="text-[#E8EDF7] font-semibold">{key}:</span>
              <span className="text-[#8A9BBE] text-right">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </CornerReticle>
    </div>
  );
};

import React from 'react';
import { X, Check, ArrowRight, Shield, Zap, Scale, Compass } from 'lucide-react';
import { AircraftSpecs } from '../../data/platformsData';
import { AircraftSilhouette } from '../common/AircraftSilhouette';

interface PlatformCompareModalProps {
  aircraft1: AircraftSpecs;
  aircraft2: AircraftSpecs;
  onClose: () => void;
  onSelectAircraft: (aircraft: AircraftSpecs) => void;
}

export const PlatformCompareModal: React.FC<PlatformCompareModalProps> = ({
  aircraft1,
  aircraft2,
  onClose,
  onSelectAircraft,
}) => {
  const compareMetric = (val1: number, val2: number, higherIsBetter = true) => {
    if (val1 === val2) return { col1: 'text-[#E8EDF7]', col2: 'text-[#E8EDF7]' };
    if (higherIsBetter) {
      return val1 > val2
        ? { col1: 'text-[#00E87A] font-bold', col2: 'text-[#FFB800]' }
        : { col1: 'text-[#FFB800]', col2: 'text-[#00E87A] font-bold' };
    } else {
      return val1 < val2
        ? { col1: 'text-[#00E87A] font-bold', col2: 'text-[#FFB800]' }
        : { col1: 'text-[#FFB800]', col2: 'text-[#00E87A] font-bold' };
    }
  };

  const mtowComp = compareMetric(aircraft1.weight.mtowKg, aircraft2.weight.mtowKg, false);
  const payloadComp = compareMetric(aircraft1.payload.maxPayloadKg, aircraft2.payload.maxPayloadKg, true);
  const speedComp = compareMetric(aircraft1.cruise.cruiseSpeedKmh, aircraft2.cruise.cruiseSpeedKmh, true);
  const rangeComp = compareMetric(aircraft1.range.maxRangeKm, aircraft2.range.maxRangeKm, true);
  const loiterComp = compareMetric(aircraft1.range.loiterTimeHr, aircraft2.range.loiterTimeHr, true);
  const ceilingComp = compareMetric(aircraft1.altitude.serviceCeilingM, aircraft2.altitude.serviceCeilingM, true);
  const sfcComp = compareMetric(aircraft1.powerplant.specificFuelConsumptionKgKwh, aircraft2.powerplant.specificFuelConsumptionKgKwh, false);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0D1527] border border-[#1F2D45] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#0A0F1E] border-b border-[#1F2D45] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#00A8FF]" />
            <div>
              <h2 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider">
                AEROSPACE PLATFORM COMPARISON MATRIX
              </h2>
              <p className="text-[10px] font-mono-data text-[#8A9BBE]">
                SIDE-BY-SIDE TECHNICAL METRIC EVALUATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Header */}
        <div className="p-4 grid grid-cols-12 gap-4 border-b border-[#1F2D45] bg-[#111A2E] text-center">
          <div className="col-span-4 text-left font-mono-data text-xs text-[#8A9BBE] uppercase font-bold flex items-center">
            SPECIFICATION METRIC
          </div>

          {/* Aircraft 1 Column Header */}
          <div className="col-span-4 bg-[#17243B] p-3 rounded border border-[#00A8FF]/30 flex flex-col items-center justify-between">
            <AircraftSilhouette type={aircraft1.category} className="w-12 h-6 text-[#00A8FF]" />
            <h3 className="text-xs font-bold text-[#E8EDF7] font-sans-ui mt-1">{aircraft1.name}</h3>
            <span className="text-[9px] font-mono-data text-[#00A8FF]">{aircraft1.codeName}</span>
            <button
              onClick={() => {
                onSelectAircraft(aircraft1);
                onClose();
              }}
              className="mt-2 text-[10px] bg-[#00A8FF] hover:bg-[#0088CC] text-white px-3 py-1 rounded font-sans-ui font-semibold uppercase tracking-wider transition-all"
            >
              LOAD THIS CONFIGURATION
            </button>
          </div>

          {/* Aircraft 2 Column Header */}
          <div className="col-span-4 bg-[#17243B] p-3 rounded border border-[#00E87A]/30 flex flex-col items-center justify-between">
            <AircraftSilhouette type={aircraft2.category} className="w-12 h-6 text-[#00E87A]" />
            <h3 className="text-xs font-bold text-[#E8EDF7] font-sans-ui mt-1">{aircraft2.name}</h3>
            <span className="text-[9px] font-mono-data text-[#00E87A]">{aircraft2.codeName}</span>
            <button
              onClick={() => {
                onSelectAircraft(aircraft2);
                onClose();
              }}
              className="mt-2 text-[10px] bg-[#00E87A] hover:bg-[#00C263] text-black px-3 py-1 rounded font-sans-ui font-semibold uppercase tracking-wider transition-all"
            >
              LOAD THIS CONFIGURATION
            </button>
          </div>
        </div>

        {/* Matrix Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs font-sans-ui">
          {/* Section 1: Weight & Mass Properties */}
          <div>
            <div className="text-[11px] font-bold font-mono-data text-[#00A8FF] uppercase tracking-wider mb-2 border-b border-[#1F2D45] pb-1">
              WEIGHT & MASS PROPERTIES
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Max Takeoff Weight (MTOW)</div>
                <div className={`col-span-4 text-center font-mono-data ${mtowComp.col1}`}>{aircraft1.weight.mtowKg} kg</div>
                <div className={`col-span-4 text-center font-mono-data ${mtowComp.col2}`}>{aircraft2.weight.mtowKg} kg</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Empty Weight</div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">{aircraft1.weight.emptyWeightKg} kg</div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">{aircraft2.weight.emptyWeightKg} kg</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Fuel Capacity / Battery Weight</div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  {aircraft1.weight.maxFuelKg} kg Fuel / {aircraft1.weight.batteryPackKg} kg Bat
                </div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  {aircraft2.weight.maxFuelKg} kg Fuel / {aircraft2.weight.batteryPackKg} kg Bat
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Payload Capabilities */}
          <div>
            <div className="text-[11px] font-bold font-mono-data text-[#00A8FF] uppercase tracking-wider mb-2 border-b border-[#1F2D45] pb-1">
              PAYLOAD & SENSORS
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Max Payload Capacity</div>
                <div className={`col-span-4 text-center font-mono-data ${payloadComp.col1}`}>{aircraft1.payload.maxPayloadKg} kg</div>
                <div className={`col-span-4 text-center font-mono-data ${payloadComp.col2}`}>{aircraft2.payload.maxPayloadKg} kg</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Standard Sensor Suite</div>
                <div className="col-span-4 text-center text-[#E8EDF7] text-[10px]">{aircraft1.payload.standardPayload}</div>
                <div className="col-span-4 text-center text-[#E8EDF7] text-[10px]">{aircraft2.payload.standardPayload}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Performance & Speeds */}
          <div>
            <div className="text-[11px] font-bold font-mono-data text-[#00A8FF] uppercase tracking-wider mb-2 border-b border-[#1F2D45] pb-1">
              SPEED, RANGE & ENDURANCE
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Cruise Speed</div>
                <div className={`col-span-4 text-center font-mono-data ${speedComp.col1}`}>{aircraft1.cruise.cruiseSpeedKmh} km/h</div>
                <div className={`col-span-4 text-center font-mono-data ${speedComp.col2}`}>{aircraft2.cruise.cruiseSpeedKmh} km/h</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Max Range</div>
                <div className={`col-span-4 text-center font-mono-data ${rangeComp.col1}`}>{aircraft1.range.maxRangeKm} km</div>
                <div className={`col-span-4 text-center font-mono-data ${rangeComp.col2}`}>{aircraft2.range.maxRangeKm} km</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Loiter Time (Endurance)</div>
                <div className={`col-span-4 text-center font-mono-data ${loiterComp.col1}`}>{aircraft1.range.loiterTimeHr} hr</div>
                <div className={`col-span-4 text-center font-mono-data ${loiterComp.col2}`}>{aircraft2.range.loiterTimeHr} hr</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Service Ceiling</div>
                <div className={`col-span-4 text-center font-mono-data ${ceilingComp.col1}`}>{aircraft1.altitude.serviceCeilingM} m</div>
                <div className={`col-span-4 text-center font-mono-data ${ceilingComp.col2}`}>{aircraft2.altitude.serviceCeilingM} m</div>
              </div>
            </div>
          </div>

          {/* Section 4: Powerplant Architecture */}
          <div>
            <div className="text-[11px] font-bold font-mono-data text-[#00A8FF] uppercase tracking-wider mb-2 border-b border-[#1F2D45] pb-1">
              POWERPLANT & HYBRID PROPULSION
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Propulsion Type</div>
                <div className="col-span-4 text-center text-[#E8EDF7] font-mono-data text-[10px]">{aircraft1.powerplant.type}</div>
                <div className="col-span-4 text-center text-[#E8EDF7] font-mono-data text-[10px]">{aircraft2.powerplant.type}</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Hybrid Topology</div>
                <div className="col-span-4 text-center text-[#00A8FF] font-mono-data font-semibold">{aircraft1.powerplant.hybridArchitecture}</div>
                <div className="col-span-4 text-center text-[#00E87A] font-mono-data font-semibold">{aircraft2.powerplant.hybridArchitecture}</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Specific Fuel Consumption (SFC)</div>
                <div className={`col-span-4 text-center font-mono-data ${sfcComp.col1}`}>{aircraft1.powerplant.specificFuelConsumptionKgKwh} kg/kWh</div>
                <div className={`col-span-4 text-center font-mono-data ${sfcComp.col2}`}>{aircraft2.powerplant.specificFuelConsumptionKgKwh} kg/kWh</div>
              </div>
            </div>
          </div>

          {/* Section 5: Aerodynamics */}
          <div>
            <div className="text-[11px] font-bold font-mono-data text-[#00A8FF] uppercase tracking-wider mb-2 border-b border-[#1F2D45] pb-1">
              AERODYNAMIC CONFIGURATION
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Wingspan / Wing Area</div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  {aircraft1.configuration.wingspanM} m / {aircraft1.configuration.wingAreaM2} m²
                </div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  {aircraft2.configuration.wingspanM} m / {aircraft2.configuration.wingAreaM2} m²
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-1 border-b border-[#1A2740]/60">
                <div className="col-span-4 text-[#8A9BBE]">Aspect Ratio / CD0</div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  AR: {aircraft1.configuration.aspectRatio} / CD0: {aircraft1.configuration.parasiteDragCd0}
                </div>
                <div className="col-span-4 text-center font-mono-data text-[#E8EDF7]">
                  AR: {aircraft2.configuration.aspectRatio} / CD0: {aircraft2.configuration.parasiteDragCd0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0A0F1E] border-t border-[#1F2D45] flex items-center justify-between text-[10px] font-mono-data text-[#8A9BBE]">
          <span>* GREEN INDICATES HIGHER OPERATIONAL ADVANTAGE</span>
          <button
            onClick={onClose}
            className="bg-[#172236] hover:bg-[#1F2D45] text-[#E8EDF7] px-4 py-1.5 rounded font-sans-ui font-medium uppercase"
          >
            CLOSE MATRIX
          </button>
        </div>
      </div>
    </div>
  );
};

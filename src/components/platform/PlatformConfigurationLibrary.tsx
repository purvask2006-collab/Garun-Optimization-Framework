import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  Layers, 
  Scale, 
  Zap, 
  Shield, 
  Sliders, 
  Check, 
  ArrowRight, 
  Compass, 
  Cpu, 
  Crosshair, 
  FileText,
  Activity,
  Maximize2
} from 'lucide-react';
import { PLATFORMS_DATA, AircraftSpecs } from '../../data/platformsData';
import { AircraftSilhouette } from '../common/AircraftSilhouette';
import { CornerReticle } from '../common/CornerReticle';
import { PlatformCompareModal } from './PlatformCompareModal';
import { useGarunStore } from '../../store/useGarunStore';

export const PlatformConfigurationLibrary: React.FC = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftSpecs>(PLATFORMS_DATA[0]);
  const [compareAircraft, setCompareAircraft] = useState<AircraftSpecs | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Global store update trigger
  const { setActiveModule } = useGarunStore();

  // Filtered platforms
  const filteredPlatforms = PLATFORMS_DATA.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.powerplant.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleApplyToSimulation = (ac: AircraftSpecs) => {
    setSelectedAircraft(ac);
    alert(`[HAL GARUN SUITE] Platform "${ac.name}" parameters successfully loaded into Active Digital Twin and Hybrid Propulsion Optimization Engine.`);
  };

  const handleOpenCompare = (ac: AircraftSpecs) => {
    if (ac.id === selectedAircraft.id) {
      // Pick second aircraft default
      const other = PLATFORMS_DATA.find((p) => p.id !== ac.id) || PLATFORMS_DATA[1];
      setCompareAircraft(other);
    } else {
      setCompareAircraft(ac);
    }
    setIsCompareModalOpen(true);
  };

  return (
    <div className="flex-1 bg-[#0A0F1E] p-3 text-[#E8EDF7] flex flex-col space-y-3 overflow-hidden select-none h-full">
      {/* Top Header Controls Bar */}
      <div className="bg-[#0F1729] border border-[#1F2D45] p-3 rounded flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#00A8FF]/10 border border-[#00A8FF]/40 text-[#00A8FF]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans-ui text-[#E8EDF7] uppercase tracking-wider flex items-center space-x-2">
              <span>PLATFORM CONFIGURATION LIBRARY</span>
              <span className="bg-[#172236] text-[#00A8FF] text-[10px] px-2 py-0.5 rounded border border-[#1F2D45] font-mono-data font-semibold">
                13 PLATFORMS LOADED
              </span>
            </h1>
            <p className="text-[10px] font-mono-data text-[#8A9BBE]">
              AEROSPACE VEHICLE SPECIFICATIONS, PROPULSION TOPOLOGIES & AERODYNAMIC METRICS
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-[#8A9BBE] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search platform, engine, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#172236] border border-[#1F2D45] rounded pl-8 pr-3 py-1.5 text-xs font-sans-ui text-[#E8EDF7] focus:outline-none focus:border-[#00A8FF] transition-colors placeholder-[#8A9BBE]/60"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#172236] border border-[#1F2D45] rounded px-3 py-1.5 text-xs font-sans-ui text-[#00A8FF] font-medium focus:outline-none focus:border-[#00A8FF] appearance-none pr-8 cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="uav_male">MALE UAV</option>
              <option value="ucav_stealth">STEALTH UCAV</option>
              <option value="helicopter">HELICOPTERS</option>
              <option value="demonstrator">ENGINE DEMONSTRATORS</option>
              <option value="transport">REGIONAL TRANSPORT</option>
              <option value="custom">CUSTOM AIRCRAFT</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A9BBE] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Compare Platforms Button */}
          <button
            onClick={() => {
              const second = PLATFORMS_DATA.find((p) => p.id !== selectedAircraft.id) || PLATFORMS_DATA[1];
              setCompareAircraft(second);
              setIsCompareModalOpen(true);
            }}
            className="bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-semibold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 shadow transition-all active:scale-[0.98]"
          >
            <Scale className="w-4 h-4" />
            <span>COMPARE PLATFORMS</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Left Sidebar List (Cards) + Right Metadata & Inspection Workspace */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column: Aircraft Selection List (Width 4/12) */}
        <div className="col-span-4 flex flex-col space-y-2 min-h-0 bg-[#0F1729] border border-[#1F2D45] rounded p-2 overflow-y-auto">
          <div className="flex items-center justify-between pb-1 border-b border-[#1A2740] text-[10px] font-mono-data text-[#8A9BBE] uppercase font-bold">
            <span>AIRCRAFT CATALOG ({filteredPlatforms.length})</span>
            <span>STATUS / CLASS</span>
          </div>

          <div className="space-y-1.5 pr-1">
            {filteredPlatforms.map((ac) => {
              const isSelected = selectedAircraft.id === ac.id;
              return (
                <div
                  key={ac.id}
                  onClick={() => setSelectedAircraft(ac)}
                  className={`p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-[#172742] border-[#00A8FF] shadow-md'
                      : 'bg-[#111A2E]/80 border-[#1A2740] hover:bg-[#18253D] hover:border-[#2D4A7A]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <AircraftSilhouette
                        type={ac.category}
                        className={`w-9 h-5 flex-shrink-0 ${
                          isSelected ? 'text-[#00A8FF]' : 'text-[#8A9BBE]'
                        }`}
                      />
                      <div>
                        <h3 className="text-xs font-bold font-sans-ui text-[#E8EDF7]">
                          {ac.name}
                        </h3>
                        <span className="text-[9.5px] font-mono-data text-[#00A8FF]">
                          {ac.codeName}
                        </span>
                      </div>
                    </div>
                    {ac.isDefault && (
                      <span className="bg-[#00E87A]/15 border border-[#00E87A]/40 text-[#00E87A] text-[9px] font-mono-data px-1.5 py-0.2 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-3 gap-1 text-[9px] font-mono-data bg-[#0A0F1E]/50 p-1.5 rounded border border-[#1A2740]/60">
                    <div>
                      <span className="text-[#8A9BBE] block uppercase">MTOW</span>
                      <span className="text-[#E8EDF7] font-semibold">{ac.weight.mtowKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[#8A9BBE] block uppercase">CRUISE</span>
                      <span className="text-[#00A8FF] font-semibold">{ac.cruise.cruiseSpeedKmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-[#8A9BBE] block uppercase">RANGE</span>
                      <span className="text-[#00E87A] font-semibold">{ac.range.maxRangeKm} km</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#1A2740]/40 text-[9.5px] font-sans-ui">
                    <span className="text-[#8A9BBE] truncate max-w-[180px]">{ac.status}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCompare(ac);
                      }}
                      className="text-[#00A8FF] hover:underline font-mono-data uppercase font-semibold flex items-center space-x-1"
                    >
                      <span>COMPARE</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Aircraft Workspace (Width 8/12) */}
        <div className="col-span-8 flex flex-col space-y-3 min-h-0 overflow-y-auto pr-1">
          {/* Card Header Banner */}
          <CornerReticle className="bg-[#0F1729] p-4 flex items-center justify-between border border-[#1F2D45]">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-10 bg-[#17243B] rounded border border-[#00A8FF]/40 flex items-center justify-center p-1">
                <AircraftSilhouette type={selectedAircraft.category} className="w-12 h-7 text-[#00A8FF]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold font-sans-ui text-[#E8EDF7]">
                    {selectedAircraft.name}
                  </h2>
                  <span className="bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/40 text-[10px] font-mono-data px-2 py-0.5 rounded font-bold uppercase">
                    {selectedAircraft.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs font-mono-data text-[#8A9BBE] mt-0.5">
                  {selectedAircraft.codeName} // {selectedAircraft.status}
                </p>
              </div>
            </div>

            {/* Action Button: Load into Active Digital Twin */}
            <button
              onClick={() => handleApplyToSimulation(selectedAircraft)}
              className="bg-[#00E87A] hover:bg-[#00C263] text-black font-sans-ui font-bold text-xs uppercase px-4 py-2 rounded shadow-md flex items-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>LOAD INTO ACTIVE SIMULATION</span>
            </button>
          </CornerReticle>

          {/* Aircraft Description Banner */}
          <div className="bg-[#111A2E] border border-[#1F2D45] p-3 rounded text-xs font-sans-ui text-[#C5D2E8]">
            <span className="text-[#00A8FF] font-bold font-mono-data uppercase mr-2">
              PROGRAM BRIEFING:
            </span>
            {selectedAircraft.description}
          </div>

          {/* 4-Grid Specification Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {/* Box 1: Mass & Weight Specs */}
            <CornerReticle className="bg-[#0F1729] p-3 text-xs font-sans-ui flex flex-col justify-between">
              <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 mb-2">
                <Scale className="w-4 h-4 text-[#00A8FF]" />
                <h3 className="font-bold text-[#8A9BBE] uppercase tracking-wider text-[11px]">
                  WEIGHT & MASS PROPERTIES
                </h3>
              </div>
              <div className="space-y-1.5 font-mono-data text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Max Takeoff Weight (MTOW)</span>
                  <span className="font-bold text-[#E8EDF7]">{selectedAircraft.weight.mtowKg} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Empty Weight</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.weight.emptyWeightKg} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Fuel Capacity</span>
                  <span className="text-[#FF6B35] font-semibold">{selectedAircraft.weight.maxFuelKg} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Battery Pack Mass</span>
                  <span className="text-[#00E87A] font-semibold">{selectedAircraft.weight.batteryPackKg} kg</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9BBE]">Useful Payload & Fuel Margin</span>
                  <span className="text-[#00A8FF] font-bold">{selectedAircraft.weight.usefulLoadKg} kg</span>
                </div>
              </div>
            </CornerReticle>

            {/* Box 2: Flight Performance & Speeds */}
            <CornerReticle className="bg-[#0F1729] p-3 text-xs font-sans-ui flex flex-col justify-between">
              <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 mb-2">
                <Activity className="w-4 h-4 text-[#00E87A]" />
                <h3 className="font-bold text-[#8A9BBE] uppercase tracking-wider text-[11px]">
                  FLIGHT PERFORMANCE & ALTITUDE
                </h3>
              </div>
              <div className="space-y-1.5 font-mono-data text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Cruise Speed</span>
                  <span className="font-bold text-[#00A8FF]">{selectedAircraft.cruise.cruiseSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Max Dash Speed</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.cruise.maxSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Max Range / Ferry</span>
                  <span className="text-[#00E87A] font-semibold">{selectedAircraft.range.maxRangeKm} km / {selectedAircraft.range.ferryRangeKm} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Loiter Endurance</span>
                  <span className="text-[#FFB800] font-bold">{selectedAircraft.range.loiterTimeHr} hr</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9BBE]">Service Ceiling / Cruise Alt</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.altitude.serviceCeilingM} m / {selectedAircraft.altitude.cruiseAltitudeM} m</span>
                </div>
              </div>
            </CornerReticle>

            {/* Box 3: Powerplant & Hybrid Architecture */}
            <CornerReticle className="bg-[#0F1729] p-3 text-xs font-sans-ui flex flex-col justify-between">
              <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 mb-2">
                <Zap className="w-4 h-4 text-[#FFB800]" />
                <h3 className="font-bold text-[#8A9BBE] uppercase tracking-wider text-[11px]">
                  PROPULSION & POWERPLANT
                </h3>
              </div>
              <div className="space-y-1.5 font-mono-data text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Hybrid Topology</span>
                  <span className="font-bold text-[#00E87A]">{selectedAircraft.powerplant.hybridArchitecture}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Primary Power Rating</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.powerplant.engineRatingKw} kW Gas / {selectedAircraft.powerplant.motorRatingKw} kW Motor</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Generator Power Rating</span>
                  <span className="text-[#00A8FF]">{selectedAircraft.powerplant.generatorRatingKw} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Battery Energy / Chem</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.powerplant.batteryCapacityKwh} kWh ({selectedAircraft.powerplant.batteryChemistry})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9BBE]">Specific Fuel Consumption (SFC)</span>
                  <span className="text-[#00E87A] font-bold">{selectedAircraft.powerplant.specificFuelConsumptionKgKwh} kg/kWh</span>
                </div>
              </div>
            </CornerReticle>

            {/* Box 4: Aerodynamics & Configuration */}
            <CornerReticle className="bg-[#0F1729] p-3 text-xs font-sans-ui flex flex-col justify-between">
              <div className="flex items-center space-x-2 border-b border-[#1A2740] pb-2 mb-2">
                <Compass className="w-4 h-4 text-[#B47FFF]" />
                <h3 className="font-bold text-[#8A9BBE] uppercase tracking-wider text-[11px]">
                  AERODYNAMIC GEOMETRY
                </h3>
              </div>
              <div className="space-y-1.5 font-mono-data text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Wingspan</span>
                  <span className="font-bold text-[#E8EDF7]">{selectedAircraft.configuration.wingspanM} m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Reference Wing Area</span>
                  <span className="text-[#E8EDF7]">{selectedAircraft.configuration.wingAreaM2} m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Aspect Ratio (AR)</span>
                  <span className="text-[#00A8FF] font-semibold">{selectedAircraft.configuration.aspectRatio}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A2740]/60">
                  <span className="text-[#8A9BBE]">Parasite Drag Coeff (CD0)</span>
                  <span className="text-[#00E87A] font-semibold">{selectedAircraft.configuration.parasiteDragCd0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9BBE]">Airfoil Profile</span>
                  <span className="text-[#E8EDF7] text-[10px] truncate max-w-[150px]">{selectedAircraft.configuration.airfoilType}</span>
                </div>
              </div>
            </CornerReticle>
          </div>

          {/* Payload & Sensor Suite Detail Panel */}
          <CornerReticle className="bg-[#0F1729] p-3 text-xs font-sans-ui border border-[#1F2D45]">
            <div className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-[#FF6B35]" />
                <h3 className="font-bold text-[#8A9BBE] uppercase tracking-wider text-[11px]">
                  PAYLOAD & AVIONICS ARCHITECTURE
                </h3>
              </div>
              <span className="text-[10px] font-mono-data text-[#00E87A]">
                MAX PAYLOAD: {selectedAircraft.payload.maxPayloadKg} KG
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-sans-ui">
              <div>
                <span className="text-[#8A9BBE] uppercase text-[10px] block mb-1 font-bold">STANDARD SENSOR SUITE</span>
                <div className="bg-[#172236] p-2 rounded border border-[#1A2740] text-[#E8EDF7] font-mono-data text-[11px]">
                  {selectedAircraft.payload.standardPayload}
                </div>
              </div>

              <div>
                <span className="text-[#8A9BBE] uppercase text-[10px] block mb-1 font-bold">INTEGRATED AVIONICS & SENSORS</span>
                <ul className="space-y-1">
                  {selectedAircraft.payload.sensorsAndAvionics.map((sensor, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-[10.5px] text-[#C5D2E8]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A8FF]" />
                      <span>{sensor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CornerReticle>
        </div>
      </div>

      {/* Comparison Side-by-Side Modal */}
      {isCompareModalOpen && compareAircraft && (
        <PlatformCompareModal
          aircraft1={selectedAircraft}
          aircraft2={compareAircraft}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectAircraft={(ac) => {
            setSelectedAircraft(ac);
            setIsCompareModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

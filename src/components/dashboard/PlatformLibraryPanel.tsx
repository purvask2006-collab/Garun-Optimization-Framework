import React, { useState } from 'react';
import { ChevronDown, Layers, ExternalLink } from 'lucide-react';
import { CornerReticle } from '../common/CornerReticle';
import { AircraftSilhouette } from '../common/AircraftSilhouette';
import { useGarunStore } from '../../store/useGarunStore';
import { PLATFORMS_DATA } from '../../data/platformsData';

export const PlatformLibraryPanel: React.FC = () => {
  const { setActiveModule } = useGarunStore();
  const [selectedId, setSelectedId] = useState(PLATFORMS_DATA[0].id);

  return (
    <CornerReticle className="h-full flex flex-col justify-between bg-[#0F1729] p-3 text-[#E8EDF7]">
      {/* Panel Header */}
      <div>
        <div 
          onClick={() => setActiveModule('platform-library')}
          className="flex items-center justify-between border-b border-[#1A2740] pb-2 mb-2 cursor-pointer group"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-3.5 h-3.5 text-[#00A8FF]" />
            <h2 className="text-[11px] font-bold font-sans-ui text-[#8A9BBE] group-hover:text-[#00A8FF] uppercase tracking-wider transition-colors">
              PLATFORM LIBRARY
            </h2>
          </div>
          <ExternalLink className="w-3 h-3 text-[#8A9BBE] group-hover:text-[#00A8FF]" />
        </div>

        {/* Selected Aircraft Header */}
        <button
          onClick={() => setActiveModule('platform-library')}
          className="w-full bg-[#172236] border border-[#1A2740] rounded px-2.5 py-1.5 flex items-center justify-between text-xs font-sans-ui text-[#E8EDF7] hover:border-[#00A8FF] transition-colors mb-2"
        >
          <span className="font-medium truncate text-[#00A8FF]">
            {PLATFORMS_DATA.find(p => p.id === selectedId)?.name || 'Competition UAV (Default)'}
          </span>
          <ChevronDown className="w-4 h-4 text-[#8A9BBE]" />
        </button>

        {/* Platform List */}
        <div className="space-y-1 max-h-[290px] overflow-y-auto pr-1">
          {PLATFORMS_DATA.map((platform) => {
            const isSelected = selectedId === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedId(platform.id)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#00A8FF] text-white font-semibold shadow-sm'
                    : 'bg-[#111827]/60 hover:bg-[#1F2E47] text-[#8A9BBE] hover:text-[#E8EDF7]'
                }`}
              >
                <AircraftSilhouette 
                  type={platform.category} 
                  className={`w-8 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#8A9BBE]'}`} 
                />
                <span className="text-[11px] font-sans-ui truncate">{platform.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compare Platforms Action Button */}
      <div className="pt-2 border-t border-[#1A2740] mt-2">
        <button 
          onClick={() => setActiveModule('platform-library')}
          className="w-full bg-[#00A8FF] hover:bg-[#0088CC] text-white font-sans-ui font-semibold text-[11px] uppercase tracking-wider py-2 rounded shadow-md transition-all active:scale-[0.98]"
        >
          COMPARE PLATFORMS
        </button>
      </div>
    </CornerReticle>
  );
};

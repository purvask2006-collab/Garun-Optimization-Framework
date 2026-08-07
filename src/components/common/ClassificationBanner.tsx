import React from 'react';

interface ClassificationBannerProps {
  level?: string;
}

export const ClassificationBanner: React.FC<ClassificationBannerProps> = ({ level = 'LEVEL-2 CONFIDENTIAL' }) => {
  return (
    <div className="bg-[#172236] border-b border-[#1A2740] py-0.5 px-3 flex items-center justify-between text-[8.5px] font-mono-data text-[#8A9BBE] select-none flex-shrink-0">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-[#00E87A] animate-ping" />
        <span className="font-bold text-[#00E87A]">HAL AEROSPACE DEFENSE NETWORK</span>
        <span>•</span>
        <span>SECURE NODE #882-IN</span>
      </div>
      <div className="bg-[#FF3B30]/20 border border-[#FF3B30]/60 text-[#FF3B30] px-2 py-0.2 rounded font-bold uppercase tracking-wider">
        {level}
      </div>
      <div className="text-[8px]">
        RESTRICTED DEFENSE ACCESS • HINDUSTAN AERONAUTICS LIMITED
      </div>
    </div>
  );
};

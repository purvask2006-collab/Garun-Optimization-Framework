import React from 'react';

interface StatusBadgeProps {
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'STANDBY' | 'ONLINE' | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  let colorClasses = 'bg-[#00E87A]/15 text-[#00E87A] border-[#00E87A]/40';
  if (status === 'WARNING') colorClasses = 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40';
  if (status === 'CRITICAL') colorClasses = 'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/40';
  if (status === 'STANDBY') colorClasses = 'bg-[#8A9BBE]/15 text-[#8A9BBE] border-[#8A9BBE]/40';

  return (
    <span 
      aria-live="polite"
      aria-label={`Status: ${label || status}`}
      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[8.5px] font-mono-data font-bold uppercase ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{label || status}</span>
    </span>
  );
};

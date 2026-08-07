import React from 'react';

interface CornerReticleProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export const CornerReticle: React.FC<CornerReticleProps> = ({ children, className = '', id, onClick }) => {
  return (
    <div id={id} onClick={onClick} className={`relative border border-[#1A2740] bg-[#0F1729] rounded ${className}`}>
      {/* Corner Accent reticles */}
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00A8FF] pointer-events-none" />
      <div className="absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2 border-[#00A8FF] pointer-events-none" />
      <div className="absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2 border-[#00A8FF] pointer-events-none" />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00A8FF] pointer-events-none" />
      {children}
    </div>
  );
};

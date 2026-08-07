import React from 'react';

// Aircraft Silhouette SVG Icons for Platform Configuration Library
export const AircraftSilhouette: React.FC<{ type: string; className?: string }> = ({ type, className = "w-10 h-6 fill-current text-white/80" }) => {
  switch (type) {
    case 'uav_male':
    case 'competition_uav':
    case 'garun_uav':
      return (
        <svg viewBox="0 0 100 40" className={className}>
          {/* MALE UAV side silhouette */}
          <path d="M 5 20 C 15 17, 30 15, 50 15 C 70 15, 85 18, 95 20 C 85 22, 70 24, 50 24 C 30 24, 15 22, 5 20 Z" />
          <path d="M 45 15 L 52 2 L 58 2 L 53 15 Z" />
          <path d="M 45 24 L 52 38 L 58 38 L 53 24 Z" />
          <path d="M 85 20 L 92 10 L 95 10 L 91 20 Z" />
        </svg>
      );
    case 'ucav_stealth':
    case 'cats_warrior':
    case 'cats_hunter':
      return (
        <svg viewBox="0 0 100 40" className={className}>
          {/* Stealth Flying Wing / UCAV */}
          <path d="M 90 20 L 40 5 L 10 15 L 25 20 L 10 25 L 40 35 Z" />
        </svg>
      );
    case 'vtol_cargo':
    case 'archer_ng':
      return (
        <svg viewBox="0 0 100 40" className={className}>
          {/* VTOL / Quad-rotor UAV */}
          <path d="M 15 20 L 85 20 C 85 17, 65 16, 50 16 C 35 16, 15 17, 15 20 Z" />
          <circle cx="25" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="75" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="25" y1="20" x2="25" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="75" y1="20" x2="75" y2="12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'helicopter':
    case 'luh':
    case 'imrh':
      return (
        <svg viewBox="0 0 100 40" className={className}>
          {/* Rotary Wing / Helicopter */}
          <ellipse cx="45" cy="22" rx="25" ry="10" />
          <line x1="10" y1="8" x2="80" y2="8" stroke="currentColor" strokeWidth="3" />
          <line x1="45" y1="8" x2="45" y2="14" stroke="currentColor" strokeWidth="2" />
          <path d="M 70 22 L 95 18 L 95 24 Z" />
          <line x1="92" y1="12" x2="92" y2="28" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 40" className={className}>
          <path d="M 10 20 L 40 10 L 80 18 L 90 20 L 80 22 L 40 30 Z" />
          <path d="M 45 10 L 55 2 L 60 2 L 52 10 Z" />
        </svg>
      );
  }
};

import React from 'react';
import { ClassificationBanner } from './components/common/ClassificationBanner';
import { TopNav } from './components/layout/TopNav';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CommandPalette } from './components/ui/CommandPalette';
import { TelemetryAlertsDrawer } from './components/ui/TelemetryAlertsDrawer';

export function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0F1E] text-[#E8EDF7] overflow-hidden font-sans-ui">
      {/* Classification Banner */}
      <ClassificationBanner level="LEVEL-2 CONFIDENTIAL" />

      {/* Top Header Navigation */}
      <TopNav />

      {/* Main Dashboard Screen View */}
      <DashboardLayout />

      {/* Bottom Footer Navigation */}
      <BottomNav />

      {/* Global Cmd+K Command Palette Modal */}
      <CommandPalette />

      {/* Telemetry Alerts & Logs Slide-Over Drawer */}
      <TelemetryAlertsDrawer />
    </div>
  );
}

export default App;

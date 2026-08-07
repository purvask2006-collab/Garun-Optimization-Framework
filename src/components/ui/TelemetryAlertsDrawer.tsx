import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Bell, 
  ShieldAlert, 
  Activity,
  Cpu,
  Zap,
  Clock
} from 'lucide-react';
import { useGarunStore } from '../../store/useGarunStore';

export const TelemetryAlertsDrawer: React.FC = () => {
  const { 
    isTelemetryDrawerOpen, 
    setTelemetryDrawerOpen, 
    activeTelemetryFrame,
    systemMetrics 
  } = useGarunStore();

  if (!isTelemetryDrawerOpen) return null;

  const alerts = [
    {
      id: 'alt-01',
      title: 'High Altitude Peukert Battery Efficiency',
      description: 'Cell temperature at 38.2°C under 3000m cruise. Peukert derating factor active at 1.05.',
      severity: 'NOMINAL',
      time: '14:32:05 UTC',
      category: 'BATTERY'
    },
    {
      id: 'alt-02',
      title: 'CS-23 Single Engine Out Reserve Guard',
      description: '78.4% battery SOC maintains 45 min loiter compliance for Class I / III UAV certification.',
      severity: 'INFO',
      time: '14:30:12 UTC',
      category: 'COMPLIANCE'
    },
    {
      id: 'alt-03',
      title: 'Turboshaft SFC Optimization Active',
      description: 'SFC currently operating at 450 g/kWh target on 63.2 kW cruise power demand.',
      severity: 'NOMINAL',
      time: '14:28:44 UTC',
      category: 'PROPULSION'
    },
    {
      id: 'alt-04',
      title: 'HIL Latency Calibration',
      description: `Hardware-in-loop interface operating at ${systemMetrics.hilLatencyMs} ms roundtrip latency.`,
      severity: 'INFO',
      time: '14:25:00 UTC',
      category: 'HIL'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end font-mono-data text-xs transition-all">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Telemetry Alerts & System Notifications"
        className="w-full max-w-md bg-[#0F1729] border-l border-[#1F2D45] h-full shadow-2xl flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-3 bg-[#111A2E] border-b border-[#1F2D45] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#E8EDF7] font-sans-ui text-sm uppercase">TELEMETRY ALERTS & LOGS</h2>
              <p className="text-[10px] text-[#8A9BBE]">REAL-TIME SYSTEM NOTIFICATIONS // HAL AERDC</p>
            </div>
          </div>
          <button 
            onClick={() => setTelemetryDrawerOpen(false)}
            className="p-1 rounded bg-[#172236] hover:bg-[#1F2D45] text-[#8A9BBE] hover:text-white transition-colors"
            aria-label="Close alerts panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Summary Cards */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#1F2D45] bg-[#0A0F1E]/50">
          <div className="bg-[#111A2E] p-2 rounded border border-[#1F2D45]">
            <span className="text-[9px] text-[#8A9BBE] block uppercase">SYSTEM HEALTH</span>
            <span className="text-[#00E87A] font-bold text-sm flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>NOMINAL</span>
            </span>
          </div>
          <div className="bg-[#111A2E] p-2 rounded border border-[#1F2D45]">
            <span className="text-[9px] text-[#8A9BBE] block uppercase">HIL LATENCY</span>
            <span className="text-[#00A8FF] font-bold text-sm flex items-center space-x-1 mt-0.5">
              <Activity className="w-3.5 h-3.5" />
              <span>{systemMetrics.hilLatencyMs} ms</span>
            </span>
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className="bg-[#111A2E] border border-[#1F2D45] hover:border-[#00A8FF]/40 p-2.5 rounded transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#172236] text-[#00A8FF] border border-[#00A8FF]/30 font-semibold uppercase">
                  {alert.category}
                </span>
                <span className="text-[9px] text-[#8A9BBE] flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{alert.time}</span>
                </span>
              </div>
              <h3 className="font-bold text-white text-[11px] flex items-center space-x-1.5">
                {alert.severity === 'NOMINAL' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00E87A] shrink-0" />}
                {alert.severity === 'INFO' && <Info className="w-3.5 h-3.5 text-[#00A8FF] shrink-0" />}
                {alert.severity === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />}
                <span>{alert.title}</span>
              </h3>
              <p className="text-[10px] text-[#8A9BBE] leading-relaxed">
                {alert.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#111A2E] border-t border-[#1F2D45] flex items-center justify-between">
          <span className="text-[9.5px] text-[#8A9BBE]">4 Active Log Entries</span>
          <button 
            onClick={() => setTelemetryDrawerOpen(false)}
            className="px-3 py-1 bg-[#00A8FF] text-[#0A0F1E] font-bold rounded text-[10px] hover:bg-[#33B8FF] transition-colors"
          >
            DISMISS ALL
          </button>
        </div>
      </div>
    </div>
  );
};

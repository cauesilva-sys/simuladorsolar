import React from 'react';
import { Sun, Zap, AlertTriangle, CheckCircle2, Download, HelpCircle, RefreshCw, LayoutDashboard, GitFork } from 'lucide-react';
import { SystemMetrics, ElectricalProtectionState, ActiveTab } from '../types';

interface HeaderProps {
  metrics: SystemMetrics;
  protection: ElectricalProtectionState;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onResetToDefaults: () => void;
  onOpenSpecs: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  protection,
  activeTab,
  onSelectTab,
  onResetToDefaults,
  onOpenSpecs,
  onOpenExportModal,
}) => {
  const isAlarm = metrics.tracker1.isStuck || !protection.breakerMTClosed || !protection.recloserClosed || protection.relay50_51Tripped;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/15">
              <Sun className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Simulador de Usina Fotovoltaica MT
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-900 border border-amber-300">
                  55 kWp · 13.8 kV
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100 Módulos 550W · 2 Trackers Eixo Único · 2 Inversores 30kW · Cabine MT 50/51
              </p>
            </div>
          </div>

          {/* Plant Operational Status & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Indicator Badge */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                isAlarm
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              {isAlarm ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>
                    {metrics.tracker1.isStuck ? 'Tracker 1 Travado' : 'Aviso: Proteção Atuada'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Operação Normal</span>
                </>
              )}
            </div>

            {/* Power quick badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-600">Injeção MT:</span>
              <span className="text-slate-900 font-bold">
                {metrics.totalMtPowerKw.toFixed(1)} kW
              </span>
            </div>

            {/* Quick buttons */}
            <button
              onClick={onResetToDefaults}
              title="Restaurar parâmetros padrão da usina"
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-medium transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetar</span>
            </button>

            <button
              onClick={onOpenSpecs}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-medium transition flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Memorial</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar HTML</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Aba 1 & Aba 2) */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Aba 1: Dashboard e Geração</span>
          </button>

          <button
            onClick={() => onSelectTab('unifilar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'unifilar'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Aba 2: Diagrama Unifilar Interativo (SLD)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              activeTab === 'unifilar' ? 'bg-slate-950/20 text-slate-950' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              Chaves NA / NF
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Zap, Activity, TrendingDown, Layers } from 'lucide-react';
import { SystemMetrics } from '../types';

interface KpiCardsProps {
  metrics: SystemMetrics;
  onOpenStringModal?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics, onOpenStringModal }) => {
  const {
    solar,
    tracker1,
    tracker2,
    inverter1,
    inverter2,
    totalMtPowerKw,
    totalMtPowerKva,
    currentMtAmperes,
    idealMtPowerKw,
    misalignmentLossKw,
    misalignmentLossPercent,
    dailyIdealEnergyKwh,
    dailyRealEnergyKwh,
    dailyLossKwh,
  } = metrics;

  const inv1ActiveStrings = inverter1.activeStrings ?? 10;
  const inv1Disconnected = inverter1.disconnectedStrings ?? 0;
  const inv2ActiveStrings = inverter2.activeStrings ?? 10;
  const inv2Disconnected = inverter2.disconnectedStrings ?? 0;

  return (
    <div className="space-y-3">
      {/* 4 Main Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inversor 1 (Laranja / Amarelo) */}
        <div className="bg-white border border-amber-300 rounded-xl p-4 shadow-xs text-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
                Geração Inversor 1
              </span>
              <button
                type="button"
                onClick={onOpenStringModal}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border transition flex items-center gap-1 ${
                  inv1Disconnected > 0
                    ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
                title="Clique para gerenciar desligamento de strings"
              >
                <Layers className="w-3 h-3" />
                <span>{inv1ActiveStrings}/10 Strings</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-600">
                {inverter1.acPowerKw.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-500">kW CA</span>
              {inv1Disconnected > 0 && (
                <span className="text-xs font-bold text-rose-600 font-mono ml-auto">
                  -{inverter1.stringLossPercent?.toFixed(0)}% CC
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-600">
              CC: <span className="text-amber-700 font-mono font-bold">{inverter1.dcPowerKw.toFixed(1)} kW</span>
            </div>
            <div className="text-slate-600">
              POA: <span className="text-amber-800 font-mono font-bold">{Math.round(tracker1.poaIrradiance)} W/m²</span>
            </div>
            <div className="text-slate-600">
              η: <span className="text-emerald-700 font-mono font-bold">{inverter1.efficiencyPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Inversor 2 (Azul / Ciano) */}
        <div className="bg-white border border-cyan-300 rounded-xl p-4 shadow-xs text-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-xs"></span>
                Geração Inversor 2
              </span>
              <button
                type="button"
                onClick={onOpenStringModal}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border transition flex items-center gap-1 ${
                  inv2Disconnected > 0
                    ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                    : 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200'
                }`}
                title="Clique para gerenciar desligamento de strings"
              >
                <Layers className="w-3 h-3" />
                <span>{inv2ActiveStrings}/10 Strings</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-cyan-600">
                {inverter2.acPowerKw.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-500">kW CA</span>
              {inv2Disconnected > 0 && (
                <span className="text-xs font-bold text-rose-600 font-mono ml-auto">
                  -{inverter2.stringLossPercent?.toFixed(0)}% CC
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-600">
              CC: <span className="text-cyan-700 font-mono font-bold">{inverter2.dcPowerKw.toFixed(1)} kW</span>
            </div>
            <div className="text-slate-600">
              POA: <span className="text-cyan-800 font-mono font-bold">{Math.round(tracker2.poaIrradiance)} W/m²</span>
            </div>
            <div className="text-slate-600">
              η: <span className="text-emerald-700 font-mono font-bold">{inverter2.efficiencyPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Potência Total Entregue na MT */}
        <div className="bg-white border border-emerald-300 rounded-xl p-4 shadow-xs text-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Potência MT Entregue
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              13.8 kV · 75 kVA
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">
              {totalMtPowerKw.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500">kW</span>
            <span className="text-xs text-slate-500 font-mono ml-auto">
              ({totalMtPowerKva.toFixed(1)} kVA)
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-600">
              Corrente MT: <span className="text-emerald-700 font-mono font-bold">{currentMtAmperes.toFixed(2)} A</span>
            </div>
            <div className="text-slate-600">
              Perdas Trafo: <span className="text-slate-700 font-mono">{metrics.trafoLossesKw.toFixed(2)} kW</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Perda por Desalinhamento */}
        <div
          className={`border rounded-xl p-4 shadow-xs transition-all ${
            misalignmentLossKw > 0.1
              ? 'bg-rose-50/70 border-rose-300 text-slate-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              {misalignmentLossKw > 0.1 ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
              )}
              Perda Desalinhamento
            </span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${
                misalignmentLossKw > 0.1
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {misalignmentLossKw > 0.1 ? 'Alerta Perda' : 'Zero Perda'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  misalignmentLossKw > 0.1 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {misalignmentLossKw.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-500">kW</span>
            </div>
            <div
              className={`text-lg font-bold font-mono px-2 py-0.5 rounded ${
                misalignmentLossPercent > 1
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              -{misalignmentLossPercent.toFixed(1)}%
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Potência Ideal: <strong className="text-slate-700 font-mono">{idealMtPowerKw.toFixed(1)} kW</strong></span>
            <span>Delta Real: <strong className="text-rose-700 font-mono">{(idealMtPowerKw - totalMtPowerKw).toFixed(1)} kW</strong></span>
          </div>
        </div>
      </div>

      {/* Irradiance Resource Ribbon (GHI vs POA Trackers) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
            <span className="text-slate-600 font-medium">GHI (Global Horizontal):</span>
            <span className="font-bold font-mono text-amber-700 text-sm">
              {Math.round(solar.ghi)} W/m²
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span className="text-slate-600 font-medium">POA Tracker 1:</span>
            <span className="font-bold font-mono text-amber-800 text-sm">
              {Math.round(tracker1.poaIrradiance)} W/m²
            </span>
            {tracker1.isStuck && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                Falha
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span className="text-slate-600 font-medium">POA Tracker 2:</span>
            <span className="font-bold font-mono text-sky-700 text-sm">
              {Math.round(tracker2.poaIrradiance)} W/m²
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-bold border border-sky-300">
              Normal
            </span>
          </div>

          {/* Gain vs GHI */}
          {solar.ghi > 20 && tracker2.poaIrradiance >= solar.ghi && (
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="font-semibold text-[11px]">Ganho Óptico Tracker:</span>
              <span className="font-bold font-mono text-xs">
                +{(((tracker2.poaIrradiance - solar.ghi) / solar.ghi) * 100).toFixed(1)}% vs GHI
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <span>GHI = plano horizontal</span>
          <span>·</span>
          <span>POA = plano inclinado dos módulos</span>
        </div>
      </div>

      {/* Secondary Ribbon: Daily Energy Balance & Plant Health */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs shadow-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Energia Diária Simulada:</span>
            <span className="font-bold font-mono text-emerald-700 text-sm">
              {dailyRealEnergyKwh.toFixed(1)} kWh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Energia Diária Ideal (Sem Falhas):</span>
            <span className="font-bold font-mono text-slate-800 text-sm">
              {dailyIdealEnergyKwh.toFixed(1)} kWh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Perda Total Diária Acumulada:</span>
            <span
              className={`font-bold font-mono text-sm ${
                dailyLossKwh > 0.5 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              -{dailyLossKwh.toFixed(1)} kWh (
              {dailyIdealEnergyKwh > 0 ? ((dailyLossKwh / dailyIdealEnergyKwh) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
          <span>Tensão de Saída MT:</span>
          <span className="text-emerald-700 font-mono font-bold">13.800 V (13.8 kV) Trifásico</span>
        </div>
      </div>
    </div>
  );
};

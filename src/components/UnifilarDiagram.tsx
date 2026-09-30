import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Radio,
  Gauge,
  Power,
  AlertOctagon,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { SystemMetrics, ElectricalProtectionState } from '../types';

interface UnifilarDiagramProps {
  metrics: SystemMetrics;
  protection: ElectricalProtectionState;
  onToggleBreakerMT: () => void;
  onToggleRecloser: () => void;
  onTripRelay: () => void;
  onResetRelay: () => void;
  onToggleQgbt1: () => void;
  onToggleQgbt2: () => void;
  onToggleDcSwitch1?: () => void;
  onToggleDcSwitch2?: () => void;
  onToggleTrafoBtSwitch?: () => void;
  onToggleCabineDisconnector?: () => void;
  onToggleUtilityDisconnector?: () => void;
  onEnergizeAll?: () => void;
  onDeenergizeAll?: () => void;
}

export const UnifilarDiagram: React.FC<UnifilarDiagramProps> = ({
  metrics,
  protection,
  onToggleBreakerMT,
  onToggleRecloser,
  onTripRelay,
  onResetRelay,
  onToggleQgbt1,
  onToggleQgbt2,
  onToggleDcSwitch1,
  onToggleDcSwitch2,
  onToggleTrafoBtSwitch,
  onToggleCabineDisconnector,
  onToggleUtilityDisconnector,
  onEnergizeAll,
  onDeenergizeAll,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const {
    tracker1,
    tracker2,
    inverter1,
    inverter2,
    energization,
    totalMtPowerKw,
    currentMtAmperes,
  } = metrics;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-slate-800 space-y-4">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Diagrama Unifilar Interativo (SLD) · Comutação de Chaves NA / NF
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-300 font-bold">
              13.8 kV / 380 V
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxo elétrico contínuo dos Módulos CC → Inversores → QGBTs → Trafo 75kVA → Cabine MT → Concessionária
          </p>
        </div>

        {/* Global actions and relay trip */}
        <div className="flex flex-wrap items-center gap-2">
          {onEnergizeAll && (
            <button
              onClick={onEnergizeAll}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Fechar todas as chaves (Normal Fechado / Energizado)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              <span>Energizar Tudo (NF)</span>
            </button>
          )}

          {onDeenergizeAll && (
            <button
              onClick={onDeenergizeAll}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Abrir todas as chaves (Normal Aberto / Seguro Manutenção)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Desenergizar Tudo (NA)</span>
            </button>
          )}

          {protection.relay50_51Tripped ? (
            <button
              onClick={onResetRelay}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 animate-pulse shadow-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Resetar Relé 50/51 (Trip Atuado)</span>
            </button>
          ) : (
            <button
              onClick={onTripRelay}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Simular disparo de proteção ANSI 50/51"
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Trip Relé 50/51</span>
            </button>
          )}
        </div>
      </div>

      {/* ELECTRICAL SAFETY STANDARD BANNER (NR-10 / IEC / NBR 14039) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 px-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-bold text-slate-800">
              Convenção Elétrica de Segurança (Padrão Subestações NBR / NR-10 / IEC):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Fechado / Energizado = VERMELHO */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-100 border border-rose-300 text-rose-900 font-bold">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
              <span>CHAVE FECHADA (N/F): ENERGIZADO (PERIGO)</span>
            </div>

            {/* Aberto / Desenergizado = VERDE */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span>CHAVE ABERTA (N/A): DESENERGIZADO (SEGURO)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN DIAGRAM WORKSPACE */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[1020px] bg-slate-50/80 rounded-xl p-5 border border-slate-200 shadow-inner space-y-4">
          
          {/* Stage Headers */}
          <div className="grid grid-cols-5 gap-3 text-center text-[10px] font-mono tracking-wider font-bold">
            <div className="bg-white border border-slate-200 text-amber-800 py-1.5 px-2 rounded shadow-xs">
              1. ARRANJO CC (55 kWp)
            </div>
            <div className="bg-white border border-slate-200 text-sky-800 py-1.5 px-2 rounded shadow-xs">
              2. INVERSORES & QGBT (BT 380V)
            </div>
            <div className="bg-white border border-slate-200 text-indigo-800 py-1.5 px-2 rounded shadow-xs">
              3. TRAFO ELEVADOR (75 kVA)
            </div>
            <div className="bg-white border border-slate-200 text-rose-800 py-1.5 px-2 rounded shadow-xs">
              4. CABINE PRIMÁRIA MT & 50/51
            </div>
            <div className="bg-white border border-slate-200 text-emerald-800 py-1.5 px-2 rounded shadow-xs">
              5. PONTO DE ENTREGA & REDE MT
            </div>
          </div>

          {/* Flow Grid */}
          <div className="grid grid-cols-5 gap-4 items-stretch relative font-mono text-xs">
            
            {/* COLUMN 1: PV Strings & DC Disconnects */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* String Inversor 1 Block */}
              <div
                onClick={() => setSelectedBlock('tracker1')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.dc1
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700">Strings Inversor 01</span>
                  <span className={`text-[10px] font-semibold px-1 rounded ${
                    (inverter1.disconnectedStrings ?? 0) > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-500'
                  }`}>
                    {inverter1.activeStrings ?? 10}/10 Ativas
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Tracker 1: <strong className="text-amber-700">{(tracker1?.angle ?? 0) > 0 ? `+${(tracker1?.angle ?? 0).toFixed(0)}°` : `${(tracker1?.angle ?? 0).toFixed(0)}°`}</strong>
                  {tracker1.isStuck && <span className="text-amber-800 text-[10px] font-bold ml-1">(Travado)</span>}
                </div>
                <div className="mt-1 text-[11px] text-slate-700">
                  P_gerada: <strong className="text-slate-900 font-bold">{(inverter1?.dcPowerKw ?? 0).toFixed(1)} kW</strong>
                </div>

                {/* Chave Seccionadora CC 1 */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-semibold">Seccionadora CC 1:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleDcSwitch1) onToggleDcSwitch1();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      protection.dcSwitch1Closed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{protection.dcSwitch1Closed ? 'NF (FECHADA)' : 'NA (ABERTA)'}</span>
                  </button>
                </div>
                <div className="mt-1 text-right text-[9px]">
                  <span className={energization.dc1 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {energization.dc1 ? '● TRECHO ENERGIZADO' : '○ TRECHO DESENERGIZADO'}
                  </span>
                </div>
              </div>

              {/* String Inversor 2 Block */}
              <div
                onClick={() => setSelectedBlock('tracker2')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.dc2
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-cyan-700">Strings Inversor 02</span>
                  <span className={`text-[10px] font-semibold px-1 rounded ${
                    (inverter2.disconnectedStrings ?? 0) > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-500'
                  }`}>
                    {inverter2.activeStrings ?? 10}/10 Ativas
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Tracker 2: <strong className="text-cyan-700">{(tracker2?.angle ?? 0) > 0 ? `+${(tracker2?.angle ?? 0).toFixed(0)}°` : `${(tracker2?.angle ?? 0).toFixed(0)}°`}</strong>
                  <span className="text-emerald-700 text-[10px] font-bold ml-1">(Rastreando)</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-700">
                  P_gerada: <strong className="text-slate-900 font-bold">{(inverter2?.dcPowerKw ?? 0).toFixed(1)} kW</strong>
                </div>

                {/* Chave Seccionadora CC 2 */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-semibold">Seccionadora CC 2:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleDcSwitch2) onToggleDcSwitch2();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      protection.dcSwitch2Closed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{protection.dcSwitch2Closed ? 'NF (FECHADA)' : 'NA (ABERTA)'}</span>
                  </button>
                </div>
                <div className="mt-1 text-right text-[9px]">
                  <span className={energization.dc2 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {energization.dc2 ? '● TRECHO ENERGIZADO' : '○ TRECHO DESENERGIZADO'}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Inverters & QGBT Breakers */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Inversor 1 & QGBT 1 */}
              <div
                onClick={() => setSelectedBlock('inverter1')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.inv1Output && protection.qgbt1BreakerClosed
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700">Inversor 01 (30 kW)</span>
                  <span className={`text-[9px] px-1 rounded font-bold ${inverter1.status === 'active' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-500'}`}>
                    380V BT
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  Saída CA: <strong className="text-amber-700 font-bold">{(inverter1?.acPowerKw ?? 0).toFixed(1)} kW</strong>
                </div>
                <div className="text-[10px] text-slate-500">
                  Corrente: {(inverter1?.currentAc ?? 0).toFixed(1)} A · η: {(inverter1?.efficiencyPercent ?? 0).toFixed(1)}%
                </div>

                {/* Disjuntor QGBT 1 */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-semibold">Disjuntor QGBT 1:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleQgbt1();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      protection.qgbt1BreakerClosed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{protection.qgbt1BreakerClosed ? 'NF (FECHADO)' : 'NA (ABERTO)'}</span>
                  </button>
                </div>
                <div className="mt-1 text-right text-[9px]">
                  <span className={protection.qgbt1BreakerClosed && energization.inv1Output ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {protection.qgbt1BreakerClosed && energization.inv1Output ? '● ALIMENTANDO BARRAMENTO' : '○ ISOLADO / DESENERGIZADO'}
                  </span>
                </div>
              </div>

              {/* Inversor 2 & QGBT 2 */}
              <div
                onClick={() => setSelectedBlock('inverter2')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.inv2Output && protection.qgbt2BreakerClosed
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-cyan-700">Inversor 02 (30 kW)</span>
                  <span className={`text-[9px] px-1 rounded font-bold ${inverter2.status === 'active' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'bg-slate-100 text-slate-500'}`}>
                    380V BT
                  </span>
                </div>
                <div className="text-[11px] text-slate-700">
                  Saída CA: <strong className="text-cyan-700 font-bold">{(inverter2?.acPowerKw ?? 0).toFixed(1)} kW</strong>
                </div>
                <div className="text-[10px] text-slate-500">
                  Corrente: {(inverter2?.currentAc ?? 0).toFixed(1)} A · η: {(inverter2?.efficiencyPercent ?? 0).toFixed(1)}%
                </div>

                {/* Disjuntor QGBT 2 */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-semibold">Disjuntor QGBT 2:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleQgbt2();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      protection.qgbt2BreakerClosed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{protection.qgbt2BreakerClosed ? 'NF (FECHADO)' : 'NA (ABERTO)'}</span>
                  </button>
                </div>
                <div className="mt-1 text-right text-[9px]">
                  <span className={protection.qgbt2BreakerClosed && energization.inv2Output ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {protection.qgbt2BreakerClosed && energization.inv2Output ? '● ALIMENTANDO BARRAMENTO' : '○ ISOLADO / DESENERGIZADO'}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Transformer 75 kVA & BT Disconnector */}
            <div className="space-y-4 flex flex-col justify-between">
              <div
                onClick={() => setSelectedBlock('trafo')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.trafoMtSide
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Trafo Elevador</span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-bold">
                    75 kVA
                  </span>
                </div>

                {/* Transformer schematic symbols */}
                <div className="my-2 py-2 bg-slate-50 rounded-lg flex items-center justify-center gap-2 border border-slate-200">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 flex items-center justify-center text-[11px] font-bold text-indigo-700 bg-white">
                    Δ 380V
                  </div>
                  <span className="text-slate-500 font-mono text-[10px] font-bold">Dyn11</span>
                  <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center text-[11px] font-bold text-amber-800 bg-white">
                    Y 13.8kV
                  </div>
                </div>

                {/* Trafo BT Disconnector */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-semibold">Seccionadora BT Trafo:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleTrafoBtSwitch) onToggleTrafoBtSwitch();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      protection.trafoBtSwitchClosed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{protection.trafoBtSwitchClosed ? 'NF (FECHADA)' : 'NA (ABERTA)'}</span>
                  </button>
                </div>

                <div className="mt-2 text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Potência BT:</span>
                    <span className="text-slate-900 font-bold">{(metrics?.totalBtPowerKw ?? 0).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Perdas Trafo:</span>
                    <span className="text-slate-600">{(metrics?.trafoLossesKw ?? 0).toFixed(2)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saída MT:</span>
                    <span className="text-amber-700 font-bold">
                      {energization.trafoMtSide ? ((metrics?.totalBtPowerKw ?? 0) - (metrics?.trafoLossesKw ?? 0)).toFixed(1) : '0.0'} kW
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-right text-[9px]">
                  <span className={energization.trafoMtSide ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {energization.trafoMtSide ? '● SECUNDÁRIO 13.8kV ENERGIZADO' : '○ TRANSFORMADOR DESENERGIZADO'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center font-mono text-[10px] text-slate-700 shadow-xs">
                <span className="text-slate-900 font-bold">Cabo MT:</span> 3x (1x50mm²) XLPE 15kV
              </div>
            </div>

            {/* COLUMN 4: Primary Cabin & Breaker 52 / Relay 50/51 */}
            <div className="space-y-4 flex flex-col justify-between">
              <div
                onClick={() => setSelectedBlock('cabine')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.utilityBranch
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Cabine Primária MT</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                    13.8 kV
                  </span>
                </div>

                {/* Seccionadora MT Cabine */}
                <div className="my-2 p-2 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-semibold">Seccionadora MT:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleCabineDisconnector) onToggleCabineDisconnector();
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                        protection.cabineDisconnectorClosed
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{protection.cabineDisconnectorClosed ? 'NF (FECHADA)' : 'NA (ABERTA)'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-600 font-semibold">Relé 50/51:</span>
                    <span
                      className={`text-[10px] font-bold ${
                        protection.relay50_51Tripped ? 'text-rose-600 animate-pulse' : 'text-emerald-700'
                      }`}
                    >
                      {protection.relay50_51Tripped ? 'TRIP ATUADO' : 'NORMAL (ARMADO)'}
                    </span>
                  </div>
                </div>

                {/* Disjuntor MT 52 a Vácuo */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-600 font-semibold block">Disjuntor MT 52:</span>
                    <span className="text-[9px] text-slate-500 font-mono">Vácuo 630A / 16kA</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBreakerMT();
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                      protection.breakerMTClosed && !protection.relay50_51Tripped
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{protection.breakerMTClosed && !protection.relay50_51Tripped ? 'NF (FECHADO)' : 'NA (ABERTO)'}</span>
                  </button>
                </div>

                <div className="mt-2 text-right text-[9px]">
                  <span className={energization.utilityBranch ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {energization.utilityBranch ? '● CONDUTORES MT ENERGIZADOS' : '○ SECCIONAMENTO SEGURO'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-600 text-center font-mono shadow-xs">
                Transformadores de Corrente (TC): 15/5A
              </div>
            </div>

            {/* COLUMN 5: Utility Delivery, Meter & Recloser */}
            <div className="space-y-4 flex flex-col justify-between">
              <div
                onClick={() => setSelectedBlock('concessionaria')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
                  energization.gridDelivering
                    ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                    : 'border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Medição & Concessionária</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                    13.8 kV
                  </span>
                </div>

                {/* Seccionadora de Ponto de Entrega */}
                <div className="my-2 p-2 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-semibold">Seccionadora Entrega:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleUtilityDisconnector) onToggleUtilityDisconnector();
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                        protection.utilityDisconnectorClosed
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{protection.utilityDisconnectorClosed ? 'NF (FECHADA)' : 'NA (ABERTA)'}</span>
                    </button>
                  </div>

                  {/* Meter Display Screen */}
                  <div className="p-2 rounded bg-white border border-slate-200 text-[11px] font-mono shadow-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 font-bold">
                        <Gauge className="w-3.5 h-3.5 text-amber-600" /> Medidor:
                      </span>
                      <strong className="text-slate-900 text-xs font-bold">
                        {energization.gridDelivering ? (totalMtPowerKw ?? 0).toFixed(1) : '0.0'} kW
                      </strong>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                      <span>Corrente MT:</span>
                      <span className="text-slate-700">{energization.gridDelivering ? (currentMtAmperes ?? 0).toFixed(2) : '0.00'} A</span>
                    </div>
                  </div>
                </div>

                {/* Religador MT */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-600 font-semibold block">Religador MT:</span>
                    <span className="text-[9px] text-slate-500 font-mono">Rede de Distribuição</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRecloser();
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                      protection.recloserClosed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{protection.recloserClosed ? 'NF (LIGADO)' : 'NA (DESLIGADO)'}</span>
                  </button>
                </div>

                <div className="mt-2 text-right text-[9px]">
                  <span className={energization.gridDelivering ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {energization.gridDelivering ? '● INJEÇÃO ATIVA NA REDE' : '○ REDE ISOLADA / ZERO kW'}
                  </span>
                </div>
              </div>

              {/* Grid Connection Tag */}
              <div className={`p-3 rounded-xl border text-center font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                energization.gridDelivering
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <Zap className="w-4 h-4 text-amber-600" />
                <span>
                  {energization.gridDelivering ? 'REDE CONCESSIONÁRIA ENERGIZADA' : 'REDE DESCONECTADA DA USINA'}
                </span>
              </div>
            </div>

          </div>

          {/* Interactive Component Explanatory Drawer */}
          {selectedBlock && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-slate-300 text-xs text-slate-700 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {selectedBlock === 'tracker1' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Campo Fotovoltaico - Strings 1 a 5 (Tracker 1):</strong>
                      <p>
                        50 módulos de 550W (27.5 kWp). Possui seccionadora CC individual para desenergização de manutenção.
                        Quando a chave CC é comutada para <strong>NA (Aberta / Verde)</strong>, a entrada do Inversor 1 é desenergizada imediatamente, interrompendo sua geração.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'tracker2' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Campo Fotovoltaico - Strings 6 a 10 (Tracker 2):</strong>
                      <p>
                        50 módulos de 550W (27.5 kWp) com rastreamento contínuo. Possui seccionadora CC individual.
                        Ao abrir a chave (NA / Verde), o trecho até o Inversor 2 fica sem tensão.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'inverter1' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Inversor 1 & Disjuntor QGBT 1:</strong>
                      <p>
                        Converte CC para 380V CA trifásico. O disjuntor termomagnético do QGBT 1 protege o ramal de baixa tensão.
                        Se for colocado em <strong>NA (Aberto / Verde)</strong>, o Inversor 1 é desconectado do barramento geral do transformador.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'inverter2' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Inversor 2 & Disjuntor QGBT 2:</strong>
                      <p>
                        Inversor de string de 30 kW. Se o disjuntor do QGBT 2 for aberto (NA / Verde), a contribuição do Inversor 2 é isolada.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'trafo' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Transformador Elevador 75 kVA & Seccionadora BT:</strong>
                      <p>
                        Transformador 380V / 13.800V Dyn11. A chave seccionadora de BT permite desenergizar o primário do transformador para manutenção, garantindo segurança na subestação.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'cabine' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Cabine Primária MT, Seccionadora & Disjuntor 52:</strong>
                      <p>
                        A seccionadora de MT permite a visibilidade de abertura dos contatos. O disjuntor a vácuo 52 atua sob comando de abertura ou por disparo automático do <strong>Relé ANSI 50/51</strong>.
                        Se qualquer um estiver aberto (NA / Verde), todo o circuito a jusante (medidor e rede) é desenergizado.
                      </p>
                    </>
                  )}

                  {selectedBlock === 'concessionaria' && (
                    <>
                      <strong className="text-slate-900 block text-sm">Ponto de Entrega, Medição e Religador da Concessionária:</strong>
                      <p>
                        O medidor eletrônico afere a potência ativa líquida injetada na rede pública de distribuição. Se o religador ou a seccionadora de entrega estiverem abertos (NA / Verde), a injeção cai instantaneamente para <strong>0.0 kW</strong>.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-500 hover:text-slate-900 text-xs font-mono underline"
              >
                Fechar
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

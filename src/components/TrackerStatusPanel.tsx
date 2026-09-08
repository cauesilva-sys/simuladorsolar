import React from 'react';
import { ShieldAlert, CheckCircle2, RotateCw, AlertTriangle, Sliders, Layers, Clock } from 'lucide-react';
import { TrackerState } from '../types';
import { formatTime } from '../utils/solarMath';

interface TrackerStatusPanelProps {
  tracker1: TrackerState;
  tracker2: TrackerState;
  ghi?: number;
  onOpenFailureModal: () => void;
  onRestoreTracker1: () => void;
  onSetStuckAngle: (angle: number) => void;
}

export const TrackerStatusPanel: React.FC<TrackerStatusPanelProps> = ({
  tracker1,
  tracker2,
  ghi = 0,
  onOpenFailureModal,
  onRestoreTracker1,
  onSetStuckAngle,
}) => {
  const failureHourString = tracker1.failureHour !== undefined ? formatTime(tracker1.failureHour) : '10:30';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Sistema de Rastreamento Solar (Trackers de 1 Eixo · 10 Strings / Inversor)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Limites de Curso: -60° (Leste) a +60° (Oeste)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tracker 1 Card */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            tracker1.isStuck
              ? 'bg-amber-50/60 border-amber-300 shadow-xs'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-mono text-xs font-bold flex items-center justify-center border border-amber-300">
                T1
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Tracker 1 (Inversor 1)
                  {tracker1.isStuck && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      FALHA ÀS {failureHourString}h
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">10 Strings Configuradas (Strings 01 a 10 · Inversor 1)</p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="text-right">
              <span
                className={`text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                  tracker1.isStuck
                    ? tracker1.isFailureActiveNow
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {tracker1.isStuck ? (
                  tracker1.isFailureActiveNow ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                      <span>Travado ({tracker1.stuckAngle > 0 ? `+${tracker1.stuckAngle}°` : `${tracker1.stuckAngle}°`})</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Normal até {failureHourString}h</span>
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>Rastreando 100%</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* SVG Visual Tracker Representation */}
          <div className="relative h-24 bg-white rounded-lg p-2 flex items-center justify-center border border-slate-200 mb-3 overflow-hidden shadow-xs">
            {/* Ground line */}
            <div className="absolute bottom-2 inset-x-4 h-0.5 bg-slate-300 flex justify-between text-[8px] font-mono text-slate-500 px-1 font-semibold">
              <span>Leste (-60°)</span>
              <span>Eixo N-S</span>
              <span>Oeste (+60°)</span>
            </div>

            {/* Central Torque Tube Pier */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-10 bg-slate-400 rounded-t flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            </div>

            {/* Rotating Solar Table */}
            <div
              className="relative w-44 h-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded shadow-sm transition-transform duration-300 border border-amber-700/60 flex items-center justify-between px-1"
              style={{
                transform: `rotate(${tracker1.angle}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* String module divisions */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-2 bg-amber-900/60 rounded-[1px] border border-amber-200/50" />
              ))}
            </div>

            {/* Angle Indicator Tag */}
            <div className="absolute top-2 right-2 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-xs">
              {tracker1.angle > 0 ? `+${tracker1.angle.toFixed(1)}°` : `${tracker1.angle.toFixed(1)}°`}
            </div>

            {tracker1.isStuck && (
              <div className="absolute top-2 left-2 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-amber-300 flex items-center gap-1 shadow-xs">
                <RotateCw className="w-3 h-3 text-amber-700" />
                <span>
                  {tracker1.isFailureActiveNow
                    ? `Desalinhado: ${tracker1.misalignmentAngle.toFixed(1)}°`
                    : `Falha programada às ${failureHourString}h`}
                </span>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block">Irradiação POA</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {Math.round(tracker1.poaIrradiance)}
              </span>
              <span className="text-[9px] text-slate-500"> W/m²</span>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block">Ângulo Ideal</span>
              <span className="text-sm font-bold font-mono text-sky-700">
                {tracker1.idealAngle > 0 ? `+${tracker1.idealAngle.toFixed(0)}°` : `${tracker1.idealAngle.toFixed(0)}°`}
              </span>
              <span className="text-[9px] text-slate-500"> rastreado</span>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block">Perda Mecânica</span>
              <span
                className={`text-sm font-bold font-mono ${
                  tracker1.misalignmentLossPercent > 5 ? 'text-amber-700' : 'text-slate-700'
                }`}
              >
                {tracker1.misalignmentLossPercent.toFixed(1)}%
              </span>
              <span className="text-[9px] text-slate-500"> vs ideal</span>
            </div>
          </div>

          {/* Failure Simulation Controls */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={tracker1.isStuck ? onRestoreTracker1 : onOpenFailureModal}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  tracker1.isStuck
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                {tracker1.isStuck ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Destravar Tracker 1 (Normalizar Rastreamento 100%)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Simular Falha de Tracker (Definir Horário e Ângulo)...</span>
                  </>
                )}
              </button>

              {tracker1.isStuck && (
                <button
                  type="button"
                  onClick={onOpenFailureModal}
                  className="py-2 px-3 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center gap-1 shadow-xs whitespace-nowrap"
                  title="Alterar horário ou ângulo da falha"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Editar Falha</span>
                </button>
              )}
            </div>

            {/* Stuck Angle selector */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Ângulo de Bloqueio:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="5"
                  value={tracker1.stuckAngle}
                  onChange={(e) => onSetStuckAngle(parseInt(e.target.value))}
                  disabled={!tracker1.isStuck}
                  className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
                />
                <span className="font-mono font-bold text-amber-700 min-w-[36px] text-right">
                  {tracker1.stuckAngle > 0 ? `+${tracker1.stuckAngle}°` : `${tracker1.stuckAngle}°`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracker 2 Card */}
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-900 font-mono text-xs font-bold flex items-center justify-center border border-cyan-300">
                  T2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Tracker 2 (Inversor 2)
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      100% OPERACIONAL
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">10 Strings Configuradas (Strings 01 a 10 · Inversor 2)</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Rastreando Sol</span>
                </span>
              </div>
            </div>

            {/* SVG Visual Tracker Representation */}
            <div className="relative h-24 bg-white rounded-lg p-2 flex items-center justify-center border border-slate-200 mb-3 overflow-hidden shadow-xs">
              <div className="absolute bottom-2 inset-x-4 h-0.5 bg-slate-300 flex justify-between text-[8px] font-mono text-slate-500 px-1 font-semibold">
                <span>Leste (-60°)</span>
                <span>Eixo N-S</span>
                <span>Oeste (+60°)</span>
              </div>

              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-10 bg-slate-400 rounded-t flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
              </div>

              {/* Rotating Solar Table */}
              <div
                className="relative w-44 h-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 rounded shadow-sm transition-transform duration-300 border border-cyan-700/60 flex items-center justify-between px-1"
                style={{
                  transform: `rotate(${tracker2.angle}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-7 h-2 bg-cyan-900/60 rounded-[1px] border border-cyan-200/50" />
                ))}
              </div>

              <div className="absolute top-2 right-2 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-xs">
                {tracker2.angle > 0 ? `+${tracker2.angle.toFixed(1)}°` : `${tracker2.angle.toFixed(1)}°`}
              </div>

              <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-300 flex items-center gap-1 shadow-xs">
                <RotateCw className="w-3 h-3 text-emerald-700 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Rastreamento Ativo</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Irradiação POA</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {Math.round(tracker2.poaIrradiance)}
                </span>
                <span className="text-[9px] text-slate-500"> W/m²</span>
                {ghi > 10 && tracker2.poaIrradiance >= ghi && (
                  <span className="text-[9px] text-emerald-700 font-bold block">
                    +{(((tracker2.poaIrradiance - ghi) / ghi) * 100).toFixed(0)}% vs GHI
                  </span>
                )}
              </div>

              <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Ângulo Sol</span>
                <span className="text-sm font-bold font-mono text-cyan-700">
                  {tracker2.idealAngle > 0 ? `+${tracker2.idealAngle.toFixed(0)}°` : `${tracker2.idealAngle.toFixed(0)}°`}
                </span>
                <span className="text-[9px] text-slate-500"> alinhamento 1:1</span>
              </div>

              <div className="bg-white p-2 rounded border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Eficiência Ângulo</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  100%
                </span>
                <span className="text-[9px] text-slate-500"> sem perdas</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              O Tracker 2 mantém o algoritmo astronômico de rastreamento contínuo (10 strings no Inversor 2), servindo de referência de geração operacional.
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Note on GHI vs POA */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Sliders className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">
            Fundamentos Fotovoltaicos: 10 Strings por Inversor & Rastreamento
          </p>
          <p className="text-[11px] text-slate-500">
            Cada inversor gerencia 10 strings independentes. Em caso de atuação de fusível, queima de diodo de bypass ou abertura de seccionadora de string, a perda de potência CC é rigorosamente proporcional (10% por string desligada). O comportamento da curva diária reflete a operação 100% normal antes da falha e o desvio angular imediato a partir do horário exato do travamento mecânico.
          </p>
        </div>
      </div>
    </div>
  );
};


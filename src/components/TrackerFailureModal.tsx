import React, { useState } from 'react';
import { X, Clock, RotateCw, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Sun } from 'lucide-react';
import { formatTime } from '../utils/solarMath';

interface TrackerFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStuck: boolean;
  currentStuckAngle: number;
  currentFailureHour: number;
  currentTime: number;
  onConfirmFailure: (failureHour: number, stuckAngle: number) => void;
  onRestoreTracker: () => void;
}

export const TrackerFailureModal: React.FC<TrackerFailureModalProps> = ({
  isOpen,
  onClose,
  isStuck,
  currentStuckAngle,
  currentFailureHour,
  currentTime,
  onConfirmFailure,
  onRestoreTracker,
}) => {
  const [failureHourTemp, setFailureHourTemp] = useState<number>(currentFailureHour);
  const [stuckAngleTemp, setStuckAngleTemp] = useState<number>(currentStuckAngle);

  // Sync state when opened
  React.useEffect(() => {
    setFailureHourTemp(currentFailureHour);
    setStuckAngleTemp(currentStuckAngle);
  }, [isOpen, currentFailureHour, currentStuckAngle]);

  if (!isOpen) return null;

  const handleApply = () => {
    onConfirmFailure(failureHourTemp, stuckAngleTemp);
    onClose();
  };

  const handleRestore = () => {
    onRestoreTracker();
    onClose();
  };

  const timeString = formatTime(failureHourTemp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-4 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Simulação de Falha de Rastreamento (Tracker 1)
              </h3>
              <p className="text-xs text-slate-500">
                Defina o horário exato do travamento mecânico e o ângulo de desalinhamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">
                Em qual horário ocorreu a falha do tracker?
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                Conforme as diretrizes de simulação:
                <br />• <strong>Antes das {timeString}h:</strong> a geração do Tracker 1 permanece <strong>100% normal</strong> (rastreamento contínuo).
                <br />• <strong>A partir das {timeString}h até as 18:00:</strong> a curva de geração refletirá a perda de rendimento proporcional ao travamento mecânico.
              </p>
            </div>
          </div>

          {/* Time Picker Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Horário do Evento de Falha:</span>
              </label>
              <span className="font-mono text-base font-extrabold text-amber-700 px-3 py-1 rounded bg-white border border-amber-300 shadow-xs">
                {timeString}h
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="6.0"
                max="18.0"
                step="0.25"
                value={failureHourTemp}
                onChange={(e) => setFailureHourTemp(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold px-0.5">
                <span>06:00 (Amanhecer)</span>
                <span>10:00</span>
                <span>12:00 (Meio-dia)</span>
                <span>14:00</span>
                <span>18:00 (Pôr do Sol)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Sugestões:</span>
              <button
                type="button"
                onClick={() => setFailureHourTemp(8.5)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                08:30 (Manhã)
              </button>
              <button
                type="button"
                onClick={() => setFailureHourTemp(10.5)}
                className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 transition"
              >
                10:30 (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setFailureHourTemp(12.0)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                12:00 (Meio-dia)
              </button>
              <button
                type="button"
                onClick={() => setFailureHourTemp(14.0)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                14:00 (Tarde)
              </button>
              <button
                type="button"
                onClick={() => setFailureHourTemp(currentTime)}
                className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300 transition"
              >
                Hora Atual ({formatTime(currentTime)}h)
              </button>
            </div>
          </div>

          {/* Stuck Angle Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-amber-600" />
                <span>Ângulo de Bloqueio Físico:</span>
              </label>
              <span className="font-mono text-base font-extrabold text-amber-700 px-3 py-1 rounded bg-white border border-amber-300 shadow-xs">
                {stuckAngleTemp > 0 ? `+${stuckAngleTemp}°` : `${stuckAngleTemp}°`}
              </span>
            </div>

            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={stuckAngleTemp}
              onChange={(e) => setStuckAngleTemp(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold px-0.5">
              <span>-60° (Inclinado para Leste)</span>
              <span>0° (Plano Horizontal)</span>
              <span>+60° (Inclinado para Oeste)</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Ângulos Típicos:</span>
              <button
                type="button"
                onClick={() => setStuckAngleTemp(-45)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                -45° (Travado a Leste)
              </button>
              <button
                type="button"
                onClick={() => setStuckAngleTemp(0)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                0° (Travado na Horizontal)
              </button>
              <button
                type="button"
                onClick={() => setStuckAngleTemp(45)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                +45° (Travado a Oeste)
              </button>
            </div>
          </div>

          {/* Timeline Simulation Visual Preview */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Cronograma do Dia com o Evento Aplicado:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900">
                <strong className="block text-emerald-800">Fase 1: 06:00 até {timeString}h</strong>
                <span>Rastreamento ativo normal. Curva de geração 100% ideal (0% de perda mecânica).</span>
              </div>
              <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-950">
                <strong className="block text-amber-800">Fase 2: {timeString}h até 18:00</strong>
                <span>Tracker 1 travado em {stuckAngleTemp}°. Curva de geração desce conforme o desalinhamento angular.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between gap-3">
          {isStuck ? (
            <button
              type="button"
              onClick={handleRestore}
              className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Destravar Tracker 1 (Normalizar)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 text-xs transition"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <span>Confirmar Falha no Horário e Recalcular Curva</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

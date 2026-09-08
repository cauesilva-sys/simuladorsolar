import React, { useState } from 'react';
import { X, Layers, AlertTriangle, CheckCircle2, RefreshCw, Zap, ArrowRight } from 'lucide-react';

interface StringDisconnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  disconnectedStringsInv1: number;
  disconnectedStringsInv2: number;
  onConfirm: (inv1Disconnected: number, inv2Disconnected: number) => void;
}

export const StringDisconnectionModal: React.FC<StringDisconnectionModalProps> = ({
  isOpen,
  onClose,
  disconnectedStringsInv1,
  disconnectedStringsInv2,
  onConfirm,
}) => {
  const [inv1Temp, setInv1Temp] = useState<number>(disconnectedStringsInv1);
  const [inv2Temp, setInv2Temp] = useState<number>(disconnectedStringsInv2);

  // Sync temp state when opening
  React.useEffect(() => {
    setInv1Temp(disconnectedStringsInv1);
    setInv2Temp(disconnectedStringsInv2);
  }, [isOpen, disconnectedStringsInv1, disconnectedStringsInv2]);

  if (!isOpen) return null;

  const totalStringsPerInverter = 10;
  const active1 = totalStringsPerInverter - inv1Temp;
  const active2 = totalStringsPerInverter - inv2Temp;
  const lossPercent1 = (inv1Temp / totalStringsPerInverter) * 100;
  const lossPercent2 = (inv2Temp / totalStringsPerInverter) * 100;
  const totalStrings = 20;
  const totalActive = active1 + active2;
  const totalLossPercent = ((inv1Temp + inv2Temp) / totalStrings) * 100;

  const handleApply = () => {
    onConfirm(inv1Temp, inv2Temp);
    onClose();
  };

  const handleResetAll = () => {
    setInv1Temp(0);
    setInv2Temp(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-4 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gerenciamento e Desligamento de Strings em Campo
              </h3>
              <p className="text-xs text-slate-500">
                Inversores configurados com 10 strings cada · Perda de potência proporcional
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Question / Mandatory Prompt Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">
                Quantas strings deseja desligar em campo?
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                Informe o número de strings desconectadas ou abertas por fusível/seccionador para cada inversor. Cada string desligada reduz <strong>10%</strong> da capacidade de geração CC correspondente.
              </p>
            </div>
          </div>

          {/* Inverter 1 Controls */}
          <div className="bg-slate-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="font-bold text-slate-900 text-sm">
                  Inversor 1 (Tracker 1 · 10 Strings)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {active1}/10 strings ativas ({lossPercent1.toFixed(0)}% de perda CC)
                </span>
              </div>
            </div>

            {/* Stepper and Number Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-xs font-semibold text-slate-700">
                Strings Desligadas no Inversor 1 (0 a 10):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInv1Temp((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center border border-slate-300 transition disabled:opacity-40"
                  disabled={inv1Temp <= 0}
                >
                  -
                </button>
                <span className="font-mono text-base font-extrabold text-amber-700 min-w-[32px] text-center">
                  {inv1Temp}
                </span>
                <button
                  type="button"
                  onClick={() => setInv1Temp((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center border border-slate-300 transition disabled:opacity-40"
                  disabled={inv1Temp >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* Visual String Indicators (10 Strings) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Visualização Individual das 10 Strings do Inversor 1:
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[...Array(10)].map((_, i) => {
                  const isDisconnected = i >= 10 - inv1Temp;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        // Toggle up to this string
                        if (isDisconnected) {
                          setInv1Temp(9 - i);
                        } else {
                          setInv1Temp(10 - i);
                        }
                      }}
                      className={`py-2 px-1 text-center rounded text-[10px] font-mono font-bold border transition ${
                        isDisconnected
                          ? 'bg-rose-50 border-rose-300 text-rose-700 line-through opacity-80'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      }`}
                      title={isDisconnected ? `String ${i + 1} Desligada` : `String ${i + 1} Ativa`}
                    >
                      S{String(i + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Strings 01 a 10 (módulos fotovoltaicos)</span>
                <span>Verde = Ativa · Vermelho = Desligada</span>
              </div>
            </div>
          </div>

          {/* Inverter 2 Controls */}
          <div className="bg-slate-50 border border-cyan-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
                <span className="font-bold text-slate-900 text-sm">
                  Inversor 2 (Tracker 2 · 10 Strings)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300">
                  {active2}/10 strings ativas ({lossPercent2.toFixed(0)}% de perda CC)
                </span>
              </div>
            </div>

            {/* Stepper and Number Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-xs font-semibold text-slate-700">
                Strings Desligadas no Inversor 2 (0 a 10):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInv2Temp((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center border border-slate-300 transition disabled:opacity-40"
                  disabled={inv2Temp <= 0}
                >
                  -
                </button>
                <span className="font-mono text-base font-extrabold text-cyan-700 min-w-[32px] text-center">
                  {inv2Temp}
                </span>
                <button
                  type="button"
                  onClick={() => setInv2Temp((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center border border-slate-300 transition disabled:opacity-40"
                  disabled={inv2Temp >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* Visual String Indicators (10 Strings) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Visualização Individual das 10 Strings do Inversor 2:
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[...Array(10)].map((_, i) => {
                  const isDisconnected = i >= 10 - inv2Temp;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (isDisconnected) {
                          setInv2Temp(9 - i);
                        } else {
                          setInv2Temp(10 - i);
                        }
                      }}
                      className={`py-2 px-1 text-center rounded text-[10px] font-mono font-bold border transition ${
                        isDisconnected
                          ? 'bg-rose-50 border-rose-300 text-rose-700 line-through opacity-80'
                          : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                      }`}
                      title={isDisconnected ? `String ${i + 1} Desligada` : `String ${i + 1} Ativa`}
                    >
                      S{String(i + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Strings 01 a 10 (módulos fotovoltaicos)</span>
                <span>Ciano = Ativa · Vermelho = Desligada</span>
              </div>
            </div>
          </div>

          {/* Total Impact Summary Box */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Resumo da Usina: {totalActive}/20 strings em operação</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {inv1Temp + inv2Temp === 0
                  ? 'Todas as 20 strings estão conectadas e gerando na capacidade plena nominal.'
                  : `Redução proporcional de ${totalLossPercent.toFixed(1)}% na capacidade CC total (${inv1Temp + inv2Temp} strings desligadas).`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 text-xs flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar 20 Strings
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <span>Confirmar e Recalcular Curva de Geração</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

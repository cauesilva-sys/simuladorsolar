import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  BarChart3,
  Clock,
  Eye,
  SunMedium,
  Zap,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HourlyDataPoint } from '../types';
import { formatTime } from '../utils/solarMath';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyChartProps {
  dailyProfile: HourlyDataPoint[];
  currentTime: number; // e.g. 12.0
  tracker1Stuck: boolean;
  tracker1StuckAngle: number;
  tracker1FailureHour?: number;
  disconnectedStringsInv1?: number;
  disconnectedStringsInv2?: number;
  onOpenStringModal?: () => void;
  onOpenTrackerFailureModal?: () => void;
}

export const DailyChart: React.FC<DailyChartProps> = ({
  dailyProfile,
  currentTime,
  tracker1Stuck,
  tracker1StuckAngle,
  tracker1FailureHour = 10.5,
  disconnectedStringsInv1 = 0,
  disconnectedStringsInv2 = 0,
  onOpenStringModal,
  onOpenTrackerFailureModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Individual curve selection state
  const [selectedCurves, setSelectedCurves] = useState<{
    inv1: boolean;
    inv2: boolean;
    totalMt: boolean;
    refTotal: boolean;
    refInv: boolean;
    poa1: boolean;
    poa2: boolean;
    ghi: boolean;
  }>({
    inv1: true,
    inv2: true,
    totalMt: true,
    refTotal: true,
    refInv: false,
    poa1: true,
    poa2: true,
    ghi: true,
  });

  const toggleCurve = (key: keyof typeof selectedCurves) => {
    setSelectedCurves((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const applyPreset = (preset: 'all' | 'inverters' | 'plant' | 'irradiance') => {
    if (preset === 'all') {
      setSelectedCurves({
        inv1: true,
        inv2: true,
        totalMt: true,
        refTotal: true,
        refInv: true,
        poa1: true,
        poa2: true,
        ghi: true,
      });
    } else if (preset === 'inverters') {
      setSelectedCurves({
        inv1: true,
        inv2: true,
        totalMt: false,
        refTotal: false,
        refInv: true,
        poa1: false,
        poa2: false,
        ghi: false,
      });
    } else if (preset === 'plant') {
      setSelectedCurves({
        inv1: false,
        inv2: false,
        totalMt: true,
        refTotal: true,
        refInv: false,
        poa1: false,
        poa2: false,
        ghi: false,
      });
    } else if (preset === 'irradiance') {
      setSelectedCurves({
        inv1: false,
        inv2: false,
        totalMt: false,
        refTotal: false,
        refInv: false,
        poa1: true,
        poa2: true,
        ghi: true,
      });
    }
  };

  const labels = dailyProfile.map((d) => d.timeString);
  const idealData = dailyProfile.map((d) => parseFloat(d.idealPowerKw.toFixed(2)));
  const idealInvData = dailyProfile.map((d) =>
    parseFloat((d.idealInvPowerKw ?? d.idealPowerKw / 2).toFixed(2))
  );
  const realData = dailyProfile.map((d) => parseFloat(d.realPowerKw.toFixed(2)));
  const inv1Data = dailyProfile.map((d) => parseFloat(d.inv1PowerKw.toFixed(2)));
  const inv2Data = dailyProfile.map((d) => parseFloat(d.inv2PowerKw.toFixed(2)));

  const ghiData = dailyProfile.map((d) => parseFloat(d.ghi.toFixed(1)));
  const poa1Data = dailyProfile.map((d) => parseFloat(d.poa1.toFixed(1)));
  const poa2Data = dailyProfile.map((d) => parseFloat(d.poa2.toFixed(1)));
  const poaIdealData = dailyProfile.map((d) => parseFloat(d.poaIdeal.toFixed(1)));

  // Current time formatted
  const currentFormatted = formatTime(currentTime);
  const currentIndex = dailyProfile.findIndex(
    (d) => Math.abs(d.hour - currentTime) < 0.15
  );

  const curInv1 = currentIndex >= 0 ? inv1Data[currentIndex] : 0;
  const curInv2 = currentIndex >= 0 ? inv2Data[currentIndex] : 0;
  const curTotal = currentIndex >= 0 ? realData[currentIndex] : 0;
  const curIdeal = currentIndex >= 0 ? idealData[currentIndex] : 0;
  const curIdealInv = currentIndex >= 0 ? idealInvData[currentIndex] : 0;
  const curGhi = currentIndex >= 0 ? ghiData[currentIndex] : 0;
  const curPoa1 = currentIndex >= 0 ? poa1Data[currentIndex] : 0;
  const curPoa2 = currentIndex >= 0 ? poa2Data[currentIndex] : 0;
  const curPoaIdeal = currentIndex >= 0 ? poaIdealData[currentIndex] : 0;

  // Track active axis requirements
  const hasPower =
    selectedCurves.inv1 ||
    selectedCurves.inv2 ||
    selectedCurves.totalMt ||
    selectedCurves.refTotal ||
    selectedCurves.refInv;
  const hasIrradiance =
    selectedCurves.poa1 || selectedCurves.poa2 || selectedCurves.ghi;

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const datasets: any[] = [];

    // Dataset 1: Total Geração Real MT
    if (selectedCurves.totalMt) {
      datasets.push({
        id: 'totalMt',
        label: 'Potência Total Injetada na MT (Real)',
        data: realData,
        yAxisID: hasPower ? 'y' : 'y',
        borderColor: tracker1Stuck ? '#e11d48' : '#059669',
        backgroundColor: tracker1Stuck
          ? 'rgba(225, 29, 72, 0.08)'
          : 'rgba(5, 150, 105, 0.10)',
        borderWidth: 3,
        tension: 0.35,
        fill: !hasIrradiance,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 6 : 0),
        pointBackgroundColor: '#ffffff',
        pointBorderColor: tracker1Stuck ? '#e11d48' : '#059669',
        pointBorderWidth: 3,
        pointHoverRadius: 6,
        order: 1,
      });
    }

    // Dataset 2: Inversor 1 (Laranja / Amarelo)
    if (selectedCurves.inv1) {
      const inv1Label = tracker1Stuck
        ? `Inversor 1 (Tracker 1 · 10 Strings [${10 - disconnectedStringsInv1}/10 ativas] · Falha às ${formatTime(tracker1FailureHour)}h)`
        : `Inversor 1 (Tracker 1 · 10 Strings [${10 - disconnectedStringsInv1}/10 ativas])`;

      datasets.push({
        id: 'inv1',
        label: inv1Label,
        data: inv1Data,
        yAxisID: hasPower ? 'y' : 'y',
        borderColor: tracker1Stuck ? '#e11d48' : '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.06)',
        borderWidth: 2.4,
        tension: 0.35,
        fill: false,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 5 : 0),
        pointBackgroundColor: tracker1Stuck ? '#e11d48' : '#d97706',
        pointHoverRadius: 5.5,
        order: 2,
      });
    }

    // Dataset 3: Inversor 2 (Azul / Ciano)
    if (selectedCurves.inv2) {
      const inv2Label = `Inversor 2 (Tracker 2 · 10 Strings [${10 - disconnectedStringsInv2}/10 ativas] · Nominal)`;

      datasets.push({
        id: 'inv2',
        label: inv2Label,
        data: inv2Data,
        yAxisID: hasPower ? 'y' : 'y',
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.06)',
        borderWidth: 2.4,
        tension: 0.35,
        fill: false,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 5 : 0),
        pointBackgroundColor: '#0284c7',
        pointHoverRadius: 5.5,
        order: 3,
      });
    }

    // Dataset 4: Referência Ideal Usina Total (50 kW)
    if (selectedCurves.refTotal) {
      datasets.push({
        id: 'refTotal',
        label: 'Referência Ideal Usina Total (100% Tracking)',
        data: idealData,
        yAxisID: hasPower ? 'y' : 'y',
        borderColor: '#64748b',
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        order: 4,
      });
    }

    // Dataset 5: Referência Individual por Inversor (25 kW)
    if (selectedCurves.refInv) {
      datasets.push({
        id: 'refInv',
        label: 'Referência Individual por Inversor (25 kW nominal)',
        data: idealInvData,
        yAxisID: hasPower ? 'y' : 'y',
        borderColor: '#8b5cf6',
        borderWidth: 1.8,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        order: 5,
      });
    }

    // Dataset 6: POA Tracker 2 (Nominal)
    if (selectedCurves.poa2) {
      datasets.push({
        id: 'poa2',
        label: 'POA Tracker 2 (Irradiância Módulos 2 · W/m²)',
        data: poa2Data,
        yAxisID: hasPower ? 'y1' : 'y',
        borderColor: '#0284c7',
        borderWidth: 2.2,
        tension: 0.35,
        fill: false,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 5 : 0),
        pointBackgroundColor: '#0284c7',
        pointHoverRadius: 5.5,
        order: 6,
      });
    }

    // Dataset 7: POA Tracker 1 (Real)
    if (selectedCurves.poa1) {
      datasets.push({
        id: 'poa1',
        label: tracker1Stuck
          ? 'POA Tracker 1 (Módulos 1 · TRAVADO/FALHA · W/m²)'
          : 'POA Tracker 1 (Irradiância Módulos 1 · W/m²)',
        data: poa1Data,
        yAxisID: hasPower ? 'y1' : 'y',
        borderColor: tracker1Stuck ? '#e11d48' : '#b45309',
        borderWidth: 2.2,
        tension: 0.35,
        fill: false,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 5 : 0),
        pointBackgroundColor: tracker1Stuck ? '#e11d48' : '#b45309',
        pointHoverRadius: 5.5,
        order: 7,
      });
    }

    // Dataset 8: GHI Solo (Horizontal)
    if (selectedCurves.ghi) {
      datasets.push({
        id: 'ghi',
        label: 'GHI (Irradiância Global Horizontal no Solo · W/m²)',
        data: ghiData,
        yAxisID: hasPower ? 'y1' : 'y',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.35,
        fill: !hasPower,
        pointRadius: (ctx: any) => (ctx.dataIndex === currentIndex ? 5 : 0),
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f59e0b',
        pointBorderWidth: 2,
        pointHoverRadius: 5.5,
        order: 8,
      });
    }

    // Build scale configuration based on active domains
    const scales: any = {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { family: 'monospace', size: 10 },
          maxRotation: 0,
          callback: (val: any, index: number) =>
            index % 4 === 0 ? labels[index] : '',
        },
      },
    };

    if (hasPower && hasIrradiance) {
      // DUAL Y-AXIS
      scales.y = {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Potência Elétrica (kW)',
          color: '#059669',
          font: { family: 'monospace', size: 11, weight: 'bold' },
        },
        grid: { color: '#f1f5f9' },
        ticks: { color: '#059669', font: { family: 'monospace', size: 10 } },
        min: 0,
        max: 60,
      };
      scales.y1 = {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Irradiância Solar POA / GHI (W/m²)',
          color: '#d97706',
          font: { family: 'monospace', size: 11, weight: 'bold' },
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#d97706', font: { family: 'monospace', size: 10 } },
        min: 0,
        max: 1100,
      };
    } else if (hasPower) {
      // SINGLE Y-AXIS POWER
      scales.y = {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Potência Entregue MT (kW)',
          color: '#475569',
          font: { family: 'monospace', size: 11, weight: 'bold' },
        },
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } },
        min: 0,
        max: 60,
      };
    } else {
      // SINGLE Y-AXIS IRRADIANCE
      scales.y = {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Irradiância Solar (W/m²)',
          color: '#d97706',
          font: { family: 'monospace', size: 11, weight: 'bold' },
        },
        grid: { color: '#f1f5f9' },
        ticks: { color: '#d97706', font: { family: 'monospace', size: 10 } },
        min: 0,
        max: 1100,
      };
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // We use rich interactive custom HTML pill controls below & above
          },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            titleFont: { family: 'monospace', size: 12, weight: 'bold' },
            bodyFont: { family: 'monospace', size: 11 },
            padding: 10,
            callbacks: {
              title: (items) => `Horário da Simulação: ${items[0].label}h`,
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                const isIrradiance = label.includes('W/m²') || label.includes('POA') || label.includes('GHI');
                const unit = isIrradiance ? 'W/m²' : 'kW';
                return ` ${label}: ${val.toFixed(1)} ${unit}`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const lines: string[] = [];
                const real = realData[idx];
                const ideal = idealData[idx];
                const inv1 = inv1Data[idx];
                const inv2 = inv2Data[idx];
                const invRef = idealInvData[idx];
                const ghi = ghiData[idx];
                const poa2 = poa2Data[idx];
                const poa1 = poa1Data[idx];

                // Check difference between inverters and individual reference
                if (selectedCurves.inv1 || selectedCurves.inv2) {
                  const d1 = (inv1 - invRef).toFixed(1);
                  const d2 = (inv2 - invRef).toFixed(1);
                  lines.push(` ──────── Inversores (10 strings cada) ────────`);
                  lines.push(` • Inversor 1 (${10 - disconnectedStringsInv1}/10 strings): ${inv1.toFixed(1)} kW (${Number(d1) >= 0 ? '+' : ''}${d1} kW vs ref)`);
                  lines.push(` • Inversor 2 (${10 - disconnectedStringsInv2}/10 strings): ${inv2.toFixed(1)} kW (${Number(d2) >= 0 ? '+' : ''}${d2} kW vs ref)`);
                  if (tracker1Stuck) {
                    const isStuckNow = dailyProfile[idx]?.isTracker1StuckAtThisHour;
                    lines.push(` • Tracker 1: ${isStuckNow ? `TRAVADO em ${tracker1StuckAngle}° (falha após ${formatTime(tracker1FailureHour)}h)` : `Normal (antes das ${formatTime(tracker1FailureHour)}h)`}`);
                  }
                  if (Math.abs(inv2 - inv1) > 0.3) {
                    lines.push(` ⚠ Desvio entre Inversores: ${(inv2 - inv1).toFixed(1)} kW`);
                  }
                }

                // Check plant total difference vs reference
                if (selectedCurves.totalMt && selectedCurves.refTotal) {
                  const loss = ideal - real;
                  if (loss > 0.1) {
                    lines.push(` ──────── Usina Total vs Referência ────────`);
                    lines.push(` ⚠ Perda Total MT: -${loss.toFixed(2)} kW (-${((loss / ideal) * 100).toFixed(1)}%)`);
                  }
                }

                // Check irradiance differences
                if (selectedCurves.poa2 || selectedCurves.ghi || selectedCurves.poa1) {
                  lines.push(` ──────── Irradiância: POA vs GHI ────────`);
                  if (ghi > 20 && poa2 > ghi) {
                    const gain = (((poa2 - ghi) / ghi) * 100).toFixed(1);
                    lines.push(` ✦ Ganho Tracker 2 (POA vs Solo GHI): +${gain}% (+${(poa2 - ghi).toFixed(0)} W/m²)`);
                  }
                  if (tracker1Stuck && poa2 > poa1 + 5) {
                    lines.push(` ⚠ Perda Óptica Tracker 1 Travado: -${(poa2 - poa1).toFixed(0)} W/m²`);
                  }
                }

                return lines;
              },
            },
          },
        },
        scales,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [
    dailyProfile,
    tracker1Stuck,
    tracker1StuckAngle,
    currentIndex,
    selectedCurves,
    hasPower,
    hasIrradiance,
  ]);

  // Delta calculations for instantaneous strip
  const deltaInv1 = curInv1 - curIdealInv;
  const deltaInv2 = curInv2 - curIdealInv;
  const deltaTotal = curTotal - curIdeal;
  const trackerGainPercent =
    curGhi > 10 && curPoa2 >= curGhi
      ? (((curPoa2 - curGhi) / curGhi) * 100).toFixed(0)
      : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-slate-800">
      {/* Header with Title and Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Curva de Geração Diária e Irradiância (06:00 às 18:00) · Chart.js
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione individualmente os inversores, potência total, POA e GHI para comparar as diferenças com a referência teórica
          </p>
        </div>

        {/* Quick Presets Filter & Simulation Actions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 mr-1">
            {onOpenStringModal && (
              <button
                type="button"
                onClick={onOpenStringModal}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                title="Simular desligamento de strings nos inversores"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Desligar Strings ({20 - disconnectedStringsInv1 - disconnectedStringsInv2}/20 Ativas)...</span>
              </button>
            )}
            {onOpenTrackerFailureModal && (
              <button
                type="button"
                onClick={onOpenTrackerFailureModal}
                className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition ${
                  tracker1Stuck
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
                title="Definir horário e ângulo de falha do tracker 1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {tracker1Stuck ? `Falha T1 às ${formatTime(tracker1FailureHour)}h...` : 'Simular Falha Tracker...'}
                </span>
              </button>
            )}
          </div>

          <span className="text-slate-400">|</span>

          <span className="text-slate-600 text-[11px] font-semibold flex items-center gap-1 mx-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Vistas:
          </span>
          <button
            onClick={() => applyPreset('all')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 transition"
          >
            Todas
          </button>
          <button
            onClick={() => applyPreset('inverters')}
            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-300 transition"
          >
            Inversores 1 & 2
          </button>
          <button
            onClick={() => applyPreset('plant')}
            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 transition"
          >
            Usina MT
          </button>
          <button
            onClick={() => applyPreset('irradiance')}
            className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-300 transition"
          >
            POA vs GHI
          </button>
        </div>
      </div>

      {/* Instantaneous Values Strip for Current Hour with Values & Reference Deltas */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Horário:</span>
          <strong className="text-amber-700">{currentFormatted}h</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Inv 1 */}
          <div className="px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>
              Inv 1: <strong>{curInv1.toFixed(1)} kW</strong>
            </span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                deltaInv1 >= -0.3
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {deltaInv1 >= 0 ? '+' : ''}
              {deltaInv1.toFixed(1)} kW
            </span>
          </div>

          {/* Inv 2 */}
          <div className="px-2.5 py-1 rounded bg-cyan-50 border border-cyan-300 text-cyan-900 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>
              Inv 2: <strong>{curInv2.toFixed(1)} kW</strong>
            </span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                deltaInv2 >= -0.3
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {deltaInv2 >= 0 ? '+' : ''}
              {deltaInv2.toFixed(1)} kW
            </span>
          </div>

          {/* Total MT */}
          <div className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>
              Total MT: <strong>{curTotal.toFixed(1)} kW</strong>
            </span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                deltaTotal >= -0.5
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {deltaTotal >= 0 ? '+' : ''}
              {deltaTotal.toFixed(1)} kW vs Ref
            </span>
          </div>

          {/* POA Tracker 2 & GHI */}
          <div className="px-2.5 py-1 rounded bg-sky-50 border border-sky-300 text-sky-900 flex items-center gap-1.5 shadow-xs">
            <SunMedium className="w-3.5 h-3.5 text-sky-600" />
            <span>
              POA T2: <strong>{Math.round(curPoa2)} W/m²</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span>
              GHI: <strong>{Math.round(curGhi)} W/m²</strong>
            </span>
            {trackerGainPercent && (
              <span className="bg-amber-200 text-amber-950 font-bold px-1 rounded text-[10px]">
                +{trackerGainPercent}% Ganho
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Selection Bar: Clickable Buttons for Each Inverter, Curve, and Reference */}
      <div className="mb-3 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Clique nos botões para Selecionar / Ocultar Inversores e Irradiâncias:</span>
          </div>
          <span className="text-[11px] text-slate-600">
            {hasPower && hasIrradiance
              ? '⚡ Eixo Duplo Ativo: Potência (kW) à Esquerda · Irradiância (W/m²) à Direita'
              : hasPower
              ? '⚡ Eixo Potência MT (kW)'
              : '☀️ Eixo Irradiância Solar (W/m²)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* 1. Inversor 1 */}
          <button
            onClick={() => toggleCurve('inv1')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.inv1
                ? 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Inversor 1
              </span>
              {selectedCurves.inv1 ? (
                <Check className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{curInv1.toFixed(1)} kW</span>
              <span className="text-[9px] text-amber-700 font-semibold">{10 - disconnectedStringsInv1}/10 Strings</span>
            </div>
          </button>

          {/* 2. Inversor 2 */}
          <button
            onClick={() => toggleCurve('inv2')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.inv2
                ? 'bg-sky-500/10 border-sky-500 text-sky-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                Inversor 2
              </span>
              {selectedCurves.inv2 ? (
                <Check className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{curInv2.toFixed(1)} kW</span>
              <span className="text-[9px] text-sky-700 font-semibold">{10 - disconnectedStringsInv2}/10 Strings</span>
            </div>
          </button>

          {/* 3. Total MT */}
          <button
            onClick={() => toggleCurve('totalMt')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.totalMt
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                Total MT
              </span>
              {selectedCurves.totalMt ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{curTotal.toFixed(1)} kW</span>
              <span className="text-[9px] text-emerald-700 font-semibold">13.8 kV</span>
            </div>
          </button>

          {/* 4. Referência Usina Total */}
          <button
            onClick={() => toggleCurve('refTotal')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.refTotal
                ? 'bg-slate-200 border-slate-500 text-slate-900 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-1 border-b-2 border-dashed border-slate-600 inline-block"></span>
                Ref. Usina
              </span>
              {selectedCurves.refTotal ? (
                <Check className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{curIdeal.toFixed(1)} kW</span>
              <span className="text-[9px] text-slate-600 font-semibold">100%</span>
            </div>
          </button>

          {/* 5. Referência por Inversor */}
          <button
            onClick={() => toggleCurve('refInv')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.refInv
                ? 'bg-purple-500/10 border-purple-500 text-purple-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-1 border-b-2 border-dashed border-purple-600 inline-block"></span>
                Ref. Inversor
              </span>
              {selectedCurves.refInv ? (
                <Check className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{curIdealInv.toFixed(1)} kW</span>
              <span className="text-[9px] text-purple-700 font-semibold">25kW</span>
            </div>
          </button>

          {/* 6. POA Tracker 1 */}
          <button
            onClick={() => toggleCurve('poa1')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.poa1
                ? tracker1Stuck
                  ? 'bg-rose-500/10 border-rose-500 text-rose-950 shadow-xs'
                  : 'bg-amber-600/10 border-amber-600 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${
                    tracker1Stuck ? 'bg-rose-600' : 'bg-amber-700'
                  }`}
                ></span>
                POA T1
              </span>
              {selectedCurves.poa1 ? (
                <Check className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{Math.round(curPoa1)} W/m²</span>
              <span className="text-[9px] text-slate-500">Mód. 1</span>
            </div>
          </button>

          {/* 7. POA Tracker 2 */}
          <button
            onClick={() => toggleCurve('poa2')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.poa2
                ? 'bg-sky-600/10 border-sky-600 text-sky-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
                POA T2
              </span>
              {selectedCurves.poa2 ? (
                <Check className="w-3.5 h-3.5 text-sky-700" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{Math.round(curPoa2)} W/m²</span>
              <span className="text-[9px] text-slate-500">Mód. 2</span>
            </div>
          </button>

          {/* 8. GHI Solo */}
          <button
            onClick={() => toggleCurve('ghi')}
            className={`px-2 py-1.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
              selectedCurves.ghi
                ? 'bg-amber-400/15 border-amber-500 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                GHI Solo
              </span>
              {selectedCurves.ghi ? (
                <Check className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <span className="w-3.5 h-3.5 border border-slate-300 rounded inline-block"></span>
              )}
            </div>
            <div className="font-mono text-[11px] flex items-center justify-between">
              <span className="font-bold">{Math.round(curGhi)} W/m²</span>
              <span className="text-[9px] text-slate-500">Solo</span>
            </div>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-84 w-full relative">
        <canvas ref={canvasRef} id="dailySolarChart" />
      </div>

      {/* Interactive Bottom Legend Strip (clicking items toggles visibility directly) */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-2 font-semibold">
          <span className="text-slate-600 text-[10px] uppercase font-bold mr-1">
            Legenda Interativa:
          </span>

          {/* Inversor 1 Pill */}
          <button
            onClick={() => toggleCurve('inv1')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.inv1
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-1 bg-amber-600 rounded-full inline-block"></span>
            <span>Inversor 1 (Laranja)</span>
          </button>

          {/* Inversor 2 Pill */}
          <button
            onClick={() => toggleCurve('inv2')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.inv2
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-1 bg-sky-600 rounded-full inline-block"></span>
            <span>Inversor 2 (Azul)</span>
          </button>

          {/* Total MT Pill */}
          <button
            onClick={() => toggleCurve('totalMt')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.totalMt
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-1 bg-emerald-600 rounded-full inline-block"></span>
            <span>Curva Total Injetada MT</span>
          </button>

          {/* Referência Ideal Usina */}
          <button
            onClick={() => toggleCurve('refTotal')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.refTotal
                ? 'bg-slate-100 border-slate-400 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-slate-600 border-dashed inline-block"></span>
            <span>Referência Ideal Usina</span>
          </button>

          {/* POA Tracker 2 */}
          <button
            onClick={() => toggleCurve('poa2')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.poa2
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-1 bg-sky-600 rounded-full inline-block"></span>
            <span>POA Tracker 2 (W/m²)</span>
          </button>

          {/* GHI Solo */}
          <button
            onClick={() => toggleCurve('ghi')}
            className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition border ${
              selectedCurves.ghi
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 line-through opacity-70'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-amber-500 border-dashed inline-block"></span>
            <span>GHI Solo (W/m²)</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-slate-600 font-mono">
          <Eye className="w-3 h-3 text-slate-500" />
          <span>Dica: Clique nos botões acima ou na legenda para isolar curvas.</span>
        </div>
      </div>
    </div>
  );
};

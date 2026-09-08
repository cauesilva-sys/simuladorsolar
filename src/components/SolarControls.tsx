import React, { useEffect, useRef } from 'react';
import { Sun, Play, Pause, FastForward, Clock, Compass, CloudSun } from 'lucide-react';
import { SolarParameters } from '../types';
import { formatTime } from '../utils/solarMath';

interface SolarControlsProps {
  solar: SolarParameters;
  tracker1Poa?: number;
  tracker2Poa?: number;
  tracker1Stuck?: boolean;
  onTimeChange: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const SolarControls: React.FC<SolarControlsProps> = ({
  solar,
  tracker1Poa = 0,
  tracker2Poa = 0,
  tracker1Stuck = false,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
}) => {
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(performance.now());

  // Animation loop when playing
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (time: number) => {
      const deltaSec = (time - lastTickRef.current) / 1000;
      lastTickRef.current = time;

      // 1 real second = 0.5 hour at 1x speed
      const hourStep = deltaSec * 0.4 * playbackSpeed;
      
      let nextHour = solar.timeHour + hourStep;
      if (nextHour > 18) {
        nextHour = 6.0; // Loop back to sunrise
      }
      onTimeChange(nextHour);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, solar.timeHour, onTimeChange]);

  // Sun visual coordinates on celestial hemisphere (arc from 6h to 18h)
  const normalizedTime = (solar.timeHour - 6) / 12; // 0 to 1
  const sunXPercent = 10 + normalizedTime * 80;
  const sunYPercent = 85 - Math.sin(normalizedTime * Math.PI) * 70;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Main Slider & Play controls */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Controle de Horário Solar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-amber-600">
                {formatTime(solar.timeHour)}
              </span>
              <span className="text-xs text-slate-500">h (06:00 - 18:00)</span>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-1">
            <input
              type="range"
              min="6"
              max="18"
              step="0.05"
              value={solar.timeHour}
              onChange={(e) => onTimeChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>06:00 (Nascer)</span>
              <span>09:00</span>
              <span className="font-bold text-amber-700">12:00 (Zênite)</span>
              <span>15:00</span>
              <span>18:00 (Pôr do Sol)</span>
            </div>
          </div>

          {/* Playback & presets bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Animar Dia</span>
                  </>
                )}
              </button>

              {/* Speed toggle */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-300 text-xs">
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded ${
                      playbackSpeed === speed
                        ? 'bg-white shadow-xs text-amber-700 font-bold border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Quick time presets */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Saltar para:</span>
              {[
                { label: '06h', val: 6.0 },
                { label: '09h', val: 9.0 },
                { label: '12h', val: 12.0 },
                { label: '15h', val: 15.0 },
                { label: '18h', val: 18.0 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onTimeChange(preset.val)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition border ${
                    Math.abs(solar.timeHour - preset.val) < 0.25
                      ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Solar Sun Position & Irradiance Badge */}
        <div className="lg:w-96 bg-slate-50 border border-slate-200 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
          {/* Mini Celestial Dome Vector */}
          <div className="h-14 relative border-b border-slate-200 mb-2">
            {/* Sky dome arc */}
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d="M 10 38 Q 50 2 90 38"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <line x1="50" y1="2" x2="50" y2="38" stroke="#e2e8f0" strokeWidth="1" />
            </svg>

            {/* Moving Sun Icon */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex items-center justify-center"
              style={{
                left: `${sunXPercent}%`,
                top: `${sunYPercent * 0.45}%`,
              }}
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md shadow-amber-400/40 animate-pulse">
                <Sun className="w-4 h-4 text-slate-950" />
              </div>
            </div>

            <span className="absolute bottom-0.5 left-2 text-[10px] text-slate-500 font-mono">Leste (E)</span>
            <span className="absolute bottom-0.5 right-2 text-[10px] text-slate-500 font-mono">Oeste (W)</span>
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">Norte</span>
          </div>

          {/* Numerical Values: Solar Angles & GHI */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1 mb-2">
            <div className="bg-white rounded p-1.5 border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Compass className="w-3 h-3 text-sky-600" />
                <span>Ângulo Sol</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                {solar.sunAngle > 0 ? `+${solar.sunAngle.toFixed(1)}°` : `${solar.sunAngle.toFixed(1)}°`}
              </div>
              <div className="text-[9px] text-slate-500">
                {solar.sunAngle < -1 ? 'Leste' : solar.sunAngle > 1 ? 'Oeste' : 'Zênite'}
              </div>
            </div>

            <div className="bg-white rounded p-1.5 border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-amber-600" />
                <span>Elevação</span>
              </div>
              <div className="text-sm font-bold font-mono text-amber-700 mt-0.5">
                {solar.sunElevation.toFixed(1)}°
              </div>
              <div className="text-[9px] text-slate-500">acima horiz.</div>
            </div>

            <div className="bg-white rounded p-1.5 border border-amber-300 shadow-xs bg-amber-50/40">
              <div className="text-[10px] text-amber-800 font-bold flex items-center justify-center gap-1">
                <CloudSun className="w-3 h-3 text-amber-600" />
                <span>GHI (Solo)</span>
              </div>
              <div className="text-sm font-extrabold font-mono text-amber-700 mt-0.5">
                {Math.round(solar.ghi)}
              </div>
              <div className="text-[9px] text-slate-500">W/m² horiz.</div>
            </div>
          </div>

          {/* POA Irradiance Strip (Plane of Array) */}
          <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Irradiância no Plano dos Módulos (POA)
              </span>
              {solar.ghi > 10 && tracker2Poa > solar.ghi && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  +{(((tracker2Poa - solar.ghi) / solar.ghi) * 100).toFixed(0)}% ganho tracking
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className={`p-1.5 rounded border ${tracker1Stuck ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>POA Tracker 1</span>
                  {tracker1Stuck && <span className="text-[9px] text-amber-800 font-bold">(Falha)</span>}
                </div>
                <div className="text-sm font-extrabold font-mono text-amber-800 mt-0.5">
                  {Math.round(tracker1Poa)} <span className="text-[10px] font-normal text-slate-500">W/m²</span>
                </div>
              </div>

              <div className="p-1.5 rounded border bg-sky-50/50 border-sky-200">
                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>POA Tracker 2</span>
                  <span className="text-[9px] text-sky-700 font-bold">(Normal)</span>
                </div>
                <div className="text-sm font-extrabold font-mono text-sky-700 mt-0.5">
                  {Math.round(tracker2Poa)} <span className="text-[10px] font-normal text-slate-500">W/m²</span>
                </div>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1 text-center">
              GHI: irradiação horizontal no solo · POA: irradiação incidente na face dos módulos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

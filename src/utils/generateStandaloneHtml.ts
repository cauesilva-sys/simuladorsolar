/**
 * Generates a completely self-contained single-file HTML application
 * containing CDN Tailwind, CDN Chart.js, and pure vanilla JavaScript logic
 * ready to run directly in any browser offline or online.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulador de Usina Fotovoltaica de Média Tensão (55 kWp · 13.8 kV)</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            solar: {
              50: '#fffbeb',
              500: '#f59e0b',
              600: '#d97706',
            }
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-fast {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .animate-pulse-fast {
      animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen font-sans antialiased selection:bg-amber-400 selection:text-slate-950">

  <!-- TOP HEADER WITH TABS -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-xs">
            ☀
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Simulador de Usina Fotovoltaica MT</h1>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                55 kWp · 13.8 kV
              </span>
            </div>
            <p class="text-xs text-slate-500">100 módulos 550W (10 strings) · 2 Trackers 1-eixo · 2 Inversores 30kW · Cabine MT 50/51</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div id="statusBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 border-emerald-300 text-emerald-800">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span id="statusBadgeText">Operação Normal em Rede MT</span>
          </div>
          <button onclick="resetSimulation()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium transition shadow-xs">
            Resetar Parâmetros
          </button>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200">
        <button id="tabBtnDashboard" onclick="switchTab('dashboard')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-xs">
          <span>📊 Aba 1: Dashboard e Geração</span>
        </button>
        <button id="tabBtnUnifilar" onclick="switchTab('unifilar')" class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300">
          <span>⚡ Aba 2: Diagrama Unifilar Interativo (SLD)</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Chaves NA / NF
          </span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 py-5 space-y-5">

    <!-- COMMON: TIME SLIDER & SOLAR CONDITIONS -->
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div class="flex-1 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🕒</span> Controle de Horário da Simulação
            </span>
            <div class="flex items-center gap-2">
              <span id="lblTimeDisplay" class="text-2xl font-bold font-mono text-amber-600">12:00</span>
              <span class="text-xs text-slate-500">h (06:00 às 18:00)</span>
            </div>
          </div>

          <div class="space-y-1">
            <input id="timeSlider" type="range" min="6" max="18" step="0.05" value="12" class="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            <div class="flex justify-between text-[11px] font-mono text-slate-500">
              <span>06:00 (Nascer)</span>
              <span>09:00</span>
              <span class="text-amber-600 font-bold">12:00 (Zênite)</span>
              <span>15:00</span>
              <span>18:00 (Pôr do Sol)</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
            <div class="flex items-center gap-2">
              <button id="btnPlay" onclick="togglePlay()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold flex items-center gap-1 shadow-xs">
                <span id="playIcon">▶</span> <span id="playText">Animar Dia</span>
              </button>
              <div class="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-300 text-[11px] font-mono">
                <button onclick="setSpeed(1)" id="btnSpeed1" class="px-2 py-0.5 rounded bg-white text-amber-700 shadow-xs font-bold">1x</button>
                <button onclick="setSpeed(2)" id="btnSpeed2" class="px-2 py-0.5 rounded text-slate-600">2x</button>
                <button onclick="setSpeed(4)" id="btnSpeed4" class="px-2 py-0.5 rounded text-slate-600">4x</button>
              </div>
            </div>

            <div class="flex items-center gap-1 font-mono text-[11px]">
              <span class="text-slate-500 mr-1 hidden sm:inline">Pular:</span>
              <button onclick="setTime(6)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs">06h</button>
              <button onclick="setTime(9)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs">09h</button>
              <button onclick="setTime(12)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs">12h</button>
              <button onclick="setTime(15)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs">15h</button>
              <button onclick="setTime(18)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs">18h</button>
            </div>
          </div>
        </div>

        <!-- Solar indicators box -->
        <div class="lg:w-80 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center grid grid-cols-3 gap-2 shadow-xs">
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 font-medium block">Ângulo Solar</span>
            <span id="lblSunAngle" class="text-sm font-bold font-mono text-amber-600">0.0°</span>
            <span id="lblSunDir" class="text-[9px] text-slate-400 block">Zênite</span>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 font-medium block">Elevação</span>
            <span id="lblSunElevation" class="text-sm font-bold font-mono text-sky-600">75.0°</span>
            <span class="text-[9px] text-slate-400 block">Horizonte</span>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-[10px] text-slate-500 font-medium block">GHI Horiz.</span>
            <span id="lblGhi" class="text-sm font-bold font-mono text-amber-500">1000</span>
            <span class="text-[9px] text-slate-400 block">W/m²</span>
          </div>
        </div>

      </div>
    </div>

    <!-- COMMON: CORE KPIS DASHBOARD (Inversor 1 Laranja, Inversor 2 Azul, MT Verde) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Inversor 1 (Laranja / Amarelo) -->
      <div class="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Geração Inversor 1
          </span>
          <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            Strings 1-5 (30 kW)
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="kpiInv1" class="text-3xl font-mono font-extrabold text-amber-600">26.1</span>
          <span class="text-sm font-semibold text-slate-500">kW CA</span>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-mono">
          <span>CC: <span id="lblInv1Dc" class="text-amber-700 font-semibold">26.6 kW</span></span>
          <span>I_BT: <span id="lblInv1Current" class="text-slate-800 font-semibold">39.6 A</span></span>
          <span>η: <span class="text-emerald-700 font-semibold">98.2%</span></span>
        </div>
      </div>

      <!-- Inversor 2 (Azul / Ciano) -->
      <div class="bg-white border border-sky-200 rounded-xl p-4 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Geração Inversor 2
          </span>
          <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
            Strings 6-10 (30 kW)
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="kpiInv2" class="text-3xl font-mono font-extrabold text-sky-600">26.1</span>
          <span class="text-sm font-semibold text-slate-500">kW CA</span>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-mono">
          <span>CC: <span id="lblInv2Dc" class="text-sky-700 font-semibold">26.6 kW</span></span>
          <span>I_BT: <span id="lblInv2Current" class="text-slate-800 font-semibold">39.6 A</span></span>
          <span>η: <span class="text-emerald-700 font-semibold">98.2%</span></span>
        </div>
      </div>

      <!-- Potência MT Entregue (Verde Esmeralda) -->
      <div class="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            ⚡ Potência MT Entregue
          </span>
          <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            13.8 kV · 75 kVA
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="kpiMtPower" class="text-3xl font-mono font-extrabold text-emerald-600">51.4</span>
          <span class="text-sm font-semibold text-slate-500">kW</span>
          <span id="lblMtKva" class="text-xs font-mono text-slate-400 ml-auto">(52.4 kVA)</span>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-mono">
          <span>Corrente MT: <strong id="lblMtCurrent" class="text-emerald-700">2.19 A</strong></span>
          <span>Perdas Trafo: <span id="lblTrafoLoss" class="text-slate-700">0.78 kW</span></span>
        </div>
      </div>

      <!-- Perda por Desalinhamento -->
      <div id="cardLoss" class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 block">Perda por Desalinhamento</span>
        <div class="mt-2 flex items-baseline justify-between">
          <div class="flex items-baseline gap-1.5">
            <span id="kpiLossKw" class="text-3xl font-mono font-extrabold text-slate-800">0.0</span>
            <span class="text-sm font-semibold text-slate-500">kW</span>
          </div>
          <span id="kpiLossPct" class="text-sm font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">0.0%</span>
        </div>
        <div class="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-mono">
          <span>Ideal: <strong id="lblIdealPower" class="text-slate-800">51.4 kW</strong></span>
          <span>Delta Real</span>
        </div>
      </div>
    </div>

    <!-- RESOURCE STRIP: GHI vs POA -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs text-slate-700 font-mono">
      <div class="flex flex-wrap items-center gap-4 sm:gap-6">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
          <span class="text-slate-600 font-medium font-sans">GHI (Solo):</span>
          <span id="stripGhi" class="font-bold text-amber-700 text-sm">1000 W/m²</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
          <span class="text-slate-600 font-medium font-sans">POA Tracker 1:</span>
          <span id="stripPoa1" class="font-bold text-amber-800 text-sm">1000 W/m²</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
          <span class="text-slate-600 font-medium font-sans">POA Tracker 2:</span>
          <span id="stripPoa2" class="font-bold text-sky-700 text-sm">1000 W/m²</span>
        </div>
        <div id="stripGainBox" class="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans">
          <span class="font-semibold text-[11px]">Ganho Tracker:</span>
          <span id="stripGainText" class="font-bold font-mono text-xs">+0% vs GHI</span>
        </div>
      </div>
      <div class="text-[11px] text-slate-500 font-sans">
        GHI = irradiação no solo · POA = no plano inclinado dos módulos
      </div>
    </div>

    <!-- ==================== ABA 1: DASHBOARD E GERAÇÃO ==================== -->
    <div id="tabContentDashboard" class="space-y-5">
      <!-- TRACKER STATUS & FAILURE SIMULATION -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-700">
            Sistema de Tracking (Rastreadores de Eixo Único Leste-Oeste -60° a +60°)
          </h2>
          <span class="text-xs text-slate-500">Tracker 1: Strings 1-5 | Tracker 2: Strings 6-10</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Tracker 1 -->
          <div id="tracker1Card" class="p-4 rounded-xl border bg-white border-slate-200 shadow-xs transition-all">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Tracker 1</span>
                  <span id="t1Badge" class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-300">
                    RASTREANDO
                  </span>
                </h3>
                <p class="text-[11px] text-slate-500">Strings 1 a 5 (50 módulos · 27.5 kWp)</p>
              </div>
              <div id="t1AngleTag" class="text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                0.0°
              </div>
            </div>

            <!-- Rotating Visualizer -->
            <div class="h-24 bg-slate-50 rounded-lg p-2 flex items-center justify-center relative border border-slate-200 mb-3 overflow-hidden">
              <div class="absolute bottom-2 inset-x-4 h-0.5 bg-slate-200 flex justify-between text-[8px] font-mono text-slate-400">
                <span>-60° (Leste)</span>
                <span>N-S</span>
                <span>+60° (Oeste)</span>
              </div>
              <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-10 bg-slate-400 rounded-t"></div>
              <div id="t1VisualBar" class="w-44 h-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded transition-transform duration-200 border border-amber-400/50 flex justify-between px-1 shadow-xs">
                <div class="w-7 h-2 bg-amber-900 my-auto rounded-[1px]"></div>
                <div class="w-7 h-2 bg-amber-900 my-auto rounded-[1px]"></div>
                <div class="w-7 h-2 bg-amber-900 my-auto rounded-[1px]"></div>
                <div class="w-7 h-2 bg-amber-900 my-auto rounded-[1px]"></div>
                <div class="w-7 h-2 bg-amber-900 my-auto rounded-[1px]"></div>
              </div>
            </div>

            <!-- Sub values -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
              <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span class="text-[9px] text-slate-500 block font-medium">POA T1</span>
                <strong id="lblT1Poa" class="text-slate-800">1000</strong> <span class="text-slate-500 text-[10px]">W/m²</span>
              </div>
              <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span class="text-[9px] text-slate-500 block font-medium">Ideal</span>
                <strong id="lblT1Ideal" class="text-sky-700">0°</strong>
              </div>
              <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span class="text-[9px] text-slate-500 block font-medium">Perda Mec.</span>
                <strong id="lblT1Loss" class="text-slate-700">0.0%</strong>
              </div>
            </div>

            <!-- Tracker 1 Failure Button & Angle Slider -->
            <div class="pt-2 border-t border-slate-200 space-y-2">
              <button id="btnToggleFailure" onclick="toggleTracker1Failure()" class="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-xs">
                <span>⚠ Simular Falha no Tracker 1 (Travar Ângulo)</span>
              </button>
              <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span class="text-slate-600">Ângulo Travado:</span>
                <div class="flex items-center gap-2">
                  <input id="stuckAngleSlider" type="range" min="-60" max="60" step="5" value="-45" oninput="changeStuckAngle(this.value)" class="w-24 h-1.5 bg-slate-200 rounded accent-amber-500" />
                  <span id="lblStuckAngle" class="font-mono font-bold text-amber-700">-45°</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tracker 2 -->
          <div class="p-4 rounded-xl border bg-white border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Tracker 2</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 font-semibold border border-sky-300">
                      100% OPERACIONAL
                    </span>
                  </h3>
                  <p class="text-[11px] text-slate-500">Strings 6 a 10 (50 módulos · 27.5 kWp)</p>
                </div>
                <div id="t2AngleTag" class="text-sm font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                  0.0°
                </div>
              </div>

              <!-- Rotating Visualizer -->
              <div class="h-24 bg-slate-50 rounded-lg p-2 flex items-center justify-center relative border border-slate-200 mb-3 overflow-hidden">
                <div class="absolute bottom-2 inset-x-4 h-0.5 bg-slate-200 flex justify-between text-[8px] font-mono text-slate-400">
                  <span>-60° (Leste)</span>
                  <span>N-S</span>
                  <span>+60° (Oeste)</span>
                </div>
                <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-10 bg-slate-400 rounded-t"></div>
                <div id="t2VisualBar" class="w-44 h-3 bg-gradient-to-r from-sky-600 via-teal-400 to-sky-600 rounded transition-transform duration-200 border border-sky-400/50 flex justify-between px-1 shadow-xs">
                  <div class="w-7 h-2 bg-sky-900 my-auto rounded-[1px]"></div>
                  <div class="w-7 h-2 bg-sky-900 my-auto rounded-[1px]"></div>
                  <div class="w-7 h-2 bg-sky-900 my-auto rounded-[1px]"></div>
                  <div class="w-7 h-2 bg-sky-900 my-auto rounded-[1px]"></div>
                  <div class="w-7 h-2 bg-sky-900 my-auto rounded-[1px]"></div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-mono">
                <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span class="text-[9px] text-slate-500 block font-medium">POA T2</span>
                  <strong id="lblT2Poa" class="text-slate-800">1000</strong> <span class="text-slate-500 text-[10px]">W/m²</span>
                </div>
                <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span class="text-[9px] text-slate-500 block font-medium">Rastreamento</span>
                  <strong class="text-sky-700">Ativo</strong>
                </div>
                <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span class="text-[9px] text-slate-500 block font-medium">Perda Mec.</span>
                  <strong class="text-emerald-700">0.0%</strong>
                </div>
              </div>
            </div>

            <div class="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-slate-700">
              ✓ O Tracker 2 segue a trajetória astronômica exata do Sol (-60° a +60°), servindo de referência nominal.
            </div>
          </div>
        </div>
      </div>

      <!-- DAILY GENERATION CHART (CHART.JS) WITH INTERACTIVE SELECTION OF INVERTERS, TOTAL MT, REFERENCE, POA & GHI -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
          <div>
            <h2 id="lblChartTitle" class="text-xs font-bold uppercase tracking-wider text-slate-700">
              Curva de Geração Diária e Irradiância (06:00 às 18:00) · Chart.js
            </h2>
            <p id="lblChartSubtitle" class="text-[11px] text-slate-500">
              Selecione individualmente os inversores, potência total, POA e GHI para comparar as diferenças com a referência
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-[11px] font-semibold text-slate-500 mr-1">Vistas:</span>
            <button onclick="applyChartPreset('all')" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300">Todas (Dual)</button>
            <button onclick="applyChartPreset('inverters')" class="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-300">Inversores</button>
            <button onclick="applyChartPreset('plant')" class="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">Usina MT</button>
            <button onclick="applyChartPreset('irradiance')" class="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-300">POA vs GHI</button>
          </div>
        </div>

        <!-- Interactive Selection Bar -->
        <div class="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
          <div class="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Seletor de Curvas Interativo (Clique para Ativar/Ocultar):</span>
            <span id="chartAxisModeInfo" class="text-[10px] text-slate-500">Eixo Duplo Ativo</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-[11px] font-mono">
            <button id="btnTglInv1" onclick="toggleStandaloneCurve('inv1')" class="px-2 py-1 rounded border bg-amber-500/10 border-amber-500 text-amber-950 flex items-center justify-between font-bold">
              <span>● Inv 1</span> <span id="chipInv1Val">0 kW</span>
            </button>
            <button id="btnTglInv2" onclick="toggleStandaloneCurve('inv2')" class="px-2 py-1 rounded border bg-sky-500/10 border-sky-500 text-sky-950 flex items-center justify-between font-bold">
              <span>● Inv 2</span> <span id="chipInv2Val">0 kW</span>
            </button>
            <button id="btnTglTotalMt" onclick="toggleStandaloneCurve('totalMt')" class="px-2 py-1 rounded border bg-emerald-500/10 border-emerald-500 text-emerald-950 flex items-center justify-between font-bold">
              <span>● Total MT</span> <span id="chipTotalVal">0 kW</span>
            </button>
            <button id="btnTglRefTotal" onclick="toggleStandaloneCurve('refTotal')" class="px-2 py-1 rounded border bg-slate-200 border-slate-500 text-slate-900 flex items-center justify-between font-bold">
              <span>┄ Ref Usina</span> <span id="chipRefVal">0 kW</span>
            </button>
            <button id="btnTglRefInv" onclick="toggleStandaloneCurve('refInv')" class="px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between">
              <span>┄ Ref Inv</span> <span id="chipRefInvVal">0 kW</span>
            </button>
            <button id="btnTglPoa1" onclick="toggleStandaloneCurve('poa1')" class="px-2 py-1 rounded border bg-amber-600/10 border-amber-600 text-amber-950 flex items-center justify-between font-bold">
              <span>● POA T1</span> <span id="chipPoa1Val">0</span>
            </button>
            <button id="btnTglPoa2" onclick="toggleStandaloneCurve('poa2')" class="px-2 py-1 rounded border bg-sky-600/10 border-sky-600 text-sky-950 flex items-center justify-between font-bold">
              <span>● POA T2</span> <span id="chipPoa2Val">0</span>
            </button>
            <button id="btnTglGhi" onclick="toggleStandaloneCurve('ghi')" class="px-2 py-1 rounded border bg-amber-400/15 border-amber-500 text-amber-950 flex items-center justify-between font-bold">
              <span>● GHI Solo</span> <span id="chipGhiVal">0</span>
            </button>
          </div>
        </div>

        <div class="h-72 w-full">
          <canvas id="dailyChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- ==================== ABA 2: DIAGRAMA UNIFILAR INTERATIVO (SLD) ==================== -->
    <div id="tabContentUnifilar" class="space-y-5 hidden">
      
      <!-- ELECTRICAL SAFETY STANDARD BANNER (NR-10 / IEC / NBR 14039) -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span>⚡</span> Padrão de Segurança Elétrica (Subestações NBR 14039 / NR-10 / IEC 60947)
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Convenção internacional de sinalização em comandos de manobra de subestação:
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="energizeAll()" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold shadow-xs">
              ● Fechar Todas as Chaves (NF)
            </button>
            <button onclick="deenergizeAll()" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold shadow-xs">
              ○ Abrir Todas as Chaves (NA)
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <!-- VERMELHO -->
          <div class="p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-start gap-3">
            <span class="w-4 h-4 rounded-full bg-rose-600 flex-shrink-0 mt-0.5 shadow-xs"></span>
            <div>
              <strong class="text-rose-800 text-sm block">COR VERMELHA = CHAVE FECHADA (N/F) / ENERGIZADO</strong>
              <p class="text-slate-600 text-[11px] mt-0.5">
                Os contatos elétricos estão conectados. Há passagem de corrente e presença de alta/baixa tensão ativa. <strong>Atenção: circuito sob carga, perigo de choque!</strong>
              </p>
            </div>
          </div>

          <!-- VERDE -->
          <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-300 flex items-start gap-3">
            <span class="w-4 h-4 rounded-full bg-emerald-600 flex-shrink-0 mt-0.5 shadow-xs"></span>
            <div>
              <strong class="text-emerald-800 text-sm block">COR VERDE = CHAVE ABERTA (N/A) / DESENERGIZADO</strong>
              <p class="text-slate-600 text-[11px] mt-0.5">
                Os contatos elétricos estão separados (seccionados). O fluxo de potência é interrompido e a tensão cai para 0V. <strong>Seguro para intervenção e manutenção!</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN INTERACTIVE SLD BOARD -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800">
              Comutação Interativa de Chaves (Clique nos botões para manobrar)
            </h2>
            <p class="text-[11px] text-slate-500">Ao abrir qualquer chave, o circuito jusante é desenergizado e o medidor reflete a interrupção.</p>
          </div>
          <button id="btnRelayTripSLD" onclick="toggleRelayTrip()" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 text-xs font-bold shadow-xs">
            Simular Trip Relé 50/51
          </button>
        </div>

        <div class="overflow-x-auto pb-2">
          <div class="min-w-[980px] bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4 font-mono text-xs shadow-inner">
            
            <!-- STAGE LABELS -->
            <div class="grid grid-cols-5 gap-3 text-center text-[10px] font-bold">
              <div class="bg-white border border-slate-200 text-amber-800 py-1 rounded shadow-xs">1. CC (55 kWp)</div>
              <div class="bg-white border border-slate-200 text-sky-800 py-1 rounded shadow-xs">2. INVERSORES & QGBT</div>
              <div class="bg-white border border-slate-200 text-amber-800 py-1 rounded shadow-xs">3. TRAFO 75kVA</div>
              <div class="bg-white border border-slate-200 text-rose-800 py-1 rounded shadow-xs">4. CABINE MT & 50/51</div>
              <div class="bg-white border border-slate-200 text-emerald-800 py-1 rounded shadow-xs">5. MEDIÇÃO & REDE MT</div>
            </div>

            <!-- EQUIPMENT BLOCKS -->
            <div class="grid grid-cols-5 gap-4 items-stretch">
              
              <!-- COL 1: PV STRINGS & DC SWITCHES -->
              <div class="space-y-4 flex flex-col justify-between">
                <!-- String 1-5 -->
                <div id="sldBoxDc1" class="p-3 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-amber-800 mb-1">
                    <span>Strings 01 a 05</span>
                    <span class="text-[10px] text-slate-500 font-normal">27.5 kWp</span>
                  </div>
                  <div class="text-[11px] text-slate-700">P_cc: <strong id="sldPcc1" class="text-slate-900 font-bold">26.6 kW</strong></div>
                  
                  <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">Seccionadora CC 1:</span>
                    <button id="btnDc1" onclick="toggleDc1()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADA)
                    </button>
                  </div>
                  <div id="lblStatusDc1" class="mt-1 text-right text-[9px] text-rose-700 font-bold">● ENERGIZADO</div>
                </div>

                <!-- String 6-10 -->
                <div id="sldBoxDc2" class="p-3 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-sky-800 mb-1">
                    <span>Strings 06 a 10</span>
                    <span class="text-[10px] text-slate-500 font-normal">27.5 kWp</span>
                  </div>
                  <div class="text-[11px] text-slate-700">P_cc: <strong id="sldPcc2" class="text-slate-900 font-bold">26.6 kW</strong></div>

                  <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">Seccionadora CC 2:</span>
                    <button id="btnDc2" onclick="toggleDc2()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADA)
                    </button>
                  </div>
                  <div id="lblStatusDc2" class="mt-1 text-right text-[9px] text-rose-700 font-bold">● ENERGIZADO</div>
                </div>
              </div>

              <!-- COL 2: INVERTERS & QGBT BREAKERS -->
              <div class="space-y-4 flex flex-col justify-between">
                <!-- Inverter 1 & QGBT 1 -->
                <div id="sldBoxInv1" class="p-3 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-amber-800 mb-1">
                    <span>Inversor 01 (30kW)</span>
                    <span class="text-[9px] px-1 rounded bg-amber-50 text-amber-800 border border-amber-200">380V</span>
                  </div>
                  <div class="text-[11px] text-slate-700">Saída: <strong id="sldPca1" class="text-amber-700 font-bold">26.1 kW</strong></div>

                  <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">Disjuntor QGBT 1:</span>
                    <button id="btnQgbt1" onclick="toggleQgbt1()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADO)
                    </button>
                  </div>
                  <div id="lblStatusQgbt1" class="mt-1 text-right text-[9px] text-rose-700 font-bold">● ALIMENTANDO BT</div>
                </div>

                <!-- Inverter 2 & QGBT 2 -->
                <div id="sldBoxInv2" class="p-3 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-sky-800 mb-1">
                    <span>Inversor 02 (30kW)</span>
                    <span class="text-[9px] px-1 rounded bg-sky-50 text-sky-800 border border-sky-200">380V</span>
                  </div>
                  <div class="text-[11px] text-slate-700">Saída: <strong id="sldPca2" class="text-sky-700 font-bold">26.1 kW</strong></div>

                  <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">Disjuntor QGBT 2:</span>
                    <button id="btnQgbt2" onclick="toggleQgbt2()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADO)
                    </button>
                  </div>
                  <div id="lblStatusQgbt2" class="mt-1 text-right text-[9px] text-rose-700 font-bold">● ALIMENTANDO BT</div>
                </div>
              </div>

              <!-- COL 3: TRAFO 75kVA -->
              <div class="space-y-4 flex flex-col justify-between">
                <div id="sldBoxTrafo" class="p-3.5 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Trafo Elevador</span>
                    <span class="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded font-bold">75 kVA</span>
                  </div>

                  <div class="my-2 py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-2 border border-slate-200">
                    <span class="w-7 h-7 rounded-full border border-indigo-300 bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-700 font-bold shadow-xs">Δ 380V</span>
                    <span class="text-slate-400 text-[10px]">Dyn11</span>
                    <span class="w-7 h-7 rounded-full border border-amber-300 bg-amber-50 flex items-center justify-center text-[10px] text-amber-700 font-bold shadow-xs">Y 13.8kV</span>
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-[10px] text-slate-500">Seccionadora BT Trafo:</span>
                    <button id="btnTrafoBt" onclick="toggleTrafoBt()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADA)
                    </button>
                  </div>

                  <div class="mt-2 text-[11px] space-y-0.5">
                    <div class="flex justify-between text-slate-500"><span>Entrada BT:</span> <span id="sldTrafoIn" class="text-slate-800 font-bold">52.2 kW</span></div>
                    <div class="flex justify-between text-slate-500"><span>Saída MT:</span> <strong id="sldTrafoOut" class="text-emerald-700 font-bold">51.4 kW</strong></div>
                  </div>
                  <div id="lblStatusTrafo" class="mt-1 text-right text-[9px] text-rose-700 font-bold">● PRIMÁRIO & SECUNDÁRIO VIVOS</div>
                </div>

                <div class="p-2 rounded-lg bg-white border border-slate-200 text-center text-[10px] text-slate-600 shadow-xs">
                  Cabo MT: 3x (1x50mm²) XLPE 15kV
                </div>
              </div>

              <!-- COL 4: CABINE PRIMÁRIA & 50/51 -->
              <div class="space-y-4 flex flex-col justify-between">
                <div id="sldBoxCabine" class="p-3.5 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Cabine Primária MT</span>
                    <span class="text-[10px] px-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">13.8 kV</span>
                  </div>

                  <div class="my-2 p-2 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] text-slate-500">Seccionadora MT:</span>
                      <button id="btnCabineSec" onclick="toggleCabineSec()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                        NF (FECHADA)
                      </button>
                    </div>
                    <div class="flex justify-between pt-1 border-t border-slate-200">
                      <span class="text-[10px] text-slate-500">Relé 50/51:</span>
                      <span id="sldRelayStatus" class="text-[10px] font-bold text-emerald-700">NORMAL (ARMADO)</span>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-slate-500 block">Disjuntor MT 52:</span>
                      <span class="text-[9px] text-slate-400">Vácuo 630A</span>
                    </div>
                    <button id="btnBreakerMT" onclick="toggleBreakerMT()" class="px-2 py-1 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (FECHADO)
                    </button>
                  </div>
                  <div id="lblStatusCabine" class="mt-2 text-right text-[9px] text-rose-700 font-bold">● CONDUTORES MT ENERGIZADOS</div>
                </div>

                <div class="p-2 rounded-lg bg-white border border-slate-200 text-center text-[10px] text-slate-600 shadow-xs">
                  Transformador de Corrente (TC): 15/5A
                </div>
              </div>

              <!-- COL 5: CONCESSIONÁRIA & MEDIDOR -->
              <div class="space-y-4 flex flex-col justify-between">
                <div id="sldBoxGrid" class="p-3.5 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs">
                  <div class="flex justify-between font-bold text-emerald-800 mb-1">
                    <span>Medição & Entrega</span>
                    <span class="text-[10px] px-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">13.8 kV</span>
                  </div>

                  <div class="my-2 p-2 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] text-slate-500">Seccionadora Entrega:</span>
                      <button id="btnUtilSec" onclick="toggleUtilSec()" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                        NF (FECHADA)
                      </button>
                    </div>

                    <div class="p-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 flex justify-between font-bold">
                      <span>Medidor MT:</span>
                      <strong id="sldMeterPower" class="text-slate-900 font-extrabold">51.4 kW</strong>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-slate-500 block">Religador MT:</span>
                      <span class="text-[9px] text-slate-400">Rede Pública</span>
                    </div>
                    <button id="btnRecloser" onclick="toggleRecloser()" class="px-2 py-1 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                      NF (LIGADO)
                    </button>
                  </div>
                  <div id="lblStatusGrid" class="mt-2 text-right text-[9px] text-rose-700 font-bold">● INJETANDO NA REDE</div>
                </div>

                <div id="sldTagGrid" class="p-3 rounded-xl border text-center font-bold bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-200 shadow-xs">
                  REDE CONCESSIONÁRIA ENERGIZADA
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500 font-mono shadow-xs">
    Simulador de Usina Fotovoltaica de Média Tensão · 55 kWp · NBR 5410 & NBR 14039 · Padrão de Cores NR-10: Vermelho (NF/Energizado) e Verde (NA/Desenergizado)
  </footer>

  <!-- ==================== JAVASCRIPT SIMULATION LOGIC ==================== -->
  <script>
    // System Constant Specifications
    const TOTAL_MODULES = 100;
    const MODULE_WP = 550; // Wp
    const STRINGS_COUNT = 10;
    const MODULES_PER_STRING = 10;
    const TOTAL_KWP = (TOTAL_MODULES * MODULE_WP) / 1000; // 55 kWp
    const TRAFO_KVA = 75;
    const VOLTAGE_BT = 380; // V
    const VOLTAGE_MT = 13800; // V
    const POWER_FACTOR = 0.98;

    // Simulation State
    let currentTime = 12.0; // 06:00 to 18:00
    let isPlaying = false;
    let playSpeed = 1;
    let animInterval = null;

    let tracker1Stuck = false;
    let tracker1StuckAngle = -45;

    // Switchgear States (true = Fechado / NF / Energizado / Vermelho, false = Aberto / NA / Desenergizado / Verde)
    let switches = {
      dc1: true,
      dc2: true,
      qgbt1: true,
      qgbt2: true,
      trafoBt: true,
      cabineSec: true,
      breakerMT: true,
      relayTripped: false,
      utilSec: true,
      recloser: true,
    };

    let activeTab = 'dashboard';
    let chartInstance = null;
    let selectedCurves = {
      inv1: true,
      inv2: true,
      totalMt: true,
      refTotal: true,
      refInv: false,
      poa1: true,
      poa2: true,
      ghi: true,
    };

    // Solar Physics Math
    function getSolarPosition(time) {
      if (time < 6 || time > 18) return { sunAngle: 0, elevation: 0, ghi: 0 };
      const normalized = (time - 6) / 12; // 0 at 6h, 0.5 at 12h, 1 at 18h
      const sunAngle = (normalized - 0.5) * 180; // -90° to +90°
      const elevation = Math.max(0, 75 * Math.sin(normalized * Math.PI));
      const ghi = Math.max(0, 1000 * Math.sin(normalized * Math.PI));
      return { sunAngle, elevation, ghi };
    }

    function calculatePoa(ghi, sunAngle, trackerAngle, elevation = 60) {
      if (ghi <= 1) return 0;
      const misalignment = Math.abs(sunAngle - trackerAngle);
      const radIncidence = (misalignment * Math.PI) / 180;
      const sinElev = Math.sin((Math.max(2, elevation) * Math.PI) / 180);
      const diffuseFrac = 0.18;
      const diffHoriz = ghi * diffuseFrac;
      const dirHoriz = ghi * (1 - diffuseFrac);
      const dni = Math.min(1060, dirHoriz / Math.max(0.20, sinElev));
      const tiltRad = (Math.abs(trackerAngle) * Math.PI) / 180;
      const cosIncidence = Math.max(0, Math.cos(radIncidence));
      const poaDirect = dni * cosIncidence * Math.max(0.35, Math.pow(sinElev, 0.40));
      const skyDiffuse = diffHoriz * ((1 + Math.cos(tiltRad)) / 2);
      const groundReflected = ghi * 0.20 * ((1 - Math.cos(tiltRad)) / 2);
      return Math.max(0, poaDirect + skyDiffuse + groundReflected);
    }

    function computeMetrics(time) {
      const solar = getSolarPosition(time);

      // Tracker angles
      const idealAngle = Math.max(-60, Math.min(60, solar.sunAngle));
      const t1Angle = tracker1Stuck ? tracker1StuckAngle : idealAngle;
      const t2Angle = idealAngle;

      const t1Poa = calculatePoa(solar.ghi, solar.sunAngle, t1Angle, solar.elevation);
      const t2Poa = calculatePoa(solar.ghi, solar.sunAngle, t2Angle, solar.elevation);

      // Raw DC Generation (27.5 kWp each field with operational dispersion: Inv1 = 0.986, Inv2 = 1.003)
      const pNominalPerField = TOTAL_KWP / 2; // 27.5 kW
      const rawDc1 = pNominalPerField * (t1Poa / 1000) * 0.95 * 0.986;
      const rawDc2 = pNominalPerField * (t2Poa / 1000) * 0.95 * 1.003;

      // Electrical Continuity Chain
      const dc1Active = switches.dc1;
      const dc2Active = switches.dc2;

      const dc1ToInv = dc1Active ? rawDc1 : 0;
      const dc2ToInv = dc2Active ? rawDc2 : 0;

      // Inverters (30 kW limit, 98.2% eff)
      const inv1Ac = Math.min(30, dc1ToInv * 0.982);
      const inv2Ac = Math.min(30, dc2ToInv * 0.982);

      const qgbt1Active = dc1Active && switches.qgbt1;
      const qgbt2Active = dc2Active && switches.qgbt2;

      const btBusPower = (qgbt1Active ? inv1Ac : 0) + (qgbt2Active ? inv2Ac : 0);

      // Trafo BT -> MT
      const trafoActive = (qgbt1Active || qgbt2Active) && switches.trafoBt;
      const trafoLoss = trafoActive && btBusPower > 0 ? 0.35 + btBusPower * 0.008 : 0;
      const trafoMtOut = trafoActive ? Math.max(0, btBusPower - trafoLoss) : 0;

      // Cabine MT & Breaker 52 / Relay 50/51
      const cabineActive = trafoActive && switches.cabineSec && switches.breakerMT && !switches.relayTripped;

      // Concessionária & Recloser
      const gridActive = cabineActive && switches.utilSec && switches.recloser;
      const deliveredMtKw = gridActive ? trafoMtOut : 0;
      const deliveredMtKva = deliveredMtKw / POWER_FACTOR;
      const currentMtA = deliveredMtKva > 0 ? (deliveredMtKva * 1000) / (Math.sqrt(3) * VOLTAGE_MT) : 0;

      // Reference Ideal (100% Tracking & Full Continuity)
      const idealPoa = calculatePoa(solar.ghi, solar.sunAngle, idealAngle, solar.elevation);
      const idealDc = TOTAL_KWP * (idealPoa / 1000) * 0.95;
      const idealAc = idealDc * 0.982;
      const idealTrafoLoss = idealAc > 0 ? 0.35 + idealAc * 0.008 : 0;
      const idealDelivered = Math.max(0, idealAc - idealTrafoLoss);
      const idealInvDelivered = idealDelivered / 2;

      const misalignmentLoss = Math.max(0, idealDelivered - deliveredMtKw);
      const misalignmentPct = idealDelivered > 0.5 ? (misalignmentLoss / idealDelivered) * 100 : 0;

      return {
        solar,
        idealAngle,
        t1Angle,
        t2Angle,
        t1Poa,
        t2Poa,
        idealPoa,
        rawDc1,
        rawDc2,
        inv1Ac,
        inv2Ac,
        deliveredMtKw,
        deliveredMtKva,
        currentMtA,
        trafoLoss,
        idealDelivered,
        idealInvDelivered,
        misalignmentLoss,
        misalignmentPct,
        energization: {
          dc1: dc1Active,
          dc2: dc2Active,
          qgbt1: qgbt1Active,
          qgbt2: qgbt2Active,
          trafo: trafoActive,
          cabine: cabineActive,
          grid: gridActive,
        }
      };
    }

    // UI Updates
    function updateUI() {
      const m = computeMetrics(currentTime);

      // Time & Solar labels
      const hours = Math.floor(currentTime);
      const mins = Math.floor((currentTime - hours) * 60);
      const timeStr = \`\${String(hours).padStart(2, '0')}:\${String(mins).padStart(2, '0')}\`;
      document.getElementById('lblTimeDisplay').innerText = timeStr;
      document.getElementById('timeSlider').value = currentTime;

      document.getElementById('lblSunAngle').innerText = (m.solar.sunAngle > 0 ? '+' : '') + m.solar.sunAngle.toFixed(1) + '°';
      document.getElementById('lblSunElevation').innerText = m.solar.elevation.toFixed(1) + '°';
      document.getElementById('lblGhi').innerText = Math.round(m.solar.ghi);

      // Resource Strip
      const stripGhi = document.getElementById('stripGhi');
      const stripPoa1 = document.getElementById('stripPoa1');
      const stripPoa2 = document.getElementById('stripPoa2');
      const stripGainText = document.getElementById('stripGainText');
      if (stripGhi) stripGhi.innerText = Math.round(m.solar.ghi) + ' W/m²';
      if (stripPoa1) stripPoa1.innerText = Math.round(m.t1Poa) + ' W/m²';
      if (stripPoa2) stripPoa2.innerText = Math.round(m.t2Poa) + ' W/m²';
      if (stripGainText) {
        if (m.solar.ghi > 10 && m.t2Poa >= m.solar.ghi) {
          const gain = (((m.t2Poa - m.solar.ghi) / m.solar.ghi) * 100).toFixed(0);
          stripGainText.innerText = '+' + gain + '% vs GHI';
        } else {
          stripGainText.innerText = '0% vs GHI';
        }
      }

      // Status Badge
      const isAlarm = tracker1Stuck || !switches.breakerMT || !switches.recloser || switches.relayTripped || !m.energization.grid;
      const badge = document.getElementById('statusBadge');
      const badgeText = document.getElementById('statusBadgeText');
      if (isAlarm) {
        badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-amber-50 border-amber-300 text-amber-900 shadow-xs';
        badgeText.innerText = switches.relayTripped ? 'Alerta: Relé 50/51 Atuado (Trip)' : !m.energization.grid ? 'Usina Desconectada / Interrompida' : 'Alerta: Tracker 1 Travado';
      } else {
        badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs';
        badgeText.innerText = 'Operação Normal em Rede MT';
      }

      // Core KPIs
      document.getElementById('kpiInv1').innerText = (m.energization.dc1 ? m.inv1Ac : 0).toFixed(1);
      document.getElementById('lblInv1Dc').innerText = (m.energization.dc1 ? m.rawDc1 : 0).toFixed(1) + ' kW';
      document.getElementById('lblInv1Current').innerText = (m.energization.dc1 && m.inv1Ac > 0 ? (m.inv1Ac * 1000) / (Math.sqrt(3) * 380) : 0).toFixed(1) + ' A';

      document.getElementById('kpiInv2').innerText = (m.energization.dc2 ? m.inv2Ac : 0).toFixed(1);
      document.getElementById('lblInv2Dc').innerText = (m.energization.dc2 ? m.rawDc2 : 0).toFixed(1) + ' kW';
      document.getElementById('lblInv2Current').innerText = (m.energization.dc2 && m.inv2Ac > 0 ? (m.inv2Ac * 1000) / (Math.sqrt(3) * 380) : 0).toFixed(1) + ' A';

      document.getElementById('kpiMtPower').innerText = m.deliveredMtKw.toFixed(1);
      document.getElementById('lblMtKva').innerText = '(' + m.deliveredMtKva.toFixed(1) + ' kVA)';
      document.getElementById('lblMtCurrent').innerText = m.currentMtA.toFixed(2) + ' A';
      document.getElementById('lblTrafoLoss').innerText = m.trafoLoss.toFixed(2) + ' kW';

      document.getElementById('kpiLossKw').innerText = m.misalignmentLoss.toFixed(1);
      document.getElementById('kpiLossPct').innerText = '-' + m.misalignmentPct.toFixed(1) + '%';
      document.getElementById('lblIdealPower').innerText = m.idealDelivered.toFixed(1) + ' kW';

      // Chart selector chips
      const cInv1 = document.getElementById('chipInv1Val');
      const cInv2 = document.getElementById('chipInv2Val');
      const cTot = document.getElementById('chipTotalVal');
      const cRef = document.getElementById('chipRefVal');
      const cRefInv = document.getElementById('chipRefInvVal');
      const cPoa1 = document.getElementById('chipPoa1Val');
      const cPoa2 = document.getElementById('chipPoa2Val');
      const cGhi = document.getElementById('chipGhiVal');
      if (cInv1) cInv1.innerText = (m.energization.dc1 ? m.inv1Ac : 0).toFixed(1) + ' kW';
      if (cInv2) cInv2.innerText = (m.energization.dc2 ? m.inv2Ac : 0).toFixed(1) + ' kW';
      if (cTot) cTot.innerText = m.deliveredMtKw.toFixed(1) + ' kW';
      if (cRef) cRef.innerText = m.idealDelivered.toFixed(1) + ' kW';
      if (cRefInv) cRefInv.innerText = m.idealInvDelivered.toFixed(1) + ' kW';
      if (cPoa1) cPoa1.innerText = Math.round(m.t1Poa) + ' W/m²';
      if (cPoa2) cPoa2.innerText = Math.round(m.t2Poa) + ' W/m²';
      if (cGhi) cGhi.innerText = Math.round(m.solar.ghi) + ' W/m²';

      // Tracker 1 & 2 Panels
      document.getElementById('t1AngleTag').innerText = (m.t1Angle > 0 ? '+' : '') + m.t1Angle.toFixed(1) + '°';
      document.getElementById('t1VisualBar').style.transform = \`rotate(\${m.t1Angle}deg)\`;
      document.getElementById('lblT1Poa').innerText = Math.round(m.t1Poa);
      document.getElementById('lblT1Ideal').innerText = Math.round(m.idealAngle) + '°';
      const t1MechLoss = m.idealAngle !== 0 ? Math.abs(m.idealAngle - m.t1Angle) : 0;
      document.getElementById('lblT1Loss').innerText = ((t1MechLoss / 60) * 100).toFixed(1) + '%';

      document.getElementById('t2AngleTag').innerText = (m.t2Angle > 0 ? '+' : '') + m.t2Angle.toFixed(1) + '°';
      document.getElementById('t2VisualBar').style.transform = \`rotate(\${m.t2Angle}deg)\`;
      document.getElementById('lblT2Poa').innerText = Math.round(m.t2Poa);

      // SLD Elements & Colors
      renderSldElements(m);
    }

    function renderSldElements(m) {
      // Helper for switch button styling
      function setSwitchBtn(id, isClosed, labelClosed, labelOpen) {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (isClosed) {
          btn.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs';
          btn.innerText = labelClosed || 'NF (FECHADA)';
        } else {
          btn.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs';
          btn.innerText = labelOpen || 'NA (ABERTA)';
        }
      }

      function setBoxState(boxId, statusLabelId, isEnergized, energizedText, deenergizedText) {
        const box = document.getElementById(boxId);
        const label = document.getElementById(statusLabelId);
        if (!box) return;
        if (isEnergized) {
          box.className = 'p-3 rounded-xl border bg-rose-50/80 border-rose-300 ring-1 ring-rose-200 shadow-xs transition-all';
          if (label) {
            label.className = 'mt-1 text-right text-[9px] text-rose-700 font-bold';
            label.innerText = energizedText || '● ENERGIZADO';
          }
        } else {
          box.className = 'p-3 rounded-xl border bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200 shadow-xs transition-all';
          if (label) {
            label.className = 'mt-1 text-right text-[9px] text-emerald-700 font-bold';
            label.innerText = deenergizedText || '○ DESENERGIZADO / SEGURO';
          }
        }
      }

      setSwitchBtn('btnDc1', switches.dc1, 'NF (FECHADA)', 'NA (ABERTA)');
      setSwitchBtn('btnDc2', switches.dc2, 'NF (FECHADA)', 'NA (ABERTA)');
      setSwitchBtn('btnQgbt1', switches.qgbt1, 'NF (FECHADO)', 'NA (ABERTO)');
      setSwitchBtn('btnQgbt2', switches.qgbt2, 'NF (FECHADO)', 'NA (ABERTO)');
      setSwitchBtn('btnTrafoBt', switches.trafoBt, 'NF (FECHADA)', 'NA (ABERTA)');
      setSwitchBtn('btnCabineSec', switches.cabineSec, 'NF (FECHADA)', 'NA (ABERTA)');
      setSwitchBtn('btnBreakerMT', switches.breakerMT && !switches.relayTripped, 'NF (FECHADO)', 'NA (ABERTO)');
      setSwitchBtn('btnUtilSec', switches.utilSec, 'NF (FECHADA)', 'NA (ABERTA)');
      setSwitchBtn('btnRecloser', switches.recloser, 'NF (LIGADO)', 'NA (DESLIGADO)');

      setBoxState('sldBoxDc1', 'lblStatusDc1', m.energization.dc1);
      setBoxState('sldBoxDc2', 'lblStatusDc2', m.energization.dc2);
      setBoxState('sldBoxInv1', 'lblStatusQgbt1', m.energization.qgbt1, '● ALIMENTANDO BARRAMENTO', '○ ISOLADO / DESENERGIZADO');
      setBoxState('sldBoxInv2', 'lblStatusQgbt2', m.energization.qgbt2, '● ALIMENTANDO BARRAMENTO', '○ ISOLADO / DESENERGIZADO');
      setBoxState('sldBoxTrafo', 'lblStatusTrafo', m.energization.trafo, '● PRIMÁRIO & SECUNDÁRIO VIVOS', '○ TRAFO DESENERGIZADO');
      setBoxState('sldBoxCabine', 'lblStatusCabine', m.energization.cabine, '● CONDUTORES MT ENERGIZADOS', '○ SECCIONAMENTO SEGURO');
      setBoxState('sldBoxGrid', 'lblStatusGrid', m.energization.grid, '● INJETANDO NA REDE', '○ REDE ISOLADA (0.0 kW)');

      // Relay Label
      const relayLbl = document.getElementById('sldRelayStatus');
      if (relayLbl) {
        if (switches.relayTripped) {
          relayLbl.className = 'text-[10px] font-bold text-rose-600 animate-pulse';
          relayLbl.innerText = 'TRIP ATUADO (ANSI 50/51)';
        } else {
          relayLbl.className = 'text-[10px] font-bold text-emerald-700';
          relayLbl.innerText = 'NORMAL (ARMADO)';
        }
      }

      // SLD values
      document.getElementById('sldPcc1').innerText = (m.energization.dc1 ? m.rawDc1 : 0).toFixed(1) + ' kW';
      document.getElementById('sldPcc2').innerText = (m.energization.dc2 ? m.rawDc2 : 0).toFixed(1) + ' kW';
      document.getElementById('sldPca1').innerText = (m.energization.qgbt1 ? m.inv1Ac : 0).toFixed(1) + ' kW';
      document.getElementById('sldPca2').innerText = (m.energization.qgbt2 ? m.inv2Ac : 0).toFixed(1) + ' kW';
      const btTotal = (m.energization.qgbt1 ? m.inv1Ac : 0) + (m.energization.qgbt2 ? m.inv2Ac : 0);
      document.getElementById('sldTrafoIn').innerText = btTotal.toFixed(1) + ' kW';
      document.getElementById('sldTrafoOut').innerText = (m.energization.trafo ? Math.max(0, btTotal - m.trafoLoss) : 0).toFixed(1) + ' kW';
      document.getElementById('sldMeterPower').innerText = m.deliveredMtKw.toFixed(1) + ' kW';

      const gridTag = document.getElementById('sldTagGrid');
      if (gridTag) {
        if (m.energization.grid) {
          gridTag.className = 'p-3 rounded-xl border text-center font-bold bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-200 shadow-xs';
          gridTag.innerText = 'REDE CONCESSIONÁRIA ENERGIZADA';
        } else {
          gridTag.className = 'p-3 rounded-xl border text-center font-bold bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-200 shadow-xs';
          gridTag.innerText = 'REDE DESCONECTADA DA USINA';
        }
      }
    }

    function updateCurveButtonStyles() {
      const bInv1 = document.getElementById('btnTglInv1');
      const bInv2 = document.getElementById('btnTglInv2');
      const bTot = document.getElementById('btnTglTotalMt');
      const bRef = document.getElementById('btnTglRefTotal');
      const bRefInv = document.getElementById('btnTglRefInv');
      const bPoa1 = document.getElementById('btnTglPoa1');
      const bPoa2 = document.getElementById('btnTglPoa2');
      const bGhi = document.getElementById('btnTglGhi');

      if (bInv1) bInv1.className = selectedCurves.inv1 ? 'px-2 py-1 rounded border bg-amber-500/10 border-amber-500 text-amber-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bInv2) bInv2.className = selectedCurves.inv2 ? 'px-2 py-1 rounded border bg-sky-500/10 border-sky-500 text-sky-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bTot) bTot.className = selectedCurves.totalMt ? 'px-2 py-1 rounded border bg-emerald-500/10 border-emerald-500 text-emerald-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bRef) bRef.className = selectedCurves.refTotal ? 'px-2 py-1 rounded border bg-slate-200 border-slate-500 text-slate-900 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bRefInv) bRefInv.className = selectedCurves.refInv ? 'px-2 py-1 rounded border bg-purple-500/10 border-purple-500 text-purple-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bPoa1) bPoa1.className = selectedCurves.poa1 ? (tracker1Stuck ? 'px-2 py-1 rounded border bg-rose-500/10 border-rose-500 text-rose-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-amber-600/10 border-amber-600 text-amber-950 flex items-center justify-between font-bold') : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bPoa2) bPoa2.className = selectedCurves.poa2 ? 'px-2 py-1 rounded border bg-sky-600/10 border-sky-600 text-sky-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';
      if (bGhi) bGhi.className = selectedCurves.ghi ? 'px-2 py-1 rounded border bg-amber-400/15 border-amber-500 text-amber-950 flex items-center justify-between font-bold' : 'px-2 py-1 rounded border bg-white border-slate-200 text-slate-400 flex items-center justify-between';

      const info = document.getElementById('chartAxisModeInfo');
      const hasPower = selectedCurves.inv1 || selectedCurves.inv2 || selectedCurves.totalMt || selectedCurves.refTotal || selectedCurves.refInv;
      const hasIrradiance = selectedCurves.poa1 || selectedCurves.poa2 || selectedCurves.ghi;
      if (info) {
        if (hasPower && hasIrradiance) info.innerText = '⚡ Eixo Duplo: Potência (kW) e Irradiância (W/m²)';
        else if (hasPower) info.innerText = '⚡ Eixo Único: Potência MT (kW)';
        else info.innerText = '☀️ Eixo Único: Irradiância (W/m²)';
      }
    }

    function toggleStandaloneCurve(key) {
      selectedCurves[key] = !selectedCurves[key];
      updateCurveButtonStyles();
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      initChart();
    }

    function applyChartPreset(preset) {
      if (preset === 'all') {
        selectedCurves = { inv1: true, inv2: true, totalMt: true, refTotal: true, refInv: true, poa1: true, poa2: true, ghi: true };
      } else if (preset === 'inverters') {
        selectedCurves = { inv1: true, inv2: true, totalMt: false, refTotal: false, refInv: true, poa1: false, poa2: false, ghi: false };
      } else if (preset === 'plant') {
        selectedCurves = { inv1: false, inv2: false, totalMt: true, refTotal: true, refInv: false, poa1: false, poa2: false, ghi: false };
      } else if (preset === 'irradiance') {
        selectedCurves = { inv1: false, inv2: false, totalMt: false, refTotal: false, refInv: false, poa1: true, poa2: true, ghi: true };
      }
      updateCurveButtonStyles();
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      initChart();
    }

    // Chart.js initialization & update
    function initChart() {
      const ctx = document.getElementById('dailyChartCanvas').getContext('2d');
      const hoursList = [];
      for (let h = 6; h <= 18; h += 0.25) {
        const hh = Math.floor(h);
        const mm = Math.floor((h - hh) * 60);
        hoursList.push({ hour: h, label: \`\${String(hh).padStart(2, '0')}:\${String(mm).padStart(2, '0')}\` });
      }

      const labels = hoursList.map(item => item.label);
      const hasPower = selectedCurves.inv1 || selectedCurves.inv2 || selectedCurves.totalMt || selectedCurves.refTotal || selectedCurves.refInv;
      const hasIrradiance = selectedCurves.poa1 || selectedCurves.poa2 || selectedCurves.ghi;

      let datasets = [];

      if (selectedCurves.totalMt) {
        datasets.push({
          label: 'Total MT (Real)',
          data: hoursList.map(item => computeMetrics(item.hour).deliveredMtKw),
          yAxisID: hasPower ? 'y' : 'y',
          borderColor: tracker1Stuck ? '#e11d48' : '#059669',
          backgroundColor: tracker1Stuck ? 'rgba(225, 29, 72, 0.08)' : 'rgba(5, 150, 105, 0.10)',
          borderWidth: 3,
          tension: 0.35,
          fill: !hasIrradiance,
          pointRadius: 0,
        });
      }

      if (selectedCurves.inv1) {
        datasets.push({
          label: tracker1Stuck ? 'Inversor 1 (Tracker 1 Travado)' : 'Inversor 1 (Strings 01-05)',
          data: hoursList.map(item => computeMetrics(item.hour).inv1Ac),
          yAxisID: hasPower ? 'y' : 'y',
          borderColor: tracker1Stuck ? '#e11d48' : '#d97706',
          borderWidth: 2.2,
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.inv2) {
        datasets.push({
          label: 'Inversor 2 (Strings 06-10 Tracker 2)',
          data: hoursList.map(item => computeMetrics(item.hour).inv2Ac),
          yAxisID: hasPower ? 'y' : 'y',
          borderColor: '#0284c7',
          borderWidth: 2.2,
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.refTotal) {
        datasets.push({
          label: 'Ref. Usina Ideal (100% Tracking)',
          data: hoursList.map(item => computeMetrics(item.hour).idealDelivered),
          yAxisID: hasPower ? 'y' : 'y',
          borderColor: '#64748b',
          borderWidth: 2,
          borderDash: [5, 4],
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.refInv) {
        datasets.push({
          label: 'Ref. Individual Inversor (25kW)',
          data: hoursList.map(item => computeMetrics(item.hour).idealInvDelivered),
          yAxisID: hasPower ? 'y' : 'y',
          borderColor: '#8b5cf6',
          borderWidth: 1.8,
          borderDash: [4, 4],
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.poa2) {
        datasets.push({
          label: 'POA Tracker 2 (Módulos 2 W/m²)',
          data: hoursList.map(item => computeMetrics(item.hour).t2Poa),
          yAxisID: hasPower ? 'y1' : 'y',
          borderColor: '#0284c7',
          borderWidth: 2.2,
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.poa1) {
        datasets.push({
          label: tracker1Stuck ? 'POA Tracker 1 (Travado W/m²)' : 'POA Tracker 1 (Módulos 1 W/m²)',
          data: hoursList.map(item => computeMetrics(item.hour).t1Poa),
          yAxisID: hasPower ? 'y1' : 'y',
          borderColor: tracker1Stuck ? '#e11d48' : '#b45309',
          borderWidth: 2.2,
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        });
      }

      if (selectedCurves.ghi) {
        datasets.push({
          label: 'GHI (Solo Horizontal W/m²)',
          data: hoursList.map(item => computeMetrics(item.hour).solar.ghi),
          yAxisID: hasPower ? 'y1' : 'y',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.35,
          fill: !hasPower,
          pointRadius: 0,
        });
      }

      const scalesConfig = {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: { color: '#64748b', font: { family: 'monospace', size: 10 }, maxRotation: 0, callback: (v, i) => i % 4 === 0 ? labels[i] : '' }
        }
      };

      if (hasPower && hasIrradiance) {
        scalesConfig.y = {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Potência MT (kW)', color: '#059669', font: { family: 'monospace', size: 11, weight: 'bold' } },
          grid: { color: '#f1f5f9' },
          ticks: { color: '#059669', font: { family: 'monospace', size: 10 } },
          min: 0,
          max: 60
        };
        scalesConfig.y1 = {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Irradiância (W/m²)', color: '#d97706', font: { family: 'monospace', size: 11, weight: 'bold' } },
          grid: { drawOnChartArea: false },
          ticks: { color: '#d97706', font: { family: 'monospace', size: 10 } },
          min: 0,
          max: 1100
        };
      } else if (hasPower) {
        scalesConfig.y = {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Potência MT (kW)', color: '#475569', font: { family: 'monospace', size: 11, weight: 'bold' } },
          grid: { color: '#f1f5f9' },
          ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } },
          min: 0,
          max: 60
        };
      } else {
        scalesConfig.y = {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Irradiância Solar (W/m²)', color: '#d97706', font: { family: 'monospace', size: 11, weight: 'bold' } },
          grid: { color: '#f1f5f9' },
          ticks: { color: '#d97706', font: { family: 'monospace', size: 10 } },
          min: 0,
          max: 1100
        };
      }

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: scalesConfig,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { color: '#334155', font: { family: 'monospace', size: 10 }, usePointStyle: true, boxWidth: 8 }
            }
          }
        }
      });
    }

    function refreshChart() {
      if (!chartInstance) {
        initChart();
        return;
      }
      chartInstance.destroy();
      chartInstance = null;
      initChart();
    }

    // Switch Operations
    function toggleDc1() { switches.dc1 = !switches.dc1; updateUI(); refreshChart(); }
    function toggleDc2() { switches.dc2 = !switches.dc2; updateUI(); refreshChart(); }
    function toggleQgbt1() { switches.qgbt1 = !switches.qgbt1; updateUI(); refreshChart(); }
    function toggleQgbt2() { switches.qgbt2 = !switches.qgbt2; updateUI(); refreshChart(); }
    function toggleTrafoBt() { switches.trafoBt = !switches.trafoBt; updateUI(); refreshChart(); }
    function toggleCabineSec() { switches.cabineSec = !switches.cabineSec; updateUI(); refreshChart(); }
    function toggleBreakerMT() { switches.breakerMT = !switches.breakerMT; updateUI(); refreshChart(); }
    function toggleUtilSec() { switches.utilSec = !switches.utilSec; updateUI(); refreshChart(); }
    function toggleRecloser() { switches.recloser = !switches.recloser; updateUI(); refreshChart(); }

    function toggleRelayTrip() {
      switches.relayTripped = !switches.relayTripped;
      if (switches.relayTripped) switches.breakerMT = false;
      else switches.breakerMT = true;
      updateUI();
      refreshChart();
    }

    function energizeAll() {
      switches = { dc1: true, dc2: true, qgbt1: true, qgbt2: true, trafoBt: true, cabineSec: true, breakerMT: true, relayTripped: false, utilSec: true, recloser: true };
      updateUI();
      refreshChart();
    }

    function deenergizeAll() {
      switches = { dc1: false, dc2: false, qgbt1: false, qgbt2: false, trafoBt: false, cabineSec: false, breakerMT: false, relayTripped: false, utilSec: false, recloser: false };
      updateUI();
      refreshChart();
    }

    // Tab Switching
    function switchTab(tab) {
      activeTab = tab;
      const tabDash = document.getElementById('tabContentDashboard');
      const tabUnifilar = document.getElementById('tabContentUnifilar');
      const btnDash = document.getElementById('tabBtnDashboard');
      const btnUnifilar = document.getElementById('tabBtnUnifilar');

      if (tab === 'dashboard') {
        tabDash.classList.remove('hidden');
        tabUnifilar.classList.add('hidden');
        btnDash.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-md';
        btnUnifilar.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60';
      } else {
        tabDash.classList.add('hidden');
        tabUnifilar.classList.remove('hidden');
        btnUnifilar.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-md';
        btnDash.className = 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60';
      }
    }

    // Tracker 1 Failure
    function toggleTracker1Failure() {
      tracker1Stuck = !tracker1Stuck;
      const btn = document.getElementById('btnToggleFailure');
      const card = document.getElementById('tracker1Card');
      const badge = document.getElementById('t1Badge');
      if (tracker1Stuck) {
        btn.className = 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center justify-center gap-1.5 animate-pulse';
        btn.innerText = '✕ Desativar Falha (Restaurar Rastreamento Automático)';
        card.className = 'p-4 rounded-xl border bg-amber-950/20 border-amber-500/50 transition-all';
        badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30';
        badge.innerText = 'TRAVADO (' + tracker1StuckAngle + '°)';
      } else {
        btn.className = 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition flex items-center justify-center gap-1.5';
        btn.innerText = '⚠ Simular Falha no Tracker 1 (Travar Ângulo)';
        card.className = 'p-4 rounded-xl border bg-slate-950/60 border-slate-800 transition-all';
        badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30';
        badge.innerText = 'RASTREANDO';
      }
      updateUI();
      refreshChart();
    }

    function changeStuckAngle(val) {
      tracker1StuckAngle = parseFloat(val);
      document.getElementById('lblStuckAngle').innerText = (tracker1StuckAngle > 0 ? '+' : '') + tracker1StuckAngle + '°';
      if (tracker1Stuck) {
        document.getElementById('t1Badge').innerText = 'TRAVADO (' + tracker1StuckAngle + '°)';
        updateUI();
        refreshChart();
      }
    }

    // Time & Playback Controls
    const timeSlider = document.getElementById('timeSlider');
    timeSlider.addEventListener('input', (e) => {
      currentTime = parseFloat(e.target.value);
      updateUI();
    });

    function setTime(h) {
      currentTime = h;
      updateUI();
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      const playIcon = document.getElementById('playIcon');
      const playText = document.getElementById('playText');
      if (isPlaying) {
        playIcon.innerText = '⏸';
        playText.innerText = 'Pausar';
        animInterval = setInterval(() => {
          currentTime += 0.05 * playSpeed;
          if (currentTime > 18) currentTime = 6;
          updateUI();
        }, 100);
      } else {
        playIcon.innerText = '▶';
        playText.innerText = 'Animar Dia';
        if (animInterval) clearInterval(animInterval);
      }
    }

    function setSpeed(speed) {
      playSpeed = speed;
      ['btnSpeed1', 'btnSpeed2', 'btnSpeed4'].forEach(id => {
        document.getElementById(id).className = 'px-2 py-0.5 rounded text-slate-400';
      });
      document.getElementById('btnSpeed' + speed).className = 'px-2 py-0.5 rounded bg-slate-700 text-amber-300 font-bold';
    }

    function resetSimulation() {
      currentTime = 12.0;
      if (isPlaying) togglePlay();
      if (tracker1Stuck) toggleTracker1Failure();
      tracker1StuckAngle = -45;
      document.getElementById('stuckAngleSlider').value = -45;
      document.getElementById('lblStuckAngle').innerText = '-45°';
      energizeAll();
      switchTab('dashboard');
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
      updateUI();
      initChart();
    });
  </script>
</body>
</html>`;
}

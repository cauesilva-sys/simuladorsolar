import React from 'react';
import { X, BookOpen, Cpu, Shield, Zap, Layers, Activity } from 'lucide-react';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-4 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Memorial Descritivo & Arquitetura Técnica
              </h3>
              <p className="text-xs text-slate-500">
                Usina Solar Fotovoltaica Conectada em Média Tensão (55 kWp · 13.8 kV)
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

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Campo Fotovoltaico */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold uppercase text-xs tracking-wider">
              <Zap className="w-4 h-4" />
              <span>1. Campo Fotovoltaico (55 kWp)</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Potência Total:</span>
                <strong className="text-slate-900 text-sm">55.0 kWp</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Módulos:</span>
                <strong className="text-slate-900 text-sm">100 unidades</strong> (550W Half-Cell Mono)
              </div>
              <div>
                <span className="text-slate-500 block">Strings:</span>
                <strong className="text-slate-900 text-sm">10 Strings</strong> (10 módulos por string)
              </div>
              <div>
                <span className="text-slate-500 block">Tensão de String (Voc):</span>
                <strong className="text-slate-900 text-sm">~495 Vcc</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Sistema de Tracking */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold uppercase text-xs tracking-wider">
              <Layers className="w-4 h-4" />
              <span>2. Sistema de Rastreamento (Trackers 1 e 2 de Eixo Único)</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <p>
                A usina conta com dois rastreadores solares horizontais com eixo orientado no sentido <strong>Norte-Sul</strong> e inclinação Leste-Oeste:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2 font-mono">
                <li><strong className="text-amber-800">Tracker 1:</strong> Suporta as Strings 1 a 5 (50 módulos · 27.5 kWp). No simulador, é o tracker sujeito a testes de bloqueio de ângulo mecânico (falha).</li>
                <li><strong className="text-sky-800">Tracker 2:</strong> Suporta as Strings 6 a 10 (50 módulos · 27.5 kWp). Mantém rastreamento astronômico contínuo.</li>
                <li><strong className="text-slate-800">Faixa de Operação Angular:</strong> -60° (início da manhã, Leste) até +60° (final da tarde, Oeste).</li>
                <li><strong className="text-slate-800">Fórmula de Perda por Desalinhamento:</strong> {'P_POA = GHI_direta · cos(θ_sol - θ_tracker) + GHI_difusa'}.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Inversores & QGBTs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase text-xs tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>3. Inversores de String & Quadros Gerais de Baixa Tensão (QGBT)</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <p>
                A conversão CC/CA é realizada em topologia descentralizada por 2 inversores de string de 30 kW cada:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2 font-mono">
                <li><strong className="text-slate-900">Inversor 1:</strong> 30 kW nominal, configurado com 10 strings independentes (Strings 01 a 10), saída trifásica 380V / 60Hz. Rendimento de pico ~98.4%. Permite desligamento em campo com perda proporcional (10% por string).</li>
                <li><strong className="text-slate-900">Inversor 2:</strong> 30 kW nominal, configurado com 10 strings independentes (Strings 01 a 10), saída trifásica 380V / 60Hz. Permite desligamento em campo com perda proporcional (10% por string).</li>
                <li><strong className="text-slate-900">QGBT 1 e QGBT 2:</strong> Painéis de manobra com disjuntores termomagnéticos tripolar 63A, DPS Classe II (40 kA) e barramento de cobre dimensionado conforme NBR 5410.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Média Tensão & Proteção 50/51 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold uppercase text-xs tracking-wider">
              <Shield className="w-4 h-4" />
              <span>4. Subestação Elevadora, Cabine Primária & Proteção ANSI (50/51)</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <span className="text-amber-800 font-bold block mb-1">Transformador Elevador:</span>
                  <span className="text-slate-600">Potência: 75 kVA</span><br />
                  <span className="text-slate-600">Tensão: 380 V (BT) / 13.800 V (MT)</span><br />
                  <span className="text-slate-600">Ligação: Dyn11 (Delta / Estrela com Neutro)</span><br />
                  <span className="text-slate-600">Perdas nominais: ~1.5%</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <span className="text-rose-800 font-bold block mb-1">Proteção Cabine MT:</span>
                  <span className="text-slate-600">Disjuntor MT 52 a vácuo 630A / 16kA</span><br />
                  <span className="text-slate-600">Função ANSI 50: Sobrecorrente Instantânea</span><br />
                  <span className="text-slate-600">Função ANSI 51: Sobrecorrente Temporizada</span><br />
                  <span className="text-slate-600">Transformadores de Corrente (TC) 15/5A</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono shadow-xs">
                <span className="text-emerald-800 font-bold block mb-1">Conexão à Concessionária & Religador:</span>
                <p className="text-slate-600">
                  A cabine de medição abriga medidor eletrônico bidirecional homologado de 4 quadrantes para apuração de energia ativa injetada. O religador automático no ramal MT da concessionária atua na coordenação seletiva em caso de surtos ou faltas externas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Equações e Modelagem */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold uppercase text-xs tracking-wider">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>5. Modelagem Matemática do Simulador</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-700 space-y-1.5">
              <div><strong>Trajetória Solar:</strong> {'θ_sol(t) = (t - 12) × 15° (t ∈ [6.0, 18.0])'}</div>
              <div><strong>Irradiação Horizontal:</strong> {'GHI(t) = 1000 × [sin(π · (t - 6) / 12)]^1.25 [W/m²]'}</div>
              <div><strong>Corrente de Média Tensão:</strong> {'I_MT = P_MT / (√3 × 13800 × cos φ) [A]'}</div>
              <div><strong>Perda por Desalinhamento:</strong> {'P_perda = P_MT,ideal - P_MT,real [kW]'}</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-xs"
          >
            Fechar Memorial
          </button>
        </div>
      </div>
    </div>
  );
};

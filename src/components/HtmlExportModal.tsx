import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { generateStandaloneHtml } from '../utils/generateStandaloneHtml';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml();

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulador_usina_fotovoltaica_mt.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-800">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Exportar Código HTML Único (Standalone)
              </h3>
              <p className="text-xs text-slate-500">
                Arquivo 100% autônomo com Tailwind CDN, Chart.js CDN e JavaScript integrado
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
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-slate-700">
            <p className="font-bold text-amber-900 mb-1">
              Pronto para rodar em qualquer navegador:
            </p>
            <p className="text-slate-600">
              Este arquivo contém todos os componentes solicitados: 100 módulos 550W (55 kWp), 2 Trackers de 1 eixo com injeção de falha no Tracker 1, 2 inversores com QGBTs, Transformador 75 kVA, Cabine Primária com relé 50/51, medidor de faturamento e curva diária no Chart.js.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Arquivo Baixado (.html)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar simulador_usina_fotovoltaica_mt.html</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Code box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
              <span>Pré-visualização do Arquivo HTML Único:</span>
              <span className="font-bold">{htmlCode.length.toLocaleString()} caracteres</span>
            </div>
            <pre className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 max-h-60 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed select-all shadow-inner">
              {htmlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

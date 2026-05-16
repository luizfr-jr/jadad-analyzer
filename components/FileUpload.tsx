'use client';

import { useCallback, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
  loading: boolean;
  error: string | null;
}

export default function FileUpload({ onUpload, loading, error }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Por favor, envie apenas arquivos PDF.');
        return;
      }
      setFileName(file.name);
      onUpload(file);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <h2 className="text-lg font-bold text-green-900 mb-2">Como funciona</h2>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
            <span>Faça upload do PDF do artigo científico que deseja avaliar.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
            <span>O sistema aplica automaticamente os 5 critérios da <strong>Escala de Jadad</strong> ao texto do artigo.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
            <span>Revise os resultados e baixe o relatório completo em PDF com justificativas detalhadas.</span>
          </li>
        </ol>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer
          ${dragging ? 'border-green-500 bg-green-50 scale-[1.01]' : 'border-green-300 bg-white hover:border-green-500 hover:bg-green-50'}
          ${loading ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => document.getElementById('pdf-input')?.click()}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
          disabled={loading}
        />

        {loading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
            <div>
              <p className="text-green-800 font-semibold text-lg">Analisando artigo...</p>
              <p className="text-green-600 text-sm mt-1">
                {fileName && <span className="font-medium">{fileName}</span>}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                A IA está lendo o PDF e aplicando a Escala de Jadad. Aguarde alguns instantes.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-green-900 font-bold text-xl">Arraste o PDF aqui</p>
              <p className="text-gray-500 text-sm mt-1">ou clique para selecionar o arquivo</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Selecionar PDF
            </div>
            <p className="text-xs text-gray-400">Aceita apenas PDF • Tamanho máximo: 32 MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-red-800 text-sm">Erro na análise</p>
            <p className="text-red-600 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Jadad reference */}
      <div className="bg-green-900 rounded-2xl p-5 text-green-100">
        <h3 className="font-bold text-white mb-1 text-sm">Referência da Metodologia</h3>
        <p className="text-xs text-green-200 leading-relaxed">
          Jadad AR, Moore RA, Carroll D, Jenkinson C, Reynolds DJ, Gavaghan DJ, McQuay HJ.{' '}
          <em>Assessing the quality of reports of randomized clinical trials: is blinding necessary?</em>{' '}
          Control Clin Trials. 1996;17(1):1-12.
        </p>
      </div>
    </div>
  );
}

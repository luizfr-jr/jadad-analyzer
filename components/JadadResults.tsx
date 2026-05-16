'use client';

import { useState } from 'react';
import { JadadAnalysis, JadadItem } from '@/types/jadad';
import { generateJadadPDF } from '@/lib/pdf-report';

interface Props {
  analysis: JadadAnalysis;
  onReset: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  if (score > 0) return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      +{score}
    </span>
  );
  if (score < 0) return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
      </svg>
      {score}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
      0
    </span>
  );
}

function ItemCard({ item }: { item: JadadItem }) {
  const [open, setOpen] = useState(false);
  const domainColor: Record<string, string> = {
    'Randomização': 'bg-blue-50 border-blue-200',
    'Cegamento': 'bg-purple-50 border-purple-200',
    'Perdas e Retiradas': 'bg-amber-50 border-amber-200',
  };
  const bg = domainColor[item.domain] ?? 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-xl border ${bg} overflow-hidden transition-all`}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:brightness-95 transition-all"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-green-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {item.id}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">{item.domain}</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{item.question}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBadge score={item.score} />
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          <div className="bg-white rounded-lg border border-white/80 p-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Justificativa</p>
            <p className="text-sm text-gray-700 leading-relaxed">{item.justification}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JadadResults({ analysis, onReset }: Props) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleGeneratePDF = async () => {
    setGeneratingPdf(true);
    try {
      generateJadadPDF(analysis);
    } finally {
      setTimeout(() => setGeneratingPdf(false), 1500);
    }
  };

  const isHigh = analysis.quality === 'high';
  const domains = [
    { label: 'Randomização', items: analysis.items.filter((i) => i.domain === 'Randomização'), max: 2 },
    { label: 'Cegamento', items: analysis.items.filter((i) => i.domain === 'Cegamento'), max: 2 },
    { label: 'Perdas e Retiradas', items: analysis.items.filter((i) => i.domain === 'Perdas e Retiradas'), max: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Nova análise
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
        >
          {generatingPdf ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar Relatório PDF
            </>
          )}
        </button>
      </div>

      {/* Article info */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
        <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-2">Artigo Analisado</p>
        <h2 className="text-base font-bold text-gray-900 leading-snug mb-2">{analysis.articleTitle}</h2>
        <p className="text-sm text-gray-500 italic mb-1">{analysis.articleAuthors}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full font-medium">{analysis.articleJournal}</span>
          <span className="bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full font-medium">{analysis.articleYear}</span>
          {analysis.articleDOI && (
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-mono">DOI: {analysis.articleDOI}</span>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className={`rounded-2xl p-6 text-white ${isHigh ? 'bg-green-800' : 'bg-amber-700'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">Pontuação Total — Escala de Jadad</p>
            <p className="text-5xl font-black">
              {analysis.totalScore}
              <span className="text-2xl font-normal opacity-60">/5</span>
            </p>
            <p className="mt-2 font-semibold text-lg">{analysis.qualityLabel}</p>
          </div>
          <div className="text-right">
            {domains.map((d) => {
              const domScore = d.items.reduce((s, i) => s + i.score, 0);
              return (
                <div key={d.label} className="mb-2">
                  <p className="text-xs opacity-70">{d.label}</p>
                  <p className="font-bold">
                    {Math.max(0, domScore)}/{d.max}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-lg p-3">
          <p className="text-sm leading-relaxed opacity-90">{analysis.summary}</p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
        <h3 className="font-bold text-green-900 mb-4">Checklist Detalhado</h3>
        <div className="space-y-3">
          {analysis.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-green-900 rounded-2xl p-5 text-green-100">
        <p className="text-xs font-bold text-white mb-1">Referência da Metodologia</p>
        <p className="text-xs leading-relaxed">
          Jadad AR, Moore RA, Carroll D, Jenkinson C, Reynolds DJ, Gavaghan DJ, McQuay HJ.{' '}
          <em>Assessing the quality of reports of randomized clinical trials: is blinding necessary?</em>{' '}
          Control Clin Trials. 1996;17(1):1-12.
        </p>
      </div>
    </div>
  );
}

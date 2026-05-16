'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import JadadResults from '@/components/JadadResults';
import { JadadAnalysis } from '@/types/jadad';

export default function Home() {
  const [analysis, setAnalysis] = useState<JadadAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao analisar o arquivo.');
      }

      setAnalysis(data as JadadAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {!analysis ? (
          <FileUpload onUpload={handleUpload} loading={loading} error={error} />
        ) : (
          <JadadResults
            analysis={analysis}
            onReset={() => { setAnalysis(null); setError(null); }}
          />
        )}
      </main>
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-green-100">
        Analisador Jadad · Baseado em Jadad AR et al., Control Clin Trials, 1996
      </footer>
    </div>
  );
}

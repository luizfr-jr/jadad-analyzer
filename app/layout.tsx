import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analisador Jadad — Avaliação Metodológica de ECR',
  description:
    'Ferramenta online para avaliação da qualidade metodológica de ensaios clínicos randomizados utilizando a Escala de Jadad (Jadad et al., 1996).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
